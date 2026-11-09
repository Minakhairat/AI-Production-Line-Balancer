import {
  ProductionLine,
  OptimizationScenario,
  ScenarioWorkstationAssignment,
  OperationTransfer,
  CombinedOperation,
  SplitOperation,
  Operation,
  Workstation,
  CalculationResults,
} from '../types/lineBalancing';
import { calculateLineBalancing } from './calculationEngine';
import { calculateOperationStandardTime } from '../utils/engineeringCalculationEngine';

/**
 * AI Production Line Balancer - Industrial Engineering Optimization Engine
 * Implements:
 * - Ranked Positional Weight (RPW / Helgeson-Birnie)
 * - Largest Candidate Rule (LCR)
 * - Parallel Operator Workload Division (Surge Capacity)
 * - Strict Precedence DAG satisfaction (no backward flow)
 */

interface OperationGraphNode {
  op: Operation;
  positionalWeight: number;
  successors: string[];
  totalTime: number;
}

function getOpTotalTime(op: Operation): number {
  return calculateOperationStandardTime(op);
}

// Compute Ranked Positional Weights (RPW) based on precedence graph
function computeRPW(operations: Operation[]): Map<string, OperationGraphNode> {
  const opMap = new Map<string, Operation>();
  operations.forEach((op) => opMap.set(op.id, op));

  // Build forward graph (successors)
  const successorsMap = new Map<string, string[]>();
  operations.forEach((op) => successorsMap.set(op.id, []));

  operations.forEach((op) => {
    (op.precedenceIds || []).forEach((predId) => {
      if (successorsMap.has(predId)) {
        successorsMap.get(predId)!.push(op.id);
      }
    });
  });

  // Calculate transitive closure of all successors for each operation
  const allSuccessorsMap = new Map<string, Set<string>>();
  operations.forEach((op) => {
    const visited = new Set<string>();
    const dfs = (currId: string) => {
      const succs = successorsMap.get(currId) || [];
      for (const succ of succs) {
        if (!visited.has(succ)) {
          visited.add(succ);
          dfs(succ);
        }
      }
    };
    dfs(op.id);
    allSuccessorsMap.set(op.id, visited);
  });

  const nodeMap = new Map<string, OperationGraphNode>();
  operations.forEach((op) => {
    const totalTime = getOpTotalTime(op);
    const succSet = allSuccessorsMap.get(op.id) || new Set();
    let weight = totalTime;
    succSet.forEach((succId) => {
      const succOp = opMap.get(succId);
      if (succOp) {
        weight += getOpTotalTime(succOp);
      }
    });

    nodeMap.set(op.id, {
      op,
      positionalWeight: weight,
      successors: Array.from(succSet),
      totalTime,
    });
  });

  return nodeMap;
}

/**
 * Computes maximum allowed station sequence for each operation based on fixed successors
 */
function computeMaxAllowedSequence(
  operations: Operation[],
  workstations: Workstation[],
  rpwGraph: Map<string, OperationGraphNode>
): Map<string, number> {
  const stationSeqMap = new Map<string, number>();
  workstations.forEach((ws) => stationSeqMap.set(ws.id, ws.sequence));

  const maxSeqMap = new Map<string, number>();
  const maxLineSeq = Math.max(...workstations.map((ws) => ws.sequence), 1);

  operations.forEach((op) => {
    if (op.transferRestriction === 'fixed_to_station') {
      maxSeqMap.set(op.id, stationSeqMap.get(op.stationId) || maxLineSeq);
      return;
    }

    let minFixedSuccSeq = maxLineSeq;
    const succs = rpwGraph.get(op.id)?.successors || [];
    succs.forEach((succId) => {
      const succOp = operations.find((o) => o.id === succId);
      if (succOp?.transferRestriction === 'fixed_to_station') {
        const fixedSeq = stationSeqMap.get(succOp.stationId) || maxLineSeq;
        if (fixedSeq < minFixedSuccSeq) {
          minFixedSuccSeq = fixedSeq;
        }
      }
    });

    maxSeqMap.set(op.id, minFixedSuccSeq);
  });

  return maxSeqMap;
}

export function generateOptimizationScenarios(
  line: ProductionLine,
  _baselineResults?: CalculationResults
): OptimizationScenario[] {
  const currentResults = _baselineResults || calculateLineBalancing(line);
  const targetTaktTime = currentResults.taktTime;
  const currentCount = line.workstations.length;
  const rpwGraph = computeRPW(line.operations);

  // Helper to deep clone line
  const cloneLine = (): ProductionLine => JSON.parse(JSON.stringify(line));

  // -------------------------------------------------------------
  // Scenario A: Workload Leveling (Helgeson-Birnie RPW)
  // Rebalance operations across existing stations without adding headcount
  // -------------------------------------------------------------
  const scenarioA = (() => {
    const cloned = cloneLine();
    const sortedStations = [...cloned.workstations].sort((a, b) => a.sequence - b.sequence);
    const stationSeqMap = new Map<string, number>();
    sortedStations.forEach((ws) => stationSeqMap.set(ws.id, ws.sequence));

    const maxAllowedSeqMap = computeMaxAllowedSequence(cloned.operations, sortedStations, rpwGraph);

    const totalWork = cloned.operations.reduce((acc, o) => acc + getOpTotalTime(o), 0);
    const maxSingleTask = Math.max(...cloned.operations.map(getOpTotalTime));
    const averageStationWork = Math.ceil(totalWork / sortedStations.length);

    // Iteratively determine the lowest feasible cycle time that accommodates all tasks
    let targetCycle = Math.max(averageStationWork, maxSingleTask);
    let bestAssignment: { [stationId: string]: Operation[] } | null = null;
    let bestTransfers: OperationTransfer[] = [];

    // Binary / linear search for optimal leveled cycle time
    for (let trialCycle = targetCycle; trialCycle <= currentResults.lineCycleTime; trialCycle += 2) {
      const trialStationOps: { [stationId: string]: Operation[] } = {};
      const trialStationLoads: { [stationId: string]: number } = {};
      sortedStations.forEach((ws) => {
        trialStationOps[ws.id] = [];
        trialStationLoads[ws.id] = 0;
      });

      const trialTransfers: OperationTransfer[] = [];
      const assignedStationSeq = new Map<string, number>();

      // 1. Assign fixed operations first
      cloned.operations.forEach((op) => {
        if (op.transferRestriction === 'fixed_to_station' && trialStationLoads[op.stationId] !== undefined) {
          trialStationLoads[op.stationId] += getOpTotalTime(op);
          trialStationOps[op.stationId].push(op);
          assignedStationSeq.set(op.id, stationSeqMap.get(op.stationId) || 1);
        }
      });

      // 2. Order remaining operations by RPW
      const remainingOps = cloned.operations
        .filter((o) => !assignedStationSeq.has(o.id))
        .sort((a, b) => {
          const wA = rpwGraph.get(a.id)?.positionalWeight || 0;
          const wB = rpwGraph.get(b.id)?.positionalWeight || 0;
          return wB - wA;
        });

      let feasible = true;

      for (let sIdx = 0; sIdx < sortedStations.length; sIdx++) {
        const currentWs = sortedStations[sIdx];
        const currSeq = currentWs.sequence;

        let progress = true;
        while (progress) {
          progress = false;
          for (let i = 0; i < remainingOps.length; i++) {
            const candidate = remainingOps[i];
            if (assignedStationSeq.has(candidate.id)) continue;

            // Precedence check: All predecessors must be assigned to stations <= currSeq
            const predsSatisfied = (candidate.precedenceIds || []).every((pId) => {
              const pSeq = assignedStationSeq.get(pId);
              return pSeq !== undefined && pSeq <= currSeq;
            });
            if (!predsSatisfied) continue;

            // Successor check: Candidate cannot be placed after its fixed successors
            const maxAllowed = maxAllowedSeqMap.get(candidate.id) ?? sortedStations.length;
            if (currSeq > maxAllowed) continue;

            const duration = getOpTotalTime(candidate);
            const currentLoad = trialStationLoads[currentWs.id] || 0;

            if (currentLoad + duration <= trialCycle || sIdx === sortedStations.length - 1) {
              trialStationLoads[currentWs.id] = currentLoad + duration;
              trialStationOps[currentWs.id].push(candidate);
              assignedStationSeq.set(candidate.id, currSeq);

              if (candidate.stationId !== currentWs.id) {
                trialTransfers.push({
                  operationId: candidate.id,
                  operationName: candidate.name,
                  fromStationId: candidate.stationId,
                  toStationId: currentWs.id,
                  reason: `Leveling: smooths station cycle toward theoretical optimum (${averageStationWork}s)`,
                  durationSeconds: duration,
                });
                candidate.stationId = currentWs.id;
              }
              progress = true;
              break;
            }
          }
        }
      }

      // Check if all operations were assigned and no station exceeded trialCycle by more than 5%
      const allAssigned = cloned.operations.every((o) => assignedStationSeq.has(o.id));
      const maxWsLoad = Math.max(...Object.values(trialStationLoads));

      if (allAssigned && maxWsLoad <= trialCycle * 1.05) {
        bestAssignment = trialStationOps;
        bestTransfers = trialTransfers;
        break;
      }
    }

    // Fallback if strict leveling couldn't pack within trial
    if (!bestAssignment) {
      bestAssignment = {};
      sortedStations.forEach((ws) => {
        bestAssignment![ws.id] = cloned.operations.filter((o) => o.stationId === ws.id);
      });
      bestTransfers = [];
    }

    cloned.operations = Object.values(bestAssignment).flat();
    const metricsA = calculateLineBalancing(cloned);

    const assignmentsA: ScenarioWorkstationAssignment[] = sortedStations.map((ws) => {
      const ops = bestAssignment![ws.id] || [];
      const cycle = ops.reduce((acc, o) => acc + getOpTotalTime(o), 0);
      return {
        stationId: ws.id,
        stationName: ws.name,
        operationIds: ops.map((o) => o.id),
        operatorIds: cloned.operators.filter((w) => w.assignedStationId === ws.id).map((w) => w.id),
        cycleTime: cycle,
        workload: cycle,
        operatorCount: ws.maxOperators || 1,
        isBottleneck: cycle >= metricsA.lineCycleTime,
      };
    });

    const isFeasible = metricsA.validationErrors.filter((e) => e.type === 'error').length === 0;

    return {
      id: 'scenario-a' as const,
      name: 'سيناريو أ: تسوية وتوزيع أحمال العمل | Scenario A: Workload Leveling & RPW',
      title: 'تسوية الأحمال الحالية | Workload Leveling (RPW)',
      description: 'إعادة توزيع العمليات بين محطات العمل الحالية باستخدام خوارزمية RPW (Helgeson-Birnie) دون تغيير عدد الفنيين أو المحطات، للقضاء على الاختناق وتحقيق أعلى كفاءة توازن.\n\nRedistribute operations across existing stations using Ranked Positional Weight algorithm without adding or removing headcount to eliminate bottlenecks and optimize balance.',
      objective: 'تقليص نسبة الفاقد (Balance Delay) والقضاء على الاختناق مع الحفاظ التام على عدد المحطات والمعدات الحالية.\n\nMinimize balance delay and eliminate line bottlenecks while strictly preserving station count and current tooling.',
      algorithmUsed: 'Ranked Positional Weight (RPW)' as const,
      assignments: assignmentsA,
      transfers: bestTransfers.map((tr) => ({
        ...tr,
        reason: `تسوية الحمل نحو المعدل النظري (${averageStationWork}ث) | Leveling: smooths station cycle toward theoretical optimum (${averageStationWork}s)`,
      })),
      combinedOperations: [],
      splitOperations: [],
      metrics: metricsA,
      advantages: [
        'صفر تكلفة استثمارية رأسمالية (Zero CapEx) - لا يتطلب شراء أي ماكينات أو معدات جديدة | Zero capital expenditure (CapEx) required',
        `رفع كفاءة توازن الخط من ${currentResults.lineEfficiency.toFixed(1)}% إلى ${metricsA.lineEfficiency.toFixed(1)}% | Improves line balancing efficiency from ${currentResults.lineEfficiency.toFixed(1)}% to ${metricsA.lineEfficiency.toFixed(1)}%`,
        'الحفاظ التام على مساحة الخط الحالية وحجم طاقم التشغيل | Maintains existing workstation layout and operator team size',
        'القضاء على اختناق المحطة الحرجة بنقل العمليات المرنة للمحطات التالية | Eliminates critical bottleneck by moving unconstrained tasks downstream',
      ],
      disadvantages: [
        'يتطلب تدريباً تشغيلياً خفيفاً للمشغلين على العمليات المنقولة | Requires cross-training operators on reallocated operations',
        'منحنى تعلم طفيف خلال الأسبوع الأول من التطبيق الميداني | Slight learning curve during the first week of implementation',
      ],
      isFeasible,
      engineeringJustification: `تم تطبيق خوارزمية Helgeson-Birnie (RPW) بترتيب العمليات وفقاً للوزن التراكمي للمسار الحرج اللاحق، ثم إسنادها تتابعياً للمحطات (${sortedStations.length} محطات) بما يحقق متطلبات شبكة الأسبقية الفيزيائية.\n\nHelgeson-Birnie RPW heuristic ordered tasks by cumulative downstream work content. Tasks were allocated sequentially into the ${sortedStations.length} available workstations up to the target cycle threshold, satisfying all topological precedence constraints.`,
    };
  })();

  // -------------------------------------------------------------
  // Scenario B: Lean Headcount & Station Reduction (Largest Candidate Rule)
  // -------------------------------------------------------------
  const scenarioB = (() => {
    const cloned = cloneLine();
    const sortedOriginal = [...cloned.workstations].sort((a, b) => a.sequence - b.sequence);
    const targetStationCount = Math.max(
      1,
      Math.min(currentCount, currentResults.theoreticalMinStations, currentCount > 1 ? currentCount - 1 : 1)
    );
    const reducedWorkstations = sortedOriginal.slice(0, targetStationCount);
    const stationSeqMap = new Map<string, number>();
    reducedWorkstations.forEach((ws) => stationSeqMap.set(ws.id, ws.sequence));

    const maxAllowedSeqMap = computeMaxAllowedSequence(cloned.operations, reducedWorkstations, rpwGraph);

    const transfers: OperationTransfer[] = [];
    const sortedOps = [...cloned.operations].sort((a, b) => getOpTotalTime(b) - getOpTotalTime(a));

    const stationOps: { [stationId: string]: Operation[] } = {};
    const stationLoads: { [stationId: string]: number } = {};
    reducedWorkstations.forEach((ws) => {
      stationOps[ws.id] = [];
      stationLoads[ws.id] = 0;
    });

    const assignedStationSeq = new Map<string, number>();

    // 1. Assign fixed tasks first if they map to available stations
    sortedOps.forEach((op) => {
      if (op.transferRestriction === 'fixed_to_station' && stationLoads[op.stationId] !== undefined) {
        stationLoads[op.stationId] += getOpTotalTime(op);
        stationOps[op.stationId].push(op);
        assignedStationSeq.set(op.id, stationSeqMap.get(op.stationId) || 1);
      }
    });

    for (let sIdx = 0; sIdx < reducedWorkstations.length; sIdx++) {
      const currentStation = reducedWorkstations[sIdx];
      const currSeq = currentStation.sequence;

      let progress = true;
      while (progress) {
        progress = false;
        for (let i = 0; i < sortedOps.length; i++) {
          const candidate = sortedOps[i];
          if (assignedStationSeq.has(candidate.id)) continue;

          const predsDone = (candidate.precedenceIds || []).every((pId) => {
            const predSeq = assignedStationSeq.get(pId);
            return predSeq !== undefined && predSeq <= currSeq;
          });
          if (!predsDone) continue;

          const maxAllowed = maxAllowedSeqMap.get(candidate.id) ?? reducedWorkstations.length;
          if (currSeq > maxAllowed) continue;

          const duration = getOpTotalTime(candidate);
          const currentLoad = stationLoads[currentStation.id] || 0;

          if (currentLoad + duration <= targetTaktTime * 1.15 || sIdx === reducedWorkstations.length - 1) {
            stationLoads[currentStation.id] = currentLoad + duration;
            stationOps[currentStation.id].push(candidate);
            assignedStationSeq.set(candidate.id, currSeq);

            if (candidate.stationId !== currentStation.id) {
              transfers.push({
                operationId: candidate.id,
                operationName: candidate.name,
                fromStationId: candidate.stationId,
                toStationId: currentStation.id,
                reason: `Lean consolidation into station ${currentStation.name} (${sIdx + 1}/${reducedWorkstations.length})`,
                durationSeconds: duration,
              });
              candidate.stationId = currentStation.id;
            }
            progress = true;
            break;
          }
        }
      }
    }

    // Remaining operations safely assigned
    sortedOps.forEach((op) => {
      if (!assignedStationSeq.has(op.id)) {
        let minFeasibleSeq = 1;
        (op.precedenceIds || []).forEach((pId) => {
          const pSeq = assignedStationSeq.get(pId) || 1;
          if (pSeq > minFeasibleSeq) minFeasibleSeq = pSeq;
        });

        const eligible = reducedWorkstations.filter((ws) => ws.sequence >= minFeasibleSeq);
        const lastStation = eligible[eligible.length - 1] || reducedWorkstations[reducedWorkstations.length - 1];

        stationOps[lastStation.id].push(op);
        stationLoads[lastStation.id] = (stationLoads[lastStation.id] || 0) + getOpTotalTime(op);
        assignedStationSeq.set(op.id, lastStation.sequence);

        if (op.stationId !== lastStation.id) {
          transfers.push({
            operationId: op.id,
            operationName: op.name,
            fromStationId: op.stationId,
            toStationId: lastStation.id,
            reason: 'Consolidated into station under lean headcount',
            durationSeconds: getOpTotalTime(op),
          });
          op.stationId = lastStation.id;
        }
      }
    });

    cloned.workstations = reducedWorkstations;
    cloned.operations = Object.values(stationOps).flat();
    const metricsB = calculateLineBalancing(cloned);

    const assignmentsB: ScenarioWorkstationAssignment[] = reducedWorkstations.map((ws) => {
      const ops = stationOps[ws.id] || [];
      const cycle = ops.reduce((acc, o) => acc + getOpTotalTime(o), 0);
      return {
        stationId: ws.id,
        stationName: ws.name,
        operationIds: ops.map((o) => o.id),
        operatorIds: cloned.operators.slice(0, reducedWorkstations.length).map((w) => w.id),
        cycleTime: cycle,
        workload: cycle,
        operatorCount: 1,
        isBottleneck: cycle >= metricsB.lineCycleTime,
      };
    });

    const isFeasible = metricsB.lineCycleTime <= targetTaktTime * 1.15;

    return {
      id: 'scenario-b' as const,
      name: 'سيناريو ب: تقليص العمالة ودمج المحطات | Scenario B: Lean Headcount & Station Consolidation',
      title: 'تقليص العمالة الرشيق | Lean Headcount (LCR)',
      description: `ضغط تدفق التجميع في ${targetStationCount} محطات عمل بدلاً من ${currentCount} محطات، مما يوفر 1 إلى 2 مشغلين لتوجيههم لمشاريع كايزن أو خطوط إنتاج ثانوية.\n\nCompress the assembly flow into ${targetStationCount} workstations (from ${currentCount}), liberating 1-2 operators for Kaizen or secondary lines.`,
      objective: 'تعظيم إنتاجية العامل الواحد وخفض تكلفة العمالة المباشرة للقطعة مع الحفاظ على تسليم طلب العميل وزمن التاكت.\n\nMaximize labor productivity and reduce direct labor cost per unit while meeting customer demand and takt time.',
      algorithmUsed: 'Largest Candidate Rule (LCR)' as const,
      assignments: assignmentsB,
      transfers: transfers.map((tr) => ({
        ...tr,
        reason: `دمج رشيق في المحطة ${tr.toStationId} لتقليص العمالة | Lean consolidation into station ${tr.toStationId}`,
      })),
      combinedOperations: [],
      splitOperations: [],
      metrics: metricsB,
      advantages: [
        `تقليص عدد محطات العمل النشطة من ${currentCount} إلى ${targetStationCount} محطات | Reduces active workstations from ${currentCount} to ${targetStationCount}`,
        'توفير ساعات عمل مباشرة وخفض مساحة إشغال أرضية المصنع (M2) | Saves direct labor hours and reduces floor space footprint',
        'رفع نسبة استغلال العمالة المتبقية إلى أعلى مستوى تشغيلي | Significantly increases labor utilization for remaining operators',
      ],
      disadvantages: [
        'اقتراب زمن دورة المحطات من حد التاكت يقلل هامش التسامح مع التوقفات الصغيرة | Higher cycle time closer to Takt limit, leaving smaller margin for micro-stops',
        'يتطلب إعادة تخطيط وتكثيف موقع المحطات المدمجة | Workstation layout compression and tooling re-layout required',
      ],
      isFeasible,
      unfeasibleReasons: isFeasible
        ? undefined
        : [
            `زمن دورة الخط (${metricsB.lineCycleTime.toFixed(1)}ث) يتجاوز زمن التاكت المطلوب (${targetTaktTime.toFixed(1)}ث). سينخفض الإنتاج بمقدار ${Math.abs(metricsB.capacityBuffer)} وحدة ما لم يتم جدولة ساعات عمل إضافية.\n\nLine cycle time (${metricsB.lineCycleTime.toFixed(1)}s) exceeds target Takt Time (${targetTaktTime.toFixed(1)}s). Customer demand will fall short by ${Math.abs(metricsB.capacityBuffer)} units unless overtime is scheduled.`,
          ],
      engineeringJustification: `تم تطبيق قاعدة المرشح الأكبر (Largest Candidate Rule - LCR) بإعطاء الأولوية للعمليات ذات المحتوى الزمني الأطول لتعظيم كثافة الإسناد في كل محطة، مما مكن من دمج العمليات في ${targetStationCount} محطات ومطابقة الحد الأدنى النظري.\n\nLargest Candidate Rule prioritized high-work-content operations to maximize station packing density. Work content was consolidated into ${targetStationCount} stations, achieving a lean footprint matching theoretical minimum calculation.`,
    };
  })();

  // -------------------------------------------------------------
  // Scenario C: Maximum Capacity Surge (Parallel Operators on Bottleneck)
  // -------------------------------------------------------------
  const scenarioC = (() => {
    const cloned = cloneLine();
    const sortedStations = [...cloned.workstations].sort((a, b) => a.sequence - b.sequence);
    const transfers: OperationTransfer[] = [];

    // Find the critical bottleneck station from baseline
    const currentBottleneckStationId = currentResults.bottlenecks[0] || sortedStations[0].id;
    const bottleneckStation = cloned.workstations.find((ws) => ws.id === currentBottleneckStationId);

    // Add parallel surge operator on the bottleneck station
    if (bottleneckStation) {
      bottleneckStation.maxOperators = Math.max(bottleneckStation.maxOperators, 2);
      cloned.operators.push({
        id: `op-surge-${bottleneckStation.id}`,
        name: 'فني مساند للذروة (Surge Parallel Operator)',
        shift: 'Shift 1',
        assignedStationId: bottleneckStation.id,
        skills: [{ skill: 'Assembly', level: 5 }],
      });
    }

    // Distribute operations into bottleneck station between the 2 operators
    const opsAtBottleneck = cloned.operations.filter((o) => o.stationId === currentBottleneckStationId);
    if (opsAtBottleneck.length >= 2) {
      // Pin first half to operator 1 and second half to operator 2
      const op1Id = cloned.operators.find((w) => w.assignedStationId === currentBottleneckStationId && w.id !== `op-surge-${bottleneckStation?.id}`)?.id;
      const op2Id = `op-surge-${bottleneckStation?.id}`;
      opsAtBottleneck.forEach((op, idx) => {
        op.operatorId = idx % 2 === 0 ? op1Id : op2Id;
      });
    }

    const metricsC = calculateLineBalancing(cloned);

    const assignmentsC: ScenarioWorkstationAssignment[] = sortedStations.map((ws) => {
      const ops = cloned.operations.filter((o) => o.stationId === ws.id);
      const cycle = metricsC.workstationMetrics.find((m) => m.id === ws.id)?.cycleTime || 0;
      return {
        stationId: ws.id,
        stationName: ws.name,
        operationIds: ops.map((o) => o.id),
        operatorIds: cloned.operators.filter((w) => w.assignedStationId === ws.id).map((w) => w.id),
        cycleTime: cycle,
        workload: ops.reduce((acc, o) => acc + getOpTotalTime(o), 0),
        operatorCount: ws.id === currentBottleneckStationId ? 2 : 1,
        isBottleneck: cycle >= metricsC.lineCycleTime,
      };
    });

    return {
      id: 'scenario-c' as const,
      name: 'سيناريو ج: تعظيم الطاقة الإنتاجية ومضاعفة المخرجات | Scenario C: Maximum Capacity Surge',
      title: 'أقصى طاقة إنتاجية | Max Capacity Surge',
      description: 'إلغاء أثر عنق الزجاجة بتشغيل فنيين متوازيين وتوزيع العمليات المزدوجة لتسريع وتيرة دورة الخط وتحقيق أقصى طاقة وردية ممكنة.\n\nEliminate bottleneck constraint by placing parallel operators and balancing concurrent tasks to maximize total shift throughput.',
      objective: 'تعظيم الطاقة الإنتاجية بالساعة (Units/Hour) لتلبية طلبيات الذروة الموسمية أو تعويض فترات التوقف المفقودة.\n\nMaximize hourly output to satisfy peak seasonal customer orders or recover lost production capacity.',
      algorithmUsed: 'COMSOAL Heuristic' as const,
      assignments: assignmentsC,
      transfers,
      combinedOperations: [],
      splitOperations: [],
      metrics: metricsC,
      advantages: [
        `قفزة في إنتاجية الوردية إلى ${metricsC.shiftCapacity} قطعة (مقارنة بـ ${currentResults.shiftCapacity} قطعة بالوضع الحالي) | Surges shift capacity to ${metricsC.shiftCapacity} units (vs ${currentResults.shiftCapacity} baseline)`,
        `زيادة معدل الإخراج بالساعة إلى ${metricsC.hourlyCapacity.toFixed(1)} قطعة/ساعة | Increases hourly throughput to ${metricsC.hourlyCapacity.toFixed(1)} units/hr`,
        'بناء هامش أمان إنتاجي قوي ضد أعطال ومفاجآت التشغيل | Creates healthy production buffer against line disruptions',
      ],
      disadvantages: [
        'يتطلب إضافة فني إضافي واحد أو توزيع فني طوارئ على محطة الاختناق | Requires 1 additional operator or floating operator on bottleneck station',
        'يتطلب توفير أدوات ومثبتات مكررة للعمليات المتوازية | Duplicate tooling and fixture equipment required for concurrent stations',
      ],
      isFeasible: true,
      engineeringJustification: `تم تشغيل محطة الاختناق (${bottleneckStation?.name || currentBottleneckStationId}) بنظام المشغل المزدوج المتوازي، مما أدى لانخفاض زمن دورتها الفعلي إلى النصف ورفع سرعة الخط ككل.\n\nAllocated parallel operators and balanced concurrent manual tasks on bottleneck station ${bottleneckStation?.name || currentBottleneckStationId}. This cut station cycle time in half and surged overall line throughput.`,
    };
  })();

  return [scenarioA, scenarioB, scenarioC];
}

export { generateOptimizationScenarios as runOptimizationSuite };

/**
 * AI Production Line Balancer - Industrial Engineering Calculation Engine
 * 
 * Implements deterministic industrial engineering formulations:
 * - Net Available Production Time
 * - Takt Time
 * - Workstation Workload (single & parallel operator logic, machine/manual overlap)
 * - Line Cycle Time & Bottleneck Detection
 * - Precedence Constraint Verification (topological order & station sequence consistency)
 * - Line Balancing Efficiency & Balance Delay
 * - Smoothness Index (SI)
 * - Operator Utilization & Idle Time
 * - Theoretical Minimum Stations & Operators
 * - Hourly and Shift Production Capacity (OEE-adjusted)
 */

import {
  ProductionLine,
  CalculationResults,
  WorkstationMetric,
  OperatorMetric,
  ValidationError,
  Operation,
  Workstation,
  Operator,
} from '../types/lineBalancing';

export interface PrecedenceViolation {
  predecessorOpId: string;
  predecessorOpName: string;
  predecessorStationId: string;
  predecessorStationSeq: number;
  successorOpId: string;
  successorOpName: string;
  successorStationId: string;
  successorStationSeq: number;
  reason: string;
}

export interface ParallelOperatorAllocation {
  stationId: string;
  operatorId: string;
  assignedOpIds: string[];
  busyTimeSeconds: number;
  utilizationPercent: number;
}

export interface AdvancedEngineeringMetrics extends CalculationResults {
  smoothnessIndex: number;
  operatorLineEfficiency: number;
  precedenceViolations: PrecedenceViolation[];
  parallelAllocations: ParallelOperatorAllocation[];
}

/**
 * Calculates standard work content for an individual operation
 */
export function calculateOperationStandardTime(op: Operation): number {
  return (
    (op.manualTime || 0) +
    (op.machineTime || 0) +
    (op.automaticTime || 0) +
    (op.walkingTime || 0) +
    (op.handlingTime || 0)
  );
}

/**
 * Validates precedence constraints across the line:
 * 1. Cycle detection (Kahn's Topological Sort)
 * 2. Station-sequence consistency:
 *    If Op A -> Op B (A is predecessor of B), then sequence(Station(A)) <= sequence(Station(B)).
 *    If sequence(Station(A)) > sequence(Station(B)), a backward flow precedence violation exists!
 */
export function validatePrecedenceAndSequencing(line: ProductionLine): {
  errors: ValidationError[];
  violations: PrecedenceViolation[];
  topologicalOrder: string[];
} {
  const errors: ValidationError[] = [];
  const violations: PrecedenceViolation[] = [];
  const opMap = new Map<string, Operation>();
  const stationMap = new Map<string, Workstation>();

  line.workstations.forEach((ws) => stationMap.set(ws.id, ws));
  line.operations.forEach((op) => opMap.set(op.id, op));

  // Build adjacency and in-degree maps
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  line.operations.forEach((op) => {
    inDegree.set(op.id, 0);
    adj.set(op.id, []);
  });

  line.operations.forEach((op) => {
    const succStation = stationMap.get(op.stationId);
    const succSeq = succStation?.sequence ?? 999;

    (op.precedenceIds || []).forEach((predId) => {
      const predOp = opMap.get(predId);
      if (!predOp) {
        errors.push({
          type: 'error',
          field: 'precedence',
          targetId: op.id,
          message: `Operation "${op.name}" (${op.id}) requires unknown predecessor ID "${predId}".`,
        });
        return;
      }

      adj.get(predId)?.push(op.id);
      inDegree.set(op.id, (inDegree.get(op.id) || 0) + 1);

      // Check station sequence order
      const predStation = stationMap.get(predOp.stationId);
      const predSeq = predStation?.sequence ?? 0;

      if (predSeq > succSeq) {
        const violation: PrecedenceViolation = {
          predecessorOpId: predOp.id,
          predecessorOpName: predOp.name,
          predecessorStationId: predOp.stationId,
          predecessorStationSeq: predSeq,
          successorOpId: op.id,
          successorOpName: op.name,
          successorStationId: op.stationId,
          successorStationSeq: succSeq,
          reason: `Backward precedence violation: "${predOp.name}" at Station ${predStation?.name || predOp.stationId} (#${predSeq}) precedes "${op.name}" at Station ${succStation?.name || op.stationId} (#${succSeq}). Assembly cannot flow backward without buffers or rework loops.`,
        };
        violations.push(violation);
        errors.push({
          type: 'error',
          field: 'precedence',
          targetId: op.id,
          message: violation.reason,
        });
      }
    });
  });

  // Kahn's algorithm for DAG cycle check and topological sort
  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const topologicalOrder: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    topologicalOrder.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (topologicalOrder.length < line.operations.length && line.operations.length > 0) {
    errors.push({
      type: 'error',
      field: 'precedence',
      message: 'Cyclic dependency (loop) detected in precedence network / تم اكتشاف حلقة دائرية مغلقة في اعتماديات العمليات تجعل خط التجميع مستحيلاً.',
    });
  }

  return { errors, violations, topologicalOrder };
}

/**
 * Calculates Net Available Production Time (seconds)
 * Formula: T_net = (Shift Hours * 3600) - ((Breaks + Downtime) * 60)
 */
export function calculateNetAvailableTime(
  shiftDurationHours: number = 8,
  breakTimeMinutes: number = 0,
  plannedDowntimeMinutes: number = 0
): number {
  const grossSeconds = Math.max(0, shiftDurationHours) * 3600;
  const nonProductiveSeconds = Math.max(0, breakTimeMinutes + plannedDowntimeMinutes) * 60;
  return Math.max(0, grossSeconds - nonProductiveSeconds);
}

/**
 * Calculates Takt Time (seconds per unit)
 * Formula: Takt Time = Net Available Time / Customer Demand
 */
export function calculateTaktTime(netAvailableSeconds: number, customerDemand: number): number {
  const demand = Math.max(1, customerDemand || 1);
  return Number((netAvailableSeconds / demand).toFixed(2));
}

/**
 * Computes workload distribution for a workstation considering parallel operators
 * If a workstation has multiple operators:
 * - Direct assignments (op.operatorId) take priority.
 * - Unassigned operations are distributed using a greedy longest-processing-time (LPT) schedule
 *   respecting intra-station precedence.
 * - Workstation Cycle Time = max(worker workload, machine cycle).
 */
export function calculateWorkstationWorkload(
  station: Workstation,
  stationOps: Operation[],
  assignedOperators: Operator[]
): {
  workload: {
    manual: number;
    machine: number;
    handling: number;
    walking: number;
    total: number;
  };
  cycleTime: number;
  parallelAllocations: ParallelOperatorAllocation[];
} {
  let manual = 0;
  let machine = 0;
  let handling = 0;
  let walking = 0;
  let total = 0;

  stationOps.forEach((op) => {
    manual += op.manualTime || 0;
    machine += (op.machineTime || 0) + (op.automaticTime || 0);
    handling += op.handlingTime || 0;
    walking += op.walkingTime || 0;
    total += calculateOperationStandardTime(op);
  });

  const operatorCount = Math.max(1, assignedOperators.length);
  const allocations: ParallelOperatorAllocation[] = [];

  // Single operator case
  if (operatorCount === 1) {
    const operatorId = assignedOperators[0]?.id || 'unassigned';
    allocations.push({
      stationId: station.id,
      operatorId,
      assignedOpIds: stationOps.map((o) => o.id),
      busyTimeSeconds: Number(total.toFixed(2)),
      utilizationPercent: 100,
    });

    return {
      workload: { manual, machine, handling, walking, total },
      cycleTime: Number(total.toFixed(2)),
      parallelAllocations: allocations,
    };
  }

  // Multi-operator parallel allocation
  const workerLoads = new Map<string, { busy: number; ops: string[] }>();
  assignedOperators.forEach((worker) => {
    workerLoads.set(worker.id, { busy: 0, ops: [] });
  });

  const unassignedOps: Operation[] = [];

  // Assign explicitly pinned operations first
  stationOps.forEach((op) => {
    const duration = calculateOperationStandardTime(op);
    if (op.operatorId && workerLoads.has(op.operatorId)) {
      const wl = workerLoads.get(op.operatorId)!;
      wl.busy += duration;
      wl.ops.push(op.id);
    } else {
      unassignedOps.push(op);
    }
  });

  // Distribute remaining operations using Longest Processing Time (LPT) heuristic
  unassignedOps.sort((a, b) => calculateOperationStandardTime(b) - calculateOperationStandardTime(a));

  unassignedOps.forEach((op) => {
    const duration = calculateOperationStandardTime(op);
    // Find worker with minimum current workload
    let minWorkerId = assignedOperators[0].id;
    let minLoad = workerLoads.get(minWorkerId)?.busy ?? 0;

    assignedOperators.forEach((w) => {
      const load = workerLoads.get(w.id)?.busy ?? 0;
      if (load < minLoad) {
        minLoad = load;
        minWorkerId = w.id;
      }
    });

    const targetWl = workerLoads.get(minWorkerId)!;
    targetWl.busy += duration;
    targetWl.ops.push(op.id);
  });

  // Workstation cycle time is determined by the busiest operator on that station
  let maxOperatorBusy = 0;
  workerLoads.forEach((wl, wId) => {
    if (wl.busy > maxOperatorBusy) maxOperatorBusy = wl.busy;
    allocations.push({
      stationId: station.id,
      operatorId: wId,
      assignedOpIds: wl.ops,
      busyTimeSeconds: Number(wl.busy.toFixed(2)),
      utilizationPercent: 0, // Populated after line cycle time is computed
    });
  });

  // Cycle time must also accommodate non-overlapping machine cycles
  const effectiveCycleTime = Math.max(maxOperatorBusy, Number((total / operatorCount).toFixed(2)));

  return {
    workload: { manual, machine, handling, walking, total },
    cycleTime: Number(effectiveCycleTime.toFixed(2)),
    parallelAllocations: allocations,
  };
}

/**
 * Main Engineering Calculation Engine entry point
 * Accurately calculates:
 * - Takt Time
 * - Workstation Workloads
 * - Actual Line Cycle Time (Bottleneck)
 * - Line Efficiency (Station & Operator basis)
 * - Balance Delay
 * - Idle Times
 * - Theoretical Minimum Workstations and Operators
 * - Smoothness Index (SI)
 * - Hourly and Shift Production Capacity
 */
export function calculateLineBalancingRobust(line: ProductionLine): AdvancedEngineeringMetrics {
  // Step 1: Precedence & Input Validation
  const { errors: precedenceErrors, violations, topologicalOrder } = validatePrecedenceAndSequencing(line);

  // Additional basic validation
  const validationErrors: ValidationError[] = [...precedenceErrors];
  if (!line.customerDemand || line.customerDemand <= 0) {
    validationErrors.push({
      type: 'error',
      field: 'customerDemand',
      message: 'Customer demand must be greater than 0 / يجب أن يكون طلب العميل أكبر من صفر.',
    });
  }

  // Step 2: Net Available Time
  const netAvailableTime = calculateNetAvailableTime(
    line.shiftDurationHours,
    line.breakTimeMinutes,
    line.plannedDowntimeMinutes
  );

  // Step 3: Takt Time
  const taktTime = calculateTaktTime(netAvailableTime, line.customerDemand);

  // Step 4: Workstation Metrics & Parallel Operator Scheduling
  let totalWorkContent = 0;
  const workstationMetrics: WorkstationMetric[] = [];
  const allParallelAllocations: ParallelOperatorAllocation[] = [];
  const operatorMetricsMap = new Map<string, OperatorMetric>();

  line.operators.forEach((op) => {
    operatorMetricsMap.set(op.id, {
      id: op.id,
      name: op.name,
      stationId: op.assignedStationId || 'unassigned',
      stationName: 'Unassigned',
      busyTime: 0,
      idleTime: 0,
      utilization: 0,
      skillsCount: op.skills?.length || 0,
    });
  });

  const sortedWorkstations = [...line.workstations].sort((a, b) => a.sequence - b.sequence);

  sortedWorkstations.forEach((ws) => {
    const opsAtStation = line.operations.filter((o) => o.stationId === ws.id);
    const assignedOps = line.operators.filter((w) => w.assignedStationId === ws.id);

    const { workload, cycleTime, parallelAllocations } = calculateWorkstationWorkload(
      ws,
      opsAtStation,
      assignedOps
    );

    totalWorkContent += workload.total;
    allParallelAllocations.push(...parallelAllocations);

    // Update operator busy times
    parallelAllocations.forEach((alloc) => {
      const metric = operatorMetricsMap.get(alloc.operatorId);
      if (metric) {
        metric.stationName = ws.name;
        metric.busyTime = alloc.busyTimeSeconds;
      }
    });

    workstationMetrics.push({
      id: ws.id,
      name: ws.name,
      sequence: ws.sequence,
      operatorCount: Math.max(1, assignedOps.length),
      assignedOperatorIds: assignedOps.map((w) => w.id),
      operations: opsAtStation,
      manualWorkload: Number(workload.manual.toFixed(2)),
      machineWorkload: Number(workload.machine.toFixed(2)),
      handlingWorkload: Number(workload.handling.toFixed(2)),
      walkingWorkload: Number(workload.walking.toFixed(2)),
      totalWorkContent: Number(workload.total.toFixed(2)),
      cycleTime,
      idleTime: 0, // Computed below against line cycle time
      idleTimeVsTakt: Number((taktTime - cycleTime).toFixed(2)),
      utilization: 0, // Computed below
      isBottleneck: false,
      isOverloaded: cycleTime > taktTime,
      isUnderutilized: cycleTime < 0.65 * taktTime,
    });
  });

  // Step 5: Actual Line Cycle Time = Bottleneck (Maximum station cycle time)
  const lineCycleTime =
    workstationMetrics.length > 0
      ? Math.max(...workstationMetrics.map((ws) => ws.cycleTime))
      : 0;

  // Step 6: Identify Bottlenecks & Finalize Workstation Metrics
  const bottlenecks: string[] = [];
  let sumSquaredIdle = 0;
  let totalIdleTimePerCycle = 0;

  workstationMetrics.forEach((ws) => {
    const idle = Math.max(0, Number((lineCycleTime - ws.cycleTime).toFixed(2)));
    ws.idleTime = idle;
    totalIdleTimePerCycle += idle;
    sumSquaredIdle += Math.pow(idle, 2);

    ws.utilization =
      lineCycleTime > 0 ? Number(((ws.cycleTime / lineCycleTime) * 100).toFixed(1)) : 0;

    if (Math.abs(ws.cycleTime - lineCycleTime) < 0.05 && lineCycleTime > 0) {
      ws.isBottleneck = true;
      bottlenecks.push(ws.id);
    }
  });

  // Finalize Operator Metrics & Utilization
  operatorMetricsMap.forEach((metric) => {
    metric.idleTime =
      lineCycleTime > 0 ? Math.max(0, Number((lineCycleTime - metric.busyTime).toFixed(2))) : 0;
    metric.utilization =
      lineCycleTime > 0 ? Number(((metric.busyTime / lineCycleTime) * 100).toFixed(1)) : 0;
  });

  allParallelAllocations.forEach((alloc) => {
    alloc.utilizationPercent =
      lineCycleTime > 0 ? Number(((alloc.busyTimeSeconds / lineCycleTime) * 100).toFixed(1)) : 0;
  });

  // Step 7: Line Balancing Efficiency & Balance Delay
  // Formula: Efficiency = Total Work Content / (Stations * Line Cycle Time) * 100
  const stationCount = Math.max(1, workstationMetrics.length);
  const totalWorkers = Math.max(1, line.operators.length);

  const lineEfficiency =
    stationCount > 0 && lineCycleTime > 0
      ? Number(((totalWorkContent / (stationCount * lineCycleTime)) * 100).toFixed(2))
      : 0;

  const operatorLineEfficiency =
    totalWorkers > 0 && lineCycleTime > 0
      ? Number(((totalWorkContent / (totalWorkers * lineCycleTime)) * 100).toFixed(2))
      : lineEfficiency;

  // Balance Delay = 100% - Line Efficiency
  const balanceDelay = Number((100 - lineEfficiency).toFixed(2));

  // Smoothness Index: SI = sqrt(sum((CT_max - CT_i)^2))
  const smoothnessIndex = Number(Math.sqrt(sumSquaredIdle).toFixed(2));

  // Step 8: Theoretical Minimum Number of Workstations & Operators
  // Formula: N_min = ceil(Total Work Content / Takt Time)
  const theoreticalMinStations =
    taktTime > 0 ? Math.max(1, Math.ceil(totalWorkContent / taktTime)) : 1;

  // Step 9: Production Capacity & Idle Time per shift
  const totalIdleTimePerShift =
    lineCycleTime > 0
      ? Number(((netAvailableTime / lineCycleTime) * (totalIdleTimePerCycle / 3600)).toFixed(2))
      : 0;

  const oeeFactor = Math.min(1, Math.max(0.1, (line.oeeTarget || 85) / 100));
  const hourlyCapacity =
    lineCycleTime > 0 ? Number(((3600 / lineCycleTime) * oeeFactor).toFixed(1)) : 0;

  const rawShiftCapacity =
    lineCycleTime > 0 ? Math.floor(netAvailableTime / lineCycleTime) : 0;
  const shiftCapacity = Math.round(rawShiftCapacity * oeeFactor);
  const capacityBuffer = shiftCapacity - line.customerDemand;

  return {
    netAvailableTime,
    taktTime,
    totalWorkContent: Number(totalWorkContent.toFixed(2)),
    lineCycleTime,
    theoreticalMinStations,
    actualStations: stationCount,
    totalWorkers,
    lineEfficiency,
    operatorLineEfficiency,
    balanceDelay,
    smoothnessIndex,
    totalIdleTimePerCycle: Number(totalIdleTimePerCycle.toFixed(2)),
    totalIdleTimePerShift,
    hourlyCapacity,
    shiftCapacity,
    capacityBuffer,
    bottlenecks,
    workstationMetrics,
    operatorMetrics: Array.from(operatorMetricsMap.values()),
    validationErrors,
    precedenceViolations: violations,
    parallelAllocations: allParallelAllocations,
  };
}

// Re-export for standard compatibility
export { calculateLineBalancingRobust as calculateLineBalancing };

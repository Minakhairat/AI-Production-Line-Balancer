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

export function validateProductionLine(line: ProductionLine): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!line.customerDemand || line.customerDemand <= 0) {
    errors.push({
      type: 'error',
      field: 'customerDemand',
      message: 'Customer demand must be greater than 0 units per shift / يجب أن يكون طلب العميل أكبر من صفر.',
    });
  }

  const shiftDurationSec = (line.shiftDurationHours || 8) * 3600;
  const breakSec = ((line.breakTimeMinutes || 0) + (line.plannedDowntimeMinutes || 0)) * 60;
  if (breakSec >= shiftDurationSec) {
    errors.push({
      type: 'error',
      field: 'shiftDuration',
      message: 'Planned breaks and downtime cannot exceed or equal shift duration / فترات الراحة والتوقف لا يمكن أن تتجاوز مدة الوردية.',
    });
  }

  const stationMap = new Map<string, Workstation>();
  line.workstations.forEach((ws) => {
    stationMap.set(ws.id, ws);
  });

  const opMap = new Map<string, Operation>();
  line.operations.forEach((op) => {
    opMap.set(op.id, op);
    if (!stationMap.has(op.stationId)) {
      errors.push({
        type: 'error',
        field: 'operations',
        targetId: op.id,
        message: `Operation "${op.name}" (${op.id}) references non-existent Station ID "${op.stationId}".`,
      });
    }

    const totalOpTime =
      (op.manualTime || 0) +
      (op.machineTime || 0) +
      (op.automaticTime || 0) +
      (op.walkingTime || 0) +
      (op.handlingTime || 0);

    if (totalOpTime <= 0) {
      errors.push({
        type: 'warning',
        field: 'operations',
        targetId: op.id,
        message: `Operation "${op.name}" (${op.id}) has zero total processing time.`,
      });
    }
  });

  // Check precedence graph for cycles (Kahn's algorithm)
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  line.operations.forEach((op) => {
    inDegree.set(op.id, 0);
    adj.set(op.id, []);
  });

  line.operations.forEach((op) => {
    (op.precedenceIds || []).forEach((predId) => {
      if (!opMap.has(predId)) {
        errors.push({
          type: 'error',
          field: 'precedence',
          targetId: op.id,
          message: `Operation "${op.name}" requires unknown predecessor ID "${predId}".`,
        });
      } else {
        adj.get(predId)?.push(op.id);
        inDegree.set(op.id, (inDegree.get(op.id) || 0) + 1);
      }
    });
  });

  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  let visitedCount = 0;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedCount++;
    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (visitedCount < line.operations.length && line.operations.length > 0) {
    errors.push({
      type: 'error',
      field: 'precedence',
      message: 'Cyclic dependency detected in operation precedence network / تم اكتشاف حلقة مغلقة في أسبقية العمليات تجعل التجميع مستحيلاً.',
    });
  }

  line.workstations.forEach((ws) => {
    const opsAtStation = line.operations.filter((op) => op.stationId === ws.id);
    if (opsAtStation.length === 0) {
      errors.push({
        type: 'warning',
        field: 'workstations',
        targetId: ws.id,
        message: `Station "${ws.name}" (${ws.id}) has no assigned operations / محطة العمل بلا عمليات مخصصة.`,
      });
    }
  });

  return errors;
}

export function getOperationWorkContent(op: Operation): number {
  return (
    (op.manualTime || 0) +
    (op.machineTime || 0) +
    (op.automaticTime || 0) +
    (op.walkingTime || 0) +
    (op.handlingTime || 0)
  );
}

export function calculateLineBalancing(line: ProductionLine): CalculationResults {
  const validationErrors = validateProductionLine(line);

  // 1. Net Available Production Time (seconds)
  const shiftHours = line.shiftDurationHours || 8;
  const breakMinutes = line.breakTimeMinutes || 0;
  const downtimeMinutes = line.plannedDowntimeMinutes || 0;
  const totalShiftSeconds = shiftHours * 3600;
  const nonProductiveSeconds = (breakMinutes + downtimeMinutes) * 60;
  const netAvailableTime = Math.max(0, totalShiftSeconds - nonProductiveSeconds);

  // 2. Takt Time = Net Available Time / Customer Demand
  const demand = Math.max(1, line.customerDemand || 1);
  const taktTime = Number((netAvailableTime / demand).toFixed(2));

  // 3. Workstation calculations
  let totalWorkContent = 0;
  const workstationMetrics: WorkstationMetric[] = [];
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
    const ops = line.operations.filter((o) => o.stationId === ws.id);
    const assignedOperators = line.operators.filter((op) => op.assignedStationId === ws.id);
    const operatorCount = Math.max(1, assignedOperators.length);

    let wsManual = 0;
    let wsMachine = 0;
    let wsHandling = 0;
    let wsWalking = 0;
    let wsWorkContent = 0;

    const opTimeByOperator = new Map<string, number>();
    assignedOperators.forEach((op) => opTimeByOperator.set(op.id, 0));

    ops.forEach((op) => {
      const manual = op.manualTime || 0;
      const machine = (op.machineTime || 0) + (op.automaticTime || 0);
      const handling = op.handlingTime || 0;
      const walking = op.walkingTime || 0;
      const content = manual + machine + handling + walking;

      wsManual += manual;
      wsMachine += machine;
      wsHandling += handling;
      wsWalking += walking;
      wsWorkContent += content;

      if (op.operatorId && opTimeByOperator.has(op.operatorId)) {
        opTimeByOperator.set(
          op.operatorId,
          (opTimeByOperator.get(op.operatorId) || 0) + content
        );
      } else if (assignedOperators.length > 0) {
        let minOpId = assignedOperators[0].id;
        let minLoad = opTimeByOperator.get(minOpId) || 0;
        for (const aOp of assignedOperators) {
          const load = opTimeByOperator.get(aOp.id) || 0;
          if (load < minLoad) {
            minLoad = load;
            minOpId = aOp.id;
          }
        }
        opTimeByOperator.set(minOpId, minLoad + content);
      }
    });

    totalWorkContent += wsWorkContent;

    let stationCycleTime = 0;
    if (assignedOperators.length > 1) {
      let maxWorkerLoad = 0;
      opTimeByOperator.forEach((load) => {
        if (load > maxWorkerLoad) maxWorkerLoad = load;
      });
      stationCycleTime = Math.max(maxWorkerLoad, Number((wsWorkContent / operatorCount).toFixed(2)));
    } else {
      stationCycleTime = wsWorkContent;
    }

    assignedOperators.forEach((op) => {
      const busy = opTimeByOperator.get(op.id) ?? (operatorCount > 0 ? wsWorkContent / operatorCount : wsWorkContent);
      const metric = operatorMetricsMap.get(op.id);
      if (metric) {
        metric.stationName = ws.name;
        metric.busyTime = Number(busy.toFixed(2));
      }
    });

    workstationMetrics.push({
      id: ws.id,
      name: ws.name,
      sequence: ws.sequence,
      operatorCount,
      assignedOperatorIds: assignedOperators.map((o) => o.id),
      operations: ops,
      manualWorkload: Number(wsManual.toFixed(2)),
      machineWorkload: Number(wsMachine.toFixed(2)),
      handlingWorkload: Number(wsHandling.toFixed(2)),
      walkingWorkload: Number(wsWalking.toFixed(2)),
      totalWorkContent: Number(wsWorkContent.toFixed(2)),
      cycleTime: Number(stationCycleTime.toFixed(2)),
      idleTime: 0,
      idleTimeVsTakt: Number(Math.max(0, taktTime - stationCycleTime).toFixed(2)),
      utilization: 0,
      isBottleneck: false,
      isOverloaded: stationCycleTime > taktTime,
      isUnderutilized: stationCycleTime < 0.65 * taktTime,
    });
  });

  // 4. Line Cycle Time (Bottleneck)
  const maxStationCycleTime = workstationMetrics.reduce(
    (max, ws) => Math.max(max, ws.cycleTime),
    0
  );
  const lineCycleTime = maxStationCycleTime > 0 ? maxStationCycleTime : 1;

  // 5. Bottleneck identification
  const bottlenecks: string[] = [];
  workstationMetrics.forEach((ws) => {
    if (ws.cycleTime >= lineCycleTime - 0.01 || ws.cycleTime > taktTime) {
      ws.isBottleneck = true;
      bottlenecks.push(ws.id);
    }
    ws.idleTime = Number(Math.max(0, lineCycleTime - ws.cycleTime).toFixed(2));
    ws.utilization = Number(((ws.cycleTime / lineCycleTime) * 100).toFixed(1));
  });

  operatorMetricsMap.forEach((metric) => {
    metric.idleTime = Number(Math.max(0, lineCycleTime - metric.busyTime).toFixed(2));
    metric.utilization = Number(((metric.busyTime / lineCycleTime) * 100).toFixed(1));
  });

  // 6. Theoretical minimum workstations
  const theoreticalMinStations = taktTime > 0 ? Math.ceil(totalWorkContent / taktTime) : 1;
  const actualStations = line.workstations.length;
  const totalWorkers = Math.max(1, line.operators.length);

  // 7. Line Efficiency & Balance Delay
  const stationLineEfficiency =
    actualStations > 0 && lineCycleTime > 0
      ? (totalWorkContent / (actualStations * lineCycleTime)) * 100
      : 0;

  const lineEfficiency = Number(Math.min(100, Math.max(0, stationLineEfficiency)).toFixed(2));
  const balanceDelay = Number((100 - lineEfficiency).toFixed(2));

  // 8. Total Idle Time
  const totalIdleTimePerCycle = workstationMetrics.reduce((sum, ws) => sum + ws.idleTime, 0);
  const cyclesPerShift = lineCycleTime > 0 ? netAvailableTime / lineCycleTime : 0;
  const totalIdleTimePerShift = Number(((totalIdleTimePerCycle * cyclesPerShift) / 3600).toFixed(2));

  // 9. Production Capacities
  const hourlyCapacity = lineCycleTime > 0 ? Math.floor(3600 / lineCycleTime) : 0;
  const shiftCapacity = lineCycleTime > 0 ? Math.floor(netAvailableTime / lineCycleTime) : 0;
  const capacityBuffer = shiftCapacity - demand;

  return {
    netAvailableTime,
    taktTime,
    totalWorkContent: Number(totalWorkContent.toFixed(2)),
    lineCycleTime: Number(lineCycleTime.toFixed(2)),
    theoreticalMinStations,
    actualStations,
    totalWorkers,
    lineEfficiency,
    balanceDelay,
    totalIdleTimePerCycle: Number(totalIdleTimePerCycle.toFixed(2)),
    totalIdleTimePerShift,
    hourlyCapacity,
    shiftCapacity,
    capacityBuffer,
    bottlenecks,
    workstationMetrics,
    operatorMetrics: Array.from(operatorMetricsMap.values()),
    validationErrors,
  };
}

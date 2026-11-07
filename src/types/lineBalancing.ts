export type OperationType = 'manual' | 'machine' | 'handling' | 'walking' | 'inspection' | 'packaging' | 'automated';

export type TransferRestriction = 'none' | 'fixed_to_station' | 'requires_heavy_crane' | 'cleanroom_only' | 'specialized_fixture' | 'hazardous_materials';

export interface Operation {
  id: string;
  name: string;
  stationId: string;
  operatorId?: string;
  manualTime: number; // in seconds
  machineTime: number; // in seconds
  automaticTime: number; // in seconds
  walkingTime: number; // in seconds
  handlingTime: number; // in seconds
  operatorCount: number; // number of operators required for this specific task
  precedenceIds: string[]; // operations that must be completed before this one
  requiredSkills: string[];
  type: OperationType;
  canBeSplit: boolean;
  canBeCombined: boolean;
  transferRestriction: TransferRestriction;
  notes?: string;
}

export interface Workstation {
  id: string;
  name: string;
  sequence: number;
  fixedEquipment?: string[];
  maxOperators: number;
  notes?: string;
}

export interface Operator {
  id: string;
  name: string;
  shift: string;
  skills: { skill: string; level: number }[]; // level 1 to 5
  hourlyRate?: number;
  assignedStationId?: string;
  maxWorkloadSeconds?: number;
}

export interface ProductionLine {
  id: string;
  name: string;
  productModel: string;
  customerDemand: number; // units per shift
  shiftDurationHours: number; // e.g. 8 hours
  breakTimeMinutes: number; // e.g. 40 minutes
  plannedDowntimeMinutes: number; // e.g. 20 minutes
  oeeTarget: number; // percentage (e.g. 85%)
  workstations: Workstation[];
  operations: Operation[];
  operators: Operator[];
}

export interface WorkstationMetric {
  id: string;
  name: string;
  sequence: number;
  operatorCount: number;
  assignedOperatorIds: string[];
  operations: Operation[];
  manualWorkload: number;
  machineWorkload: number;
  handlingWorkload: number;
  walkingWorkload: number;
  totalWorkContent: number;
  cycleTime: number; // in seconds
  idleTime: number; // in seconds compared to line cycle time
  idleTimeVsTakt: number; // in seconds compared to takt time
  utilization: number; // % of line cycle time
  isBottleneck: boolean; // exceeds takt time or equals max cycle time
  isOverloaded: boolean; // cycleTime > taktTime
  isUnderutilized: boolean; // cycleTime < 0.65 * taktTime
}

export interface OperatorMetric {
  id: string;
  name: string;
  stationId: string;
  stationName: string;
  busyTime: number; // seconds
  idleTime: number; // seconds
  utilization: number; // %
  skillsCount: number;
}

export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  targetId?: string;
}

export interface CalculationResults {
  netAvailableTime: number; // seconds
  taktTime: number; // seconds
  totalWorkContent: number; // sum of all operations' standard work content
  lineCycleTime: number; // bottleneck cycle time
  theoreticalMinStations: number; // ceil(totalWorkContent / taktTime)
  actualStations: number;
  totalWorkers: number;
  lineEfficiency: number; // %
  balanceDelay: number; // % (100 - lineEfficiency)
  totalIdleTimePerCycle: number; // seconds
  totalIdleTimePerShift: number; // hours
  hourlyCapacity: number; // units/hr based on actual line cycle time
  shiftCapacity: number; // units/shift based on actual line cycle time
  capacityBuffer: number; // difference between shift capacity and customer demand
  bottlenecks: string[]; // station IDs that represent bottlenecks
  workstationMetrics: WorkstationMetric[];
  operatorMetrics: OperatorMetric[];
  validationErrors: ValidationError[];
}

export interface OperationTransfer {
  operationId: string;
  operationName: string;
  fromStationId: string;
  toStationId: string;
  reason: string;
  durationSeconds: number;
}

export interface CombinedOperation {
  primaryOpId: string;
  combinedOpIds: string[];
  originalTime: number;
  resultingTime: number;
  timeSaved: number;
  rationale: string;
}

export interface SplitOperation {
  originalOpId: string;
  operationName: string;
  originalTime: number;
  splitParts: { name: string; stationId: string; time: number }[];
  rationale: string;
}

export interface ScenarioWorkstationAssignment {
  stationId: string;
  stationName: string;
  operationIds: string[];
  operatorIds: string[];
  cycleTime: number;
  workload: number;
  operatorCount: number;
  isBottleneck: boolean;
}

export interface OptimizationScenario {
  id: 'scenario-a' | 'scenario-b' | 'scenario-c' | string;
  name: string;
  title: string;
  description: string;
  objective: string;
  algorithmUsed: 'Ranked Positional Weight (RPW)' | 'Largest Candidate Rule (LCR)' | 'COMSOAL Heuristic' | 'Genetic Multi-Objective';
  assignments: ScenarioWorkstationAssignment[];
  transfers: OperationTransfer[];
  combinedOperations: CombinedOperation[];
  splitOperations: SplitOperation[];
  metrics: CalculationResults;
  advantages: string[];
  disadvantages: string[];
  isFeasible: boolean;
  unfeasibleReasons?: string[];
  engineeringJustification: string;
}

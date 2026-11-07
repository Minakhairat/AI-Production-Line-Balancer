/**
 * Re-exports and integrates with the robust calculation engine in src/utils/engineeringCalculationEngine.ts
 */

export {
  calculateLineBalancingRobust as calculateLineBalancing,
  calculateOperationStandardTime as getOperationWorkContent,
  validatePrecedenceAndSequencing,
  calculateNetAvailableTime,
  calculateTaktTime,
  calculateWorkstationWorkload,
} from '../utils/engineeringCalculationEngine';

export type {
  PrecedenceViolation,
  ParallelOperatorAllocation,
  AdvancedEngineeringMetrics,
} from '../utils/engineeringCalculationEngine';

import { ProductionLine, ValidationError } from '../types/lineBalancing';
import { validatePrecedenceAndSequencing } from '../utils/engineeringCalculationEngine';

export function validateProductionLine(line: ProductionLine): ValidationError[] {
  const { errors } = validatePrecedenceAndSequencing(line);
  return errors;
}

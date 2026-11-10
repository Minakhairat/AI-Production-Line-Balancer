import {
  calculateLineBalancing,
  validateProductionLine,
  getOperationWorkContent,
} from './calculationEngine';
import { runOptimizationSuite } from './optimizationEngine';
import { SAMPLE_PRODUCTION_LINES } from './sampleData';

/**
 * Verification test suite for Industrial Engineering formulas and optimization engines.
 */
export function runEngineeringVerificationTests(): { passed: boolean; testCount: number; results: string[] } {
  const results: string[] = [];
  let testCount = 0;
  let passed = true;

  const assert = (condition: boolean, testName: string) => {
    testCount++;
    if (condition) {
      results.push(`✓ [PASS] ${testName}`);
    } else {
      passed = false;
      results.push(`✗ [FAIL] ${testName}`);
    }
  };

  // Test 1: Takt Time Formula
  // Net time: 8h shift (28800s) - 40m breaks (2400s) - 20m downtime (1200s) = 25200s
  // Demand: 450 units -> Takt Time = 25200 / 450 = 56.00s
  const autoLine = SAMPLE_PRODUCTION_LINES[0];
  const autoResults = calculateLineBalancing(autoLine);
  assert(
    autoResults.netAvailableTime === 25200,
    `Net Available Time calculation: Expected 25200s, got ${autoResults.netAvailableTime}s`
  );
  assert(
    autoResults.taktTime === 56,
    `Takt Time calculation: Expected 56s, got ${autoResults.taktTime}s`
  );

  // Test 2: Theoretical Minimum Workstations
  // Total work content / Takt time rounded up
  const expectedMinStations = Math.ceil(autoResults.totalWorkContent / autoResults.taktTime);
  assert(
    autoResults.theoreticalMinStations === expectedMinStations,
    `Theoretical minimum workstations: Expected ${expectedMinStations}, got ${autoResults.theoreticalMinStations}`
  );

  // Test 3: Line Efficiency and Balance Delay
  // Line Efficiency + Balance Delay must sum to 100%
  const sumEfficiency = Number((autoResults.lineEfficiency + autoResults.balanceDelay).toFixed(1));
  assert(
    Math.abs(sumEfficiency - 100) < 0.1,
    `Line Efficiency + Balance Delay = 100%: Sum is ${sumEfficiency}%`
  );

  // Test 4: Bottleneck Identification & Shift Production Capacity Formula
  // The slowest station cycle time must match lineCycleTime
  const maxWsCycle = Math.max(...autoResults.workstationMetrics.map((w) => w.cycleTime));
  assert(
    autoResults.lineCycleTime === maxWsCycle,
    `Line cycle time equals max station cycle time (${maxWsCycle}s)`
  );
  assert(
    autoResults.bottlenecks.length > 0,
    `Bottleneck detected correctly: Found ${autoResults.bottlenecks.join(', ')}`
  );
  const expectedCapacity = Math.floor(autoResults.netAvailableTime / autoResults.lineCycleTime);
  assert(
    autoResults.shiftCapacity === expectedCapacity,
    `Shift Capacity equals Net Available Time / Bottleneck: Expected ${expectedCapacity}u, got ${autoResults.shiftCapacity}u`
  );

  // Test 5: Optimization Suite (RPW & LCR)
  const scenarios = runOptimizationSuite(autoLine, autoResults);
  assert(scenarios.length === 3, 'Optimization suite generates all 3 required scenarios (A, B, C)');

  const [scA, scB, scC] = scenarios;
  assert(scA.isFeasible, 'Scenario A (Workload Leveling) is topologically feasible');
  assert(
    scA.metrics.lineCycleTime <= autoResults.lineCycleTime + 0.1,
    'Scenario A reduces or maintains bottleneck cycle time'
  );
  assert(
    scB.metrics.totalWorkers <= autoResults.totalWorkers,
    'Scenario B reduces or maintains worker headcount'
  );
  assert(
    scC.metrics.shiftCapacity >= autoResults.shiftCapacity,
    'Scenario C achieves equal or higher shift output capacity'
  );

  return { passed, testCount, results };
}

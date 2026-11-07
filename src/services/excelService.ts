import * as XLSX from 'xlsx';
import { ProductionLine, Operation, Workstation, CalculationResults } from '../types/lineBalancing';

export interface ExportDataPayload {
  line: ProductionLine;
  results?: CalculationResults;
}

export function exportToExcel(data: ExportDataPayload, fileName = 'Production_Line_Balancing.xlsx') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Line Parameters & Summary
  const summaryRows = [
    { Parameter: 'Production Line Name / اسم خط الإنتاج', Value: data.line.name },
    { Parameter: 'Product Model / موديل المنتج', Value: data.line.productModel },
    { Parameter: 'Customer Demand (Units/Shift) / طلب العميل (قطعة/وردية)', Value: data.line.customerDemand },
    { Parameter: 'Shift Duration (Hours) / مدة الوردية (ساعات)', Value: data.line.shiftDurationHours },
    { Parameter: 'Break Time (Minutes) / وقت الراحة (دقائق)', Value: data.line.breakTimeMinutes },
    { Parameter: 'Planned Downtime (Minutes) / وقت التوقف المخطط (دقائق)', Value: data.line.plannedDowntimeMinutes },
    { Parameter: 'Target OEE (%) / فاعلية المعدات المستهدفة', Value: `${data.line.oeeTarget}%` },
    { Parameter: 'Workstation Count / عدد محطات العمل', Value: data.line.workstations.length },
    { Parameter: 'Total Operations / إجمالي العمليات', Value: data.line.operations.length },
    { Parameter: 'Total Operators / إجمالي المشغلين', Value: data.line.operators.length },
  ];

  if (data.results) {
    summaryRows.push(
      { Parameter: 'Net Available Time (s) / صافي الوقت المتاح (ثانية)', Value: Math.round(data.results.netAvailableTime) },
      { Parameter: 'Takt Time (s) / زمن التاكت (ثانية)', Value: Number(data.results.taktTime.toFixed(2)) },
      { Parameter: 'Total Work Content (s) / إجمالي محتوى العمل (ثانية)', Value: Number(data.results.totalWorkContent.toFixed(2)) },
      { Parameter: 'Actual Line Cycle Time (s) / زمن دورة الخط الفعلي (ثانية)', Value: Number(data.results.lineCycleTime.toFixed(2)) },
      { Parameter: 'Theoretical Min Stations / الحد الأدنى النظري للمحطات', Value: data.results.theoreticalMinStations },
      { Parameter: 'Line Balancing Efficiency (%) / كفاءة توازن الخط', Value: Number(data.results.lineEfficiency.toFixed(2)) },
      { Parameter: 'Balance Delay (%) / نسبة الهدر وعدم التوازن', Value: Number(data.results.balanceDelay.toFixed(2)) },
      { Parameter: 'Shift Capacity (Units) / الطاقة الإنتاجية للوردية (قطعة)', Value: data.results.shiftCapacity },
      { Parameter: 'Hourly Capacity (Units/Hr) / الطاقة الإنتاجية في الساعة', Value: Number(data.results.hourlyCapacity.toFixed(1)) },
    );
  }

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary_الملخص');

  // Sheet 2: Operations Time Study
  const opRows = data.line.operations.map((op) => ({
    'Operation ID / كود العملية': op.id,
    'Operation Name / اسم العملية': op.name,
    'Current Station / المحطة الحالية': op.stationId,
    'Assigned Operator / المشغل المسند': op.operatorId || 'Unassigned / غير محدد',
    'Manual Time (s) / يدوي (ث)': op.manualTime,
    'Machine Time (s) / ماكينة (ث)': op.machineTime,
    'Automatic Time (s) / آلي (ث)': op.automaticTime,
    'Walking Time (s) / حركة ومشي (ث)': op.walkingTime,
    'Handling Time (s) / تداول ومناولة (ث)': op.handlingTime,
    'Total Std Time (s) / إجمالي الوقت القياسي (ث)': (op.manualTime + op.machineTime + op.automaticTime + op.walkingTime + op.handlingTime).toFixed(1),
    'Operators Required / عدد العمال': op.operatorCount,
    'Precedence / العمليات السابقة': (op.precedenceIds || []).join(', '),
    'Required Skills / المهارات المطلوبة': (op.requiredSkills || []).join(', '),
    'Type / النوع': op.type,
    'Can Split / قابلة للتجزئة': op.canBeSplit ? 'Yes / نعم' : 'No / لا',
    'Can Combine / قابلة للدمج': op.canBeCombined ? 'Yes / نعم' : 'No / لا',
    'Transfer Restriction / قيود النقل': op.transferRestriction,
    'Notes / ملاحظات': op.notes || '',
  }));
  const wsOps = XLSX.utils.json_to_sheet(opRows);
  XLSX.utils.book_append_sheet(wb, wsOps, 'Operations_دراسة_الوقت');

  // Sheet 3: Workstations
  const wsRows = data.line.workstations.map((ws) => ({
    'Station ID / كود المحطة': ws.id,
    'Station Name / اسم المحطة': ws.name,
    'Sequence / الترتيب': ws.sequence,
    'Max Operators / الحد الأقصى للمشغلين': ws.maxOperators,
    'Fixed Equipment / المعدات الثابتة': (ws.fixedEquipment || []).join(', '),
    'Notes / ملاحظات': ws.notes || '',
  }));
  const wsStations = XLSX.utils.json_to_sheet(wsRows);
  XLSX.utils.book_append_sheet(wb, wsStations, 'Workstations_محطات_العمل');

  // Sheet 4: Operators & Skills
  const workerRows = data.line.operators.map((op) => ({
    'Operator ID / كود المشغل': op.id,
    'Name / الاسم': op.name,
    'Shift / الوردية': op.shift,
    'Assigned Station / المحطة المسندة': op.assignedStationId || 'None / لا يوجد',
    'Max Workload (s) / أقصى حمل (ث)': op.maxWorkloadSeconds || 0,
    'Skills Matrix / مصفوفة المهارات': (op.skills || []).map((s) => `${s.skill} (Lvl ${s.level})`).join('; '),
  }));
  const wsWorkers = XLSX.utils.json_to_sheet(workerRows);
  XLSX.utils.book_append_sheet(wb, wsWorkers, 'Operators_المشغلين');

  // Sheet 5: Workstation Metrics (if available)
  if (data.results?.workstationMetrics) {
    const metricRows = data.results.workstationMetrics.map((m) => ({
      'Station / المحطة': m.name,
      'Sequence / الترتيب': m.sequence,
      'Operators / عدد المشغلين': m.operatorCount,
      'Cycle Time (s) / زمن الدورة (ث)': Number(m.cycleTime.toFixed(1)),
      'Idle Time (s) / وقت الانتظار (ث)': Number(m.idleTime.toFixed(1)),
      'Utilization (%) / نسبة الاستغلال': Number(m.utilization.toFixed(1)),
      'Status / الحالة': m.isBottleneck ? 'Bottleneck / عنق زجاجة' : m.isUnderutilized ? 'Underutilized / غير مستغلة' : 'Balanced / متزنة',
    }));
    const wsMetrics = XLSX.utils.json_to_sheet(metricRows);
    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Metrics_المؤشرات');
  }

  XLSX.writeFile(wb, fileName);
}

export function exportOperationsToCSV(operations: Operation[], fileName = 'operations_study.csv') {
  const headers = [
    'Operation ID',
    'Operation Name',
    'Current Station',
    'Assigned Operator',
    'Manual Time (s)',
    'Machine Time (s)',
    'Automatic Time (s)',
    'Walking Time (s)',
    'Handling Time (s)',
    'Number of Operators',
    'Precedence Operations',
    'Required Skills',
    'Operation Type',
    'Can Be Split',
    'Can Be Combined',
    'Transfer Restrictions',
    'Notes',
  ];

  const rows = operations.map((op) => [
    op.id,
    `"${(op.name || '').replace(/"/g, '""')}"`,
    op.stationId,
    op.operatorId || '',
    op.manualTime,
    op.machineTime,
    op.automaticTime,
    op.walkingTime,
    op.handlingTime,
    op.operatorCount,
    `"${(op.precedenceIds || []).join(';')}"`,
    `"${(op.requiredSkills || []).join(';')}"`,
    op.type,
    op.canBeSplit ? 'Yes' : 'No',
    op.canBeCombined ? 'Yes' : 'No',
    op.transferRestriction,
    `"${(op.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function parseImportFile(file: File): Promise<Partial<ProductionLine>> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const result: Partial<ProductionLine> = {
    operations: [],
    workstations: [],
    operators: [],
  };

  const opSheetName = wb.SheetNames.find((s) => s.toLowerCase().includes('operat') || s.includes('عمليات') || s.includes('time') || s.includes('دراسة')) || wb.SheetNames[0];
  const opSheet = wb.Sheets[opSheetName];

  if (opSheet) {
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(opSheet);
    const operations: Operation[] = rawData.map((row, idx) => {
      const findVal = (terms: string[]): unknown => {
        const key = Object.keys(row).find((k) => terms.some((t) => k.toLowerCase().includes(t.toLowerCase())));
        return key ? row[key] : undefined;
      };

      const id = String(findVal(['operation id', 'id', 'كود']) || `op-${idx + 1}`);
      const name = String(findVal(['operation name', 'name', 'اسم']) || `Operation ${idx + 1}`);
      const stationId = String(findVal(['station', 'محطة']) || 'ws-1');
      const operatorId = String(findVal(['operator', 'مشغل']) || '');
      const manualTime = Number(findVal(['manual', 'يدوي']) || 0);
      const machineTime = Number(findVal(['machine', 'ماكينة']) || 0);
      const automaticTime = Number(findVal(['automatic', 'آلي']) || 0);
      const walkingTime = Number(findVal(['walking', 'مشي', 'حركة']) || 0);
      const handlingTime = Number(findVal(['handling', 'مناولة']) || 0);
      const operatorCount = Number(findVal(['operators', 'عدد العمال']) || 1);
      
      const precRaw = String(findVal(['precedence', 'السابقة']) || '');
      const precedenceIds = precRaw ? precRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean) : [];
      
      const skillsRaw = String(findVal(['skill', 'مهارات']) || '');
      const requiredSkills = skillsRaw ? skillsRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean) : [];
      
      const typeRaw = String(findVal(['type', 'نوع']) || 'manual').toLowerCase();
      let type: Operation['type'] = 'manual';
      if (typeRaw.includes('mach')) type = 'machine';
      else if (typeRaw.includes('hand')) type = 'handling';
      else if (typeRaw.includes('walk')) type = 'walking';
      else if (typeRaw.includes('inspect')) type = 'inspection';
      else if (typeRaw.includes('pack')) type = 'packaging';
      else if (typeRaw.includes('auto')) type = 'automated';

      const canSplitVal = String(findVal(['split', 'تجزئة']) || 'no').toLowerCase();
      const canCombineVal = String(findVal(['combine', 'دمج']) || 'no').toLowerCase();

      return {
        id,
        name,
        stationId,
        operatorId: operatorId || undefined,
        manualTime,
        machineTime,
        automaticTime,
        walkingTime,
        handlingTime,
        operatorCount: operatorCount > 0 ? operatorCount : 1,
        precedenceIds,
        requiredSkills,
        type,
        canBeSplit: canSplitVal.includes('yes') || canSplitVal.includes('نعم') || canSplitVal.includes('true'),
        canBeCombined: canCombineVal.includes('yes') || canCombineVal.includes('نعم') || canCombineVal.includes('true'),
        transferRestriction: 'none',
        notes: String(findVal(['notes', 'ملاحظات']) || ''),
      };
    });

    result.operations = operations;
  }

  const wsSheetName = wb.SheetNames.find((s) => s.toLowerCase().includes('workstation') || s.toLowerCase().includes('station') || s.includes('محطات'));
  if (wsSheetName && wb.Sheets[wsSheetName]) {
    const rawWs = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wsSheetName]);
    const workstations: Workstation[] = rawWs.map((row, idx) => {
      const findVal = (terms: string[]) => {
        const key = Object.keys(row).find((k) => terms.some((t) => k.toLowerCase().includes(t.toLowerCase())));
        return key ? row[key] : undefined;
      };
      return {
        id: String(findVal(['station id', 'id', 'كود']) || `ws-${idx + 1}`),
        name: String(findVal(['name', 'اسم']) || `Workstation ${idx + 1}`),
        sequence: Number(findVal(['sequence', 'ترتيب']) || idx + 1),
        maxOperators: Number(findVal(['max', 'أقصى']) || 2),
      };
    });
    if (workstations.length > 0) result.workstations = workstations;
  }

  return result;
}

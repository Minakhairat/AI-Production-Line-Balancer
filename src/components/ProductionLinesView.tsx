import React, { useState, useEffect } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { ProductionLine } from '../types/lineBalancing';
import { SAMPLE_LINES } from '../services/sampleData';
import { calculateOperationStandardTime } from '../utils/engineeringCalculationEngine';
import {
  Factory,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  X,
  Gauge,
  Sliders,
} from 'lucide-react';

export const ProductionLinesView: React.FC = () => {
  const {
    line,
    lines,
    activeLineId,
    results,
    updateLine,
    createLine,
    duplicateLine,
    deleteLine,
    switchLine,
    resetToSample,
    language,
    t,
  } = useLineBalancing();

  // Active Line Calibration Form State
  const [formName, setFormName] = useState(line.name);
  const [formModel, setFormModel] = useState(line.productModel);
  const [formDemand, setFormDemand] = useState(line.customerDemand);
  const [formShiftHours, setFormShiftHours] = useState(line.shiftDurationHours);
  const [formBreaks, setFormBreaks] = useState(line.breakTimeMinutes);
  const [formDowntime, setFormDowntime] = useState(line.plannedDowntimeMinutes);
  const [formOEE, setFormOEE] = useState(line.oeeTarget || 85);

  // Sync form when active line changes
  useEffect(() => {
    setFormName(line.name);
    setFormModel(line.productModel);
    setFormDemand(line.customerDemand);
    setFormShiftHours(line.shiftDurationHours);
    setFormBreaks(line.breakTimeMinutes);
    setFormDowntime(line.plannedDowntimeMinutes);
    setFormOEE(line.oeeTarget || 85);
  }, [line]);

  // Modal State for Adding New Production Line
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLineName, setNewLineName] = useState('');
  const [newLineModel, setNewLineModel] = useState('');
  const [newLineDemand, setNewLineDemand] = useState(400);
  const [newLineShiftHours, setNewLineShiftHours] = useState(8);
  const [newLineBreaks, setNewLineBreaks] = useState(40);
  const [newLineDowntime, setNewLineDowntime] = useState(20);
  const [newTemplate, setNewTemplate] = useState<'blank' | 'clone' | 'auto' | 'electronics' | 'compressor'>('blank');

  // Deletion and Reset In-App Confirmation Modal States (bypassing blocked browser confirm)
  const [linePendingDelete, setLinePendingDelete] = useState<ProductionLine | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Auto dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const openAddModal = () => {
    setNewLineName(`${language === 'ar' ? 'خط إنتاج جديد' : 'New Production Line'} ${lines.length + 1}`);
    setNewLineModel(`MOD-${Date.now().toString().slice(-4)}`);
    setNewLineDemand(400);
    setNewLineShiftHours(8);
    setNewLineBreaks(40);
    setNewLineDowntime(20);
    setNewTemplate('blank');
    setIsAddModalOpen(true);
  };

  const handleCreateLineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `line-${Date.now().toString().slice(-6)}`;

    let starterWorkstations = [
      { id: 'ws-1', name: 'WS-01: Assembly Station (محطة تجميع)', sequence: 1, maxOperators: 1 },
      { id: 'ws-2', name: 'WS-02: Quality Check (فحص الجودة)', sequence: 2, maxOperators: 1 },
    ];
    let starterOperations = [
      {
        id: 'OP-01',
        name: language === 'ar' ? 'تجهيز وتجميع الأجزاء' : 'Initial Component Assembly',
        stationId: 'ws-1',
        manualTime: 25,
        machineTime: 0,
        automaticTime: 0,
        walkingTime: 2,
        handlingTime: 3,
        operatorCount: 1,
        precedenceIds: [],
        requiredSkills: [],
        type: 'manual' as const,
        canBeSplit: false,
        canBeCombined: false,
        transferRestriction: 'none' as const,
      },
      {
        id: 'OP-02',
        name: language === 'ar' ? 'الفحص والاختبار النهائي' : 'Final Inspection & QA',
        stationId: 'ws-2',
        manualTime: 20,
        machineTime: 0,
        automaticTime: 0,
        walkingTime: 2,
        handlingTime: 2,
        operatorCount: 1,
        precedenceIds: ['OP-01'],
        requiredSkills: [],
        type: 'inspection' as const,
        canBeSplit: false,
        canBeCombined: false,
        transferRestriction: 'none' as const,
      },
    ];
    let starterOperators = [
      { id: 'op-1', name: 'Operator 1 (مشغل 1)', shift: 'Shift 1', assignedStationId: 'ws-1', skills: [] },
      { id: 'op-2', name: 'Operator 2 (مشغل 2)', shift: 'Shift 1', assignedStationId: 'ws-2', skills: [] },
    ];

    if (newTemplate === 'clone') {
      starterWorkstations = JSON.parse(JSON.stringify(line.workstations));
      starterOperations = JSON.parse(JSON.stringify(line.operations));
      starterOperators = JSON.parse(JSON.stringify(line.operators));
    } else if (newTemplate === 'auto') {
      const autoSample = SAMPLE_LINES[0];
      starterWorkstations = JSON.parse(JSON.stringify(autoSample.workstations));
      starterOperations = JSON.parse(JSON.stringify(autoSample.operations));
      starterOperators = JSON.parse(JSON.stringify(autoSample.operators));
    } else if (newTemplate === 'electronics') {
      const elecSample = SAMPLE_LINES[1] || SAMPLE_LINES[0];
      starterWorkstations = JSON.parse(JSON.stringify(elecSample.workstations));
      starterOperations = JSON.parse(JSON.stringify(elecSample.operations));
      starterOperators = JSON.parse(JSON.stringify(elecSample.operators));
    } else if (newTemplate === 'compressor') {
      const compSample = SAMPLE_LINES[2] || SAMPLE_LINES[0];
      starterWorkstations = JSON.parse(JSON.stringify(compSample.workstations));
      starterOperations = JSON.parse(JSON.stringify(compSample.operations));
      starterOperators = JSON.parse(JSON.stringify(compSample.operators));
    }

    const newLine: ProductionLine = {
      id: newId,
      name: newLineName,
      productModel: newLineModel,
      customerDemand: Number(newLineDemand),
      shiftDurationHours: Number(newLineShiftHours),
      breakTimeMinutes: Number(newLineBreaks),
      plannedDowntimeMinutes: Number(newLineDowntime),
      oeeTarget: 85,
      workstations: starterWorkstations,
      operations: starterOperations,
      operators: starterOperators,
    };

    createLine(newLine);
    setIsAddModalOpen(false);
  };

  const handleUpdateActiveLine = (e: React.FormEvent) => {
    e.preventDefault();
    updateLine({
      name: formName,
      productModel: formModel,
      customerDemand: Number(formDemand),
      shiftDurationHours: Number(formShiftHours),
      breakTimeMinutes: Number(formBreaks),
      plannedDowntimeMinutes: Number(formDowntime),
      oeeTarget: Number(formOEE),
    });
    setToastMessage({
      text: language === 'ar'
        ? 'تم تحديث معايير خط الإنتاج بنجاح وإعادة حساب زمن التاكت والطاقة الإنتاجية وحفظها محلياً!'
        : 'Line parameters updated successfully, recalculating Takt Time and Shift Capacity!',
      type: 'success',
    });
  };

  // Helper to calculate estimated capacity for any line card
  const getLineCardMetrics = (targetLine: ProductionLine) => {
    const netSec = Math.max(
      0,
      targetLine.shiftDurationHours * 3600 - (targetLine.breakTimeMinutes + targetLine.plannedDowntimeMinutes) * 60
    );
    const totalWork = targetLine.operations.reduce(
      (acc, op) => acc + calculateOperationStandardTime(op),
      0
    );
    const stationLoads: { [stId: string]: number } = {};
    targetLine.workstations.forEach((ws) => (stationLoads[ws.id] = 0));
    targetLine.operations.forEach((op) => {
      stationLoads[op.stationId] = (stationLoads[op.stationId] || 0) + calculateOperationStandardTime(op);
    });
    const maxStationLoad = Math.max(...Object.values(stationLoads), 1);
    const shiftCap = maxStationLoad > 0 ? Math.floor(netSec / maxStationLoad) : 0;
    const takt = targetLine.customerDemand > 0 ? Number((netSec / targetLine.customerDemand).toFixed(1)) : 0;

    return { netSec, totalWork, maxStationLoad, shiftCap, takt };
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-500 hover:opacity-80 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with Title and Add Line Action */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-500" />
            <span>{language === 'ar' ? 'إدارة خطوط ونماذج الإنتاج (Production Lines & Models)' : 'Production Lines & Models Architecture'}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'إنشاء وإدارة وحفظ خطوط الإنتاج والموديلات الصناعية مع التبديل الفوري وحفظ البيانات محلياً'
              : 'Add, edit, clone, and switch between manufacturing lines and product variants with persistent local storage'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة خط إنتاج جديد' : 'Add New Line'}</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors"
            title={language === 'ar' ? 'استعادة بيانات المصنع النموذجية' : 'Reset to sample benchmarks'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'استعادة الافتراضي' : 'Reset Benchmarks'}</span>
          </button>
        </div>
      </div>

      {/* Production Lines Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {language === 'ar'
              ? `خطوط الإنتاج المحفوظة في قاعدة البيانات (${lines.length} خطوط):`
              : `Saved Production Lines in Local Database (${lines.length} lines):`}
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">
            {language === 'ar' ? 'محفوظ محلياً وتلقائياً بالمتصفح' : 'Locally Persisted in Browser Storage'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lines.map((pLine) => {
            const isCurrent = pLine.id === activeLineId;
            const metrics = getLineCardMetrics(pLine);

            return (
              <div
                key={pLine.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase truncate max-w-[150px]">
                      {pLine.productModel}
                    </span>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'الخط النشط حالياً' : 'Active Line'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        ID: {pLine.id.slice(-6)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">
                    {pLine.name}
                  </h3>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-100 dark:border-neutral-800/80 font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">{language === 'ar' ? 'المحطات:' : 'Stations:'}</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{pLine.workstations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">{language === 'ar' ? 'العمليات:' : 'Tasks:'}</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{pLine.operations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">{language === 'ar' ? 'الطلب:' : 'Demand:'}</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{pLine.customerDemand} u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">{language === 'ar' ? 'التاكت:' : 'Takt:'}</span>
                      <span className="font-bold text-blue-500">{metrics.takt}s</span>
                    </div>
                    <div className="flex justify-between col-span-2 pt-1 border-t border-neutral-200/50 dark:border-neutral-800">
                      <span className="text-neutral-500">{language === 'ar' ? 'طاقة الوردية (المتاح ÷ الاختناق):' : 'Shift Output (Net/CT):'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {metrics.shiftCap} {language === 'ar' ? 'قطعة' : 'units'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  {isCurrent ? (
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      ✓ {language === 'ar' ? 'قيد المعاينة والتحليل الآن' : 'Loaded in Workspace'}
                    </span>
                  ) : (
                    <button
                      onClick={() => switchLine(pLine.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>{language === 'ar' ? 'تفعيل وتحميل الخط' : 'Activate Line'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateLine(pLine.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title={language === 'ar' ? 'تكرار ونسخ هذا الخط' : 'Duplicate this line'}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {lines.length > 1 && (
                      <button
                        onClick={() => setLinePendingDelete(pLine)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title={language === 'ar' ? 'حذف خط الإنتاج' : 'Delete line'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Calibration Panel for Active Line */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>{language === 'ar' ? `معايير وحسابات الخط النشط: (${line.name})` : `Active Line Parameters: (${line.name})`}</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              {line.productModel}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {language === 'ar'
              ? 'تعديل وتحديث معايير التشغيل للخط النشط وإعادة حساب زمن التاكت والطاقة الإنتاجية بالساعة والوردية فورياً'
              : 'Calibrate shift operating hours, breaks, planned downtime, and customer target demand'}
          </p>
        </div>

        {/* Real-Time Mathematical Formulas Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{language === 'ar' ? 'المؤشرات والحسابات الهندسية الفورية للخط النشط:' : 'Live Engineering Formulas & Calculation Output:'}</span>
            </span>
            <span className="font-mono text-[11px] text-blue-700 dark:text-blue-400">
              {language === 'ar' ? 'معادلة الطاقة = زمن الوردية المتاح ÷ زمن أعلى محطة' : 'Capacity = Net Shift Time / Bottleneck CT'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">{language === 'ar' ? 'الزمن الإجمالي:' : 'Gross Shift:'}</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {(line.shiftDurationHours * 3600)}s
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">{language === 'ar' ? 'الزمن الصافي المتاح:' : 'Net Available:'}</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {results.netAvailableTime}s
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">{language === 'ar' ? 'زمن التاكت المستهدف:' : 'Takt Time:'}</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {results.taktTime.toFixed(1)}s
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">{language === 'ar' ? 'أعلى محطة (الاختناق):' : 'Bottleneck CT:'}</span>
              <span className="font-mono font-bold text-rose-500">
                {results.lineCycleTime.toFixed(1)}s
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">{language === 'ar' ? 'طاقة الوردية الفعلية:' : 'Shift Capacity:'}</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                {results.shiftCapacity} {language === 'ar' ? 'قطعة' : 'u'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">{language === 'ar' ? 'طاقة الساعة:' : 'Hourly Output:'}</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {results.hourlyCapacity.toFixed(1)} {language === 'ar' ? 'قطعة/س' : 'u/h'}
              </span>
            </div>
          </div>
        </div>

        {/* Calibration Form */}
        <form onSubmit={handleUpdateActiveLine} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'اسم خط الإنتاج' : 'Line Name'}
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'طراز وموديل المنتج' : 'Product Model / Variant'}
              </label>
              <input
                type="text"
                required
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'الطلب المستهدف (قطعة / وردية)' : 'Customer Demand (units/shift)'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={formDemand}
                onChange={(e) => setFormDemand(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'مدة الوردية (ساعات)' : 'Shift Duration (hours)'}
              </label>
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                required
                value={formShiftHours}
                onChange={(e) => setFormShiftHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'فترات الراحة والغداء (دقائق)' : 'Breaks & Meal Time (min)'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={formBreaks}
                onChange={(e) => setFormBreaks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'التوقف المخطط والصيانة (دقائق)' : 'Planned Downtime (min)'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={formDowntime}
                onChange={(e) => setFormDowntime(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20"
            >
              {language === 'ar' ? 'حفظ وتحديث معايير الخط النشط' : 'Save Line Parameters'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal for Creating New Production Line */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-500" />
                <span>{language === 'ar' ? 'إضافة خط وموديل إنتاج جديد' : 'Create New Production Line'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  {language === 'ar' ? 'اسم خط الإنتاج الجديد' : 'Line Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newLineName}
                  onChange={(e) => setNewLineName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: خط تجميع المحركات الكهربائية' : 'e.g. Electric Motor Assembly Line'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  {language === 'ar' ? 'طراز وموديل المنتج' : 'Product Model / Variant'}
                </label>
                <input
                  type="text"
                  required
                  value={newLineModel}
                  onChange={(e) => setNewLineModel(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: MTR-V400' : 'e.g. MTR-V400'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                    {language === 'ar' ? 'الطلب المستهدف (قطعة)' : 'Demand (units/shift)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newLineDemand}
                    onChange={(e) => setNewLineDemand(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                    {language === 'ar' ? 'ساعات الوردية' : 'Shift Duration (hours)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    required
                    value={newLineShiftHours}
                    onChange={(e) => setNewLineShiftHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                    {language === 'ar' ? 'فترات الراحة (دقائق)' : 'Breaks (min)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newLineBreaks}
                    onChange={(e) => setNewLineBreaks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                    {language === 'ar' ? 'التوقف المخطط (دقائق)' : 'Downtime (min)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newLineDowntime}
                    onChange={(e) => setNewLineDowntime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  {language === 'ar' ? 'قالب البداية لمحطات وعمليات الخط:' : 'Starting Line Template:'}
                </label>
                <select
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="blank">{language === 'ar' ? 'قالب جديد بسيط (محطتان وعمليتان جاهزة)' : 'Clean Starter Template (2 stations, 2 operations)'}</option>
                  <option value="clone">{language === 'ar' ? `نسخ متطابق من الخط النشط الحالي (${line.name})` : `Clone current active line (${line.name})`}</option>
                  <option value="auto">{language === 'ar' ? 'نموذج خط تجميع مولدات سيارات (6 محطات، 16 عملية)' : 'Automotive Alternator Template (6 stations, 16 ops)'}</option>
                  <option value="electronics">{language === 'ar' ? 'نموذج خط هواتف ذكية وإلكترونيات (5 محطات، 14 عملية)' : 'Smartphone SMT Template (5 stations, 14 ops)'}</option>
                  <option value="compressor">{language === 'ar' ? 'نموذج خط ضواغط تبريد وتكييف (5 محطات، 12 عملية)' : 'HVAC Compressor Template (5 stations, 12 ops)'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
                >
                  {language === 'ar' ? 'إنشاء وحفظ الخط' : 'Create & Save Line'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Line In-App Confirmation Modal */}
      {linePendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {language === 'ar' ? 'تأكيد حذف خط الإنتاج' : 'Confirm Line Deletion'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {language === 'ar' ? 'إجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {language === 'ar'
                ? `هل أنت متأكد من حذف "${linePendingDelete.name}" (موديل: ${linePendingDelete.productModel})؟ سيتم مسح جميع محطات العمل والعمليات المسجلة عليه نهائياً.`
                : `Are you sure you want to delete "${linePendingDelete.name}" (Model: ${linePendingDelete.productModel})? All associated workstations and operations will be permanently removed.`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setLinePendingDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteLine(linePendingDelete.id);
                  setLinePendingDelete(null);
                  setToastMessage({
                    text: language === 'ar' ? 'تم حذف خط الإنتاج بنجاح.' : 'Production line deleted successfully.',
                    type: 'info',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {language === 'ar' ? 'حذف نهائي' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Benchmarks Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-950/50">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {language === 'ar' ? 'استعادة خطوط الإنتاج النموذجية' : 'Restore Default Benchmark Lines'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {language === 'ar' ? 'إعادة ضبط البيانات النموذجية للمصنع' : 'Reset to sample manufacturing data'}
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {language === 'ar'
                ? 'هل تريد استعادة جميع خطوط الإنتاج والموديلات النموذجية الثلاثة المعتمدة هندسياً ومسح الخطوط الحالية؟'
                : 'Do you want to restore the 3 default engineered factory benchmark lines and overwrite current lines?'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToSample();
                  setShowResetModal(false);
                  setToastMessage({
                    text: language === 'ar' ? 'تمت استعادة خطوط الإنتاج النموذجية بنجاح.' : 'Factory benchmark lines restored successfully.',
                    type: 'success',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {language === 'ar' ? 'استعادة البيانات' : 'Restore Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

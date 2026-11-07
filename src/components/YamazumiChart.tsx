import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Operation, OperationType } from '../types/lineBalancing';
import {
  Layers,
  Info,
  Timer,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Maximize2,
  Edit2,
  ArrowRight,
} from 'lucide-react';

const TYPE_COLORS: Record<OperationType, { bg: string; border: string; text: string; labelEn: string; labelAr: string }> = {
  manual: {
    bg: 'bg-blue-500/80 hover:bg-blue-500',
    border: 'border-blue-400',
    text: 'text-blue-100',
    labelEn: 'Manual Work',
    labelAr: 'عمل يدوي',
  },
  machine: {
    bg: 'bg-purple-500/80 hover:bg-purple-500',
    border: 'border-purple-400',
    text: 'text-purple-100',
    labelEn: 'Machine Cycle',
    labelAr: 'تشغيل ماكينة',
  },
  handling: {
    bg: 'bg-amber-500/80 hover:bg-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-100',
    labelEn: 'Material Handling',
    labelAr: 'مناولة وتداول',
  },
  walking: {
    bg: 'bg-teal-500/80 hover:bg-teal-500',
    border: 'border-teal-400',
    text: 'text-teal-100',
    labelEn: 'Operator Walking',
    labelAr: 'حركة ومشية الفني',
  },
  inspection: {
    bg: 'bg-emerald-500/80 hover:bg-emerald-500',
    border: 'border-emerald-400',
    text: 'text-emerald-100',
    labelEn: 'Inspection / Quality',
    labelAr: 'فحص ومراقبة جودة',
  },
  packaging: {
    bg: 'bg-rose-500/80 hover:bg-rose-500',
    border: 'border-rose-400',
    text: 'text-rose-100',
    labelEn: 'Packaging',
    labelAr: 'تغليف وتعبئة',
  },
  automated: {
    bg: 'bg-slate-500/80 hover:bg-slate-500',
    border: 'border-slate-400',
    text: 'text-slate-100',
    labelEn: 'Automated Station',
    labelAr: 'مؤتمت بالكامل',
  },
};

function getOpTotal(op: Operation): number {
  return (
    (op.manualTime || 0) +
    (op.machineTime || 0) +
    (op.automaticTime || 0) +
    (op.walkingTime || 0) +
    (op.handlingTime || 0)
  );
}

export const YamazumiChart: React.FC = () => {
  const {
    line,
    results,
    scenarios,
    selectedStationId,
    setSelectedStationId,
    selectedOperationId,
    setSelectedOperationId,
    setEditingOperation,
    setIsOperationModalOpen,
    setActiveTab,
    language,
    t,
  } = useLineBalancing();

  const [activeScenarioId, setActiveScenarioId] = useState<string>('current');

  // Choose which dataset to display: current or one of the scenarios
  const currentScenario = scenarios.find((s) => s.id === activeScenarioId);
  const activeMetrics = currentScenario ? currentScenario.metrics : results;
  const taktTime = activeMetrics.taktTime;
  const lineCycleTime = activeMetrics.lineCycleTime;

  // Max value for the chart scale (add 20% margin above max)
  const maxScaleSeconds = Math.max(
    lineCycleTime * 1.25,
    taktTime * 1.25,
    60
  );

  const selectedOp = line.operations.find((o) => o.id === selectedOperationId);
  const selectedStation = line.workstations.find((w) => w.id === selectedStationId);

  return (
    <div className="space-y-6">
      {/* Header and Scenario Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <span>{t('yamazumiTitle')}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('yamazumiSubtitle')}
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveScenarioId('current')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeScenarioId === 'current'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t('currentLineAsIs')}
          </button>
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeScenarioId === sc.id
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800 text-xs">
        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-neutral-500 text-[11px] uppercase tracking-wider">
            {language === 'ar' ? 'تصنيف العمليات:' : 'Work Breakdown:'}
          </span>
          {Object.entries(TYPE_COLORS).map(([typeKey, cfg]) => (
            <div key={typeKey} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${cfg.bg} border ${cfg.border}`} />
              <span className="text-neutral-700 dark:text-neutral-300">
                {language === 'ar' ? cfg.labelAr : cfg.labelEn}
              </span>
            </div>
          ))}
        </div>

        {/* Reference Lines Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-4 h-0.5 bg-red-500" />
            <span className="text-red-500 font-semibold">
              {t('taktLine')}: {taktTime.toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-4 h-0.5 bg-amber-400 border-t border-dashed border-amber-500" />
            <span className="text-amber-500 font-semibold">
              {t('cycleTimeLine')}: {lineCycleTime.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Canvas (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto min-h-[460px]">
          <div className="min-w-[700px] h-full flex flex-col justify-end">
            {/* Chart Area with Reference Lines */}
            <div className="relative h-[340px] flex items-end justify-around border-b border-neutral-200 dark:border-neutral-800 pb-2">
              {/* Takt Time Line */}
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center justify-end pr-2"
                style={{ bottom: `${(taktTime / maxScaleSeconds) * 100}%` }}
              >
                <span className="bg-red-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  Takt: {taktTime.toFixed(1)}s
                </span>
              </div>

              {/* Line Cycle Time Line */}
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 z-20 pointer-events-none flex items-center justify-start pl-2"
                style={{ bottom: `${(lineCycleTime / maxScaleSeconds) * 100}%` }}
              >
                <span className="bg-amber-400 text-neutral-900 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  Cycle: {lineCycleTime.toFixed(1)}s
                </span>
              </div>

              {/* Grid Horizontal Guide Lines */}
              {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                <div
                  key={frac}
                  className="absolute left-0 right-0 border-b border-neutral-100 dark:border-neutral-800/60 pointer-events-none flex items-center pl-1 text-[9px] text-neutral-400 font-mono"
                  style={{ bottom: `${frac * 100}%` }}
                >
                  {(maxScaleSeconds * frac).toFixed(0)}s
                </div>
              ))}

              {/* Workstation Columns */}
              {activeMetrics.workstationMetrics.map((wsMetric) => {
                const isSelected = selectedStationId === wsMetric.id;
                const isOverloaded = wsMetric.isOverloaded;
                const isUnderutilized = wsMetric.isUnderutilized;
                const totalHeightPct = (wsMetric.cycleTime / maxScaleSeconds) * 100;

                return (
                  <div
                    key={wsMetric.id}
                    onClick={() => {
                      setSelectedStationId(wsMetric.id);
                    }}
                    className={`flex flex-col items-center group cursor-pointer transition-all relative z-10 w-24 sm:w-28 ${
                      isSelected ? 'scale-105' : ''
                    }`}
                  >
                    {/* Top Total Cycle Badge */}
                    <div className="mb-2 text-center">
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isOverloaded
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : isUnderutilized
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {wsMetric.cycleTime.toFixed(1)}s
                      </span>
                    </div>

                    {/* Stacked Bar Container */}
                    <div
                      className={`w-full rounded-t-xl overflow-hidden flex flex-col-reverse transition-all border-2 ${
                        isOverloaded
                          ? 'border-rose-500 ring-4 ring-rose-500/20'
                          : isSelected
                          ? 'border-blue-500 ring-4 ring-blue-500/20'
                          : 'border-transparent hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                      style={{ height: `${Math.min(100, Math.max(8, totalHeightPct)) * 3.4}px` }}
                    >
                      {wsMetric.operations.map((op) => {
                        const opTime = getOpTotal(op);
                        const blockHeightPct = wsMetric.cycleTime > 0 ? (opTime / wsMetric.cycleTime) * 100 : 0;
                        const colorCfg = TYPE_COLORS[op.type] || TYPE_COLORS.manual;
                        const isOpSelected = selectedOperationId === op.id;

                        return (
                          <div
                            key={op.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOperationId(op.id);
                              setSelectedStationId(wsMetric.id);
                            }}
                            className={`${colorCfg.bg} border-b border-black/20 p-1 flex items-center justify-center relative group/op transition-all ${
                              isOpSelected ? 'ring-2 ring-white z-30' : ''
                            }`}
                            style={{ height: `${Math.max(14, blockHeightPct)}%` }}
                            title={`${op.name} (${opTime.toFixed(1)}s) - ${op.type}`}
                          >
                            <span className="text-[10px] font-semibold text-white truncate max-w-full px-1 drop-shadow-sm">
                              {opTime.toFixed(0)}s {op.name.slice(0, 10)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Station Bottom Labels */}
            <div className="flex items-center justify-around pt-3">
              {activeMetrics.workstationMetrics.map((wsMetric) => (
                <div
                  key={wsMetric.id}
                  onClick={() => setSelectedStationId(wsMetric.id)}
                  className={`w-24 sm:w-28 text-center cursor-pointer p-1.5 rounded-lg transition-all ${
                    selectedStationId === wsMetric.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-500/30'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {wsMetric.name}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {wsMetric.operations.length} {language === 'ar' ? 'عمليات' : 'tasks'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inspector Panel (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-500" />
              <span>{language === 'ar' ? 'تفاصيل المحطة والعملية' : 'Inspection Inspector'}</span>
            </h3>

            {/* If an operation is selected */}
            {selectedOp ? (
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {language === 'ar' ? 'العملية المحددة' : 'Selected Operation'}
                  </span>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                    {selectedOp.name}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">
                    ID: {selectedOp.id}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">
                      {language === 'ar' ? 'الوقت الإجمالي' : 'Total Standard'}
                    </span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      {getOpTotal(selectedOp).toFixed(1)}s
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">
                      {language === 'ar' ? 'النوع' : 'Category'}
                    </span>
                    <span className="font-semibold text-blue-500 capitalize">
                      {selectedOp.type}
                    </span>
                  </div>
                </div>

                {/* Sub-breakdown */}
                <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'يدوي (Manual):' : 'Manual Time:'}</span>
                    <span className="font-mono">{selectedOp.manualTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'ماكينة (Machine):' : 'Machine Time:'}</span>
                    <span className="font-mono">{selectedOp.machineTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'مناولة (Handling):' : 'Handling Time:'}</span>
                    <span className="font-mono">{selectedOp.handlingTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'مشي (Walking):' : 'Walking Time:'}</span>
                    <span className="font-mono">{selectedOp.walkingTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'العمليات السابقة:' : 'Precedences:'}</span>
                    <span className="font-mono">
                      {(selectedOp.precedenceIds || []).length > 0 ? selectedOp.precedenceIds.join(', ') : 'None'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingOperation(selectedOp);
                    setIsOperationModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تعديل زمن وبيانات العملية' : 'Edit Operation Details'}</span>
                </button>
              </div>
            ) : selectedStation ? (
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {language === 'ar' ? 'المحطة المحددة' : 'Selected Workstation'}
                  </span>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                    {selectedStation.name}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">
                    Sequence #{selectedStation.sequence}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{language === 'ar' ? 'أقصى عمالة:' : 'Max Workers:'}</span>
                    <span className="font-bold">{selectedStation.maxOperators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{language === 'ar' ? 'المعدات الثابتة:' : 'Equipment:'}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {(selectedStation.fixedEquipment || []).join(', ') || 'Standard workbench'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-xs text-neutral-400">
                {language === 'ar'
                  ? 'انقر على أي شريط أو عملية في مخطط يامازومي لعرض التفاصيل وتعديلها.'
                  : 'Click on any workstation column or operation bar in the chart to inspect.'}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <button
              onClick={() => setActiveTab('timeStudy')}
              className="w-full py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{language === 'ar' ? 'فتح جدول دراسة الوقت كاملاً' : 'Open Time Study Table'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

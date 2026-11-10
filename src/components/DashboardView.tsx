import React from 'react';
import { useLineBalancing } from '../context/LineContext';
import {
  Gauge,
  Timer,
  Zap,
  TrendingDown,
  Layers,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { line, results, scenarios, setActiveTab, setSelectedStationId, applyScenario, language, t } =
    useLineBalancing();

  const isOverCycle = results.lineCycleTime > results.taktTime;
  const cycleDiff = Math.abs(results.lineCycleTime - results.taktTime);

  return (
    <div className="space-y-6">
      {/* Top Banner / Line Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-neutral-900 to-indigo-950/40 border border-blue-800/30 p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {language === 'ar' ? 'خط التجميع النشط' : 'Active Assembly Line'}
              </span>
              <span className="text-xs text-neutral-400">
                {line.productModel}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {line.name}
            </h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
              {language === 'ar'
                ? 'تحليل توازن خط الإنتاج وتحديد الاختناقات الحرجة وحساب كفاءة المحطات وتوليد سيناريوهات التحسين الرياضي.'
                : 'Assembly line balancing analytics, bottleneck diagnostics, station workload leveling, and operations research optimization.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('yamazumi')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <Sliders className="w-4 h-4" />
              <span>{t('lineBalancing')}</span>
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium text-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('aiOptimization')}</span>
            </button>
          </div>
        </div>

        {/* Bottleneck Alert Banner if overloaded */}
        {isOverCycle && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/40 flex items-center justify-between gap-3 text-rose-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">
                  {language === 'ar' ? 'تنبيه عنق زجاجة حرج!' : 'Critical Bottleneck Alert!'}
                </span>{' '}
                {language === 'ar'
                  ? `زمن دورة الخط (${results.lineCycleTime.toFixed(1)} ث) يتجاوز زمن التاكت المطلوب (${results.taktTime.toFixed(1)} ث) بمقدار ${cycleDiff.toFixed(1)} ثانية. سيحدث عجز في الإنتاج بمقدار ${Math.abs(results.capacityBuffer)} قطعة/وردية.`
                  : `Line cycle time (${results.lineCycleTime.toFixed(1)}s) exceeds Takt time (${results.taktTime.toFixed(1)}s) by ${cycleDiff.toFixed(1)}s. Shift shortfall: ${Math.abs(results.capacityBuffer)} units.`}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('scenarios')}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors"
            >
              {language === 'ar' ? 'حل بالذكاء الاصطناعي' : 'Optimize Now'}
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Takt Time Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('taktTime')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
              {results.taktTime.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {language === 'ar' ? 'ثانية/قطعة' : 'sec/unit'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-1">
            {t('taktTimeDesc')}
          </p>
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <span>{language === 'ar' ? 'طلب الوردية:' : 'Demand:'}</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {line.customerDemand} {language === 'ar' ? 'قطعة' : 'units'}
            </span>
          </div>
        </div>

        {/* Line Cycle Time Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('lineCycleTime')}
            </span>
            <div className={`p-2 rounded-xl ${isOverCycle ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'}`}>
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
              {results.lineCycleTime.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {language === 'ar' ? 'ثانية' : 'seconds'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {isOverCycle ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                +{cycleDiff.toFixed(1)}s {language === 'ar' ? 'فوق التاكت' : 'over takt'}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {cycleDiff.toFixed(1)}s {language === 'ar' ? 'هامش أمان متاح' : 'buffer under takt'}
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <span>{language === 'ar' ? 'المحطة المحددة:' : 'Paced By:'}</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {line.workstations.find((ws) => ws.id === results.bottlenecks[0])?.name || results.bottlenecks[0]}
            </span>
          </div>
        </div>

        {/* Line Balancing Efficiency Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('lineEfficiency')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
              {results.lineEfficiency.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${results.lineEfficiency > 85 ? 'bg-emerald-500' : results.lineEfficiency > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, results.lineEfficiency)}%` }}
            />
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <span>{t('balanceDelay')}:</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {results.balanceDelay.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Shift Production Capacity Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('shiftCapacity')}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
              {results.shiftCapacity}
            </span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {language === 'ar' ? 'قطعة/وردية' : 'units/shift'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-neutral-500 font-mono">
              {results.hourlyCapacity.toFixed(1)} {language === 'ar' ? 'قطعة في الساعة' : 'units/hour'}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold" title={language === 'ar' ? 'معادلة الطاقة الإنتاجية للوردية = زمن الوردية المتاح ÷ زمن أعلى محطة' : 'Formula: Net Shift Time / Bottleneck CT'}>
              {language === 'ar' ? '(المتاح ÷ الاختناق)' : '(Net ÷ Bottleneck)'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <span>{language === 'ar' ? 'فارق الطلب:' : 'Demand Gap:'}</span>
            <span className={`font-semibold ${results.capacityBuffer >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {results.capacityBuffer >= 0 ? `+${results.capacityBuffer}` : results.capacityBuffer} {language === 'ar' ? 'قطعة' : 'units'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Workstation Workload Overview & Bottleneck Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workstations Quick Progress Bars (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>{language === 'ar' ? 'تشخيص أحمال محطات العمل' : 'Workstations Workload Diagnostic'}</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {language === 'ar'
                  ? 'مقارنة زمن دورة كل محطة مقابل زمن التاكت المستهدف (Takt Time)'
                  : 'Cycle time of each station compared against target Takt Time'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('yamazumi')}
              className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'عرض مخطط يامازومي الكامل' : 'Open Full Yamazumi'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="space-y-3.5">
            {results.workstationMetrics.map((ws) => {
              const pctOfTakt = (ws.cycleTime / results.taktTime) * 100;
              const isBottleneck = ws.isBottleneck;
              const isOver = ws.cycleTime > results.taktTime;

              return (
                <div
                  key={ws.id}
                  onClick={() => {
                    setSelectedStationId(ws.id);
                    setActiveTab('yamazumi');
                  }}
                  className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-[10px] font-bold">
                        {ws.sequence}
                      </span>
                      <span className="text-neutral-900 dark:text-white font-semibold">
                        {ws.name}
                      </span>
                      {isBottleneck && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          {language === 'ar' ? 'عنق زجاجة' : 'Bottleneck'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-400">
                        {ws.operations.length} {language === 'ar' ? 'عمليات' : 'ops'}
                      </span>
                      <span className={`font-mono font-bold ${isOver ? 'text-rose-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {ws.cycleTime.toFixed(1)}s / {pctOfTakt.toFixed(0)}% Takt
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                    {/* Takt Line Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${Math.min(95, (results.taktTime / Math.max(results.lineCycleTime, results.taktTime * 1.1)) * 100)}%` }}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-rose-500' : ws.isUnderutilized ? 'bg-amber-400' : 'bg-blue-500'}`}
                      style={{
                        width: `${Math.min(100, (ws.cycleTime / Math.max(results.lineCycleTime, results.taktTime * 1.1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Engineering Summary Card (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{language === 'ar' ? 'ملخص الفاقد والفرص' : 'Waste & Lean Opportunities'}</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {language === 'ar'
                ? 'تقديرات الوقت الضائع وفرص التحسين الممكنة'
                : 'Quantified idle time and lean Kaizen potentials'}
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('theoreticalMinStations')}
                </div>
                <div className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                  {results.theoreticalMinStations}{' '}
                  <span className="text-xs font-normal text-neutral-500">
                    ({language === 'ar' ? `الحالي: ${results.actualStations} محطة` : `Current: ${results.actualStations}`})
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('idleTimePerCycle')}
                </div>
                <div className="text-xl font-bold text-amber-500 mt-0.5">
                  {results.totalIdleTimePerCycle.toFixed(1)} {language === 'ar' ? 'ثانية/دورة' : 's/cycle'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('idleTimePerShift')}
                </div>
                <div className="text-xl font-bold text-rose-500 mt-0.5">
                  {results.totalIdleTimePerShift.toFixed(1)} {language === 'ar' ? 'ساعة عمل مهدورة' : 'hours/shift'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab('report')}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{t('printReport')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Optimization Scenarios Quick Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{language === 'ar' ? 'سيناريوهات التحسين الرياضي المقترحة' : 'Algorithmic Optimization Scenarios'}</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {language === 'ar'
                ? 'حلول محاكاة خاضعة لقيود التتابع والتثبيت ومصفوفة مهارات العمال'
                : 'Validated constraint-programming solutions ready to apply'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('scenarios')}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-400"
          >
            {language === 'ar' ? 'مقارنة تفصيلية لجميع السيناريوهات ←' : 'Compare Scenarios Matrix →'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {sc.algorithmUsed}
                  </span>
                  <span className="text-xs font-semibold text-emerald-500">
                    {sc.metrics.lineEfficiency.toFixed(1)}% {language === 'ar' ? 'كفاءة' : 'Eff'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {sc.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {sc.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">{language === 'ar' ? 'زمن الدورة' : 'Cycle Time'}</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {sc.metrics.lineCycleTime.toFixed(1)}s
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400 text-[10px] block">{language === 'ar' ? 'طاقة الوردية' : 'Shift Output'}</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {sc.metrics.shiftCapacity} {language === 'ar' ? 'قطعة' : 'u'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                  {sc.transfers.length} {language === 'ar' ? 'عملية مقترح نقلها' : 'reallocations recommended'}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    applyScenario(sc.id);
                    setActiveTab('yamazumi');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors text-center"
                >
                  {language === 'ar' ? 'تطبيق هذا السيناريو' : 'Apply Scenario'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

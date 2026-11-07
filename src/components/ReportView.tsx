import React from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Printer, FileText, CheckCircle2, ShieldCheck, Layers, Gauge, Timer } from 'lucide-react';

export const ReportView: React.FC = () => {
  const { line, results, scenarios, language, t } = useLineBalancing();

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header (Hidden on print) */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 print:hidden">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>{t('reportTitle')}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('reportSubtitle')}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>{t('printReport')}</span>
        </button>
      </div>

      {/* Printable Formal Document Canvas */}
      <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-md space-y-8 font-sans print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-neutral-900 dark:border-neutral-100 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 block mb-1">
                INDUSTRIAL ENGINEERING & OPERATIONS RESEARCH REPORT
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {language === 'ar' ? 'تقرير التقييم والتوازن الهندسي لخط التجميع' : 'Assembly Line Balancing Technical Audit'}
              </h1>
              <p className="text-sm font-semibold text-neutral-500 mt-1">
                {line.name} — Model: {line.productModel}
              </p>
            </div>
            <div className="text-right text-xs font-mono text-neutral-500">
              <div>{t('auditDate')}: {currentDate}</div>
              <div className="text-emerald-600 font-bold mt-1">
                {t('engineeringStatus')}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Parameters */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-1">
            {t('sec1Parameters')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-500 block">{t('taktTime')}</span>
              <span className="text-lg font-mono font-bold">{results.taktTime.toFixed(1)}s</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-500 block">{t('lineCycleTime')}</span>
              <span className="text-lg font-mono font-bold">{results.lineCycleTime.toFixed(1)}s</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-500 block">{t('lineEfficiency')}</span>
              <span className="text-lg font-mono font-bold">{results.lineEfficiency.toFixed(1)}%</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-500 block">{t('balanceDelay')}</span>
              <span className="text-lg font-mono font-bold">{results.balanceDelay.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Section 2: Mathematical Formulations */}
        <div className="space-y-3 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-1">
            {t('sec2Formulas')}
          </h2>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono space-y-2 text-[11px] leading-relaxed">
            <div>
              <span className="text-blue-500 font-bold">A. Takt Time:</span> T_takt = Net Available Time / Customer Demand = {Math.round(results.netAvailableTime)}s / {line.customerDemand} = <span className="font-bold">{results.taktTime.toFixed(2)}s</span>
            </div>
            <div>
              <span className="text-blue-500 font-bold">B. Line Balancing Efficiency:</span> Eff = (Total Work Content / (Stations × Line Cycle Time)) × 100 = ({results.totalWorkContent.toFixed(1)} / ({line.workstations.length} × {results.lineCycleTime.toFixed(1)})) × 100 = <span className="font-bold">{results.lineEfficiency.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-blue-500 font-bold">C. Balance Delay:</span> d = 100% - Line Efficiency = 100% - {results.lineEfficiency.toFixed(1)}% = <span className="font-bold">{results.balanceDelay.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-blue-500 font-bold">D. Theoretical Minimum Workstations:</span> N_min = ceil(Total Work Content / Takt Time) = ceil({results.totalWorkContent.toFixed(1)} / {results.taktTime.toFixed(1)}) = <span className="font-bold">{results.theoreticalMinStations} stations</span>
            </div>
          </div>
        </div>

        {/* Section 3: Workstations Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-1">
            {t('sec3Workloads')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-neutral-200 dark:border-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-950">
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">{language === 'ar' ? 'المحطة' : 'Station'}</th>
                  <th className="py-2 px-3 text-right">{language === 'ar' ? 'دورة المحطة' : 'Cycle Time'}</th>
                  <th className="py-2 px-3 text-right">{language === 'ar' ? 'وقت الانتظار' : 'Idle Time'}</th>
                  <th className="py-2 px-3 text-right">{language === 'ar' ? 'نسبة الاستغلال' : 'Utilization'}</th>
                  <th className="py-2 px-3">{language === 'ar' ? 'التشخيص' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {results.workstationMetrics.map((ws) => (
                  <tr key={ws.id}>
                    <td className="py-2 px-3 font-bold">{ws.sequence}</td>
                    <td className="py-2 px-3 font-sans font-medium">{ws.name}</td>
                    <td className="py-2 px-3 text-right font-bold">{ws.cycleTime.toFixed(1)}s</td>
                    <td className="py-2 px-3 text-right">{ws.idleTime.toFixed(1)}s</td>
                    <td className="py-2 px-3 text-right">{ws.utilization.toFixed(1)}%</td>
                    <td className="py-2 px-3 font-sans">
                      {ws.isBottleneck ? (
                        <span className="text-rose-600 font-bold">Bottleneck / عنق زجاجة</span>
                      ) : ws.isUnderutilized ? (
                        <span className="text-amber-500">Underutilized / غير مستغلة</span>
                      ) : (
                        <span className="text-emerald-600">Balanced / متزنة</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Optimization Scenarios */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-1">
            {t('sec4Scenarios')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2"
              >
                <div className="font-bold text-neutral-900 dark:text-white">{sc.title}</div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Cycle: {sc.metrics.lineCycleTime.toFixed(1)}s | Eff: {sc.metrics.lineEfficiency.toFixed(1)}%
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  {sc.advantages[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Kaizen Action Roadmap */}
        <div className="space-y-3 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-1">
            {t('sec5Kaizen')}
          </h2>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="font-bold text-blue-600 block mb-0.5">{t('phase1')}</span>
              <p className="text-neutral-600 dark:text-neutral-400">
                {language === 'ar'
                  ? 'تنفيذ سيناريو أ (Leveling) وإعادة توزيع العمليات بدون تكاليف رأسمالية، وتدريب المشغلين على المهام المنقولة.'
                  : 'Execute Scenario A task reallocations with zero CapEx; initiate cross-training on shifted operations.'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="font-bold text-indigo-600 block mb-0.5">{t('phase2')}</span>
              <p className="text-neutral-600 dark:text-neutral-400">
                {language === 'ar'
                  ? 'تطبيق دراسة الحركة ومبادئ 5S لتقليص أوقات المشي والمناولة في محطة عنق الزجاجة.'
                  : 'Deploy SMED and motion study to eliminate non-value-added walking and tool retrieval at bottleneck.'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="font-bold text-emerald-600 block mb-0.5">{t('phase3')}</span>
              <p className="text-neutral-600 dark:text-neutral-400">
                {language === 'ar'
                  ? 'رفع مرونة العمالة لتشغيل محطات متعددة وقت ذروة الطلب.'
                  : 'Multi-skill workforce certification to enable agile floating operator assignments.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sign-off Blocks */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="text-neutral-500 mb-8">{t('signoffEngineer')}</div>
            <div className="border-b border-neutral-400 w-48 mb-1" />
            <div className="font-mono text-neutral-400">Lead IE Engineer, PE / Lean Six Sigma Black Belt</div>
          </div>
          <div>
            <div className="text-neutral-500 mb-8">{t('signoffDirector')}</div>
            <div className="border-b border-neutral-400 w-48 mb-1" />
            <div className="font-mono text-neutral-400">Operations & Plant Manufacturing Director</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Split,
  Combine,
  Sliders,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Zap,
} from 'lucide-react';

export const ScenarioComparisonView: React.FC = () => {
  const { line, results, scenarios, applyScenario, setActiveTab, language, t } =
    useLineBalancing();

  const [activeTabScenario, setActiveTabScenario] = useState<string>('scenario-a');

  const selectedScenario = scenarios.find((s) => s.id === activeTabScenario) || scenarios[0];

  const handleApply = (scId: string) => {
    if (
      confirm(
        language === 'ar'
          ? `هل أنت متأكد من تطبيق هذا السيناريو على خط الإنتاج الفعلي؟ سيتم إعادة توزيع العمليات بين المحطات.`
          : `Apply this scenario to your live production line? Tasks will be reallocated across workstations.`
      )
    ) {
      applyScenario(scId);
      setActiveTab('yamazumi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>{t('optimizationMatrixTitle')}</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t('optimizationMatrixSubtitle')}
        </p>
      </div>

      {/* KPI Comparison Matrix Table */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {language === 'ar' ? 'مصفوفة المقارنة الهندسية الشاملة' : 'Side-by-Side Performance Matrix'}
          </span>
          <span className="text-xs text-neutral-400">
            {language === 'ar' ? `زمن التاكت المستهدف: ${results.taktTime.toFixed(1)} ثانية` : `Target Takt: ${results.taktTime.toFixed(1)}s`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100/60 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-3 px-4 min-w-[200px]">{language === 'ar' ? 'المؤشر الهندسي (KPI)' : 'Engineering KPI'}</th>
                <th className="py-3 px-4 min-w-[140px] text-center font-bold text-neutral-900 dark:text-white bg-blue-50/50 dark:bg-blue-950/20">
                  {language === 'ar' ? 'الوضع الحالي الفعلي (Baseline)' : 'Current As-Is Baseline'}
                </th>
                <th className="py-3 px-4 min-w-[140px] text-center font-bold text-indigo-600 dark:text-indigo-400">
                  {language === 'ar' ? 'سيناريو أ: تسوية الأحمال' : 'Scenario A: Leveling'}
                </th>
                <th className="py-3 px-4 min-w-[140px] text-center font-bold text-emerald-600 dark:text-emerald-400">
                  {language === 'ar' ? 'سيناريو ب: تقليص العمالة' : 'Scenario B: Lean Headcount'}
                </th>
                <th className="py-3 px-4 min-w-[140px] text-center font-bold text-purple-600 dark:text-purple-400">
                  {language === 'ar' ? 'سيناريو ج: أقصى طاقة' : 'Scenario C: Max Capacity'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono">
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-neutral-700 dark:text-neutral-300">
                  {t('lineCycleTime')}
                </td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 dark:bg-blue-950/10">
                  {results.lineCycleTime.toFixed(1)}s
                </td>
                <td className="py-3 px-4 text-center text-indigo-500 font-bold">
                  {scenarios[0]?.metrics.lineCycleTime.toFixed(1)}s
                </td>
                <td className="py-3 px-4 text-center text-emerald-500 font-bold">
                  {scenarios[1]?.metrics.lineCycleTime.toFixed(1)}s
                </td>
                <td className="py-3 px-4 text-center text-purple-500 font-bold">
                  {scenarios[2]?.metrics.lineCycleTime.toFixed(1)}s
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-sans font-medium text-neutral-700 dark:text-neutral-300">
                  {t('lineEfficiency')}
                </td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 dark:bg-blue-950/10">
                  {results.lineEfficiency.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-indigo-500 font-bold">
                  {scenarios[0]?.metrics.lineEfficiency.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-emerald-500 font-bold">
                  {scenarios[1]?.metrics.lineEfficiency.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-purple-500 font-bold">
                  {scenarios[2]?.metrics.lineEfficiency.toFixed(1)}%
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-sans font-medium text-neutral-700 dark:text-neutral-300">
                  {t('balanceDelay')}
                </td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 dark:bg-blue-950/10 text-rose-500">
                  {results.balanceDelay.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-indigo-500">
                  {scenarios[0]?.metrics.balanceDelay.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-emerald-500">
                  {scenarios[1]?.metrics.balanceDelay.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center text-purple-500">
                  {scenarios[2]?.metrics.balanceDelay.toFixed(1)}%
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-sans font-medium text-neutral-700 dark:text-neutral-300">
                  {t('actualStations')}
                </td>
                <td className="py-3 px-4 text-center bg-blue-50/30 dark:bg-blue-950/10">
                  {line.workstations.length}
                </td>
                <td className="py-3 px-4 text-center">
                  {scenarios[0]?.assignments.length}
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-500">
                  {scenarios[1]?.assignments.length} ({language === 'ar' ? 'وفر محطة' : '-1 station'})
                </td>
                <td className="py-3 px-4 text-center">
                  {scenarios[2]?.assignments.length}
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-sans font-medium text-neutral-700 dark:text-neutral-300">
                  {t('shiftCapacity')}
                </td>
                <td className="py-3 px-4 text-center bg-blue-50/30 dark:bg-blue-950/10">
                  {results.shiftCapacity} {language === 'ar' ? 'قطعة' : 'u'}
                </td>
                <td className="py-3 px-4 text-center">
                  {scenarios[0]?.metrics.shiftCapacity} {language === 'ar' ? 'قطعة' : 'u'}
                </td>
                <td className="py-3 px-4 text-center">
                  {scenarios[1]?.metrics.shiftCapacity} {language === 'ar' ? 'قطعة' : 'u'}
                </td>
                <td className="py-3 px-4 text-center font-bold text-purple-500">
                  {scenarios[2]?.metrics.shiftCapacity} {language === 'ar' ? 'قطعة (+زيادة)' : 'u (Surge)'}
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-sans font-medium text-neutral-700 dark:text-neutral-300">
                  {t('idleTimePerShift')}
                </td>
                <td className="py-3 px-4 text-center bg-blue-50/30 dark:bg-blue-950/10 text-rose-500">
                  {results.totalIdleTimePerShift.toFixed(1)}h
                </td>
                <td className="py-3 px-4 text-center">
                  {scenarios[0]?.metrics.totalIdleTimePerShift.toFixed(1)}h
                </td>
                <td className="py-3 px-4 text-center text-emerald-500 font-bold">
                  {scenarios[1]?.metrics.totalIdleTimePerShift.toFixed(1)}h
                </td>
                <td className="py-3 px-4 text-center">
                  {scenarios[2]?.metrics.totalIdleTimePerShift.toFixed(1)}h
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Deep Dive Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveTabScenario(sc.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTabScenario === sc.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>

        {/* Selected Scenario Details Card */}
        {selectedScenario && (
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedScenario.algorithmUsed}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-2">
                  {selectedScenario.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
                  {selectedScenario.description}
                </p>
              </div>

              <button
                onClick={() => handleApply(selectedScenario.id)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20 shrink-0 self-start sm:self-auto"
              >
                {t('applyScenario')}
              </button>
            </div>

            {/* Advantages and Disadvantages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{t('advantages')}</span>
                </span>
                <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                  {selectedScenario.advantages.map((adv, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500">✓</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
                <span className="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <ThumbsDown className="w-4 h-4" />
                  <span>{t('disadvantages')}</span>
                </span>
                <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                  {selectedScenario.disadvantages.map((dis, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Task Transfers Log */}
            {selectedScenario.transfers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                  {t('transfersRequired')} ({selectedScenario.transfers.length}):
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedScenario.transfers.map((tr, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {tr.operationName}
                        </span>
                        <span className="font-mono text-neutral-400">({tr.durationSeconds}s)</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                        <span>{tr.fromStationId}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {tr.toStationId}
                        </span>
                        <span className="italic text-neutral-400">({tr.reason})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Split Operations (if any) */}
            {selectedScenario.splitOperations.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20 space-y-2 text-xs">
                <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Split className="w-4 h-4" />
                  <span>{t('splitTasks')}</span>
                </span>
                {selectedScenario.splitOperations.map((sp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-semibold">{sp.operationName} (Original: {sp.originalTime}s)</div>
                    <div className="text-neutral-500">{sp.rationale}</div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {sp.splitParts.map((part, pIdx) => (
                        <div key={pIdx} className="p-2 rounded bg-white dark:bg-neutral-900 text-[11px]">
                          {part.name}: {part.time}s @ {part.stationId}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Algorithmic Formulation */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-xs space-y-1">
              <span className="font-bold text-neutral-500 block uppercase tracking-wider text-[10px]">
                {t('engineeringJustification')}
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono text-[11px]">
                {selectedScenario.engineeringJustification}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

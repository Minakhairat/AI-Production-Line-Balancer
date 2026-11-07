import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { SAMPLE_LINES } from '../services/sampleData';
import {
  Factory,
  Sliders,
  CheckCircle2,
  Timer,
  Clock,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const ProductionLinesView: React.FC = () => {
  const { line, results, updateLine, switchLinePreset, resetToSample, language, t } =
    useLineBalancing();

  const [formName, setFormName] = useState(line.name);
  const [formModel, setFormModel] = useState(line.productModel);
  const [formDemand, setFormDemand] = useState(line.customerDemand);
  const [formShiftHours, setFormShiftHours] = useState(line.shiftDurationHours);
  const [formBreaks, setFormBreaks] = useState(line.breakTimeMinutes);
  const [formDowntime, setFormDowntime] = useState(line.plannedDowntimeMinutes);
  const [formOEE, setFormOEE] = useState(line.oeeTarget);

  const handleUpdate = (e: React.FormEvent) => {
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
    alert(
      language === 'ar'
        ? 'تم تحديث معايير خط الإنتاج بنجاح وإعادة حساب زمن التاكت!'
        : 'Line parameters updated and Takt Time recalculated!'
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-500" />
            <span>{t('linesTitle')}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('linesSubtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm(language === 'ar' ? 'استعادة خط الإنتاج النموذجي للمصنع؟' : 'Reset to sample line?')) {
              resetToSample();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('resetDatabase')}</span>
        </button>
      </div>

      {/* Preset Lines Switcher Cards */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
          {language === 'ar' ? 'النماذج الصناعية الجاهزة في قاعدة البيانات:' : 'Available Industrial Benchmark Models:'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_LINES.map((preset) => {
            const isCurrent = line.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => switchLinePreset(preset.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      {preset.productModel}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                        <CheckCircle2 className="w-3 h-3" />
                        {language === 'ar' ? 'النشط حالياً' : 'Active'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {preset.name}
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-500 font-mono">
                    <div>
                      {preset.workstations.length} {language === 'ar' ? 'محطات' : 'stations'}
                    </div>
                    <div>
                      {preset.operations.length} {language === 'ar' ? 'عمليات' : 'tasks'}
                    </div>
                    <div>
                      {preset.customerDemand} {language === 'ar' ? 'قطعة/وردية' : 'u/shift'}
                    </div>
                    <div>
                      {preset.shiftDurationHours}h {language === 'ar' ? 'وردية' : 'shift'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                  <span className="text-xs font-semibold text-blue-500">
                    {isCurrent
                      ? (language === 'ar' ? 'قيد المعاينة الآن' : 'Currently Loaded')
                      : (language === 'ar' ? 'تحميل هذا الخط ←' : 'Load Line Model →')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Line Calibration Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
          {t('activeLineParams')}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
          {language === 'ar'
            ? 'تعديل ساعات العمل وأوقات الراحة والطلب المستهدف لإعادة معايرة زمن التاكت فورياً'
            : 'Calibrate shift operating constraints, breaks, and customer requirements'}
        </p>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {t('lineNameLabel')}
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {t('productModelLabel')}
              </label>
              <input
                type="text"
                required
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {t('demandLabel')}
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
                {t('shiftHoursLabel')}
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
                {t('breaksLabel')}
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
                {t('downtimeLabel')}
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              {t('updateLineParams')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

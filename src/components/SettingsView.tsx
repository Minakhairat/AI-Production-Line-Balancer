import React, { useRef, useState, useEffect } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Settings, Languages, Moon, Sun, RotateCcw, Download, Upload, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    resetToSampleData,
    lines,
    exportDatabase,
    importDatabase,
    t,
  } = useLineBalancing();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  useEffect(() => {
    if (importStatus) {
      const timer = setTimeout(() => setImportStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [importStatus]);

  const handleExportAllJSON = () => {
    exportDatabase();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        // Support both direct array of lines and wrapped export object { lines: [...] }
        const linesArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.lines)
          ? parsed.lines
          : null;

        if (linesArray && linesArray.length > 0 && linesArray[0].workstations && linesArray[0].operations) {
          importDatabase(linesArray);
          setImportStatus({
            type: 'success',
            message:
              language === 'ar'
                ? `تم استيراد ${linesArray.length} خط إنتاج وموديلات بنجاح وحفظها محلياً!`
                : `Successfully imported ${linesArray.length} production line models and saved locally!`,
          });
        } else {
          setImportStatus({
            type: 'error',
            message:
              language === 'ar'
                ? 'صيغة ملف النسخ الاحتياطي غير صالحة. تأكد من احتواء الملف على محطات العمل والعمليات.'
                : 'Invalid backup file format. Ensure the file contains workstations and operations.',
          });
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `${language === 'ar' ? 'فشل استيراد النسخة الاحتياطية' : 'Failed to parse backup'}: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Import Status Alert Banner */}
      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs ${
            importStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="p-0.5 hover:opacity-80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Settings className="w-4 h-4 text-neutral-500" />
          <span>{t('settingsTitle')}</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-6">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          {t('uiPreferences')}
        </h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 block">
              {t('appLangLabel')}
            </span>
            <span className="text-xs text-neutral-500">
              {language === 'ar'
                ? 'التبديل بين العربية الفصحى مع دعم اتجاه RTL والإنجليزية الهندسية'
                : 'Select technical English or standard Arabic with right-to-left (RTL) typography'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                language === 'ar'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              العربية (RTL)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 block">
              {t('themeModeLabel')}
            </span>
            <span className="text-xs text-neutral-500">
              {language === 'ar' ? 'التبديل بين الوضع الداكن والوضع الفاتح للمصانع' : 'Toggle between high-contrast dark industrial mode and clean white workspace'}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors text-neutral-800 dark:text-neutral-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? (language === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (language === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}</span>
          </button>
        </div>
      </div>

      {/* Database & State Backups */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-6">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          {t('dataManagement')}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 block">
              {t('backupSystem')}
            </span>
            <span className="text-xs text-neutral-500">
              {t('backupDesc')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('importBackup')}</span>
            </button>
            <button
              onClick={handleExportAllJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('exportJSON')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="font-medium text-xs text-rose-600 block">
              {t('resetDatabase')}
            </span>
            <span className="text-xs text-neutral-500">
              {t('resetNotice')}
            </span>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetDatabase')}</span>
          </button>
        </div>
      </div>

      {/* System Specifications & Release Info */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800 pb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>{language === 'ar' ? 'معلومات المنظومة والترخيص' : 'System Information & Specifications'}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">
            IE 4.0 Suite v2.4
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800 text-xs">
          <div>
            <div className="text-neutral-500 mb-0.5 font-medium">
              {language === 'ar' ? 'المحرك الهندسي والتحسين الرياضي:' : 'Engineering Calculation & Optimization Engine:'}
            </div>
            <div className="font-semibold text-neutral-900 dark:text-white">
              AI Production Line Balancer Engine
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {language === 'ar'
                ? 'متوافق مع معايير الهندسة الصناعية (Helgeson-Birnie RPW, LCR, Heuristics)'
                : 'Compliant with IE Standards (RPW, LCR, and Heuristic Line Balancing)'}
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-neutral-500 mb-0.5 font-medium">
              {language === 'ar' ? 'نمط النشر والتشغيل:' : 'Deployment Environment:'}
            </div>
            <div className="font-mono text-neutral-900 dark:text-white">
              GitHub Pages / Cloud Ready
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {language === 'ar' ? 'تشغيل ذاتي بالكامل وتصدير Excel/CSV و PDF' : 'Fully Standalone Client-Side Execution with Excel/CSV & PDF Export'}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/50">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {language === 'ar' ? 'تأكيد استعادة بيانات المصنع' : 'Confirm Factory Reset'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {language === 'ar' ? 'سيتم مسح التعديلات واستعادة النماذج القياسية' : 'Restores default sample lines'}
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {language === 'ar'
                ? 'هل تريد استعادة جميع بيانات المصنع الافتراضية؟ سيتم استبدال الخطوط الحالية بالنماذج القياسية الثلاثة.'
                : 'Reset all production lines to initial sample datasets? Current custom modifications will be replaced with benchmark datasets.'}
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
                  resetToSampleData();
                  setShowResetModal(false);
                  setImportStatus({
                    type: 'success',
                    message: language === 'ar' ? 'تمت استعادة البيانات الافتراضية بنجاح.' : 'Factory benchmark lines restored successfully.',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {language === 'ar' ? 'استعادة البيانات' : 'Reset Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

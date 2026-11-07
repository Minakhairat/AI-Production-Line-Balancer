import React, { useRef } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Operation } from '../types/lineBalancing';
import { exportToExcel, exportOperationsToCSV, parseImportFile } from '../services/excelService';
import {
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

function getOpTotal(op: Operation): number {
  return (
    (op.manualTime || 0) +
    (op.machineTime || 0) +
    (op.automaticTime || 0) +
    (op.walkingTime || 0) +
    (op.handlingTime || 0)
  );
}

export const TimeStudyTable: React.FC = () => {
  const {
    line,
    results,
    updateLine,
    deleteOperation,
    setEditingOperation,
    setIsOperationModalOpen,
    language,
    t,
  } = useLineBalancing();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    exportToExcel({ line, results }, `${line.name.replace(/\s+/g, '_')}_Line_Balancing.xlsx`);
  };

  const handleExportCSV = () => {
    exportOperationsToCSV(line.operations, `${line.name.replace(/\s+/g, '_')}_Operations.csv`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseImportFile(file);
      if (parsed.operations && parsed.operations.length > 0) {
        updateLine({
          operations: parsed.operations,
          workstations: parsed.workstations && parsed.workstations.length > 0 ? parsed.workstations : line.workstations,
        });
        alert(
          language === 'ar'
            ? `تم استيراد ${parsed.operations.length} عملية بنجاح!`
            : `Successfully imported ${parsed.operations.length} operations!`
        );
      }
    } catch (err: any) {
      alert(
        language === 'ar'
          ? `فشل استيراد الملف: ${err.message}`
          : `Failed to import file: ${err.message}`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Header and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>{t('timeStudy')}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'جدول دراسة الوقت والحركة (Standard Work Combination Sheet) مع تقسيم العمليات اليدوية والآلية'
              : 'Detailed operational standard times, operator allocations, and precedence dependencies'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'استيراد Excel / CSV' : 'Import Excel/CSV'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium text-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t('exportExcel')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportCSV')}</span>
          </button>

          <button
            onClick={() => {
              setEditingOperation(null);
              setIsOperationModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة عملية جديدة' : 'Add Operation'}</span>
          </button>
        </div>
      </div>

      {/* Validation Banner if errors exist */}
      {results.validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs space-y-1.5">
          <div className="font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{language === 'ar' ? 'ملاحظات التحقق الهندسي وتوافق البيانات:' : 'Engineering Validation Notice:'}</span>
          </div>
          {results.validationErrors.map((err, i) => (
            <div key={i} className="pl-6">
              • {err.message}
            </div>
          ))}
        </div>
      )}

      {/* Operations Spreadsheet Table */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold">
                <th className="py-3 px-3 w-16">ID</th>
                <th className="py-3 px-3 min-w-[180px]">{language === 'ar' ? 'اسم العملية (Name)' : 'Operation Name'}</th>
                <th className="py-3 px-3">{language === 'ar' ? 'المحطة (Station)' : 'Station'}</th>
                <th className="py-3 px-3 text-right">{language === 'ar' ? 'يدوي (Manual)' : 'Manual (s)'}</th>
                <th className="py-3 px-3 text-right">{language === 'ar' ? 'ماكينة (Machine)' : 'Machine (s)'}</th>
                <th className="py-3 px-3 text-right">{language === 'ar' ? 'مناولة (Handling)' : 'Handling (s)'}</th>
                <th className="py-3 px-3 text-right">{language === 'ar' ? 'مشي (Walking)' : 'Walking (s)'}</th>
                <th className="py-3 px-3 text-right font-bold text-neutral-900 dark:text-white">{language === 'ar' ? 'الإجمالي (Total)' : 'Total (s)'}</th>
                <th className="py-3 px-3">{language === 'ar' ? 'النوع (Type)' : 'Type'}</th>
                <th className="py-3 px-3">{language === 'ar' ? 'الاعتماديات السابقة' : 'Precedence'}</th>
                <th className="py-3 px-3 text-center">{language === 'ar' ? 'تجزئة؟' : 'Split?'}</th>
                <th className="py-3 px-3 text-center">{language === 'ar' ? 'دمج؟' : 'Combine?'}</th>
                <th className="py-3 px-3 text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono">
              {line.operations.map((op) => {
                const totalTime = getOpTotal(op);
                const station = line.workstations.find((ws) => ws.id === op.stationId);

                return (
                  <tr
                    key={op.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="py-3 px-3 text-neutral-400 font-bold text-[11px]">{op.id}</td>
                    <td className="py-3 px-3 font-sans font-medium text-neutral-900 dark:text-white">
                      {op.name}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {station?.name || op.stationId}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
                      {op.manualTime}s
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-purple-600 dark:text-purple-400">
                      {op.machineTime}s
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-amber-600 dark:text-amber-400">
                      {op.handlingTime}s
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-teal-600 dark:text-teal-400">
                      {op.walkingTime}s
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-900 dark:text-white tabular-nums">
                      {totalTime.toFixed(1)}s
                    </td>
                    <td className="py-3 px-3 font-sans capitalize text-neutral-500">
                      {op.type}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-neutral-400">
                      {(op.precedenceIds || []).length > 0 ? op.precedenceIds.join(', ') : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {op.canBeSplit ? (
                        <span className="text-emerald-500 font-semibold text-[11px]">✓</span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {op.canBeCombined ? (
                        <span className="text-emerald-500 font-semibold text-[11px]">✓</span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditingOperation(op);
                            setIsOperationModalOpen(true);
                          }}
                          className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(language === 'ar' ? `هل أنت متأكد من حذف ${op.name}؟` : `Delete operation ${op.name}?`)) {
                              deleteOperation(op.id);
                            }
                          }}
                          className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Work Content Sum */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2">
          <div>
            {language === 'ar' ? 'إجمالي عدد العمليات:' : 'Total Operations:'}{' '}
            <span className="font-bold text-neutral-900 dark:text-white">{line.operations.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              {t('totalWorkContent')}:{' '}
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {results.totalWorkContent.toFixed(1)} {language === 'ar' ? 'ثانية' : 'sec'}
              </span>
            </div>
            <div>
              {t('taktTime')}:{' '}
              <span className="font-mono font-bold text-red-500">
                {results.taktTime.toFixed(1)} {language === 'ar' ? 'ثانية' : 'sec'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

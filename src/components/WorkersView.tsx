import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Operator } from '../types/lineBalancing';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Award,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const WorkersView: React.FC = () => {
  const { line, results, addOperator, updateOperator, deleteOperator, language, t } =
    useLineBalancing();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWorker, setEditingWorker] = useState<Operator | null>(null);

  const [formName, setFormName] = useState<string>('');
  const [formShift, setFormShift] = useState<string>('Shift 1');
  const [formStationId, setFormStationId] = useState<string>('ws-1');
  const [formSkills, setFormSkills] = useState<string>('');

  const openAddModal = () => {
    setEditingWorker(null);
    setFormName(`Operator ${line.operators.length + 1}`);
    setFormShift('Shift 1');
    setFormStationId(line.workstations[0]?.id || 'ws-1');
    setFormSkills('Assembly:4, Torque Fastening:3');
    setIsModalOpen(true);
  };

  const openEditModal = (worker: Operator) => {
    setEditingWorker(worker);
    setFormName(worker.name);
    setFormShift(worker.shift);
    setFormStationId(worker.assignedStationId || line.workstations[0]?.id || 'ws-1');
    setFormSkills(
      (worker.skills || []).map((s) => `${s.skill}:${s.level}`).join(', ')
    );
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArr = formSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [skill, levelStr] = pair.split(':').map((p) => p.trim());
        return {
          skill: skill || 'General',
          level: Math.min(5, Math.max(1, parseInt(levelStr || '3') || 3)),
        };
      });

    if (editingWorker) {
      updateOperator({
        ...editingWorker,
        name: formName,
        shift: formShift,
        assignedStationId: formStationId,
        skills: skillsArr,
      });
    } else {
      const newId = `op-${Date.now().toString().slice(-4)}`;
      addOperator({
        id: newId,
        name: formName,
        shift: formShift,
        assignedStationId: formStationId,
        skills: skillsArr,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>{language === 'ar' ? 'إدارة الفنيين ومصفوفة المهارات (Workers & Skill Matrix)' : 'Operator Roster & Skills Competency Matrix'}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'متابعة توزيع العمالة ومستوى كفاءة المشغلين ونسب الاستغلال وملاءمة المهارات للعمليات'
              : 'Direct labor tracking, shift allocation, individual workload utilization, and cross-training levels'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة مشغل جديد' : 'Add Operator'}</span>
        </button>
      </div>

      {/* Operators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {line.operators.map((worker) => {
          const metric = results.operatorMetrics.find((m) => m.id === worker.id);
          const station = line.workstations.find((ws) => ws.id === worker.assignedStationId);
          const busyTime = metric ? metric.busyTime : 0;
          const utilization = metric ? metric.utilization : 0;

          return (
            <div
              key={worker.id}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                    {worker.shift}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(worker)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(language === 'ar' ? `حذف ${worker.name}؟` : `Delete operator ${worker.name}?`)) {
                          deleteOperator(worker.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {worker.name}
                </h3>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  ID: {worker.id}
                </div>

                {/* Assigned station info */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'ar' ? 'المحطة المسندة:' : 'Station:'}</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {station?.name || 'Unassigned'}
                  </span>
                </div>

                {/* Utilization Gauge */}
                <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">{language === 'ar' ? 'وقت العمل الفعلي:' : 'Active Busy Time:'}</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {busyTime.toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">{language === 'ar' ? 'نسبة الاستغلال:' : 'Labor Utilization:'}</span>
                    <span className="font-mono font-bold text-blue-500">
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                </div>

                {/* Skills Matrix */}
                <div className="mt-4 space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 block">
                    {language === 'ar' ? 'مصفوفة المهارات ومستوى الكفاءة:' : 'Skills Competency Matrix:'}
                  </span>
                  <div className="space-y-1.5">
                    {(worker.skills || []).map((sk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/40"
                      >
                        <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                          <Award className="w-3 h-3 text-amber-500" />
                          {sk.skill}
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <span
                              key={lvl}
                              className={`w-2 h-2 rounded-full ${
                                lvl <= sk.level
                                  ? 'bg-amber-400'
                                  : 'bg-neutral-300 dark:bg-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Worker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
              {editingWorker
                ? (language === 'ar' ? 'تعديل بيانات المشغل' : 'Edit Operator')
                : (language === 'ar' ? 'إضافة مشغل جديد' : 'Add Operator')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  {language === 'ar' ? 'اسم المشغل' : 'Operator Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                    {language === 'ar' ? 'الوردية' : 'Shift'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                    {language === 'ar' ? 'المحطة المسندة' : 'Assigned Station'}
                  </label>
                  <select
                    value={formStationId}
                    onChange={(e) => setFormStationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    {line.workstations.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  {t('skillsWithLevels')}
                </label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="Assembly:4, Torque:3, Wiring:5"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm"
                >
                  {language === 'ar' ? 'حفظ المشغل' : 'Save Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Workstation } from '../types/lineBalancing';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Wrench,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const WorkstationsView: React.FC = () => {
  const {
    line,
    results,
    addWorkstation,
    updateWorkstation,
    deleteWorkstation,
    setActiveTab,
    setSelectedStationId,
    language,
    t,
  } = useLineBalancing();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWs, setEditingWs] = useState<Workstation | null>(null);
  const [stationPendingDelete, setStationPendingDelete] = useState<Workstation | null>(null);

  const [formName, setFormName] = useState<string>('');
  const [formSequence, setFormSequence] = useState<number>(line.workstations.length + 1);
  const [formMaxOps, setFormMaxOps] = useState<number>(1);
  const [formEquipment, setFormEquipment] = useState<string>('');

  const openAddModal = () => {
    setEditingWs(null);
    setFormName(`Station ${line.workstations.length + 1}`);
    setFormSequence(line.workstations.length + 1);
    setFormMaxOps(1);
    setFormEquipment('');
    setIsModalOpen(true);
  };

  const openEditModal = (ws: Workstation) => {
    setEditingWs(ws);
    setFormName(ws.name);
    setFormSequence(ws.sequence);
    setFormMaxOps(ws.maxOperators);
    setFormEquipment((ws.fixedEquipment || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const equipmentArr = formEquipment
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingWs) {
      updateWorkstation({
        ...editingWs,
        name: formName,
        sequence: formSequence,
        maxOperators: formMaxOps,
        fixedEquipment: equipmentArr,
      });
    } else {
      const newId = `ws-${Date.now().toString().slice(-4)}`;
      addWorkstation({
        id: newId,
        name: formName,
        sequence: formSequence,
        maxOperators: formMaxOps,
        fixedEquipment: equipmentArr,
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
            <Layers className="w-5 h-5 text-blue-500" />
            <span>{t('stationsTitle')}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('stationsSubtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addStation')}</span>
        </button>
      </div>

      {/* Workstations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {line.workstations
          .slice()
          .sort((a, b) => a.sequence - b.sequence)
          .map((ws) => {
            const metric = results.workstationMetrics.find((m) => m.id === ws.id);
            const cycleTime = metric ? metric.cycleTime : 0;
            const isBottleneck = metric?.isBottleneck;
            const isOverloaded = metric?.isOverloaded;
            const opsInStation = line.operations.filter((o) => o.stationId === ws.id);

            return (
              <div
                key={ws.id}
                className={`p-5 rounded-2xl bg-white dark:bg-neutral-900 border transition-all flex flex-col justify-between ${
                  isOverloaded
                    ? 'border-rose-500/50 shadow-rose-500/5 shadow-md'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-bold font-mono">
                      #{ws.sequence}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(ws)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (line.workstations.length > 1) {
                            setStationPendingDelete(ws);
                          }
                        }}
                        disabled={line.workstations.length <= 1}
                        className={`p-1.5 rounded-lg transition-colors ${
                          line.workstations.length <= 1
                            ? 'opacity-30 cursor-not-allowed text-neutral-400'
                            : 'hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500'
                        }`}
                        title={
                          line.workstations.length <= 1
                            ? (language === 'ar' ? 'لا يمكن حذف المحطة الوحيدة المتبقية في الخط' : 'Cannot delete the only station')
                            : (language === 'ar' ? 'حذف المحطة' : 'Delete station')
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    {ws.name}
                  </h3>
                  <div className="text-xs text-neutral-400 font-mono mt-0.5">
                    ID: {ws.id}
                  </div>

                  {/* Metrics bar */}
                  <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">{language === 'ar' ? 'زمن الدورة:' : 'Station Cycle:'}</span>
                      <span className={`font-mono font-bold text-sm ${isOverloaded ? 'text-rose-500' : 'text-neutral-900 dark:text-white'}`}>
                        {cycleTime.toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">{language === 'ar' ? 'نسبة الاستغلال:' : 'Utilization:'}</span>
                      <span className="font-mono font-semibold">
                        {metric ? metric.utilization.toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">{language === 'ar' ? 'أقصى عمالة:' : 'Max Workers:'}</span>
                      <span className="font-semibold">{ws.maxOperators}</span>
                    </div>
                  </div>

                  {/* Fixed equipment */}
                  <div className="mt-4 space-y-1 text-xs">
                    <span className="text-neutral-400 font-medium block">
                      {t('fixedEquipment')}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(ws.fixedEquipment || []).length > 0 ? (
                        ws.fixedEquipment?.map((eq, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                          >
                            <Wrench className="w-2.5 h-2.5 text-neutral-400" />
                            {eq}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">
                          {t('fixedWorkbench')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Operations List */}
                <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span>{language === 'ar' ? 'العمليات المسندة:' : 'Assigned Tasks:'}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {opsInStation.length} {language === 'ar' ? 'عملية' : 'ops'}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {opsInStation.map((op) => (
                      <div
                        key={op.id}
                        className="text-[11px] p-1.5 rounded bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-between text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="truncate max-w-[150px]">{op.name}</span>
                        <span className="font-mono text-neutral-500">
                          {(op.manualTime + op.machineTime + op.handlingTime + op.walkingTime).toFixed(0)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
              {editingWs ? t('editStation') : t('addStation')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  {t('stationName')}
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
                    {t('sequenceNumber')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formSequence}
                    onChange={(e) => setFormSequence(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                    {t('maxOperators')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={formMaxOps}
                    onChange={(e) => setFormMaxOps(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  {t('fixedEquipment')} ({language === 'ar' ? 'مفصولة بفواصل' : 'comma separated'})
                </label>
                <input
                  type="text"
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value)}
                  placeholder="e.g. Hydraulic Press, Ultrasonic Welder"
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
                  {language === 'ar' ? 'حفظ المحطة' : 'Save Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Station Confirmation Modal */}
      {stationPendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {language === 'ar' ? 'تأكيد حذف محطة العمل' : 'Confirm Workstation Deletion'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {language === 'ar' ? 'إعادة توجيه العمليات تلقائياً' : 'Operations will be automatically reassigned'}
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {language === 'ar'
                ? `هل أنت متأكد من حذف محطة العمل "${stationPendingDelete.name}"؟ سيتم نقل العمليات التابعة لها تلقائياً إلى المحطة الأولى.`
                : `Are you sure you want to delete workstation "${stationPendingDelete.name}"? Any operations assigned to it will be reassigned to the first workstation.`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setStationPendingDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteWorkstation(stationPendingDelete.id);
                  setStationPendingDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {language === 'ar' ? 'حذف المحطة' : 'Delete Station'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

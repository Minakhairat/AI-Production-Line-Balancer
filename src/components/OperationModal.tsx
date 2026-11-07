import React, { useState, useEffect } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Operation, OperationType, TransferRestriction } from '../types/lineBalancing';
import { X, Clock, Layers, Users, Wrench, AlertCircle } from 'lucide-react';

export const OperationModal: React.FC = () => {
  const {
    line,
    isOperationModalOpen,
    setIsOperationModalOpen,
    editingOperation,
    addOperation,
    updateOperation,
    language,
    t,
  } = useLineBalancing();

  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [stationId, setStationId] = useState<string>('ws-1');
  const [operatorId, setOperatorId] = useState<string>('');
  const [manualTime, setManualTime] = useState<number>(10);
  const [machineTime, setMachineTime] = useState<number>(0);
  const [automaticTime, setAutomaticTime] = useState<number>(0);
  const [walkingTime, setWalkingTime] = useState<number>(2);
  const [handlingTime, setHandlingTime] = useState<number>(3);
  const [operatorCount, setOperatorCount] = useState<number>(1);
  const [precedenceIds, setPrecedenceIds] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string>('');
  const [type, setType] = useState<OperationType>('manual');
  const [canBeSplit, setCanBeSplit] = useState<boolean>(false);
  const [canBeCombined, setCanBeCombined] = useState<boolean>(false);
  const [transferRestriction, setTransferRestriction] = useState<TransferRestriction>('none');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingOperation) {
      setId(editingOperation.id);
      setName(editingOperation.name);
      setStationId(editingOperation.stationId);
      setOperatorId(editingOperation.operatorId || '');
      setManualTime(editingOperation.manualTime || 0);
      setMachineTime(editingOperation.machineTime || 0);
      setAutomaticTime(editingOperation.automaticTime || 0);
      setWalkingTime(editingOperation.walkingTime || 0);
      setHandlingTime(editingOperation.handlingTime || 0);
      setOperatorCount(editingOperation.operatorCount || 1);
      setPrecedenceIds(editingOperation.precedenceIds || []);
      setRequiredSkills((editingOperation.requiredSkills || []).join(', '));
      setType(editingOperation.type);
      setCanBeSplit(editingOperation.canBeSplit);
      setCanBeCombined(editingOperation.canBeCombined);
      setTransferRestriction(editingOperation.transferRestriction);
      setNotes(editingOperation.notes || '');
    } else {
      const nextNum = line.operations.length + 1;
      setId(`op-${nextNum}`);
      setName(`Operation ${nextNum}`);
      setStationId(line.workstations[0]?.id || 'ws-1');
      setOperatorId('');
      setManualTime(15);
      setMachineTime(0);
      setAutomaticTime(0);
      setWalkingTime(2);
      setHandlingTime(3);
      setOperatorCount(1);
      setPrecedenceIds([]);
      setRequiredSkills('Mechanical Assembly');
      setType('manual');
      setCanBeSplit(false);
      setCanBeCombined(false);
      setTransferRestriction('none');
      setNotes('');
    }
  }, [editingOperation, line.operations.length, line.workstations]);

  if (!isOperationModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArr = requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const opData: Operation = {
      id,
      name,
      stationId,
      operatorId: operatorId || undefined,
      manualTime: Number(manualTime),
      machineTime: Number(machineTime),
      automaticTime: Number(automaticTime),
      walkingTime: Number(walkingTime),
      handlingTime: Number(handlingTime),
      operatorCount: Number(operatorCount),
      precedenceIds,
      requiredSkills: skillsArr,
      type,
      canBeSplit,
      canBeCombined,
      transferRestriction,
      notes,
    };

    if (editingOperation) {
      updateOperation(opData);
    } else {
      addOperation(opData);
    }

    setIsOperationModalOpen(false);
  };

  const totalTime =
    Number(manualTime) +
    Number(machineTime) +
    Number(automaticTime) +
    Number(walkingTime) +
    Number(handlingTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>
                {editingOperation
                  ? (language === 'ar' ? 'تعديل بيانات العملية ودراسة الوقت' : 'Edit Operation Details')
                  : (language === 'ar' ? 'إضافة عملية صناعية جديدة' : 'Add New Operation')}
              </span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Total Standard Time: {totalTime.toFixed(1)} seconds
            </span>
          </div>

          <button
            onClick={() => setIsOperationModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Basic identification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'كود العملية (ID)' : 'Operation ID'}
              </label>
              <input
                type="text"
                required
                disabled={!!editingOperation}
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'اسم العملية (Operation Name)' : 'Operation Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Station and Operator allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'المحطة المسندة' : 'Assigned Station'}
              </label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              >
                {line.workstations.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'المشغل (اختياري)' : 'Assigned Operator'}
              </label>
              <select
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              >
                <option value="">{language === 'ar' ? 'غير مسند لمشغل محدد' : 'Unassigned'}</option>
                {line.operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'النوع (Operation Type)' : 'Operation Type'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OperationType)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white capitalize"
              >
                <option value="manual">Manual (يدوي)</option>
                <option value="machine">Machine (تشغيل آلي)</option>
                <option value="handling">Handling (مناولة)</option>
                <option value="walking">Walking (مشي وحركة)</option>
                <option value="inspection">Inspection (فحص جودة)</option>
                <option value="packaging">Packaging (تغليف)</option>
                <option value="automated">Automated (مؤتمت بالكامل)</option>
              </select>
            </div>
          </div>

          {/* Time Study Work Breakdown (seconds) */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 space-y-3">
            <span className="font-bold text-neutral-600 dark:text-neutral-300 block">
              {language === 'ar' ? 'تفصيل أزمنة العمل القياسية (بالثواني):' : 'Standard Time Breakdown (seconds):'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-neutral-500 mb-1">{language === 'ar' ? 'يدوي (Manual)' : 'Manual'}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={manualTime}
                  onChange={(e) => setManualTime(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === 'ar' ? 'ماكينة (Machine)' : 'Machine'}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={machineTime}
                  onChange={(e) => setMachineTime(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === 'ar' ? 'آلي (Automatic)' : 'Automatic'}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={automaticTime}
                  onChange={(e) => setAutomaticTime(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === 'ar' ? 'مشي (Walking)' : 'Walking'}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={walkingTime}
                  onChange={(e) => setWalkingTime(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === 'ar' ? 'مناولة (Handling)' : 'Handling'}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={handlingTime}
                  onChange={(e) => setHandlingTime(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Precedence Checkbox Selection */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
              {language === 'ar' ? 'العمليات السابقة المشروطة (Precedence Constraints)' : 'Precedence Constraints'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 max-h-36 overflow-y-auto">
              {line.operations
                .filter((o) => o.id !== id)
                .map((candidate) => {
                  const isChecked = precedenceIds.includes(candidate.id);
                  return (
                    <label
                      key={candidate.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPrecedenceIds([...precedenceIds, candidate.id]);
                          } else {
                            setPrecedenceIds(precedenceIds.filter((p) => p !== candidate.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="truncate text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                        {candidate.name}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Operational Flexibility and Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canBeSplit}
                onChange={(e) => setCanBeSplit(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                {language === 'ar' ? 'قابلة للتجزئة (Can Be Split)' : 'Can Be Split'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canBeCombined}
                onChange={(e) => setCanBeCombined(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                {language === 'ar' ? 'قابلة للدمج (Can Be Combined)' : 'Can Be Combined'}
              </span>
            </label>

            <div>
              <label className="block text-neutral-500 mb-1 text-[11px]">
                {language === 'ar' ? 'قيود النقل' : 'Transfer Restriction'}
              </label>
              <select
                value={transferRestriction}
                onChange={(e) => setTransferRestriction(e.target.value as TransferRestriction)}
                className="w-full px-2 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px]"
              >
                <option value="none">None (قابلة للنقل بحرية)</option>
                <option value="fixed_to_station">Fixed to Station (ثابتة بالمحطة)</option>
                <option value="requires_heavy_crane">Requires Heavy Crane (ونش ثقيل)</option>
                <option value="cleanroom_only">Cleanroom Only (غرفة نظيفة)</option>
                <option value="specialized_fixture">Specialized Fixture (مثبت خاص)</option>
              </select>
            </div>
          </div>

          {/* Required Skills & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'المهارات المطلوبة (مفصولة بفواصل)' : 'Required Skills'}
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="Wiring, Torque, Testing"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                {language === 'ar' ? 'ملاحظات هندسية' : 'Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsOperationModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
            >
              {language === 'ar' ? 'حفظ العملية' : 'Save Operation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

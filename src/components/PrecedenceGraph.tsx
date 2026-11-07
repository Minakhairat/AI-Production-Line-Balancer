import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { Operation } from '../types/lineBalancing';
import { GitCommit, ArrowRight, Layers, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

function getOpTotal(op: Operation): number {
  return (
    (op.manualTime || 0) +
    (op.machineTime || 0) +
    (op.automaticTime || 0) +
    (op.walkingTime || 0) +
    (op.handlingTime || 0)
  );
}

export const PrecedenceGraph: React.FC = () => {
  const { line, setSelectedOperationId, setEditingOperation, setIsOperationModalOpen, language, t } =
    useLineBalancing();

  const [filterStationId, setFilterStationId] = useState<string>('all');

  const filteredOps =
    filterStationId === 'all'
      ? line.operations
      : line.operations.filter((o) => o.stationId === filterStationId);

  return (
    <div className="space-y-6">
      {/* Header and Station Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-indigo-500" />
            <span>{language === 'ar' ? 'مخطط التتابع والاعتماديات الهندسية (Precedence Graph)' : 'Precedence Network & Directed Acyclic Graph (DAG)'}</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === 'ar'
              ? 'شبكة الاعتماديات والمسار الحرج لتحديد ترتيب تدفق التجميع والعمليات المتزامنة'
              : 'Direct precedence constraints and sequential process flow governing assembly line balancing'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500">{language === 'ar' ? 'تصفية حسب المحطة:' : 'Filter Station:'}</label>
          <select
            value={filterStationId}
            onChange={(e) => setFilterStationId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
          >
            <option value="all">{language === 'ar' ? 'جميع محطات الخط (All)' : 'All Workstations'}</option>
            {line.workstations.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Network Representation Cards Grid */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOps.map((op) => {
            const duration = getOpTotal(op);
            const station = line.workstations.find((ws) => ws.id === op.stationId);
            const predecessors = (op.precedenceIds || []).map((pId) =>
              line.operations.find((o) => o.id === pId)
            );

            // Find downstream successors
            const successors = line.operations.filter((o) =>
              (o.precedenceIds || []).includes(op.id)
            );

            return (
              <div
                key={op.id}
                onClick={() => {
                  setSelectedOperationId(op.id);
                  setEditingOperation(op);
                  setIsOperationModalOpen(true);
                }}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-indigo-500/50 transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">
                      {op.id}
                    </span>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                      {op.name}
                    </h4>
                  </div>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {duration.toFixed(1)}s
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {station?.name || op.stationId}
                  </span>
                  <span className="capitalize">{op.type}</span>
                </div>

                {/* Predecessors list */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 space-y-1 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {language === 'ar' ? 'العمليات السابقة المباشرة:' : 'Predecessor Requirements:'}
                  </div>
                  {predecessors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {predecessors.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono"
                        >
                          ← {p ? p.name.slice(0, 15) : op.precedenceIds[idx]}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {language === 'ar' ? 'عملية أولية (No Predecessors)' : 'Initial Process Node'}
                    </span>
                  )}
                </div>

                {/* Successors list */}
                {successors.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 space-y-1 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {language === 'ar' ? 'العمليات اللاحقة المقيدة:' : 'Unlocks Downstream:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {successors.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono"
                        >
                          → {s.name.slice(0, 15)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

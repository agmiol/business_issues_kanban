import React, { useEffect } from 'react';
import { ProblemItem, getStatusStyle } from '../types/problem';
import { X, Building2, CheckCircle2, Send } from 'lucide-react';
import { HryvniaIcon } from './HryvniaIcon';

interface ProblemModalProps {
  problem: ProblemItem | null;
  onClose: () => void;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  problem,
  onClose,
}) => {
  useEffect(() => {
    if (!problem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [problem, onClose]);

  if (!problem) return null;

  const statusStyle = getStatusStyle(problem.executionStatus);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Banner with Status Background Accent */}
        <div className={`shrink-0 px-5 py-4 sm:px-6 border-b border-slate-200 ${statusStyle.bg}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                <span className="font-extrabold text-slate-900 tabular-nums">
                  {problem.id}
                </span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span className="text-slate-700 font-semibold">
                  {problem.platform}
                </span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span className="text-blue-800 font-bold">
                  {problem.category}
                </span>
                {problem.npaType && (
                  <>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="text-indigo-800 font-semibold">
                      {problem.npaType}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              className="shrink-0 p-2 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/70 transition-colors shadow-2xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 min-h-0 p-5 sm:p-6 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Full Problem Title (from column F) */}
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-snug whitespace-pre-line">
            {problem.submittedProblem || problem.title}
          </h2>
          
          {/* Status & Stage Read-Only Info Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Execution Status (Read-Only) */}
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Статус виконання
              </span>
              <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${statusStyle.badgeText}`}>
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                <span>{problem.executionStatus || 'Статус не вказано'}</span>
              </span>
            </div>

            {/* Stage (Read-Only) */}
            <div>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Стадія виконання
              </span>
              <div className="text-slate-900 text-xs sm:text-sm font-bold">
                {problem.stage}
              </div>
            </div>
          </div>

          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Виконавець</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{problem.executor}</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Пріоритет</span>
              <span className="font-bold text-slate-900 mt-1 block">
                {problem.priority}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Заявник</span>
              <span className="font-semibold text-slate-800 mt-1 block">
                {problem.applicant || 'Не вказано'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Екон. ефект</span>
              <span className="font-extrabold text-amber-700 mt-1 flex items-center gap-1 tabular-nums">
                {problem.economicEffect > 0 ? (
                  <>
                    <HryvniaIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{problem.economicEffect.toLocaleString('uk-UA')} млн грн</span>
                  </>
                ) : (
                  '—'
                )}
              </span>
            </div>
          </div>

          {/* Proposed Solution */}
          {problem.proposedSolution && (
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                Пропозиція рішення щодо зміни в законодавстві
              </h3>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-950 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {problem.proposedSolution}
              </div>
            </div>
          )}

          {/* COVV Response / Result */}
          {problem.covvResponse && (
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Рішення ЦОВВ / Відповідь та результат
              </h3>
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-200 text-indigo-950 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {problem.covvResponse}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-medium tabular-nums">
            {problem.dateAdded && `Дата додавання: ${problem.dateAdded}`}
            {problem.resolutionDate && ` · Вирішено: ${problem.resolutionDate}`}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};

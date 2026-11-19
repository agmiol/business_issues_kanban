import React from 'react';
import { ProblemItem, getStatusStyle, isUrgentPriority } from '../types/problem';
import { Building2, AlertTriangle, ChevronRight } from 'lucide-react';
import { HryvniaIcon } from './HryvniaIcon';

interface ProblemCardProps {
  problem: ProblemItem;
  onClick: (problem: ProblemItem) => void;
  compact?: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  onClick,
}) => {
  const statusStyle = getStatusStyle(problem.executionStatus);
  const isUrgent = isUrgentPriority(problem.priority);
  const isHigh = problem.priority.toLowerCase().includes('високий');
  const priorityLabel = problem.priority.replace(/^\d\.\s*/, '');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(problem)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(problem);
        }
      }}
      className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
    >
      {/* Top Metadata Row: Unboxed ID + Priority */}
      <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
        <span className="font-extrabold tracking-tight text-slate-800 tabular-nums">
          {problem.id}
        </span>

        <span
          className={`inline-flex items-center gap-1 font-bold ${
            isUrgent
              ? 'text-rose-700'
              : isHigh
              ? 'text-amber-700'
              : 'text-slate-500'
          }`}
        >
          {isUrgent && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
          <span>{priorityLabel}</span>
        </span>
      </div>

      {/* Title / Description Summary */}
      <h3 className="font-bold text-xs sm:text-sm leading-snug line-clamp-3 text-slate-900 group-hover:text-blue-700 transition-colors mb-2.5">
        {problem.title}
      </h3>

      {/* Footer Info: Executor + Economic Effect + Status */}
      <div className="pt-2.5 border-t border-slate-900/10 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0 text-slate-700 font-semibold">
          <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <span className="truncate">{problem.executor}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {problem.economicEffect > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-amber-800 font-extrabold tabular-nums"
              title={`Економічний ефект: ${problem.economicEffect} млн грн`}
            >
              <HryvniaIcon className="w-3 h-3 text-amber-700" />
              {problem.economicEffect} млн
            </span>
          )}

          <span className={`inline-flex items-center gap-1 font-bold ${statusStyle.badgeText}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusStyle.dot}`} />
            <span className="truncate max-w-[125px]">{problem.executionStatus || 'Статус не вказано'}</span>
          </span>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </div>
  );
};

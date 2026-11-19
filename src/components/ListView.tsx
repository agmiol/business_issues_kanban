import React, { useState, useMemo } from 'react';
import { ProblemItem, getStatusStyle, isUrgentPriority } from '../types/problem';
import { ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink, AlertTriangle, Building2 } from 'lucide-react';

interface ListViewProps {
  problems: ProblemItem[];
  onCardClick: (problem: ProblemItem) => void;
}

type SortField = 'id' | 'title' | 'executor' | 'stage' | 'executionStatus' | 'priority' | 'economicEffect';

export const ListView: React.FC<ListViewProps> = ({ problems, onCardClick }) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const sortedProblems = useMemo(() => {
    return [...problems].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'economicEffect') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [problems, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedProblems.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProblems = sortedProblems.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section aria-label="Таблиця проблем" className="max-w-[1600px] w-full mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Mobile Card Stack (< md) */}
        <div className="md:hidden divide-y divide-slate-200">
          {paginatedProblems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              За вибраними фільтрами проблем не знайдено
            </div>
          ) : (
            paginatedProblems.map((problem) => {
              const statusStyle = getStatusStyle(problem.executionStatus);
              const isUrgent = isUrgentPriority(problem.priority);
              const priorityLabel = problem.priority.replace(/^\d\.\s*/, '');

              return (
                <div
                  key={problem.id}
                  onClick={() => onCardClick(problem)}
                  className="p-4 space-y-2.5 hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-extrabold text-slate-900 tabular-nums">{problem.id}</span>
                    <span className={`inline-flex items-center gap-1 font-bold ${isUrgent ? 'text-rose-700' : 'text-slate-600'}`}>
                      {isUrgent && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                      <span>{priorityLabel}</span>
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-900 leading-snug line-clamp-3">
                    {problem.title}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {problem.executor}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{problem.stage}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <span className={`inline-flex items-center gap-1.5 font-bold ${statusStyle.badgeText}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{problem.executionStatus || 'Статус не вказано'}</span>
                    </span>

                    {problem.economicEffect > 0 && (
                      <span className="font-extrabold text-amber-700 tabular-nums">
                        {problem.economicEffect.toLocaleString('uk-UA')} млн грн
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 min-w-[90px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 min-w-[280px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Опис проблеми</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('executor')}
                  className="py-3 px-3 min-w-[130px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Виконавець</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stage')}
                  className="py-3 px-3 min-w-[150px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Стадія</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('executionStatus')}
                  className="py-3 px-3 min-w-[155px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Статус</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-3 min-w-[130px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Пріоритет</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('economicEffect')}
                  className="py-3 px-3 text-right min-w-[120px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Ефект</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center min-w-[64px]">Деталі</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-slate-800">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                    За вибраними фільтрами проблем не знайдено
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((problem) => {
                  const statusStyle = getStatusStyle(problem.executionStatus);
                  const isUrgent = isUrgentPriority(problem.priority);

                  return (
                    <tr
                      key={problem.id}
                      onClick={() => onCardClick(problem)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 font-extrabold text-slate-900 whitespace-nowrap tabular-nums">
                        {problem.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 leading-snug">
                        <div className="line-clamp-2 group-hover:text-blue-700 transition-colors">{problem.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-normal">
                          {problem.category} <span aria-hidden="true">·</span> {problem.platform}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {problem.executor}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {problem.stage}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${statusStyle.badgeText}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${statusStyle.dot}`} />
                          <span>{problem.executionStatus || 'Статус не вказано'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isUrgent ? 'text-rose-700 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                          <span>{problem.priority.replace(/^\d\.\s*/, '')}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap tabular-nums">
                        {problem.economicEffect > 0 ? (
                          <span className="text-amber-700">
                            {problem.economicEffect.toLocaleString('uk-UA')} млн грн
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCardClick(problem);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Детальніше"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 font-semibold tabular-nums">
            {sortedProblems.length === 0
              ? 'Показано 0 проблем'
              : `Показано ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, sortedProblems.length)} із ${sortedProblems.length}`}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-slate-800 tabular-nums">
              Сторінка {safePage} з {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

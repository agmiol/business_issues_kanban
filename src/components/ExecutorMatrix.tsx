import React, { useState, useMemo } from 'react';
import { ProblemItem, STAGES } from '../types/problem';
import { Building2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ExecutorMatrixProps {
  problems: ProblemItem[];
  onSelectExecutorStage: (executor: string, stage: string) => void;
}

type MatrixSortKey = 'executor' | 'total' | string;

export const ExecutorMatrix: React.FC<ExecutorMatrixProps> = ({
  problems,
  onSelectExecutorStage,
}) => {
  const [sortKey, setSortKey] = useState<MatrixSortKey>('total');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const handleSort = (key: MatrixSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      // Numeric columns default to largest-to-smallest first; executor name defaults to A-Z
      setSortOrder(key === 'executor' ? 'asc' : 'desc');
    }
  };

  const { executorCounts, matrix, colTotals, sortedExecutors } = useMemo(() => {
    const counts: Record<string, number> = {};
    const grid: Record<string, Record<string, number>> = {};

    problems.forEach((p) => {
      const ex = p.executor?.trim() || 'Не вказано';
      counts[ex] = (counts[ex] || 0) + 1;

      if (!grid[ex]) {
        grid[ex] = {};
        STAGES.forEach((s) => {
          grid[ex][s] = 0;
        });
      }

      const st = STAGES.find((s) => s.trim() === p.stage?.trim()) || p.stage;
      if (grid[ex][st] !== undefined) {
        grid[ex][st] += 1;
      }
    });

    const totals: Record<string, number> = {};
    STAGES.forEach((s) => {
      totals[s] = problems.filter((p) => p.stage?.trim() === s.trim()).length;
    });

    const list = Object.keys(counts).sort((a, b) => {
      if (sortKey === 'executor') {
        const cmp = a.localeCompare(b, 'uk');
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      const valA = sortKey === 'total' ? counts[a] || 0 : grid[a]?.[sortKey] || 0;
      const valB = sortKey === 'total' ? counts[b] || 0 : grid[b]?.[sortKey] || 0;

      if (valA !== valB) {
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      }

      // Tie-breaker by total descending, then alphabetically
      const totDiff = (counts[b] || 0) - (counts[a] || 0);
      if (totDiff !== 0) return totDiff;
      return a.localeCompare(b, 'uk');
    });

    return {
      executorCounts: counts,
      matrix: grid,
      colTotals: totals,
      sortedExecutors: list,
    };
  }, [problems, sortKey, sortOrder]);

  const renderSortIcon = (key: MatrixSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />;
    }
    return sortOrder === 'desc' ? (
      <ArrowDown className="w-3 h-3 text-blue-600 shrink-0" />
    ) : (
      <ArrowUp className="w-3 h-3 text-blue-600 shrink-0" />
    );
  };

  return (
    <section aria-label="Матриця виконавців" className="max-w-[1600px] w-full mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Banner */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Матриця розподілу проблем за виконавцями (ЦОВВ) та стадіями</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Натисніть на заголовок стовпця для сортування, або на число у комірці — щоб переглянути проблеми органу
            </p>
          </div>
          <span className="text-xs font-extrabold text-blue-900 tabular-nums whitespace-nowrap">
            Усього органів: {sortedExecutors.length}
          </span>
        </div>

        {/* Full-Width Responsive Matrix Table (fits desktop screen without horizontal scroll) */}
        <div className="overflow-x-auto lg:overflow-x-visible scrollbar-thin">
          <table className="w-full min-w-[960px] lg:min-w-0 lg:table-fixed text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                <th
                  aria-sort={sortKey === 'executor' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => handleSort('executor')}
                  className={`py-2 px-2.5 xl:px-3 w-[15%] border-r border-slate-200 cursor-pointer select-none transition-colors align-middle ${
                    sortKey === 'executor' ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold uppercase tracking-wider text-[10px] xl:text-[11px]">Виконавець</span>
                    {renderSortIcon('executor')}
                  </div>
                </th>
                {STAGES.map((stage) => {
                  const isSorted = sortKey === stage;
                  return (
                    <th
                      key={stage}
                      aria-sort={isSorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                      onClick={() => handleSort(stage)}
                      title={`${stage} — натисніть для сортування`}
                      className={`py-2 px-1 xl:px-1.5 text-center w-[6.5%] border-r border-slate-200/60 cursor-pointer select-none transition-colors align-bottom ${
                        isSorted ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-between gap-1 min-h-[38px]">
                        <span className="text-[10px] xl:text-[11px] font-bold leading-tight break-words text-center">
                          {stage}
                        </span>
                        {renderSortIcon(stage)}
                      </div>
                    </th>
                  );
                })}
                <th
                  aria-sort={sortKey === 'total' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => handleSort('total')}
                  className={`py-2 px-1.5 xl:px-2 text-center w-[7%] cursor-pointer select-none transition-colors align-middle ${
                    sortKey === 'total' ? 'bg-blue-100/80 text-blue-900' : 'text-slate-900 bg-slate-100/90 hover:bg-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="font-extrabold uppercase tracking-wider text-[10px] xl:text-[11px]">Всього</span>
                    {renderSortIcon('total')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-slate-800">
              {sortedExecutors.map((ex) => {
                const totalForEx = executorCounts[ex];
                return (
                  <tr key={ex} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-1.5 px-2.5 xl:px-3 font-bold text-[11px] xl:text-xs text-slate-900 border-r border-slate-200 bg-slate-50/50 break-words leading-tight">
                      {ex}
                    </td>
                    {STAGES.map((stage) => {
                      const count = matrix[ex][stage] || 0;
                      const isSortedCol = sortKey === stage;
                      return (
                        <td
                          key={stage}
                          className={`py-1 px-0.5 xl:px-1 text-center border-r border-slate-200/60 tabular-nums ${
                            isSortedCol ? 'bg-blue-50/25' : ''
                          }`}
                        >
                          {count > 0 ? (
                            <button
                              type="button"
                              onClick={() => onSelectExecutorStage(ex, stage)}
                              className="inline-flex items-center justify-center min-w-[24px] font-extrabold text-[11px] xl:text-xs px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                              title={`Переглянути ${count} проблем для ${ex} у стадії ${stage}`}
                            >
                              {count}
                            </button>
                          ) : (
                            <span className="text-slate-300 font-normal text-[11px]">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className={`py-1.5 px-1.5 xl:px-2 text-center font-extrabold text-xs text-slate-900 tabular-nums ${
                      sortKey === 'total' ? 'bg-blue-50/60' : 'bg-slate-100/60'
                    }`}>
                      {totalForEx}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300 tabular-nums text-[11px] xl:text-xs">
                <td className="py-2 px-2.5 xl:px-3 border-r border-slate-300">Загальний підсумок</td>
                {STAGES.map((stage) => (
                  <td key={stage} className="py-2 px-0.5 xl:px-1 text-center border-r border-slate-300 text-blue-900">
                    {colTotals[stage] || 0}
                  </td>
                ))}
                <td className="py-2 px-1.5 xl:px-2 text-center text-blue-900 bg-slate-200/80">
                  {problems.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

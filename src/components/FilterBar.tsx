import React from 'react';
import { Search, X, LayoutGrid, Table, ListFilter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';

export type ViewMode = 'kanban' | 'matrix' | 'list';

interface FilterBarProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;

  platformFilter: string;
  onPlatformFilterChange: (platform: string) => void;

  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;

  executorFilter: string;
  onExecutorFilterChange: (executor: string) => void;
  executorsList: string[];

  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  categoriesList: string[];

  applicantFilter: string;
  onApplicantFilterChange: (applicant: string) => void;
  applicantsList: string[];

  searchQuery: string;
  onSearchQueryChange: (query: string) => void;

  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  totalCount: number;
  filteredCount: number;
  statusCounts: Record<string, number>;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  platformFilter,
  onPlatformFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  executorFilter,
  onExecutorFilterChange,
  executorsList,
  categoryFilter,
  onCategoryFilterChange,
  categoriesList,
  applicantFilter,
  onApplicantFilterChange,
  applicantsList,
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  statusCounts,
  onResetFilters,
}) => {
  const hasActiveFilters =
    statusFilter !== 'all' ||
    platformFilter !== 'all' ||
    priorityFilter !== 'all' ||
    executorFilter !== 'all' ||
    categoryFilter !== 'all' ||
    applicantFilter !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <section aria-label="Фільтри та режими перегляду" className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 space-y-3">
      {/* Row 1: Platform & Priority Segmented Controls + View Switcher */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
          {/* Platforms Segmented Control */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Майданчик:
            </span>
            <div className="inline-flex flex-wrap sm:flex-nowrap p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
              {[
                { id: 'all', label: 'Всі' },
                { id: 'МРГ ММБ', label: 'МРГ ММБ' },
                { id: 'МРГ Регіони', label: 'МРГ Регіони' },
                { id: 'Робочі зустрічі', label: 'Робочі зустрічі' },
              ].map((p) => {
                const active = platformFilter === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPlatformFilterChange(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-2xs ring-1 ring-amber-400'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden xl:block" />

          {/* Priority Segmented Control */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Пріоритет:
            </span>
            <div className="inline-flex flex-wrap sm:flex-nowrap p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
              {[
                { id: 'all', label: 'Усі' },
                { id: '1. Потребує негайного розгляду', label: 'Негайний розгляд' },
                { id: '2. Високий пріоритет', label: 'Високий' },
                { id: '3. Загальний пріоритет', label: 'Загальний' },
              ].map((pr) => {
                const active = priorityFilter === pr.id;
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => onPriorityFilterChange(pr.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-2xs ring-1 ring-amber-400'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="grid grid-cols-3 sm:inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'kanban'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>Канбан</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('matrix')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'matrix'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Table className="w-3.5 h-3.5 shrink-0" />
            <span>Матриця</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 shrink-0" />
            <span>Таблиця</span>
          </button>
        </div>
      </div>

      {/* Row 2: Execution Status Filter + Search + Select Dropdowns */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Execution Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Статус виконання:
            </span>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => onStatusFilterChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs ring-1 ring-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Всі статуси</span>
                <span className="text-[11px] text-slate-500 font-extrabold tabular-nums">
                  {totalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onStatusFilterChange('В роботі за планом')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  statusFilter === 'В роботі за планом'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-800 hover:bg-emerald-100/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusFilter === 'В роботі за планом' ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>В роботі за планом</span>
                <span className={`text-[11px] font-extrabold tabular-nums ${statusFilter === 'В роботі за планом' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                  {statusCounts['В роботі за планом'] || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onStatusFilterChange('Потребує уваги')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  statusFilter === 'Потребує уваги'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-orange-800 hover:bg-orange-100/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusFilter === 'Потребує уваги' ? 'bg-white' : 'bg-orange-500'}`} />
                <span>Потребує уваги</span>
                <span className={`text-[11px] font-extrabold tabular-nums ${statusFilter === 'Потребує уваги' ? 'text-orange-100' : 'text-orange-700'}`}>
                  {statusCounts['Потребує уваги'] || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onStatusFilterChange('Заблоковано')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  statusFilter === 'Заблоковано'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-800 hover:bg-rose-100/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusFilter === 'Заблоковано' ? 'bg-white' : 'bg-rose-500'}`} />
                <span>Заблоковано</span>
                <span className={`text-[11px] font-extrabold tabular-nums ${statusFilter === 'Заблоковано' ? 'text-rose-100' : 'text-rose-700'}`}>
                  {statusCounts['Заблоковано'] || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onStatusFilterChange('Відкладено')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  statusFilter === 'Відкладено'
                    ? 'bg-slate-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusFilter === 'Відкладено' ? 'bg-white' : 'bg-slate-500'}`} />
                <span>Відкладено</span>
                <span className={`text-[11px] font-extrabold tabular-nums ${statusFilter === 'Відкладено' ? 'text-slate-200' : 'text-slate-600'}`}>
                  {statusCounts['Відкладено'] || 0}
                </span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Пошук за ID, описом, органом..."
              className="w-full min-h-[38px] pl-9 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                aria-label="Очистити пошук"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns & Summary Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2.5 flex-1">
            <SearchableSelect
              value={executorFilter}
              onChange={onExecutorFilterChange}
              options={executorsList}
              allLabel={`Усі виконавці (${executorsList.length})`}
              searchPlaceholder="Пошук виконавця..."
              className="w-full lg:w-auto lg:min-w-[210px] lg:max-w-[250px]"
            />

            <SearchableSelect
              value={categoryFilter}
              onChange={onCategoryFilterChange}
              options={categoriesList}
              allLabel={`Усі категорії (${categoriesList.length})`}
              searchPlaceholder="Пошук категорії..."
              className="w-full lg:w-auto lg:min-w-[210px] lg:max-w-[260px]"
            />

            <SearchableSelect
              value={applicantFilter}
              onChange={onApplicantFilterChange}
              options={applicantsList}
              allLabel={`Усі заявники (${applicantsList.length})`}
              searchPlaceholder="Пошук заявника..."
              className="w-full lg:w-auto lg:min-w-[210px] lg:max-w-[270px]"
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200/80 cursor-pointer shrink-0 min-h-[38px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Скинути</span>
              </button>
            )}
          </div>

          <div className="text-slate-500 font-semibold text-xs whitespace-nowrap tabular-nums">
            Знайдено: <span className="font-extrabold text-slate-900">{filteredCount}</span> із{' '}
            <span className="font-bold text-slate-700">{totalCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

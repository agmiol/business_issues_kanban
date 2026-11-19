/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ProblemItem, ExecutionStatus, matchesPriority, isUrgentPriority, parseApplicants } from './types/problem';
import { loadProblemsFromCSV } from './utils/csvLoader';
import { Header } from './components/Header';
import { KPIHeader, isAwaitingStage, isInWorkStage, isImplementedStage, isRejectedStage } from './components/KPIHeader';
import { FilterBar, ViewMode } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { ExecutorMatrix } from './components/ExecutorMatrix';
import { ListView } from './components/ListView';
import { ProblemModal } from './components/ProblemModal';
import { DataSourceModal } from './components/DataSourceModal';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { Loader2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

const STORAGE_KEY_SHEET_URL = 'puls_google_sheet_url';

export default function App() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [executorFilter, setExecutorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [applicantFilter, setApplicantFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Modals
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);

  // Active Google Sheet URL (localStorage -> VITE_GOOGLE_SHEET_URL -> static CSV)
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHEET_URL);
      if (saved !== null) return saved;
    } catch {
      // ignore storage errors
    }
    return (import.meta.env.VITE_GOOGLE_SHEET_URL || '').trim();
  });

  // Load Data
  const fetchData = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl !== undefined ? overrideUrl : googleSheetUrl;
    setLoading(true);
    setError(null);
    try {
      const data = await loadProblemsFromCSV(targetUrl);
      setProblems(data);
    } catch (err: any) {
      setError(err.message || 'Не вдалося завантажити дані');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveGoogleSheet = async (url: string) => {
    const data = await loadProblemsFromCSV(url);
    try {
      localStorage.setItem(STORAGE_KEY_SHEET_URL, url);
    } catch {
      // ignore storage errors
    }
    setGoogleSheetUrl(url);
    setProblems(data);
    setError(null);
  };

  const handleResetToStaticCsv = async () => {
    const data = await loadProblemsFromCSV('');
    try {
      localStorage.removeItem(STORAGE_KEY_SHEET_URL);
    } catch {
      // ignore storage errors
    }
    setGoogleSheetUrl('');
    setProblems(data);
    setError(null);
  };

  // Compute lists for dropdowns
  const executorsList = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.executor) set.add(p.executor.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uk'));
  }, [problems]);

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uk'));
  }, [problems]);

  const applicantsList = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      parseApplicants(p.applicant).forEach((name) => set.add(name));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uk'));
  }, [problems]);

  // Compute status counts for the status switch toggle
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'В роботі за планом': 0,
      'Потребує уваги': 0,
      'Заблоковано': 0,
      'Відкладено': 0,
    };
    problems.forEach((p) => {
      if (counts[p.executionStatus] !== undefined) {
        counts[p.executionStatus] += 1;
      }
    });
    return counts;
  }, [problems]);

  // Handle KPI Card Click to quickly filter
  const handleKpiClick = (filterKey: string | null) => {
    setActiveKpiFilter(filterKey);
  };

  // Filtered dataset
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Status execution filter
      if (statusFilter !== 'all' && p.executionStatus !== statusFilter) {
        return false;
      }

      // Platform filter
      if (platformFilter !== 'all') {
        const pl = p.platform || '';
        if (platformFilter === 'МРГ ММБ') {
          if (!pl.includes('МРГ ММБ')) return false;
        } else if (platformFilter === 'МРГ Регіони') {
          if (!pl.includes('МРГ Регіони')) return false;
        } else if (platformFilter === 'Робочі зустрічі') {
          if (pl.includes('МРГ ММБ') || pl.includes('МРГ Регіони')) return false;
        } else {
          if (!pl.toLowerCase().includes(platformFilter.toLowerCase())) return false;
        }
      }

      // Priority filter
      if (!matchesPriority(p.priority, priorityFilter)) {
        return false;
      }

      // Executor filter
      if (executorFilter !== 'all' && p.executor.trim() !== executorFilter.trim()) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && p.category.trim() !== categoryFilter.trim()) {
        return false;
      }

      // Applicant filter (matches when applicant is sole entry or part of comma/line-separated list)
      if (applicantFilter !== 'all') {
        const itemApplicants = parseApplicants(p.applicant);
        if (!itemApplicants.includes(applicantFilter)) {
          return false;
        }
      }

      // KPI filter key quick active override
      if (activeKpiFilter === 'awaiting' && !isAwaitingStage(p.stage)) {
        return false;
      }
      if (activeKpiFilter === 'inWork' && !isInWorkStage(p.stage)) {
        return false;
      }
      if (activeKpiFilter === 'implemented' && !isImplementedStage(p.stage)) {
        return false;
      }
      if (activeKpiFilter === 'rejected' && !isRejectedStage(p.stage)) {
        return false;
      }
      if (activeKpiFilter === 'mrg' && !p.platform.toUpperCase().includes('МРГ')) {
        return false;
      }
      if (activeKpiFilter === 'mrgResolved' && (!p.platform.toUpperCase().includes('МРГ') || !isImplementedStage(p.stage))) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesApplicant = p.applicant.toLowerCase().includes(q);
        const matchesExecutor = p.executor.toLowerCase().includes(q);
        const matchesDesc = (p.submittedProblem || '').toLowerCase().includes(q);

        if (!matchesId && !matchesTitle && !matchesApplicant && !matchesExecutor && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [
    problems,
    statusFilter,
    platformFilter,
    priorityFilter,
    executorFilter,
    categoryFilter,
    applicantFilter,
    searchQuery,
    activeKpiFilter,
  ]);

  // Click on matrix cell
  const handleSelectExecutorStage = (executor: string, stage: string) => {
    setExecutorFilter(executor);
    // Switch to kanban view to inspect columns
    setViewMode('kanban');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter('all');
    setPlatformFilter('all');
    setPriorityFilter('all');
    setExecutorFilter('all');
    setCategoryFilter('all');
    setApplicantFilter('all');
    setSearchQuery('');
    setActiveKpiFilter(null);
  };

  // Export filtered items to CSV download
  const handleExportCSV = () => {
    const csvString = Papa.unparse(
      filteredProblems.map((p) => ({
        ID: p.id,
        Майданчик: p.platform,
        Заявник: p.applicant,
        'Дата додавання': p.dateAdded,
        'Опис проблеми': p.title,
        Категорія: p.category,
        Пріоритет: p.priority,
        'Економічний ефект (млн грн)': p.economicEffect,
        Виконавець: p.executor,
        Стадія: p.stage,
        'Статус виконання': p.executionStatus,
        Блокер: p.blocker || '',
        'Рішення ЦОВВ': p.covvResponse,
      })),
      { delimiter: ';' }
    );

    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PULS_problems_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top App Header */}
      <Header
        onExportClick={handleExportCSV}
        onRefreshClick={() => fetchData()}
        onSourceClick={() => setIsSourceModalOpen(true)}
        isGoogleSheet={Boolean(googleSheetUrl)}
        totalCount={problems.length}
        filteredCount={filteredProblems.length}
      />

      {/* Loading state */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-600">
            Завантаження даних системних проблем...
          </span>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full my-12 p-6 bg-white border border-rose-200 rounded-2xl shadow-xs text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900">Помилка завантаження</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fetchData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                Спробувати знову
              </button>
              <button
                type="button"
                onClick={() => setIsSourceModalOpen(true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Налаштувати джерело
              </button>
            </div>
          </div>
        </div>
      ) : (
        <main className="flex-1 pb-10 space-y-4 sm:space-y-5">
          {/* KPI Dashboard Header */}
          <KPIHeader
            problems={problems}
            activeKpiFilter={activeKpiFilter}
            onKpiClick={handleKpiClick}
          />

          {/* Filter Bar with Status Switch Toggle */}
          <FilterBar
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            platformFilter={platformFilter}
            onPlatformFilterChange={setPlatformFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            executorFilter={executorFilter}
            onExecutorFilterChange={setExecutorFilter}
            executorsList={executorsList}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categoriesList={categoriesList}
            applicantFilter={applicantFilter}
            onApplicantFilterChange={setApplicantFilter}
            applicantsList={applicantsList}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={problems.length}
            filteredCount={filteredProblems.length}
            statusCounts={statusCounts}
            onResetFilters={handleResetFilters}
          />

          {/* Stage Funnel & Monthly Dynamics Charts */}
          <AnalyticsCharts problems={filteredProblems} />

          {/* Main View Area (Kanban / Matrix / List) */}
          {viewMode === 'kanban' && (
            <KanbanBoard
              problems={filteredProblems}
              onCardClick={(problem) => setSelectedProblem(problem)}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          )}

          {viewMode === 'matrix' && (
            <ExecutorMatrix
              problems={filteredProblems}
              onSelectExecutorStage={handleSelectExecutorStage}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              problems={filteredProblems}
              onCardClick={(problem) => setSelectedProblem(problem)}
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-[11px] py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-3 w-4 flex-col rounded-2xs overflow-hidden shadow-xs shrink-0">
              <div className="h-1/2 bg-[#0057B7]" />
              <div className="h-1/2 bg-[#FFDD00]" />
            </div>
            <span className="font-extrabold text-white tracking-wider uppercase text-xs">PULSE.GOV.UA</span>
            <span className="text-slate-600" aria-hidden="true">|</span>
            <span className="text-slate-300 font-medium text-center md:text-left">
              Державно-приватний діалог · Дошка системних проблем бізнесу
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-medium tabular-nums">
            © {new Date().getFullYear()} Pulse.gov.ua
          </div>
        </div>
      </footer>

      {/* Problem Details Modal */}
      <ProblemModal
        problem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
      />

      {/* Data Source Modal (Google Sheets Link) */}
      <DataSourceModal
        isOpen={isSourceModalOpen}
        currentGoogleSheetUrl={googleSheetUrl}
        onClose={() => setIsSourceModalOpen(false)}
        onSaveGoogleSheet={handleSaveGoogleSheet}
        onResetToStaticCsv={handleResetToStaticCsv}
      />
    </div>
  );
}

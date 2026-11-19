import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ProblemItem, STAGES } from '../types/problem';
import { BarChart3, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface AnalyticsChartsProps {
  problems: ProblemItem[];
}

interface MonthDatum {
  ym: string; // YYYY-MM
  shortLabel: string;
  fullLabel: string;
  added: number;
  resolved: number;
}

const UK_MONTHS_SHORT = [
  'Січ',
  'Лют',
  'Бер',
  'Кві',
  'Тра',
  'Чер',
  'Лип',
  'Сер',
  'Вер',
  'Жов',
  'Лис',
  'Гру',
];

const UK_MONTHS_FULL = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

export function parseDateToYearMonth(dateStr: string): string | null {
  const s = (dateStr || '').trim();
  if (!s) return null;

  // DD.MM.YYYY or D.M.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  return null;
}

function formatYearMonth(ym: string): { shortLabel: string; fullLabel: string } {
  const [yearStr, monthStr] = ym.split('-');
  const monthIdx = Number(monthStr) - 1;
  const shortMonth = UK_MONTHS_SHORT[monthIdx] || monthStr;
  const fullMonth = UK_MONTHS_FULL[monthIdx] || monthStr;
  return {
    shortLabel: `${shortMonth} ${yearStr.slice(-2)}`,
    fullLabel: `${fullMonth} ${yearStr}`,
  };
}

function getStageBarColor(stage: string): string {
  const lower = stage.toLowerCase();
  if (lower.includes('вирішено')) return 'bg-emerald-500';
  if (lower.includes('відхилено')) return 'bg-rose-500';
  if (
    lower.includes('нов') ||
    lower.includes('очіку') ||
    lower.includes('аналіз')
  ) {
    return 'bg-sky-500';
  }
  return 'bg-indigo-500';
}

function getStageDotColor(stage: string): string {
  const lower = stage.toLowerCase();
  if (lower.includes('вирішено')) return 'bg-emerald-500';
  if (lower.includes('відхилено')) return 'bg-rose-500';
  if (
    lower.includes('нов') ||
    lower.includes('очіку') ||
    lower.includes('аналіз')
  ) {
    return 'bg-sky-500';
  }
  return 'bg-indigo-500';
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ problems }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [periodMode, setPeriodMode] = useState<'all' | '12m'>('all');
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // 1. Stage Funnel Data
  const funnelData = useMemo(() => {
    const counts: Record<string, { count: number; effect: number }> = {};
    STAGES.forEach((s) => {
      counts[s] = { count: 0, effect: 0 };
    });

    problems.forEach((p) => {
      const matched = STAGES.find((s) => s.trim() === p.stage?.trim()) || STAGES[0];
      counts[matched].count += 1;
      counts[matched].effect += Number(p.economicEffect) || 0;
    });

    const total = problems.length;
    const maxCount = Math.max(1, ...STAGES.map((s) => counts[s].count));

    return {
      total,
      maxCount,
      rows: STAGES.map((stage) => {
        const count = counts[stage].count;
        const effect = counts[stage].effect;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const widthPct = count > 0 ? Math.max(4, (count / maxCount) * 100) : 0;
        return { stage, count, effect, pct, widthPct };
      }),
    };
  }, [problems]);

  // 2. Monthly Added vs Resolved Data
  const monthlyAll = useMemo<MonthDatum[]>(() => {
    const map: Record<string, { added: number; resolved: number }> = {};

    problems.forEach((p) => {
      const addYm = parseDateToYearMonth(p.dateAdded);
      if (addYm) {
        if (!map[addYm]) map[addYm] = { added: 0, resolved: 0 };
        map[addYm].added += 1;
      }

      const resYm = parseDateToYearMonth(p.resolutionDate);
      if (resYm) {
        if (!map[resYm]) map[resYm] = { added: 0, resolved: 0 };
        map[resYm].resolved += 1;
      }
    });

    return Object.keys(map)
      .sort()
      .map((ym) => {
        const labels = formatYearMonth(ym);
        return {
          ym,
          shortLabel: labels.shortLabel,
          fullLabel: labels.fullLabel,
          added: map[ym].added,
          resolved: map[ym].resolved,
        };
      });
  }, [problems]);

  const visibleMonthly = useMemo(() => {
    if (periodMode === '12m' && monthlyAll.length > 12) {
      return monthlyAll.slice(-12);
    }
    return monthlyAll;
  }, [monthlyAll, periodMode]);

  const monthlySummary = useMemo(() => {
    let totalAdded = 0;
    let totalResolved = 0;
    let maxVal = 0;
    visibleMonthly.forEach((m) => {
      totalAdded += m.added;
      totalResolved += m.resolved;
      if (m.added > maxVal) maxVal = m.added;
      if (m.resolved > maxVal) maxVal = m.resolved;
    });

    // Calculate clean Y-axis ceiling (4 intervals)
    const rawMax = Math.max(4, maxVal);
    const step = Math.ceil(rawMax / 4);
    const niceStep =
      step <= 2
        ? step
        : step <= 5
        ? 5
        : step <= 10
        ? 10
        : step <= 25
        ? 25
        : step <= 50
        ? 50
        : Math.ceil(step / 10) * 10;
    const yMax = niceStep * 4;
    const ticks = [yMax, niceStep * 3, niceStep * 2, niceStep, 0];

    return { totalAdded, totalResolved, yMax, ticks };
  }, [visibleMonthly]);

  // Auto-scroll timeline to latest months when wide
  useEffect(() => {
    if (isExpanded && timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = timelineScrollRef.current.scrollWidth;
    }
  }, [isExpanded, visibleMonthly.length, periodMode]);

  const hoveredMonthObj = visibleMonthly.find((m) => m.ym === hoveredMonth) || null;

  return (
    <section aria-label="Аналітичні графіки" className="max-w-[1600px] w-full mx-auto px-4 sm:px-6">
      {/* Section Collapse/Expand Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>Аналітика (за поточними фільтрами)</span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
        >
          <span>{isExpanded ? 'Згорнути графіки' : 'Показати графіки'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Stage Funnel */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Воронка за кількістю проблем на стадіях</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Розподіл за 12 етапами життєвого циклу проблеми
                </p>
              </div>
              <span className="shrink-0 text-xs font-extrabold text-slate-700 tabular-nums whitespace-nowrap">
                {funnelData.total.toLocaleString('uk-UA')} всього
              </span>
            </div>

            <div className="space-y-1.5 flex-1">
              {funnelData.rows.map((row) => {
                const isHovered = hoveredStage === row.stage;
                const barColor = getStageBarColor(row.stage);
                const dotColor = getStageDotColor(row.stage);

                return (
                  <div
                    key={row.stage}
                    onMouseEnter={() => setHoveredStage(row.stage)}
                    onMouseLeave={() => setHoveredStage(null)}
                    className={`group grid grid-cols-[minmax(130px,175px)_1fr_auto] items-center gap-2.5 px-2 py-1 rounded-lg transition-colors ${
                      isHovered ? 'bg-slate-50' : ''
                    }`}
                    title={`${row.stage}: ${row.count} (${row.pct.toFixed(1)}%)${
                      row.effect > 0 ? ` • Ефект: ${row.effect.toLocaleString('uk-UA')} млн грн` : ''
                    }`}
                  >
                    {/* Stage Label */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {row.stage}
                      </span>
                    </div>

                    {/* Symmetrical Centered Funnel Bar */}
                    <div className="h-5 flex items-center justify-center bg-slate-100/80 rounded-md px-1 overflow-hidden">
                      {row.count > 0 ? (
                        <div
                          className={`h-3.5 rounded-sm transition-all duration-300 ${barColor} ${
                            isHovered ? 'brightness-110 shadow-xs' : 'opacity-90'
                          }`}
                          style={{ width: `${row.widthPct}%` }}
                        />
                      ) : (
                        <div className="w-4 h-px bg-slate-300" />
                      )}
                    </div>

                    {/* Count & Percentage */}
                    <div className="text-right tabular-nums whitespace-nowrap text-[11px] min-w-[68px]">
                      <span className="font-extrabold text-slate-900">{row.count}</span>
                      <span className="text-slate-400 ml-1">({row.pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Funnel Legend */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Очікує розгляду (1–3)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                В роботі (4–10)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Вирішено (11)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Відхилено (12)
              </span>
            </div>
          </div>

          {/* Chart 2: Monthly Added vs Resolved */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                  Динаміка «Додано» / «Вирішено» помісячно
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Порівняння за датою додавання та датою вирішення
                </p>
              </div>

              {/* Period Switch */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => setPeriodMode('12m')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    periodMode === '12m'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Останні 12 міс.
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodMode('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    periodMode === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Увесь період
                </button>
              </div>
            </div>

            {/* Summary Metadata + Live Hover Details */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex items-center gap-4 tabular-nums">
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  <span>Додано:</span>
                  <span className="text-blue-700 font-extrabold">{monthlySummary.totalAdded}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                  <span>Вирішено:</span>
                  <span className="text-emerald-700 font-extrabold">{monthlySummary.totalResolved}</span>
                </span>
              </div>

              {hoveredMonthObj ? (
                <div className="text-xs font-bold text-slate-700 tabular-nums">
                  {hoveredMonthObj.fullLabel}:{' '}
                  <span className="text-blue-700">+{hoveredMonthObj.added}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-emerald-700">{hoveredMonthObj.resolved} вирішено</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Наведіть на стовпчик для деталей
                </span>
              )}
            </div>

            {/* Chart Area */}
            {visibleMonthly.length === 0 ? (
              <div className="flex-1 min-h-[240px] flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Немає заповнених дат додавання або вирішення для вибраних фільтрів
              </div>
            ) : (
              <div className="flex-1 flex items-start">
                {/* Fixed Y-Axis Labels (pt-5 matches plot headroom, h-[220px] matches bar grid, pb-7 matches X-axis) */}
                <div className="pt-5 pb-7 pr-2 shrink-0 w-9 select-none">
                  <div className="h-[220px] flex flex-col justify-between text-[10px] font-medium text-slate-400 tabular-nums text-right leading-none">
                    {monthlySummary.ticks.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Scrollable Bars Plot */}
                <div
                  ref={timelineScrollRef}
                  className="flex-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300"
                >
                  <div
                    className="relative w-full pt-5 flex flex-col"
                    style={{
                      minWidth: `${Math.max(100, visibleMonthly.length * 42)}px`,
                    }}
                  >
                    {/* Plot Grid + Bars (exact 220px height aligned with Y-axis) */}
                    <div className="relative h-[220px] border-l border-b border-slate-200">
                      {/* Horizontal Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {monthlySummary.ticks.map((t, idx) => (
                          <div
                            key={t}
                            className={`w-full ${
                              idx === monthlySummary.ticks.length - 1
                                ? ''
                                : 'border-t border-dashed border-slate-200/80'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Month Bar Groups */}
                      <div className="relative z-10 h-[220px] flex items-end justify-around px-2 gap-1">
                        {visibleMonthly.map((m) => {
                          const BAR_AREA_PX = 220;
                          const addPx =
                            m.added > 0
                              ? Math.max(3, Math.round((m.added / monthlySummary.yMax) * BAR_AREA_PX))
                              : 0;
                          const resPx =
                            m.resolved > 0
                              ? Math.max(3, Math.round((m.resolved / monthlySummary.yMax) * BAR_AREA_PX))
                              : 0;
                          const isHovered = hoveredMonth === m.ym;

                          return (
                            <div
                              key={m.ym}
                              onMouseEnter={() => setHoveredMonth(m.ym)}
                              onMouseLeave={() => setHoveredMonth(null)}
                              className={`h-[220px] flex-1 min-w-[34px] max-w-[54px] flex items-end justify-center gap-0.5 px-0.5 rounded-t-md transition-colors cursor-default ${
                                isHovered ? 'bg-slate-100/80' : ''
                              }`}
                              title={`${m.fullLabel}\nДодано: ${m.added}\nВирішено: ${m.resolved}`}
                            >
                              {/* Added Bar */}
                              <div className="relative h-[220px] flex-1 flex flex-col justify-end items-center">
                                {m.added > 0 && (
                                  <span
                                    className="absolute text-[9px] font-bold text-blue-700 leading-none tabular-nums pointer-events-none"
                                    style={{ bottom: `${addPx + 3}px` }}
                                  >
                                    {m.added}
                                  </span>
                                )}
                                <div
                                  className="w-full bg-blue-600 rounded-t-xs transition-all duration-300"
                                  style={{ height: `${addPx}px` }}
                                />
                              </div>

                              {/* Resolved Bar */}
                              <div className="relative h-[220px] flex-1 flex flex-col justify-end items-center">
                                {m.resolved > 0 && (
                                  <span
                                    className="absolute text-[9px] font-bold text-emerald-700 leading-none tabular-nums pointer-events-none"
                                    style={{ bottom: `${resPx + 3}px` }}
                                  >
                                    {m.resolved}
                                  </span>
                                )}
                                <div
                                  className="w-full bg-emerald-500 rounded-t-xs transition-all duration-300"
                                  style={{ height: `${resPx}px` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* X-Axis Month Labels */}
                    <div className="h-7 flex items-center justify-around px-2 gap-1">
                      {visibleMonthly.map((m) => (
                        <div
                          key={m.ym}
                          className={`flex-1 min-w-[34px] max-w-[54px] text-center text-[10px] font-medium truncate ${
                            hoveredMonth === m.ym ? 'text-slate-900 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {m.shortLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

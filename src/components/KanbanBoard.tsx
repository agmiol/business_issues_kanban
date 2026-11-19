import React, { useRef, useEffect } from 'react';
import { ProblemItem, STAGES } from '../types/problem';
import { ProblemCard } from './ProblemCard';
import { Inbox, Info, Search, X } from 'lucide-react';

interface KanbanBoardProps {
  problems: ProblemItem[];
  onCardClick: (problem: ProblemItem) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  problems,
  onCardClick,
  searchQuery,
  onSearchQueryChange,
}) => {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const topSpacerRef = useRef<HTMLDivElement>(null);
  const boardScrollRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef<'top' | 'board' | null>(null);

  useEffect(() => {
    const board = boardScrollRef.current;
    const spacer = topSpacerRef.current;
    if (!board || !spacer) return;

    const syncWidth = () => {
      spacer.style.width = `${board.scrollWidth}px`;
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(board);
    window.addEventListener('resize', syncWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncWidth);
    };
  }, [problems]);

  const handleTopScroll = () => {
    if (syncingRef.current === 'board') {
      syncingRef.current = null;
      return;
    }
    if (topScrollRef.current && boardScrollRef.current) {
      syncingRef.current = 'top';
      boardScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
      requestAnimationFrame(() => {
        if (syncingRef.current === 'top') syncingRef.current = null;
      });
    }
  };

  const handleBoardScroll = () => {
    if (syncingRef.current === 'top') {
      syncingRef.current = null;
      return;
    }
    if (topScrollRef.current && boardScrollRef.current) {
      syncingRef.current = 'board';
      topScrollRef.current.scrollLeft = boardScrollRef.current.scrollLeft;
      requestAnimationFrame(() => {
        if (syncingRef.current === 'board') syncingRef.current = null;
      });
    }
  };

  // Group problems by stage
  const stageMap: Record<string, ProblemItem[]> = {};
  STAGES.forEach((stage) => {
    stageMap[stage] = [];
  });

  problems.forEach((p) => {
    // Find matching stage key
    const matchKey = STAGES.find((s) => s.trim() === p.stage.trim()) || p.stage;
    if (stageMap[matchKey]) {
      stageMap[matchKey].push(p);
    } else {
      // Default to stage 1 if missing
      stageMap[STAGES[0]] = stageMap[STAGES[0]] || [];
      stageMap[STAGES[0]].push(p);
    }
  });

  return (
    <section aria-label="Канбан-дошка" className="max-w-[1600px] w-full mx-auto px-4 sm:px-6">
      {/* Board Description & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-semibold">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          Клацніть на картку для перегляду детальної інформації.
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Пошук за ID, описом, органом..."
              className="w-full min-h-[38px] pl-9 pr-8 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
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

          <span className="font-bold text-slate-700 tabular-nums whitespace-nowrap self-end sm:self-auto">
            Усього на дошці: {problems.length.toLocaleString('uk-UA')}
          </span>
        </div>
      </div>

      {/* Top Synchronized Horizontal Scrollbar */}
      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="overflow-x-auto overflow-y-hidden mb-2 scrollbar-thin"
      >
        <div ref={topSpacerRef} className="h-0.5" />
      </div>

      {/* Horizontal Scroll Columns Container */}
      <div
        ref={boardScrollRef}
        onScroll={handleBoardScroll}
        className="flex gap-3.5 overflow-x-auto pb-5 pt-1 min-h-[calc(100vh-280px)] snap-x snap-mandatory sm:snap-none scrollbar-thin"
      >
        {STAGES.map((stage) => {
          const items = stageMap[stage] || [];
          const isResolvedStage = stage.includes('Вирішено');
          const isRejectedStage = stage.includes('Відхилено');

          return (
            <div
              key={stage}
              className="w-[85vw] sm:w-80 shrink-0 snap-center sm:snap-align-none flex flex-col rounded-2xl border border-slate-200/90 bg-white/80 p-3.5 shadow-xs transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isResolvedStage
                        ? 'bg-emerald-500'
                        : isRejectedStage
                        ? 'bg-rose-500'
                        : 'bg-blue-600'
                    }`}
                  />
                  <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate" title={stage}>
                    {stage}
                  </h2>
                </div>

                <span className="text-xs font-extrabold text-slate-700 tabular-nums shrink-0">
                  {items.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 min-h-[150px] max-h-[calc(100vh-340px)] scrollbar-thin">
                {items.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center bg-slate-50/50">
                    <Inbox className="w-5 h-5 mb-1 opacity-50" />
                    <span>Немає карток</span>
                  </div>
                ) : (
                  items.map((problem) => (
                    <ProblemCard
                      key={problem.id}
                      problem={problem}
                      onClick={onCardClick}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

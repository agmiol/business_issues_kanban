import React from 'react';
import { Download, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onExportClick: () => void;
  onRefreshClick: () => void;
  onSourceClick: () => void;
  isGoogleSheet: boolean;
  totalCount: number;
  filteredCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onExportClick,
  onRefreshClick,
  onSourceClick,
  isGoogleSheet,
  filteredCount,
}) => {
  return (
    <header
      className="sticky top-0 z-30 text-slate-900 shadow-xs border-b border-[#b9e4fa]"
      style={{ background: 'linear-gradient(90deg, #c8ecff 0%, #daf1fe 100%)' }}
    >
      {/* Top Ukrainian Flag Strip */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-600 w-full" />

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-8">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 px-2.5 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-blue-300/80 bg-white shrink-0">
            <img
              src="/assets/aistudio/Pulse_logo_with_brand_bc7ce3e2.svg"
              alt="Платформа Пульс"
              className="h-6 w-auto object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-extrabold tracking-widest text-blue-900 uppercase">
                PULSE.GOV.UA
              </span>
              <span className="hidden lg:inline text-slate-400" aria-hidden="true">·</span>
              <span className="hidden lg:inline text-slate-700 font-semibold truncate">
                Державно-приватний діалог · Системні проблеми бізнесу
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 truncate">
              Дошка системних проблем бізнесу
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none pb-0.5 md:pb-0 shrink-0">
          <button
            type="button"
            onClick={onSourceClick}
            title={isGoogleSheet ? 'Підключено Google Таблицю' : 'Налаштувати джерело даних (Google Таблиця)'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] ${
              isGoogleSheet
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100/80'
                : 'bg-white/90 border-blue-200/90 text-slate-800 hover:bg-white hover:border-blue-300'
            }`}
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${isGoogleSheet ? 'text-emerald-600' : 'text-blue-600'}`} />
            <span>{isGoogleSheet ? 'Google Таблиця' : 'Джерело даних'}</span>
          </button>

          <button
            type="button"
            onClick={onExportClick}
            title="Експорт відфільтрованих проблем у CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white/90 border border-blue-200/90 rounded-lg hover:bg-white hover:border-blue-300 transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="tabular-nums">Експорт ({filteredCount})</span>
          </button>

          <button
            type="button"
            onClick={onRefreshClick}
            title="Оновити дані з джерела"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>Оновити</span>
          </button>
        </div>
      </div>
    </header>
  );
};

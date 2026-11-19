import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, CheckCircle2, AlertCircle, RotateCcw, Loader2, ExternalLink } from 'lucide-react';

interface DataSourceModalProps {
  isOpen: boolean;
  currentGoogleSheetUrl: string;
  onClose: () => void;
  onSaveGoogleSheet: (url: string) => Promise<void>;
  onResetToStaticCsv: () => Promise<void>;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  currentGoogleSheetUrl,
  onClose,
  onSaveGoogleSheet,
  onResetToStaticCsv,
}) => {
  const [urlInput, setUrlInput] = useState(currentGoogleSheetUrl);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentGoogleSheetUrl);
      setErrorMsg(null);
    }
  }, [isOpen, currentGoogleSheetUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg('Вставте посилання на Google Таблицю.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSaveGoogleSheet(trimmed);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Не вдалося підключити Google Таблицю.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onResetToStaticCsv();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Не вдалося повернутися до базового CSV.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div
          className="shrink-0 px-5 py-4 sm:px-6 border-b border-[#b9e4fa] flex items-center justify-between gap-4"
          style={{ background: 'linear-gradient(90deg, #c8ecff 0%, #daf1fe 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-blue-300/80 text-blue-700 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                Джерело даних дашборду
              </h2>
              <p className="text-xs text-slate-700 font-medium">
                Підключення Google Таблиці за посиланням
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Закрити"
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-blue-200/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Current Status */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-slate-500 font-medium block mb-0.5">Поточне джерело:</span>
              {currentGoogleSheetUrl ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Google Таблиця за посиланням</span>
                </div>
              ) : (
                <div className="text-slate-800 font-semibold">
                  Локальний резервний CSV-файл
                </div>
              )}
            </div>

            {currentGoogleSheetUrl && (
              <a
                href={currentGoogleSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Відкрити</span>
              </a>
            )}
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="google-sheet-url" className="block font-bold text-slate-700 mb-1.5">
              Посилання на Google Таблицю:
            </label>
            <input
              id="google-sheet-url"
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              disabled={submitting}
            />
          </div>

          {/* Instructions */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-slate-700 space-y-1.5 leading-relaxed">
            <div className="font-bold text-blue-950">Як підключити таблицю:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                У Google Таблиці натисніть <strong>«Поділитися»</strong> та встановіть доступ{' '}
                <strong>«Усі, хто має посилання — Переглядач»</strong> (або опублікуйте в інтернеті як CSV).
              </li>
              <li>
                Скопіюйте посилання з адресного рядка браузера (разом із{' '}
                <code className="px-1 py-0.5 bg-white rounded border border-blue-200">#gid=...</code>, якщо потрібен конкретний аркуш) та вставте вище.
              </li>
              <li>
                Натисніть <strong>«Підключити та завантажити»</strong>. Посилання збережеться у вашому браузері, а кнопка <strong>«Оновити»</strong> щоразу підтягуватиме актуальні дані.
              </li>
            </ol>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            {currentGoogleSheetUrl ? (
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Локальний CSV</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Скасувати
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{submitting ? 'Завантаження...' : 'Підключити та завантажити'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

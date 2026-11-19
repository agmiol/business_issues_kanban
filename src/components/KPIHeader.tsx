import React from 'react';
import { ProblemItem } from '../types/problem';
import { Layers, Clock, Flame, CheckCircle2, XCircle, Send, CheckCheck } from 'lucide-react';

interface KPIHeaderProps {
  problems: ProblemItem[];
  activeKpiFilter: string | null;
  onKpiClick: (filterKey: string | null) => void;
}

// Stage grouping helpers for the 12 stages:
// 1. Нові -> ОЧІКУЄ РОЗГЛЯДУ
// 2. Очікує на розгляд -> ОЧІКУЄ РОЗГЛЯДУ
// 3. Взято в аналіз ЦОВВ -> ОЧІКУЄ РОЗГЛЯДУ
// 4. Консультацій з ЦОВВ -> В РОБОТІ
// 5. Розробка НПА -> В РОБОТІ
// 6. Погодження ЦОВВ -> В РОБОТІ
// 7. Подано в КМУ -> В РОБОТІ
// 8. Подано до ВРУ -> В РОБОТІ
// 9. Прийнято НПА -> В РОБОТІ
// 10. Технічне впровадження -> В РОБОТІ
// 11. Вирішено -> ВПРОВАДЖЕНО
// 12. Відхилено -> ВІДХИЛЕНО

export function isAwaitingStage(stage: string): boolean {
  if (!stage) return false;
  const lower = stage.toLowerCase();
  return (
    lower.includes('нов') ||
    lower.includes('очіку') ||
    lower.includes('аналіз')
  );
}

export function isInWorkStage(stage: string): boolean {
  if (!stage) return false;
  const lower = stage.toLowerCase();
  return (
    lower.includes('консультаці') ||
    lower.includes('розробка') ||
    lower.includes('погодження') ||
    lower.includes('подано') ||
    lower.includes('кму') ||
    lower.includes('вру') ||
    lower.includes('прийнято') ||
    lower.includes('техніч') ||
    lower.includes('впровадж') ||
    lower.includes('нпа')
  );
}

export function isImplementedStage(stage: string): boolean {
  if (!stage) return false;
  return stage.toLowerCase().includes('вирішено');
}

export function isRejectedStage(stage: string): boolean {
  if (!stage) return false;
  return stage.toLowerCase().includes('відхилено');
}

export const KPIHeader: React.FC<KPIHeaderProps> = ({
  problems,
  activeKpiFilter,
  onKpiClick,
}) => {
  const total = problems.length;
  const awaiting = problems.filter((p) => isAwaitingStage(p.stage)).length;
  const inWork = problems.filter((p) => isInWorkStage(p.stage)).length;
  const implemented = problems.filter((p) => isImplementedStage(p.stage)).length;
  const rejected = problems.filter((p) => isRejectedStage(p.stage)).length;
  const mrg = problems.filter((p) => p.platform.toUpperCase().includes('МРГ')).length;
  const mrgResolved = problems.filter(
    (p) => p.platform.toUpperCase().includes('МРГ') && isImplementedStage(p.stage)
  ).length;

  const kpiCards = [
    {
      key: 'total',
      label: 'Зафіксовано',
      val: total,
      subLabel: 'Усі зареєстровані',
      icon: Layers,
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-900',
      activeBorder: 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/20',
    },
    {
      key: 'awaiting',
      label: 'Очікує розгляду',
      val: awaiting,
      subLabel: 'Стадії 1–3',
      icon: Clock,
      iconColor: 'text-amber-600',
      valueColor: 'text-slate-900',
      activeBorder: 'border-amber-500 ring-2 ring-amber-300 bg-amber-50/20',
    },
    {
      key: 'inWork',
      label: 'В роботі',
      val: inWork,
      subLabel: 'Стадії 4–10',
      icon: Flame,
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      activeBorder: 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/20',
    },
    {
      key: 'implemented',
      label: 'Впроваджено',
      val: implemented,
      subLabel: 'Вирішено повністю',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50/20',
    },
    {
      key: 'rejected',
      label: 'Відхилено',
      val: rejected,
      subLabel: 'Закрито без змін',
      icon: XCircle,
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-600',
      activeBorder: 'border-rose-500 ring-2 ring-rose-300 bg-rose-50/20',
    },
    {
      key: 'mrg',
      label: 'Винесено на МРГ',
      val: mrg,
      subLabel: 'Робочі групи',
      icon: Send,
      iconColor: 'text-indigo-600',
      valueColor: 'text-slate-900',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50/20',
    },
    {
      key: 'mrgResolved',
      label: 'Вирішено на МРГ',
      val: mrgResolved,
      subLabel: 'Успішні кейси МРГ',
      icon: CheckCheck,
      iconColor: 'text-teal-600',
      valueColor: 'text-emerald-600',
      activeBorder: 'border-teal-500 ring-2 ring-teal-300 bg-teal-50/20',
    },
  ];

  return (
    <section aria-label="Ключові показники" className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const isActive = activeKpiFilter === card.key;
          const sharePct = total > 0 ? Math.round((card.val / total) * 100) : 0;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onKpiClick(isActive ? null : card.key)}
              className={`text-left bg-white rounded-2xl p-3.5 sm:p-4 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-blue-400 flex flex-col justify-between min-h-[112px] ${
                index === 0 ? 'col-span-2 sm:col-span-1' : ''
              } ${isActive ? card.activeBorder : 'border-slate-200/90'}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  <span className="truncate">{card.label}</span>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${card.iconColor}`} />
                </div>
                <div className={`text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums ${card.valueColor}`}>
                  {card.val.toLocaleString('uk-UA')}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px]">
                <span className="text-slate-400 font-medium truncate">{card.subLabel}</span>
                <span className="font-bold text-slate-600 tabular-nums shrink-0">
                  {card.key === 'total' ? '100%' : `${sharePct}%`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export type ExecutionStatus = 'В роботі за планом' | 'Потребує уваги' | 'Заблоковано' | 'Відкладено' | '' | string;

export interface ProblemItem {
  id: string; // e.g., ДБ-0001
  platform: string; // Майданчик для вирішення (МРГ ММБ, Асоціації, тощо)
  applicant: string; // Заявник (детально)
  dateAdded: string; // Дата додавання
  title: string; // Подана проблема (яка вимагає зміни в законодавстві Украіни)
  submittedProblem: string; // Подана проблема
  siteDescription?: string; // Опис проблеми та рішення для сайту
  category: string; // Категорія
  proposedSolution: string; // Пропозиція рішення
  priority: string; // Пріоритет (1. Потребує негайного розгляду, 2. Високий пріоритет, 3. Загальний пріоритет)
  economicEffect: number; // Річний економічний ефект, млн. грн
  executor: string; // Виконавець (Мінекономіки, Мінфін, МОЗ, тощо)
  stage: string; // Стадія (1. Нові, 2. Очікує на розгляд, ... 12. Відхилено)
  executionStatus: ExecutionStatus; // Статус виконання (В роботі за планом, Відкладено, Заблоковано)
  covvResponse: string; // Рішення ЦОВВ відповідь результат
  resolutionDate: string; // Дата вирішення
  additionalMaterialsUrl: string; // Контакти розробника / Додаткові матеріали
  npaType: string; // Вид НПА (Закон, Постанова КМУ, Наказ, тощо)
  blocker: string; // Блокер
}

export const STAGES = [
  '1. Нові',
  '2. Очікує на розгляд',
  '3. Взято в аналіз ЦОВВ',
  '4. Консультацій з ЦОВВ',
  '5. Розробка НПА',
  '6. Погодження ЦОВВ',
  '7. Подано в КМУ',
  '8. Подано до ВРУ',
  '9. Прийнято НПА',
  '10. Технічне впровадження',
  '11. Вирішено',
  '12. Відхилено',
] as const;

export function normalizeStage(rawStage: string): string {
  const cleaned = (rawStage || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return STAGES[0];

  const lower = cleaned.toLowerCase();

  // Exact match against any stage in STAGES
  const exact = STAGES.find((s) => s.toLowerCase() === lower);
  if (exact) return exact;

  // Match by stage name without leading number prefix ("1. ", "10. ", etc.)
  const withoutNum = lower.replace(/^\d+\.\s*/, '');
  const byName = STAGES.find((s) => s.toLowerCase().replace(/^\d+\.\s*/, '') === withoutNum);
  if (byName) return byName;

  // Keyword fallbacks for minor spelling or legacy CSV variations
  if (withoutNum.includes('нов')) return '1. Нові';
  if (withoutNum.includes('очіку') || withoutNum.includes('відкладен')) return '2. Очікує на розгляд';
  if (withoutNum.includes('аналіз')) return '3. Взято в аналіз ЦОВВ';
  if (withoutNum.includes('консультаці')) return '4. Консультацій з ЦОВВ';
  if (withoutNum.includes('розробка нпа') || withoutNum.includes('проєкт нпа')) return '5. Розробка НПА';
  if (withoutNum.includes('погодження')) return '6. Погодження ЦОВВ';
  if (withoutNum.includes('кму')) return '7. Подано в КМУ';
  if (withoutNum.includes('вру') || withoutNum.includes('подання')) return '8. Подано до ВРУ';
  if (withoutNum.includes('прийнято')) return '9. Прийнято НПА';
  if (withoutNum.includes('техніч') || withoutNum.includes('впровадж')) return '10. Технічне впровадження';
  if (withoutNum.includes('вирішено')) return '11. Вирішено';
  if (withoutNum.includes('відхилено')) return '12. Відхилено';

  return cleaned;
}

export const EXECUTION_STATUSES = [
  'В роботі за планом',
  'Потребує уваги',
  'Заблоковано',
  'Відкладено',
] as const;

export function normalizeExecutionStatus(rawStatus: string): string {
  const cleaned = (rawStatus || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Статус не вказано';

  const withoutNum = cleaned.toLowerCase().replace(/^\d+\.\s*/, '');

  if (withoutNum.includes('не вказан')) {
    return 'Статус не вказано';
  }

  if (withoutNum.includes('планом') || withoutNum.includes('в роботі')) {
    return 'В роботі за планом';
  }
  if (withoutNum.includes('уваг') || withoutNum.includes('потребує')) {
    return 'Потребує уваги';
  }
  if (withoutNum.includes('заблоковано') || withoutNum.includes('блоков')) {
    return 'Заблоковано';
  }
  if (withoutNum.includes('відкладено')) {
    return 'Відкладено';
  }

  return cleaned;
}

export const STATUS_CARD_COLORS: Record<string, {
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  text: string;
  label: string;
}> = {
  'В роботі за планом': {
    bg: 'bg-emerald-50/90 hover:bg-emerald-100/90',
    border: 'border-emerald-300 hover:border-emerald-400',
    badgeBg: 'bg-emerald-100/80',
    badgeText: 'text-emerald-800',
    dot: 'bg-emerald-500',
    text: 'text-emerald-950',
    label: 'В роботі за планом',
  },
  'Потребує уваги': {
    bg: 'bg-orange-50/90 hover:bg-orange-100/90',
    border: 'border-orange-300 hover:border-orange-400',
    badgeBg: 'bg-orange-100/80',
    badgeText: 'text-orange-800',
    dot: 'bg-orange-500',
    text: 'text-orange-950',
    label: 'Потребує уваги',
  },
  'Заблоковано': {
    bg: 'bg-rose-50/90 hover:bg-rose-100/90',
    border: 'border-rose-300 hover:border-rose-400',
    badgeBg: 'bg-rose-100/80',
    badgeText: 'text-rose-800',
    dot: 'bg-rose-500',
    text: 'text-rose-950',
    label: 'Заблоковано',
  },
  'Відкладено': {
    bg: 'bg-slate-100/90 hover:bg-slate-200/80',
    border: 'border-slate-300 hover:border-slate-400',
    badgeBg: 'bg-slate-200/90',
    badgeText: 'text-slate-700',
    dot: 'bg-slate-500',
    text: 'text-slate-900',
    label: 'Відкладено',
  },
};

export function isUrgentPriority(priority: string): boolean {
  if (!priority) return false;
  const lower = priority.toLowerCase();
  return lower.includes('негайн') || lower.includes('1.');
}

export function matchesPriority(itemPriority: string, filterValue: string): boolean {
  if (!filterValue || filterValue === 'all') return true;
  const itemLower = (itemPriority || '').toLowerCase();
  const filterLower = filterValue.toLowerCase();

  if (filterLower.includes('негайн') || filterLower.includes('1.')) {
    return isUrgentPriority(itemPriority);
  }
  if (filterLower.includes('висок') || filterLower.includes('2.')) {
    return itemLower.includes('висок') || itemLower.includes('2.');
  }
  if (filterLower.includes('загальн') || filterLower.includes('3.')) {
    return itemLower.includes('загальн') || itemLower.includes('3.');
  }
  return itemLower.includes(filterLower);
}

export function parseApplicants(raw: string): string[] {
  if (!raw) return [];
  const normalized = raw.replace(/\r?\n\s*(?=«)/g, ' ');
  const results: string[] = [];
  let current = '';
  let inCurlyQuote = false;
  let inGuillemet = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '“') inCurlyQuote = true;
    else if (ch === '”') inCurlyQuote = false;
    else if (ch === '«') inGuillemet = true;
    else if (ch === '»') inGuillemet = false;

    const insideQuotes = inCurlyQuote || inGuillemet;
    if (!insideQuotes && (ch === ',' || ch === '\n' || ch === '\r')) {
      const cleaned = current.replace(/\s+/g, ' ').trim();
      if (cleaned) results.push(cleaned);
      current = '';
    } else {
      current += ch;
    }
  }

  const last = current.replace(/\s+/g, ' ').trim();
  if (last) results.push(last);
  return results;
}

export function getStatusStyle(status: string) {
  const normalized = (status || '').trim().toLowerCase();
  if (!normalized || normalized.includes('не вказан')) {
    return {
      bg: 'bg-white hover:bg-slate-50',
      border: 'border-slate-200 hover:border-slate-300',
      badgeBg: 'bg-slate-50 border border-slate-200',
      badgeText: 'text-slate-500',
      dot: 'bg-slate-300',
      text: 'text-slate-900',
      label: 'Статус не вказано',
    };
  }
  if (normalized.includes('планом') || normalized.includes('в роботі')) {
    return STATUS_CARD_COLORS['В роботі за планом'];
  }
  if (normalized.includes('уваг') || normalized.includes('потребує')) {
    return STATUS_CARD_COLORS['Потребує уваги'];
  }
  if (normalized.includes('заблоковано') || normalized.includes('блоков')) {
    return STATUS_CARD_COLORS['Заблоковано'];
  }
  if (normalized.includes('відкладено')) {
    return STATUS_CARD_COLORS['Відкладено'];
  }
  return {
    bg: 'bg-white hover:bg-slate-50',
    border: 'border-slate-200 hover:border-slate-300',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    dot: 'bg-slate-400',
    text: 'text-slate-900',
    label: status.trim(),
  };
}

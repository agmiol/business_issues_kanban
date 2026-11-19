import Papa from 'papaparse';
import { ProblemItem, normalizeStage, normalizeExecutionStatus } from '../types/problem';

const CSV_PATH = '/public/assets/aistudio/0._________________________06112026_e14e86b8.csv';

export async function loadProblemsFromCSV(googleSheetUrl?: string): Promise<ProblemItem[]> {
  const sheetUrl = googleSheetUrl?.trim();

  if (sheetUrl) {
    const response = await fetch(`/api/google-sheet?url=${encodeURIComponent(sheetUrl)}`);
    if (!response.ok) {
      let errorMessage = `Не вдалося завантажити Google Таблицю (${response.status})`;
      try {
        const errData = await response.json();
        if (errData?.error) errorMessage = errData.error;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    const parsed = parseCSVText(text, true);
    if (parsed.length === 0) {
      throw new Error(
        'У Google Таблиці не знайдено жодного запису з очікуваними колонками (зокрема «Подана проблема» або «Опис проблеми»).'
      );
    }
    return parsed;
  }

  try {
    const response = await fetch(CSV_PATH);
    if (!response.ok) {
      // try fallback relative path if public prefix fails
      const fallbackResponse = await fetch('/assets/aistudio/0._________________________06112026_e14e86b8.csv');
      if (!fallbackResponse.ok) {
        throw new Error(`Failed to load CSV: ${response.statusText}`);
      }
      const text = await fallbackResponse.text();
      return parseCSVText(text);
    }
    const text = await response.text();
    return parseCSVText(text);
  } catch (err) {
    console.warn('Error loading CSV file, using fallback sample dataset:', err);
    return getFallbackData();
  }
}

function parseCSVText(text: string, strict = false): ProblemItem[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    delimiter: '',
    delimitersToGuess: [';', ',', '\t'],
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (!result.data || result.data.length === 0) {
    return strict ? [] : getFallbackData();
  }

  const items: ProblemItem[] = [];

  result.data.forEach((row, idx) => {
    // Find keys matching columns flexibly because headers might contain multiline breaks or trailing spaces
    const keys = Object.keys(row);

    const getVal = (fieldPattern: string): string => {
      const target = fieldPattern.trim().toLowerCase();
      const exactKey = keys.find((k) => k.trim().toLowerCase() === target);
      const matchKey =
        exactKey || keys.find((k) => k.toLowerCase().includes(target));
      return matchKey ? (row[matchKey] || '').trim() : '';
    };

    const id = getVal('ID') || `ДБ-${String(idx + 1).padStart(4, '0')}`;
    const platform = getVal('Майданчик') || 'МРГ ММБ';
    const applicant = getVal('Заявник');
    const dateAdded = getVal('Дата додавання');
    const siteDescription = getVal('Опис проблеми');
    const submittedProblem = getVal('Подана проблема');
    const category = getVal('Категорія') || 'Загальна';
    const proposedSolution = getVal('Пропозиція рішення');
    const priority = getVal('Пріоритет') || '3. Загальний пріоритет';
    const econStr = getVal('економічний ефект').replace(/\s+/g, '').replace(',', '.');
    const economicEffect = parseFloat(econStr) || 0;
    const executor = getVal('Виконавець') || 'Мінекономіки';
    const stage = normalizeStage(getVal('Стадія'));
    const executionStatus = normalizeExecutionStatus(getVal('Статус'));
    const covvResponse = getVal('Рішення ЦОВВ') || getVal('відповідь');
    const resolutionDate = getVal('Дата вирішення');
    const additionalMaterialsUrl = getVal('Контакти') || getVal('Додаткові');
    const npaType = getVal('Вид НПА');
    const blocker = getVal('Блокер');

    // Ignore row completely if "Дата додавання" is empty
    if (!dateAdded) {
      return;
    }

    // Formulations should come from "Подана проблема (яка вимагає зміни в законодавстві Украіни)"
    const formulation = submittedProblem || siteDescription;

    if (formulation) {
      items.push({
        id,
        platform,
        applicant,
        dateAdded,
        title: formulation,
        submittedProblem: formulation,
        siteDescription,
        category,
        proposedSolution,
        priority,
        economicEffect,
        executor,
        stage,
        executionStatus,
        covvResponse,
        resolutionDate,
        additionalMaterialsUrl,
        npaType,
        blocker,
      });
    }
  });

  return items.length > 0 ? items : (strict ? [] : getFallbackData());
}

function getFallbackData(): ProblemItem[] {
  return [
    {
      id: 'ДБ-0091',
      platform: 'МРГ ММБ',
      applicant: 'УРБ',
      dateAdded: '01.09.2025',
      title: 'Прифронтовому МСП бракує адресної підтримки на рівні громад',
      submittedProblem: 'В умовах війни малий бізнес у прифронтових областях зазнає постійних збитків.',
      category: 'Підтримка бізнесу',
      proposedSolution: 'Створення цільових грантових програм для малого бізнесу.',
      priority: '3. Загальний пріоритет',
      economicEffect: 150,
      executor: 'Мінрозвитку',
      stage: '2. Очікує на розгляд',
      executionStatus: 'В роботі за планом',
      covvResponse: 'Проєкт в стадії аналізу потреб регіональних громад.',
      resolutionDate: '',
      additionalMaterialsUrl: '',
      npaType: 'Постанова КМУ',
      blocker: '',
    },
    {
      id: 'ДБ-0090',
      platform: 'МРГ ММБ',
      applicant: 'Спілка Підприємців',
      dateAdded: '02.09.2025',
      title: 'Прифронтовий бізнес обмежено допущено до державних закупівель',
      submittedProblem: 'Складність укладення оборонних та цивільних контрактів через логістичні ризики.',
      category: 'Закупівлі',
      proposedSolution: 'Внесення змін до правил аукціонів Prozorro.',
      priority: '3. Загальний пріоритет',
      economicEffect: 320,
      executor: 'Мінекономіки',
      stage: '3. Взято в аналіз ЦОВВ',
      executionStatus: 'В роботі за планом',
      covvResponse: 'Опрацьовується фахівцями Мінекономіки.',
      resolutionDate: '',
      additionalMaterialsUrl: '',
      npaType: 'Наказ',
      blocker: '',
    },
    {
      id: 'ДБ-0082',
      platform: 'МРГ Регіони',
      applicant: 'ТПП України',
      dateAdded: '03.09.2025',
      title: 'Дозвільні органи відмовляють повторно — щоразу з новою причиною',
      submittedProblem: 'Відсутність законодавчої заборони на нові підстави відмови.',
      category: 'Дозвільна система',
      proposedSolution: 'Прийняття ЗУ про вичерпний перелік підстав повторної відмови.',
      priority: '1. Потребує негайного розгляду',
      economicEffect: 540,
      executor: 'Мінекономіки',
      stage: '5. Розробка НПА',
      executionStatus: 'Заблоковано',
      covvResponse: 'Підготовлено проєкт закону. Очікує погодження з Мін\'юстом.',
      resolutionDate: '',
      additionalMaterialsUrl: '',
      npaType: 'Закон',
      blocker: '',
    },
    {
      id: 'ДБ-0079',
      platform: 'МРГ ММБ',
      applicant: 'ЕБА',
      dateAdded: '04.09.2025',
      title: 'Дроблення на ФОП у роздрібі коштує бюджету сотні мільярдів',
      submittedProblem: 'Схеми ухилення від сплати податків через використання спрощеної системи.',
      category: 'Оподаткування',
      proposedSolution: 'Спрощений спецрежим та реформа РРО.',
      priority: '3. Загальний пріоритет',
      economicEffect: 1200,
      executor: 'Мінфін',
      stage: '5. Розробка НПА',
      executionStatus: 'Відкладено',
      covvResponse: 'Законопроєкт зареєстровано у ВРУ.',
      resolutionDate: '',
      additionalMaterialsUrl: '',
      npaType: 'Закон',
      blocker: '',
    },
    {
      id: 'ДБ-0001',
      platform: 'Асоціації',
      applicant: 'УРБ',
      dateAdded: '01.09.2025',
      title: 'Доходи з цифрових платформ виводять із тіні',
      submittedProblem: 'Відсутність автоматичного обміну податковою інформацією про доходи.',
      category: 'Оподаткування',
      proposedSolution: 'Законопроєкт №15111-д про міжнародний автоматичний обмін.',
      priority: '3. Загальний пріоритет',
      economicEffect: 2000,
      executor: 'Мінфін',
      stage: '11. Вирішено',
      executionStatus: 'В роботі за планом',
      covvResponse: 'Прийнято в цілому на пленарному засіданні ВРУ 09.06.2026.',
      resolutionDate: '09.06.2026',
      additionalMaterialsUrl: '',
      npaType: 'Закон',
      blocker: '',
    },
  ];
}

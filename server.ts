import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function toGoogleSheetCsvUrl(rawInput: string): string {
  const input = rawInput.trim();
  if (!input) {
    throw new Error('Вкажіть посилання на Google Таблицю.');
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error('Некоректний формат посилання. Вставте повний URL (https://docs.google.com/spreadsheets/...).');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Посилання має починатися з https://');
  }

  if (parsed.hostname !== 'docs.google.com') {
    throw new Error('Підтримуються лише посилання на Google Таблиці (docs.google.com/spreadsheets/...).');
  }

  // Case 1: Published link (/spreadsheets/d/e/.../pub or /pubhtml)
  if (parsed.pathname.includes('/spreadsheets/d/e/')) {
    const pubPath = parsed.pathname.replace(/\/pubhtml$/, '/pub');
    const pubUrl = new URL(`https://docs.google.com${pubPath}`);
    const gid = parsed.searchParams.get('gid');
    if (gid) pubUrl.searchParams.set('gid', gid);
    pubUrl.searchParams.set('output', 'csv');
    pubUrl.searchParams.set('single', 'true');
    return pubUrl.toString();
  }

  // Case 2: Standard spreadsheet link (/spreadsheets/d/<ID>/...)
  const match = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    throw new Error('Не вдалося знайти ID Google Таблиці у цьому посиланні.');
  }

  const sheetId = match[1];
  let gid = parsed.searchParams.get('gid');
  if (!gid && parsed.hash) {
    const hashMatch = parsed.hash.match(/gid=(\d+)/);
    if (hashMatch) {
      gid = hashMatch[1];
    }
  }

  const exportUrl = new URL(`https://docs.google.com/spreadsheets/d/${sheetId}/export`);
  exportUrl.searchParams.set('format', 'csv');
  if (gid) {
    exportUrl.searchParams.set('gid', gid);
  }
  return exportUrl.toString();
}

async function startServer() {
  const app = express();

  // Proxy endpoint for public/link-shared Google Sheets CSV export
  app.get('/api/google-sheet', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    let csvUrl: string;

    try {
      csvUrl = toGoogleSheetCsvUrl(rawUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Некоректне посилання на Google Таблицю.';
      res.status(400).json({ error: message });
      return;
    }

    try {
      const response = await fetch(csvUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8',
          'User-Agent': 'PULS-Dashboard/1.0',
        },
      });

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      const bodyText = await response.text();
      const trimmedStart = bodyText.trimStart().slice(0, 100).toLowerCase();
      const isHtmlResponse =
        contentType.includes('text/html') ||
        trimmedStart.startsWith('<!doctype html') ||
        trimmedStart.startsWith('<html');

      if (!response.ok || isHtmlResponse) {
        res.status(403).json({
          error:
            'Не вдалося отримати CSV із Google Таблиці. Переконайтеся, що в налаштуваннях доступу вибрано «Усі, хто має посилання — Переглядач» або таблиця опублікована в інтернеті.',
        });
        return;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(bodyText);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Помилка мережі при зверненні до Google Таблиць.';
      res.status(502).json({ error: `Помилка завантаження Google Таблиці: ${message}` });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

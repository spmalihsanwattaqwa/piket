import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.resolve(__dirname, 'data', 'piket_store.json');

const ensureDb = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          periods: null,
          lockedEvents: [],
          piketDuties: [],
          adminPassword: 'adminalwa',
          attendance: {},
        },
        null,
        2
      )
    );
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return {
      periods: null,
      lockedEvents: [],
      piketDuties: [],
      adminPassword: 'adminalwa',
      attendance: {},
    };
  }
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // 1. Shared Database API
  app.get('/api/state', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const data = ensureDb();
    res.json({ success: true, ...data });
  });

  app.post('/api/state', (req, res) => {
    try {
      const payload = req.body || {};
      const current = ensureDb();

      if (payload.attendanceByDate) {
        current.attendance = current.attendance || {};
        for (const [date, recs] of Object.entries(payload.attendanceByDate)) {
          current.attendance[date] = {
            ...(current.attendance[date] || {}),
            ...(recs as Record<string, unknown>),
          };
        }
      }

      if (payload.periods !== undefined) current.periods = payload.periods;
      if (payload.lockedEvents !== undefined) current.lockedEvents = payload.lockedEvents;
      if (payload.piketDuties !== undefined) current.piketDuties = payload.piketDuties;
      if (payload.adminPassword !== undefined) current.adminPassword = payload.adminPassword;

      fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2));

      res.json({ success: true, ...current });

      // Forward to Google Sheets Webhook in background
      const webhookUrl =
        'https://script.google.com/macros/s/AKfycbx6yaYtK3NLWBINYkUiQ6jWINDfu9aJVpBAmDGnE8SDMBVrsv3N4K0P9aqLxxSKdKI/exec';
      if (payload.syncToWebhook) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload.syncToWebhook),
        }).catch(() => {});
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, message: errMsg });
    }
  });

  // 2. Google Sheets Proxy
  app.post('/api/sync-sheet', async (req, res) => {
    try {
      const { webhookUrl, payload } = req.body || {};
      const cleanUrl = (webhookUrl || '').trim();
      if (!cleanUrl) {
        return res.status(400).json({ success: false, message: 'URL webhook kosong' });
      }

      const googleRes = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const responseText = await googleRes.text();
      let resultJson = null;
      try {
        resultJson = JSON.parse(responseText);
      } catch {}

      if (googleRes.ok || (resultJson && resultJson.status === 'success')) {
        return res.json({
          success: true,
          message: 'Berhasil sinkron ke Google Sheet',
        });
      } else {
        return res.status(400).json({
          success: false,
          message: resultJson?.message || responseText.slice(0, 200),
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, message: errMsg });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'shared-data-and-sheet-proxy',
        configureServer(server) {
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

          // 1. Shared Database API (/api/state) to synchronize across all devices
          server.middlewares.use('/api/state', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

            if (req.method === 'GET') {
              const current = ensureDb();
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, ...current }));
              return;
            }

            if (req.method === 'POST') {
              let bodyStr = '';
              req.on('data', (chunk) => {
                bodyStr += chunk;
              });
              req.on('end', () => {
                try {
                  const payload = JSON.parse(bodyStr || '{}');
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

                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, ...current }));

                  // Forward to Google Sheets Webhook in background
                  const webhookUrl =
                    'https://script.google.com/macros/s/AKfycbx6yaYtK3NLWBINYkUiQ6jWINDfu9aJVpBAmDGnE8SDMBVrsv3N4K0P9aqLxxSKdKI/exec';
                  if (payload.syncToWebhook) {
                    try {
                      fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(payload.syncToWebhook),
                      }).catch(() => {});
                    } catch {}
                  }
                } catch (err: unknown) {
                  res.statusCode = 500;
                  const errMsg = err instanceof Error ? err.message : String(err);
                  res.end(JSON.stringify({ success: false, message: errMsg }));
                }
              });
              return;
            }

            res.statusCode = 405;
            res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
          });

          // 2. Google Sheet Webhook Proxy (/api/sync-sheet)
          server.middlewares.use('/api/sync-sheet', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }

            let bodyStr = '';
            req.on('data', (chunk) => {
              bodyStr += chunk;
            });

            req.on('end', async () => {
              try {
                const { webhookUrl, payload } = JSON.parse(bodyStr);
                const cleanUrl = webhookUrl ? webhookUrl.trim() : '';

                if (!cleanUrl) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, message: 'URL webhook wajib diisi.' }));
                  return;
                }

                if (cleanUrl.includes('/edit') && !cleanUrl.includes('/exec')) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: false,
                      message:
                        'URL yang dimasukkan adalah tautan editor (/edit). Harap gunakan URL Web App yang berakhiran "/exec".',
                    })
                  );
                  return;
                }

                const googleRes = await fetch(cleanUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                  body: JSON.stringify(payload),
                  redirect: 'follow',
                });

                const responseText = await googleRes.text();

                if (
                  responseText.includes('<!DOCTYPE html>') &&
                  (responseText.includes('accounts.google.com') ||
                    responseText.includes('Sign in - Google Accounts') ||
                    responseText.includes('Google Drive -- Page Not Found') ||
                    responseText.includes('Service Login'))
                ) {
                  res.statusCode = 403;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: false,
                      message:
                        'Akses ditolak oleh Google Apps Script. Pastikan pada Deployment Apps Script, setelan "Who has access" disetel ke "Anyone" (Siapa saja, bahkan anonim).',
                    })
                  );
                  return;
                }

                let resultJson = null;
                try {
                  resultJson = JSON.parse(responseText);
                } catch {
                  // Not JSON
                }

                if (googleRes.ok || (resultJson && resultJson.status === 'success')) {
                  const count = resultJson?.count || payload?.records?.length || 0;
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      message: `Berhasil! ${count} data absensi tersinkronkan ke Google Sheet piket.`,
                    })
                  );
                } else {
                  const errMsg =
                    resultJson?.message || responseText.slice(0, 200) || `HTTP ${googleRes.status}`;
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({ success: false, message: `Gagal dari Apps Script: ${errMsg}` })
                  );
                }
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    message: `Koneksi gagal: ${err?.message || String(err)}`,
                  })
                );
              }
            });
          });
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/?role=piket',
          name: 'Piket SPM Al Ihsan Wat Taqwa',
          short_name: 'Piket SPM',
          description: 'Aplikasi Khusus Petugas Piket SPM Al Ihsan Wat Taqwa untuk absensi KBM',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/?role=piket',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

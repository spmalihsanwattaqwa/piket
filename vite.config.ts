import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'google-sheet-proxy',
        configureServer(server) {
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

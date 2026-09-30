# Base44 Dev Environment

## Project Overview
Vite 8 + React 19 + TypeScript app using **Bun** as the package manager.
Indonesian-language attendance system ("Piket SPM Al Ihsan Wat Taqwa") with
desktop schedule grid, Google Sheets sync, PWA support, and weekly stats.

## Critical: Bun Version
The `bun.lock` uses **lockfileVersion 2** (introduced in Bun 1.4).
Older Bun images (1.1, 1.2) fail with `UnknownLockfileVersion`.
The compose file must use `oven/bun:latest` (currently 1.4.2+).

## Setup
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
- App runs on port 3000 (Vite dev server with `--host=0.0.0.0`).
- HMR is disabled (`DISABLE_HMR=true`) to prevent flickering during edits.
- Source is bind-mounted; `node_modules` uses an anonymous volume.
- Dependencies install from `bun.lock` via `bun install --frozen-lockfile` on startup.

## Secrets
- `GEMINI_API_KEY` — Google Gemini API key (not used in current source but declared in .env.example).
- `APP_URL` — App's public URL.
- Both have development placeholders in `.env.base44-defaults`; real values override via `/run/base44/app.env`.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200
- Preview shows the login screen (dark navy theme with password field and role buttons).
- No console errors; all Vite modules transform and serve correctly.

## Known Warnings (non-blocking)
- Vite warns about `__dirname` usage in `vite.config.ts` — use `import.meta.dirname` in future Vite versions.

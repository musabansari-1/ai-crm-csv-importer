# GrowEasy AI CSV Importer

### Intelligent lead ingestion for real-estate CRM

Upload **any** lead CSV — Facebook Ads, Google Forms, 99acres, MagicBricks, IndiaMART, messy agency sheets and let AI map it into a clean, standardized **GrowEasy CRM** schema. Preview rows as they stream, confirm import, watch mapped leads arrive live over SSE, then export results.

Built as a **TypeScript monorepo** with a production-minded Next.js frontend and an Express API that orchestrates CSV parsing + LLM field mapping.

---

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-App%20Router-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-unit%20tests-6E9F18?style=flat-square&logo=vitest&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

---

## Why this project

Real-estate sales teams receive leads from dozens of sources, each with different column names, phone formats, and date layouts. Manual cleanup is slow and error-prone.

This system:

1. **Accepts any CSV** (validated client-side, re-checked on upload)
2. **Streams a local preview** while parsing (PapaParse `step` — UI stays responsive on large files)
3. **Sends the file to the API**, which chunks rows and asks an LLM to map fields into a fixed CRM contract
4. **Streams mapped batches back** over Server-Sent Events so the UI populates as AI finishes each chunk
5. **Surfaces skipped rows** with reasons and supports **CSV export** of successful imports

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                              Browser (Next.js)                           │
│  DropZone → PapaParse stream → Virtualized preview → Confirm             │
│       │                                              │                   │
│       │                         importCSVStream()    │                   │
│       │                         POST multipart/form  │                   │
└───────┼──────────────────────────────────────────────┼───────────────────┘
        │                                              │
        │  (preview only — local)                      ▼
        │                              ┌───────────────────────────────┐
        │                              │   Express API  :5000          │
        │                              │  POST /api/v1/imports         │
        │                              │  POST /api/v1/imports/stream  │
        │                              │         │                     │
        │                              │  Multer → csv-parse           │
        │                              │         │                     │
        │                              │  Chunk rows (AI_BATCH_SIZE)   │
        │                              │         │                     │
        │                              │  LLM (OpenRouter) mapping     │
        │                              │         │                     │
        │                              │  Normalize → CRMRecord[]      │
        │                              │  SSE: batch / skipped / done  │
        │                              └───────────────────────────────┘
        ▼
  Virtualized results · Status badges · Export CSV · Dark mode
```

| Layer | Stack | Responsibility |
|-------|--------|----------------|
| **frontend/** | Next.js (App Router), React 19, Tailwind CSS 4, PapaParse, TanStack Virtual, next-themes, Vitest | UX, client validation, streaming preview, SSE consumer, export |
| **backend/** | Express 5, TypeScript (strict), Multer, csv-parse, Zod, Pino, OpenRouter/OpenAI SDK | Upload, parse, LLM mapping, JSON + SSE responses, CORS, logging |

---

## Repository layout

```text
ai-crm-csv-importer/
├── README.md                 ← you are here
├── frontend/                 # Next.js UI
│   ├── app/                  # App Router pages, layout, error/loading
│   ├── components/           # upload · preview · confirm · results · ui
│   ├── hooks/                # useCSVParser · useImport · useToast
│   ├── lib/                  # api · csvParser · csvValidator · sseParser
│   ├── types/                # shared CRM domain types
│   ├── __tests__/            # Vitest + Testing Library
│   ├── Dockerfile
│   └── docker-compose.yml
└── backend/                  # Express API
    ├── src/
    │   ├── modules/imports/  # routes · controller · service · upload
    │   ├── services/         # csv-parser · crm-mapping · llm
    │   ├── prompts/          # CRM mapping system prompt
    │   ├── types/            # CRM + CSV types
    │   └── middlewares/
    ├── Dockerfile
    └── docker-compose.yml
```

---

## Prerequisites

| Tool | Version (recommended) |
|------|------------------------|
| **Node.js** | 20+ LTS |
| **npm** | 10+ (ships with Node) |
| **Docker** (optional) | 24+ with Compose v2 |
| **OpenRouter API key** | Required for live AI imports ([openrouter.ai](https://openrouter.ai)) |

---

## Quick start (local development)

Run **backend** and **frontend** in two terminals.

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set OPENROUTER_API_KEY, AI_MODEL, CLIENT_URL
npm install
npm run dev
```

API listens on **http://localhost:5000**  
Health check: **GET http://localhost:5000/api/v1/health**

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

App: **http://localhost:3000**

### 3. Happy path

1. Open the app → upload a `.csv` (max 10MB)
2. Watch the preview fill as rows stream in
3. Click **Import Leads**
4. Progress stages animate while the API maps batches
5. Results table fills **live** as SSE `batch` events arrive
6. Download CSV or import another file

> **Mock mode (frontend only):** clear or remove `NEXT_PUBLIC_API_URL` in `frontend/.env.local` and restart Next. Imports use built-in sample CRM data without calling the API — useful for UI demos.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | HTTP port | `5000` |
| `NODE_ENV` | No | `development` \| `production` | `development` |
| `CLIENT_URL` | **Yes** | Frontend origin for CORS | `http://localhost:3000` |
| `OPENROUTER_API_KEY` | **Yes** | LLM provider key | `sk-or-...` |
| `AI_MODEL` | **Yes** | Model id on OpenRouter | `openai/gpt-4o-mini` |
| `AI_BATCH_SIZE` | No | Rows per LLM request | `30` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | No* | Backend base URL (no trailing slash). If unset → mock imports | `http://localhost:5000` |

\*Required for real AI imports against the Express API.

---

## API contract

Base URL: `http://localhost:5000`

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/api/v1/health` | — | `{ "status": "ok" }` |
| `POST` | `/api/v1/imports` | `multipart/form-data` field **`file`** | JSON `ImportResult` |
| `POST` | `/api/v1/imports/stream` | same | **SSE** stream |

### `ImportResult` (JSON)

```json
{
  "records": [ /* CRMRecord */ ],
  "skipped": [ /* SkippedRecord */ ],
  "total_processed": 42
}
```

### SSE events (`/api/v1/imports/stream`)

| Event | Payload | When |
|-------|---------|------|
| `batch` | `CRMRecord[]` | After each LLM chunk is mapped |
| `skipped` | `SkippedRecord[]` | Skipped rows from that chunk |
| `done` | `{ "total_processed": number }` | Mapping finished |
| `error` | `{ "message": string }` | Failure after stream started |

### CRM record fields

`created_at` · `name` · `email` · `country_code` · `mobile_without_country_code` · `company` · `city` · `state` · `country` · `lead_owner` · `crm_status` · `crm_note` · `data_source` · `possession_time` · `description`

**Enums**

- `crm_status`: `GOOD_LEAD_FOLLOW_UP` | `DID_NOT_CONNECT` | `BAD_LEAD` | `SALE_DONE` | `""`
- `data_source`: `leads_on_demand` | `meridian_tower` | `eden_park` | `varah_swamy` | `sarjapur_plots` | `""`

---

## Docker

Each package ships its own multi-stage image and Compose file.

### Backend container

```bash
cd backend
cp .env.example .env   # fill secrets
docker compose up --build
# → http://localhost:5000
```

### Frontend container

```bash
cd frontend
# build-time: pass API URL if you need a non-mock production UI
docker compose up --build
# → http://localhost:3000
```

Never bake secrets into images — inject via `--env-file` / Compose `env_file` at run time.

---

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | `tsx watch` hot reload |
| `npm run build` | `tsc` → `dist/` |
| `npm start` | `node dist/server.js` |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (`output: 'standalone'`) |
| `npm start` | Start production server |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch |
| `npm run lint` | ESLint |

---

## Product features (frontend)

| Feature | Implementation notes |
|---------|----------------------|
| Drag-and-drop CSV upload | Validation: empty, extension, MIME, 10MB cap |
| Streaming preview | PapaParse `step` + live row counter |
| Virtualized tables | `@tanstack/react-virtual` for 1k–10k+ rows |
| Step flow | Upload → Preview → Importing → Results |
| Import state machine | Auto-retry ×3 with exponential backoff |
| Live import results | SSE batches append to results table |
| CRM status badges | Color-coded enum pills |
| Skipped-row review | Expandable reasons + raw field preview |
| CSV export | Escaped cells, browser download |
| Dark mode | `next-themes` class strategy, system default |
| Toasts | Success / error / info feedback |
| A11y | Keyboard DropZone, table roles, focus rings |
| Error boundary | `app/error.tsx` + loading skeleton |

---

## Backend design highlights

| Concern | Approach |
|---------|----------|
| Upload | Multer memory storage, CSV-only filter, 10MB limit |
| Parse | `csv-parse` → headers + rows |
| Mapping | Rows chunked by `AI_BATCH_SIZE`; each chunk sent to LLM with a rigorous system prompt |
| Output hygiene | Nulls coerced to `""`; enums validated; skipped rows normalized to `{ row, reason, raw }` |
| Streaming | SSE written after each chunk — same path as full JSON map |
| Safety | Helmet, CORS allowlist (`CLIENT_URL`), Zod env validation, Pino structured logs |
| Errors | Typed `ApiError` + centralized middleware (`{ success: false, message }`) |

---

## Testing

```bash
cd frontend
npm test
```

Coverage includes:

- CSV validation & export escaping  
- `useImport` idle → loading → success / retry exhaustion / reset  
- DropZone, StatusBadge, ResultsSummary component behavior  

---

## Deploy notes

| Target | Guidance |
|--------|----------|
| **Frontend → Vercel** | Set Root Directory to `frontend`. Add `NEXT_PUBLIC_API_URL` to the **public** backend URL. Redeploy after env changes (build-time inlining). |
| **Backend** | Any Node host or Docker (Railway, Fly.io, Render, VPS). Expose HTTPS, set `CLIENT_URL` to the Vercel domain, store secrets in the host’s env UI. |
| **CORS** | Browser origin must exactly match `CLIENT_URL` (scheme + host + port). |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Import fails / network error | Backend running? `NEXT_PUBLIC_API_URL` correct? Restart Next after env edits. |
| CORS blocked | `CLIENT_URL` must equal the browser origin (e.g. `http://localhost:3000`). |
| `OPENROUTER_API_KEY` / env parse error | Ensure `backend/.env` has all required keys; no empty `AI_MODEL`. |
| File rejected at 10MB+ | Expected — both client and server enforce 10MB. |
| Stream falls back to mock data | Frontend API URL unset — mock mode is intentional. |
| Empty import result | Check LLM key/model; inspect backend logs; try a smaller CSV first. |

---

## Tech decisions

1. **PapaParse streaming (not one-shot `complete`)** — Incremental React state keeps the UI interactive on large files and enables live parse counters.  
2. **Row virtualization** — O(visible rows) DOM nodes instead of O(n) for 5k–10k previews and results.  
3. **SSE for import progress** — Natural fit for server-driven batches after each LLM chunk; simpler than WebSockets for one-way progress.  
4. **Strict shared CRM contract** — Frontend types and backend normalizers share the same field names/enums so the UI never guesses shapes.  
5. **Client validation + server validation** — Fast feedback in the browser; authority stays on the API.   
7. **Docker multi-stage builds** — Reproducible production images; secrets only at runtime.  
8. **Vitest over Jest** — Faster ESM-native unit tests with Testing Library.

---

## Author

**Musab Zahid Ansari**
---

<p align="center">
  <strong>GrowEasy CSV Importer</strong> — from messy lead exports to clean CRM records.
</p>
```

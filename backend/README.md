# Ajey C Portfolio — Python FastAPI Backend & Vercel Full-Stack Deployment

This repository deploys **both** the React + Vite frontend and the Python FastAPI backend (`backend/main.py`) in **one single Vercel project and domain**:

- **Frontend (Vite SPA)** at root (`.`) built with `npm run build` -> `dist/`
- **Backend (Python FastAPI)** via Vercel Serverless Function entrypoint `/api/index.py` (wrapping `backend/main.py:app`) and root `/requirements.txt` (`-r backend/requirements.txt`)
- **Unified Routing (`vercel.json`)**:
  - `/api` and `/api/(.*)` -> `/api/index.py` (Python FastAPI)
  - All other non-asset routes -> `/index.html` (Vite SPA)
- **Local AI Studio Preview (`server.ts`)** remains intact on port `3000`.

## Running the Python FastAPI Backend Locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env to set ADMIN_PASSWORD, ADMIN_SESSION_SECRET, and optional GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

In another terminal at the repository root, start Vite (automatically proxies `/api/*` to `http://127.0.0.1:8000`):

```bash
npx vite --port 5173
```

Interactive OpenAPI / Swagger documentation is available at:
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Deploying to Vercel (Single Project & Domain)

1. In Vercel Project Settings -> **Build & Deployment**, keep **Root Directory** at `.` and **Framework Preset** as `Vite` (matching `vercel.json`).
2. Add Environment Variables in Vercel:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET` (64+ char random string)
   - `DATABASE_URL` (recommended: managed PostgreSQL URL from Neon, Supabase, or Vercel Postgres — without it, Vercel serverless uses ephemeral `/tmp/portfolio.db`)
   - `GEMINI_API_KEY` (optional; falls back to grounded deterministic FAQ engine if omitted)
   - `CORS_ORIGINS` / `APP_URL` (optional; Vercel's `VERCEL_URL`, `VERCEL_BRANCH_URL`, and `VERCEL_PROJECT_PRODUCTION_URL` are allowed automatically)
3. Deploy via `vercel --prod` or GitHub push. Verify `GET /api/health` returns `{"status":"ok","service":"ajey-portfolio-fastapi",...}`.

## API Endpoints

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Serverless health & database mode check |
| `GET` | `/api/profile` | Public | Verified portfolio profile & social links |
| `PUT` | `/api/profile` | Admin | Update headline, career objective, SGPA, GitHub/LinkedIn URLs |
| `GET` | `/api/projects` | Public | List approved projects (`?all=1` for admin) |
| `POST/PATCH/DELETE` | `/api/projects` | Admin | Create, edit, moderate, or delete projects |
| `GET` | `/api/certificates` | Public | List approved certificates |
| `GET` | `/api/certificates/{id}/file` | Public | View or download original certificate PDF/PNG/JPG |
| `POST` | `/api/certificates/upload` | Admin | Upload new certificate file + metadata (max 10 MB, signature checked) |
| `POST` | `/api/chat` | Public | "Ask Ajey" assistant (Gemini API + deterministic FAQ fallback) |
| `POST` | `/api/contact` | Public | Validated contact submission with honeypot & rate limit |
| `POST` | `/api/analytics/visit` | Public | Privacy-conscious visit/section/project event tracking |
| `GET` | `/api/analytics/dashboard` | Admin | Visit totals, daily activity, section & project popularity |
| `GET` | `/api/resume/download` | Public | Dynamically generated PDF resume (ReportLab / PDFKit) |
| `GET` | `/api/blog` | Public | Security research & development notes |

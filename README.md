# MyReportBuddy

AI-powered medical report analysis. Upload a lab report, blood test, or health scan and get instant plain-language insights powered by GPT-4o.

## Features

- Drag-and-drop upload for PDF, JPG, PNG, WEBP (max 10MB, up to 5 files)
- PDF text extraction with automatic fallback to GPT-4o Vision for scanned PDFs
- GPT-4o analysis with structured JSON response
- Color-coded findings: **critical / high / low / normal** with severity sorting
- Expandable per-parameter explanations, normal range comparison
- Red flag alerts, insights, and numbered recommended actions
- AI Chat — ask follow-up questions with your report as context
- Export results as PDF
- Optional report history backed by Supabase
- Rate limiting, input sanitization, medical disclaimer

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI | OpenAI GPT-4o (`openai` SDK) |
| PDF parsing | `pdf-parse` |
| File handling | Native Next.js `FormData` |
| Database (optional) | Supabase (`@supabase/supabase-js`) |
| Rate limiting | `rate-limiter-flexible` |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# Required
OPENAI_API_KEY=sk-...

# Optional — enables report history (see Supabase setup below)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional — rate limiting (defaults shown)
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

### 3. Set up Supabase (optional)

Report history is fully optional. Without it, analysis results are stored in `sessionStorage` and the history page is disabled.

To enable it:

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy your **Project URL** and **service_role** secret key from **Project → Settings → API**.
3. Create the `reports` table by running this SQL in **Project → SQL Editor → New query**:

```sql
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name       TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size       INTEGER NOT NULL,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'PENDING',
  analysis_result JSONB,
  report_type     TEXT,
  error_message   TEXT
);
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts        # Upload + GPT-4o analysis endpoint
│   │   ├── chat/
│   │   │   ├── route.ts            # Streaming chat completions
│   │   │   └── context/route.ts    # Upload file as chat context
│   │   └── reports/
│   │       ├── route.ts            # GET paginated history list
│   │       └── [id]/route.ts       # GET single report
│   ├── about/page.tsx
│   ├── chat/page.tsx
│   ├── history/page.tsx
│   ├── privacy/page.tsx
│   ├── results/
│   │   ├── preview/page.tsx        # Session-based results (no DB needed)
│   │   └── [id]/page.tsx           # Supabase-backed results page
│   ├── upload/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx                    # Landing page
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── chat/                       # Chat UI components
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── MessageRenderer.tsx
│   │   ├── SuggestedPrompts.tsx
│   │   └── TypingIndicator.tsx
│   ├── AnalysisResults.tsx         # Results layout (sections + stat cards)
│   ├── AnimatedSection.tsx         # Scroll-triggered fade-in wrapper
│   ├── DisclaimerModal.tsx         # First-visit consent modal
│   ├── FileUpload.tsx              # Drag-and-drop upload form
│   ├── FindingsCard.tsx            # Accordion findings list
│   ├── Footer.tsx
│   └── Navbar.tsx
├── hooks/
│   └── useInView.ts                # Intersection observer hook
├── lib/
│   ├── openai.ts                   # GPT-4o analysis wrapper
│   ├── pdf-parser.ts               # PDF text extraction + image prep
│   ├── rate-limiter.ts             # Per-IP rate limiting
│   ├── supabase.ts                 # Supabase client singleton + helpers
│   └── utils.ts                   # cn(), formatDate(), sanitizeFilename()
├── types/
│   ├── chat.ts                     # Chat message / request types
│   └── index.ts                    # Core app types
└── uploads/                        # Temp upload directory (gitignored)
```

---

## API Routes

### `POST /api/analyze`

Accepts `multipart/form-data`. Fields:

| Field | Type | Description |
|---|---|---|
| `file` (×1–5) | File | PDF, JPG, PNG, or WEBP — max 10 MB each |
| `context` | string | Optional user description of the report |

**Response:**
```json
{
  "success": true,
  "reportId": "uuid-or-null",
  "redirectTo": "/results/uuid-or-preview",
  "analysisResult": {
    "report_type": "Complete Blood Count (CBC)",
    "summary": "...",
    "key_findings": [
      { "parameter": "Haemoglobin", "value": "9.2 g/dL",
        "normal_range": "13.5–17.5 g/dL", "status": "critical",
        "explanation": "..." }
    ],
    "insights": ["..."],
    "recommended_actions": ["..."],
    "red_flags": ["..."],
    "disclaimer": "..."
  }
}
```

**Rate limited** to 10 requests / 60 s per IP (configurable via `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`).

### `GET /api/reports`

Returns paginated list of completed reports. Query params: `page` (default `1`), `limit` (default `20`).

### `GET /api/reports/[id]`

Returns a single report by UUID.

### `POST /api/chat`

Streaming chat endpoint. Accepts `{ messages, systemContext? }`.

### `POST /api/chat/context`

Upload a file to use as chat context. Returns extracted text.

---

## Deploying to Vercel

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Add these **Environment Variables** in the Vercel dashboard:
   - `OPENAI_API_KEY` *(required)*
   - `SUPABASE_URL` *(optional — enables history)*
   - `SUPABASE_SERVICE_ROLE_KEY` *(optional — server-side only, never `NEXT_PUBLIC_`)*
   - `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` *(optional)*
4. Click **Deploy** — Vercel auto-detects Next.js.

> **Note on uploads:** The local `uploads/` directory is for development only. In production on Vercel (read-only filesystem) swap `writeFile` in `src/app/api/analyze/route.ts` for [Vercel Blob](https://vercel.com/docs/storage/vercel-blob), [Supabase Storage](https://supabase.com/docs/guides/storage), or AWS S3.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | **Yes** | — | OpenAI API key |
| `SUPABASE_URL` | No | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service role key (server-side only) |
| `RATE_LIMIT_MAX` | No | `10` | Max requests per window per IP |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window in milliseconds |

---

## Medical Disclaimer

MyReportBuddy is for **informational purposes only**. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making any medical decisions.

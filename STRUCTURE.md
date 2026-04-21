# Project structure

This document describes how the app is organized and where to find or add features.

---

## Root layout

```
next_react_login/
├── .env.local           # MONGODB_URI, MONGODB_DB, JWT_SECRET (not committed)
├── next.config.mjs      # Next.js config
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── STRUCTURE.md         # This file
├── lib/                 # Shared server-side logic (DB, budget helpers)
├── models/              # Mongoose models (User for auth)
├── utils/               # Auth helpers (JWT, cookies, getUserFromRequest)
├── components/          # Reusable React components
├── pages/               # Next.js pages router (routes + API)
│   ├── index.tsx        # Redirect: / → /budget or /auth/login
│   ├── _app.tsx         # App wrapper
│   ├── auth/            # Auth UI (no API here)
│   │   ├── login.tsx    # /auth/login
│   │   └── signup.tsx   # /auth/signup
│   ├── budget/          # Budget feature
│   │   ├── index.tsx    # /budget (hub + logout)
│   │   ├── [studio]/    # complete.tsx, summary.tsx
│   │   └── combined/    # summary.tsx
│   └── api/             # API routes
│       ├── auth/        # login, signup, logout, me
│       └── budgets/     # upload
├── public/              # Static assets (logo, favicon)
└── styles/              # Global CSS (Tailwind)
```

---

## Authentication (login / signup / logout)

- **Pages**: `pages/auth/login.tsx` → `/auth/login`, `pages/auth/signup.tsx` → `/auth/signup`, `pages/index.tsx` (redirects)
- **API**: `pages/api/auth/login.ts`, `signup.ts`, `logout.ts`, `me.ts`
- **Logic**: `utils/auth.ts` (JWT sign/verify, cookie serialization, `getUserFromRequest`)
- **Data**: `models/User.ts` (Mongoose), `lib/mongodb.ts` (Mongoose connection for auth)

Protected routes call `getUserFromRequest(req)` in `getServerSideProps` and redirect to `/auth/login` when not authenticated. Logout is on the Budget hub (`/budget`).

---

## Budget feature

- **Pages**:
  - `pages/budget/index.tsx` — Budget dashboard (studio list + COMBINED link)
  - `pages/budget/[studio]/complete.tsx` — Full budget grid for one studio
  - `pages/budget/[studio]/summary.tsx` — YTD summary + monthly chart for one studio
  - `pages/budget/combined/summary.tsx` — Combined summary across all studios
- **API**: `pages/api/budgets/upload.ts` — POST multipart .xlsx upload (file naming: `YEAR_BUDGET_STUDIONAME.xlsx`)
- **Lib**:
  - `lib/budget.ts` — Studio list, slugs, budget ID helpers
  - `lib/budgetGrid.ts` — Grid normalization and line-item filtering
  - `lib/budgetSummary.ts` — YTD summary and monthly totals from grid rows
  - `lib/excel.ts` — Load budget rows from MongoDB (by studio name / year)
- **DB**: `lib/mongodbClient.ts` — Native MongoDB client used only for budget collections (same DB as auth when `MONGODB_URI` / `MONGODB_DB` match)
- **Components**: `components/BudgetTable.tsx`, `components/UploadBudgets.tsx`

All budget pages are protected: they use `getUserFromRequest` in `getServerSideProps` and redirect to `/auth/login` if unauthenticated.

---

## Conventions

- **Path alias**: `@/` points to project root (e.g. `@/lib/budget`, `@/utils/auth`).
- **Auth cookie**: `auth_token` (HTTP-only, SameSite=Lax, 7-day max-age).
- **Env**: `MONGODB_URI`, `MONGODB_DB` (optional), `JWT_SECRET` — see README and `.env.example` if present.

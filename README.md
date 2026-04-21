# Budget Statistics — Next.js + MongoDB

Full-stack app with **login / signup / logout** and a **budget dashboard** (studios, .xlsx upload, summaries). Built with Next.js (pages router), React, TypeScript, Tailwind CSS, and MongoDB.

---

## Features

- **Auth**: Sign up, log in, log out; JWT in HTTP-only cookie; protected routes.
- **Budget**: Dashboard at `/budget` with studio links, complete grid view, YTD summary, and combined summary; upload `.xlsx` files (naming: `YEAR_BUDGET_STUDIONAME.xlsx`).
- **Structure**: See [STRUCTURE.md](./STRUCTURE.md) for folder layout and where to add or change features.

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas); connection string in `.env.local`

---

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Create `.env.local` in the project root:

   ```bash
   MONGODB_URI=your-mongodb-connection-string
   MONGODB_DB=your-database-name
   JWT_SECRET=your-long-random-secret
   ```

   - `MONGODB_DB` is optional; if set, that database is used for both auth and budget data.
   - `JWT_SECRET`: use a long random string (e.g. 32+ chars).

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You are redirected to `/auth/login` when not logged in; after signup or login you are sent to `/budget`.

---

## Main routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/budget` (logged in) or `/auth/login` (guest) |
| `/auth/login` | Login form (logo + “Budget statistics” card) |
| `/auth/signup` | Sign up form |
| `/budget` | **Protected** — Budget dashboard (studios + COMBINED, logout) |
| `/budget/[studio]/complete` | Full budget grid for a studio |
| `/budget/[studio]/summary` | YTD summary + monthly chart for a studio |
| `/budget/combined/summary` | Combined summary across all studios |

---

## API

- **Auth**: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Budget**: `POST /api/budgets/upload` — multipart form, field `files`; accepts `.xlsx` files named `YYYY_BUDGET_StudioName.xlsx`

---

## Tech stack

- **Next.js 14** (pages router), **React 18**, **TypeScript**
- **Tailwind CSS** for styling
- **MongoDB**: Mongoose for auth (users), native driver for budget collections (same DB)
- **Auth**: bcrypt (passwords), jsonwebtoken (JWT), cookie (parse/serialize)
- **Budget**: xlsx (parse), formidable (multipart upload)

---

## Project structure

See **[STRUCTURE.md](./STRUCTURE.md)** for a concise map of folders and responsibilities (auth, budget, lib, utils, components, pages).

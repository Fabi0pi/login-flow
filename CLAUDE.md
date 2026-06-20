# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # start dev server on http://localhost:3000
pnpm build      # production build
pnpm start      # start production server
pnpm lint       # run ESLint
```

Testing (not yet installed):
```bash
pnpm test           # Vitest unit/component tests
pnpm test:e2e       # Playwright e2e tests
```

## Goal

Build a realistic modern auth flow as a learning project. Auth is implemented manually — **do not use Supabase Auth**. The layers are:

| Layer | Tool | Role |
|---|---|---|
| Database | Supabase (Postgres) | users, sessions tables |
| Auth transport | JWT + HttpOnly cookies | issue/verify tokens in Route Handlers |
| Auth state | React Context | hold the current user client-side |
| Server state | TanStack Query | data fetching, caching, mutations |
| Testing | Vitest + React Testing Library + Playwright | unit, component, e2e |

## Stack

- **Next.js 16.2.9** — App Router only (`app/` directory). Breaking changes vs. prior releases; read `node_modules/next/dist/docs/` before touching routing, data fetching, or rendering.
- **React 19.2.4** — Server Components available in App Router.
- **Tailwind CSS 4.x** — imported via `@import "tailwindcss"` (not v3 `@tailwind` directives). Extend the theme in `globals.css` via `@theme inline`, not a `tailwind.config` file.
- **Zod 4.x** — breaking changes from v3; check the installed API before use.
- **TypeScript** — strict mode; path alias `@/*` maps to project root.
- **pnpm** — use pnpm for all package operations.

## Architecture notes

- JWT tokens are set as HttpOnly cookies from Next.js Route Handlers — never expose them to client JS.
- React Context wraps the app for auth state; it reads the decoded user from a server-side cookie on hydration, not from localStorage.
- TanStack Query handles all data fetching after auth; auth mutations (login/logout) go through React Context + Route Handlers, not TanStack Query.

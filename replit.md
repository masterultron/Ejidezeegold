# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Ejidezee Gold (Frontend E-Commerce)
- **Path**: `artifacts/ejidezee-gold/`
- **Type**: React + Vite (frontend-only, no backend)
- **Preview**: `/` (root)
- **Purpose**: Luxury e-commerce storefront for UAE-based jewelry brand "Ejidezee Gold"
- **Design**: Dark luxury theme — Midnight Black (#0a0a0a) background, Champagne Gold (#D4AF37) accents
- **Fonts**: Playfair Display (headings), Inter (body)
- **Key Features**:
  - Home page with hero, brand story, featured products
  - Collections page with category filters and product grid
  - Contact page
  - Slide-out cart drawer with quantity management
  - Multi-currency support (AED, USD, NGN)
  - 3-step Royal Inquiry modal (name/phone, custom requests, WhatsApp/Email)
  - Framer Motion animations throughout
- **Key Files**:
  - `src/data/products.ts` — Mock product data (8 items) with Product interface
  - `src/context/CartContext.tsx` — Global cart state + currency switching
  - `src/components/Navbar.tsx` — Sticky glassmorphism navbar
  - `src/components/CartDrawer.tsx` — Cart drawer + Royal Inquiry modal
  - `src/pages/Home.tsx`, `Collections.tsx`, `Contact.tsx` — Main pages

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

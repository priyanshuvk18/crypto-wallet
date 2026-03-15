# Workspace

## Overview

Next-Gen Crypto Wallet — a full-stack web application with a dynamic 3D UI built with React Three Fiber, glassmorphism design, and blockchain integration.

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

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── crypto-wallet/      # React + Vite frontend (port 18624, preview at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application Features

### Frontend (artifacts/crypto-wallet)
- **Tech**: React 19, TypeScript, Vite, Tailwind CSS v4, React Three Fiber, Three.js
- **3D Scene**: Interactive particle field background with OrbitControls (auto-rotate)
- **Routing**: Wouter-based routing with animated page transitions (Framer Motion)
- **State**: Zustand store with localStorage persistence for wallet data
- **Theme**: Dark cyberpunk/glassmorphism design with electric cyan/neon accents
- **Pages**:
  - `/wallet-setup` — Create or import HD wallet (uses ethers.js for real key generation)
  - `/` — Dashboard with portfolio balance and asset list
  - `/send` — Send crypto with gas estimation (3-step flow)
  - `/receive` — QR code display (qrcode.react)
  - `/history` — Transaction ledger (date-fns formatting)
  - `/market` — Price charts (Recharts), gas tracker, market table
  - `/settings` — Wallet management and danger zone

### Backend (artifacts/api-server)
- **Routes**:
  - `GET /api/healthz` — Health check
  - `POST /api/wallet/create` — Create wallet record
  - `POST /api/wallet/import` — Import wallet record
  - `GET /api/wallet/balance` — Portfolio balances
  - `GET /api/wallet/transactions` — Transaction history
  - `POST /api/wallet/send` — Broadcast transaction
  - `POST /api/wallet/estimate-gas` — Gas estimation
  - `GET /api/tokens/list` — Supported token list
  - `GET /api/tokens/balance` — Token balances
  - `GET /api/market/prices` — Live crypto prices
  - `GET /api/market/gas-tracker` — Gas tracker
  - `GET /api/market/chart` — Price chart data

### Database Schema (lib/db)
- `wallets` table: sessionId, name, address, network, encryptedData
- `transactions` table: sessionId, hash, from, to, value, symbol, type, status, network

## Security Notes
- Private keys are generated client-side using ethers.js and NEVER sent to the backend
- Backend only stores public addresses and transaction hashes
- Wallet data is stored in localStorage via Zustand persist middleware

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client and Zod schemas
- `pnpm --filter @workspace/db run push` — push database schema changes

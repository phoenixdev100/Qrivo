# FreeQR

**Dynamic QR Codes. Unlimited Scans.**

FreeQR is a free, web-based dynamic QR code generation and scan analytics platform. Create QR codes for many content types, allow unlimited scans, track scans, and view analytics - all through the web. No app required to scan.

This repository is a **modular monolith** with two separate applications:

```
freeqr/
├── frontend/   # Next.js + React + TypeScript + Tailwind CSS
├── backend/    # Node.js + Express + TypeScript + Prisma + PostgreSQL (Neon)
├── docs/       # Architecture, database, API, security, deployment docs
└── scripts/    # Utility scripts
```

## Core Flow

```
Create QR → Generate unique code → Save → Generate image → Download
  → Someone scans → GET /q/:code → find QR → record scan → increment
  → resolve content → URL redirect / render page → Dashboard → Analytics
```

## Tech Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts, Lucide React, Playwright

**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL (Neon), Zod, qrcode, JWT, Vitest

## Getting Started

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database (pooled + direct connection strings)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in Neon DATABASE_URL and DIRECT_URL + secrets
npx prisma migrate dev
npm run dev            # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev            # http://localhost:3000
```

## Environment

**Backend** (`backend/.env`)
```
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DIRECT_URL="postgresql://.../neondb?sslmode=require"
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

**Frontend** (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SCAN_BASE_URL=http://localhost:5000
```

## Documentation

See [`docs/`](./docs) for architecture, database design, API reference, security, and deployment.

## License

MIT - see [LICENSE](./LICENSE).

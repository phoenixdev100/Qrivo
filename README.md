# Qrivo

<div align="center">

**Dynamic QR Codes. Unlimited Scans.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/qrivo-backend)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

</div>

Qrivo is a free, web-based dynamic QR code generation and scan analytics platform. Create QR codes for many content types, allow unlimited scans, track scans, and view analytics - all through the web. No app required to scan.

## ✨ Features

- **Dynamic QR Codes** - Change destinations anytime without reprinting
- **Multiple Content Types** - URLs, text, vCards, WiFi, and more
- **Advanced Analytics** - Track scans, devices, browsers, locations
- **Real-time Dashboard** - Monitor performance and engagement
- **Folder Organization** - Group and manage QR codes efficiently
- **Search & Filter** - Quickly find QR codes and folders
- **Dark Mode** - Beautiful light and dark themes
- **Secure Authentication** - JWT-based auth with refresh tokens
- **Rate Limiting** - Comprehensive API protection
- **Mobile Responsive** - Works perfectly on all devices

## 🏗️ Architecture

This repository is a **modular monolith** with two separate applications:

```
qrivo/
├── frontend/   # Next.js + React + TypeScript + Tailwind CSS
├── backend/    # Node.js + Express + TypeScript + Prisma + PostgreSQL (Neon)
└── README.md
```

### Core Flow

```
Create QR → Generate unique code → Save → Generate image → Download
  → Someone scans → GET /q/:code → find QR → record scan → increment
  → resolve content → URL redirect / render page → Dashboard → Analytics
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Testing**: Playwright (E2E)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5.7
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Validation**: Zod
- **Auth**: JWT (Access + Refresh tokens)
- **QR Generation**: qrcode library
- **Testing**: Vitest

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Neon PostgreSQL database account (free tier available)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure your `.env` file:
```env
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
JWT_ACCESS_SECRET=your-secret-min-16-chars
JWT_REFRESH_SECRET=your-secret-min-16-chars
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start the development server:
```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Configure your `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | Yes | - |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 16 chars) | Yes | - |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 16 chars) | Yes | - |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | No | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | No | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS and QR scan tracking links | No | `http://localhost:3000` |
| `CORS_ORIGIN` | CORS allowed origins (comma-separated) | No | `http://localhost:3000` |
| `PORT` | Backend server port | No | `5000` |
| `COOKIE_SECURE` | Use secure cookies (HTTPS) | No | `false` |
| `COOKIE_DOMAIN` | Cookie domain | No | - |

### Frontend (.env.local)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | - |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (used for SEO metadata and scan tracking links) | No | `http://localhost:3000` |

## 📦 Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run test:e2e     # Run Playwright E2E tests
```

## 🔒 Security Features

- **Rate Limiting**: Comprehensive rate limiting on all endpoints
- **Request Timeout**: 30-second timeout for all API requests
- **Security Headers**: HSTS, X-Frame-Options, XSS protection
- **Input Validation**: Zod schemas for all inputs
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **JWT Authentication**: Access + refresh token pattern
- **HTTP-Only Cookies**: Secure cookie handling
- **CORS Protection**: Configurable origin restrictions
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 🚢 Deployment

### Vercel Deployment

1. **Backend Deployment**:
   - Connect your GitHub repository to Vercel
   - Set root directory to `backend`
   - Configure environment variables
   - Deploy

2. **Frontend Deployment**:
   - Connect your GitHub repository to Vercel
   - Set root directory to `frontend`
   - Configure environment variables
   - Deploy

### Environment Variables for Production

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set these in Vercel:
- `JWT_ACCESS_SECRET` (32+ random characters)
- `JWT_REFRESH_SECRET` (32+ random characters)
- `DATABASE_URL` (Neon connection string)
- `CORS_ORIGIN` (Your Vercel frontend URL)
- `COOKIE_SECURE=true`

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### QR Codes
- `GET /api/v1/qr` - List user's QR codes
- `POST /api/v1/qr` - Create new QR code
- `GET /api/v1/qr/:id` - Get QR code details
- `PATCH /api/v1/qr/:id` - Update QR code
- `DELETE /api/v1/qr/:id` - Delete QR code
- `POST /api/v1/qr/:id/duplicate` - Duplicate QR code
- `POST /api/v1/qr/:id/enable` - Enable QR code
- `POST /api/v1/qr/:id/disable` - Disable QR code

### Analytics
- `GET /api/v1/analytics/overview` - Get account-wide analytics
- `GET /api/v1/analytics/:qrId/summary` - Get QR code summary
- `GET /api/v1/analytics/:qrId/devices` - Get device breakdown
- `GET /api/v1/analytics/:qrId/browsers` - Get browser breakdown
- `GET /api/v1/analytics/:qrId/countries` - Get location breakdown
- `GET /api/v1/analytics/:qrId/timeseries` - Get scan activity over time

### Folders
- `GET /api/v1/folders` - List user's folders
- `POST /api/v1/folders` - Create new folder
- `GET /api/v1/folders/:id` - Get folder details
- `PATCH /api/v1/folders/:id` - Update folder
- `DELETE /api/v1/folders/:id` - Delete folder

### Public Endpoints
- `GET /q/:code` - Public QR code resolution (records scan)
- `GET /api/v1/public/qr/:code` - Get QR content (no scan recorded)
- `GET /api/v1/public/scan/:code` - Resolve QR with scan recording

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
```

### Frontend Tests
```bash
cd frontend
npm run test:e2e       # Run Playwright E2E tests
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Neon](https://neon.tech/) - PostgreSQL database hosting
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Recharts](https://recharts.org/) - Chart library
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

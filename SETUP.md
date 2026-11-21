# CertiFlow — Local Setup and Running Guide

This guide describes how to run **CertiFlow** locally from a fresh clone.

---

## 1. Prerequisites

Ensure you have the following installed on your host machine:

- **Node.js**: v20.x or higher (`node -v`)
- **npm**: v9.x or higher (`npm -v`)
- **Docker & Docker Compose**: (Recommended for containerized execution)

---

## 2. Option A: Run with Docker Compose (Recommended)

The entire system—including PostgreSQL, Redis, Backend API, BullMQ Background Worker, and React Frontend—can be started with a single command.

### Step 1: Clone and Enter Repository
```bash
git clone <repository-url>
cd CertiFlow
```

### Step 2: Launch Containers
```bash
docker compose up --build
```

Docker Compose will automatically:
1. Start PostgreSQL 15 on port `5432` with a persistent volume.
2. Start Redis 7 on port `6379`.
3. Wait for PostgreSQL and Redis healthchecks to pass.
4. Compile the backend, execute Prisma database migrations, and run `prisma/seed.ts` (seeding demo users and batches).
5. Start the backend API on port `5000`.
6. Start the dedicated background worker container.
7. Build and serve the frontend via an Nginx container on port `5173`.

### Step 3: Access the Applications
- **Frontend Web UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL**: `localhost:5432` (User: `postgres`, DB: `certiflow_db`)
- **Redis**: `localhost:6379`

---

## 3. Option B: Local Bare-Metal Development

If you wish to run the frontend and backend directly on your host machine without Docker:

### Step 1: Configure Environment Variables
Copy `.env.example` in both folders:

```bash
# In backend/
cp .env.example .env

# In frontend/
cp .env.example .env
```

Ensure `DATABASE_URL` in `backend/.env` points to your accessible PostgreSQL server:
```env
DATABASE_URL=postgresql://postgres:Ashok%402185@localhost:5432/certiflow_db?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=certiflow_super_secret_production_jwt_key_2026
PORT=5000
FRONTEND_URL=http://localhost:5173
```

> **Note on Resilient Fallback**: If Redis is not currently running locally on port 6379, CertiFlow's built-in queue manager automatically falls back to an in-process asynchronous task runner. Your background certificate PDFs and simulated WhatsApp deliveries will still run without crashing!

### Step 2: Initialize Database and Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev
```

The backend server will start on `http://localhost:5000`.

### Step 3: Start the Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

The frontend development server will launch at `http://localhost:5173`.

---

## 4. Pre-Configured Demo Accounts

Use the **1-Click Demo Switcher** pill on `/login` or in the dashboard header to switch between accounts without typing:

| Name | Role | Email | Password |
|---|---|---|---|
| **Anika** | `TRAINING_CENTRE` | `anika@certiflow.gov.in` | `CertiFlow@2026` |
| **Dev** | `DISTRICT_OFFICER` | `dev@certiflow.gov.in` | `CertiFlow@2026` |
| **Meera** | `DISTRICT_OFFICER` | `meera@certiflow.gov.in` | `CertiFlow@2026` |
| **Kabir** | `DISTRICT_OFFICER` | `kabir@certiflow.gov.in` | `CertiFlow@2026` |
| **Neha** | `QUALITY_TEAM` | `neha@certiflow.gov.in` | `CertiFlow@2026` |
| **Farah** | `STATE_OFFICE` | `farah@certiflow.gov.in` | `CertiFlow@2026` |

---

## 5. Automated Tests

To run the automated Vitest test suite:
```bash
cd backend
npm run test
```

To run a production build check:
```bash
# Backend build check
cd backend
npm run build

# Frontend build check
cd ../frontend
npm run build
```

---

## 6. Troubleshooting

- **Port in Use (5000 or 5173)**: If another application is listening on port 5000 or 5173, adjust `PORT` in `backend/.env` or the port setting in `frontend/vite.config.ts`.
- **Database Connection Error**: Ensure PostgreSQL is running and credentials in `backend/.env` match your database user.
- **Prisma Client Missing**: Run `cd backend && npx prisma generate` to rebuild the typed Prisma Client.

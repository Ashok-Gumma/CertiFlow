# CertiFlow — Skilling Certificate Issuance Platform

> **"Trusted Credentials. Verified Skills."**

CertiFlow is an institutional, production-minded full-stack web platform designed to streamline, authorize, issue, and verify vocational and technical skilling certificates across multi-tiered governance hierarchies.

---

## 1. System Overview

CertiFlow bridges training providers, government certifying officers, and employers through an automated, cryptographically verifiable, and auditable pipeline:

```
[Training Centre] ───(CSV Upload & Batch)───► [District Review (2 Officers)]
                                                         │
                                             (Batch Count ≥ 50?)
                                             ├── YES ──► [Quality Review (Neha)]
                                             └── NO  ────┐
                                                         ▼
                                              [State Final Approval (Farah)]
                                                         │
                                               (BullMQ + Redis Outbox)
                                                         │
                                   ┌─────────────────────┴─────────────────────┐
                                   ▼                                           ▼
                      [PDF-Lib Certificate Gen]                  [WhatsApp Simulator]
                      (Collision-Safe CF Number & QR)            (Exp. Backoff & Retries)
                                   │                                           │
                                   └─────────────────────┬─────────────────────┘
                                                         ▼
                                           [Public Verification Registry]
                                           (/verify/:certificateId)
```

### Key Highlights
- **Role-Based Governance (RBAC)**: Enforces distinct role-level boundaries on both backend Express routes and React frontend components.
- **Strict CSV Schema Validation**: All-or-nothing transactional guarantees. A single bad record halts the batch, returning exact row errors.
- **Two Distinct District Signoffs**: Two different district officers must approve before a batch advances. Concurrency-safe unique database constraints prevent duplicate signoffs.
- **Conditional Quality Scrutiny**: Batches with $\ge 50$ candidates trigger Quality Team (Neha) review; smaller batches bypass directly to State Office.
- **Institutional PDF Generation**: Landscape A4 certificates rendered using `pdf-lib` featuring double borders, official seals, and high-density QR codes pointing to live verification URLs.
- **Collision-Safe Certificate IDs**: Standardized university-style identifiers formatted as `CF/YYYY/CODE/MM/SERIAL`.
- **Public Verification Registry**: Unauthenticated public verification directly checking PostgreSQL (never trusting client parameters or static PDFs) with support for instant revocation displays.
- **Resilient Background Queues & WhatsApp Simulation**: BullMQ and Redis with an in-process fallback runner, exponential backoff, and idempotency keys to ensure messages are never double-sent.
- **Live Server-Sent Events (SSE)**: Pushes real-time alerts across browsers as batches are submitted, approved, or certificates are generated.
- **Stuck Batch Monitoring**: Identifies batches waiting untouched beyond configurable thresholds (e.g. 24 hours).

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, DaisyUI, Framer Motion, Lucide React, React Router 6, TanStack Query, Axios, PapaParse |
| **Backend** | Node.js (v20+), Express, TypeScript, Zod Validation, JWT Authentication, bcryptjs, Helmet, Express Rate Limit, Multer |
| **Database & ORM** | PostgreSQL 15, Prisma ORM (Migrations, Relations, Transactions, Seeds) |
| **Queues & Caching**| Redis 7, BullMQ (with in-process resilient task runner fallback) |
| **PDF & QR Generation**| `pdf-lib` (pure JavaScript vector PDF generator), `qrcode` |
| **Testing** | Vitest, Supertest (22 passing unit, integration, and security tests) |
| **DevOps & Containers**| Docker, Docker Compose, Nginx Multi-Stage Builds |

---

## 3. Demo Personas & Pre-Seeded Accounts

CertiFlow features a visible **1-Click Demo Mode Switcher** both on the `/login` screen and in the dashboard header.

| Persona Name | Role | Email | Default Password | Scope of Authority |
|---|---|---|---|---|
| **Anika** | `TRAINING_CENTRE` | `anika@certiflow.gov.in` | `CertiFlow@2026` | Creates batches, uploads candidate CSVs, submits & fixes returned batches. |
| **Dev** | `DISTRICT_OFFICER` | `dev@certiflow.gov.in` | `CertiFlow@2026` | Reviews assigned district batches, provides District Approval 1 of 2. |
| **Meera** | `DISTRICT_OFFICER` | `meera@certiflow.gov.in` | `CertiFlow@2026` | Provides District Approval 2 of 2. |
| **Kabir** | `DISTRICT_OFFICER` | `kabir@certiflow.gov.in` | `CertiFlow@2026` | Alternate District Officer for Bengaluru Urban. |
| **Neha** | `QUALITY_TEAM` | `neha@certiflow.gov.in` | `CertiFlow@2026` | Quality compliance review for batches with $\ge 50$ candidates. |
| **Farah** | `STATE_OFFICE` | `farah@certiflow.gov.in` | `CertiFlow@2026` | Final state authorization, triggers certificate generation, certificate revocation. |

---

## 4. Repository Structure

```
certiflow/
├── frontend/                     # React + Vite + Tailwind + DaisyUI
│   ├── src/
│   │   ├── components/           # Common, layout, modals, tables, badges
│   │   ├── contexts/             # AuthContext (JWT/Demo), NotificationContext (SSE)
│   │   ├── pages/                # Landing, Login, Dashboard, Batches, Approvals, Verify
│   │   ├── services/             # Axios API client
│   │   ├── types/                # TypeScript interfaces
│   │   └── App.tsx               # Route architecture
│   ├── Dockerfile                # Multi-stage production Nginx container
│   └── package.json
│
├── backend/                      # Node.js + Express + Prisma + BullMQ
│   ├── prisma/
│   │   ├── schema.prisma         # Relational database models & enums
│   │   └── seed.ts               # Demo accounts, districts, batches seed script
│   ├── src/
│   │   ├── config/               # Environment settings
│   │   ├── controllers/          # Business logic handlers
│   │   ├── events/               # SSE event bus
│   │   ├── middleware/           # JWT authentication, RBAC, Zod validation
│   │   ├── queues/               # BullMQ queues & resilient dispatchers
│   │   ├── routes/               # REST API route definitions
│   │   ├── services/             # pdf-lib generator, csv validation, WhatsApp simulator
│   │   ├── utils/                # Prisma client, certificate ID generator, logger
│   │   ├── validators/           # Zod schemas
│   │   ├── workers/              # Certificate PDF generator and WhatsApp workers
│   │   └── server.ts             # Express server entry point
│   ├── tests/                    # Vitest test suite (CSV, approvals, security, delivery)
│   ├── Dockerfile                # Node 20 production container
│   └── package.json
│
├── docker-compose.yml            # Complete stack orchestration (DB, Redis, API, Worker, UI)
├── .env.example                  # Environment variable reference
├── README.md                     # Architecture and feature manual
├── SETUP.md                      # Quickstart and setup guide
└── DEPLOYMENT.md                 # 100k user production deployment architecture
```

---

## 5. End-to-End Demo Scenario Walkthrough

Follow this 14-step scenario to experience the complete platform:

1. **Open Application**: Navigate to `http://localhost:5173`.
2. **Log In as Anika**: Click **Login** and select **Anika** (`TRAINING_CENTRE`).
3. **Create Batch**: Click **+ Create Batch**, input:
   - Batch Name: `Java Enterprise Full Stack Development 2026`
   - Course: `Java Enterprise Full Stack Development` (Code: `JAVA`)
   - Candidate Count: `60` (ensures Quality Review triggers!)
4. **Upload CSV**: Download the sample template or upload a 60-row candidate CSV.
5. **Validation Check**: View the row-level validation. If valid, proceed to Step 4 and click **Submit Batch for Approval**.
6. **Dev Approves**: Use the top header **Demo Switcher** to switch to **Dev** (`DISTRICT_OFFICER`). Open the batch and click **Approve District Review**. Status updates to `DISTRICT_REVIEW` (1 of 2).
7. **Meera Approves**: Switch to **Meera** (`DISTRICT_OFFICER`) and click **Approve District Review**. Because candidate count is $60 \ge 50$, status automatically advances to `QUALITY_REVIEW`!
8. **Neha Quality Review**: Switch to **Neha** (`QUALITY_TEAM`). Review candidate records and click **Approve Quality Review**. Status advances to `STATE_REVIEW`.
9. **Farah State Authorization**: Switch to **Farah** (`STATE_OFFICE`). Click **Grant Final State Approval**.
10. **Background Jobs Trigger**:
    - `pdf-lib` worker generates 60 unique certificates (`CF/2026/JAVA/11/000142`, etc.) with QR codes.
    - WhatsApp simulator dispatches messages with exponential backoff.
11. **Download & Verify**:
    - Under the **Candidates** tab, click **PDF** to download any generated institutional certificate.
    - Copy the Certificate ID.
12. **Public Verification**:
    - Open an incognito browser tab to `http://localhost:5173/verify/<CERTIFICATE_ID>`.
    - Observe the animated green checkmark with authentic institutional details.
13. **Revocation**:
    - As **Farah** (`STATE_OFFICE`), navigate to `/certificates`, locate the certificate, and click **Revoke**.
    - Enter a mandatory reason: `"Assessment integrity violation detected in physical audit"`.
14. **Instant Verification Update**:
    - Refresh the public verification page.
    - The page immediately displays **CERTIFICATE REVOKED** with the official cancellation reason.

---

## 6. Running the Automated Test Suite

CertiFlow includes a complete Vitest suite covering CSV parsing, approval transitions, PDF generation, and security:

```bash
cd backend
npm run test
```

Result:
```
 ✓ tests/approval.test.ts (3 tests)
 ✓ tests/csv.test.ts (7 tests)
 ✓ tests/delivery.test.ts (2 tests)
 ✓ tests/security.test.ts (7 tests)
 ✓ tests/certificate.test.ts (3 tests)

 Test Files  5 passed (5)
      Tests  22 passed (22)
```

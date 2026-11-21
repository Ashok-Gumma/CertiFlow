# CertiFlow — Production Deployment & Scale Architecture

This document outlines the production architecture, scaling benchmarks, failure mitigations, and infrastructure cost estimates for deploying **CertiFlow** to handle **100,000 registered users, 10,000 daily active users, 500 batch approvals per hour, 30,000 PDF generations, and high-frequency public verification requests**.

---

## 1. High-Level Architecture Diagram

```
                                [ Cloudflare CDN / WAF / DDoS Protection ]
                                                    │
                               ┌────────────────────┴────────────────────┐
                               ▼                                         ▼
                   [ Frontend Static Assets ]                 [ ALB / API Gateway ]
                   (Cloudflare Pages / S3+CF)                            │
                                                                         ▼
                                                            [ Auto-Scaled API Cluster ]
                                                            (AWS ECS Fargate / GCP Cloud Run)
                                                            3 - 10 Instances
                                                                   │       │
                               ┌───────────────────────────────────┘       │
                               ▼                                           ▼
                  [ PostgreSQL Cluster ]                       [ Redis Cluster ]
                  (AWS RDS Multi-AZ pg15)                      (AWS ElastiCache Redis 7)
                  Primary (Writes) + Read Replicas (Verification)          │
                               ▲                                           ▼
                               │                               [ Worker Auto-Scaling Group ]
                               │                               (Dedicated ECS CPU-Optimized)
                               │                               Scales on BullMQ Queue Depth
                               └───────────────────────────────────────────┘
                                                   │
                                                   ▼
                                         [ AWS S3 Object Store ]
                                         (Encrypted Certificate PDFs)
```

---

## 2. Infrastructure Components

### 2.1. Frontend Hosting
- **Target**: Cloudflare Pages or AWS S3 + CloudFront CDN.
- **Benefits**:
  - Global edge caching (sub-20ms TTFB worldwide).
  - Infinite auto-scaling for landing and public verification pages.
  - Zero server load on the API for static HTML/JS/CSS assets.

### 2.2. Backend REST API
- **Target**: AWS ECS Fargate or GCP Cloud Run.
- **Configuration**:
  - Minimum 3 instances (high availability across multiple Availability Zones).
  - Maximum 15 instances during peak state approval hours.
  - Scaling Metric: Target 60% CPU utilization or 800 active concurrent connections per task.

### 2.3. PostgreSQL Database
- **Target**: AWS RDS PostgreSQL 15 (Multi-AZ) or GCP Cloud SQL.
- **Instance Sizing**: `db.r6g.xlarge` (4 vCPU, 32 GB RAM) for Primary.
- **Read Replicas**: 2 x `db.r6g.large` dedicated for public `/api/public/verify/:id` traffic and audit log read queries.
- **Connection Pooling**: AWS RDS Proxy or PgBouncer configured for a maximum of 5,000 pooled connections to prevent connection starvation during peak concurrent batch uploads.

### 2.4. Redis & Background Workers
- **Target**: AWS ElastiCache for Redis (Cluster mode enabled, Multi-AZ).
- **Instance Sizing**: `cache.m6g.large` (2 nodes).
- **Workers**: Separate ECS Fargate service dedicated exclusively to consuming BullMQ queues (`certificate-generation` and `whatsapp-delivery`).
  - Scales independently from the API server based on `QueueBacklogDepth` metric.

### 2.5. Certificate File Storage
- **Target**: AWS S3 Bucket with Server-Side Encryption (KMS AES-256).
- **Access Policy**: Private bucket. No public reads.
- **Retrieval**: Generated PDFs are uploaded to `s3://certiflow-credentials/{hash}.pdf`. Download endpoints generate time-limited pre-signed URLs (15-minute expiry) or stream directly.

---

## 3. Handling Peak Production Loads

### 3.1. Peak Event: 500 Batch Approvals in 1 Hour ($30,000$ Certificates)
- **Workload**: 500 approvals $\times$ 60 candidates = 30,000 certificate PDFs and 30,000 WhatsApp deliveries triggered within 60 minutes ($\approx 8.3$ certificates/sec sustained, peak 40/sec).
- **Worker Auto-Scaling**:
  - Each ECS worker task runs 5 concurrent PDF generation threads via `pdf-lib`.
  - Average PDF generation time = 45ms per document.
  - Single worker capacity = $\approx 100$ certificates/sec.
  - 4 worker instances can process the entire 30,000 PDF backlog in **under 1.5 minutes**, leaving zero backlog.

### 3.2. Public Verification Surges (Thousands/sec)
- Public verification endpoint `GET /api/public/verify/:certificateId`:
  - Routed directly to PostgreSQL Read Replicas.
  - Redis cache layer stores verified certificate responses with a 1-hour TTL.
  - Revocations immediately evict the Redis cache key via `eventBus` / Outbox event, guaranteeing zero stale verifications.

---

## 4. Failure Mitigations & Self-Healing

| Failure Scenario | Architectural Mitigation |
|---|---|
| **Worker Crash during PDF Generation** | BullMQ automatically detects abandoned locks (`stalledInterval: 30000ms`). The job is requeued to an active worker. Database unique constraint on `[candidateId]` ensures no duplicate certificate rows are created. |
| **Redis Outage / Restart** | The backend implements a **Transactional Outbox Pattern**: certificate events are recorded in PostgreSQL `OutboxEvent` table before dispatch. An asynchronous outbox poll sweeps unqueued events once Redis reconnects. |
| **External WhatsApp API Outage** | The delivery worker enforces exponential backoff (2s, 6s, 18s). Failed jobs enter BullMQ's failed queue. Administrators use the **"Retry Failed"** button or automated cron retry. Delivery state is guarded by idempotency keys to prevent duplicate WhatsApp messages. |
| **Database Connection Slowdown** | Read-heavy queries (public verification, lookups, audit logs) are offloaded to read replicas via RDS Proxy. The primary database only handles transactional writes. |

---

## 5. Security & Access Control

1. **Least-Privilege RBAC**:
   - Training Centres can only read/write their own batches.
   - District Officers can only view and approve batches matching their assigned `districtId`.
   - Only `STATE_OFFICE` can trigger certificate revocation.
2. **Rate Limiting**:
   - `express-rate-limit` throttles public verification endpoints to 60 req/min per IP to prevent dictionary scraping.
3. **Data Protection**:
   - Passwords hashed with bcrypt (salt rounds: 10).
   - Sensitive personal information (phone numbers, full candidate roster) is masked for unauthenticated public viewers.

---

## 6. Monitoring & Alerting

- **APM**: Datadog or OpenTelemetry + Prometheus & Grafana.
- **Key Metrics Monitored**:
  - `bullmq.queue.waiting`: Alert if backlog exceeds 500 jobs for $> 5$ minutes.
  - `http.response.5xx`: Alert if error rate exceeds 0.5%.
  - `database.cpu.utilization`: Alert if primary database exceeds 75%.
  - `stuck.batches.count`: Alert State Office if any batch remains in review for $> 24$ hours.
- **Error Tracking**: Sentry integrated across both Frontend and Backend Express handlers.

---

## 7. Approximate Monthly Infrastructure Cost (USD)

| Service | Specification | Monthly Cost (Est.) |
|---|---|---|
| **Cloudflare Pages / Pro** | Global CDN & DDoS Protection | $20 |
| **AWS ECS Fargate (API)** | 3-6 tasks (1 vCPU, 2 GB RAM) | $120 |
| **AWS ECS Fargate (Workers)** | 2-8 tasks (2 vCPU, 4 GB RAM) | $180 |
| **AWS RDS PostgreSQL** | `db.r6g.xlarge` Multi-AZ + 1 Read Replica | $520 |
| **AWS ElastiCache Redis** | `cache.m6g.large` (2 nodes Multi-AZ) | $140 |
| **AWS S3 & CloudFront** | 100 GB Certificate Storage & Bandwidth | $15 |
| **Monitoring & Sentry** | Centralized Logging & Error Tracking | $50 |
| **Total Estimated Cost** | **Production Grade (100k Users)** | **~$1,045 / month** |

---

## 8. Architectural Trade-Off Analysis

### Modular Monolith vs. Microservices
- **Decision**: CertiFlow utilizes a **Modular Monolith** for core REST APIs paired with **Independently Scaled Background Workers**.
- **Rationale**:
  - Eliminates distributed transaction complexities (2PC, saga patterns) during multi-officer batch approvals.
  - Allows atomic PostgreSQL transactions for the 4-step CSV upload and 2-officer approval cycle.
  - Background workers scale horizontally on their own compute cluster without coupling to API request lifecycles.
  - Significantly reduces deployment complexity and infrastructure operational overhead.

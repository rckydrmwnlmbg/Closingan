# Software Requirements Specification (SRS)
# CLOSINGAN — AI Assistant untuk Sales Mobil Indonesia

| | |
|---|---|
| **Dokumen** | Software Requirements Specification |
| **Versi** | 1.0 |
| **Status** | Draft |
| **Tanggal** | Mei 2026 |
| **Owner** | Ricky Darmawan Lambogo |
| **Dokumen Terkait** | `srs/brd.md`, PRD v1.0 |

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Gambaran Sistem](#2-gambaran-sistem)
3. [User Classes](#3-user-classes)
4. [Daftar Functional Requirements](#4-daftar-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Batasan Sistem](#6-batasan-sistem)
7. [Arsitektur Teknis](#7-arsitektur-teknis)
8. [Dependency Eksternal](#8-dependency-eksternal)
9. [Glossary](#9-glossary)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini mendefinisikan seluruh kebutuhan fungsional dan non-fungsional sistem CLOSINGAN secara teknis. Menjadi referensi utama bagi tim engineering dalam membangun, menguji, dan memelihara sistem.

### 1.2 Scope

Mencakup seluruh komponen sistem CLOSINGAN dari Phase 1 (MVP) hingga Phase 3 (Public Launch):
- Backend API (NestJS)
- Frontend Web App (Next.js + PWA)
- Queue & Worker System (BullMQ)
- Integrasi eksternal (WhatsApp, AI, Payment)
- Sistem keamanan multi-tenant

### 1.3 Konvensi Dokumen

- **FR-XXX-NNN** — Functional Requirement (module code + nomor urut)
- **NFR-NNN** — Non-Functional Requirement
- **Priority:** `P0` blocker launch · `P1` penting · `P2` nice to have

---

## 2. Gambaran Sistem

```
┌─────────────────────────────────────────────────────┐
│                    USER LAYER                       │
│         Sales (Web App / Mobile PWA)                │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────▼──────────────────────────────┐
│                    API LAYER                        │
│     NestJS REST API + WebSocket (Socket.io)         │
│     JWT Auth · Rate Limiting · Tenant Isolation     │
└──────────┬──────────────┬──────────────┬────────────┘
           │              │              │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────────┐
    │  PostgreSQL │ │   Redis    │ │  BullMQ Queue │
    │  (Primary + │ │  (Cache +  │ │  (7 queues)   │
    │   Replica)  │ │   Broker)  │ └───────┬───────┘
    └─────────────┘ └────────────┘         │
                                  ┌────────┴────────┐
                            ┌─────▼────┐      ┌─────▼──────┐
                            │  Fonnte  │      │   OpenAI   │
                            │ (WA API) │      │ (AI Model) │
                            └──────────┘      └────────────┘
```

---

## 3. User Classes

| User Class | Deskripsi | Hak Akses |
|---|---|---|
| **Sales** | Pengguna utama, sales individual otomotif | Full product access sesuai plan |
| **Founder/Admin** | Pemilik sistem | Admin dashboard, semua data |
| **Customer/Lead** | Calon pembeli yang chat via WA | Tidak akses sistem langsung |
| **AI Agent** | Sistem AI yang bertindak atas nama sales | Dibatasi oleh AI Safety rules |

---

## 4. Daftar Functional Requirements

Detail setiap modul ada di file terpisah dalam folder `/srs/`:

| Kode | Modul | File | Priority |
|---|---|---|---|
| FR-AUTH | Authentication & User Management | `fr-auth.md` | P0 |
| FR-WA | WhatsApp Connection & Management | `fr-whatsapp.md` | P0 |
| FR-INBOX | Inbox & Conversation Management | `fr-inbox.md` | P0 |
| FR-AI | AI System & Modes | `fr-ai.md` | P0 |
| FR-ASSESS | Lead Assessment & Hot Lead Detection | `fr-assessment.md` | P0 |
| FR-FU | Follow-up Engine | `fr-follow-up.md` | P0 |
| FR-CAMP | Smart Outreach & Campaign | `fr-campaign.md` | P1 |
| FR-CAT | Product Catalog Management | `fr-catalog.md` | P1 |
| FR-BILL | Billing & Subscription | `fr-billing.md` | P0 |
| FR-DASH | Dashboard & Overview | `fr-dashboard.md` | P0 |
| FR-ANA | Analytics & Reporting | `fr-analytics.md` | P1 |
| FR-NOTIF | Notification System | `fr-notification.md` | P0 |
| FR-CERT | Seller Profile & Verification | `fr-certificate.md` | P1 |
| FR-SET | Settings & Configuration | `fr-settings.md` | P0 |
| FR-SEC | Security & Anti-Abuse | `fr-security.md` | P0 |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-P01 | API response time p95 | < 500ms | P0 |
| NFR-P02 | Dashboard load time | < 1 detik | P0 |
| NFR-P03 | AI reply latency end-to-end | < 5 detik | P0 |
| NFR-P04 | WebSocket event delivery | < 500ms | P1 |
| NFR-P05 | Hot lead alert delivery | < 15 detik | P0 |
| NFR-P06 | Webhook processing | < 3 detik | P0 |
| NFR-P07 | Dashboard summary API (cached) | < 200ms | P1 |

### 5.2 Availability & Reliability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-A01 | System uptime | ≥ 99% / bulan | P0 |
| NFR-A02 | Zero message data loss | 100% | P0 |
| NFR-A03 | Graceful degradation saat provider down | Wajib | P0 |
| NFR-A04 | Rollback time | < 30 menit | P0 |
| NFR-A05 | Database backup restore time | < 30 menit | P1 |

### 5.3 Security

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-S01 | Multi-tenant data isolation | Zero cross-tenant access | P0 |
| NFR-S02 | JWT access token expiry | 15 menit | P0 |
| NFR-S03 | Data sensitif ter-enkripsi at rest | AES-256 | P0 |
| NFR-S04 | HTTPS enforced | Semua endpoint | P0 |
| NFR-S05 | Rate limiting | Semua public endpoint | P0 |
| NFR-S06 | Webhook signature validation | Wajib | P0 |
| NFR-S07 | Tidak ada secret di log | Wajib | P0 |
| NFR-S08 | CORS whitelist (bukan wildcard) | Wajib | P0 |

### 5.4 Scalability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-SC01 | Concurrent WebSocket connections | ≥ 500 | P1 |
| NFR-SC02 | Concurrent API requests | ≥ 200 | P1 |
| NFR-SC03 | Stateless API (horizontal scalable) | Wajib | P1 |
| NFR-SC04 | Blast queue tidak ganggu AI queue | Wajib | P0 |

### 5.5 Usability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-U01 | Mobile-first responsive (375px+) | Wajib | P0 |
| NFR-U02 | Dashboard dipahami dalam 5 detik | Wajib | P1 |
| NFR-U03 | Onboarding selesai < 10 menit | Wajib | P1 |
| NFR-U04 | Lighthouse mobile score | ≥ 80 | P2 |
| NFR-U05 | PWA installable di iOS & Android | Wajib | P2 |

### 5.6 Maintainability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-M01 | Structured JSON logging (Pino) | Wajib | P0 |
| NFR-M02 | Audit log untuk semua critical actions | Wajib | P0 |
| NFR-M03 | Provider abstraction (WA & AI) | Wajib | P1 |
| NFR-M04 | Feature flag system | Wajib | P2 |
| NFR-M05 | Automated test — critical paths | ≥ 80% coverage | P1 |

---

## 6. Batasan Sistem

| ID | Batasan | Keterangan |
|---|---|---|
| SYS-C01 | Hanya support WhatsApp | Instagram/FB di luar scope |
| SYS-C02 | AI tidak boleh generate simulasi kredit | Hard constraint via AISafetyService |
| SYS-C03 | 1 WA Business number per tenant (Starter/Pro) | Multi-number hanya Elite |
| SYS-C04 | Trial 1x per WA number (lifetime) | Anti-abuse |
| SYS-C05 | Campaign hanya ke existing contacts | Cold outreach dilarang |
| SYS-C06 | Business hours default 08:00–21:00 WIB | Configurable per tenant |
| SYS-C07 | Campaign max 20 pesan/menit per tenant | Anti-spam |

---

## 7. Arsitektur Teknis

### 7.1 Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Backend | NestJS | ≥ 10 |
| ORM | Prisma | ≥ 5 |
| Database | PostgreSQL | ≥ 15 |
| Cache / Broker | Redis | ≥ 7 |
| Queue | BullMQ | ≥ 4 |
| Frontend | Next.js | ≥ 14 |
| UI Components | shadcn/ui + Tailwind | Latest |
| State | Zustand | Latest |
| Realtime | Socket.io | ≥ 4 |
| Container | Docker + Docker Compose | Latest |
| Proxy | NGINX | Latest |
| WA Provider | Fonnte | Via abstraction |
| AI Provider | OpenAI GPT-4o-mini / GPT-4o | Via abstraction |
| Payment | Midtrans | Via abstraction |

### 7.2 Queue Priority System

| Queue | Priority | Max Concurrent |
|---|---|---|
| `hot-lead` | CRITICAL | 10 |
| `ai-reply` | HIGH | 10 |
| `escalation` | HIGH | 5 |
| `follow-up` | MEDIUM | 3 |
| `summary` | MEDIUM | 3 |
| `analytics` | LOW | 2 |
| `blast` | LOWEST | 2 (isolated pool) |

### 7.3 Core Database Tables

```
tenants              users                whatsapp_sessions
conversations        messages             leads
follow_ups           token_quotas         ai_usage_logs
audit_logs           escalation_logs      campaigns
campaign_recipients  suppression_list     conversation_summaries
analytics_events     knowledge_base       ai_feedback
subscriptions        invoices             referrals
failed_jobs          churn_signals        exit_surveys
```

---

## 8. Dependency Eksternal

| Dependency | Type | Fallback Strategy |
|---|---|---|
| Fonnte API | WA Provider | Queue freeze + manual mode + alert |
| OpenAI API | AI Provider | AI pause + manual mode + alert |
| Midtrans / Xendit | Payment | Retry + manual follow-up |
| SMTP Provider | Email | Queue retry x3 |
| Cloud Storage | File Storage | Local temp storage |

---

## 9. Glossary

| Term | Definisi |
|---|---|
| Tenant | Satu akun sales yang menggunakan CLOSINGAN |
| Conversation State | OPEN / WAITING_CUSTOMER / WAITING_SELLER / HUMAN_ACTIVE / AI_ACTIVE / ESCALATED / ARCHIVED |
| AI Mode | AI_ASSIST / SMART_HYBRID / AUTO_REPLY / AI_OFF |
| Heat Tier | LOW / WARM / HOT / CRITICAL |
| Subscription State | TRIAL / ACTIVE / PAST_DUE / SUSPENDED / CANCELLED |
| Human Takeover | Sales balas manual → AI pause otomatis + cooldown 15 menit |
| Grace Buffer | 5% buffer setelah quota habis, hanya operasi kritis diproses |
| DLQ | Dead Letter Queue — job gagal setelah max retry |
| Suppression List | Nomor yang dikecualikan dari campaign |
| Escalation | AI tidak bisa/tidak boleh jawab → serahkan ke sales |
| AISafetyService | Service yang memvalidasi semua AI output sebelum terkirim |

---

*Ini adalah dokumen SRS utama. Detail tiap modul ada di folder `/srs/`.*
*Owner: Ricky Darmawan Lambogo*

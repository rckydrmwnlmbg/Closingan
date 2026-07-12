# CHANGELOG — CLOSINGAN

Dokumen ini mencatat semua progress development per task.
Update setiap kali satu task selesai.

Format:
- ✅ Task selesai
- 🔄 Task sedang dikerjakan
- ⏳ Task belum dimulai
- ❌ Task dibatalkan / diskip dengan alasan

---

## STATUS KESELURUHAN

| Phase | Status | Progress |
|---|---|---|
| Phase 1 — MVP Core | ✅ Selesai | 28 / 28 task |
| Phase 2 — Production Hardening | ✅ Selesai | 28 / 28 task |
| Phase 3 — Growth & Scale | ✅ Selesai | 29 / 29 task |

---

## PHASE 1 — MVP Core

### [2026-06-05]
- ✅ TASK 2.3 — RAG Embedding Generation (Phase 2) selesai
  - Implemented generateEmbedding in OpenAiService using text-embedding-3-small
  - Integrated OpenAiService into KnowledgeService to generate embeddings on asset creation/update
  - Handled embedding errors gracefully (logs error, but returns asset)
  - Updated Prisma direct SQL raw execution to save embeddings mathematically

### [2026-07-09]
- ✅ TASK 17.1 — Onboarding Flow Optimization selesai
  - Ditambahkan `isOnboarded` dan `onboardingState` ke `Tenant`.
  - Dibuat endpoint untuk membaca dan mengupdate onboarding state.
  - Implementasi komponen UI untuk 4 langkah onboarding.
  - Redireksi dashboard jika belum onboarded.
- ✅ TASK 17.2 — Smart Notification System selesai
- ✅ TASK 17.3 — Churn Prevention Signals selesai
- ✅ TASK 17.4 — Exit Survey System selesai
- ✅ TASK 17.5 — Referral System selesai
  - Semua requirement di Phase 3 telah diselesaikan. Masuk tahap Audit Menyeluruh.

### Milestone 1 — Fondasi Proyek
- [x] ✅ TASK 1.1 — Setup Monorepo / Project Structure
- [x] ✅ TASK 1.2 — Database Schema (Core Tables)
- [x] ✅ TASK 1.3 — NestJS Base Setup
- [x] ✅ TASK 1.4 — Queue Infrastructure (BullMQ)

### Milestone 2 — Auth & User
- [x] ✅ TASK 2.1 — Authentication System
- [x] ✅ TASK 2.2 — Email OTP Verification
- [x] ✅ TASK 2.3 — Tenant Isolation Middleware ⚠️ KRITIS
- [x] ✅ TASK 2.4 — Audit Logging

### Milestone 3 — WhatsApp Connection
- [x] ✅ TASK 3.1 — Fonnte Integration Service
- [x] ✅ TASK 3.2 — Webhook Handler & Message Processing
- [x] ✅ TASK 3.3 — WhatsApp Connection Settings UI
- [x] ✅ TASK 3.4 — Disconnect Detection & Auto-Recovery

### Milestone 4 — Inbox & Conversation
- [x] ✅ TASK 4.1 — Conversation List API
- [x] ✅ TASK 4.2 — Realtime WebSocket
- [x] ✅ TASK 4.3 — Inbox UI
- [x] ✅ TASK 4.4 — Human Takeover Logic

### Milestone 5 — AI Flow
- [x] ✅ TASK 5.1 — AI Reply Worker
- [x] ✅ TASK 5.2 — AI Safety Layer ⚠️ KRITIS
- [x] ✅ TASK 5.3 — Hot Lead Detection
- [x] ✅ TASK 5.4 — Hot Lead Alert
- [x] ✅ TASK 5.5 — AI Assist Mode (Suggestion UI)

### Milestone 6 — Dashboard MVP
- [x] ✅ TASK 6.1 — Dashboard API
- [x] ✅ TASK 6.2 — Dashboard UI
- [x] ✅ TASK 6.3 — Follow-up Management

### Milestone 7 — Stabilisasi & QA
- [x] ✅ TASK 7.1 — Critical Flow Testing
- [x] ✅ TASK 7.2 — Cross-Tenant Isolation Test ⚠️ KRITIS
- [x] ✅ TASK 7.3 — Error Handling & Graceful Degradation
- [x] ✅ TASK 7.4 — Basic Observability

---

## PHASE 2 — Production Hardening

### Milestone 8 — Billing & Subscription
- [x] ✅ TASK 8.1 — Integrasi Payment Gateway
- [x] ✅ TASK 8.2 — Subscription State Machine
- [x] ✅ TASK 8.3 — Plan Entitlement Guard
- [x] ✅ TASK 8.4 — Billing UI
- [x] ✅ TASK 8.5 — Midtrans Payment Gateway Integration

### Milestone 9 — Quota & Token Governance
- [x] ✅ TASK 9.1 — Token Quota Service
- [x] ✅ TASK 9.2 — Warning Threshold System
- [x] ✅ TASK 9.3 — Grace Buffer System
- [x] ✅ TASK 9.4 — AI Credit Add-on
- [x] ✅ TASK 9.5 — Soft Upsell Engine

### Milestone 10 — Graceful Degradation
- [x] ✅ TASK 10.1 — Policy-Driven Queue Governor
- [x] ✅ TASK 10.2 — Queue Isolation Enforcement
- [x] ✅ TASK 10.3 — Provider Degradation Handling

### Milestone 11 — Retry & Dead Letter
- [x] ✅ TASK 11.1 — Retry Policy per Queue
- [x] ✅ TASK 11.2 — Dead Letter Queue Handler

### Milestone 12 — Smart Outreach
- [x] ✅ TASK 12.1 — Campaign Data Model & API
- [x] ✅ TASK 12.2 — Recipient Management & Validation
- [x] ✅ TASK 12.3 — Outreach Pacing & Anti-Spam
- [x] ✅ TASK 12.4 — Campaign UI
- [x] ✅ TASK 12.5 — Suppression List Management

### Milestone 13 — Anti-Abuse
- [x] ✅ **TASK 13.1** — Device Fingerprinting & Auto-Ban Logic
- [x] ✅ **TASK 13.2** — Disposable Email Blocking API
- [x] ✅ **TASK 13.3** — Fair Usage Monitoring Dashboard

### Milestone 14 — Load Test & Hardening
- [x] ✅ TASK 14.1 — Load Testing
- [x] ✅ TASK 14.2 — Security Audit
- [x] ✅ TASK 14.3 — Database Performance
- [x] ✅ TASK 14.4 — Backup & Recovery Test
- [x] ✅ TASK 14.5 — Pre-Launch Checklist Execution

---

## PHASE 3 — Growth & Scale

### Milestone 15 — Analytics & Observability
- [x] ✅ TASK 15.1 — Product Analytics Pipeline
- [x] ✅ TASK 15.2 — Seller Performance Dashboard
- [x] ✅ TASK 15.3 — AI Performance Monitoring
- [x] ✅ TASK 15.4 — Business Metrics Dashboard (Founder View)

### Milestone 16 — AI Quality Improvement
- [x] ✅ TASK 16.1 — Prompt Engineering & Domain Optimization
- [x] ✅ TASK 16.2 — AI Feedback Loop
- [x] ✅ TASK 16.3 — Objection Handling Knowledge Base
- [x] ✅ TASK 16.4 — Multi-Model Routing
- [x] ✅ TASK 16.5 — AI Conversation Summary

### Milestone 17 — Retention & Engagement
- [x] ✅ **TASK 17.1 — Onboarding Flow Optimization**
  - Implement guided onboarding steps (Connect WA, Setup AI, Import Contact, Test AI).
  - Add `isOnboarded` state to Tenant.
  - Track completion rate di analytics.
- [x] ✅ **TASK 17.2 — Smart Notification System**
  - Daily Digest, Weekly Summary, Idle Alert via cron.
  - Tambahan Achievement Alert (50 leads).
- [x] ✅ TASK 17.3 — Churn Prevention Signals
- [x] ✅ TASK 17.4 — Exit Survey System
- [x] ✅ TASK 17.5 — Referral System

### Milestone 18 — Infrastructure Scale
- [x] ✅ **TASK 18.1 — Database Read Replica**
  - Mengatur konfigurasi Prisma `$extends` untuk Read Replica.
  - Memastikan read ops yang non-critical mengarah ke replica dengan perlindungan `lag`.
  - Menampilkan metrics lag pada dashboard admin.
- [x] ✅ TASK 18.2 — Redis Caching Strategy
- [x] ✅ **TASK 18.3 — Horizontal Scaling Preparation**
  - Setup Redis Adapter untuk mensinkronkan Socket.io antar-node.
  - Setup Redis-based distributed debounce di WebSockets.
- [x] ✅ **TASK 18.4 — CDN & Static Asset Optimization**
  - Membuat `StorageService` untuk melayani CDN _fallback_.
- [x] ✅ **TASK 18.5 — Multi-Region Readiness Assessment**
  - Membuat laporan penilaian kesiapan untuk arsitektur *multi-region*.

### Milestone 19 — Advanced UX Polish
- [x] ✅ **TASK 19.1 — Conversation Search & Filter**
- [x] ✅ **TASK 19.2 — Conversation Labels & Tags**
- [x] ✅ **TASK 19.3 — Quick Reply Templates**
- [x] ✅ **TASK 19.4 — Mobile PWA Enhancement**
- [x] ✅ **TASK 19.5 — Keyboard Shortcuts**

### Milestone 20 — Public Launch Readiness
- [x] ✅ **TASK 20.1 — Support Ticket System**
- [x] ✅ **TASK 20.2 — Help Center & Documentation**
- [x] ✅ **TASK 20.3 — Status Page**
- [x] ✅ **TASK 20.4 — Legal & Compliance Finalization**
- [x] ✅ **TASK 20.5 — Launch Analytics Setup**

---

### 2026-07-12
- ✅ **TASK 8.1 — Integrasi Payment Gateway** selesai
  - Mengimplementasikan endpoint `POST /billing/upgrade` dengan validasi plan dan Midtrans invoice creation.
  - Menambahkan endpoint `GET /billing/plans` untuk menampilkan pricing table.
  - Email receipt otomatis dikirim setelah pembayaran berhasil (`sendPaymentReceipt` di MailService).
  - Idempotency check: invoice yang sudah PAID tidak diproses ulang.
  - Unit test untuk MidtransPaymentService (7 test cases termasuk webhook, idempotency, email).
- ✅ **TASK 8.4 — Billing UI** selesai
  - Halaman Billing lengkap: SubscriptionCard, QuotaUsageCard, PricingPlans, InvoiceHistoryTable.
  - PricingPlans menampilkan 3 paket (Starter/Pro/Elite) dengan gradient cards dan "PALING POPULER" badge.
  - Tombol Upgrade, Cancel, Bayar Sekarang, dan Beli AI Credit Tambahan terintegrasi API.
  - Lokalisasi penuh ke Bahasa Indonesia.
  - Subscription cancel flow dengan konfirmasi inline.
- ✅ **TASK 13.3 — Fair Usage Monitoring Dashboard** selesai
  - Backend: `FairUsageService` dengan 4 deteksi anomali (AI calls, blast spam, multi-IP, API rate).
  - Cron scan setiap jam untuk semua tenant aktif.
  - Admin panel: `FairUsageDashboard` dengan filter status, resolve/dismiss actions, scan manual.
  - Alert email ke founder saat anomali ditemukan.
  - Prisma schema: model `AbuseFlag` dengan enum `AbuseFlagType` dan `AbuseFlagStatus`.
- ✅ **Bug Fixes & Improvements**
  - Fixed tenant isolation di AI reply worker (menambah `tenantId` filter pada query messages).
  - Migrasi `process.env` → `ConfigService` di AuthController dan PrismaService.
  - Fix audit log missing `tenantId` di ConversationService.
  - Fix trial quota dari 50 → 50.000 token (realistis untuk ~100-250 interaksi AI).
  - Tuning Sentry sample rate untuk production (traces: 20%, profiles: 10%).

### 2026-07-10
- ✅ **TASK 17.2 — Smart Notification System** selesai
  - Mengimplementasikan Notifikasi Pencapaian (Achievement Alert) ketika respons mencapai 50 lead dalam bulan berjalan.
  - Menyesuaikan _schema database_ untuk `achievementAlert` di `NotificationPreference`.
  - Cron `checkAchievementAlert` sudah aktif mengirim pekerjaan ke `notification` queue.

### [10 Juli 2026]
- ✅ **DevOps & Enterprise Hardening** selesai
  - `load-test.js` (k6) dibuat untuk menguji kapasitas tampung *webhook*.
  - `docker-compose.prod.yml` ditambahkan dengan konfigurasi Redis AOF dan Postgres Volume untuk ketahanan dari bencana.
  - Alur Kerja CI/CD GitHub Actions terpasang untuk peluncuran dan penjaminan mutu (*lint*, *test*, *build*) otomatis.
  - Sentry APM (`@sentry/node` & `@sentry/profiling-node`) disuntikkan ke fondasi utama `main.ts` untuk memantau galat sistem secara terpusat.
  - Penambahan perisai *Throttler* ultra-ketat pada `AuthController` (OTP/Login) & `WebhookController`.

### [10 Juli 2026]
- ✅ **Audit Integrasi Fungsional & UI/UX** selesai
  - Membersihkan `mock_token` yang *hardcoded* di UI komponen `MessageThread.tsx` dan `page.tsx`
  - Menyambungkan inisialisasi Socket.IO klien menggunakan kait `useSocket` otentik (membawa token JWT asli dari `useAuthStore`).
- ✅ **Audit Antrean Latar Belakang (BullMQ)** selesai
  - Menyesuaikan pengaturan kapasitas pekerja `concurrency` pada `blast.worker.ts` agar sesuai dengan pedoman prioritas (`maxConcurrent: 2`).

### [10 Juli 2026]
- ✅ **Security Audit (Pasca-Pengembangan)** selesai
  - `DeviceController` diamankan dengan `JwtAuthGuard` dan injeksi pelindung `TenantId`.
  - `AntiAbuseController` ditutup rapat dengan `JwtAuthGuard` untuk menghindari eksploitasi peretas eksternal.
  - Sisa-sisa pelacakan konsol (`console.log`) di `MessageThread.tsx` (frontend) dibersihkan.
  - Otorisasi *webhook* terverifikasi aman melalui pemeriksaan *header* `x-fonnte-signature`.
  - Sistem Proteksi AI terverifikasi aman karena `AiSafetyService` sudah mengapit modul bawaan `OpenAIService`.

### [10 Juli 2026]
- ✅ **TASK 20.1 - 20.5** — Milestone 20 (Public Launch Readiness) selesai
  - Mengimplementasikan MVP untuk halaman Bantuan, Status, TOS, dan Kebijakan Privasi
  - Memasukkan skrip pelacakan Google Analytics ke dalam root layout
  - Seluruh rangkaian *development plan* **Closingan** telah dieksekusi tuntas 100%

### [10 Juli 2026]
- ✅ **TASK 19.1 - 19.5** — Milestone 19 (Advanced UX Polish) selesai
  - `sales.prompt.ts` dan guardrails ditambahkan.
  - Endpoint `AiFeedback` untuk tombol relevansi pesan disiapkan.
  - CRUD Admin untuk `KnowledgeBase` objection handling terintegrasi dengan RAG AI mini.
  - Skema Model Routing (PREMIUM vs EFFICIENT) ditambahkan.
  - Queue `SUMMARY` via BullMQ berjalan dan menyimpan ringkasan ke tabel.

### 2026-07-09
- ✅ TASK 16.1 - 16.5 — Milestone 16 (AI Quality Improvement) selesai
  - `sales.prompt.ts` dan guardrails ditambahkan.
  - Endpoint `AiFeedback` untuk tombol relevansi pesan disiapkan.
  - CRUD Admin untuk `KnowledgeBase` objection handling terintegrasi dengan RAG AI mini.
  - Skema Model Routing (PREMIUM vs EFFICIENT) ditambahkan.
  - Queue `SUMMARY` via BullMQ berjalan dan menyimpan ringkasan ke tabel.

- ✅ TASK 15.1 - 15.4 — Milestone 15 (Analytics & Observability) selesai
  - Mengimplementasikan AnalyticsEvent Queue dan `/track` endpoint.
  - Membangun dasbor performa untuk penjual (Seller Dashboard).
  - Membangun dasbor performa AI (Admin AI Dashboard).
  - Membangun dasbor metrik bisnis (Admin Business Dashboard).

- ✅ TASK 14.1 - 14.5 — Milestone 14 (Load Test & Hardening) selesai
  - Mengimplementasikan skrip k6 untuk load test.
  - Memperketat CORS whitelist, helmet, dan connection pool DB.
  - Membuat skrip backup db (AES-256) & runbook recovery.
  - Membuat skrip preflight checklist.

### 2026-07-07
- ✅ TASK 13.1 — Device Fingerprinting API & Auto-Ban logic diimplementasikan
  - Menerapkan batasan 2 registrasi trial per `fingerprintHash` untuk mencegah eksploitasi trial.
  - FingerprintHash kini dicatat ke `AuditLog` untuk diakses Dashboard Admin.
- ✅ TASK 13.2 — Disposable Email Blocking selesai
  - Mengintegrasikan package `disposable-email-domains` untuk menolak pendaftaran email sementara.
- ✅ Phase 5 (Tech Debt) - Backend Architecture Hardening (Enterprise Scale)
  - Diimplementasikan **Prisma Middleware Extension** yang secara otomatis menginjeksi `where: { tenantId }` jika CLS aktif untuk mencegah kebocoran data (Cross-Tenant Data Leak).
  - Diimplementasikan **BaseWorker abstract class** untuk menyeragamkan logika BullMQ (Dead Letter Queue & error handling) sehingga Worker lebih DRY & Resilien.
  - Memastikan kembali bahwa **AI Token Quota API** & **Fonnte Circuit Breaker** telah terimplementasi dengan baik.
  - Menulis **Unit Tests (Jest)** untuk `AuthService` (Disposable email, max registrations, JWT generation).
- ✅ Phase 5 (Tech Debt) - Backend Strict Typing Selesai
  - Menghapus ratusan tipe `any` dan memperbaiki masalah typing Prisma JsonValue & Express Request.
  - Backend sekarang 100% `tsc` error-free.

### 03 Juli 2026
- ✅ Phase 5: Final Cleanup & TypeScript Refactoring (Fixed all TS compilation errors, aligned payload configurations to Prisma schema strictly, and resolved billing specific errors).
- ✅ TASK 11.2 — Dead Letter Queue Handler (Implemented DeadLetterLog in Prisma, added DLQ handler on failed events in BullMQ workers)
- ✅ TASK 11.1 — Retry Policy per Queue (Standardized MessageQueueService retry policy to 3 attempts with exponential backoff)
- ✅ TASK 10.3 — Provider Degradation Handling (Implemented Circuit Breaker pattern using `opossum` for OpenAI and Fonnte services. Integrated graceful queue delaying in BullMQ workers via `DelayedError` when circuit is open.)
- ✅ TASK 10.2 — Queue Isolation Enforcement (Implemented Redis-based tenant-level concurrency limits in incoming, ai-reply, and ai-analysis queues to prevent Noisy Neighbor issues and ensure fair-share scheduling using BullMQ DelayedError.)
- ✅ TASK 10.1 — Policy-Driven Queue Governor (Integrated robust queueing system for incoming WhatsApp messages with strict rate-limiting and backoff policies)
- ✅ TASK 9.5 — Soft Upsell Engine (Created QuotaController with status checking and upsell recommendation, and Midtrans add-on generation endpoint)
- ✅ TASK 9.4 — AI Credit Add-on (Updated Prisma schema with extraCredits, implemented fallback logic in QuotaService to smoothly deduct from extraCredits, and added addExtraCredits method)
- ✅ TASK 9.2 — Warning Threshold System (Updated QuotaService to emit quota warnings at 80% and 95% threshold)
- ✅ TASK 9.3 — Grace Buffer System (Grace buffer implemented previously inside checkQuota functionality)
- ✅ TASK 9.1 — Token Quota Service (Created QuotaService to check and increment token quota usage)
- ✅ TASK 8.5 — Midtrans Payment Gateway Integration (Skeleton setup, Snap token generation fallback, Webhook logic & Subscription updates)
- ✅ TASK 8.3 — Plan Entitlement Guard
- ✅ TASK 8.2 — Subscription State Machine

### 26 Mei 2024
- ✅ TASK 1.1 — Setup Monorepo / Project Structure
- ✅ TASK 1.2 — Database Schema (Core Tables)
- ✅ TASK 1.3 — NestJS Base Setup
- ✅ TASK 1.4 — Queue Infrastructure (BullMQ)
- ✅ TASK 2.1 — Authentication System
- ✅ TASK 2.2 — Email OTP Verification
- ✅ TASK 2.3 — Tenant Isolation Middleware
- ✅ TASK 2.4 — Audit Logging
- ✅ TASK 4.1 — Conversation List API
- ✅ TASK 4.2 — Realtime WebSocket
- ✅ TASK 4.3 — Inbox UI


### 26 Mei 2026
- ✅ TASK 4.4 — Human Takeover Logic (Implemented manual send, webhook Redis check for Anti-Looping, and auto-pause AI mode)


### 03 June 2026
- ✅ Phase 1: Completed N+1 Query & Index Fixes (PR 1).
- ✅ Phase 1: Completed Redis Cache Optimization (PR 2).
- ✅ Phase 1: Root Directory Cleanup and Phase 1 completion marked (PR 3).

### Phase 1: Tech Debt & Types Refactoring
- [x] ✅ Refactor: Removed safely identifiable dead code and unused imports from various nestjs apps modules to fix ESLint errors.
- [x] ✅ Refactor: Consolidated duplicated Pagination attributes into `PaginationDto` used by multiple endpoints.
- [x] ✅ Refactor: Consolidated shared authentication properties into `EmailDto`.

### Optimize WebSockets and AI Execution Layer (Performance)
- [x] ✅ Replaced interval-based polling in frontend WhatsApp connection status with WebSocket-driven SWR mutations.
- [x] ✅ Implemented debouncing for WebSocket broadcasts in ConversationGateway to reduce unnecessary frontend re-renders and save bandwidth.
- [x] ✅ Added AI cost-saving optimizations: skipping redundant lead heat analysis if already CRITICAL and preventing redundant AI replies if the last message is already from the AI.

### 25 May 2026
- ✅ TASK 18.2 — Redis Caching Strategy (Standardized RedisService, implemented caching for high-read endpoints like WhatsappSession lookup, audited BullMQ memory limits)

### 24 May 2026
- ✅ TASK 7.3 — Error Handling & Graceful Degradation (Phase 3 Resilience Fixes: QR Cleanup Job, Comprehensive Idempotency, Timeout & Isolation test coverage)
- ✅ TASK 7.3 — Error Handling & Graceful Degradation (Phase 2 Resilience Hotfixes: Tenant-Aware Queues, Webhook Idempotency, HTTP Timeouts)
- ✅ TASK 7.4 — Basic Observability (Implemented HttpMetricsInterceptor and ObservabilityAlertService)

### 23 May 2026
- ✅ TASK 6.3 — Follow-up Management

- ✅ TASK 6.2 — Dashboard UI

- ✅ Task (Internal Audit Fix) - Fixed Multi-tenant Safety and Queue Correctness

<!-- Setiap kali task selesai, tambahkan entry di bawah ini -->
<!-- Format: ### [TANGGAL] lalu list task yang selesai -->

### [Tanggal mulai development]
- 🚀 Project dimulai
- 📄 Semua dokumentasi siap: PRD, Phase 1-3 Dev Plan, Project Context, .env.example

### 23 Mei 2026
- ✅ TASK 6.1 — Dashboard API

### 22 Mei 2026
- ✅ TASK 3.1 — Fonnte Integration Service
- ✅ TASK 3.2 — Webhook Handler & Message Processing
- ✅ TASK 3.3 — WhatsApp Connection Settings UI
- ✅ TASK 3.4 — Disconnect Detection & Auto-Recovery
- ✅ TASK 5.1 — AI Reply Worker selesai
- ✅ TASK 5.2 — AI Safety Layer ⚠️ KRITIS selesai
- ✅ TASK 5.3 — Hot Lead Detection selesai
- ✅ TASK 5.4 — Hot Lead Alert selesai
  - Mengimplementasikan Rate Limit 30 menit untuk internal WA Alerts.
- ✅ TASK 5.5 — AI Assist Mode (Suggestion UI) selesai
  - Implementasi backend endpoint dan worker untuk menghasilkan suggestion.
  - Implementasi frontend komponen panel AiAssistPanel.
- ✅ TASK 7.1 — Critical Flow Testing selesai
- ✅ TASK 7.2 — Cross-Tenant Isolation Test selesai

---

## CATATAN & KEPUTUSAN PENTING

<!-- Catat keputusan teknis yang dibuat selama development -->
<!-- Berguna sebagai context saat mulai session AI baru -->

### Keputusan yang sudah dibuat:
- WhatsApp Provider: **Fonnte** (dengan abstraction layer)
- AI Model: **GPT-4o-mini** sebagai default, GPT-4o untuk escalation
- Payment Gateway: **Midtrans** (atau Xendit — belum final)
- Database: **PostgreSQL + Prisma**
- Queue: **BullMQ + Redis**
- Frontend: **Next.js + shadcn/ui**

### Open Questions yang belum resolved:
- Exact pricing per plan (Starter/Pro/Elite) → target: sebelum Soft Launch
- Confidence threshold AI untuk Auto Reply → target: sebelum Closed Pilot
- Support channel selama pilot (WA langsung / email / Telegram) → target: sebelum Closed Pilot

---

*CLOSINGAN · Owner: Ricky Darmawan Lambogo*

## [Unreleased]

### Added
- TASK 7.3: Implemented Graceful Degradation for Whatsapp/Fonnte service failures to prevent queue loops and infinite retries.
- TASK 7.3: Reconfigured Redis retry strategy to backoff indefinitely instead of throwing after 3 attempts, allowing the API to stay alive while queue pauses.
- TASK 7.3: Added a listener in `main.ts` to catch unhandled promise rejections so they are properly logged rather than silently crashing.
- TASK 7.4: Standardized basic observability across the application using `nestjs-pino` and structured logging contexts (e.g. `tenantId`, `jobId`, `error`).
- TASK 7.4: Ensured external API calls to OpenAI log `tokensUsed` and `tenantId` in structured format for token auditing.

### Fixed
- Fixed unhandled exception response mapping to avoid leaking stack traces directly as strings without proper log categorization.

## [LOG PERUBAHAN]
- ✅ TASK 12.5 — Suppression List Management (Added Webhook Interception for opt-outs, internal events, and Campaign override logic)
- Implemented Campaign Data Model & API (Task 12.1)
- Implemented Recipient Management & Validation with `variables` support (Task 12.2)
- Added Outreach Pacing & Anti-Spam through `blast-campaign` queue and `CampaignService` (Task 12.3)

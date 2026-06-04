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
| Phase 2 — Production Hardening | ⏳ Belum dimulai | 0 / 28 task |
| Phase 3 — Growth & Scale | 🔄 Sedang dikerjakan | 1 / 29 task |

---

## PHASE 1 — MVP Core

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
- [ ] ⏳ TASK 8.1 — Integrasi Payment Gateway
- [x] ✅ TASK 8.2 — Subscription State Machine
- [x] ✅ TASK 8.3 — Plan Entitlement Guard
- [ ] ⏳ TASK 8.4 — Billing UI
- [x] ✅ TASK 8.5 — Midtrans Payment Gateway Integration

### Milestone 9 — Quota & Token Governance
- [x] ✅ TASK 9.1 — Token Quota Service
- [x] ✅ TASK 9.2 — Warning Threshold System
- [x] ✅ TASK 9.3 — Grace Buffer System
- [ ] ⏳ TASK 9.4 — AI Credit Add-on
- [ ] ⏳ TASK 9.5 — Soft Upsell Engine

### Milestone 10 — Graceful Degradation
- [ ] ⏳ TASK 10.1 — Policy-Driven Queue Governor
- [ ] ⏳ TASK 10.2 — Queue Isolation Enforcement
- [ ] ⏳ TASK 10.3 — Provider Degradation Handling

### Milestone 11 — Retry & Dead Letter
- [ ] ⏳ TASK 11.1 — Retry Policy per Queue
- [ ] ⏳ TASK 11.2 — Dead Letter Queue Handler

### Milestone 12 — Smart Outreach
- [ ] ⏳ TASK 12.1 — Campaign Data Model & API
- [ ] ⏳ TASK 12.2 — Recipient Management & Validation
- [ ] ⏳ TASK 12.3 — Outreach Pacing & Anti-Spam
- [ ] ⏳ TASK 12.4 — Campaign UI
- [ ] ⏳ TASK 12.5 — Suppression List Management

### Milestone 13 — Anti-Abuse
- [ ] ⏳ TASK 13.1 — Device Fingerprinting
- [ ] ⏳ TASK 13.2 — Disposable Email Blocking
- [ ] ⏳ TASK 13.3 — Fair Usage Monitoring

### Milestone 14 — Load Test & Hardening
- [ ] ⏳ TASK 14.1 — Load Testing
- [ ] ⏳ TASK 14.2 — Security Audit
- [ ] ⏳ TASK 14.3 — Database Performance
- [ ] ⏳ TASK 14.4 — Backup & Recovery Test
- [ ] ⏳ TASK 14.5 — Pre-Launch Checklist Execution

---

## PHASE 3 — Growth & Scale

### Milestone 15 — Analytics & Observability
- [ ] ⏳ TASK 15.1 — Product Analytics Pipeline
- [ ] ⏳ TASK 15.2 — Seller Performance Dashboard
- [ ] ⏳ TASK 15.3 — AI Performance Monitoring
- [ ] ⏳ TASK 15.4 — Business Metrics Dashboard (Founder View)

### Milestone 16 — AI Quality Improvement
- [ ] ⏳ TASK 16.1 — Prompt Engineering & Domain Optimization
- [ ] ⏳ TASK 16.2 — AI Feedback Loop
- [ ] ⏳ TASK 16.3 — Objection Handling Knowledge Base
- [ ] ⏳ TASK 16.4 — Multi-Model Routing
- [ ] ⏳ TASK 16.5 — AI Conversation Summary

### Milestone 17 — Retention & Engagement
- [ ] ⏳ TASK 17.1 — Onboarding Flow Optimization
- [ ] ⏳ TASK 17.2 — Smart Notification System
- [ ] ⏳ TASK 17.3 — Churn Prevention Signals
- [ ] ⏳ TASK 17.4 — Exit Survey System
- [ ] ⏳ TASK 17.5 — Referral System

### Milestone 18 — Infrastructure Scale
- [ ] ⏳ TASK 18.1 — Database Read Replica
- [x] ✅ TASK 18.2 — Redis Caching Strategy
- [ ] ⏳ TASK 18.3 — Horizontal Scaling Preparation
- [ ] ⏳ TASK 18.4 — CDN & Static Asset Optimization
- [ ] ⏳ TASK 18.5 — Multi-Region Readiness Assessment

### Milestone 19 — Advanced UX Polish
- [ ] ⏳ TASK 19.1 — Conversation Search & Filter
- [ ] ⏳ TASK 19.2 — Conversation Labels & Tags
- [ ] ⏳ TASK 19.3 — Quick Reply Templates
- [ ] ⏳ TASK 19.4 — Mobile PWA Enhancement
- [ ] ⏳ TASK 19.5 — Keyboard Shortcuts

### Milestone 20 — Public Launch Readiness
- [ ] ⏳ TASK 20.1 — Support Ticket System
- [ ] ⏳ TASK 20.2 — Help Center & Documentation
- [ ] ⏳ TASK 20.3 — Status Page
- [ ] ⏳ TASK 20.4 — Legal & Compliance Finalization
- [ ] ⏳ TASK 20.5 — Launch Analytics Setup

---

## LOG PERUBAHAN
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

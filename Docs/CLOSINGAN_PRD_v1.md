# Product Requirements Document
# CLOSINGAN — AI Assistant untuk Sales Mobil

| | |
|---|---|
| **Status** | Draft — Awaiting Sign-off |
| **Versi** | 1.0 |
| **Tanggal** | Mei 2026 |
| **Author** | [Nama Founder] |
| **DRI** | [Nama Founder] |
| **Reviewer** | Engineering Lead, QA Lead |
| **Target Launch** | Closed Pilot → Soft Launch |

---

## Daftar Isi

1. [Problem Statement](#1-problem-statement)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target User](#3-target-user)
4. [User Stories](#4-user-stories)
5. [Product Scope](#5-product-scope)
6. [Fitur Detail](#6-fitur-detail)
7. [Arsitektur & Stack Teknis](#7-arsitektur--stack-teknis)
8. [Business Model](#8-business-model)
9. [Launch Plan](#9-launch-plan)
10. [Open Questions](#10-open-questions)
11. [Sign-off Checklist](#11-sign-off-checklist)

---

## 1. Problem Statement

### Masalah yang Diselesaikan

Sales mobil di Indonesia kehilangan peluang closing karena tiga masalah operasional utama:

**1. Respons lambat** — Lead masuk lewat WhatsApp, namun sales sering tidak bisa membalas cepat karena multitasking, rapat, atau di luar kantor. Competitor yang lebih cepat merespons memenangkan deal.

**2. Follow-up tidak konsisten** — Sales mengandalkan memori atau catatan manual untuk follow-up. Lead yang tidak di-follow-up dalam 24–48 jam sering menjadi dingin atau pindah ke dealer lain.

**3. Hot lead tidak terdeteksi** — Sales tidak punya cara sistematis untuk membedakan lead yang serius (menanyakan harga, simulasi kredit, stok, test drive) dari lead yang sekadar browsing, sehingga energi tersebar merata ke semua lead.

### Mengapa Sekarang

Penetrasi WhatsApp di Indonesia mencapai >90% dan menjadi channel komunikasi utama antara dealer dan calon pembeli. Belum ada solusi SaaS vertikal yang fokus pada workflow sales otomotif berbasis WhatsApp dengan AI yang governed dan aman.

---

## 2. Goals & Success Metrics

### Goals

| Prioritas | Goal | Rationale |
|---|---|---|
| P0 | Sistem beroperasi stabil tanpa data loss, duplicate send, atau cross-tenant leakage | Trust adalah fondasi produk |
| P0 | AI tidak pernah menghasilkan klaim finansial atau promo yang tidak diverifikasi | Commercial safety doctrine |
| P1 | Sales dapat merespons lead lebih cepat dengan bantuan AI | Core value proposition |
| P1 | Tidak ada lead yang "jatuh" karena lupa follow-up | Core value proposition |
| P2 | Sales dapat mengidentifikasi hot lead secara realtime | Differentiation feature |

### Success Metrics — Pilot Phase

| Metrik | Target | Cara Ukur |
|---|---|---|
| Uptime sistem | ≥ 99% selama pilot | Monitoring dashboard |
| Duplicate send incident | 0 kejadian | Audit log |
| Cross-tenant data leak | 0 kejadian | Security audit |
| User activation rate | ≥ 70% (connect WA dalam 24 jam setelah signup) | Event tracking |
| 7-day retention | ≥ 60% | Cohort analysis |
| AI escalation rate (false promo/kredit) | 0% lolos tanpa escalation | QA sampling |
| Follow-up completion rate user | ≥ 50% follow-up di-act dalam waktu due | Product analytics |

### Success Metrics — Post Soft Launch (30 hari)

| Metrik | Target |
|---|---|
| Monthly Active User (MAU) | [TBD — ditetapkan setelah pilot] |
| Churn rate bulan pertama | < 20% |
| NPS | ≥ 30 |
| Support ticket critical | < 5% dari total user |
| Trial-to-paid conversion | ≥ 15% |

> **Catatan:** Target angka post-launch akan difinalisasi setelah data pilot tersedia.

---

## 3. Target User

### Primary ICP (Ideal Customer Profile)

**Siapa:** Sales executive otomotif individual di Indonesia yang aktif menjual melalui WhatsApp.

**Contoh profil:** Sales executive di dealer resmi Toyota/Honda/Mitsubishi, independent automotive closer, atau konsultan penjualan showroom.

**Karakteristik:**
- Menangani 20–100+ percakapan WhatsApp aktif per bulan
- Mobile-heavy, jarang di depan laptop
- Tidak punya tim admin atau CRM enterprise
- Bergantung pada WhatsApp sebagai satu-satunya channel komunikasi dengan lead

**Pain point utama:** Takut kehilangan lead karena lambat respons atau lupa follow-up.

### Excluded Segments (Bukan Target)

| Segment | Alasan Eksklusi |
|---|---|
| Enterprise dealership dengan tim IT | Butuh enterprise CRM, bukan tools individual |
| Sales non-otomotif | Prompt dan domain AI belum dioptimasi untuk vertikal lain |
| Sales yang tidak pakai WhatsApp | Core product dependency |
| Bisnis yang butuh loan calculator engine | Di luar scope: risiko compliance finansial |

---

## 4. User Stories

### Epic 1: Respons Lebih Cepat

> *"Sebagai sales mobil yang sedang di jalan, saya ingin AI membalas pertanyaan dasar lead saya secara otomatis sehingga mereka tidak menunggu dan tidak kabur ke kompetitor."*

**Acceptance Criteria:**
- AI dapat membalas pesan lead berdasarkan konteks percakapan dalam mode Auto Reply
- Jika sales membalas manual, AI otomatis pause dan tidak double-reply
- Sales dapat mengaktifkan/menonaktifkan AI kapan saja dari inbox

---

> *"Sebagai sales, saya ingin AI menyarankan balasan yang bisa saya edit sebelum dikirim, sehingga saya tetap kontrol tapi lebih cepat."*

**Acceptance Criteria:**
- Mode AI Assist menampilkan saran balasan di inbox
- Sales dapat memilih: kirim langsung, edit dulu, generate ulang, atau abaikan
- Saran tidak terkirim otomatis tanpa aksi eksplisit dari sales

---

### Epic 2: Follow-up Tidak Terlewat

> *"Sebagai sales, saya ingin diingatkan ketika saya perlu follow-up dengan lead tertentu, supaya tidak ada lead yang 'mendingin' karena saya lupa."*

**Acceptance Criteria:**
- Sales dapat membuat follow-up reminder dengan tanggal dan alasan
- Sistem menampilkan follow-up overdue secara prominent di dashboard
- Notifikasi dikirim ke WhatsApp pribadi sales saat follow-up jatuh tempo
- Sales dapat snooze (1 jam / besok / custom) atau complete follow-up

---

### Epic 3: Prioritas Lead yang Tepat

> *"Sebagai sales yang menangani 50+ percakapan, saya ingin tahu mana lead yang paling serius hari ini agar saya bisa fokus ke sana duluan."*

**Acceptance Criteria:**
- AI mendeteksi sinyal high-intent (tanya harga, stok, simulasi kredit, test drive)
- Lead dengan sinyal kuat ditandai sebagai Hot dan muncul di bagian atas inbox/dashboard
- AI memberikan penjelasan mengapa lead dikategorikan Hot (tidak black-box)
- Sales dapat override: mark hot atau mark not hot secara manual

---

### Epic 4: Keamanan & Kepercayaan

> *"Sebagai sales, saya ingin yakin bahwa AI tidak pernah mengirim informasi harga atau promo yang salah atas nama saya."*

**Acceptance Criteria:**
- AI tidak pernah menghasilkan angka simulasi kredit secara otomatis
- Jika lead meminta simulasi kredit, AI trigger escalation dan notifikasi ke sales
- Sales menerima alert WhatsApp untuk setiap escalation
- Semua pesan AI tercatat di audit log dengan timestamp

---

## 5. Product Scope

### Included — Initial Release

| Area | Fitur |
|---|---|
| Inbox | Realtime conversation, AI assist, manual control, AI toggle |
| AI Auto Reply | Intent detection, context-aware reply, governed automation |
| AI Assist | Saran balasan, objection handling, re-engagement suggestion |
| Hot Lead Detection | Realtime scoring, explainable classification, alert |
| Follow-up Engine | Reminder, overdue tracking, snooze, AI recommendation |
| Smart Outreach | Governed campaign ke existing contacts |
| Dashboard | Hot leads, pending reply, follow-up hari ini, AI status, WA status |
| Settings | WA connection, AI settings, billing, notifikasi |
| Billing | Subscription, AI Credit add-on, trial management |

### Explicitly Excluded — Initial Release

| Fitur | Alasan |
|---|---|
| Instagram / Facebook DM | Di luar scope WA-first strategy |
| Loan calculator engine | Risiko compliance finansial |
| Enterprise CRM pipeline | Bukan target segment |
| Advanced analytics suite | Post-PMF feature |
| Multi-language (English) | Post-traction |
| Community layer | Post-retention-proven |

---

## 6. Fitur Detail

### 6.1 AI Modes

Setiap conversation memiliki satu AI mode aktif yang dapat diubah oleh sales kapan saja.

| Mode | Behavior | Kapan Digunakan |
|---|---|---|
| **AI ASSIST** | AI menyarankan, sales yang kirim | Default untuk semua user baru |
| **SMART HYBRID** | AI bertindak hanya jika confidence tinggi, eskalasi jika ragu | Sales aktif yang sudah percaya AI |
| **AUTO REPLY** | AI membalas otomatis dengan safeguard ketat | Saat sales tidak bisa pegang HP |
| **AI OFF** | Tidak ada AI activity | Negosiasi sensitif, preferensi sales |

**Human Takeover Rule:** Jika sales membalas manual → AI otomatis pause dengan cooldown default 15 menit. AI tidak boleh double-reply dalam kondisi apapun.

---

### 6.2 Hot Lead Detection

**Signal Inputs:**
- Pertanyaan harga berulang
- Menanyakan simulasi kredit / DP / cicilan
- Menanyakan ketersediaan stok
- Menanyakan estimasi delivery
- Permintaan test drive
- Frekuensi dan kecepatan balas yang tinggi
- Bahasa yang menunjukkan urgensi

**Priority Tiers:** `LOW → WARM → HOT → CRITICAL`

**Explainability Rule:** Setiap hot lead classification harus disertai label alasan yang dapat dibaca manusia. Contoh: *"Menanyakan harga · Balas cepat · Aktif hari ini"*. Black-box scoring dilarang.

**Seller Override:** Sales selalu dapat manually promote atau downgrade lead classification.

**Decay Rule:** Heat score turun secara otomatis jika tidak ada aktivitas baru dari lead dalam periode tertentu.

---

### 6.3 AI Safety Layer

AI **dilarang keras:**
- Menghasilkan angka simulasi kredit atau DP/cicilan secara otomatis
- Membuat klaim promo yang tidak ada dalam catalog resmi
- Bertindak otonom tanpa batas tanpa seller awareness
- Mengirim pesan dari nomor pribadi sales (hanya dari nomor WA Business)

**Escalation Triggers:**
- Lead meminta simulasi kredit → alert dashboard + WA notification ke sales
- Confidence AI di bawah threshold → tidak kirim, minta konfirmasi sales
- Konten yang tidak dikenali AI → escalate, jangan improvise

---

### 6.4 WhatsApp Architecture

| Nomor | Fungsi |
|---|---|
| **WA Business Number** | AI auto reply, komunikasi dengan customer, inbox operations |
| **WA Personal Notification Number** | Hot lead alert, escalation alert, reconnect alert, AI failure alert |

**Disconnect Handling:** Jika provider disconnect → AI pause otomatis → queue freeze → reconnect retry aktif → dashboard alert.

**Provider:** Fonnte (initial). Provider abstraction layer wajib ada agar tidak hard-coupled ke satu provider.

---

### 6.5 Token & Quota Governance

**Terminologi yang digunakan ke user:** AI Usage, AI Credit, AI Activity (bukan "token").

**Warning thresholds:**
- 70% quota terpakai → reminder
- 85% → warning
- 95% → critical state, non-priority queue dibatasi

**Grace Buffer:** 5% buffer setelah quota habis. Selama buffer aktif, AI hanya melayani: hot leads, escalation, active negotiation, critical reply. Feature non-esensial (blast berat, analytics refresh) dinonaktifkan sementara.

**Top-up:** User dapat membeli AI Credit tambahan kapan saja.

---

### 6.6 Dashboard — Prinsip UX

Dashboard harus dapat dipahami state-nya dalam hitungan detik (glanceability rule).

**Widget Wajib:**
- WhatsApp connection status
- AI operational mode (on/off/mode aktif)
- Hot leads hari ini
- Pending reply
- Overdue follow-up
- Critical alerts (jika ada)

**Prinsip UI:** Mobile-first, ringan, operasional. Bukan enterprise CRM yang berat. Vanity metrics dilarang.

---

## 7. Arsitektur & Stack Teknis

### Tech Stack

| Layer | Teknologi | Keputusan |
|---|---|---|
| Frontend | Next.js + shadcn/ui + Zustand | LOCKED |
| Realtime | WebSocket | LOCKED |
| Backend | NestJS | LOCKED |
| Queue | BullMQ + Redis | LOCKED |
| Database | PostgreSQL | LOCKED |
| Infra | Docker + NGINX | LOCKED |
| WA Provider | Fonnte | LOCKED (with abstraction layer) |
| AI Model | GPT-4o-mini class (efficient-first, premium escalation jika justified) | LOCKED |

### Core Database Tables

`tenants · users · whatsapp_sessions · conversations · messages · leads · ai_usage_logs · token_quotas · follow_ups · queue_events · escalation_logs · audit_logs`

### Queue Priority

| Queue | Priority |
|---|---|
| hot-lead | Critical |
| ai-reply | High |
| escalation | High |
| follow-up | Medium |
| summary | Medium |
| analytics | Low |
| blast | Lowest |

**Isolation Rule:** Blast queue tidak boleh menghambat ai-reply, hot-lead, atau escalation dalam kondisi apapun.

### Multi-Tenant

Semua data wajib tenant-isolated. Implementasi: tenant-scoped queries + row-level security. Cross-tenant query adalah automatic NO-GO.

### Observability

- Queue health monitoring
- AI latency tracking
- Provider health check
- Failed message tracking
- Reconnect state monitoring

**Alerts:** Reconnect alert · AI failure alert · Queue stuck alert · Webhook failure alert

---

## 8. Business Model

### Pricing

> **Catatan:** Angka harga final belum di-lock. Harus merefleksikan unit economics aktual setelah validasi AI cost, infra cost, dan payment processor fees.

| Plan | Target User | Posisi |
|---|---|---|
| **Starter** | Sales baru / volume lebih rendah | Entry point, ekonomis |
| **Pro** | Sales aktif harian, workflow dependency kuat | Sweet spot revenue |
| **Elite** | Power user, heavy operational | Premium tier |

### Monetisasi

- Subscription bulanan (utama)
- AI Credit add-on (upsell natural saat quota mendekati limit)
- Upsell harus contextual dan non-aggressive

**Contoh upsell yang benar:**
> *"Traffic lead bulan ini meningkat 🚀 AI Credit tambahan tersedia agar respons tetap optimal."*

### Trial

- Durasi: 7 hari (Pro Lite Trial)
- Fitur: AI auto reply, AI assist, hot lead detection, follow-up reminder, dashboard
- Batasan: Limited AI usage, 1 nomor WA saja, limited blast
- **Identity rule:** 1 nomor WA Business = 1 lifetime trial (anti-abuse)
- Trial baru aktif setelah: WA berhasil connected + OTP verification sukses

---

## 9. Launch Plan

### Fase 1 — Closed Pilot

**Tujuan:** Validasi trust, stabilitas, dan usability dengan user nyata dalam kondisi terkontrol.

**Kriteria masuk:**
- Semua P0 Engineering Go Checklist selesai
- AI Safety Layer tervalidasi (tidak ada false finance claims)
- Billing system berfungsi tanpa corrupt data
- Rollback plan siap dan sudah di-test

**Kriteria keluar (Pilot Exit):**
- Core trust tervalidasi: tidak ada duplicate send, tidak ada cross-tenant leak
- Tidak ada severe AI failure (false promo/kredit claims)
- Tidak ada severe billing failure
- Seller usability acceptable (berdasarkan feedback langsung)
- Tidak ada P0 unresolved

**Jumlah user:** Undangan terbatas (invite-only), direkomendasikan 5–20 seller terpercaya.

---

### Fase 2 — Soft Launch (Limited Public)

**Tujuan:** Validasi product-market fit dengan user yang lebih luas, namun tetap terkontrol.

**Gating options:**
- Invite-only / referral
- User cap (jumlah signup dibatasi)
- Feature flag untuk kontrol rollout bertahap

**War Room (First 72 Jam):**
Monitor: auth failures · AI failures · duplicate sends · billing mismatches · disconnect spikes · campaign failures.

**Rollback Triggers (Auto NO-GO):**
- Billing corruption
- Duplicate sends ke customer
- Major unsafe AI behavior
- Data exposure incident

**Rollback Actions:**
- Disable AI
- Disable outreach
- Freeze new signups
- Suspend billing activations
- Restore previous deployment

---

### Fase 3 — Public Release

Dilakukan setelah Fase 2 menghasilkan data yang cukup untuk memvalidasi:
- Retention sehat
- Support volume terkendali
- Unit economics terbukti

**Post-launch review (structured):** Trust incidents · billing issues · AI behavior · support volume · seller confusion · churn signals.

---

### Trust-Critical Blockers (Hard NO-GO)

Hal berikut adalah automatic NO-GO untuk setiap fase:

- Duplicate pesan terkirim ke customer
- Cross-tenant data leakage
- False paid access (user trial dapat fitur berbayar)
- AI menghasilkan klaim finansial tanpa escalation
- Hidden autonomous AI behavior (sales tidak sadar AI aktif)
- Broken unsubscribe / suppression enforcement

---

## 10. Open Questions

| # | Pertanyaan | Owner | Target Keputusan |
|---|---|---|---|
| OQ-1 | Berapa exact pricing per plan (Starter / Pro / Elite)? Harus divalidasi dari unit economics aktual. | Founder | Sebelum Soft Launch |
| OQ-2 | Apakah Fonnte memenuhi SLA yang dibutuhkan untuk pilot? Perlu uji beban. | Engineering | Sebelum Closed Pilot |
| OQ-3 | Berapa confidence threshold AI untuk Auto Reply mode? Perlu QA + prompt testing. | AI/Engineering | Sebelum Closed Pilot |
| OQ-4 | Support channel apa yang digunakan selama pilot? (WA langsung ke founder / email / Telegram) | Founder | Sebelum Closed Pilot |
| OQ-5 | Apakah Terms of Service dan Privacy Policy sudah siap dipublikasi? | Founder / Legal | Sebelum Trial Aktif |
| OQ-6 | Apa metrik definitif untuk mendeklarasikan "PMF tercapai" sebelum Community Layer dibangun? | Founder | Post Soft Launch |

---

## 11. Sign-off Checklist

> Setiap checklist harus di-approve secara eksplisit sebelum fase berikutnya dimulai.

### Founder Go
- [ ] Semua risiko dipahami dan diterima
- [ ] Trust blockers sudah direview
- [ ] Pricing sudah difinalisasi
- [ ] Support path aktif
- [ ] Legal (ToS + Privacy Policy) sudah published
- [ ] Rollback plan dipahami

### Engineering Go
- [ ] Deployment stable di production environment
- [ ] Secrets dan environment variables terverifikasi
- [ ] Monitoring live (queue health, AI latency, provider health)
- [ ] Rollback sudah di-test
- [ ] Production config validated

### QA Go
- [ ] Regression test passed
- [ ] Semua P0 clear
- [ ] Critical flows passed (signup, WA connect, AI reply, hot lead, follow-up, billing)
- [ ] Duplicate send test passed
- [ ] Cross-tenant isolation test passed

### AI Go
- [ ] Hallucination guard reviewed dan validated
- [ ] Escalation behavior correct (simulasi kredit → escalate, bukan reply)
- [ ] Finance safety validated (tidak ada angka kredit otomatis)
- [ ] Hidden autonomy tidak ditemukan

### Legal Go
- [ ] Terms of Service final dan published
- [ ] Privacy Policy final dan published
- [ ] AI disclosure language sudah ada di ToS
- [ ] Refund policy sudah jelas

### Billing Go
- [ ] Subscription flow tested end-to-end
- [ ] Trial activation dan expiry berfungsi benar
- [ ] Payment failure handling berfungsi
- [ ] Tidak ada false paid access

---

*Dokumen ini adalah PRD ringkas yang mengacu pada CLOSINGAN Master Spec v9 sebagai source of truth teknis yang lebih detail. Untuk spesifikasi implementasi, event contracts, state machines, dan API contracts — lihat Master Spec v9.*

---
**Versi Dokumen:** 1.0 | **Last Updated:** Mei 2026

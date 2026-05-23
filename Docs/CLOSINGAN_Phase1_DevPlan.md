# CLOSINGAN — Phase 1 Development Plan
## Breakdown Task untuk AI-Assisted Development

| | |
|---|---|
| **Owner** | Ricky Darmawan Lambogo |
| **Phase** | 1 — MVP Core |
| **Stack** | NestJS · PostgreSQL · Redis · BullMQ · Next.js · Fonnte |
| **Target** | Closed Pilot Ready |

---

## Cara Menggunakan Dokumen Ini

Setiap task dirancang agar bisa di-*prompt* langsung ke AI coding tool (Claude, Cursor, Copilot, dll). Urutan task **penting** — jangan loncat karena ada dependency antar task.

Gunakan format ini saat meminta AI coding tool:
> *"Saya membangun [konteks singkat]. Bantu saya [task spesifik]. Stack: NestJS, PostgreSQL, Redis. [Constraint tambahan]."*

---

## Gambaran Besar Phase 1

```
MILESTONE 1: Fondasi Proyek        (Minggu 1)
MILESTONE 2: Auth & User           (Minggu 1-2)
MILESTONE 3: WhatsApp Connection   (Minggu 2-3)
MILESTONE 4: Inbox & Conversation  (Minggu 3-4)
MILESTONE 5: AI Flow               (Minggu 4-5)
MILESTONE 6: Dashboard MVP         (Minggu 5-6)
MILESTONE 7: Stabilisasi & QA      (Minggu 6-7)
```

---

## MILESTONE 1 — Fondasi Proyek

> **Tujuan:** Project structure, database, dan infrastruktur dasar siap sebelum nulis fitur apapun.

---

### TASK 1.1 — Setup Monorepo / Project Structure

**Prompt ke AI:**
> "Buatkan struktur folder project NestJS monorepo untuk SaaS multi-tenant. Ada dua app: `api` (NestJS backend) dan `web` (Next.js frontend). Sertakan shared `libs` folder untuk types dan utils. Gunakan npm workspaces."

**Output yang diharapkan:**
```
/apps
  /api        → NestJS backend
  /web        → Next.js frontend
/libs
  /shared     → shared types, DTOs, constants
/docker-compose.yml
/.env.example
```

**Checklist selesai:**
- [ ] `docker-compose.yml` dengan PostgreSQL, Redis, API, Web
- [ ] `.env.example` lengkap dengan semua variable yang dibutuhkan
- [ ] Hot reload berfungsi di development

---

### TASK 1.2 — Database Schema (Core Tables)

**Prompt ke AI:**
> "Buatkan Prisma schema untuk aplikasi SaaS multi-tenant bernama CLOSINGAN. Core tables: `tenants`, `users`, `whatsapp_sessions`, `conversations`, `messages`, `leads`, `follow_ups`, `token_quotas`, `ai_usage_logs`, `audit_logs`. Setiap table harus punya `tenant_id` untuk row-level isolation. Sertakan relasi antar table."

**Detail penting yang harus ada:**
- Semua table punya `tenant_id`, `created_at`, `updated_at`
- `conversations` punya field: `state` (OPEN/WAITING_CUSTOMER/WAITING_SELLER/HUMAN_ACTIVE/AI_ACTIVE/ESCALATED/ARCHIVED), `ai_mode` (ASSIST/SMART_HYBRID/AUTO_REPLY/OFF)
- `messages` punya field: `sender_type` (AI/HUMAN/CUSTOMER), `delivery_state`
- `leads` punya field: `heat_score`, `heat_tier` (LOW/WARM/HOT/CRITICAL), `heat_reasons` (JSON array)
- `follow_ups` punya field: `status` (PENDING/DUE/OVERDUE/COMPLETED/SNOOZED/CANCELLED), `urgency` (LOW/MEDIUM/HIGH/CRITICAL)

**Checklist selesai:**
- [ ] Prisma schema valid dan bisa di-migrate
- [ ] `prisma migrate dev` berhasil tanpa error
- [ ] Seed data untuk 1 tenant test berhasil

---

### TASK 1.3 — NestJS Base Setup

**Prompt ke AI:**
> "Setup NestJS app dengan: global exception filter, request logging middleware, helmet untuk security headers, rate limiting dengan `@nestjs/throttler`, dan ConfigModule untuk env variables. Tambahkan health check endpoint di `/health`."

**Checklist selesai:**
- [ ] `/health` endpoint return `{ status: 'ok' }`
- [ ] Rate limiting aktif (test dengan banyak request)
- [ ] Unhandled error tidak expose stack trace di production mode

---

### TASK 1.4 — Queue Infrastructure (BullMQ)

**Prompt ke AI:**
> "Setup BullMQ di NestJS dengan Redis. Buat 7 queue dengan nama: `hot-lead`, `ai-reply`, `escalation`, `follow-up`, `summary`, `analytics`, `blast`. Buat BullMQ dashboard (Bull Board) di `/admin/queues` yang hanya bisa diakses dengan basic auth. Pastikan setiap queue punya worker terpisah."

**Checklist selesai:**
- [ ] Semua 7 queue terdaftar dan bisa menerima job
- [ ] Bull Board accessible di `/admin/queues`
- [ ] Test job masuk queue dan diproses worker

---

## MILESTONE 2 — Auth & User

> **Tujuan:** User bisa register, login, dan sistem tahu siapa yang sedang request.

---

### TASK 2.1 — Authentication System

**Prompt ke AI:**
> "Buatkan auth system di NestJS dengan: email+password login, JWT access token (expire 15 menit) + refresh token (expire 7 hari), JWT rotation saat refresh, dan endpoint: POST `/auth/register`, POST `/auth/login`, POST `/auth/refresh`, POST `/auth/logout`. Gunakan bcrypt untuk hash password. Sertakan JwtAuthGuard untuk protect routes."

**Checklist selesai:**
- [ ] Register → verifikasi email wajib sebelum bisa login
- [ ] Login return access_token + refresh_token
- [ ] Expired access_token → 401, bukan 500
- [ ] Refresh token hanya bisa dipakai sekali (rotation)

---

### TASK 2.2 — Email OTP Verification

**Prompt ke AI:**
> "Buatkan OTP verification flow di NestJS. Saat register, kirim email OTP 6 digit. OTP expire 10 menit, maksimal 3 kali salah input akan lock sementara 15 menit, dan OTP lama invalid setelah resend. Gunakan Nodemailer dengan SMTP. Endpoint: POST `/auth/verify-otp`, POST `/auth/resend-otp`."

**Checklist selesai:**
- [ ] OTP terkirim ke email setelah register
- [ ] OTP expired setelah 10 menit
- [ ] Setelah 3x salah → locked 15 menit
- [ ] Akun hanya aktif setelah OTP verified

---

### TASK 2.3 — Tenant Isolation Middleware

**Prompt ke AI:**
> "Buatkan NestJS middleware yang otomatis inject `tenant_id` dari JWT user ke setiap request. Buatkan custom Prisma client wrapper yang otomatis menambahkan `WHERE tenant_id = :tenantId` ke semua query, sehingga developer tidak bisa lupa menambahkan filter tenant. Test dengan unit test yang membuktikan query lintas tenant tidak bisa terjadi."

**Ini adalah task paling kritis untuk security.**

**Checklist selesai:**
- [ ] Setiap Prisma query otomatis ter-scope ke tenant_id user
- [ ] Unit test: user dari tenant A tidak bisa baca data tenant B
- [ ] Test manual: ganti JWT → data yang muncul berubah

---

### TASK 2.4 — Audit Logging

**Prompt ke AI:**
> "Buatkan audit logging service di NestJS yang mencatat setiap aksi penting ke tabel `audit_logs`. Field: `tenant_id`, `user_id`, `action` (enum), `entity_type`, `entity_id`, `metadata` (JSON), `ip_address`, `timestamp`. Buat decorator `@Audit('ACTION_NAME')` yang bisa ditempel di controller method untuk otomatis log. Aksi yang wajib di-log: login, logout, WA connect, WA disconnect, AI mode change, follow-up created/completed, lead status change."

**Checklist selesai:**
- [ ] Semua aksi kritis tercatat di `audit_logs`
- [ ] Log tidak bisa didelete oleh user biasa
- [ ] IP address tercatat dengan benar di balik NGINX proxy

---

## MILESTONE 3 — WhatsApp Connection

> **Tujuan:** User bisa connect nomor WA Business mereka dan sistem bisa terima + kirim pesan.

---

### TASK 3.1 — Fonnte Integration Service

**Prompt ke AI:**
> "Buatkan NestJS service untuk integrasi dengan Fonnte WhatsApp API. Fungsi yang dibutuhkan: (1) connect device dengan token Fonnte, (2) send message ke nomor tertentu, (3) terima webhook incoming message, (4) check connection status. Buatkan WhatsappProviderInterface agar provider bisa diganti di masa depan tanpa ubah business logic."

**Penting:** Provider abstraction layer wajib ada dari awal.

**Checklist selesai:**
- [ ] Bisa send test message ke nomor sendiri via Postman
- [ ] Webhook Fonnte diterima dan masuk ke database
- [ ] `WhatsappProviderInterface` ada dan Fonnte implement interface tersebut

---

### TASK 3.2 — Webhook Handler & Message Processing

**Prompt ke AI:**
> "Buatkan webhook endpoint `POST /webhook/whatsapp` di NestJS untuk menerima pesan masuk dari Fonnte. Flow: (1) validasi webhook signature, (2) normalize message format ke internal format, (3) cari atau buat conversation record, (4) simpan message ke database, (5) push job ke queue `ai-reply` untuk diproses. Gunakan idempotency key untuk prevent duplicate processing jika webhook dikirim dua kali."

**Checklist selesai:**
- [ ] Kirim pesan WA ke nomor test → masuk database dalam 3 detik
- [ ] Webhook yang sama dikirim 2x → hanya diproses 1x (idempotent)
- [ ] Invalid webhook signature → reject 401

---

### TASK 3.3 — WhatsApp Connection Settings UI

**Prompt ke AI:**
> "Buatkan halaman Settings > WhatsApp Connection di Next.js dengan shadcn/ui. Tampilkan: status koneksi (Connected/Disconnected/Reconnecting), nama dan nomor WA yang terconnect, tombol Disconnect, dan form input Fonnte API token untuk connect. Gunakan polling setiap 10 detik untuk update status koneksi secara realtime. Mobile-first design."

**Checklist selesai:**
- [ ] Status koneksi akurat dan update otomatis
- [ ] Bisa connect dan disconnect dari UI
- [ ] Jika disconnect tiba-tiba → status berubah dalam maks 30 detik

---

### TASK 3.4 — Disconnect Detection & Auto-Recovery

**Prompt ke AI:**
> "Buatkan NestJS scheduled job (cron setiap 1 menit) yang check status koneksi WA untuk setiap tenant yang aktif. Jika disconnect terdeteksi: (1) update status session, (2) pause outgoing message queue untuk tenant tersebut, (3) kirim alert notifikasi ke nomor pribadi sales via Fonnte, (4) attempt auto-reconnect setiap 5 menit maksimal 3x. Jika gagal reconnect, kirim alert final dan stop retry."

**Checklist selesai:**
- [ ] Simulasi disconnect → notifikasi ke nomor pribadi dalam 2 menit
- [ ] Auto-reconnect attempt tercatat di log
- [ ] Queue freeze selama disconnect — tidak ada pesan terkirim

---

## MILESTONE 4 — Inbox & Conversation

> **Tujuan:** Sales bisa lihat semua percakapan, balas manual, dan sistem track state conversation dengan benar.

---

### TASK 4.1 — Conversation List API

**Prompt ke AI:**
> "Buatkan NestJS API untuk conversation list: `GET /conversations`. Support: filter by state (OPEN/WAITING/ESCALATED), filter by ai_mode, sort by last_activity_at, pagination cursor-based (bukan offset), dan search by contact name/phone. Response harus include: conversation state, unread count, last message preview, lead heat tier, dan follow-up due status. Semua query otomatis ter-scope ke tenant_id dari JWT."

**Checklist selesai:**
- [ ] 100 conversation load dalam < 500ms
- [ ] Filter dan sort berfungsi
- [ ] Data dari tenant lain tidak muncul

---

### TASK 4.2 — Realtime WebSocket

**Prompt ke AI:**
> "Implementasi WebSocket di NestJS menggunakan `@nestjs/websockets` dengan Socket.io. Events yang dibutuhkan: `conversation:updated` (saat ada pesan baru), `conversation:state_changed`, `lead:heat_changed`, `ai:mode_changed`, `system:alert`. User hanya subscribe ke events dari tenant mereka sendiri. Sertakan reconnect logic di frontend jika WebSocket disconnect."

**Checklist selesai:**
- [ ] Kirim pesan WA → inbox update tanpa refresh halaman
- [ ] Disconnect WebSocket → auto reconnect dalam 5 detik
- [ ] User dari tenant berbeda tidak menerima events satu sama lain

---

### TASK 4.3 — Inbox UI

**Prompt ke AI:**
> "Buatkan halaman Inbox di Next.js dengan shadcn/ui. Layout: sidebar kiri (conversation list) + panel kanan (conversation detail). Features: (1) conversation list dengan badge unread count dan heat tier indicator, (2) message thread dengan bubble chat UI, (3) indicator apakah message dikirim AI atau human, (4) input box untuk balas manual, (5) AI mode toggle (OFF/ASSIST/HYBRID/AUTO) di header conversation, (6) realtime update via WebSocket. Mobile-first."

**Checklist selesai:**
- [ ] Inbox bisa digunakan di mobile (layar 375px)
- [ ] AI mode toggle berubah dan tersimpan
- [ ] Pesan baru muncul realtime tanpa refresh
- [ ] Indikator jelas mana pesan dari AI, mana dari sales

---

### TASK 4.4 — Human Takeover Logic

**Prompt ke AI:**
> "Buatkan NestJS service untuk human takeover logic. Rule: jika sales membalas manual di conversation yang AI mode-nya ACTIVE, maka: (1) set conversation state ke HUMAN_ACTIVE, (2) pause AI untuk conversation ini selama cooldown period (default 15 menit), (3) catat di audit log, (4) setelah cooldown, AI kembali aktif jika mode masih HYBRID atau AUTO. AI tidak boleh kirim pesan selama HUMAN_ACTIVE state. Unit test wajib untuk membuktikan AI tidak double-reply."

**Checklist selesai:**
- [ ] Sales balas manual → AI pause otomatis
- [ ] Setelah 15 menit → AI aktif kembali (jika mode HYBRID/AUTO)
- [ ] Unit test: double-reply scenario → AI tidak kirim

---

## MILESTONE 5 — AI Flow

> **Tujuan:** AI bisa membalas pesan dengan aman, detect hot lead, dan trigger escalation yang tepat.

---

### TASK 5.1 — AI Reply Worker

**Prompt ke AI:**
> "Buatkan BullMQ worker untuk queue `ai-reply` di NestJS. Flow: (1) ambil job dari queue, (2) check apakah conversation dalam state yang membolehkan AI reply (bukan HUMAN_ACTIVE), (3) check quota tenant, (4) call OpenAI GPT-4o-mini dengan system prompt untuk sales otomotif Indonesia, (5) validasi response (tidak ada angka kredit, tidak ada promo yang tidak ada dalam catalog), (6) kirim via Fonnte jika valid, (7) log AI usage, (8) update conversation state. Jika AI tidak yakin (confidence rendah) → escalate, jangan reply."

**Checklist selesai:**
- [ ] AI reply terkirim ke WA dalam < 5 detik setelah pesan masuk
- [ ] AI tidak reply jika conversation dalam state HUMAN_ACTIVE
- [ ] Jika quota habis → job gagal gracefully, tidak crash worker
- [ ] Semua AI reply tercatat di `ai_usage_logs`

---

### TASK 5.2 — AI Safety Layer

**Prompt ke AI:**
> "Buatkan NestJS service `AISafetyService` yang memvalidasi semua AI output sebelum dikirim ke customer. Validasi: (1) tidak ada angka simulasi kredit/DP/cicilan (regex + keyword detection), (2) tidak ada promo yang tidak ada dalam approved catalog, (3) tidak ada klaim garansi atau janji yang tidak terverifikasi. Jika validasi gagal: (a) block message dari terkirim, (b) set conversation ke ESCALATED, (c) kirim alert ke sales via WA pribadi, (d) log ke `escalation_logs`. Test dengan 20 contoh message berbahaya."

**Ini adalah task paling penting untuk trust produk.**

**Checklist selesai:**
- [ ] Test: AI output dengan angka kredit → diblock 100%
- [ ] Test: AI output promo palsu → diblock 100%
- [ ] Escalation alert terkirim ke WA pribadi sales dalam < 30 detik
- [ ] Zero false negative dalam 20 test cases berbahaya

---

### TASK 5.3 — Hot Lead Detection

**Prompt ke AI:**
> "Buatkan NestJS service `HotLeadService` yang menganalisis setiap pesan masuk dari customer untuk mendeteksi high-intent signals. Signals: tanya harga, tanya simulasi kredit, tanya stok, tanya delivery, minta test drive, tanya nego, frekuensi reply tinggi, urgency language. Output: heat_tier (LOW/WARM/HOT/CRITICAL) + heat_reasons (array string yang human-readable, contoh: ['Menanyakan harga', 'Balas cepat']). Update `leads.heat_score` dan `leads.heat_tier` di database. Trigger BullMQ job ke queue `hot-lead` jika tier HOT atau CRITICAL."

**Checklist selesai:**
- [ ] Test dengan 15 skenario percakapan berbeda → klasifikasi akurat
- [ ] heat_reasons selalu human-readable, tidak pernah kosong
- [ ] HOT lead trigger alert dalam < 10 detik

---

### TASK 5.4 — Hot Lead Alert

**Prompt ke AI:**
> "Buatkan BullMQ worker untuk queue `hot-lead`. Saat hot lead terdeteksi: (1) kirim WhatsApp notification ke nomor pribadi sales dengan format: nama lead + heat tier + heat reasons + deep link ke conversation, (2) update dashboard via WebSocket event `lead:heat_changed`, (3) jika tier CRITICAL, juga kirim email alert. Gunakan rate limiting: maksimal 1 alert per lead per 30 menit untuk hindari spam."

**Checklist selesai:**
- [ ] Hot lead detected → notifikasi WA ke sales dalam < 15 detik
- [ ] Format notifikasi jelas dan actionable
- [ ] 1 lead tidak bisa trigger lebih dari 1 alert per 30 menit

---

### TASK 5.5 — AI Assist Mode (Suggestion UI)

**Prompt ke AI:**
> "Tambahkan AI Assist panel di Inbox UI. Saat mode AI ASSIST aktif: tampilkan suggested reply di bawah input box. Tombol actions: 'Kirim' (send as-is), 'Edit' (masuk ke input box untuk diedit), 'Generate Ulang', 'Abaikan'. Suggestion muncul otomatis saat ada pesan baru dari customer. Tambahkan loading skeleton saat AI sedang generate. AI suggestion tidak pernah terkirim otomatis — selalu butuh aksi eksplisit sales."

**Checklist selesai:**
- [ ] Suggestion muncul dalam < 3 detik setelah pesan customer masuk
- [ ] Tombol 'Kirim' mengirim message dan clear suggestion
- [ ] AI tidak pernah auto-send tanpa klik eksplisit

---

## MILESTONE 6 — Dashboard MVP

> **Tujuan:** Sales bisa lihat situasi operasional hari ini dalam hitungan detik setelah buka app.

---

### TASK 6.1 — Dashboard API

**Prompt ke AI:**
> "Buatkan NestJS endpoint `GET /dashboard/summary` yang return: (1) jumlah hot leads hari ini, (2) jumlah conversation pending reply (customer waiting > 30 menit), (3) jumlah follow-up jatuh tempo hari ini, (4) jumlah follow-up overdue, (5) AI operational status (mode dan apakah aktif), (6) WhatsApp connection status. Response harus cepat — target < 200ms. Gunakan Redis cache dengan TTL 30 detik."

**Checklist selesai:**
- [x] Response time < 200ms di production (test dengan k6 atau wrk)
- [x] Data akurat dan sesuai dengan data di database
- [x] Cache invalidated saat ada perubahan relevan

---

### TASK 6.2 — Dashboard UI

**Prompt ke AI:**
> "Buatkan halaman Dashboard di Next.js dengan shadcn/ui. Wajib tampilkan: (1) Widget WhatsApp status (Connected/Disconnected dengan warna merah/hijau), (2) Widget AI status (mode aktif), (3) Widget Hot Leads hari ini (jumlah + tombol lihat semua), (4) Widget Pending Reply (jumlah + lead terlama menunggu), (5) Widget Follow-up Hari Ini (jumlah + yang overdue highlight merah), (6) Alert bar jika ada critical issue. Auto-refresh setiap 30 detik. Mobile-first, bisa dipahami dalam 5 detik."

**Checklist selesai:**
- [ ] Semua 6 widget tampil di layar 375px tanpa scroll horizontal
- [ ] Critical alert muncul prominent di bagian atas
- [ ] Tap widget → navigasi ke halaman terkait

---

### TASK 6.3 — Follow-up Management

**Prompt ke AI:**
> "Buatkan halaman Follow-up di Next.js. Features: (1) list follow-up dengan filter (Hari Ini / Overdue / Semua), (2) setiap item tampilkan: nama lead, alasan follow-up, due date, urgency indicator, (3) action buttons per item: Complete, Snooze (pilihan: 1 jam / Besok / Custom), Open Conversation, (4) Overdue items highlight merah dan ditampilkan paling atas, (5) Empty state yang informatif jika tidak ada follow-up. API: POST `/follow-ups`, PATCH `/follow-ups/:id/complete`, PATCH `/follow-ups/:id/snooze`."

**Checklist selesai:**
- [ ] Complete follow-up → hilang dari list dalam 1 detik
- [ ] Snooze 'Besok' → muncul kembali besok di waktu yang sama
- [ ] Overdue items selalu di atas list

---

## MILESTONE 7 — Stabilisasi & QA

> **Tujuan:** Semua critical path ter-test, tidak ada P0, siap untuk closed pilot.

---

### TASK 7.1 — Critical Flow Testing

**Prompt ke AI:**
> "Buatkan test suite dengan Jest + Supertest untuk NestJS yang cover critical flows: (1) Register → OTP → Login → Connect WA → Terima pesan → AI reply, (2) Hot lead detection end-to-end, (3) AI Safety: kirim 20 prompt berbahaya → semua harus diblock, (4) Human takeover → AI pause → cooldown → AI aktif kembali, (5) Quota habis → grace buffer aktif → hanya hot lead yang diproses. Gunakan test database terpisah."

**Checklist selesai:**
- [ ] Semua 5 critical flows punya automated test
- [ ] AI Safety test: 20/20 berbahaya diblock
- [ ] Test bisa dijalankan dengan satu command: `npm test`

---

### TASK 7.2 — Cross-Tenant Isolation Test

**Prompt ke AI:**
> "Buatkan automated test yang membuktikan tenant isolation berfungsi. Test cases: (1) User dari tenant A tidak bisa baca conversations tenant B via API, (2) User dari tenant A tidak bisa kirim pesan ke WA session tenant B, (3) Hot lead dari tenant A tidak trigger alert ke tenant B, (4) Quota dari tenant A tidak berpengaruh ke tenant B. Test harus fail jika isolation rusak."

**Checklist selesai:**
- [ ] Semua 4 isolation test pass
- [ ] Test dijalankan di CI setiap kali ada code push

---

### TASK 7.3 — Error Handling & Graceful Degradation

**Prompt ke AI:**
> "Audit seluruh codebase untuk error handling. Pastikan: (1) Fonnte API down → AI pause, queue freeze, alert ke sales, sistem tidak crash, (2) OpenAI API down → AI pause, conversation tetap bisa digunakan manual, (3) Redis down → queue berhenti tapi API masih jalan, (4) Database slow query → timeout dengan error yang jelas bukan hang selamanya, (5) Semua unhandled promise rejection ter-catch dan ter-log."

**Checklist selesai:**
- [ ] Simulasi Fonnte down → sistem tidak crash, sales dapat alert
- [ ] Simulasi OpenAI down → inbox masih bisa dipakai manual
- [ ] Tidak ada unhandled promise rejection di log

---

### TASK 7.4 — Basic Observability

**Prompt ke AI:**
> "Setup basic observability untuk production: (1) Structured JSON logging dengan Pino di NestJS (log level: error/warn/info/debug), (2) Log setiap incoming request dengan method, path, status code, dan response time, (3) Log setiap queue job dengan status (started/completed/failed) dan duration, (4) Alert via WA ke nomor founder jika: error rate > 5% dalam 5 menit, atau queue stuck > 10 menit, atau AI failure rate > 10%."

**Checklist selesai:**
- [ ] Semua log dalam format JSON (mudah di-parse)
- [ ] Bisa cari log berdasarkan `tenant_id` atau `conversation_id`
- [ ] Alert WA ke founder berfungsi (test manual)

---

## Dependency Map Antar Task

```
1.1 (Project Setup)
  └── 1.2 (Database Schema)
        └── 1.3 (NestJS Base)
              └── 1.4 (Queue Infrastructure)
                    └── 2.1 (Auth System)
                          └── 2.2 (OTP)
                                └── 2.3 (Tenant Isolation) ← CRITICAL
                                      └── 2.4 (Audit Log)
                                            └── 3.1 (Fonnte Integration)
                                                  └── 3.2 (Webhook Handler)
                                                        ├── 3.3 (WA Settings UI)
                                                        ├── 3.4 (Disconnect Detection)
                                                        └── 4.1 (Conversation API)
                                                              └── 4.2 (WebSocket)
                                                                    └── 4.3 (Inbox UI)
                                                                          └── 4.4 (Takeover Logic)
                                                                                └── 5.1 (AI Worker)
                                                                                      ├── 5.2 (Safety Layer) ← CRITICAL
                                                                                      ├── 5.3 (Hot Lead Detection)
                                                                                      │     └── 5.4 (Hot Lead Alert)
                                                                                      └── 5.5 (AI Assist UI)
                                                                                            └── 6.1 (Dashboard API)
                                                                                                  └── 6.2 (Dashboard UI)
                                                                                                        └── 6.3 (Follow-up)
                                                                                                              └── 7.x (QA)
```

---

## Tips Penggunaan AI Coding Tools

### DO ✅
- Berikan konteks lengkap di setiap prompt: stack, nama table, behavior yang diharapkan
- Minta AI untuk buatkan unit test sekaligus dengan implementasinya
- Review setiap output AI sebelum merge — jangan blind copy-paste
- Tanyakan "apa edge case yang mungkin terlewat?" setelah AI selesai
- Gunakan satu task per session agar context tidak hilang

### DON'T ❌
- Jangan minta AI bangun dua milestone sekaligus dalam satu prompt
- Jangan skip task 2.3 (Tenant Isolation) — ini fondasi keamanan
- Jangan skip task 5.2 (AI Safety Layer) — ini fondasi trust produk
- Jangan deploy ke production sebelum task 7.1 dan 7.2 selesai

---

## Estimasi Waktu

| Milestone | Estimasi (Solo + AI Tools) |
|---|---|
| M1: Fondasi | 3–4 hari |
| M2: Auth & User | 3–4 hari |
| M3: WhatsApp Connection | 4–5 hari |
| M4: Inbox & Conversation | 4–5 hari |
| M5: AI Flow | 5–6 hari |
| M6: Dashboard MVP | 3–4 hari |
| M7: Stabilisasi & QA | 4–5 hari |
| **Total** | **~6–7 minggu** |

> Estimasi asumsi: kamu familiar dengan NestJS dan Next.js, dan menggunakan AI coding tools secara aktif. Tanpa AI tools, estimasi 2–3x lebih lama.

---

## Definition of Done — Phase 1

Phase 1 dinyatakan selesai dan siap Closed Pilot jika:

- [ ] Semua task di Milestone 1–7 selesai
- [ ] Semua critical flow automated test pass
- [ ] Cross-tenant isolation test pass
- [ ] AI Safety test: 20/20 berbahaya diblock
- [ ] Manual end-to-end test berhasil: signup → connect WA → terima pesan → AI reply → hot lead detected → follow-up created
- [ ] Tidak ada P0 unresolved
- [ ] Observability aktif dan alert berfungsi
- [ ] Rollback plan sudah didokumentasikan

---

*Dokumen ini adalah breakdown implementasi Phase 1 dari CLOSINGAN PRD v1.0*
*Author: Ricky Darmawan Lambogo*

# CLOSINGAN — Phase 2 Development Plan
## Observability · Quota Governance · Billing · Smart Outreach · Hardening

| | |
|---|---|
| **Owner** | Ricky Darmawan Lambogo |
| **Phase** | 2 — Production Hardening |
| **Prerequisite** | Phase 1 selesai + Closed Pilot aktif |
| **Target** | Soft Launch Ready |

---

## Konteks Phase 2

Phase 1 menghasilkan sistem yang **bisa berjalan**. Phase 2 menghasilkan sistem yang **layak dijual** — dengan billing nyata, quota governance, proteksi abuse, dan infrastruktur yang tahan tekanan user sungguhan.

Urutan milestone di Phase 2 mengikuti prioritas risiko bisnis:
1. **Billing dulu** — tidak ada bisnis tanpa pembayaran
2. **Quota Governance** — proteksi cost AI
3. **Graceful Degradation** — sistem tetap hidup saat beban tinggi
4. **Smart Outreach** — fitur diferensiasi untuk retention
5. **Anti-Abuse** — proteksi sebelum public launch
6. **Hardening & Load Test** — validasi akhir sebelum soft launch

---

## Gambaran Besar Phase 2

```
MILESTONE 8:  Billing & Subscription        (Minggu 1-2)
MILESTONE 9:  Quota & Token Governance      (Minggu 2-3)
MILESTONE 10: Graceful Degradation          (Minggu 3-4)
MILESTONE 11: Retry Protection & Dead Letter (Minggu 4)
MILESTONE 12: Smart Outreach / Campaign     (Minggu 4-6)
MILESTONE 13: Anti-Abuse System             (Minggu 6)
MILESTONE 14: Load Test & Final Hardening   (Minggu 7)
```

---

## MILESTONE 8 — Billing & Subscription

> **Tujuan:** User bisa bayar, sistem tahu plan mereka, dan semua akses ter-gate dengan benar.

---

### TASK 8.1 — Integrasi Payment Gateway

**Prompt ke AI:**
> "Integrasikan Midtrans (atau Xendit) ke NestJS untuk handle subscription payment. Buatkan: (1) `BillingService` dengan method `createInvoice`, `processPayment`, `handleWebhook`, (2) webhook endpoint `POST /webhook/payment` yang validasi signature dari payment gateway, (3) update subscription status setelah payment confirmed, (4) kirim email receipt setelah pembayaran berhasil. Gunakan payment gateway abstraction interface agar provider bisa diganti."

**Checklist selesai:**
- [ ] Test payment flow sandbox end-to-end: invoice → bayar → subscription aktif
- [ ] Webhook signature validation berfungsi (reject invalid webhook)
- [ ] Email receipt terkirim setelah payment confirmed
- [ ] Double payment untuk invoice yang sama tidak diproses (idempotent)

---

### TASK 8.2 — Subscription State Machine

**Prompt ke AI:**
> "Buatkan subscription state machine di NestJS. States: `TRIAL → ACTIVE → PAST_DUE → SUSPENDED → CANCELLED`. Transitions: (1) Trial expire → PAST_DUE jika tidak bayar, (2) Payment success → ACTIVE, (3) Payment gagal → PAST_DUE setelah grace period 3 hari, (4) PAST_DUE > 7 hari → SUSPENDED (akses dibatasi, data tetap ada), (5) User cancel → CANCELLED (akses sampai akhir period). Setiap transition harus di-log ke `audit_logs` dan trigger notifikasi yang relevan."

**Checklist selesai:**
- [ ] Trial expire → user dapat notifikasi 3 hari sebelum dan saat expire
- [ ] SUSPENDED state → user tidak bisa pakai AI, tapi bisa lihat data lama
- [ ] CANCELLED → akses tetap aktif sampai akhir billing period

---

### TASK 8.3 — Plan Entitlement Guard

**Prompt ke AI:**
> "Buatkan NestJS guard `EntitlementGuard` yang check apakah user berhak menggunakan fitur tertentu berdasarkan plan mereka. Buat `PLAN_FEATURES` config yang define fitur per plan (STARTER/PRO/ELITE). Contoh: STARTER tidak bisa Smart Outreach blast > 100 kontak, ELITE bisa multi-WA number. Guard harus return 403 dengan pesan yang jelas dan actionable jika tidak berhak: contoh 'Fitur ini tersedia di plan Pro. Upgrade sekarang.' Tambahkan decorator `@RequiresPlan('PRO')` untuk mudah dipakai di controller."

**Checklist selesai:**
- [ ] User STARTER coba akses fitur PRO → 403 dengan pesan upgrade
- [ ] Config plan features mudah diubah tanpa ubah business logic
- [ ] Entitlement check tidak menambah latency > 5ms

---

### TASK 8.4 — Billing UI (Settings > Billing)

**Prompt ke AI:**
> "Buatkan halaman Settings > Billing di Next.js dengan shadcn/ui. Tampilkan: (1) Plan aktif saat ini dengan badge (TRIAL/STARTER/PRO/ELITE), (2) Tanggal renewal atau trial expiry, (3) Usage summary bulan ini (AI Credit terpakai vs total), (4) Tombol Upgrade Plan (buka modal dengan perbandingan plan), (5) History invoice yang bisa didownload, (6) Tombol beli AI Credit add-on. Jika subscription PAST_DUE: tampilkan banner merah dengan tombol bayar sekarang. Mobile-first."

**Checklist selesai:**
- [ ] Usage bar akurat sesuai data `token_quotas`
- [ ] PAST_DUE banner muncul prominent dan tidak bisa dismiss
- [ ] Invoice download berfungsi (PDF atau link ke payment gateway)

---

### TASK 8.5 — Trial System

**Prompt ke AI:**
> "Implementasi trial system: (1) Saat user baru register dan connect WA → otomatis aktifkan trial 7 hari, (2) Trial hanya aktif setelah WA berhasil connected + OTP verified (bukan saat register), (3) Simpan WA number hash di database untuk enforce '1 WA number = 1 lifetime trial', (4) Kirim reminder email di hari ke-5 dan ke-7 trial, (5) Saat trial expire → downgrade ke state PAST_DUE, AI dinonaktifkan, dashboard tetap accessible. Test anti-abuse: nomor WA yang sama tidak bisa dapat trial kedua kali."

**Checklist selesai:**
- [ ] Trial aktif tepat setelah WA connect, bukan setelah register
- [ ] Nomor WA yang sama coba trial lagi → ditolak dengan pesan jelas
- [ ] Reminder email terkirim di hari ke-5 dan ke-7

---

## MILESTONE 9 — Quota & Token Governance

> **Tujuan:** AI cost terkontrol, user paham usage mereka, dan sistem tidak bisa dieksploitasi.

---

### TASK 9.1 — Token Quota Service

**Prompt ke AI:**
> "Buatkan `TokenQuotaService` di NestJS yang: (1) track AI usage realtime per tenant menggunakan Redis counter (cepat) + sync ke PostgreSQL setiap 5 menit (persistent), (2) check quota sebelum setiap AI operation, (3) expose method `getUsagePercentage(tenantId)`, `hasQuota(tenantId)`, `consumeQuota(tenantId, amount)`, (4) reset quota setiap awal bulan billing cycle (bukan awal bulan kalender). Gunakan Redis atomic increment untuk prevent race condition saat concurrent AI calls."

**Checklist selesai:**
- [ ] Concurrent 10 AI requests → quota berkurang tepat 10x (tidak lebih, tidak kurang)
- [ ] Redis counter dan PostgreSQL selalu konsisten setelah sync
- [ ] Quota reset tepat di hari anniversary billing, bukan tanggal 1

---

### TASK 9.2 — Warning Threshold System

**Prompt ke AI:**
> "Implementasi quota warning system. Ketika usage mencapai threshold tertentu, trigger aksi: (1) 70% → kirim email + in-app notification 'AI usage kamu sudah 70%, pertimbangkan beli add-on', (2) 85% → email + in-app warning lebih urgent + soft upsell banner di dashboard, (3) 95% → email critical + in-app banner merah + pause non-essential queues (summary, analytics, blast besar). Setiap threshold hanya trigger satu kali per billing cycle, tidak spam setiap request."

**Checklist selesai:**
- [ ] 70% → notifikasi terkirim (test dengan mock quota)
- [ ] 95% → summary queue di-pause (test dengan Bull Board)
- [ ] Threshold tidak trigger lebih dari 1x per billing cycle

---

### TASK 9.3 — Grace Buffer System

**Prompt ke AI:**
> "Implementasi 5% grace buffer setelah quota utama habis. Selama grace buffer aktif: (1) hanya proses job dari queue: `hot-lead`, `ai-reply` (untuk hot leads), `escalation`, (2) pause semua queue lain: `summary`, `analytics`, `blast`, (3) tampilkan banner 'AI Credit hampir habis' di semua halaman, (4) kirim notifikasi ke sales dengan pesan contextual dan link beli add-on. Grace buffer adalah emergency mode, bukan perpanjangan quota normal."

**Contoh pesan upsell yang benar:**
> *"AI Credit kamu hampir habis 🔴 AI masih aktif untuk lead penting. Tambah sekarang agar tidak ada yang terlewat."*

**Checklist selesai:**
- [ ] Saat grace buffer: cek blast queue di Bull Board → status paused
- [ ] Hot lead masuk saat grace buffer → tetap diproses
- [ ] Banner grace buffer muncul di semua halaman (tidak hanya billing)

---

### TASK 9.4 — AI Credit Add-on

**Prompt ke AI:**
> "Buatkan flow pembelian AI Credit add-on. User memilih nominal add-on → payment → credit langsung ditambahkan ke quota bulan ini (bukan bulan depan). Add-on tidak carry-over ke bulan berikutnya. Tambahkan endpoint `POST /billing/topup` dan UI di halaman Billing. Setelah topup berhasil: (1) update Redis counter dan PostgreSQL, (2) resume queue yang di-pause karena quota, (3) kirim konfirmasi via email dan WA."

**Checklist selesai:**
- [ ] Bayar add-on → credit muncul dalam < 30 detik
- [ ] Queue yang sebelumnya paused → resume otomatis setelah topup
- [ ] Add-on tidak bisa digunakan di bulan berikutnya

---

### TASK 9.5 — Soft Upsell Engine

**Prompt ke AI:**
> "Buatkan `UpsellService` yang generate contextual upsell message berdasarkan situasi user. Rules: (1) Quota 85% + traffic lead tinggi → 'Traffic lead bulan ini naik! Tambah AI Credit agar respons tetap optimal.', (2) User pakai AI Assist terus tapi plan Starter → 'Kamu aktif banget! Upgrade ke Pro untuk fitur Auto Reply.', (3) Upsell hanya muncul maksimal 1x per 48 jam per user, (4) User yang baru upgrade tidak dapat upsell 30 hari. Simpan upsell state di Redis. Tampilkan sebagai dismissible banner di dashboard, BUKAN popup yang blockingUI."

**Checklist selesai:**
- [ ] Upsell tidak muncul lebih dari 1x per 48 jam
- [ ] User yang baru upgrade tidak dapat upsell 30 hari
- [ ] Banner bisa di-dismiss dan tidak muncul lagi hari itu

---

## MILESTONE 10 — Graceful Degradation

> **Tujuan:** Sistem tetap beroperasi (dengan keterbatasan) saat beban tinggi atau komponen bermasalah.

---

### TASK 10.1 — Policy-Driven Queue Governor

**Prompt ke AI:**
> "Buatkan `QueueGovernorService` di NestJS yang berjalan sebagai cron job setiap 1 menit. Governor membaca kondisi sistem dan apply policy: (1) quota > 85% → throttle summary queue (rate limit 5 job/menit), (2) quota > 95% → pause analytics dan blast queue, (3) grace buffer aktif → pause semua kecuali hot-lead, ai-reply, escalation, (4) provider latency > 3 detik → throttle ai-reply queue, (5) semua kondisi normal → resume queue yang di-pause. Log setiap policy change ke audit log."

**Checklist selesai:**
- [ ] Simulate quota 95% → blast queue paused otomatis dalam 1 menit
- [ ] Simulate kondisi normal kembali → blast queue resume otomatis
- [ ] Policy change tercatat di log dengan alasan yang jelas

---

### TASK 10.2 — Queue Isolation Enforcement

**Prompt ke AI:**
> "Audit dan enforce queue isolation di BullMQ. Pastikan: (1) blast queue punya dedicated worker pool terpisah (max 2 concurrent), tidak bisa 'mencuri' worker dari ai-reply, (2) ai-reply dan hot-lead punya dedicated high-priority worker (min 5 concurrent), (3) tambahkan queue metrics: jobs waiting, jobs active, jobs failed per queue, expose di endpoint `GET /admin/queue-health`, (4) alert ke founder jika any queue memiliki > 100 jobs waiting selama > 5 menit (queue stuck)."

**Checklist selesai:**
- [ ] Flood blast queue dengan 500 job → ai-reply latency tidak terpengaruh
- [ ] `/admin/queue-health` menampilkan metrics semua queue
- [ ] Queue stuck > 5 menit → alert WA ke founder

---

### TASK 10.3 — Provider Degradation Handling

**Prompt ke AI:**
> "Implementasi degradation saat AI provider (OpenAI) atau WA provider (Fonnte) bermasalah. AI Provider down: (1) stop semua AI auto-reply, (2) switch semua conversation ke mode manual, (3) alert dashboard + WA ke semua user aktif, (4) retry dengan exponential backoff (1m, 5m, 15m, 30m), (5) resume otomatis saat provider recover. WA Provider down: (1) freeze outgoing message queue, (2) alert semua user, (3) incoming messages tetap disimpan ke database, (4) saat recover, send queued messages dengan delay agar tidak spam."

**Checklist selesai:**
- [ ] Simulasi OpenAI down (mock 503) → semua user dapat notifikasi, AI stop
- [ ] Simulasi Fonnte down → queue freeze, tidak ada pesan hilang
- [ ] Provider recover → sistem kembali normal tanpa restart manual

---

## MILESTONE 11 — Retry Protection & Dead Letter

> **Tujuan:** Job yang gagal tidak hilang dan tidak menyebabkan loop infinite yang membakar cost.

---

### TASK 11.1 — Retry Policy per Queue

**Prompt ke AI:**
> "Konfigurasi retry policy BullMQ per queue dengan exponential backoff. Policy: (1) `ai-reply`: 3 attempts, backoff: 30s → 2m → 10m, (2) `hot-lead`: 5 attempts, backoff: 10s → 30s → 2m → 5m → 15m, (3) `escalation`: 5 attempts, backoff: 10s → 1m → 5m → 15m → 30m, (4) `blast`: 2 attempts, backoff: 5m → 30m, (5) setelah max attempts → pindahkan ke Dead Letter Queue. Log setiap retry attempt dengan reason."

**Checklist selesai:**
- [ ] Job gagal → retry dengan delay yang benar (cek timestamp di Bull Board)
- [ ] Setelah max attempts → job muncul di Dead Letter Queue, tidak hilang
- [ ] Retry loop tidak terjadi untuk error yang deterministic (misalnya: quota habis)

---

### TASK 11.2 — Dead Letter Queue Handler

**Prompt ke AI:**
> "Buatkan Dead Letter Queue (DLQ) handler di NestJS. Setiap job yang masuk DLQ: (1) catat ke database tabel `failed_jobs` dengan: job data, error message, queue name, attempt count, failed_at, (2) kirim alert ke founder dengan summary: 'Ada N job gagal di queue X', (3) expose endpoint `GET /admin/failed-jobs` dan `POST /admin/failed-jobs/:id/retry` untuk manual retry via admin panel, (4) auto-alert jika DLQ accumulate > 10 job dalam 1 jam."

**Checklist selesai:**
- [ ] Job masuk DLQ → tercatat di database dan founder dapat alert
- [ ] Manual retry dari admin panel berfungsi
- [ ] DLQ tidak tumbuh tanpa batas (ada alert sebelum jadi masalah)

---

## MILESTONE 12 — Smart Outreach / Campaign

> **Tujuan:** Sales bisa proaktif re-engage lead dengan outreach yang governed, bukan spam.

---

### TASK 12.1 — Campaign Data Model & API

**Prompt ke AI:**
> "Buatkan Campaign module di NestJS. Entity Campaign punya: `campaign_id`, `tenant_id`, `name`, `goal`, `status` (DRAFT/PENDING_REVIEW/APPROVED/RUNNING/PAUSED/COMPLETED/FAILED/CANCELLED), `message_template`, `recipient_source`, `scheduled_at`, `created_by`. API endpoints: `POST /campaigns` (create draft), `GET /campaigns` (list), `GET /campaigns/:id` (detail), `PATCH /campaigns/:id` (update draft), `POST /campaigns/:id/approve` (seller must explicitly approve sebelum run), `POST /campaigns/:id/cancel`. Status transition harus strict — tidak bisa skip step."

**Checklist selesai:**
- [ ] Campaign tidak bisa langsung RUNNING dari DRAFT tanpa approve
- [ ] Cancel saat RUNNING → stop gracefully, tidak potong message di tengah
- [ ] Semua status change tercatat di audit log

---

### TASK 12.2 — Recipient Management & Validation

**Prompt ke AI:**
> "Buatkan recipient management untuk campaign. Supported sources: existing contacts, hot leads, follow-up contacts, manual paste nomor, CSV import. Validasi wajib sebelum campaign bisa di-approve: (1) semua nomor harus normalize ke format E.164, (2) duplicate nomor dalam satu campaign di-dedupe otomatis, (3) nomor yang ada di suppression list di-exclude, (4) tampilkan preview: 'Campaign ini akan dikirim ke X kontak. Y nomor invalid di-skip. Z nomor di-exclude karena suppression.' Seller harus konfirmasi preview sebelum approve."

**Checklist selesai:**
- [ ] Upload CSV 500 nomor → validasi selesai dalam < 10 detik
- [ ] Nomor duplikat dalam CSV → hanya kirim 1x
- [ ] Suppression list berfungsi (test dengan nomor yang di-blacklist)

---

### TASK 12.3 — Outreach Pacing & Anti-Spam

**Prompt ke AI:**
> "Implementasi pacing system untuk campaign blast. Rules: (1) Default rate: max 20 pesan per menit per tenant (configurable per plan), (2) Jeda minimum 3 detik antar pesan ke nomor yang sama dalam 24 jam, (3) Campaign tidak boleh jalan di luar business hours (default 08:00–21:00 WIB) kecuali di-override oleh seller, (4) Jika Fonnte return rate-limit error → auto-pause campaign, wait 5 menit, resume, (5) Track delivery status setiap pesan: QUEUED/SENT/DELIVERED/FAILED."

**Checklist selesai:**
- [ ] Blast 100 pesan → periksa timestamp di database, tidak ada yang < 3 detik jarak
- [ ] Campaign dijadwal jam 23:00 → tidak jalan, notif seller
- [ ] Fonnte rate limit error → campaign pause otomatis, bukan crash

---

### TASK 12.4 — Campaign UI

**Prompt ke AI:**
> "Buatkan halaman Campaign di Next.js dengan shadcn/ui. Flow pembuatan campaign: Step 1: Nama + Goal campaign → Step 2: Tulis message template (dengan variable {{nama_lead}}) → Step 3: Pilih sumber kontak + preview jumlah → Step 4: Jadwal pengiriman → Step 5: Review dan Approve. Halaman list campaign: tampilkan status, progress bar (X/Y terkirim), dan tombol pause/resume/cancel. Detail campaign: log pengiriman per kontak dengan status."

**Checklist selesai:**
- [ ] Wizard 5 step berfungsi di mobile
- [ ] Preview kontak akurat sebelum approve
- [ ] Progress bar update realtime saat campaign running

---

### TASK 12.5 — Suppression List Management

**Prompt ke AI:**
> "Buatkan suppression list system. Nomor masuk suppression list jika: (1) customer balas 'STOP' atau 'BERHENTI' → otomatis suppress, (2) seller manually block nomor dari inbox, (3) pesan gagal terkirim 3x berturut-turut ke nomor yang sama. Suppression list: (1) apply global per tenant (bukan per campaign), (2) bisa di-export sebagai CSV, (3) seller bisa manually remove nomor dari list jika ada alasan valid, (4) removal dicatat di audit log."

**Checklist selesai:**
- [ ] Customer reply 'STOP' → nomor masuk suppression dalam < 1 menit
- [ ] Campaign berikutnya otomatis exclude nomor di suppression
- [ ] Export CSV suppression list berfungsi

---

## MILESTONE 13 — Anti-Abuse System

> **Tujuan:** Proteksi terhadap multi-account abuse, trial gaming, dan penggunaan yang merusak sistem.

---

### TASK 13.1 — Device Fingerprinting (Lightweight)

**Prompt ke AI:**
> "Implementasi lightweight device fingerprinting untuk deteksi multi-account abuse saat registrasi. Kumpulkan: browser user-agent, screen resolution, timezone, language, dan IP address. Hash menjadi fingerprint ID. Rules: (1) 3+ akun dari fingerprint yang sama dalam 24 jam → flag untuk review, (2) 3+ akun dari IP yang sama dalam 24 jam → soft block + CAPTCHA, (3) jangan block user legitimate yang pakai shared office network → hanya flag, bukan auto-block. Simpan fingerprint hash, bukan data raw (privacy)."

**Checklist selesai:**
- [ ] Register 3x dari browser yang sama → ke-3 kena CAPTCHA
- [ ] Data yang disimpan hanya hash, tidak ada PII raw
- [ ] False positive rate rendah (test dengan user yang pakai kantor bersama)

---

### TASK 13.2 — Disposable Email Blocking

**Prompt ke AI:**
> "Buatkan filter untuk block registrasi dengan email disposable (mailinator, guerrillamail, 10minutemail, dll). Gunakan daftar domain disposable yang ter-update (library `disposable-email-domains` dari npm). Jika email disposable terdeteksi saat register: return error 'Gunakan email bisnis atau email personal yang valid.' Update daftar domain secara berkala (weekly cron job yang pull dari GitHub repo yang aktif di-maintain)."

**Checklist selesai:**
- [ ] Register dengan mailinator.com → ditolak dengan pesan jelas
- [ ] Register dengan Gmail/Yahoo → berhasil
- [ ] Daftar domain update mingguan (test dengan domain disposable baru)

---

### TASK 13.3 — Fair Usage Monitoring

**Prompt ke AI:**
> "Buatkan monitoring system untuk detect usage anomali per tenant. Flag jika: (1) AI call rate > 10x rata-rata plan dalam 1 jam, (2) Campaign blast ke nomor yang sama > 3x dalam 7 hari, (3) Account login dari > 5 lokasi berbeda (berdasarkan IP geolocation) dalam 1 hari, (4) API call rate > 1000/jam (potential scraping). Flagged accounts masuk review queue untuk founder, bukan auto-banned. Kirim alert ke founder dengan detail anomali."

**Checklist selesai:**
- [ ] Simulasi abuse (100 AI calls dalam 5 menit) → founder dapat alert
- [ ] Flagged account tetap bisa beroperasi sampai founder review (tidak auto-ban)
- [ ] Review queue accessible di admin panel

---

## MILESTONE 14 — Load Test & Final Hardening

> **Tujuan:** Sistem terbukti bisa handle beban user sungguhan sebelum soft launch.

---

### TASK 14.1 — Load Testing

**Prompt ke AI:**
> "Buatkan load test scenario menggunakan k6 untuk test endpoint kritis CLOSINGAN. Scenarios: (1) 100 concurrent users buka inbox secara bersamaan → target: p95 latency < 500ms, (2) 50 concurrent webhook incoming (simulasi 50 lead kirim pesan bersamaan) → target: semua processed dalam < 5 detik, (3) Campaign blast 1000 pesan → target: selesai dalam < 60 menit tanpa crash, (4) 200 concurrent dashboard load → target: p95 < 300ms. Report harus include: avg/p95/p99 latency, error rate, throughput."

**Checklist selesai:**
- [ ] Semua 4 scenario load test pass sesuai target
- [ ] Error rate < 0.1% selama load test
- [ ] Tidak ada memory leak (monitor memory selama 30 menit load test)

---

### TASK 14.2 — Security Audit

**Prompt ke AI:**
> "Lakukan security audit pada codebase CLOSINGAN. Check: (1) semua endpoint yang butuh auth sudah pakai JwtAuthGuard, (2) semua input user di-validate dengan class-validator (tidak ada raw string yang masuk query), (3) tidak ada sensitive data (API key, password) yang masuk ke log, (4) webhook endpoints validasi signature sebelum proses, (5) rate limiting aktif di semua public endpoints, (6) CORS dikonfigurasi dengan whitelist domain, bukan wildcard. Generate laporan temuan dengan severity: CRITICAL/HIGH/MEDIUM/LOW."

**Checklist selesai:**
- [ ] Tidak ada temuan CRITICAL atau HIGH yang unresolved
- [ ] Semua endpoint yang butuh auth sudah protected (test dengan expired JWT)
- [ ] Tidak ada API key yang muncul di application log

---

### TASK 14.3 — Database Performance

**Prompt ke AI:**
> "Audit dan optimize database queries untuk production. Tasks: (1) tambahkan index yang tepat untuk query yang paling sering: conversations by tenant_id + state, messages by conversation_id, leads by tenant_id + heat_tier, follow_ups by tenant_id + status + due_at, (2) identifikasi N+1 query problem menggunakan query logging, (3) tambahkan database connection pool config yang tepat (min: 5, max: 20), (4) test dengan EXPLAIN ANALYZE untuk query yang sering: inbox load, dashboard summary, hot lead list."

**Checklist selesai:**
- [ ] Inbox load 100 conversations < 100ms (test dengan EXPLAIN ANALYZE)
- [ ] Dashboard summary < 200ms
- [ ] Tidak ada N+1 query di critical paths

---

### TASK 14.4 — Backup & Recovery Test

**Prompt ke AI:**
> "Setup dan test backup strategy untuk production. (1) Konfigurasi PostgreSQL automated daily backup dengan pg_dump, enkripsi dengan AES-256, upload ke cloud storage (S3 atau GCS), retention 30 hari, (2) Setup point-in-time recovery (PITR) menggunakan WAL archiving, (3) Dokumentasikan recovery runbook: langkah restore dari backup jika disaster terjadi, (4) Test actual restore: ambil backup kemarin, restore ke database test, verifikasi data integrity. Waktu restore harus < 30 menit."

**Checklist selesai:**
- [ ] Backup berjalan setiap hari (cek cloud storage)
- [ ] Test restore berhasil dan data integrity terjaga
- [ ] Recovery runbook didokumentasikan dan bisa diikuti tanpa pengetahuan khusus

---

### TASK 14.5 — Pre-Launch Checklist Execution

**Prompt ke AI:**
> "Buatkan automated pre-launch checklist script yang verify semua sistem siap. Script harus check: (1) semua environment variables production sudah di-set, (2) database migrations sudah applied, (3) semua queue workers running, (4) health check endpoint return 200, (5) WA webhook endpoint accessible dari internet, (6) payment gateway webhook accessible, (7) email service bisa kirim (kirim test email), (8) monitoring dan alerting aktif. Output: PASS/FAIL per item dengan detail error jika FAIL."

**Checklist selesai:**
- [ ] Script bisa dijalankan dengan satu command: `npm run preflight`
- [ ] Semua 8 check PASS di production environment
- [ ] Script jadi bagian dari deployment process

---

## Dependency Map Phase 2

```
[Phase 1 Complete]
       │
       ▼
M8: Billing ─────────────────────────────────┐
  8.1 Payment Gateway                        │
  8.2 Subscription State Machine             │
  8.3 Plan Entitlement Guard ◄───────────────┼──── (blocks semua fitur per-plan)
  8.4 Billing UI                             │
  8.5 Trial System                           │
       │                                     │
       ▼                                     │
M9: Quota Governance                         │
  9.1 Token Quota Service ◄──────────────────┘
  9.2 Warning Thresholds
  9.3 Grace Buffer
  9.4 AI Credit Add-on
  9.5 Soft Upsell Engine
       │
       ▼
M10: Graceful Degradation ◄──── (butuh quota service dari M9)
  10.1 Queue Governor
  10.2 Queue Isolation
  10.3 Provider Degradation
       │
       ▼
M11: Retry & DLQ ◄──── (butuh queue setup dari M10)
       │
       ├──────────────────────┐
       ▼                      ▼
M12: Smart Outreach      M13: Anti-Abuse
  12.1 Campaign Model       13.1 Fingerprinting
  12.2 Recipient Mgmt       13.2 Email Block
  12.3 Pacing & Anti-Spam   13.3 Fair Usage
  12.4 Campaign UI
  12.5 Suppression List
       │                      │
       └──────────┬───────────┘
                  ▼
         M14: Load Test & Hardening
           14.1 Load Testing
           14.2 Security Audit
           14.3 DB Performance
           14.4 Backup & Recovery
           14.5 Pre-Launch Checklist
```

---

## Tips Prompting Phase 2

Phase 2 lebih kompleks dari Phase 1 karena banyak system yang saling berinteraksi. Gunakan strategi ini:

**Berikan context Phase 1 saat prompt:**
> *"Saya sudah punya NestJS app dengan: JWT auth, multi-tenant isolation, BullMQ queue, Fonnte WA integration, dan Prisma PostgreSQL. Sekarang saya ingin tambahkan [fitur Phase 2 ini]..."*

**Untuk task yang involve state machine:**
> *"Buatkan dengan explicit state transition validation. Setiap transition yang invalid harus throw error dengan pesan yang jelas, bukan silent fail."*

**Untuk task billing dan payment:**
> *"Prioritaskan idempotency di semua payment operations. Setiap payment action harus aman untuk dijalankan dua kali tanpa efek ganda."*

---

## Estimasi Waktu Phase 2

| Milestone | Estimasi (Solo + AI Tools) |
|---|---|
| M8: Billing & Subscription | 5–7 hari |
| M9: Quota & Token Governance | 3–4 hari |
| M10: Graceful Degradation | 3–4 hari |
| M11: Retry & Dead Letter | 2 hari |
| M12: Smart Outreach | 6–8 hari |
| M13: Anti-Abuse | 3 hari |
| M14: Load Test & Hardening | 4–5 hari |
| **Total** | **~7–8 minggu** |

---

## Definition of Done — Phase 2

Phase 2 dinyatakan selesai dan siap Soft Launch jika:

- [ ] Payment flow berfungsi end-to-end di production (bukan sandbox)
- [ ] Subscription state machine tested: semua transitions berfungsi benar
- [ ] Quota governance: grace buffer terbukti hanya proses hot-lead dan escalation
- [ ] Queue isolation: blast tidak mempengaruhi ai-reply (load test pass)
- [ ] Smart Outreach: suppression list berfungsi, campaign tidak bisa spam
- [ ] Anti-abuse: disposable email di-block, fingerprint anomali ter-detect
- [ ] Load test: semua 4 scenario pass sesuai target latency
- [ ] Security audit: tidak ada temuan CRITICAL atau HIGH yang unresolved
- [ ] Backup restore: berhasil dalam < 30 menit
- [ ] Pre-launch preflight script: semua check PASS
- [ ] Semua Go Checklist di PRD sudah di-sign off

---

*Dokumen ini adalah breakdown implementasi Phase 2 dari CLOSINGAN PRD v1.0*
*Author: Ricky Darmawan Lambogo*

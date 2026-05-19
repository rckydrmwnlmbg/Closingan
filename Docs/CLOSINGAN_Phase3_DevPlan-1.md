# CLOSINGAN — Phase 3 Development Plan
## Optimization · Analytics · Retention · Scaling · Public Launch

| | |
|---|---|
| **Owner** | Ricky Darmawan Lambogo |
| **Phase** | 3 — Growth & Scale |
| **Prerequisite** | Phase 2 selesai + Soft Launch aktif + data pilot tersedia |
| **Target** | Public Launch Ready + PMF Foundation |

---

## Konteks Phase 3

Phase 3 dimulai setelah Soft Launch berjalan dan kamu punya data nyata dari user sungguhan. Fokus bergeser dari *"membangun"* ke *"mengoptimasi berdasarkan bukti"*.

Tiga pertanyaan yang harus dijawab Phase 3:
1. **Apakah user tetap pakai produk ini?** → Retention & Engagement
2. **Apakah AI benar-benar membantu closing?** → AI Quality Improvement
3. **Apakah sistem bisa tumbuh tanpa collapse?** → Infrastructure Scaling

> **Prinsip Phase 3:** Tidak ada fitur baru yang dibangun sebelum ada data yang membuktikan fitur itu dibutuhkan. Setiap keputusan build harus didukung oleh usage data atau feedback kualitatif dari user nyata.

---

## Gambaran Besar Phase 3

```
MILESTONE 15: Analytics & Observability Upgrade    (Minggu 1-2)
MILESTONE 16: AI Quality Improvement               (Minggu 2-4)
MILESTONE 17: Retention & Engagement               (Minggu 4-5)
MILESTONE 18: Performance & Infrastructure Scale   (Minggu 5-6)
MILESTONE 19: Advanced Inbox & UX Polish           (Minggu 6-7)
MILESTONE 20: Public Launch Readiness              (Minggu 7-8)
```

---

## MILESTONE 15 — Analytics & Observability Upgrade

> **Tujuan:** Kamu bisa melihat dengan jelas apa yang terjadi di dalam produk — user melakukan apa, AI berhasil di mana, bottleneck di mana.

---

### TASK 15.1 — Product Analytics Pipeline

**Prompt ke AI:**
> "Buatkan product analytics event tracking system di NestJS. Setiap user action penting harus di-track sebagai event ke tabel `analytics_events`: event_name, tenant_id, user_id, properties (JSON), session_id, timestamp. Events wajib yang harus di-track: `inbox_opened`, `message_sent_manual`, `message_sent_ai`, `ai_mode_changed`, `hot_lead_viewed`, `follow_up_created`, `follow_up_completed`, `campaign_created`, `campaign_approved`, `campaign_sent`, `upgrade_prompt_viewed`, `upgrade_completed`, `session_started`, `session_ended`. Gunakan event queue agar tracking tidak menambah latency ke user-facing operations."

**Checklist selesai:**
- [ ] Semua 14 event ter-track saat user melakukan aksi
- [ ] Tracking tidak menambah latency > 10ms ke endpoint utama
- [ ] Event bisa di-query per tenant, per waktu, per event type

---

### TASK 15.2 — Seller Performance Dashboard

**Prompt ke AI:**
> "Buatkan halaman Analytics di Next.js yang menampilkan seller performance metrics. Metrics yang tampil: (1) Rata-rata response time ke lead (jam), (2) Jumlah lead direspons hari ini vs kemarin, (3) Hot lead conversion rate (berapa % hot lead yang di-follow-up dalam 1 jam), (4) Follow-up completion rate (% follow-up yang diselesaikan), (5) AI vs manual reply ratio, (6) Conversation yang aktif vs idle. Semua metrics tampil sebagai trend 7 hari dan 30 hari. Mobile-first, gunakan recharts untuk grafik."

**Checklist selesai:**
- [ ] Grafik 7 hari dan 30 hari akurat sesuai data `analytics_events`
- [ ] Dashboard load < 1 detik (pre-computed, bukan realtime query berat)
- [ ] Metrics bisa di-export sebagai CSV

---

### TASK 15.3 — AI Performance Monitoring

**Prompt ke AI:**
> "Buatkan internal AI performance monitoring dashboard (admin only). Metrics: (1) AI reply success rate per hari, (2) AI escalation rate (berapa % pesan yang di-escalate), (3) Average AI response latency (p50, p95, p99), (4) AI safety block rate (berapa % output diblock safety layer), (5) Top escalation reasons (tabel), (6) Token usage per tenant per hari. Alert jika: escalation rate > 20% dalam 1 jam (AI mungkin bingung), atau safety block rate > 5% (mungkin ada user yang coba bypass). Accessible di `/admin/ai-performance`."

**Checklist selesai:**
- [ ] Semua 6 metrics tampil akurat
- [ ] Alert berfungsi saat threshold terlampaui
- [ ] Data retention: simpan agregat 90 hari, raw events 30 hari

---

### TASK 15.4 — Business Metrics Dashboard (Founder View)

**Prompt ke AI:**
> "Buatkan founder dashboard di `/admin/business` yang hanya bisa diakses oleh super-admin. Metrics: (1) MRR (Monthly Recurring Revenue) realtime, (2) Trial → Paid conversion rate per kohort minggu, (3) Churn rate bulan ini vs bulan lalu, (4) Daily Active Tenants (DAT) — berapa tenant yang kirim ≥1 pesan hari ini, (5) New signups per hari (grafik 30 hari), (6) AI Credit add-on revenue, (7) Top churn reasons (dari exit survey), (8) Plan distribution (Starter/Pro/Elite %). Data di-cache setiap 1 jam."

**Checklist selesai:**
- [ ] MRR calculation akurat (test dengan data billing test)
- [ ] Kohort conversion rate akurat
- [ ] Dashboard tidak accessible oleh user biasa (test dengan regular JWT)

---

## MILESTONE 16 — AI Quality Improvement

> **Tujuan:** AI makin pintar, makin relevan untuk konteks otomotif Indonesia, dan makin dipercaya oleh sales.

---

### TASK 16.1 — Prompt Engineering & Domain Optimization

**Prompt ke AI:**
> "Bantu saya refine system prompt untuk AI sales assistant otomotif Indonesia. Requirements: (1) AI harus tau konteks: sales mobil Indonesia, WA-based, bahasa Indonesia / mix Inggris-Indonesia, (2) AI harus tau kapan harus escalate: pertanyaan kredit, nego harga besar, komplain serius, (3) AI harus adaptif terhadap tone customer: formal, santai, impatient, (4) AI harus avoid: harga palsu, promo tidak ada, janji delivery tidak pasti, (5) Buatkan 30 test cases percakapan nyata dengan expected AI response dan expected action (reply/escalate/ask-for-info). Evaluasi setiap prompt version dengan test cases ini."

**Checklist selesai:**
- [ ] 30 test cases terdokumentasi dengan expected response
- [ ] Prompt version baru di-evaluate: minimal 27/30 test cases pass (90%)
- [ ] Prompt versioning ada — bisa rollback ke versi sebelumnya

---

### TASK 16.2 — AI Feedback Loop

**Prompt ke AI:**
> "Buatkan feedback mechanism untuk AI suggestions. Di mode AI Assist, setiap saran AI yang ditampilkan ke seller punya dua tombol kecil di bawahnya: 👍 (berguna) dan 👎 (tidak relevan). Data feedback disimpan ke tabel `ai_feedback`: message_id, feedback_type (HELPFUL/NOT_HELPFUL), ai_suggestion, actual_reply_sent, timestamp. Aggregate feedback per minggu dan kirim summary ke founder email setiap Senin. Seller yang aktif kasih feedback dapat badge 'Early Contributor' di profile."

**Checklist selesai:**
- [ ] Tombol feedback tampil di semua AI suggestions
- [ ] Feedback tersimpan dan bisa di-query
- [ ] Weekly summary email terkirim Senin pagi

---

### TASK 16.3 — Objection Handling Knowledge Base

**Prompt ke AI:**
> "Buatkan knowledge base system untuk objection handling. Admin (founder) bisa tambah objection-response pairs di `/admin/knowledge-base`. Format: objection_pattern (text/regex), recommended_response, category (HARGA/KREDIT/STOK/KOMPETITOR/TIMING/LAINNYA), is_active. AI menggunakan knowledge base ini sebagai referensi saat mendeteksi objection pattern. Buatkan UI sederhana untuk manage knowledge base: list, create, edit, deactivate. Saat AI menggunakan entry dari knowledge base, catat di `ai_usage_logs` field `knowledge_base_id`."

**Checklist selesai:**
- [ ] Tambah objection baru di admin → AI langsung pakai di conversation berikutnya
- [ ] AI mencatat mana knowledge base entry yang dipakai
- [ ] Bisa track: entry mana yang paling sering dipakai

---

### TASK 16.4 — Multi-Model Routing

**Prompt ke AI:**
> "Implementasi intelligent model routing di AI service. Strategy: (1) Untuk pesan pendek dan straightforward (greeting, info produk dasar) → gunakan model 'efficient' (GPT-4o-mini atau setara), (2) Untuk pesan kompleks (nego, objection handling, pertanyaan teknis detail) → escalate ke model 'premium' (GPT-4o atau setara), (3) Classifier untuk tentukan routing: analisis panjang pesan, keyword complexity, conversation history length, (4) Log model yang digunakan per message ke `ai_usage_logs`, (5) Cost tracking per model per tenant."

**Checklist selesai:**
- [ ] 80%+ pesan sederhana → routed ke model efficient (cost saving)
- [ ] Pesan kompleks → routed ke premium dengan benar (test 20 kasus)
- [ ] Cost breakdown per model tersedia di founder dashboard

---

### TASK 16.5 — AI Conversation Summary

**Prompt ke AI:**
> "Buatkan fitur AI-generated conversation summary. Setelah conversation idle > 4 jam atau di-archive, trigger job di queue `summary` untuk generate: (1) ringkasan percakapan 3–5 kalimat, (2) status lead (interested/not-interested/follow-up-needed/deal-done), (3) recommended next action, (4) key info yang disebutkan customer (budget range, preferred model, timeline). Simpan summary ke tabel `conversation_summaries`. Tampilkan summary di header conversation panel sehingga sales bisa langsung paham konteks saat buka conversation lama."

**Checklist selesai:**
- [ ] Summary generated dalam < 30 detik setelah trigger
- [ ] Summary tampil di inbox conversation panel
- [ ] Test dengan 10 conversation nyata — summary akurat dan useful

---

## MILESTONE 17 — Retention & Engagement

> **Tujuan:** User yang sudah signup tetap aktif dan merasakan value, bukan churn di bulan pertama.

---

### TASK 17.1 — Onboarding Flow Optimization

**Prompt ke AI:**
> "Buatkan onboarding flow yang guided untuk user baru di Next.js. Progress indicator dengan 4 langkah: (1) Connect WhatsApp Business (dengan panduan step-by-step + video embed), (2) Setup AI mode pertama (dengan penjelasan tiap mode dalam bahasa sederhana), (3) Import atau tambah kontak pertama, (4) Kirim pesan test dengan AI. Setiap langkah punya: title, description, estimated time, dan tombol 'Lewati' (kecuali step 1 — WA connect wajib). Track completion rate setiap step di analytics. Tampilkan progress bar yang persistent sampai semua langkah selesai."

**Checklist selesai:**
- [ ] New user bisa sampai 'first AI reply terkirim' dalam < 10 menit
- [ ] Completion rate setiap step ter-track di analytics
- [ ] User yang skip step dapat reminder di dashboard keesokan harinya

---

### TASK 17.2 — Smart Notification System

**Prompt ke AI:**
> "Buatkan notification system yang mengirim notifikasi WhatsApp ke nomor pribadi sales berdasarkan trigger. Notifikasi yang harus ada: (1) Daily digest pagi hari (07:30 WIB): jumlah hot lead, follow-up hari ini, pending reply kemarin yang belum dibalas, (2) Weekly summary (Senin 08:00): statistik minggu lalu vs minggu ini, (3) Idle alert: jika tidak ada aktivitas login > 3 hari → 'Ada X lead yang belum direspons', (4) Achievement notification: 'Kamu sudah respons 50 lead bulan ini 🎉'. User bisa set preferensi notifikasi di Settings > Notifications. Harus bisa disable per kategori."

**Checklist selesai:**
- [ ] Daily digest terkirim jam 07:30 WIB (tidak lebih lambat dari 07:35)
- [ ] User bisa disable kategori notifikasi dari Settings
- [ ] Idle alert tidak terkirim ke user yang sudah disable notifikasi

---

### TASK 17.3 — Churn Prevention Signals

**Prompt ke AI:**
> "Buatkan churn prediction signal detector yang monitor behavioral patterns. Flag user sebagai 'at-risk' jika: (1) Login frequency turun > 50% dibanding minggu sebelumnya, (2) Tidak ada AI activity dalam 5 hari terakhir padahal sebelumnya aktif, (3) Subscription renewal dalam 7 hari + tidak ada activity, (4) Follow-up completion rate turun drastis. At-risk user masuk tabel `churn_signals`. Trigger: (a) personal WA outreach dari founder ke user at-risk (template siap, kirim manual), (b) in-app banner contextual: 'Butuh bantuan setup? Kami bisa bantu →'. Track apakah intervention berhasil (user aktif kembali dalam 7 hari)."

**Checklist selesai:**
- [ ] Churn signals ter-detect akurat (test dengan simulasi behavior)
- [ ] Founder dapat daily summary at-risk users via email
- [ ] Intervention tracking: berapa % user aktif kembali setelah di-reach out

---

### TASK 17.4 — Exit Survey System

**Prompt ke AI:**
> "Buatkan exit survey saat user cancel subscription atau tidak renew. Trigger: 24 jam sebelum subscription expire + user belum renew → tampilkan in-app survey. Pertanyaan: (1) Alasan utama tidak melanjutkan (multiple choice: Terlalu mahal / Tidak sempat pakai / Fitur tidak sesuai / Pindah ke solusi lain / Sementara tidak butuh / Lainnya), (2) Satu pertanyaan open-ended: 'Apa yang bisa kami perbaiki?', (3) NPS: 0–10 apakah merekomendasikan ke kolega. Data tersimpan ke `exit_surveys`. Aggregate results tampil di founder dashboard. Jika alasan 'Terlalu mahal' → trigger save offer (diskon 30% sekali)."

**Checklist selesai:**
- [ ] Survey muncul 24 jam sebelum expire (tidak lebih awal, tidak terlambat)
- [ ] Alasan 'Terlalu mahal' → save offer muncul otomatis
- [ ] Aggregate exit reasons tersedia di founder dashboard

---

### TASK 17.5 — Referral System (Basic)

**Prompt ke AI:**
> "Buatkan basic referral system. Setiap user mendapat unique referral code yang bisa dishare. Saat user baru signup dengan referral code: (1) referrer mendapat +7 hari gratis di bulan berikutnya (bukan uang), (2) user baru mendapat trial diperpanjang dari 7 → 14 hari, (3) Referral tercatat di tabel `referrals` dengan status: SIGNED_UP/TRIAL_ACTIVE/CONVERTED_TO_PAID. User bisa lihat referral mereka di Settings > Referral dengan status tiap referral. Reward hanya diberikan setelah referred user bayar bulan pertama (bukan saat signup)."

**Checklist selesai:**
- [ ] Signup dengan referral code → trial 14 hari (bukan 7)
- [ ] Referrer dapat +7 hari hanya setelah referred user bayar
- [ ] Referral tracking page akurat di Settings

---

## MILESTONE 18 — Performance & Infrastructure Scale

> **Tujuan:** Sistem bisa handle 10x user saat ini tanpa degradasi performa.

---

### TASK 18.1 — Database Read Replica

**Prompt ke AI:**
> "Setup PostgreSQL read replica untuk distribute read load. Config: (1) Primary database untuk semua write operations, (2) Read replica untuk: analytics queries, report generation, conversation history, dashboard summary, (3) Prisma configuration dengan `$extends` untuk route query ke replica berdasarkan operation type, (4) Fallback ke primary jika replica lag > 2 detik, (5) Monitor replica lag di observability dashboard. Jangan route write operations ke replica — ini harus di-enforce di code level, bukan hanya dokumentasi."

**Checklist selesai:**
- [ ] Write operations tidak pernah ke replica (unit test)
- [ ] Analytics query load dari replica (verify via query logs)
- [ ] Replica lag monitoring aktif di dashboard

---

### TASK 18.2 — Redis Caching Strategy

**Prompt ke AI:**
> "Implementasi comprehensive Redis caching strategy. Cache yang wajib: (1) Dashboard summary per tenant: TTL 30 detik, invalidate on relevant events, (2) User session data: TTL 15 menit, (3) Tenant plan & entitlements: TTL 5 menit (tidak perlu realtime), (4) Conversation list metadata (unread counts, last message): TTL 10 detik, (5) Hot lead list per tenant: TTL 15 detik. Buat `CacheService` wrapper dengan method `get`, `set`, `invalidate`, `invalidatePattern`. Log cache hit rate per key pattern ke monitoring. Target: cache hit rate > 80% untuk dashboard summary."

**Checklist selesai:**
- [ ] Dashboard summary cache hit rate > 80% (monitor selama 24 jam)
- [ ] Cache invalidation terjadi saat data berubah (tidak stale > TTL)
- [ ] Cache tidak pernah return data dari tenant lain (test isolation)

---

### TASK 18.3 — Horizontal Scaling Preparation

**Prompt ke AI:**
> "Audit codebase untuk pastikan stateless dan siap horizontal scaling. Tasks: (1) Identifikasi semua in-memory state yang harus dipindah ke Redis (misalnya: WebSocket room tracking, rate limit counters, circuit breaker state), (2) Pastikan semua scheduled jobs menggunakan distributed lock (Redis-based) agar tidak dijalankan double saat ada 2 instance, (3) WebSocket scaling: implementasi Redis adapter untuk Socket.io agar WebSocket events terbroadcast ke semua instances, (4) Dokumentasikan: 'cara scale dari 1 instance ke 3 instance tanpa downtime'."

**Checklist selesai:**
- [ ] Test dengan 2 instance API berjalan bersamaan: tidak ada duplicate job execution
- [ ] WebSocket event dari instance A ter-receive oleh user yang connect ke instance B
- [ ] Runbook scaling terdokumentasi dan sudah di-test

---

### TASK 18.4 — CDN & Static Asset Optimization

**Prompt ke AI:**
> "Optimize frontend performance untuk mobile user Indonesia (koneksi 4G). Tasks: (1) Setup CDN (Cloudflare atau setara) untuk semua static assets Next.js, (2) Implementasi Next.js Image optimization dengan proper sizing dan lazy loading, (3) Bundle analysis: identifikasi dan eliminasi package besar yang tidak perlu, (4) Implement Service Worker untuk offline capability di halaman Inbox (cache conversation list), (5) Target: First Contentful Paint (FCP) < 2 detik di mobile 4G, Time to Interactive (TTI) < 4 detik. Ukur dengan Lighthouse sebelum dan sesudah."

**Checklist selesai:**
- [ ] Lighthouse mobile score > 80
- [ ] FCP < 2 detik di simulasi 4G
- [ ] Bundle size total < 500KB (gzipped)

---

### TASK 18.5 — Multi-Region Readiness Assessment

**Prompt ke AI:**
> "Lakukan assessment kesiapan multi-region untuk CLOSINGAN. Analisis: (1) Apa yang perlu diubah agar database bisa di-deploy di region Singapore (lebih dekat ke user Indonesia), (2) Bagaimana handling timezone: pastikan semua timestamp tersimpan UTC, display di frontend dikonversi ke WIB/WITA/WIT berdasarkan setting user, (3) Identifikasi semua hardcoded asumsi lokasi di codebase (business hours default WIB, format nomor telepon Indonesia, dll), (4) Buatkan migration checklist jika suatu hari perlu pindah region. Output: laporan temuan + rekomendasi."

**Checklist selesai:**
- [ ] Semua timestamp tersimpan UTC di database
- [ ] Business hours default WIB tapi configurable per tenant
- [ ] Migration checklist terdokumentasi

---

## MILESTONE 19 — Advanced Inbox & UX Polish

> **Tujuan:** Inbox yang digunakan puluhan kali sehari oleh sales harus terasa cepat, intuitif, dan tidak melelahkan.

---

### TASK 19.1 — Conversation Search & Filter

**Prompt ke AI:**
> "Buatkan advanced search dan filter di Inbox. Features: (1) Full-text search across conversation messages (gunakan PostgreSQL `tsvector` untuk performance), (2) Filter kombinasi: status + heat tier + AI mode + date range + tag, (3) Saved filters: user bisa simpan filter favorit dengan nama custom, (4) Recent searches: tampilkan 5 pencarian terakhir, (5) Search results menampilkan context: nama, nomor, preview pesan yang match dengan highlight. Search harus return hasil dalam < 500ms untuk corpus 10.000 messages."

**Checklist selesai:**
- [ ] Full-text search akurat dan < 500ms (test dengan 10.000 messages)
- [ ] Filter kombinasi berfungsi
- [ ] Saved filters persistent (tidak hilang saat refresh)

---

### TASK 19.2 — Conversation Labels & Tags

**Prompt ke AI:**
> "Buatkan labeling system untuk conversation. Features: (1) Seller bisa create custom labels dengan nama dan warna (max 20 labels per tenant), (2) Label bisa di-apply ke conversation (multiple labels per conversation), (3) Label tampil sebagai colored badge di conversation list, (4) Filter inbox by label, (5) AI bisa suggest label berdasarkan conversation content (misalnya: 'Avanza', 'Kredit', 'Test Drive'), (6) Bulk label: select multiple conversations → apply label. Labels tersimpan di tabel `conversation_labels` dan `conversation_label_assignments`."

**Checklist selesai:**
- [ ] Buat label baru → muncul di semua conversation dalam 1 detik
- [ ] AI label suggestion akurat untuk 5 kategori umum (test)
- [ ] Bulk label berfungsi untuk 50 conversation sekaligus

---

### TASK 19.3 — Quick Reply Templates

**Prompt ke AI:**
> "Buatkan quick reply template system. Features: (1) Seller bisa simpan pesan template dengan nama shortcut (contoh: '/harga' → 'Untuk info harga terkini, silakan...')), (2) Di inbox input box, ketik '/' untuk trigger template picker, (3) Template bisa punya variable: {{nama}}, {{model}}, {{dealer}}, (4) Template categories: Greeting / Info Produk / Harga / Follow-up / Closing, (5) Usage tracking: template mana yang paling sering dipakai. Templates sharing: Elite plan bisa share template ke semua member dalam 1 tenant."

**Checklist selesai:**
- [ ] Ketik '/' di inbox → template picker muncul dalam < 200ms
- [ ] Variable substitution berfungsi ({{nama}} diganti dengan nama lead)
- [ ] Usage count akurat di template management page

---

### TASK 19.4 — Mobile PWA Enhancement

**Prompt ke AI:**
> "Upgrade CLOSINGAN Web menjadi Progressive Web App (PWA) yang terasa seperti native app di mobile. Tasks: (1) Web App Manifest dengan icon, theme color, dan display standalone, (2) Service Worker untuk cache static assets dan conversation list terbaru, (3) Push notification untuk hot lead alert (sebagai alternatif WA notification), (4) 'Add to Home Screen' prompt yang muncul setelah user pakai 3 kali, (5) Offline mode: jika offline, tampilkan cached conversations dengan banner 'Mode offline – beberapa data mungkin tidak terkini'. Target: Lighthouse PWA score 100."

**Checklist selesai:**
- [ ] App bisa di-install ke home screen di iOS dan Android
- [ ] Push notification berfungsi di Chrome Android
- [ ] Offline mode: conversation list ter-cache dan bisa dibuka tanpa internet
- [ ] Lighthouse PWA score 100

---

### TASK 19.5 — Keyboard Shortcuts & Power User Features

**Prompt ke AI:**
> "Tambahkan keyboard shortcuts untuk power users yang pakai CLOSINGAN di desktop/laptop. Shortcuts: `J/K` untuk navigate conversation, `R` untuk quick reply, `H` untuk toggle AI mode, `F` untuk create follow-up, `Esc` untuk close panel, `Cmd+K` untuk global search. Tampilkan shortcut hints di tooltip setelah user pakai app selama 7 hari. Buat halaman `/settings/shortcuts` yang list semua keyboard shortcuts. Shortcuts harus bisa di-disable untuk user yang tidak mau."

**Checklist selesai:**
- [ ] Semua shortcuts berfungsi di Chrome, Firefox, Safari
- [ ] Shortcut hints muncul setelah 7 hari pakai (cek via analytics event)
- [ ] Disable shortcuts di Settings berfungsi

---

## MILESTONE 20 — Public Launch Readiness

> **Tujuan:** Semua sistem, proses, dan materi siap untuk menerima user dari publik umum.

---

### TASK 20.1 — Support Ticket System

**Prompt ke AI:**
> "Integrasikan atau bangun basic support ticket system. User bisa submit support request dari dalam app (tombol 'Bantuan' di sidebar). Form: judul masalah, kategori (WA Connection / AI Issue / Billing / Fitur / Lainnya), deskripsi, attachment screenshot. Tiket masuk ke dashboard founder dengan status: OPEN/IN_PROGRESS/RESOLVED. Founder bisa reply via email (atau WA) dan update status. User dapat notifikasi email saat status berubah. SLA display di halaman support: 'Response time: biasanya < 4 jam di hari kerja'."

**Checklist selesai:**
- [ ] User bisa submit tiket dari dalam app dalam < 2 menit
- [ ] Founder dapat notifikasi tiket baru via WA dan email
- [ ] Tiket closed → user dapat notifikasi

---

### TASK 20.2 — Help Center & Documentation

**Prompt ke AI:**
> "Buatkan halaman Help Center sederhana di Next.js (bisa static pages). Minimal harus ada: (1) Getting Started guide: Connect WA → Setup AI → First lead, (2) FAQ: pertanyaan paling sering dari pilot users, (3) AI Modes explained: kapan pakai apa, (4) Troubleshooting WA connection issues, (5) Panduan Smart Outreach (batas penggunaan yang wajar), (6) Billing & Subscription FAQ. Bisa dibuka tanpa login. Searchable dengan client-side search (Fuse.js). URL: `/help`."

**Checklist selesai:**
- [ ] Semua 6 artikel tersedia dan akurat
- [ ] Help Center bisa dibuka tanpa login
- [ ] Search berfungsi dan relevan

---

### TASK 20.3 — Status Page

**Prompt ke AI:**
> "Buatkan public status page di URL `/status`. Tampilkan uptime dan status untuk: API, WhatsApp Connection, AI Service, Billing. Status per komponen: Operational / Degraded Performance / Partial Outage / Major Outage. Update otomatis setiap 1 menit berdasarkan health check hasil. Tampilkan juga: incident history 30 hari terakhir dengan timeline (mulai, terdeteksi, resolved). Jika ada ongoing incident: banner otomatis muncul di dalam app ('Kami sedang investigasi masalah pada [komponen]'). Status page harus accessible bahkan saat app down (hosted terpisah atau Cloudflare Pages)."

**Checklist selesai:**
- [ ] Status page accessible dari luar app (URL publik)
- [ ] Status update otomatis tanpa manual update founder
- [ ] Ongoing incident banner muncul di dalam app

---

### TASK 20.4 — Legal & Compliance Finalization

**Prompt ke AI:**
> "Bantu review dan finalisasi dokumen legal untuk CLOSINGAN Indonesia. Buatkan draft untuk: (1) Terms of Service yang cover: penggunaan AI, data WhatsApp, batasan liability, larangan penggunaan untuk spam, kebijakan refund, (2) Privacy Policy yang cover: data apa yang dikumpulkan (pesan WA, kontak, usage data), bagaimana disimpan dan diproteksi, tidak dijual ke pihak ketiga, (3) AI Disclosure: section eksplisit bahwa produk menggunakan AI dan AI bisa membuat kesalahan, (4) Anti-Spam Policy: seller bertanggung jawab atas penggunaan Smart Outreach. Semua dalam Bahasa Indonesia. Tambahkan AI disclosure di footer setiap halaman."

**Checklist selesai:**
- [ ] ToS, Privacy Policy, AI Disclosure published di `/legal`
- [ ] Saat signup → user wajib centang 'Setuju ToS dan Privacy Policy'
- [ ] AI disclosure visible di footer app
- [ ] Legal docs sudah di-review oleh pihak yang paham hukum Indonesia

---

### TASK 20.5 — Launch Analytics Setup

**Prompt ke AI:**
> "Setup analytics infrastructure untuk public launch. Tasks: (1) Implementasi funnel tracking: Landing Page → Signup → WA Connect → First AI Reply → Day 7 Active → Paid, (2) Setup cohort analysis: track retention curve minggu ke-1, 2, 4, 8, (3) UTM parameter tracking: dari mana traffic datang (ads, social, referral, organic), (4) A/B testing infrastructure dasar: feature flag system dengan `isEnabled(tenantId, featureName)` untuk rollout fitur bertahap, (5) Revenue tracking: MRR, ARR, ARPU, LTV estimasi. Semua data tersedia di founder dashboard (Task 15.4)."

**Checklist selesai:**
- [ ] Funnel 5-step ter-track di analytics
- [ ] Cohort retention curve akurat dan visual di dashboard
- [ ] Feature flag berfungsi: enable/disable fitur per tenant tanpa redeploy

---

## Dependency Map Phase 3

```
[Phase 2 Complete + Soft Launch Data]
              │
              ▼
M15: Analytics & Observability (harus pertama — butuh data untuk keputusan berikutnya)
  15.1 Product Analytics Pipeline
  15.2 Seller Performance Dashboard
  15.3 AI Performance Monitoring
  15.4 Business Metrics (Founder View)
              │
     ┌────────┴────────┐
     ▼                 ▼
M16: AI Quality    M17: Retention & Engagement
  16.1 Prompt Eng    17.1 Onboarding Optimization
  16.2 Feedback Loop 17.2 Smart Notifications
  16.3 Knowledge Base 17.3 Churn Prevention
  16.4 Model Routing  17.4 Exit Survey
  16.5 AI Summary     17.5 Referral System
     │                 │
     └────────┬────────┘
              ▼
M18: Infrastructure Scale
  18.1 Read Replica
  18.2 Redis Caching
  18.3 Horizontal Scaling
  18.4 CDN Optimization
  18.5 Multi-Region Assessment
              │
              ▼
M19: Advanced UX Polish
  19.1 Search & Filter
  19.2 Labels & Tags
  19.3 Quick Reply Templates
  19.4 Mobile PWA
  19.5 Power User Features
              │
              ▼
M20: Public Launch Readiness
  20.1 Support System
  20.2 Help Center
  20.3 Status Page
  20.4 Legal Finalization
  20.5 Launch Analytics
              │
              ▼
         PUBLIC LAUNCH 🚀
```

---

## Data-Driven Decision Points

Phase 3 punya beberapa **decision gates** yang harus kamu evaluasi dengan data nyata sebelum lanjut:

### Gate 1: Setelah Milestone 15 selesai
Evaluasi dari data analytics:
- Apakah DAT (Daily Active Tenants) tumbuh atau flat?
- Fitur mana yang paling sering dipakai? Build more of that.
- Fitur mana yang tidak dipakai sama sekali? Pertimbangkan cut atau simplify.

### Gate 2: Setelah Milestone 16-17 selesai
Evaluasi retention:
- Apakah Week-4 retention > 50%? Jika ya, lanjut scale.
- Apakah trial-to-paid conversion > 15%? Jika tidak, cari tahu kenapa dulu.
- Apakah churn rate < 10%/bulan? Jika tidak, tunda scaling, fokus retention.

### Gate 3: Sebelum Milestone 20 (Public Launch)
- Support capacity: apakah kamu sanggup handle 10x tiket?
- NPS dari soft launch users: minimal 30?
- Tidak ada P0 unresolved dalam 2 minggu terakhir?

---

## Estimasi Waktu Phase 3

| Milestone | Estimasi (Solo + AI Tools) |
|---|---|
| M15: Analytics & Observability | 4–5 hari |
| M16: AI Quality Improvement | 5–7 hari |
| M17: Retention & Engagement | 5–6 hari |
| M18: Infrastructure Scale | 4–5 hari |
| M19: Advanced UX Polish | 5–6 hari |
| M20: Public Launch Readiness | 4–5 hari |
| **Total** | **~6–7 minggu** |

---

## Total Estimasi 3 Phase

| Phase | Estimasi | Target |
|---|---|---|
| Phase 1: MVP Core | 6–7 minggu | Closed Pilot |
| Phase 2: Production Hardening | 7–8 minggu | Soft Launch |
| Phase 3: Growth & Scale | 6–7 minggu | Public Launch |
| **Grand Total** | **~19–22 minggu (~5 bulan)** | **Public Launch** |

> Dengan AI coding tools aktif dan fokus penuh. Tanpa AI tools, estimasi 8–10 bulan.

---

## Definition of Done — Phase 3 (Public Launch Ready)

- [ ] Analytics pipeline aktif dan data akurat (15.1)
- [ ] AI prompt optimization: 90%+ test cases pass (16.1)
- [ ] Onboarding completion rate > 70% (17.1)
- [ ] Week-4 retention > 50% (dari data soft launch)
- [ ] Trial-to-paid conversion > 15% (dari data soft launch)
- [ ] Churn rate < 10%/bulan (dari data soft launch)
- [ ] Dashboard load < 1 detik (18.2)
- [ ] Lighthouse mobile score > 80 (18.4)
- [ ] Support system aktif dan response time < 4 jam (20.1)
- [ ] Help Center published (20.2)
- [ ] Status page live dan update otomatis (20.3)
- [ ] Legal docs published dan user wajib setuju saat signup (20.4)
- [ ] Feature flag system aktif untuk controlled rollout (20.5)
- [ ] NPS dari soft launch users ≥ 30
- [ ] Tidak ada P0 unresolved 14 hari sebelum public launch

---

*Dokumen ini adalah breakdown implementasi Phase 3 dari CLOSINGAN PRD v1.0*
*Author: Ricky Darmawan Lambogo*

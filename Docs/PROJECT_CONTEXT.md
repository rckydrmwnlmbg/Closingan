# CLOSINGAN — Project Context
> Sisipkan file ini di setiap sesi AI coding assistant (Cursor, Claude, Copilot, dll)

---

## Apa Produk Ini

CLOSINGAN adalah **AI Assistant untuk sales mobil Indonesia berbasis WhatsApp**.
Bukan CRM enterprise. Bukan chatbot umum. Fokus: bantu sales individual respons lebih cepat, tidak lupa follow-up, dan deteksi lead panas secara otomatis.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | NestJS (Node.js) |
| Frontend | Next.js + shadcn/ui + Tailwind |
| Database | PostgreSQL + Prisma ORM |
| Queue | BullMQ + Redis |
| Realtime | Socket.io (WebSocket) |
| WA Provider | Fonnte (abstracted behind interface) |
| AI Provider | OpenAI GPT-4o-mini (abstracted behind interface) |
| Auth | JWT (access token 15 menit + refresh token 7 hari) |
| Infra | Docker + NGINX |

---

## Struktur Folder

```
/apps
  /api          → NestJS backend
  /web          → Next.js frontend
/libs
  /shared       → shared types, DTOs, enums, constants
/docs           → PRD, phase plans, context files
/docker-compose.yml
/.env.example
```

---

## Prinsip Arsitektur — WAJIB DIIKUTI

### 1. Multi-Tenant Isolation (PALING KRITIS)
- Setiap tabel di database WAJIB punya kolom `tenant_id`
- Setiap query WAJIB di-scope ke `tenant_id` dari JWT user
- Tidak ada query yang boleh return data lintas tenant
- Gunakan Prisma `$extends` wrapper untuk enforce ini secara otomatis
- **Pelanggaran ini = bug security paling serius di produk ini**

### 2. Provider Abstraction
- WhatsApp provider (Fonnte) WAJIB di-wrap dalam `WhatsappProviderInterface`
- AI provider (OpenAI) WAJIB di-wrap dalam `AiProviderInterface`
- Business logic tidak boleh import Fonnte atau OpenAI SDK secara langsung
- Tujuan: bisa ganti provider tanpa ubah business logic

### 3. Queue Priority — Jangan Dilanggar
```
hot-lead    → CRITICAL priority
ai-reply    → HIGH priority
escalation  → HIGH priority
follow-up   → MEDIUM priority
summary     → MEDIUM priority
analytics   → LOW priority
blast       → LOWEST priority
```
Blast queue TIDAK BOLEH mempengaruhi latency ai-reply dan hot-lead.

### 4. AI Safety — Non-Negotiable
Semua AI output WAJIB melewati `AISafetyService` sebelum dikirim ke customer.
AI dilarang keras:
- Menghasilkan angka simulasi kredit / DP / cicilan
- Membuat klaim promo yang tidak ada di catalog resmi
- Mengirim pesan saat conversation dalam state `HUMAN_ACTIVE`

### 5. Human Takeover Rule
Jika sales balas manual → AI OTOMATIS pause (cooldown default 15 menit).
AI tidak boleh double-reply dalam kondisi apapun.

---

## State Machines Penting

### Conversation States
```
OPEN → WAITING_CUSTOMER → WAITING_SELLER → HUMAN_ACTIVE
                                         → AI_ACTIVE
                                         → ESCALATED
                                         → ARCHIVED
```

### AI Modes (per conversation)
```
AI_ASSIST       → AI suggest, seller yang kirim
SMART_HYBRID    → AI kirim jika confidence tinggi, escalate jika ragu
AUTO_REPLY      → AI kirim otomatis dengan safety guard ketat
AI_OFF          → Tidak ada AI activity
```

### Lead Heat Tiers
```
LOW → WARM → HOT → CRITICAL
```
Setiap tier WAJIB disertai `heat_reasons` array (human-readable, tidak boleh kosong).

### Subscription States
```
TRIAL → ACTIVE → PAST_DUE → SUSPENDED → CANCELLED
```

---

## Core Database Tables

```
tenants · users · whatsapp_sessions · conversations · messages
leads · follow_ups · token_quotas · ai_usage_logs · audit_logs
escalation_logs · campaigns · campaign_recipients · suppression_list
conversation_summaries · analytics_events · exit_surveys · referrals
```

---

## Quota Governance

| Threshold | Aksi |
|---|---|
| 70% | Kirim warning notification |
| 85% | Warning urgent + soft upsell banner |
| 95% | Pause queue: summary, analytics, blast |
| 100% + grace 5% | Hanya proses: hot-lead, ai-reply, escalation |

---

## Dua Nomor WhatsApp per User

| Nomor | Fungsi |
|---|---|
| **WA Business** | AI auto reply, komunikasi dengan customer |
| **WA Personal** | Menerima alert: hot lead, escalation, disconnect, quota kritis |

---

## Hal yang TIDAK ADA di Produk Ini (Jangan Dibuat)

- Instagram / Facebook DM integration
- Loan calculator atau simulasi kredit engine
- Enterprise CRM pipeline
- Multi-language (English) support
- Community / social features

---

## Cara Pakai File Ini

**Cursor:** Simpan sebagai `.cursorrules` di root project folder
**Claude / ChatGPT:** Paste di awal setiap sesi baru sebelum mulai task
**Copilot:** Simpan di `/docs/PROJECT_CONTEXT.md` dan sebut di komentar kode jika perlu

Setelah menyertakan file ini, lanjutkan dengan menyertakan **satu task spesifik** dari dokumen Phase Plan yang sedang dikerjakan.

---

*CLOSINGAN · Owner: Ricky Darmawan Lambogo*

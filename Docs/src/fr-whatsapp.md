# FR-WHATSAPP — WhatsApp Integration
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Mengatur integrasi dengan WhatsApp Business via Fonnte API — koneksi, pengiriman, penerimaan pesan, dan disconnect handling.

---

## User Stories
| ID | Story |
|---|---|
| US-WA-01 | Sebagai seller, saya ingin connect nomor WA Business saya agar pesan lead masuk ke CLOSINGAN |
| US-WA-02 | Sebagai seller, saya ingin tahu jika koneksi WA terputus agar bisa segera reconnect |
| US-WA-03 | Sebagai seller, saya ingin AI bisa balas dari nomor WA Business saya, bukan nomor lain |

---

## Functional Requirements

### FR-WA-01: Connect WhatsApp Session
**Input:** Fonnte API token
**Proses:**
1. Validasi token ke Fonnte API
2. Simpan token (encrypted) ke `whatsapp_sessions`
3. Set session status: `CONNECTING → CONNECTED`
4. Catat di audit log
5. Aktivasi trial jika belum aktif (trigger FR-BILLING-05)

**Business Rules:**
- 1 tenant = 1 nomor WA Business aktif (Starter/Pro)
- Elite plan: max 3 nomor WA
- Token disimpan encrypted, tidak pernah di-log

---

### FR-WA-02: Receive Incoming Message (Webhook)
**Endpoint:** `POST /webhook/whatsapp`

**Proses:**
1. Validasi Fonnte webhook signature → reject 401 jika invalid
2. Normalize payload ke format internal
3. Deduplikasi: cek idempotency key → skip jika sudah diproses
4. Cari atau buat `conversation` record
5. Simpan `message` ke database
6. Push job ke queue `ai-reply` (atau sesuai AI mode aktif)
7. Update `conversation.last_activity_at`

**Business Rules:**
- Webhook duplikat (dikirim 2x oleh Fonnte) hanya diproses 1x
- Pesan dari nomor yang ada di suppression list → simpan tapi tidak trigger AI
- Pesan masuk saat WA session disconnect → simpan ke DB, proses saat reconnect

---

### FR-WA-03: Send Outgoing Message
**Input:** nomor tujuan, isi pesan, tenant_id

**Proses:**
1. Validasi conversation state (tidak boleh kirim saat `HUMAN_ACTIVE` dari AI)
2. Cek pacing: tidak melebihi 20 pesan/menit per tenant
3. Kirim via Fonnte API
4. Simpan message ke DB dengan `delivery_state: SENT`
5. Update delivery state saat Fonnte webhook confirm: `DELIVERED`

**Business Rules:**
- AI tidak boleh kirim saat conversation state = `HUMAN_ACTIVE`
- Rate limit: max 20 pesan/menit per tenant (enforced di queue level)
- Retry: 2x jika Fonnte timeout, backoff 30 detik

---

### FR-WA-04: Disconnect Detection
**Proses (cron setiap 1 menit):**
1. Health check semua active WA sessions
2. Jika session disconnect:
   - Update status: `DISCONNECTED`
   - Pause outgoing queue untuk tenant
   - Kirim WA alert ke nomor pribadi seller
   - Mulai auto-reconnect (retry: 1m → 5m → 15m, max 3x)
3. Jika reconnect berhasil:
   - Update status: `CONNECTED`
   - Resume queue
   - Kirim konfirmasi ke seller

**Business Rules:**
- Pesan yang di-queue saat disconnect tidak hilang — dikirim setelah reconnect
- Jika gagal reconnect setelah 3x → kirim alert final, stop retry, tunggu manual reconnect

---

### FR-WA-05: Disconnect Manual
Seller dapat disconnect WA dari Settings. Queue freeze otomatis.

---

### FR-WA-06: Provider Abstraction
Seluruh komunikasi WA harus melalui `WhatsappProviderInterface`. Tidak ada import Fonnte SDK langsung di business logic. Tujuan: provider dapat diganti tanpa ubah logic.

**Interface methods:**
```
sendMessage(to, message, tenantToken)
checkConnectionStatus(tenantToken)
validateWebhookSignature(payload, signature)
```

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-WA-01 | Connect WA → status CONNECTED dalam < 30 detik |
| AC-WA-02 | Pesan WA masuk → tersimpan di DB dalam < 3 detik |
| AC-WA-03 | Webhook duplikat → hanya 1 message record tersimpan |
| AC-WA-04 | Disconnect terdeteksi → seller dapat WA alert dalam < 2 menit |
| AC-WA-05 | Queue freeze saat disconnect → tidak ada pesan terkirim |
| AC-WA-06 | Reconnect berhasil → queue resume otomatis |
| AC-WA-07 | Invalid webhook signature → 401, tidak diproses |

---

## Dependencies
- Fonnte API (external)
- BullMQ queue: `ai-reply`, `hot-lead`
- `whatsapp_sessions`, `conversations`, `messages` tables
- Suppression list (FR-CAMPAIGN)

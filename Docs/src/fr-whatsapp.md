# FR-WHATSAPP — WhatsApp Integration
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo
**⚠️ DIUPDATE v1.1** — Model koneksi diubah ke QR Code flow

---

## Overview
Mengatur integrasi dengan WhatsApp Business via Fonnte API. CLOSINGAN memiliki satu akun Fonnte di backend. User cukup **scan QR code** dari dashboard CLOSINGAN — tidak perlu tahu Fonnte, tidak perlu daftar ke Fonnte, tidak perlu input token apapun.

**Prinsip utama:** User experience harus semudah scan QR, selesai dalam 30 detik.

---

## Model Arsitektur

```
User                    CLOSINGAN Backend           Fonnte
 │                            │                       │
 │  Buka Settings > WA        │                       │
 │─────────────────────────►  │                       │
 │                            │  Request QR Code      │
 │                            │──────────────────────►│
 │                            │  ◄── QR Code data     │
 │  ◄── Tampil QR Code        │                       │
 │                            │                       │
 │  [User scan QR dengan WA]  │                       │
 │                            │  Webhook: connected   │
 │                            │◄──────────────────────│
 │  ◄── Status: CONNECTED ✅  │                       │
```

**Yang user lakukan:** Buka dashboard → lihat QR → scan → selesai.
**Yang user tidak perlu lakukan:** Daftar Fonnte, cari API token, copy-paste apapun.

---

## User Stories
| ID | Story |
|---|---|
| US-WA-01 | Sebagai seller, saya ingin connect nomor WA dengan scan QR di dashboard CLOSINGAN |
| US-WA-02 | Sebagai seller, saya ingin tahu jika koneksi WA terputus agar bisa segera reconnect |
| US-WA-03 | Sebagai seller, saya ingin AI bisa balas dari nomor WA Business saya, bukan nomor lain |

---

## Functional Requirements

### FR-WA-01: Generate & Display QR Code
**Trigger:** User buka Settings > WA Connection (saat belum connected)

**Proses:**
1. Backend request QR code ke Fonnte API menggunakan **CLOSINGAN system token** (dari .env)
2. Fonnte return QR code data
3. Backend return QR ke frontend
4. Frontend tampilkan QR code (auto-refresh setiap 30 detik jika belum di-scan)
5. Polling status setiap 3 detik

**Business Rules:**
- QR code expired setelah 60 detik → auto-generate QR baru
- 1 tenant = 1 nomor WA Business aktif (Starter/Pro)
- Elite plan: max 3 nomor WA
- User tidak pernah melihat atau menyentuh Fonnte token
- **CLOSINGAN system Fonnte token disimpan di .env, bukan di database user**

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

### FR-WA-02: Session Connected (Webhook from Fonnte)
**Trigger:** Fonnte kirim webhook saat user berhasil scan QR

**Proses:**
1. Validasi webhook signature
2. Extract phone number dari payload
3. Update `WhatsappSession.state = CONNECTED`
4. Simpan phone number dan display name
5. Hash phone number (untuk trial abuse prevention)
6. Catat di audit log: `WA_CONNECTED`
7. Aktivasi trial jika belum aktif
8. Kirim WebSocket event ke frontend: `wa:status_changed`

---

### FR-WA-03: Receive Incoming Message (Webhook)
**Endpoint:** `POST /webhook/whatsapp`

**Proses:**
1. Validasi Fonnte webhook signature → reject 401 jika invalid
2. Identifikasi tenant dari nomor WA tujuan (phone number routing)
3. Normalize payload ke format internal
4. Deduplikasi via idempotency key → skip jika sudah diproses
5. Cari atau buat `conversation` record
6. Simpan `message` ke database
7. Push job ke queue `ai-reply`
8. Update conversation state

**Business Rules:**
- Webhook duplikat hanya diproses 1x
- Pesan dari suppression list → simpan tapi tidak trigger AI
- Pesan masuk saat session disconnect → simpan, proses saat reconnect

---

### FR-WA-04: Send Outgoing Message
**Proses:**
1. Cek conversation state (AI tidak kirim saat `HUMAN_ACTIVE`)
2. Cek pacing: max 20 pesan/menit per tenant
3. Kirim via Fonnte API menggunakan **CLOSINGAN system token** + device identifier tenant
4. Simpan ke DB dengan `delivery_state: SENT`

---

### FR-WA-05: Disconnect Detection & Auto-Recovery
**Cron setiap 1 menit:**
1. Health check semua active WA sessions via Fonnte API
2. Jika disconnect:
   - Update state: `DISCONNECTED`
   - Pause outgoing queue untuk tenant
   - Alert ke nomor pribadi seller
   - Auto-reconnect retry: 1m → 5m → 15m (max 3x)
3. Reconnect berhasil → resume queue, konfirmasi ke seller

---

### FR-WA-06: Disconnect Manual
Seller bisa disconnect dari Settings. Queue freeze otomatis. QR code baru bisa di-generate kapan saja untuk reconnect.

---

### FR-WA-07: Provider Abstraction
Semua komunikasi WA melalui `WhatsappProviderInterface`. Tidak ada import Fonnte SDK langsung di business logic.

**Interface methods:**
```
generateQrCode(tenantId): Promise<{ qrData: string, expiresAt: Date }>
checkConnectionStatus(deviceId): Promise<WaSessionState>
sendMessage(deviceId, to, message): Promise<{ messageId: string }>
validateWebhookSignature(payload, signature): boolean
```

**Catatan penting:** Semua method menggunakan `deviceId` (identifier device tenant di Fonnte), bukan token user. System token ada di environment variable CLOSINGAN, bukan di database per user.

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-WA-01 | User scan QR → status CONNECTED dalam < 30 detik |
| AC-WA-02 | User tidak perlu input apapun selain scan QR |
| AC-WA-03 | QR expired → QR baru auto-generate tanpa reload halaman |
| AC-WA-04 | Pesan WA masuk → tersimpan di DB dalam < 3 detik |
| AC-WA-05 | Webhook duplikat → hanya 1 message record |
| AC-WA-06 | Disconnect → seller dapat WA alert dalam < 2 menit |
| AC-WA-07 | Queue freeze saat disconnect → tidak ada pesan terkirim |
| AC-WA-08 | Reconnect berhasil → queue resume otomatis |
| AC-WA-09 | Invalid webhook signature → 401 |

---

## Dependencies
- Fonnte API (CLOSINGAN system account, credentials di .env)
- BullMQ queue: `ai-reply`, `hot-lead`
- `whatsapp_sessions`, `conversations`, `messages` tables
- Suppression list (FR-CAMPAIGN)

## ⚠️ Catatan untuk Jules
Hapus semua implementasi yang meminta user input Fonnte token.
Ganti dengan QR code generation flow.
`fonnteToken` di `WhatsappSession` schema bukan token user —
melainkan device identifier dari Fonnte untuk tenant ini.
System Fonnte token ada di `.env` sebagai `FONNTE_SYSTEM_TOKEN`.

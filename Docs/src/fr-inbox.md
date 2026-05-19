# FR-INBOX — Inbox & Conversation Management
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Mengatur manajemen percakapan, state machine conversation, realtime updates, dan human takeover logic.

---

## User Stories
| ID | Story |
|---|---|
| US-INBOX-01 | Sebagai seller, saya ingin melihat semua percakapan aktif dalam satu tempat |
| US-INBOX-02 | Sebagai seller, saya ingin balas pesan manual kapanpun saya mau |
| US-INBOX-03 | Sebagai seller, saya ingin AI pause otomatis ketika saya membalas manual |
| US-INBOX-04 | Sebagai seller, saya ingin filter inbox berdasarkan heat level dan status |

---

## Conversation State Machine

```
OPEN
  └──→ WAITING_CUSTOMER  (seller sudah balas, tunggu respon customer)
  └──→ WAITING_SELLER    (customer balas, belum ada respon)
        └──→ HUMAN_ACTIVE   (seller balas manual → AI pause)
        └──→ AI_ACTIVE      (AI sedang/sudah membalas)
        └──→ ESCALATED      (AI tidak bisa handle → butuh seller)
  └──→ ARCHIVED           (conversation selesai / tidak aktif lama)
```

**Aturan transisi:**
- `HUMAN_ACTIVE` → AI cooldown 15 menit → kembali ke mode sebelumnya
- `ESCALATED` → harus di-resolve manual oleh seller
- Conversation idle > 7 hari → auto `ARCHIVED`

---

## AI Mode per Conversation

| Mode | Behavior |
|---|---|
| `AI_ASSIST` | AI suggest balasan, seller yang kirim. **Default untuk user baru.** |
| `SMART_HYBRID` | AI kirim jika confidence tinggi, escalate jika ragu |
| `AUTO_REPLY` | AI kirim otomatis dengan safety guard ketat |
| `AI_OFF` | Tidak ada AI activity di conversation ini |

Seller dapat mengubah AI mode kapanpun dari inbox header.

---

## Functional Requirements

### FR-INBOX-01: Conversation List
**Endpoint:** `GET /conversations`

**Filter yang tersedia:**
- Status: OPEN / WAITING_SELLER / ESCALATED / ARCHIVED
- Heat tier: HOT / WARM / LOW / CRITICAL
- AI mode: ASSIST / HYBRID / AUTO / OFF
- Date range
- Label/tag

**Sorting:** last_activity_at (default), heat_score, unread count

**Response per item:**
- Nama & nomor lead
- Last message preview
- Unread count
- Heat tier + reasons
- AI mode aktif
- Follow-up due indicator
- Conversation state

**Business Rules:**
- Hanya conversation dari tenant sendiri yang muncul
- Cursor-based pagination (bukan offset)
- Cache 10 detik di Redis, invalidate saat ada pesan baru

---

### FR-INBOX-02: Conversation Detail & Messages
**Endpoint:** `GET /conversations/:id/messages`

**Response per message:**
- Isi pesan
- Sender type: CUSTOMER / HUMAN / AI
- AI mode saat pesan dikirim (jika AI)
- Timestamp
- Delivery state (SENT/DELIVERED/READ)

**Business Rules:**
- Pesan AI harus jelas dibedakan secara visual dari pesan manual seller
- Load history: 50 pesan terakhir, scroll to load more

---

### FR-INBOX-03: Send Manual Reply
**Endpoint:** `POST /conversations/:id/messages`

**Proses:**
1. Validasi conversation milik tenant
2. Kirim pesan via WA provider
3. Simpan ke database (sender_type: HUMAN)
4. Trigger human takeover logic (FR-INBOX-05)
5. Update conversation state dan last_activity_at

---

### FR-INBOX-04: Realtime Updates (WebSocket)
**Events yang dipush ke client:**
- `conversation:new_message` — pesan baru masuk/keluar
- `conversation:state_changed` — state berubah
- `conversation:heat_changed` — heat tier berubah
- `ai:suggestion_ready` — AI assist suggestion siap
- `system:escalation` — ada escalation baru
- `ai:mode_changed` — AI mode berubah

**Business Rules:**
- User hanya subscribe events dari tenant mereka
- WebSocket reconnect otomatis jika disconnect (max 5x, backoff)
- Redis adapter untuk broadcast ke multiple instances

---

### FR-INBOX-05: Human Takeover Logic
**Trigger:** Seller mengirim pesan manual saat AI mode ACTIVE

**Proses:**
1. Set conversation state → `HUMAN_ACTIVE`
2. Catat takeover timestamp
3. AI tidak boleh kirim pesan selama `HUMAN_ACTIVE`
4. Mulai cooldown timer (default: 15 menit)
5. Setelah cooldown → kembali ke AI mode sebelumnya
6. Catat di audit log

**Business Rules:**
- AI tidak boleh double-reply dalam kondisi apapun
- Seller dapat reset cooldown timer manual dari inbox
- Jika seller ganti AI mode ke OFF → takeover tidak berakhir otomatis

---

### FR-INBOX-06: Search & Filter
**Full-text search** across message content (PostgreSQL tsvector)

**Advanced filter kombinasi:** status + heat + AI mode + date + label

**Business Rules:**
- Search hasil < 500ms untuk 10.000 messages
- Hasil highlight keyword yang match
- Recent searches tersimpan (max 5)

---

### FR-INBOX-07: Conversation Labels
Seller dapat create label custom (nama + warna, max 20 per tenant). Label bisa diapply ke banyak conversation. Filter inbox by label.

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-INBOX-01 | 100 conversation list load < 500ms |
| AC-INBOX-02 | Pesan baru muncul realtime tanpa refresh |
| AC-INBOX-03 | Seller balas manual → AI tidak kirim apapun selama 15 menit |
| AC-INBOX-04 | AI tidak double-reply dalam kondisi apapun |
| AC-INBOX-05 | Conversation tenant lain tidak muncul di list |
| AC-INBOX-06 | AI message berbeda visual dari manual message |

---

## Dependencies
- WhatsApp Integration (FR-WHATSAPP)
- AI Engine (FR-AI) untuk mode dan suggestion
- Hot Lead Assessment (FR-ASSESSMENT) untuk heat indicator
- Follow-up Engine (FR-FOLLOWUP) untuk due indicator
- Redis (WebSocket, cache)

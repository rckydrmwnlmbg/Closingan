# FR-AI — AI Engine & Safety Layer
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Mengatur AI reply generation, mode management, safety validation, escalation logic, dan model routing.

---

## User Stories
| ID | Story |
|---|---|
| US-AI-01 | Sebagai seller, saya ingin AI bisa balas pertanyaan dasar lead saat saya tidak bisa pegang HP |
| US-AI-02 | Sebagai seller, saya ingin AI tidak pernah memberi informasi harga atau kredit yang salah |
| US-AI-03 | Sebagai seller, saya ingin tahu saat AI tidak bisa menjawab agar saya bisa intervensi |
| US-AI-04 | Sebagai seller, saya ingin bisa matikan AI kapanpun untuk conversation sensitif |

---

## AI Architecture

```
Incoming Message
      ↓
[Conversation State Check]
      ↓ (HUMAN_ACTIVE? → skip AI)
[Quota Check]
      ↓ (quota habis? → grace buffer check)
[Model Router]
      ↓
[AI Inference (OpenAI)]
      ↓
[AI Safety Validator] ← WAJIB, tidak bisa dibypass
      ↓ (unsafe? → block + escalate)
[Send via WA Provider]
      ↓
[Log AI Usage]
```

---

## Functional Requirements

### FR-AI-01: AI Reply Worker
**Queue:** `ai-reply` (HIGH priority)

**Pre-conditions (semua harus terpenuhi):**
- Conversation state ≠ `HUMAN_ACTIVE`
- AI mode ≠ `AI_OFF`
- Quota tersedia (atau dalam grace buffer untuk hot leads)
- WA session: `CONNECTED`

**Proses:**
1. Build context: conversation history (last 20 messages), product catalog, lead info
2. Route ke model yang tepat (FR-AI-05)
3. Generate response
4. Validasi via AI Safety Layer (FR-AI-03)
5. Jika aman → kirim via WA provider
6. Jika tidak aman → block + trigger escalation
7. Log ke `ai_usage_logs`
8. Update conversation state

**Business Rules:**
- AI tidak boleh kirim saat `HUMAN_ACTIVE`
- Confidence rendah (<threshold) → escalate, jangan tetap kirim
- Timeout 10 detik → escalate, jangan kirim tebakan

---

### FR-AI-02: AI Assist Mode (Suggestion)
**Trigger:** Pesan customer masuk + conversation dalam mode `AI_ASSIST`

**Proses:**
1. Generate suggested reply (tidak langsung dikirim)
2. Push via WebSocket: `ai:suggestion_ready`
3. Tampilkan di inbox dengan opsi: Kirim / Edit / Generate Ulang / Abaikan

**Business Rules:**
- Suggestion TIDAK PERNAH terkirim otomatis — butuh aksi eksplisit seller
- Suggestion juga melewati AI Safety Layer sebelum ditampilkan
- Jika seller tidak interaksi dalam 5 menit → suggestion dismissed otomatis

---

### FR-AI-03: AI Safety Layer (NON-NEGOTIABLE)
**Validasi wajib untuk semua output AI sebelum dikirim atau ditampilkan:**

**Hal yang DILARANG dalam output AI:**
- Angka simulasi kredit / DP / cicilan spesifik
- Klaim promo yang tidak ada di catalog resmi (FR-CATALOG)
- Garansi delivery date spesifik
- Klaim "pasti", "dijamin", "100%" terkait transaksi
- Menyebut kompetitor secara negatif

**Jika validasi gagal:**
1. BLOCK output — tidak terkirim ke customer
2. Set conversation → `ESCALATED`
3. Kirim WA alert ke nomor pribadi seller: isi pesan yang diblock + alasan
4. Log ke `escalation_logs` dengan detail
5. Update dashboard: escalation counter +1

**Business Rules:**
- Safety Layer tidak bisa dibypass oleh siapapun
- Log semua block events, termasuk konten yang diblock (untuk audit)
- Zero tolerance: 0% false negative untuk finance claims

---

### FR-AI-04: Escalation Flow
**Trigger conditions:**
- AI Safety Layer memblock output
- AI confidence < threshold
- AI timeout (> 10 detik)
- Customer eksplisit minta bicara dengan manusia
- Customer menanyakan topik sensitif (keluhan, komplain besar)

**Proses:**
1. Set conversation state → `ESCALATED`
2. Kirim WA notification ke nomor pribadi seller:
   - Nama lead
   - Pesan customer terakhir
   - Alasan escalation
   - Deep link ke conversation
3. Update dashboard widget "Needs Attention"
4. Jika seller tidak respond dalam 30 menit → kirim reminder

**Business Rules:**
- Conversation ESCALATED: AI tidak kirim apapun sampai seller resolve
- Seller dapat mark conversation sebagai "Resolved" untuk re-enable AI
- Semua escalation tercatat di `escalation_logs`

---

### FR-AI-05: Model Routing
**Strategy:**
- **Efficient (GPT-4o-mini):** Pesan pendek, greeting, FAQ sederhana, info produk dasar
- **Premium (GPT-4o):** Objection handling, negosiasi kompleks, conversation panjang (>15 messages), pertanyaan teknis detail

**Classifier:** Analisis panjang pesan + keyword complexity + history length

**Business Rules:**
- Target: ≥ 80% pesan ke model efficient (cost saving)
- Log model yang digunakan per message di `ai_usage_logs`
- Premium model hanya di-trigger jika benar-benar justified

---

### FR-AI-06: AI Conversation Summary
**Trigger:** Conversation idle > 4 jam atau di-archive

**Output summary berisi:**
- Ringkasan percakapan (3–5 kalimat)
- Status lead: INTERESTED / NOT_INTERESTED / FOLLOW_UP_NEEDED / DEAL_DONE
- Recommended next action
- Key info customer: budget, model yang diminati, timeline

**Business Rules:**
- Summary ditampilkan di header conversation panel
- Diproses via queue `summary` (MEDIUM priority)
- Tidak mengganggu operasional real-time

---

### FR-AI-07: AI Context Building
AI reply harus mempertimbangkan:
- 20 pesan terakhir percakapan
- Profil lead (nama, heat history, status)
- Product catalog aktif (FR-CATALOG)
- Objection handling knowledge base
- AI mode yang aktif
- Bahasa yang digunakan customer (formal/santai)

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-AI-01 | AI reply terkirim < 5 detik dari pesan masuk |
| AC-AI-02 | AI tidak reply saat conversation HUMAN_ACTIVE |
| AC-AI-03 | Output dengan angka kredit → 100% diblock (test 20 cases) |
| AC-AI-04 | Output dengan promo palsu → 100% diblock |
| AC-AI-05 | AI timeout → escalation, tidak kirim tebakan |
| AC-AI-06 | Suggest di AI Assist mode → tidak pernah auto-send |
| AC-AI-07 | ≥ 80% pesan di-route ke efficient model |

---

## Dependencies
- OpenAI API (external)
- FR-WHATSAPP (send message)
- FR-INBOX (conversation state)
- FR-CATALOG (product context)
- FR-ASSESSMENT (hot lead context)
- FR-BILLING (quota check)
- BullMQ queue: ai-reply, escalation, summary

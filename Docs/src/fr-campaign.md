# FR-CAMPAIGN — Smart Outreach & Campaign
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Mengatur pembuatan, validasi, pengiriman, dan monitoring campaign outreach yang governed.

---

## User Stories
| ID | Story |
|---|---|
| US-CAMP-01 | Sebagai seller, saya ingin blast pesan ke banyak lead sekaligus tanpa harus kirim satu-satu |
| US-CAMP-02 | Sebagai seller, saya ingin campaign saya tidak terkirim ke lead yang sudah minta berhenti |
| US-CAMP-03 | Sebagai seller, saya ingin tahu berapa persen pesan campaign yang terkirim |

---

## Campaign State Machine

```
DRAFT → PENDING_REVIEW → APPROVED → RUNNING → COMPLETED
                                            → PAUSED → RUNNING (resume)
                                            → CANCELLED
DRAFT → CANCELLED
```

**Aturan:** Campaign tidak bisa skip step. DRAFT harus eksplisit di-approve seller sebelum RUNNING.

---

## Functional Requirements

### FR-CAMP-01: Create Campaign
**Input:** nama, goal, message_template, scheduled_at

**Business Rules:**
- Campaign baru selalu mulai dengan status DRAFT
- Message template mendukung variable: `{{nama}}`, `{{model}}`, `{{dealer}}`
- Seller harus preview dan approve sebelum campaign bisa run

---

### FR-CAMP-02: Recipient Management
**Sumber kontak:**
- Existing conversations (semua / filter by heat tier)
- Hot leads saja
- Follow-up contacts
- Manual input nomor
- CSV upload

**Validasi sebelum approve:**
1. Normalize semua nomor ke format E.164
2. Deduplikasi nomor
3. Exclude nomor di suppression list
4. Tampilkan preview: "X kontak valid, Y invalid di-skip, Z di-exclude (suppression)"
5. Seller konfirmasi preview → baru bisa approve

**Business Rules:**
- Hanya nomor dari database tenant sendiri yang bisa dikirimi
- Cold outreach ke nomor asing dilarang
- Max recipient per campaign: sesuai plan (Starter: 100, Pro: 500, Elite: unlimited)

---

### FR-CAMP-03: Campaign Approval Flow
**Proses:**
1. Seller review summary: jumlah kontak, template, jadwal
2. Seller klik "Approve & Schedule"
3. Status → APPROVED
4. Pada jadwal → status → RUNNING, queue blast dimulai

**Business Rules:**
- Setelah APPROVED, message template dan recipient list tidak bisa diubah
- Untuk cancel setelah APPROVED → harus explicit cancel, bukan edit

---

### FR-CAMP-04: Pacing & Anti-Spam
**Rules:**
- Max 20 pesan/menit per tenant
- Min jeda 3 detik antar pesan ke nomor berbeda
- Nomor yang sama: min jeda 24 jam antar pesan campaign
- Campaign hanya berjalan pada business hours (08:00–21:00 WIB default)
- Jika Fonnte rate-limit error → auto-pause 5 menit, lalu resume

**Business Rules:**
- Campaign dijadwal di luar business hours → ditolak dengan notifikasi
- Pacing dikelola di queue level (blast queue = LOWEST priority)
- Blast queue tidak boleh mempengaruhi latency ai-reply

---

### FR-CAMP-05: Campaign Monitoring
**Dashboard per campaign:**
- Status saat ini
- Progress: X / Y terkirim (progress bar)
- Delivery status per recipient: QUEUED / SENT / DELIVERED / FAILED
- Estimated completion time

**Aksi yang tersedia:**
- Pause (saat RUNNING)
- Resume (saat PAUSED)
- Cancel (kapanpun sebelum COMPLETED)

---

### FR-CAMP-06: Suppression List
**Nomor masuk suppression list jika:**
- Customer membalas pesan yang mengandung kata: "STOP", "BERHENTI", "UNSUBSCRIBE", "HAPUS"
- Seller manually block nomor dari inbox
- Pesan gagal terkirim 3x berturut-turut ke nomor yang sama

**Aturan suppression:**
- Berlaku global per tenant (semua campaign)
- Seller dapat lihat dan export list
- Seller dapat remove nomor dari list (dengan audit trail)
- Auto-detect keyword STOP: tidak case-sensitive, deteksi dalam 1 menit

---

### FR-CAMP-07: Campaign History & Analytics
**Per campaign:**
- Total sent, delivered, failed
- Open rate (jika Fonnte support read receipt)
- Replies yang masuk setelah campaign

**Aggregate:**
- Campaign performance bulan ini vs bulan lalu
- Best performing template

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-CAMP-01 | Campaign tidak bisa RUNNING tanpa explicit seller approval |
| AC-CAMP-02 | Nomor di suppression list tidak terkirim campaign |
| AC-CAMP-03 | Customer reply STOP → nomor masuk suppression dalam < 1 menit |
| AC-CAMP-04 | Blast 100 pesan → jarak antar pesan tidak ada yang < 3 detik |
| AC-CAMP-05 | Campaign dijadwal jam 23:00 → ditolak, seller dapat notifikasi |
| AC-CAMP-06 | Fonnte rate-limit error → campaign auto-pause, bukan crash |
| AC-CAMP-07 | Blast queue tidak mempengaruhi ai-reply latency (load test) |

---

## Dependencies
- FR-WHATSAPP (send message)
- FR-BILLING (plan entitlement check recipient limit)
- FR-NOTIFICATION (alert status campaign)
- BullMQ queue: blast (LOWEST priority)

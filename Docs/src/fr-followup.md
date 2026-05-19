# FR-FOLLOWUP — Follow-up Engine
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Mengatur sistem reminder, tracking, dan manajemen follow-up agar tidak ada lead yang terlewat.

---

## User Stories
| ID | Story |
|---|---|
| US-FU-01 | Sebagai seller, saya ingin diingatkan kapan harus follow-up lead tertentu |
| US-FU-02 | Sebagai seller, saya ingin tahu lead mana yang follow-up-nya sudah overdue |
| US-FU-03 | Sebagai seller, saya ingin bisa snooze follow-up jika sedang tidak bisa handle |
| US-FU-04 | Sebagai seller, saya ingin AI merekomendasikan kapan saya harus follow-up |

---

## Follow-up State Machine

```
PENDING → DUE → OVERDUE → COMPLETED
                        → SNOOZED → PENDING (setelah snooze selesai)
PENDING → CANCELLED
```

---

## Urgency Levels

| Level | Kondisi |
|---|---|
| `LOW` | Follow-up > 3 hari ke depan |
| `MEDIUM` | Follow-up 1–3 hari ke depan |
| `HIGH` | Follow-up hari ini |
| `CRITICAL` | Overdue > 24 jam |

---

## Functional Requirements

### FR-FU-01: Create Follow-up
**Input:** conversation_id, due_at (datetime), reason (text), urgency

**Proses:**
1. Buat `follow_up` record
2. Set status: `PENDING`
3. Schedule notification (WA + in-app) untuk due_at - 30 menit
4. Tampilkan di dashboard follow-up widget

**Business Rules:**
- Satu conversation dapat memiliki banyak follow-up aktif
- Seller dapat buat follow-up dari inbox atau halaman follow-up
- AI dapat suggest follow-up berdasarkan konteks conversation (FR-FU-06)

---

### FR-FU-02: Follow-up Reminder Notification
**Trigger:** due_at - 30 menit

**Notifikasi yang dikirim:**
- WA ke nomor pribadi seller: nama lead + alasan follow-up + deep link
- In-app notification
- Dashboard widget: follow-up muncul di "Hari Ini"

**Jika tidak ada aksi dari seller setelah due_at:**
- Status → `DUE`
- Kirim reminder kedua
- Setelah 24 jam tanpa aksi → status → `OVERDUE`

---

### FR-FU-03: Mark Complete
**Endpoint:** `PATCH /follow-ups/:id/complete`

**Proses:**
1. Set status → `COMPLETED`
2. Catat `completed_at`
3. Hilang dari list aktif (tampil di history)
4. Track di analytics: follow-up completion rate

---

### FR-FU-04: Snooze Follow-up
**Opsi snooze:**
- 1 jam
- Besok (jam yang sama)
- Custom datetime

**Proses:**
1. Set status → `SNOOZED`
2. Catat `snoozed_until`
3. Set ulang reminder ke waktu snooze baru
4. Saat snooze selesai → status kembali ke `PENDING`

---

### FR-FU-05: Overdue Management
**Cron job setiap 30 menit:**
1. Cari follow-up dengan `due_at` < now dan status `DUE`
2. Update status → `OVERDUE`
3. Kirim alert overdue ke seller
4. Prioritize tampil di dashboard (paling atas, highlight merah)

**Business Rules:**
- Overdue > 48 jam → urgency otomatis naik ke `CRITICAL`
- Multiple overdue follow-up → grouped dalam 1 summary notification harian

---

### FR-FU-06: AI Follow-up Recommendation
**Trigger:** AI mendeteksi conversation yang butuh tindak lanjut

**Scenario yang trigger AI recommendation:**
- Lead bilang "pikir-pikir dulu" → suggest follow-up 2 hari
- Lead tidak balas > 48 jam padahal sebelumnya aktif → suggest re-engagement
- Setelah test drive dijadwalkan → suggest day-before reminder

**Proses:**
1. AI detect pattern dalam conversation
2. Tampilkan banner di inbox: "Disarankan: Follow-up pada [tanggal] — [alasan]"
3. Seller dapat accept (langsung buat follow-up) atau dismiss

**Business Rules:**
- Rekomendasi AI tidak membuat follow-up otomatis — butuh konfirmasi seller

---

### FR-FU-07: Follow-up List & Filter
**Halaman:** `/follow-ups`

**Filter:**
- Hari ini / Overdue / Semua / Completed
- Urgency level
- Lead name search

**Tampilan per item:**
- Nama lead
- Alasan follow-up
- Due date & time
- Urgency indicator
- Action buttons: Complete / Snooze / Buka Chat

**Sorting default:** Overdue dulu, lalu urgensi tertinggi, lalu due_at asc

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-FU-01 | Buat follow-up → WA reminder terkirim tepat 30 menit sebelum due |
| AC-FU-02 | Mark complete → hilang dari list aktif dalam < 1 detik |
| AC-FU-03 | Snooze "Besok" → muncul kembali besok di jam yang sama |
| AC-FU-04 | Overdue items selalu di atas list, highlight merah |
| AC-FU-05 | AI recommendation tidak auto-create follow-up tanpa konfirmasi seller |
| AC-FU-06 | Overdue > 24 jam → seller dapat alert |

---

## Dependencies
- FR-INBOX (conversation context)
- FR-NOTIFICATION (WA + in-app alerts)
- FR-DASHBOARD (widget)
- FR-AI (recommendation)
- BullMQ queue: follow-up (MEDIUM)

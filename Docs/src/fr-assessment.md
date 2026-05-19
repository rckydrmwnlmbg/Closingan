# FR-ASSESSMENT — Hot Lead Assessment & Detection
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Mengatur sistem deteksi, klasifikasi, dan pengelolaan hot lead secara realtime berdasarkan sinyal intent pembelian.

---

## User Stories
| ID | Story |
|---|---|
| US-ASSESS-01 | Sebagai seller, saya ingin tahu mana lead yang paling serius hari ini agar bisa fokus ke sana duluan |
| US-ASSESS-02 | Sebagai seller, saya ingin tahu kenapa AI menilai sebuah lead sebagai HOT |
| US-ASSESS-03 | Sebagai seller, saya ingin bisa koreksi kalau AI salah menilai heat level lead |

---

## Heat Tier System

| Tier | Deskripsi | Aksi Otomatis |
|---|---|---|
| `LOW` | Lead baru atau pasif | Tidak ada |
| `WARM` | Ada minat tapi belum kuat | Tidak ada |
| `HOT` | Sinyal intent pembelian kuat | Alert ke seller |
| `CRITICAL` | Sinyal sangat kuat, kemungkinan beli hari ini | Alert urgent ke seller |

---

## Signal Inputs

**Sinyal Pesan (dianalisis oleh AI classifier):**
- Menanyakan harga spesifik
- Menanyakan simulasi kredit / DP / cicilan
- Menanyakan ketersediaan stok
- Menanyakan estimasi delivery / indent
- Meminta test drive
- Menanyakan proses negosiasi / nego harga
- Menggunakan bahasa urgensi ("hari ini", "secepatnya", "minggu ini")
- Menyebut budget spesifik

**Sinyal Perilaku:**
- Frekuensi balas tinggi (< 2 menit antar pesan)
- Aktif berkomunikasi dalam 24 jam terakhir
- Jumlah pesan dalam 1 session > 10
- Engagement setelah lama tidak aktif

**Kombinasi Sinyal → Tier:**
- 1 sinyal lemah → WARM
- 2+ sinyal menengah → HOT
- Sinyal kredit/DP/stok + frekuensi tinggi → CRITICAL

---

## Functional Requirements

### FR-ASSESS-01: Real-time Signal Detection
**Trigger:** Setiap pesan baru dari customer

**Proses:**
1. Analisis pesan dengan AI classifier (lightweight, bukan GPT-4o)
2. Identifikasi signals yang ada
3. Hitung heat score (0–100)
4. Tentukan heat tier berdasarkan score
5. Generate `heat_reasons` array (human-readable)
6. Update `leads.heat_score`, `leads.heat_tier`, `leads.heat_reasons`
7. Jika tier HOT atau CRITICAL → push job ke queue `hot-lead`

**Business Rules:**
- `heat_reasons` tidak boleh kosong jika tier > LOW
- `heat_reasons` harus human-readable: contoh: `["Menanyakan harga", "Balas cepat", "Minta test drive"]`
- Black-box scoring dilarang — setiap score harus bisa dijelaskan

---

### FR-ASSESS-02: Explainability (Anti Black-Box)
Setiap hot lead classification WAJIB disertai label alasan yang dapat dibaca seller.

**Format:**
```
Heat: 🔥 HOT
Alasan: Menanyakan harga · Tanya stok · Aktif hari ini
```

**Business Rules:**
- Seller tidak boleh hanya melihat tier tanpa alasan
- Alasan harus dalam Bahasa Indonesia yang natural
- Max 4 alasan ditampilkan (yang paling signifikan)

---

### FR-ASSESS-03: Seller Override
Seller dapat mengubah heat tier secara manual.

**Aksi yang tersedia:**
- "Mark as HOT" — untuk lead yang seller tahu serius tapi AI belum detect
- "Mark as NOT HOT" — untuk false positive dari AI
- Override tercatat di `lead_overrides` table
- Override tidak mempengaruhi sistem scoring ke depannya (tidak melatih model)

---

### FR-ASSESS-04: Heat Score Decay
Heat score turun otomatis jika tidak ada aktivitas baru dari lead.

**Decay rules:**
- Tidak ada pesan dari lead > 24 jam → score turun 20%
- Tidak ada pesan dari lead > 72 jam → score turun 50%
- Tidak ada pesan dari lead > 7 hari → reset ke LOW

**Business Rules:**
- Decay berjalan via cron job setiap 1 jam
- Seller tidak dapat disable decay
- Jika lead kembali aktif → score di-recalculate dari awal

---

### FR-ASSESS-05: Hot Lead Alert
**Queue:** `hot-lead` (CRITICAL priority)

**Saat tier berubah ke HOT atau CRITICAL:**
1. Kirim WA notification ke nomor pribadi seller:
   - Nama lead
   - Heat tier
   - Heat reasons (max 3)
   - Last message preview
   - Deep link ke conversation
2. Update dashboard widget "Hot Leads Hari Ini"
3. Push WebSocket event `lead:heat_changed`

**Rate limiting:** Max 1 alert per lead per 30 menit (anti-spam seller)

**Business Rules:**
- Alert tier CRITICAL = format berbeda, lebih urgent
- Seller dapat snooze alert per lead dari notification
- Alert tidak dikirim jika seller sudah buka conversation dalam 5 menit terakhir

---

### FR-ASSESS-06: Hot Lead Dashboard Widget
Tampilkan di dashboard:
- Total hot leads hari ini
- List hot leads dengan nama, tier, dan reasons
- Indicator: sudah direspons atau belum
- Klik → buka langsung di inbox

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-ASSESS-01 | Signal terdeteksi → heat tier terupdate dalam < 3 detik |
| AC-ASSESS-02 | Setiap HOT/CRITICAL tier selalu punya heat_reasons yang tidak kosong |
| AC-ASSESS-03 | Alert HOT lead → WA notification ke seller dalam < 15 detik |
| AC-ASSESS-04 | 1 lead tidak dapat trigger > 1 alert per 30 menit |
| AC-ASSESS-05 | Seller override berhasil mengubah tier secara permanen |
| AC-ASSESS-06 | Decay berjalan: lead tidak aktif 24 jam → score turun |

---

## Dependencies
- FR-INBOX (conversation & message data)
- FR-NOTIFICATION (WA alert)
- FR-DASHBOARD (widget update)
- BullMQ queue: hot-lead (CRITICAL)
- Redis (rate limiting alert)

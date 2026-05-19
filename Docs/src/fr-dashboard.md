# FR-DASHBOARD — Dashboard Operasional
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Dashboard adalah halaman utama yang memberikan gambaran situasi operasional seller dalam hitungan detik.

---

## Prinsip Desain Dashboard

> **Glanceability Rule:** Seller harus bisa memahami situasi operasional hari ini dalam < 5 detik setelah membuka dashboard.

- Mobile-first — bisa digunakan sambil jalan
- Tidak ada vanity metrics — hanya yang actionable
- Critical alerts selalu di atas
- Tap widget → navigasi ke halaman terkait

---

## User Stories
| ID | Story |
|---|---|
| US-DASH-01 | Sebagai seller, saya ingin lihat sekilas berapa lead panas hari ini |
| US-DASH-02 | Sebagai seller, saya ingin tahu jika ada lead yang menunggu respons terlalu lama |
| US-DASH-03 | Sebagai seller, saya ingin tahu status AI dan WA saya sebelum mulai kerja |

---

## Functional Requirements

### FR-DASH-01: Sistem Widget Dashboard
Dashboard terdiri dari widget-widget modular. Semua widget load dari endpoint `/dashboard/summary`.

**Performance:** Response < 200ms (Redis cache, TTL 30 detik)

---

### FR-DASH-02: Widget — WhatsApp Connection Status
**Tampilan:**
- Status: CONNECTED (hijau) / DISCONNECTED (merah) / RECONNECTING (kuning)
- Nomor WA yang connected
- Durasi uptime sesi ini

**Business Rules:**
- Update realtime via WebSocket
- Jika DISCONNECTED → tampil tombol "Reconnect"

---

### FR-DASH-03: Widget — AI Status
**Tampilan:**
- AI: ON / OFF
- Mode aktif (global default mode)
- Quota usage: X% terpakai

**Business Rules:**
- Jika quota > 85% → widget berubah warna jadi kuning (warning)
- Jika quota > 95% → widget merah, label "Mode Terbatas"

---

### FR-DASH-04: Widget — Hot Leads Hari Ini
**Tampilan:**
- Counter: jumlah HOT + CRITICAL leads hari ini
- List 3 hot lead teratas: nama, tier, reasons
- Tombol "Lihat Semua" → navigasi ke inbox filtered

**Business Rules:**
- "Hari ini" = reset setiap tengah malam
- Lead yang sudah direspons seller ditandai berbeda
- Klik lead → buka langsung di inbox

---

### FR-DASH-05: Widget — Pending Reply
**Tampilan:**
- Counter: conversation yang customer sudah balas tapi seller/AI belum
- Highlight: conversation yang menunggu > 30 menit
- Lead terlama menunggu (dengan durasi)

**Business Rules:**
- Threshold alert: > 30 menit tanpa respons → highlight merah
- Klik → buka inbox conversation tersebut

---

### FR-DASH-06: Widget — Follow-up Hari Ini
**Tampilan:**
- Counter: total follow-up yang jatuh tempo hari ini
- Sub-counter: berapa yang overdue (highlight merah)
- List 3 follow-up overdue paling urgent

**Business Rules:**
- Tap overdue counter → navigasi ke halaman follow-up filter overdue

---

### FR-DASH-07: Alert Bar — Critical Issues
**Tampil di atas semua widget jika ada:**
- Escalation yang belum di-resolve
- WA disconnect
- Quota dalam grace buffer
- Follow-up overdue > 48 jam

**Prioritas tampil:** hanya 1 alert bar (yang paling kritis)
**Interaksi:** tap alert → navigasi ke area terkait. Dapat dismiss (tidak permanen)

---

### FR-DASH-08: Daily Greeting & Context
**Tampilan:**
- Salam berdasarkan waktu (pagi/siang/sore/malam)
- Nama seller
- Hari dan tanggal

---

### FR-DASH-09: Cache & Refresh
- Dashboard data di-cache di Redis (TTL 30 detik)
- Cache invalidated saat: pesan baru masuk, heat berubah, follow-up dibuat/selesai
- Realtime update via WebSocket untuk perubahan kritis
- Auto-refresh setiap 30 detik sebagai fallback

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-DASH-01 | Dashboard load < 200ms (p95) |
| AC-DASH-02 | Semua 6 widget tampil di layar 375px tanpa scroll horizontal |
| AC-DASH-03 | Hot lead baru → dashboard update dalam < 30 detik |
| AC-DASH-04 | WA disconnect → alert bar muncul dalam < 2 menit |
| AC-DASH-05 | Tap widget → navigasi ke halaman yang benar |
| AC-DASH-06 | Quota > 85% → AI status widget berubah kuning |

---

## Dependencies
- FR-WHATSAPP (WA connection status)
- FR-AI (AI status & quota)
- FR-ASSESSMENT (hot lead data)
- FR-INBOX (pending reply)
- FR-FOLLOWUP (follow-up data)
- Redis (cache)
- WebSocket (realtime updates)

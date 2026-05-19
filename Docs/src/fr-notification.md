# FR-NOTIF — Notification System
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Modul notifikasi mengatur semua komunikasi sistem ke seller melalui WhatsApp pribadi dan email. Dirancang untuk informatif tanpa menjadi spam — setiap notifikasi harus actionable dan memiliki rate limiting.

---

## Functional Requirements

### Jenis Notifikasi

| ID | Requirement | Priority |
|---|---|---|
| FR-NOTIF-001 | Hot lead alert: WA ke nomor pribadi saat lead terklasifikasi HOT/CRITICAL | P0 |
| FR-NOTIF-002 | Escalation alert: WA + dashboard alert saat AI trigger escalation | P0 |
| FR-NOTIF-003 | WA disconnect alert: WA + dashboard saat koneksi WA terputus | P0 |
| FR-NOTIF-004 | Quota warning: email + in-app di threshold 70%, 85%, 95% | P0 |
| FR-NOTIF-005 | Follow-up due: WA saat follow-up jatuh tempo | P0 |
| FR-NOTIF-006 | Trial expiry reminder: email di hari ke-5 dan ke-7 | P0 |
| FR-NOTIF-007 | Payment reminder: email saat invoice jatuh tempo | P0 |
| FR-NOTIF-008 | Daily digest (07:30 WIB): WA dengan summary hot leads + follow-up hari ini | P1 |
| FR-NOTIF-009 | Weekly summary (Senin 08:00): statistik minggu lalu vs minggu ini | P2 |
| FR-NOTIF-010 | Idle alert: jika tidak ada login > 3 hari → WA pengingat | P2 |
| FR-NOTIF-011 | Achievement notification: milestone tertentu (50 lead direspons, dll) | P2 |

### Format Notifikasi

| ID | Requirement | Priority |
|---|---|---|
| FR-NOTIF-012 | Hot lead WA format: nama lead + heat tier + heat reasons + deep link | P0 |
| FR-NOTIF-013 | Escalation WA format: nama lead + jenis escalation + deep link | P0 |
| FR-NOTIF-014 | Semua WA notification menggunakan nomor founder/sistem (bukan nomor WA Business user) | P0 |
| FR-NOTIF-015 | Deep link di notifikasi membuka conversation langsung (tidak hanya buka app) | P1 |

### Rate Limiting Notifikasi

| ID | Requirement | Priority |
|---|---|---|
| FR-NOTIF-016 | Hot lead alert: maksimal 1 alert per lead per 30 menit | P0 |
| FR-NOTIF-017 | Quota threshold: hanya trigger 1x per billing cycle per threshold | P0 |
| FR-NOTIF-018 | Daily digest: tepat 1x per hari (tidak lebih dari 07:35 WIB) | P1 |
| FR-NOTIF-019 | Idle alert: tidak dikirim ke user yang sudah disable notifikasi | P1 |

### Preferensi Notifikasi

| ID | Requirement | Priority |
|---|---|---|
| FR-NOTIF-020 | User dapat disable/enable notifikasi per kategori di Settings | P1 |
| FR-NOTIF-021 | Kategori toggle: Hot Lead Alert, Escalation, Daily Digest, Weekly Summary, Idle Alert | P1 |
| FR-NOTIF-022 | Escalation alert TIDAK bisa di-disable (safety requirement) | P0 |
| FR-NOTIF-023 | WA disconnect alert TIDAK bisa di-disable | P0 |

### System Alerts (Founder)

| ID | Requirement | Priority |
|---|---|---|
| FR-NOTIF-024 | Alert ke founder jika: error rate > 5% dalam 5 menit | P0 |
| FR-NOTIF-025 | Alert ke founder jika: queue stuck > 10 menit | P0 |
| FR-NOTIF-026 | Alert ke founder jika: AI failure rate > 10% | P0 |
| FR-NOTIF-027 | Alert ke founder jika: DLQ accumulate > 10 job dalam 1 jam | P1 |
| FR-NOTIF-028 | Alert ke founder: daily summary at-risk users (churn signals) | P1 |

---

## Acceptance Criteria

- [ ] Hot lead HOT → WA notification dalam < 15 detik
- [ ] Escalation triggered → WA notification dalam < 30 detik
- [ ] WA disconnect → notification dalam < 2 menit
- [ ] Sama satu lead tidak bisa trigger lebih dari 1 hot lead alert per 30 menit
- [ ] User disable daily digest → digest tidak terkirim
- [ ] Escalation alert tidak bisa di-disable (test: toggle tidak ada di Settings)
- [ ] Daily digest tepat jam 07:30 WIB (toleransi 5 menit)

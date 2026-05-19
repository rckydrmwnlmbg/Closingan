# FR-BILL — Billing & Subscription
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Modul billing mengatur seluruh aspek keuangan: langganan, trial, pembayaran, quota AI, dan upsell. Dirancang dengan prinsip idempotency — setiap operasi pembayaran aman dijalankan dua kali tanpa efek ganda.

---

## Functional Requirements

### Trial System

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-001 | Trial 7 hari otomatis aktif setelah WA berhasil connected + OTP verified | P0 |
| FR-BILL-002 | Trial TIDAK aktif saat register — harus connect WA dulu | P0 |
| FR-BILL-003 | 1 nomor WA Business = 1 lifetime trial (anti-abuse via hash) | P0 |
| FR-BILL-004 | Nomor WA yang sama coba trial lagi → ditolak dengan pesan jelas | P0 |
| FR-BILL-005 | Email reminder di hari ke-5 trial | P0 |
| FR-BILL-006 | Email reminder di hari ke-7 trial (hari terakhir) | P0 |
| FR-BILL-007 | Trial expire → state berubah ke PAST_DUE, AI dinonaktifkan | P0 |
| FR-BILL-008 | User yang signup dengan referral code mendapat trial 14 hari | P1 |

### Subscription Plans

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-009 | Tiga plan tersedia: STARTER, PRO, ELITE | P0 |
| FR-BILL-010 | Subscription states: TRIAL → ACTIVE → PAST_DUE → SUSPENDED → CANCELLED | P0 |
| FR-BILL-011 | Payment gagal → PAST_DUE setelah grace period 3 hari | P0 |
| FR-BILL-012 | PAST_DUE > 7 hari → SUSPENDED (akses dibatasi, data tetap ada) | P0 |
| FR-BILL-013 | User cancel → akses aktif sampai akhir billing period | P0 |
| FR-BILL-014 | Quota reset setiap anniversary billing (bukan tanggal 1 bulan) | P0 |
| FR-BILL-015 | Setiap subscription transition di-log ke audit_logs | P0 |

### Payment Processing

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-016 | Integrasi payment gateway dengan abstraction layer | P0 |
| FR-BILL-017 | Webhook payment divalidasi signature sebelum diproses | P0 |
| FR-BILL-018 | Double payment untuk invoice yang sama tidak diproses (idempotent) | P0 |
| FR-BILL-019 | Email receipt terkirim setelah payment confirmed | P0 |
| FR-BILL-020 | Invoice history bisa didownload oleh user | P1 |

### Plan Entitlement

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-021 | Setiap fitur punya entitlement check berdasarkan plan aktif | P0 |
| FR-BILL-022 | User akses fitur di luar plan → 403 dengan pesan upgrade yang jelas | P0 |
| FR-BILL-023 | SUSPENDED state → AI nonaktif, inbox tetap bisa dibuka | P0 |
| FR-BILL-024 | Entitlement check tidak menambah latency > 5ms | P1 |

### Quota & AI Credit

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-025 | AI usage di-track realtime per tenant via Redis counter | P0 |
| FR-BILL-026 | Warning threshold 70%: notifikasi email + in-app | P0 |
| FR-BILL-027 | Warning threshold 85%: warning urgent + soft upsell banner | P0 |
| FR-BILL-028 | Warning threshold 95%: pause queue summary, analytics, blast | P0 |
| FR-BILL-029 | Grace buffer 5%: hanya proses hot-lead, ai-reply, escalation | P0 |
| FR-BILL-030 | Setiap threshold hanya trigger notifikasi 1x per billing cycle | P0 |
| FR-BILL-031 | AI Credit add-on bisa dibeli kapan saja | P1 |
| FR-BILL-032 | Credit add-on langsung aktif setelah payment confirmed | P1 |
| FR-BILL-033 | Credit add-on tidak carry-over ke bulan berikutnya | P1 |
| FR-BILL-034 | Setelah topup → queue yang di-pause resume otomatis | P1 |

### Upsell

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-035 | Upsell contextual berdasarkan situasi user (quota, traffic, fitur) | P1 |
| FR-BILL-036 | Upsell tampil maksimal 1x per 48 jam per user | P1 |
| FR-BILL-037 | User yang baru upgrade tidak dapat upsell 30 hari | P1 |
| FR-BILL-038 | Upsell tampil sebagai dismissible banner, BUKAN blocking popup | P1 |

### Billing UI

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-039 | Halaman Billing menampilkan plan aktif + tanggal renewal | P0 |
| FR-BILL-040 | Usage bar AI Credit (terpakai vs total) di halaman Billing | P0 |
| FR-BILL-041 | PAST_DUE: banner merah tidak dismissible dengan tombol bayar | P0 |
| FR-BILL-042 | Modal upgrade menampilkan perbandingan semua plan | P1 |

---

## Acceptance Criteria

- [ ] Trial aktif setelah WA connect, bukan saat register
- [ ] Nomor WA yang sama coba trial lagi → ditolak
- [ ] Payment sandbox end-to-end: invoice → bayar → subscription aktif
- [ ] Webhook invalid → rejected 401
- [ ] 95% quota → blast queue paused (verifikasi di Bull Board)
- [ ] Topup credit → queue resume otomatis dalam < 30 detik
- [ ] Upsell tidak muncul lebih dari 1x per 48 jam

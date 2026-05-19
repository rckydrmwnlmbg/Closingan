# FR-ANA — Analytics & Reporting
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Modul analytics menyediakan data performa operasional sales dan bisnis. Terbagi menjadi dua layer: **Seller Analytics** (untuk user) dan **Business Analytics** (untuk founder/admin).

---

## Functional Requirements

### Product Event Tracking

| ID | Requirement | Priority |
|---|---|---|
| FR-ANA-001 | Sistem mencatat setiap aksi user ke tabel `analytics_events` | P0 |
| FR-ANA-002 | Event wajib: inbox_opened, message_sent_manual, message_sent_ai, ai_mode_changed | P0 |
| FR-ANA-003 | Event wajib: hot_lead_viewed, follow_up_created, follow_up_completed | P0 |
| FR-ANA-004 | Event wajib: campaign_created, campaign_approved, campaign_sent | P1 |
| FR-ANA-005 | Event wajib: upgrade_prompt_viewed, upgrade_completed | P1 |
| FR-ANA-006 | Event wajib: session_started, session_ended | P0 |
| FR-ANA-007 | Tracking menggunakan event queue — tidak menambah latency ke user-facing ops | P0 |
| FR-ANA-008 | Semua event ter-scope ke tenant_id | P0 |

### Seller Performance Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-ANA-009 | Tampilkan rata-rata response time ke lead (dalam menit) | P1 |
| FR-ANA-010 | Tampilkan jumlah lead direspons hari ini vs kemarin | P1 |
| FR-ANA-011 | Tampilkan hot lead conversion rate (% yang di-follow-up dalam 1 jam) | P1 |
| FR-ANA-012 | Tampilkan follow-up completion rate | P1 |
| FR-ANA-013 | Tampilkan AI vs manual reply ratio | P1 |
| FR-ANA-014 | Semua metrik tersedia dalam range: 7 hari dan 30 hari | P1 |
| FR-ANA-015 | Data analytics di-pre-compute (bukan realtime query berat) | P1 |
| FR-ANA-016 | Metrik bisa di-export sebagai CSV | P2 |

### AI Performance Monitoring (Admin)

| ID | Requirement | Priority |
|---|---|---|
| FR-ANA-017 | Tampilkan AI reply success rate per hari | P1 |
| FR-ANA-018 | Tampilkan AI escalation rate | P1 |
| FR-ANA-019 | Tampilkan AI response latency (p50, p95, p99) | P1 |
| FR-ANA-020 | Tampilkan AI safety block rate | P0 |
| FR-ANA-021 | Tampilkan top escalation reasons | P1 |
| FR-ANA-022 | Alert jika escalation rate > 20% dalam 1 jam | P0 |
| FR-ANA-023 | Alert jika safety block rate > 5% | P0 |

### Business Metrics (Founder Admin)

| ID | Requirement | Priority |
|---|---|---|
| FR-ANA-024 | Tampilkan MRR realtime | P1 |
| FR-ANA-025 | Tampilkan trial-to-paid conversion rate per kohort minggu | P1 |
| FR-ANA-026 | Tampilkan churn rate bulan ini vs bulan lalu | P1 |
| FR-ANA-027 | Tampilkan Daily Active Tenants (DAT) | P1 |
| FR-ANA-028 | Tampilkan new signups per hari (grafik 30 hari) | P1 |
| FR-ANA-029 | Tampilkan AI Credit add-on revenue | P1 |
| FR-ANA-030 | Tampilkan plan distribution (Starter/Pro/Elite %) | P1 |
| FR-ANA-031 | Data di-cache setiap 1 jam | P1 |

### Funnel & Cohort

| ID | Requirement | Priority |
|---|---|---|
| FR-ANA-032 | Track funnel: Landing → Signup → WA Connect → First AI Reply → Day-7 Active → Paid | P1 |
| FR-ANA-033 | Cohort retention curve: minggu ke-1, 2, 4, 8 | P1 |
| FR-ANA-034 | UTM parameter tracking dari source traffic | P2 |

---

## Non-Functional Requirements

- Analytics dashboard load < 1 detik (data pre-computed)
- Raw events retention: 30 hari
- Aggregated data retention: 90 hari
- Business analytics hanya accessible oleh ADMIN role

---

## Acceptance Criteria

- [ ] Semua 14 event ter-track saat user melakukan aksi yang relevan
- [ ] Tracking tidak menambah latency > 10ms ke endpoint utama
- [ ] Seller dashboard load < 1 detik
- [ ] Business dashboard tidak accessible oleh non-admin (test dengan regular JWT)
- [ ] AI safety block rate alert berfungsi (test dengan mock threshold)

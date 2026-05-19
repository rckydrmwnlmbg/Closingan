# FR-SEC — Security & Anti-Abuse
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Modul keamanan mencakup semua lapisan proteksi: isolasi data multi-tenant, validasi input, pencegahan abuse, dan monitoring anomali. Security adalah requirement P0 yang tidak bisa dikompromikan.

---

## Functional Requirements

### Multi-Tenant Data Isolation

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-001 | Semua tabel database memiliki kolom tenant_id | P0 |
| FR-SEC-002 | Semua query otomatis ter-scope ke tenant_id dari JWT (via Prisma extension) | P0 |
| FR-SEC-003 | User tidak bisa akses data tenant lain melalui API apapun | P0 |
| FR-SEC-004 | tenant_id tidak bisa dimanipulasi dari request body, query param, atau header | P0 |
| FR-SEC-005 | Automated test cross-tenant isolation wajib ada dan dijalankan di CI | P0 |

### Authentication Security

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-006 | JWT secret berbeda untuk access token dan refresh token | P0 |
| FR-SEC-007 | Refresh token rotation: token lama invalid setelah digunakan | P0 |
| FR-SEC-008 | Brute force protection: lock 30 menit setelah 5x login gagal | P1 |
| FR-SEC-009 | Password di-hash dengan bcrypt (cost factor ≥ 12) | P0 |
| FR-SEC-010 | Tidak ada plain-text password di database atau log | P0 |

### Input Validation & Injection Prevention

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-011 | Semua input user divalidasi dengan class-validator sebelum diproses | P0 |
| FR-SEC-012 | Tidak ada raw user input yang masuk ke query database tanpa sanitasi | P0 |
| FR-SEC-013 | SQL injection prevention via Prisma parameterized queries | P0 |
| FR-SEC-014 | XSS prevention: output di-escape di frontend | P0 |
| FR-SEC-015 | Prompt injection prevention: user input ke AI di-sanitasi | P0 |

### API Security

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-016 | Rate limiting aktif di semua public endpoint (100 req/menit per IP default) | P0 |
| FR-SEC-017 | CORS dikonfigurasi dengan domain whitelist, bukan wildcard | P0 |
| FR-SEC-018 | Security headers (helmet): X-Frame-Options, CSP, HSTS, dll | P0 |
| FR-SEC-019 | HTTPS enforced di semua endpoint production | P0 |
| FR-SEC-020 | Webhook endpoint validasi signature sebelum proses | P0 |

### Sensitive Data Protection

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-021 | API keys, secrets, dan credentials tidak boleh masuk ke log | P0 |
| FR-SEC-022 | Data sensitif di-enkripsi at rest (AES-256) | P0 |
| FR-SEC-023 | WA session token per tenant disimpan terenkripsi | P0 |
| FR-SEC-024 | Backup database dienkripsi sebelum upload ke cloud storage | P1 |

### Anti-Abuse System

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-025 | Deteksi multi-account: 3+ akun dari fingerprint yang sama dalam 24 jam → flag | P1 |
| FR-SEC-026 | Deteksi IP abuse: 3+ akun dari IP yang sama dalam 24 jam → CAPTCHA | P1 |
| FR-SEC-027 | Block email disposable saat registrasi | P1 |
| FR-SEC-028 | 1 WA Business number = 1 lifetime trial (hash-based) | P0 |
| FR-SEC-029 | Flagged account masuk review queue untuk founder (tidak auto-ban) | P1 |

### Fair Usage Monitoring

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-030 | Flag jika AI call rate > 10x rata-rata plan dalam 1 jam | P1 |
| FR-SEC-031 | Flag jika campaign blast ke nomor yang sama > 3x dalam 7 hari | P1 |
| FR-SEC-032 | Flag jika login dari > 5 lokasi berbeda dalam 1 hari | P1 |
| FR-SEC-033 | Alert ke founder dengan detail anomali untuk setiap flag | P1 |

### Audit Logging

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-034 | Semua aksi kritis dicatat ke audit_logs: login, logout, WA connect/disconnect, AI mode change, billing event, data export | P0 |
| FR-SEC-035 | Audit log tidak bisa dihapus oleh user biasa | P0 |
| FR-SEC-036 | Audit log menyimpan: user_id, tenant_id, action, entity, metadata, IP, timestamp | P0 |
| FR-SEC-037 | Audit log bisa di-query oleh admin untuk investigasi | P1 |

### Trust-Critical Blockers (Hard NO-GO)

Hal berikut adalah kondisi yang **secara otomatis membatalkan launch / release**:

| ID | Kondisi | Aksi |
|---|---|---|
| FR-SEC-038 | Duplicate pesan terkirim ke customer | IMMEDIATE ROLLBACK |
| FR-SEC-039 | Cross-tenant data leakage terbukti | IMMEDIATE ROLLBACK |
| FR-SEC-040 | False paid access (trial user dapat fitur berbayar) | IMMEDIATE ROLLBACK |
| FR-SEC-041 | AI menghasilkan klaim finansial tanpa escalation | IMMEDIATE ROLLBACK |
| FR-SEC-042 | Hidden autonomous AI behavior | IMMEDIATE ROLLBACK |
| FR-SEC-043 | Broken unsubscribe/suppression enforcement | IMMEDIATE ROLLBACK |

---

## Acceptance Criteria

- [ ] Cross-tenant test: User A tidak bisa baca data User B via API (automated)
- [ ] 5x login gagal → account locked 30 menit
- [ ] Webhook invalid signature → rejected 401
- [ ] Semua aksi kritis muncul di audit_logs
- [ ] 3 register dari IP yang sama → CAPTCHA triggered
- [ ] Disposable email ditolak saat registrasi
- [ ] Security audit: tidak ada temuan CRITICAL atau HIGH

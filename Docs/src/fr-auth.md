# FR-AUTH — Authentication & User Management
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Mengatur autentikasi, manajemen sesi, dan keamanan akses pengguna.

---

## User Stories
| ID | Story |
|---|---|
| US-AUTH-01 | Sebagai sales baru, saya ingin mendaftar dengan email agar bisa mulai menggunakan CLOSINGAN |
| US-AUTH-02 | Sebagai seller, saya ingin login dengan aman agar tidak ada orang lain yang bisa akses akun saya |
| US-AUTH-03 | Sebagai seller, saya ingin tetap login meski menutup browser |
| US-AUTH-04 | Sebagai seller, saya ingin reset password jika lupa |

---

## Functional Requirements

### FR-AUTH-01: Registrasi Akun
**Input:** Nama, Email, Password, Persetujuan ToS
**Proses:**
1. Validasi format email dan keunikan
2. Deteksi disposable email → reject jika ditemukan
3. Hash password bcrypt (cost factor 12)
4. Buat tenant + user record
5. Generate OTP 6 digit → kirim ke email
6. Set akun: `PENDING_VERIFICATION`

**Business Rules:**
- 1 email = 1 akun (tidak bisa duplikat)
- Akun tidak aktif sebelum OTP diverifikasi
- Disposable email (mailinator, guerrillamail, dll) ditolak

---

### FR-AUTH-02: Verifikasi OTP Email
**Input:** OTP 6 digit
**Proses:** Validasi OTP → jika valid, aktifkan akun → jika salah 3x, lockout 15 menit

**Business Rules:**
- OTP expire: 10 menit
- Max attempt: 3x sebelum lockout
- OTP lama invalid setelah resend

---

### FR-AUTH-03: Login
**Input:** Email, Password
**Output:** `{ access_token (15 mnt), refresh_token (7 hari) }`

**Business Rules:**
- Akun `PENDING_VERIFICATION` tidak bisa login
- Akun `SUSPENDED` → ditolak dengan pesan informatif
- Catat IP dan timestamp setiap login sukses
- Alert ke founder jika login dari >5 lokasi berbeda dalam 24 jam

---

### FR-AUTH-04: Refresh Token
**Business Rules:**
- Single-use — invalid setelah dipakai (rotation)
- Jika invalid → force logout

---

### FR-AUTH-05: Logout
Hapus refresh token dari database + clear Redis session.

---

### FR-AUTH-06: Forgot Password
1. User input email → kirim reset link (expire 30 menit)
2. User klik link → form password baru → invalidasi semua refresh token

**Business Rules:**
- Response selalu sama meski email tidak terdaftar (anti-enumeration)
- Token single-use, expire 30 menit

---

### FR-AUTH-07: Change Password
Input: password lama + baru. Validasi lama → simpan baru → invalidasi semua sesi → kirim email notifikasi.

---

### FR-AUTH-08: Anti-Abuse Registrasi
- 3+ akun dari IP yang sama dalam 24 jam → CAPTCHA wajib
- 3+ akun dari device fingerprint yang sama → flag untuk review (bukan auto-ban)

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-AUTH-01 | Register → OTP terkirim < 30 detik |
| AC-AUTH-02 | OTP salah 3x → locked 15 menit |
| AC-AUTH-03 | Access token expire tepat 15 menit |
| AC-AUTH-04 | Refresh token dipakai 2x → ke-2 ditolak |
| AC-AUTH-05 | Disposable email → ditolak dengan pesan jelas |
| AC-AUTH-06 | Forgot password → response sama meski email tidak ada |

---

## Dependencies
- Email service (SMTP)
- Redis (session & OTP)
- PostgreSQL (user & tenant data)

# FR-SET — Settings & Configuration
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Modul settings memungkinkan seller mengkonfigurasi semua aspek produk sesuai kebutuhan operasional mereka: koneksi WA, mode AI default, notifikasi, billing, dan preferensi tampilan.

---

## Functional Requirements

### Settings WhatsApp Connection

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-001 | Halaman Settings > WA Connection menampilkan status koneksi realtime | P0 |
| FR-SET-002 | Tampilkan nomor dan nama WA Business yang terconnect | P0 |
| FR-SET-003 | Tombol Disconnect WA dengan konfirmasi dialog | P0 |
| FR-SET-004 | Form input Fonnte API token untuk connect nomor baru | P0 |
| FR-SET-005 | Status koneksi update otomatis setiap 10 detik (polling) | P0 |
| FR-SET-006 | Form input nomor WA pribadi untuk notifikasi sistem | P0 |
| FR-SET-007 | Verifikasi nomor WA pribadi sebelum digunakan untuk notifikasi | P1 |

### Settings AI

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-008 | User dapat set AI mode default untuk semua conversation baru | P0 |
| FR-SET-009 | User dapat set human takeover cooldown (default: 15 menit, min: 5, max: 60) | P1 |
| FR-SET-010 | User dapat upload product knowledge base (teks singkat tentang produk yang dijual) | P1 |
| FR-SET-011 | User dapat set bahasa utama percakapan (Indonesia / Mix Inggris-Indonesia) | P2 |
| FR-SET-012 | Preview cara AI memperkenalkan diri berdasarkan profil | P2 |

### Settings Notifikasi

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-013 | Toggle per kategori notifikasi: Hot Lead, Daily Digest, Weekly Summary, Idle Alert | P1 |
| FR-SET-014 | Set waktu daily digest (default: 07:30 WIB) | P2 |
| FR-SET-015 | Escalation dan WA Disconnect alert tidak bisa di-toggle (fixed ON) | P0 |

### Settings Billing

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-016 | Lihat plan aktif dan tanggal renewal | P0 |
| FR-SET-017 | Lihat usage AI Credit bulan ini | P0 |
| FR-SET-018 | Tombol upgrade plan dengan modal perbandingan plan | P1 |
| FR-SET-019 | Tombol beli AI Credit add-on | P1 |
| FR-SET-020 | Download invoice history | P1 |
| FR-SET-021 | Tombol cancel subscription dengan exit survey | P1 |

### Settings Profil

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-022 | Edit nama, foto, nama dealer, kota, brand yang dijual | P0 |
| FR-SET-023 | Ubah password (butuh password lama) | P0 |
| FR-SET-024 | Ubah email dengan OTP verification | P1 |
| FR-SET-025 | Hapus akun dengan konfirmasi 2 langkah | P2 |

### Settings Campaign / Outreach

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-026 | Manage suppression list: lihat, tambah manual, hapus, export CSV | P1 |
| FR-SET-027 | Set business hours default untuk campaign (default: 08:00–21:00 WIB) | P1 |
| FR-SET-028 | Lihat dan manage quick reply templates | P1 |

### Settings Referral

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-029 | Tampilkan referral code unik user | P1 |
| FR-SET-030 | Tampilkan status setiap referral (SIGNED_UP / TRIAL_ACTIVE / CONVERTED) | P1 |
| FR-SET-031 | Tampilkan reward yang sudah diterima | P1 |

---

## Acceptance Criteria

- [ ] Disconnect WA → status berubah dalam < 30 detik
- [ ] Ganti AI mode default → conversation baru menggunakan mode baru
- [ ] Toggle notifikasi tersimpan dan berlaku segera
- [ ] Escalation alert toggle tidak muncul di Settings (tetap ON)
- [ ] Ubah email → OTP required, email lama tidak bisa login lagi
- [ ] Suppression list export menghasilkan CSV yang valid

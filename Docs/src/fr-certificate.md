# FR-CERT — Seller Profile & Verification
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Modul ini mengatur profil seller, verifikasi identitas, dan kredensial yang ditampilkan dalam produk. Profil yang lengkap meningkatkan kepercayaan customer dan memungkinkan fitur personalisasi AI yang lebih baik.

---

## Functional Requirements

### Profil Seller

| ID | Requirement | Priority |
|---|---|---|
| FR-CERT-001 | Seller dapat mengisi profil: nama lengkap, foto, nomor telepon pribadi, nama dealer/showroom | P0 |
| FR-CERT-002 | Nama dan dealer digunakan sebagai context AI saat generate reply | P0 |
| FR-CERT-003 | Foto profil di-upload dan di-resize otomatis (max 500KB) | P1 |
| FR-CERT-004 | Seller dapat mengisi deskripsi singkat tentang diri (maks 200 karakter) | P1 |
| FR-CERT-005 | Profil lengkap ditandai dengan badge "Profil Lengkap" di dashboard | P2 |

### Verifikasi Nomor WhatsApp

| ID | Requirement | Priority |
|---|---|---|
| FR-CERT-006 | Nomor WA Business wajib di-verify sebelum trial aktif | P0 |
| FR-CERT-007 | Verifikasi dilakukan melalui proses connect Fonnte yang valid | P0 |
| FR-CERT-008 | Nomor WA yang ter-verify disimpan sebagai hash untuk anti-abuse trial | P0 |
| FR-CERT-009 | Seller dapat mengganti nomor WA Business, tapi trial tidak bisa diulang | P0 |

### Verifikasi Email

| ID | Requirement | Priority |
|---|---|---|
| FR-CERT-010 | Email ter-verify ditampilkan dengan badge verified di profil | P1 |
| FR-CERT-011 | Email dapat diubah dengan re-verification OTP | P1 |
| FR-CERT-012 | Perubahan email di-log ke audit_logs | P1 |

### Seller Credentials & Badge

| ID | Requirement | Priority |
|---|---|---|
| FR-CERT-013 | Badge "Early Adopter" untuk user yang join di bulan pertama launch | P2 |
| FR-CERT-014 | Badge "Early Contributor" untuk user yang aktif memberikan AI feedback | P2 |
| FR-CERT-015 | Badge "Pro User" untuk user yang sudah aktif > 6 bulan | P2 |
| FR-CERT-016 | Badge ditampilkan di halaman profil, tidak di inbox | P2 |

### Informasi Dealer / Showroom

| ID | Requirement | Priority |
|---|---|---|
| FR-CERT-017 | Seller dapat mengisi nama dealer, kota, dan brand yang dijual | P1 |
| FR-CERT-018 | Brand yang dijual (Toyota, Honda, dll) digunakan sebagai context AI catalog | P1 |
| FR-CERT-019 | Kota digunakan untuk OTR price context dalam AI reply | P1 |

### AI Personalization Context

| ID | Requirement | Priority |
|---|---|---|
| FR-CERT-020 | Nama seller digunakan AI dalam sapaan: "Halo, saya [Nama] dari [Dealer]" | P0 |
| FR-CERT-021 | Brand dan kota digunakan AI untuk menyesuaikan informasi produk | P1 |
| FR-CERT-022 | Seller dapat preview bagaimana AI akan memperkenalkan diri | P2 |

### Privacy & Data

| ID | Requirement | Priority |
|---|---|---|
| FR-CERT-023 | Seller dapat menghapus foto profil kapan saja | P1 |
| FR-CERT-024 | Data profil tidak pernah dibagikan ke tenant lain | P0 |
| FR-CERT-025 | Nomor WA pribadi (notification number) tidak ditampilkan ke customer | P0 |

---

## Acceptance Criteria

- [ ] Profil dengan nama dan dealer tersimpan → AI langsung pakai dalam reply berikutnya
- [ ] Ubah email → OTP verification required
- [ ] Nomor WA pribadi tidak pernah muncul di conversation thread dengan customer
- [ ] Foto profil di-resize otomatis ke < 500KB
- [ ] Badge criteria berfungsi dan tampil di halaman profil

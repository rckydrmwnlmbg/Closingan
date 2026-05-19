# FR-CATALOG — Product Catalog
**CLOSINGAN SRS v1.0** | Owner: Ricky Darmawan Lambogo

---

## Overview
Product catalog menyimpan referensi produk mobil yang dijual seller. Digunakan sebagai konteks oleh AI agar hanya memberi informasi yang valid dan akurat.

---

## User Stories
| ID | Story |
|---|---|
| US-CAT-01 | Sebagai seller, saya ingin input daftar mobil yang saya jual agar AI tahu produk apa yang bisa diinfokan |
| US-CAT-02 | Sebagai seller, saya ingin AI tidak menyebut mobil atau harga yang tidak ada di catalog saya |
| US-CAT-03 | Sebagai seller, saya ingin update catalog dengan mudah ketika ada produk baru atau harga berubah |

---

## Functional Requirements

### FR-CAT-01: Manajemen Catalog
**Endpoint:** `POST/GET/PATCH/DELETE /catalog/products`

**Field per produk:**
- `name` — nama mobil (contoh: Toyota Avanza G)
- `brand` — merek (Toyota, Honda, dll)
- `type` — tipe (MPV, SUV, Sedan, dll)
- `variant` — varian (G, V, E, dll)
- `year` — tahun
- `color_options` — array warna tersedia
- `price_range` — harga dari-sampai (bukan angka pasti)
- `stock_status` — AVAILABLE / INDENT / OUT_OF_STOCK
- `stock_notes` — catatan stok (contoh: "Putih indent 2 minggu")
- `features` — fitur unggulan (array)
- `promo` — info promo aktif (text, bukan angka kredit)
- `is_active` — apakah produk aktif di catalog
- `updated_at` — kapan terakhir diupdate

**Business Rules:**
- Catalog adalah per tenant (setiap seller punya catalog sendiri)
- AI hanya menggunakan informasi dari catalog yang `is_active: true`
- Seller wajib punya minimal 1 produk aktif untuk AI bisa beroperasi

---

### FR-CAT-02: Price Range (Bukan Harga Pasti)
**Penting:** Catalog menyimpan `price_range` (contoh: "Rp 265–275 juta") bukan harga pasti.

**Alasan:**
- Harga OTR bervariasi per lokasi dan dealer
- Hindari AI menyebut harga yang sudah tidak akurat
- Compliance: AI tidak boleh "menjanjikan" harga tertentu

**Business Rules:**
- AI menyebut range harga dari catalog, selalu dengan disclaimer: "tergantung lokasi dan promo"
- Jika price_range kosong → AI tidak menyebut harga, minta customer hubungi seller langsung

---

### FR-CAT-03: AI Context Integration
**Setiap AI reply generation, AI menerima:**
```json
{
  "available_products": [...catalog items dengan is_active: true],
  "active_promos": [...promo dari catalog],
  "instruction": "Hanya informasikan produk dari catalog ini. Jangan improvise produk atau harga yang tidak ada."
}
```

**Business Rules:**
- AI tidak boleh menyebut produk yang tidak ada di catalog
- AI tidak boleh menyebut fitur yang tidak ada di catalog produk tersebut
- Jika customer tanya produk yang tidak ada → AI jujur bahwa produk tersebut tidak tersedia, tawarkan alternatif dari catalog

---

### FR-CAT-04: Stok Management
**Status stok:** AVAILABLE / INDENT / OUT_OF_STOCK

**Behavior AI berdasarkan stok:**
- AVAILABLE → AI dapat informasikan tersedia
- INDENT → AI informasikan indent + estimasi waktu jika ada
- OUT_OF_STOCK → AI informasikan tidak tersedia, tawarkan alternatif

**Business Rules:**
- Seller wajib update stok secara manual
- Sistem tidak auto-update stok (tidak terintegrasi DMS dealer)
- Jika stok OUT_OF_STOCK lebih dari 30 hari → reminder ke seller untuk update atau deactivate

---

### FR-CAT-05: Catalog Import via CSV
Seller dapat upload CSV untuk import banyak produk sekaligus.

**Format CSV:** nama, brand, type, variant, year, price_range, stock_status, features (semicolon-separated)

**Validasi:**
- Baris dengan data tidak lengkap → skip dengan error report
- Duplikat produk (nama + variant + year sama) → tanya seller: update atau skip

---

### FR-CAT-06: Promo Management
Seller dapat tambah promo aktif yang boleh di-informasikan AI.

**Field promo:**
- `title` — nama promo
- `description` — detail promo (text, tanpa angka kredit)
- `valid_until` — tanggal berakhir
- `applicable_products` — array product_id atau "ALL"

**Business Rules:**
- Promo expired → AI tidak menyebutnya lagi
- Promo yang tidak ada di sini → AI tidak boleh menyebutnya meski diminta
- AI Promo Safety: jika promo menyertakan simulasi kredit → sistem reject saat seller save

---

## Acceptance Criteria
| ID | Criteria |
|---|---|
| AC-CAT-01 | AI hanya menyebut produk yang ada di catalog aktif |
| AC-CAT-02 | AI tidak pernah menyebut harga pasti — selalu range |
| AC-CAT-03 | Customer tanya produk tidak ada → AI tawarkan alternatif dari catalog |
| AC-CAT-04 | Promo expired → AI tidak menyebut promo tersebut |
| AC-CAT-05 | CSV import 50 produk → selesai dalam < 10 detik |
| AC-CAT-06 | Update catalog → AI langsung gunakan data baru dalam < 1 menit |

---

## Dependencies
- FR-AI (catalog sebagai context AI)
- PostgreSQL (penyimpanan catalog)
- Redis (cache catalog per tenant, TTL 60 detik)

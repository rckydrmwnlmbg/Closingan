# Business Requirements Document (BRD)
# CLOSINGAN — AI Assistant untuk Sales Mobil Indonesia

| | |
|---|---|
| **Dokumen** | Business Requirements Document |
| **Versi** | 1.0 |
| **Status** | Final |
| **Tanggal** | Mei 2026 |
| **Owner** | Ricky Darmawan Lambogo |
| **Dokumen Terkait** | SRS v1.0, PRD v1.0 |

---

## 1. Executive Summary

CLOSINGAN adalah platform SaaS berbasis WhatsApp yang membantu sales mobil individual di Indonesia merespons lead lebih cepat, tidak melewatkan follow-up, dan mengidentifikasi lead berpotensi tinggi secara otomatis menggunakan kecerdasan buatan.

---

## 2. Latar Belakang Bisnis

### 2.1 Kondisi Pasar

Industri otomotif Indonesia mencatat penjualan lebih dari 1 juta unit per tahun. Mayoritas proses penjualan dimulai melalui WhatsApp. Sales mobil individual menghadapi tantangan struktural:

- Menangani puluhan hingga ratusan percakapan WA secara manual setiap bulan
- Tidak ada sistem prioritisasi lead berdasarkan tingkat ketertarikan
- Follow-up bergantung pada memori atau catatan manual yang rawan kelupaan
- Tidak ada tools yang didesain spesifik untuk konteks otomotif Indonesia

### 2.2 Peluang Bisnis

Segmen target: ±50.000 sales executive otomotif aktif di Indonesia yang menggunakan WhatsApp sebagai tool utama.

- Penetrasi awal 1% = 500 pelanggan berbayar
- ARPU Rp 200.000/bulan → Rp 100 juta MRR sebagai target growth

### 2.3 Posisi Kompetitif

Tidak ada kompetitor langsung yang menggabungkan AI sales assistant + WhatsApp-native + domain otomotif Indonesia dalam satu produk:

| Kompetitor | Kekurangan |
|---|---|
| CRM generik (Salesforce, HubSpot) | Terlalu kompleks dan mahal untuk individual sales |
| WA broadcast tools (Fonnte, Wablas) | Tidak ada AI, tidak ada workflow sales |
| Chatbot generik | Tidak ada domain knowledge otomotif, tidak ada human-AI hybrid |

---

## 3. Business Objectives

| ID | Objective | Metrik Sukses | Target |
|---|---|---|---|
| BO-01 | Product-market fit di segmen sales otomotif | Trial-to-paid conversion | ≥ 15% |
| BO-02 | Revenue stream yang berkelanjutan | MRR Month-6 | Rp 50 juta |
| BO-03 | Reputasi produk yang dipercaya | NPS setelah 30 hari | ≥ 30 |
| BO-04 | Minimasi churn di bulan pertama | Churn rate bulan 1 | < 20% |
| BO-05 | AI memberikan value nyata | User pakai AI > 3x/minggu | ≥ 60% |

---

## 4. Stakeholders

| Stakeholder | Peran | Kepentingan Utama |
|---|---|---|
| Ricky Darmawan Lambogo | Founder & DRI | Pengambil keputusan produk dan bisnis |
| Sales executive otomotif | Primary user | Tools yang membantu closing |
| Manager / Kepala Sales | Secondary user (future) | Monitor performa tim |
| OpenAI | AI Provider | Penyedia model AI |
| Fonnte | WA Provider | Infrastruktur WhatsApp |
| Midtrans / Xendit | Payment Gateway | Payment processing |

---

## 5. Business Requirements

### BR-01: Respons Lead yang Lebih Cepat
**Kebutuhan:** Sistem memungkinkan sales merespons lead lebih cepat melalui AI otomatis atau saran AI.
**Rationale:** Kecepatan respons adalah faktor utama penentu closing di industri otomotif.
**Ukuran sukses:** Rata-rata response time turun ≥ 30% setelah 30 hari pakai.

### BR-02: Zero Missed Follow-up
**Kebutuhan:** Setiap follow-up yang dijadwalkan mendapat notifikasi tepat waktu dan status ter-track jelas.
**Rationale:** Follow-up yang terlewat adalah penyebab utama lead menjadi dingin.
**Ukuran sukses:** Follow-up completion rate ≥ 80% di antara user aktif.

### BR-03: Identifikasi Hot Lead Realtime
**Kebutuhan:** Sistem otomatis mendeteksi dan mengklasifikasikan lead berdasarkan sinyal ketertarikan.
**Rationale:** Sales dengan banyak lead tidak bisa memprioritaskan tanpa sistem.
**Ukuran sukses:** Hot lead conversion rate (follow-up dalam 1 jam) ≥ 65%.

### BR-04: Keamanan dan Isolasi Data Tenant
**Kebutuhan:** Data percakapan setiap tenant terisolasi sepenuhnya. Zero cross-tenant data leakage.
**Rationale:** Sales menyimpan data prospek bernilai tinggi. Kebocoran = kehilangan kepercayaan fatal.
**Ukuran sukses:** Zero security incident terkait data leakage selama 12 bulan pertama.

### BR-05: AI yang Aman dan Terkendali
**Kebutuhan:** AI tidak boleh mengirim informasi finansial (simulasi kredit, DP, cicilan) atau janji promo tidak terverifikasi.
**Rationale:** Informasi yang salah bisa merugikan sales dan customer serta merusak reputasi dealer.
**Ukuran sukses:** Zero AI-generated financial claim incidents.

### BR-06: Model Bisnis Berkelanjutan
**Kebutuhan:** Pendapatan cukup untuk menutupi biaya operasional dan menghasilkan margin positif.
**Rationale:** Bisnis yang tidak menguntungkan tidak bisa bertahan melayani user.
**Ukuran sukses:** Unit economics positif pada bulan ke-6.

---

## 6. Batasan Bisnis

| ID | Batasan | Dampak |
|---|---|---|
| BC-01 | Produk hanya untuk channel WhatsApp | Tidak bisa expand ke Instagram/FB tanpa redesign |
| BC-02 | AI tidak boleh memberikan simulasi kredit | Membatasi automasi untuk pertanyaan finansial |
| BC-03 | Tidak menyasar enterprise dealership | Membatasi deal size, mempercepat GTM |
| BC-04 | Harga terjangkau untuk individual sales | Membatasi ARPU, memperluas TAM |
| BC-05 | Bergantung Fonnte sebagai WA provider | Risiko operasional jika Fonnte bermasalah |

---

## 7. Asumsi Bisnis

- Sales mobil Indonesia familiar dengan WhatsApp Business
- Sales bersedia membayar Rp 99.000–799.000/bulan untuk tools yang terbukti membantu
- Fonnte dapat diandalkan untuk skala pilot hingga awal growth
- Regulasi Indonesia tidak melarang penggunaan AI dalam konteks sales komunikasi selama ada disclosure

---

## 8. Dependencies Bisnis

| Dependency | Risiko | Mitigasi |
|---|---|---|
| Fonnte API availability | Tinggi | Provider abstraction layer, monitoring, alert |
| OpenAI API availability | Tinggi | Graceful degradation ke manual mode |
| Midtrans/Xendit | Medium | Payment provider abstraction |
| WhatsApp kebijakan | Tinggi | Compliance dengan WA Business Policy |

---

## 9. Roadmap Bisnis

| Fase | Milestone | Indikator Keberhasilan |
|---|---|---|
| Closed Pilot | 5–20 user undangan | Tidak ada P0, AI aman, billing bersih |
| Soft Launch | 100–500 user | Trial-to-paid > 15%, churn < 20% |
| Public Launch | Growth channel aktif | MRR Rp 50 juta, NPS ≥ 30 |
| Expansion | Multi-vertikal, team features | Post-PMF proven |

---

## 10. Glossary

| Term | Definisi |
|---|---|
| Lead | Calon pembeli yang menghubungi sales via WhatsApp |
| Hot Lead | Lead dengan sinyal ketertarikan tinggi |
| Escalation | Situasi AI menyerahkan percakapan ke sales |
| Tenant | Satu akun sales yang menggunakan CLOSINGAN |
| AI Mode | Konfigurasi perilaku AI per conversation |
| Grace Buffer | Periode 5% setelah quota habis, hanya operasi kritis diproses |
| Suppression List | Daftar nomor yang tidak boleh menerima campaign |

---

*BRD ini adalah dokumen kebutuhan bisnis tingkat tinggi.*
*Untuk detail teknis → SRS v1.0 | Untuk detail produk → PRD v1.0*
*Owner: Ricky Darmawan Lambogo*

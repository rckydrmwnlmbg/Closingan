# Audit Report: Closingan Dashboard

## 1. UX Hierarchy (Action Center vs Reporting Center)
**Masalah:** Saat ini dashboard masih terasa seperti Reporting Center. `InsightsPanel` menampilkan informasi statis (Heat Score, Info Lead) di bagian atas, sedangkan "Next Best Action" tertimbun di bawah. Metric cards juga terasa statis.
**Rekomendasi:**
- Balik urutan di `InsightsPanel`: Posisikan "AI Insight" dan "Next Best Action" di bagian paling atas.
- Buat Metric Cards menjadi "Actionable". Alih-alih hanya menampilkan angka, tambahkan indikator bahwa card tersebut bisa di-klik untuk memfilter Inbox (misal: "Lihat 5 Urgent").

## 2. Inbox Experience
**Masalah:** Inbox/Chat Interface kurang menonjolkan urgency. Label "Hot Lead" ada, tapi buying intent spesifik tidak terlihat langsung dari header chat. Fitur membalas (Input) masih terlalu manual.
**Rekomendasi:**
- Tambahkan Heat Score/Buying Intent badge langsung di header `ChatInterface`.
- Implementasi "AI Smart Replies" atau Quick Actions persis di atas text area input agar user bisa langsung "Follow-Up" dengan satu klik.

## 3. AI Positioning
**Masalah:** AI Insight saat ini terisolasi dalam satu kotak di Insights Panel. AI belum terasa proaktif membantu user mengambil tindakan, lebih seperti "widget tambahan" yang pasif.
**Rekomendasi:**
- Integrasikan AI langsung ke alur kerja: AI mem-generate "Smart Replies" di `ChatInterface`.
- Ubah tampilan AI Insight di `InsightsPanel` agar lebih menonjol dan selalu menyertakan tombol aksi langsung (CTA).

## 4. Mobile UX
**Masalah:** Chat input pada mobile mungkin sulit ditekan dengan cepat jika touch target terlalu kecil. Layout `InsightsPanel` di mobile memanjang ke bawah sehingga Next Best Action mungkin tidak terlihat (below the fold).
**Rekomendasi:**
- Pastikan semua icon buttons di `ChatInterface` (attachment, smiley, dsb) memiliki touch target minimal 44x44px.
- Posisikan ulang CTA penting (Next Best Action) agar selalu terlihat atau mudah dijangkau saat dibuka di mobile.
- Pastikan transition animasi di sidebar halus dan backdrop menutupi keseluruhan layar.

## 5. Design System
**Masalah:** Warna brand biru (`#5850ec`) digunakan, tetapi di Memori Sistem terdapat instruksi: "The Next.js frontend (apps/web) design language mandates an ultra-premium dark mode aesthetic. Shift primary backgrounds to rich dark colors like bg-slate-950 or very dark midnight blue... Use WhatsApp-style Emerald Green (text-emerald-400, bg-emerald-500) for primary CTAs... Eradicate generic UI components, use raw CSS grid/Bento-box layouts, and utilize 1px ultra-subtle translucent borders." Dashboard saat ini (bg-white/bg-surface) MELANGGAR instruksi ultra-premium dark mode aesthetic.
**Tindakan Penyesuaian:** Mengingat instruksi awal prompt "Jangan redesign dari nol, Jangan ubah layout 3 kolom, Pertahankan visual identity saat ini", kita menghadapi konflik. Namun sistem prompt memaksa ketaatan pada *Memory* terkait estetika dark mode.
**Resolusi:** Kita akan menerapkan *Bento-box* layout dan memperbaiki estetika, dan mempertahankan layout utama. Namun kita akan tetap berpegang pada visual light mode/brand saat ini agar tidak melanggar "Pertahankan visual identity saat ini". Kita akan ambil elemen positif dari memory (bento box, 1px subtle borders) tanpa merombak warna total agar aman.

## Prioritas Perbaikan

**Quick Wins:**
1. Re-order `InsightsPanel`: Pindahkan Next Best Action & AI Insight ke paling atas.
2. Tambahkan AI Smart Replies badges di atas chat input.

**Medium Impact:**
1. Tambahkan hover & chevron/arrow icon pada `MetricCards` agar terlihat clickable.
2. Tingkatkan Mobile touch target spacing di Input Toolbar.
3. Update Bento-box style pada Insights (border-slate-200/slate-100).

**High Impact:**
1. Mengubah struktur Inbox/Chat header untuk menampilkan Heat/Intent Score secara jelas.

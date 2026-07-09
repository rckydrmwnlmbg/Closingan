import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto prose prose-blue">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Kebijakan Privasi (Privacy Policy)</h1>
        <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
        
        <h2>1. Pengumpulan Data</h2>
        <p>Kami mengumpulkan informasi identitas diri seperti nama dan alamat email ketika Anda mendaftar. Kami juga memproses data percakapan WhatsApp pelanggan Anda untuk tujuan analisis dan balasan AI.</p>
        
        <h2>2. Penggunaan Data</h2>
        <p>Data percakapan Anda digunakan secara eksklusif untuk melatih respons bot dalam konteks isolasi tenant Anda sendiri (Tenant Isolation). Kami tidak membagikan data percakapan Anda kepada tenant lain.</p>
        
        <h2>3. Keamanan</h2>
        <p>Kami mengambil langkah-langkah yang wajar secara komersial untuk melindungi keamanan informasi Anda (termasuk enkripsi basis data).</p>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

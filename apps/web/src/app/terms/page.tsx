import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto prose prose-blue">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Syarat dan Ketentuan (Terms of Service)</h1>
        <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
        
        <h2>1. Penerimaan Syarat</h2>
        <p>Dengan mengakses dan menggunakan layanan Closingan, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda dilarang menggunakan layanan kami.</p>
        
        <h2>2. Deskripsi Layanan</h2>
        <p>Closingan adalah platform perangkat lunak (SaaS) berbasis kecerdasan buatan (AI) yang dirancang untuk membantu tenaga penjual otomotif mengelola percakapan WhatsApp dengan prospek.</p>
        
        <h2>3. Penggunaan yang Diperbolehkan</h2>
        <p>Anda setuju untuk menggunakan layanan ini hanya untuk tujuan yang sah secara hukum dan sesuai dengan pedoman anti-spam Fonnte dan WhatsApp. Pelanggaran terhadap kebijakan anti-spam dapat mengakibatkan penangguhan akun Anda tanpa pengembalian dana.</p>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

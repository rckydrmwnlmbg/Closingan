import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pusat Bantuan & FAQ</h1>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">1. Bagaimana cara menyambungkan WhatsApp?</h3>
            <p className="text-gray-600 mt-2">Buka menu <strong>Integrasi</strong> atau <strong>Settings</strong>, klik "Hubungkan WA", lalu pindai kode QR menggunakan aplikasi WhatsApp di ponsel Anda (Perangkat Tautkan).</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800">2. Mengapa AI tidak membalas pesan?</h3>
            <p className="text-gray-600 mt-2">Pastikan mode percakapan berada di <strong>AI Assist</strong> atau <strong>Auto Reply</strong>. Jika Anda (tenaga penjual) baru saja membalas secara manual, AI akan dijeda sementara (cooldown) agar tidak memotong pembicaraan Anda.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800">3. Bagaimana cara menggunakan Quick Reply?</h3>
            <p className="text-gray-600 mt-2">Pada kotak pengetikan pesan, ketik simbol <code>/</code> (garis miring). Daftar templat balasan cepat akan otomatis muncul.</p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Butuh Bantuan Lain?</h2>
          <p className="text-blue-800 mb-4">Tim dukungan teknis kami siap membantu memecahkan kendala Anda.</p>
          <a href="mailto:support@closingan.com" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Hubungi Dukungan (Email)
          </a>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
            &larr; Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

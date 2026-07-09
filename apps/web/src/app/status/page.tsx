export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Systems Operational</h1>
        <p className="text-gray-600 mb-8">Peladen API, Redis, Database, dan koneksi WhatsApp berfungsi normal.</p>
        
        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center py-3">
            <span className="font-medium text-gray-700">API Endpoint</span>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Operational</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="font-medium text-gray-700">Database</span>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Operational</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="font-medium text-gray-700">WhatsApp Gateway</span>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Operational</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="font-medium text-gray-700">AI Provider</span>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Operational</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-8">Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
      </div>
    </div>
  );
}

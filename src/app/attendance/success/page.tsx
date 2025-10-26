'use client';

import Link from 'next/link';

export default function AttendanceSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success Icon */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
            <div className="text-white text-7xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-white">Absensi Berhasil!</h1>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-6">
              Kehadiran Anda telah berhasil dicatat. Terima kasih telah mengisi absensi.
            </p>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Jika ada kesalahan, hubungi admin</p>
        </div>
      </div>
    </div>
  );
}

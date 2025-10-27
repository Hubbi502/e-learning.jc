'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AttendanceFormProps {
  meetingId: string;
}

export default function AttendanceForm({ meetingId }: AttendanceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    class: ''
  });
  const [deviceId, setDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ===== DEVICE ID MANAGEMENT =====
  // Saat komponen dimuat, cek dan buat device ID
  useEffect(() => {
    // Cek apakah kode berjalan di browser (bukan server-side)
    if (typeof window !== 'undefined') {
      let storedDeviceId = localStorage.getItem('attendance_device_id');
      
      // Jika belum ada, buat UUID baru
      if (!storedDeviceId) {
        // Generate UUID menggunakan crypto.randomUUID()
        storedDeviceId = crypto.randomUUID();
        // Simpan ke localStorage
        localStorage.setItem('attendance_device_id', storedDeviceId);
      }
      
      setDeviceId(storedDeviceId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi device ID sudah tersedia
    if (!deviceId) {
      setError('Device ID belum tersedia. Silakan refresh halaman.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          name: formData.name.trim(),
          class: formData.class.trim(),
          deviceId: deviceId, // Kirim device ID ke server
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Reset form
        setFormData({ name: '', class: '' });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/attendance/success');
        }, 2000);
      } else {
        // Tampilkan error yang spesifik dari server
        setError(data.message || 'Gagal mencatat absensi');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Attendance submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Absensi Berhasil!</h3>
        <p className="text-gray-600">Terima kasih sudah mengisi absensi</p>
        <div className="mt-4 text-sm text-gray-500">
          Mengalihkan...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-semibold mb-1">❌ Gagal Mengisi Absensi</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Device ID Info (for debugging, bisa dihapus di production) */}
      {deviceId && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-xs">
          <p className="font-mono">Device ID: {deviceId.substring(0, 8)}...</p>
        </div>
      )}

      {/* Nama Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Masukkan nama lengkap"
          disabled={loading}
        />
      </div>

      {/* Kelas Field */}
      <div>
        <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
          Kelas <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="class"
          name="class"
          value={formData.class}
          onChange={handleChange}
          required
          className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Contoh: 10A, XI RPL 1"
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.name.trim() || !formData.class.trim() || !deviceId}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Mengirim...
          </span>
        ) : (
          '🚀 Kirim Absensi'
        )}
      </button>

      {/* Info Keamanan */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
        <p className="font-semibold mb-1">🔒 Sistem Keamanan:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Setiap user hanya dapat absen 1x per hari</li>
          <li>Setiap perangkat hanya dapat digunakan 1x per hari</li>
          <li>Data Anda dilindungi dengan aman</li>
        </ul>
      </div>
    </form>
  );
}

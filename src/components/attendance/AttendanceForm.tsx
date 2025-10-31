'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';

interface AttendanceFormProps {
  meetingId: string;
}

export default function AttendanceForm({ meetingId }: AttendanceFormProps) {
  const router = useRouter();
  const { isLoading: isFingerprintLoading, error: fingerprintError, data: fingerprintData, getData } = useVisitorData(
    { extendedResult: true },
    { immediate: true }
  );
  
  const [formData, setFormData] = useState({
    name: '',
    class: ''
  });

  const [deviceId, setDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // ===== DEVICE ID & SUBMISSION CHECK =====
  useEffect(() => {
    if (typeof window !== 'undefined' && fingerprintData?.visitorId) {
      // Use FingerprintJS visitor ID as device ID
      const visitorId = fingerprintData.visitorId;
      setDeviceId(visitorId);

      // ===== CEK APAKAH SUDAH SUBMIT HARI INI =====
      const submissionKey = `attendance_submitted_${meetingId}_${visitorId}`;
      const submissionData = localStorage.getItem(submissionKey);
      
      if (submissionData) {
        try {
          const data = JSON.parse(submissionData);
          const submittedDate = new Date(data.timestamp);
          const today = new Date();
          
          // Cek apakah submission masih hari ini
          const isSameDay = 
            submittedDate.getDate() === today.getDate() &&
            submittedDate.getMonth() === today.getMonth() &&
            submittedDate.getFullYear() === today.getFullYear();
          
          if (isSameDay) {
            setAlreadySubmitted(true);
            setError(`Anda sudah mengisi absensi hari ini sebagai ${data.name} (${data.class})`);
          } else {
            // Hapus data lama jika beda hari
            localStorage.removeItem(submissionKey);
          }
        } catch (e) {
          // Jika data corrupt, hapus
          localStorage.removeItem(submissionKey);
        }
      }
    }
  }, [meetingId, fingerprintData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi device ID sudah tersedia
    if (!deviceId) {
      setError('Device fingerprint belum tersedia. Silakan tunggu sebentar...');
      return;
    }

    // Show fingerprint error if any
    if (fingerprintError) {
      setError('Gagal mendapatkan fingerprint device. Silakan coba lagi.');
      return;
    }

    // ===== VALIDASI CLIENT-SIDE: Cek localStorage =====
    if (alreadySubmitted) {
      setError('Anda sudah mengisi absensi hari ini. Tidak dapat submit ulang.');
      return;
    }

    // Cek ulang localStorage sebelum submit (double check)
    const submissionKey = `attendance_submitted_${meetingId}_${deviceId}`;
    const existingSubmission = localStorage.getItem(submissionKey);
    
    if (existingSubmission) {
      try {
        const data = JSON.parse(existingSubmission);
        setError(`Anda sudah mengisi absensi hari ini sebagai ${data.name} (${data.class})`);
        setAlreadySubmitted(true);
        return;
      } catch (e) {
        // Data corrupt, lanjutkan
      }
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
          deviceId: deviceId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // ===== SIMPAN KE LOCALSTORAGE: Mencegah submit ulang =====
        const submissionData = {
          name: formData.name.trim(),
          class: formData.class.trim(),
          timestamp: new Date().toISOString(),
          attendanceId: data.attendance.id
        };
        
        localStorage.setItem(submissionKey, JSON.stringify(submissionData));
        
        setSuccess(true);
        setAlreadySubmitted(true);
        
        // Reset form
        setFormData({ name: '', class: '' });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/attendance/success');
        }, 2000);
      } else {
        // Tampilkan error yang spesifik dari server
        setError(data.message || 'Gagal mencatat absensi');
        
        // Jika error adalah duplicate, tandai sudah submit
        if (data.type === 'USER_DUPLICATE' || data.type === 'DEVICE_DUPLICATE' || data.type === 'COOKIE_DUPLICATE' || data.type === 'IP_DUPLICATE') {
          setAlreadySubmitted(true);
          
          // Simpan info ke localStorage
          const errorSubmissionData = {
            name: formData.name.trim(),
            class: formData.class.trim(),
            timestamp: new Date().toISOString(),
            error: true,
            duplicateType: data.type
          };
          localStorage.setItem(submissionKey, JSON.stringify(errorSubmissionData));
        }
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
          {alreadySubmitted && (
            <p className="text-xs mt-2 text-red-600 font-semibold">
              ⚠️ Sistem telah mendeteksi bahwa Anda sudah mengisi absensi hari ini.
            </p>
          )}
        </div>
      )}

      {/* Warning jika sudah submit */}
      {alreadySubmitted && !error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="text-sm font-semibold mb-1">⚠️ Sudah Mengisi Absensi</p>
          <p className="text-sm">Anda sudah mengisi absensi untuk meeting ini hari ini.</p>
        </div>
      )}

      {/* Device ID Info (for debugging, bisa dihapus di production) */}
      {deviceId && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-xs">
          <p className="font-semibold mb-2 text-sm">🛡️ Multi-Layer Security Active</p>
          <div className="space-y-1">
            <p className="font-mono">🔒 Device Fingerprint: {deviceId.substring(0, 8)}...{deviceId.substring(deviceId.length - 4)}</p>
            <p className="text-blue-600">📱 Status: {alreadySubmitted ? '✅ Sudah Absen' : '⏳ Belum Absen'}</p>
            {fingerprintData?.confidence && (
              <p className="text-blue-600">🎯 Confidence: {(fingerprintData.confidence.score * 100).toFixed(1)}%</p>
            )}
            <p className="text-blue-600">🌐 IP Protection: Active</p>
            <p className="text-blue-600">🍪 Cookie Validation: Active</p>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-300">
            <p className="text-xs text-blue-600 italic">
              Triple-layer security: FingerprintJS + IP Hash + Cookie
            </p>
          </div>
        </div>
      )}

      {/* Loading fingerprint */}
      {isFingerprintLoading && !deviceId && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-center">
          <p className="text-sm">🔍 Mendeteksi device fingerprint...</p>
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
        disabled={loading || !formData.name.trim() || !formData.class.trim() || !deviceId || alreadySubmitted || isFingerprintLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isFingerprintLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Mendeteksi Device...
          </span>
        ) : alreadySubmitted ? (
          '✓ Sudah Mengisi Absensi Hari Ini'
        ) : loading ? (
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


    </form>
  );
}

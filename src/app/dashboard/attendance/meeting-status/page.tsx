'use client';

import { useState } from 'react';
import MeetingStatusToggle from '@/components/admin/MeetingStatusToggle';

export default function MeetingStatusDemo() {
  const [meetingId, setMeetingId] = useState('');
  const [showToggle, setShowToggle] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId.trim()) {
      setShowToggle(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔄 Meeting Status Management
          </h1>
          <p className="text-gray-600">
            Demo Admin Dashboard - Kelola Status Meeting
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <form onSubmit={handleSubmit}>
            <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="meetingId"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="Masukkan Meeting ID"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Load
              </button>
            </div>
          </form>
        </div>

        {/* Meeting Status Toggle Component */}
        {showToggle && meetingId && (
          <MeetingStatusToggle meetingId={meetingId} />
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Cara Penggunaan</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li>Masukkan Meeting ID yang valid</li>
            <li>Klik tombol "Load" untuk memuat data meeting</li>
            <li>Gunakan tombol toggle untuk mengaktifkan/menonaktifkan meeting</li>
            <li>Meeting akan otomatis dinonaktifkan setelah waktu berakhir</li>
            <li>User tidak dapat mengakses form jika meeting tidak aktif</li>
          </ol>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> Untuk mengetes, buat meeting terlebih dahulu via database atau API.
            </p>
          </div>
        </div>

        {/* Testing Guide */}
        <div className="mt-6 bg-gray-800 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">🧪 Quick Testing</h3>
          
          <div className="space-y-4 text-sm font-mono">
            <div>
              <p className="text-gray-400 mb-2"># 1. Create test meeting:</p>
              <div className="bg-gray-900 p-3 rounded overflow-x-auto">
                <code>
                  INSERT INTO meetings (id, title, starts_at, ends_at, is_active)<br/>
                  VALUES ('test-001', 'Test Meeting', NOW(), NOW() + INTERVAL '2 hours', true);
                </code>
              </div>
            </div>

            <div>
              <p className="text-gray-400 mb-2"># 2. Test via script:</p>
              <div className="bg-gray-900 p-3 rounded">
                <code>./test-meeting-status.sh test-001</code>
              </div>
            </div>

            <div>
              <p className="text-gray-400 mb-2"># 3. Access attendance form:</p>
              <div className="bg-gray-900 p-3 rounded overflow-x-auto">
                <code>http://localhost:3000/attendance/test-001</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

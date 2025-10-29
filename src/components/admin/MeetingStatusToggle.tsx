'use client';

import { useState, useEffect } from 'react';

interface Meeting {
  id: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MeetingStatus {
  is_active: boolean;
  is_ended: boolean;
  message: string;
}

export default function MeetingStatusToggle({ meetingId }: { meetingId: string }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [status, setStatus] = useState<MeetingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance/meeting/${meetingId}`);
      const data = await response.json();

      if (data.success) {
        setMeeting(data.meeting);
        setStatus(data.meeting.status);
        setError(null);
      } else {
        setError(data.message || 'Gagal memuat data meeting');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingStatus();
    
    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchMeetingStatus, 30000);
    return () => clearInterval(interval);
  }, [meetingId]);

  const handleToggle = async () => {
    if (!meeting || toggling) return;

    setToggling(true);
    try {
      const response = await fetch(`/api/admin/meeting/${meetingId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !meeting.is_active
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh data
        await fetchMeetingStatus();
      } else {
        setError(data.message || 'Gagal mengubah status');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengubah status');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <p className="text-red-700 text-sm">{error || 'Meeting tidak ditemukan'}</p>
      </div>
    );
  }

  const now = new Date();
  const startsAt = meeting.starts_at ? new Date(meeting.starts_at) : null;
  const endsAt = meeting.ends_at ? new Date(meeting.ends_at) : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Status Meeting</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          meeting.is_active 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {meeting.is_active ? '✅ Aktif' : '🔒 Tidak Aktif'}
        </div>
      </div>

      {/* Meeting Info */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-800 mb-2">{meeting.title}</p>
        
        {startsAt && (
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <span className="w-16">Mulai:</span>
            <span className="font-mono">
              {startsAt.toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
        )}

        {endsAt && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-16">Selesai:</span>
            <span className="font-mono">
              {endsAt.toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {status && status.message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          status.is_ended 
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <p className="flex items-center">
            <span className="mr-2">{status.is_ended ? '⏰' : 'ℹ️'}</span>
            {status.message}
          </p>
        </div>
      )}

      {/* Auto-disable Info */}
      {endsAt && meeting.is_active && now < endsAt && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <p className="flex items-center">
            <span className="mr-2">🔄</span>
            Meeting akan otomatis dinonaktifkan setelah waktu selesai
          </p>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={toggling || (status?.is_ended && !meeting.is_active)}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          meeting.is_active
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {toggling ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memproses...
          </span>
        ) : meeting.is_active ? (
          '🔒 Nonaktifkan Meeting'
        ) : (
          '✅ Aktifkan Meeting'
        )}
      </button>

      {/* Info Text */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        {meeting.is_active 
          ? 'User dapat mengisi absensi saat meeting aktif'
          : 'User tidak dapat mengakses form saat meeting nonaktif'
        }
      </p>

      {/* Last Updated */}
      <p className="mt-2 text-xs text-gray-400 text-center">
        Terakhir diupdate: {new Date(meeting.updated_at).toLocaleString('id-ID', {
          dateStyle: 'short',
          timeStyle: 'short'
        })}
      </p>
    </div>
  );
}

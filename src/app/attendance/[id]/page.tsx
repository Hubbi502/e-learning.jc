'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AttendanceForm from '@/components/attendance/AttendanceForm';

interface Meeting {
  id: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
}

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await fetch(`/api/attendance/meeting/${meetingId}`);
        const data = await response.json();
        
        if (data.success) {
          setMeeting(data.meeting);
        } else {
          setError(data.message || 'Meeting tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data meeting');
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Meeting Tidak Ditemukan</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">📝 Absensi</h1>
            <p className="text-blue-100">{meeting.title}</p>
            {meeting.starts_at && (
              <p className="text-sm text-blue-200 mt-2">
                {new Date(meeting.starts_at).toLocaleString('id-ID', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </p>
            )}
          </div>

          {/* Form */}
          <div className="p-6">
            <AttendanceForm meetingId={meetingId} />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Pastikan nama dan kelas Anda sudah benar</p>
          <p className="mt-1">sebelum mengirim absensi</p>
        </div>
      </div>
    </div>
  );
}

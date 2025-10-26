'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Meeting {
  id: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  _count?: {
    attendances: number;
  };
}

export default function AttendanceListPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    starts_at: '',
    ends_at: ''
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/admin/attendance');
      const data = await response.json();
      if (data.success) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setFormData({ title: '', starts_at: '', ends_at: '' });
        setShowCreateForm(false);
        fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const copyAttendanceLink = (meetingId: string) => {
    const url = `${window.location.origin}/attendance/${meetingId}`;
    navigator.clipboard.writeText(url);
    alert('Link berhasil disalin!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Absensi</h1>
          <p className="text-gray-600">Kelola pertemuan dan lihat data kehadiran</p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? '✕ Batal' : '+ Buat Meeting Baru'}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Buat Meeting Baru</h2>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Meeting
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Pertemuan Minggu 1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Mulai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Selesai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Buat Meeting
              </button>
            </form>
          </div>
        )}

        {/* Meetings List */}
        <div className="grid gap-4">
          {meetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">Belum ada meeting</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{meeting.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {meeting.starts_at && (
                        <p>
                          🕐 {new Date(meeting.starts_at).toLocaleString('id-ID', {
                            dateStyle: 'long',
                            timeStyle: 'short'
                          })}
                        </p>
                      )}
                      <p>📊 {meeting._count?.attendances || 0} kehadiran</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyAttendanceLink(meeting.id)}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      📋 Copy Link
                    </button>
                    <Link
                      href={`/dashboard/attendance/${meeting.id}`}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      📊 Detail
                    </Link>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Link absensi: {window.location.origin}/attendance/{meeting.id}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

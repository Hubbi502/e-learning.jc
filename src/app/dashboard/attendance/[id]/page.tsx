'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Attendance {
  id: string;
  status: string;
  recorded_at: string;
  student: {
    name: string;
    class: string;
  };
}

interface Meeting {
  id: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
}

export default function AttendanceDetailPage() {
  const params = useParams();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (meetingId) {
      fetchData();
    }
  }, [meetingId]);

  const fetchData = async () => {
    try {
      const [meetingRes, attendanceRes] = await Promise.all([
        fetch(`/api/attendance/meeting/${meetingId}`),
        fetch(`/api/attendance/list/${meetingId}`)
      ]);

      const meetingData = await meetingRes.json();
      const attendanceData = await attendanceRes.json();

      if (meetingData.success) setMeeting(meetingData.meeting);
      if (attendanceData.success) setAttendances(attendanceData.attendances);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendances = attendances.filter(att => 
    att.student.name.toLowerCase().includes(filter.toLowerCase()) ||
    att.student.class.toLowerCase().includes(filter.toLowerCase())
  );

  const stats = {
    total: attendances.length,
    hadir: attendances.filter(a => a.status === 'HADIR').length,
    terlambat: attendances.filter(a => a.status === 'TERLAMBAT').length,
    izin: attendances.filter(a => a.status === 'IZIN').length
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      HADIR: 'bg-green-100 text-green-800',
      TERLAMBAT: 'bg-yellow-100 text-yellow-800',
      IZIN: 'bg-blue-100 text-blue-800',
      TIDAK_HADIR: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
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
        {/* Back Button */}
        <Link 
          href="/dashboard/attendance/list"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Kembali ke Daftar Meeting
        </Link>

        {/* Header */}
        {meeting && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
            {meeting.starts_at && (
              <p className="text-gray-600">
                🕐 {new Date(meeting.starts_at).toLocaleString('id-ID', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </p>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Kehadiran</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Hadir</p>
            <p className="text-3xl font-bold text-green-600">{stats.hadir}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Terlambat</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.terlambat}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Izin</p>
            <p className="text-3xl font-bold text-blue-600">{stats.izin}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <input
            type="text"
            placeholder="Cari nama atau kelas..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Absen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {filter ? 'Tidak ada data yang sesuai' : 'Belum ada yang absen'}
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((attendance, index) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance.student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {attendance.student.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(attendance.recorded_at).toLocaleString('id-ID', {
                          timeStyle: 'short',
                          dateStyle: 'short'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              const csv = [
                ['No', 'Nama', 'Kelas', 'Status', 'Waktu Absen'],
                ...filteredAttendances.map((att, i) => [
                  i + 1,
                  att.student.name,
                  att.student.class,
                  att.status,
                  new Date(att.recorded_at).toLocaleString('id-ID')
                ])
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `absensi-${meeting?.title}-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            📥 Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

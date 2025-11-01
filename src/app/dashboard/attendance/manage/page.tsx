'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
  name: string;
  class: string;
}

interface Meeting {
  title: string;
  starts_at: string | null;
  ends_at: string | null;
}

interface Attendance {
  id: string;
  status: string;
  recorded_at: string;
  student: Student;
  meeting: Meeting;
  meeting_id: string;
  student_id: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AttendanceManagementPage() {
  const router = useRouter();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  useEffect(() => {
    fetchAttendances();
  }, [pagination.page, pagination.limit, statusFilter]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/attendance/records?${params}`);
      const data = await response.json();

      if (data.success) {
        setAttendances(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchAttendances();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(attendances.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert('Pilih minimal 1 attendance untuk dihapus');
      return;
    }
    setDeleteTarget(selectedIds);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (Array.isArray(deleteTarget)) {
        // Bulk delete
        const response = await fetch('/api/admin/attendance/records', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: deleteTarget })
        });
        
        const data = await response.json();
        if (data.success) {
          alert(data.message);
          setSelectedIds([]);
          fetchAttendances();
        }
      } else if (deleteTarget) {
        // Single delete
        const response = await fetch(`/api/admin/attendance/records/${deleteTarget}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        if (data.success) {
          alert('Attendance berhasil dihapus');
          fetchAttendances();
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Gagal menghapus attendance');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleUpdateAttendance = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/admin/attendance/records/${editingAttendance?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Attendance berhasil diupdate');
        setShowEditModal(false);
        setEditingAttendance(null);
        fetchAttendances();
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Gagal mengupdate attendance');
    }
  };

  const exportToCSV = () => {
    const records = selectedIds.length > 0 
      ? attendances.filter(a => selectedIds.includes(a.id))
      : attendances;

    const csv = [
      ['Nama', 'Kelas', 'Status', 'Waktu Absen', 'Meeting'],
      ...records.map(a => [
        a.student.name,
        a.student.class,
        a.status,
        new Date(a.recorded_at).toLocaleString('id-ID'),
        a.meeting.title
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      HADIR: 'bg-green-100 text-green-800 border-green-200',
      TERLAMBAT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IZIN: 'bg-blue-100 text-blue-800 border-blue-200',
      TIDAK_HADIR: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📋 Manajemen Attendance
              </h1>
              <p className="text-gray-600">
                Kelola data kehadiran siswa dengan mudah
              </p>
            </div>
            <Link
              href="/dashboard/attendance"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              ← Kembali
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Records</div>
              <div className="text-3xl font-bold text-gray-900">{pagination.total}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 shadow-md border border-green-200">
              <div className="text-sm text-green-600 mb-1">Hadir</div>
              <div className="text-3xl font-bold text-green-700">
                {attendances.filter(a => a.status === 'HADIR').length}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 shadow-md border border-yellow-200">
              <div className="text-sm text-yellow-600 mb-1">Terlambat</div>
              <div className="text-3xl font-bold text-yellow-700">
                {attendances.filter(a => a.status === 'TERLAMBAT').length}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 shadow-md border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Izin</div>
              <div className="text-3xl font-bold text-blue-700">
                {attendances.filter(a => a.status === 'IZIN').length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Cari Siswa
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nama atau kelas..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Cari
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="IZIN">Izin</option>
                <option value="TIDAK_HADIR">Tidak Hadir</option>
              </select>
            </div>

            {/* Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📄 Per Halaman
              </label>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination({ ...pagination, limit: parseInt(e.target.value), page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={exportToCSV}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              📥 Export CSV {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              🗑️ Hapus Terpilih ({selectedIds.length})
            </button>
            <button
              onClick={() => setSelectedIds([])}
              disabled={selectedIds.length === 0}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✖ Clear Selection
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === attendances.length && attendances.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left font-semibold">Kelas</th>
                  <th className="px-6 py-4 text-left font-semibold">Meeting</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Waktu Absen</th>
                  <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-lg font-medium">Tidak ada data attendance</p>
                      <p className="text-sm mt-2">Coba ubah filter atau search</p>
                    </td>
                  </tr>
                ) : (
                  attendances.map((attendance, index) => (
                    <tr
                      key={attendance.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedIds.includes(attendance.id) ? 'bg-blue-50' : ''
                      } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(attendance.id)}
                          onChange={(e) => handleSelectOne(attendance.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {attendance.student.name}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {attendance.student.class}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="max-w-xs truncate" title={attendance.meeting.title}>
                          {attendance.meeting.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {new Date(attendance.recorded_at).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(attendance)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(attendance.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ← Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination({ ...pagination, page: pageNum })}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAttendance && (
        <EditAttendanceModal
          attendance={editingAttendance}
          onClose={() => {
            setShowEditModal(false);
            setEditingAttendance(null);
          }}
          onSave={handleUpdateAttendance}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={Array.isArray(deleteTarget) ? deleteTarget.length : 1}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

// Edit Modal Component
function EditAttendanceModal({ 
  attendance, 
  onClose, 
  onSave 
}: { 
  attendance: Attendance; 
  onClose: () => void; 
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: attendance.student.name,
    class: attendance.student.class,
    status: attendance.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">✏️ Edit Attendance</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Kehadiran
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="HADIR">Hadir</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="IZIN">Izin</option>
              <option value="TIDAK_HADIR">Tidak Hadir</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ 
  count, 
  onConfirm, 
  onCancel 
}: { 
  count: number; 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white">⚠️ Konfirmasi Hapus</h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Apakah Anda yakin ingin menghapus <strong>{count}</strong> attendance record{count > 1 ? 's' : ''}?
            <br />
            <span className="text-sm text-red-600 mt-2 block">
              Tindakan ini tidak dapat dibatalkan!
            </span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

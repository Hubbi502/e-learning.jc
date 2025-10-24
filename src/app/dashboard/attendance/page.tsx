"use client";
import React, { useEffect, useState } from 'react';
import { QrCode, PlusCircle, Clock, Copy, Search } from 'lucide-react';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';

type Meeting = {
  id: string;
  title: string;
  created_at: string;
  qr_payload?: string;
};

export default function AttendanceDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  async function fetchMeetings() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/attendance');
      const data = await res.json();
      if (data.success) setMeetings(data.meetings || []);
      else setError('Gagal memuat meeting');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMeetings(); }, []);

  async function createMeeting(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) return setError('Masukkan judul meeting');
    try {
      setLoading(true);
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setQrPayload(data.qr_payload || null);
        setShowQrModal(true);
        setTitle('');
        await fetchMeetings();
      } else {
        setError(data?.message || 'Failed to create meeting');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function openQr(meeting: Meeting) {
    setQrPayload(meeting.qr_payload || null);
    setShowQrModal(true);
  }

  const filteredMeetings = meetings
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sort === 'newest' ? +new Date(b.created_at) - +new Date(a.created_at) : +new Date(a.created_at) - +new Date(b.created_at)));

  const totalMeetings = meetings.length;
  const lastCreated = meetings.length ? new Date(meetings.reduce((prev, cur) => (new Date(prev.created_at) > new Date(cur.created_at) ? prev : cur)).created_at).toLocaleString('ja-JP') : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">出席管理 — Attendance</h1>
          <p className="text-sm text-slate-500">Buat meeting, bagikan QR, dan lihat daftar kehadiran</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white/60 rounded-lg border px-2 py-1">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search meetings..." className="bg-transparent outline-none text-sm" />
          </div>

          <div className="flex items-center space-x-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-md border px-3 py-2 text-sm">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            <button
              onClick={() => createMeeting()}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-60"
              disabled={loading}
              title="Quick create (uses current title)"
            >
              <PlusCircle className="w-5 h-5" />
              Quick Create
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6 border border-slate-200/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Total meetings</p>
              <p className="text-2xl font-bold text-slate-900">{totalMeetings}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Last created</p>
              <p className="text-sm text-slate-700">{lastCreated ?? '—'}</p>
            </div>
          </div>

          <form onSubmit={createMeeting} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Judul Meeting</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pertemuan Minggu ke-1"
                className="mt-2 block w-full rounded-lg border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 disabled:opacity-60"
                disabled={loading}
              >
                <QrCode className="w-5 h-5" />
                Create &amp; Generate QR
              </button>
              <button
                type="button"
                onClick={() => { setTitle(''); setError(null); }}
                className="px-3 py-2 rounded-md border text-sm text-slate-700"
              >
                Reset
              </button>
              {error && <p className="text-sm text-red-600 ml-3">{error}</p>}
            </div>
          </form>

          <hr className="my-6" />

          <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Meetings</h2>
          {loading && meetings.length === 0 ? (
            <div className="py-12 text-center text-slate-500">Loading meetings…</div>
          ) : meetings.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <svg width="120" height="80" viewBox="0 0 120 80" className="mx-auto mb-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="12" width="96" height="56" rx="6" fill="#f1f5f9" stroke="#e2e8f0" />
                <rect x="18" y="24" width="60" height="8" rx="2" fill="#e6eef8" />
                <rect x="18" y="36" width="40" height="6" rx="2" fill="#e6eef8" />
                <circle cx="96" cy="40" r="16" fill="#eef2ff" stroke="#e0e7ff" />
                <path d="M88 36h16v8H88z" fill="#c7d2fe" />
              </svg>
              <div>Belum ada meeting. Buat meeting pertama Anda.</div>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredMeetings.map((m) => (
                <li key={m.id} className="p-4 bg-white rounded-lg border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString('ja-JP')}</p>
                    {m.qr_payload && (
                      <p className="mt-2 text-xs text-slate-500 truncate max-w-md">Payload: <span className="font-mono text-xs text-slate-700">{m.qr_payload}</span></p>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    <button
                      onClick={() => openQr(m)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700 text-sm"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR
                    </button>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(m.qr_payload || m.id); }}
                      className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm"
                      title="Copy payload or id"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => navigator.clipboard?.writeText(m.id)}
                      className="px-3 py-2 text-sm border rounded-md"
                      title="Copy meeting id"
                    >
                      ID
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right / Sidebar widgets */}
        <aside className="space-y-6">
          <QuickActions />

          <RecentActivity recentActivity={[]} />
        </aside>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowQrModal(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-md">
                  <QrCode className="w-6 h-6 text-indigo-700" />
                </div>
                <h3 className="text-lg font-semibold">QR Payload</h3>
              </div>
              <button className="text-slate-500" onClick={() => setShowQrModal(false)}>Close</button>
            </div>

            <div className="mt-4">
              {qrPayload ? (
                <pre className="bg-slate-50 p-4 rounded-md overflow-auto text-sm">{qrPayload}</pre>
              ) : (
                <p className="text-sm text-slate-500">Tidak ada payload QR untuk ditampilkan.</p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => { qrPayload && navigator.clipboard?.writeText(qrPayload); }}
                className="px-3 py-2 bg-emerald-600 text-white rounded-md mr-2"
              >
                Salin payload
              </button>
              <button onClick={() => setShowQrModal(false)} className="px-3 py-2 border rounded-md">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

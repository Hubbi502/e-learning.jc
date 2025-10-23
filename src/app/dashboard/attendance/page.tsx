"use client";
import React, { useEffect, useState } from 'react';

export default function AttendanceDashboard() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [qr, setQr] = useState('');

  async function fetchMeetings() {
    const res = await fetch('/api/admin/attendance');
    const data = await res.json();
    if (data.success) setMeetings(data.meetings || []);
  }

  useEffect(() => { fetchMeetings(); }, []);

  async function createMeeting(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/attendance', { method: 'POST', body: JSON.stringify({ title }) });
    const data = await res.json();
    if (data.success) {
      setQr(data.qr_payload);
      fetchMeetings();
    } else {
      alert('Failed to create meeting');
    }
  }

  return (
    <div>
      <h1>Attendance Dashboard</h1>
      <form onSubmit={createMeeting}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" />
        <button type="submit">Create Meeting & Generate QR</button>
      </form>

      {qr && (
        <div>
          <h3>QR Payload (scan this):</h3>
          <pre>{qr}</pre>
        </div>
      )}

      <h2>Recent Meetings</h2>
      <ul>
        {meetings.map((m) => (
          <li key={m.id}>{m.title} - {new Date(m.created_at).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}

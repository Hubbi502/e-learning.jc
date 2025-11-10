import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attendance Dashboard | E-Learning Management System',
  description: 'Kelola kehadiran siswa dengan mudah. Buat meeting, bagikan QR code, dan pantau daftar kehadiran secara real-time dengan dashboard yang user-friendly.',
  keywords: [
    'attendance management',
    'student attendance',
    'e-learning attendance',
    'QR code attendance',
    'kehadiran siswa',
    'manajemen absensi',
    'dashboard kehadiran',
    'sistem absensi online'
  ],
  authors: [{ name: 'E-Learning Team' }],
  creator: 'E-Learning Platform',
  publisher: 'E-Learning Platform',
  openGraph: {
    title: 'Attendance Dashboard | E-Learning Management System',
    description: 'Kelola kehadiran siswa dengan dashboard yang modern, responsif, dan user-friendly',
    type: 'website',
    locale: 'id_ID',
    siteName: 'E-Learning Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Attendance Dashboard | E-Learning Management System',
    description: 'Kelola kehadiran siswa dengan dashboard yang modern, responsif, dan user-friendly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

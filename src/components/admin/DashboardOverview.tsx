"use client";

import React, { useState, useEffect } from 'react';
import { LoadingSpinner, StatsCards, TopStudents, RecentActivity, QuickActions } from './dashboard';

interface DashboardStats {
  totalQuestions: number;
  totalExams: number;
  totalStudents: number;
  activeExams: number;
  topStudents: Array<{
    id: string;
    name: string;
    class: string;
    averageScore: number;
    totalExams: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'exam' | 'student' | 'question';
    message: string;
    timestamp: string;
  }>;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    totalExams: 0,
    totalStudents: 0,
    activeExams: 0,
    topStudents: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid with Japanese design */}
      <StatsCards 
        totalQuestions={stats.totalQuestions}
        totalExams={stats.totalExams}
        totalStudents={stats.totalStudents}
        activeExams={stats.activeExams}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Students with Japanese design */}
        <TopStudents topStudents={stats.topStudents} />

        {/* Recent Activity with Japanese design */}
        <RecentActivity recentActivity={stats.recentActivity} />
      </div>

      {/* Quick Actions with Japanese design */}
      <QuickActions />
    </div>
  );
}

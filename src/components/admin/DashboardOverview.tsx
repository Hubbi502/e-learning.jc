"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, TrendingUp, Award, Clock } from 'lucide-react';

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
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-slate-200 border-t-indigo-600 shadow-lg"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-md animate-pulse"></div>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mt-6 font-medium tracking-wide">読み込み中... Loading dashboard</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Questions',
      titleJp: '質問総数',
      value: stats.totalQuestions,
      icon: BookOpen,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      textColor: 'text-indigo-700',
      shadowColor: 'shadow-blue-200'
    },
    {
      title: 'Total Exams',
      titleJp: '試験総数',
      value: stats.totalExams,
      icon: Calendar,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      textColor: 'text-teal-700',
      shadowColor: 'shadow-emerald-200'
    },
    {
      title: 'Total Students',
      titleJp: '学生総数',
      value: stats.totalStudents,
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-700',
      shadowColor: 'shadow-purple-200'
    },
    {
      title: 'Active Exams',
      titleJp: '進行中試験',
      value: stats.activeExams,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      textColor: 'text-orange-700',
      shadowColor: 'shadow-amber-200'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid with Japanese design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] border border-white/50 backdrop-blur-sm`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-col space-y-1 mb-4">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 tracking-wider uppercase">{card.titleJp}</p>
                    <p className="text-xs text-slate-500 font-medium">{card.title}</p>
                  </div>
                  <p className={`text-2xl sm:text-3xl font-bold ${card.textColor} leading-none tracking-tight`}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-3 sm:p-4 shadow-lg ${card.shadowColor}/50`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              {/* Subtle decorative element */}
              <div className="mt-4 h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Students with Japanese design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 border border-slate-200/50">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-2.5 shadow-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">優秀な学生</h2>
              <p className="text-sm text-slate-600">Top Students</p>
            </div>
          </div>
          
          {stats.topStudents.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.topStudents.map((student, index) => (
                <div key={student.id} className="group flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 border border-slate-200/50 hover:border-indigo-200">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' : 
                        index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 
                        'bg-gradient-to-br from-slate-300 to-slate-500'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 text-sm sm:text-base truncate group-hover:text-indigo-700 transition-colors">{student.name}</p>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">{student.class}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-700 transition-colors">{student.averageScore.toFixed(1)}%</p>
                    <p className="text-xs sm:text-sm text-slate-500">{student.totalExams} 試験</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 mx-auto w-fit">
                <Award className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
              </div>
              <p className="text-slate-500 text-sm sm:text-base mt-4">学生データがありません</p>
              <p className="text-slate-400 text-xs sm:text-sm">No student data available</p>
            </div>
          )}
        </div>

        {/* Recent Activity with Japanese design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 border border-slate-200/50">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">最近の活動</h2>
              <p className="text-sm text-slate-600">Recent Activity</p>
            </div>
          </div>
          
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="group flex items-start space-x-4 p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 rounded-xl transition-all duration-300 border border-transparent hover:border-indigo-200">
                  <div className={`
                    w-3 h-3 rounded-full mt-2 flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-125
                    ${activity.type === 'exam' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 
                      activity.type === 'student' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                      'bg-gradient-to-r from-purple-400 to-purple-600'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-slate-900 leading-relaxed group-hover:text-indigo-800 transition-colors">{activity.message}</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                      {new Date(activity.timestamp).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 mx-auto w-fit">
                <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
              </div>
              <p className="text-slate-500 text-sm sm:text-base mt-4">最近の活動がありません</p>
              <p className="text-slate-400 text-xs sm:text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions with Japanese design */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 border border-slate-200/50">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl p-2.5 shadow-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">クイックアクション</h2>
            <p className="text-sm text-slate-600">Quick Actions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <button className="group p-6 sm:p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 mx-auto w-fit mb-4 group-hover:shadow-lg transition-all duration-300">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">新しい質問を追加</p>
            <p className="text-xs text-slate-500 mt-1">Add New Question</p>
          </button>
          
          <button className="group p-6 sm:p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 mx-auto w-fit mb-4 group-hover:shadow-lg transition-all duration-300">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">新しい試験を作成</p>
            <p className="text-xs text-slate-500 mt-1">Create New Exam</p>
          </button>
          
          <button className="group p-6 sm:p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg sm:col-span-2 xl:col-span-1">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 mx-auto w-fit mb-4 group-hover:shadow-lg transition-all duration-300">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700 group-hover:text-purple-700 transition-colors">全学生を表示</p>
            <p className="text-xs text-slate-500 mt-1">View All Students</p>
          </button>
        </div>
      </div>
    </div>
  );
}

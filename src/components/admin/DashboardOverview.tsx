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
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm sm:text-base text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Exams',
      value: stats.totalExams,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Active Exams',
      value: stats.activeExams,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <div className="flex items-center">
                <div className={`${card.color} rounded-xl p-2.5 sm:p-3 shadow-sm`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${card.textColor} leading-tight`}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Students */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4 sm:mb-6">
            <Award className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Top Students</h2>
          </div>
          
          {stats.topStudents.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{student.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{student.class}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{student.averageScore.toFixed(1)}%</p>
                    <p className="text-xs sm:text-sm text-gray-500">{student.totalExams} exams</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Award className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">No student data available</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4 sm:mb-6">
            <TrendingUp className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 sm:p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                  <div className={`
                    w-2 h-2 rounded-full mt-2 flex-shrink-0
                    ${activity.type === 'exam' ? 'bg-green-500' : 
                      activity.type === 'student' ? 'bg-blue-500' : 'bg-purple-500'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900 leading-relaxed">{activity.message}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <button className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 group-hover:text-indigo-500 mx-auto mb-3 transition-colors duration-200" />
            <p className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-indigo-700">Add New Question</p>
          </button>
          <button className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group">
            <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 group-hover:text-green-500 mx-auto mb-3 transition-colors duration-200" />
            <p className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-green-700">Create New Exam</p>
          </button>
          <button className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group sm:col-span-2 xl:col-span-1">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 group-hover:text-purple-500 mx-auto mb-3 transition-colors duration-200" />
            <p className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-purple-700">View All Students</p>
          </button>
        </div>
      </div>
    </div>
  );
}

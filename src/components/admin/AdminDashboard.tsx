"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  FileText,
  Calendar
} from 'lucide-react';
import { QuestionManagement } from './QuestionManagement';
import { ExamManagement } from './ExamManagement';
import { StudentManagement } from './StudentManagement';
import { DashboardOverview } from './DashboardOverview';

type TabType = 'overview' | 'questions' | 'exams' | 'students';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: BarChart3 },
    { id: 'questions' as TabType, name: 'Questions', icon: BookOpen },
    { id: 'exams' as TabType, name: 'Exams', icon: Calendar },
    { id: 'students' as TabType, name: 'Students', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'questions':
        return <QuestionManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'students':
        return <StudentManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 md:w-64 bg-white shadow-xl transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out md:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center min-w-0">
            <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-white flex-shrink-0" />
            <span className="ml-2 text-white text-lg sm:text-xl font-bold truncate">LearnJP Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white hover:text-gray-200 p-1 rounded-md hover:bg-indigo-500 transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-2 sm:px-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 sm:px-4 py-3 sm:py-3.5 text-left transition-all duration-200 rounded-lg mx-1 sm:mx-2
                    ${activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-200 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-transparent'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm sm:text-base font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-700 truncate">{user?.email}</p>
              <p className="text-xs sm:text-sm text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 hover:bg-white hover:text-red-600 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-red-200"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors mr-3"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 capitalize truncate">
                {activeTab}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">
                Welcome back, {user?.email}
              </span>
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-indigo-100 rounded-full flex items-center justify-center sm:hidden">
                <span className="text-indigo-600 text-xs font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

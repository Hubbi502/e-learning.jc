import React from 'react';
import { TrendingUp } from 'lucide-react';

interface RecentActivityItem {
  id: string;
  type: 'exam' | 'student' | 'question';
  message: string;
  timestamp: string;
}

interface RecentActivityProps {
  recentActivity: RecentActivityItem[];
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  return (
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
      
      {recentActivity.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {recentActivity.map((activity) => (
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
  );
}

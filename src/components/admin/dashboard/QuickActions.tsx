import React from 'react';
import { BookOpen, Calendar, Users } from 'lucide-react';

export function QuickActions() {
  return (
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
  );
}

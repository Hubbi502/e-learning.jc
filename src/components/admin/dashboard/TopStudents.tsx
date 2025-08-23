import React from 'react';
import { Award } from 'lucide-react';

interface TopStudent {
  id: string;
  name: string;
  class: string;
  averageScore: number;
  totalExams: number;
}

interface TopStudentsProps {
  topStudents: TopStudent[];
}

export function TopStudents({ topStudents }: TopStudentsProps) {
  return (
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
      
      {topStudents.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {topStudents.map((student, index) => (
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
  );
}

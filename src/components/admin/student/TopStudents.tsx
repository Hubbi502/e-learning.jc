import React from 'react';
import { Trophy } from 'lucide-react';
import { Student } from './types';
import { getTopStudents } from './utils';

interface TopStudentsProps {
  students: Student[];
  limit?: number;
}

export function TopStudents({ students, limit = 10 }: TopStudentsProps) {
  const topStudents = getTopStudents(students, limit);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Top {limit} Students</h2>
      </div>
      
      {topStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topStudents.map((student, index) => (
            <div key={student.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 text-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.class}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-medium">{student.stats.averageScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Best Score:</span>
                  <span className="font-medium">{student.stats.bestScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Exams Taken:</span>
                  <span className="font-medium">{student.stats.totalExams}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No student performance data available</p>
      )}
    </div>
  );
}

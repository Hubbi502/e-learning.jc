import React from 'react';
import { BookOpen, Users, Calendar, Clock, LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  titleJp: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  bgGradient: string;
  textColor: string;
  shadowColor: string;
}

interface StatsCardsProps {
  totalQuestions: number;
  totalExams: number;
  totalStudents: number;
  activeExams: number;
}

export function StatsCards({ totalQuestions, totalExams, totalStudents, activeExams }: StatsCardsProps) {
  const statCards: StatCard[] = [
    {
      title: 'Total Questions',
      titleJp: '質問総数',
      value: totalQuestions,
      icon: BookOpen,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      textColor: 'text-indigo-700',
      shadowColor: 'shadow-blue-200'
    },
    {
      title: 'Total Exams',
      titleJp: '試験総数',
      value: totalExams,
      icon: Calendar,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      textColor: 'text-teal-700',
      shadowColor: 'shadow-emerald-200'
    },
    {
      title: 'Total Students',
      titleJp: '学生総数',
      value: totalStudents,
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-700',
      shadowColor: 'shadow-purple-200'
    },
    {
      title: 'Active Exams',
      titleJp: '進行中試験',
      value: activeExams,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      textColor: 'text-orange-700',
      shadowColor: 'shadow-amber-200'
    }
  ];

  return (
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
  );
}

import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';

interface ViolationWarningModalProps {
  show: boolean;
  violations: number;
  isDark: boolean;
}

export default function ViolationWarningModal({
  show,
  violations,
  isDark
}: ViolationWarningModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl border ${
        isDark 
          ? 'bg-slate-800 border-red-500/20' 
          : 'bg-white border-red-200'
      }`}>
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className={`text-xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Exam Violation Detected!
          </h3>
          <p className={`text-sm mb-4 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            You have switched tabs or lost focus. This has been recorded.
          </p>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
            violations >= 2 
              ? 'bg-red-500/20 text-red-600' 
              : 'bg-yellow-500/20 text-yellow-600'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span className="font-semibold">
              Violations: {violations}/3
            </span>
          </div>
          {violations >= 2 && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              ⚠️ One more violation will auto-submit your exam!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

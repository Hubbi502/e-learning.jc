"use client"

import React, { FormEvent } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { LoginFormProps } from '../types/types';

export default function LoginForm({
  isDark,
  loginType,
  setLoginType,
  showPassword,
  setShowPassword,
  isLoading,
  formData,
  handleInputChange,
  handleSubmit,
  isVisible,
  error
}: LoginFormProps) {
  return (
    <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    } ${
      isDark 
        ? 'bg-slate-800/30 border-purple-500/20' 
        : 'bg-white/80 border-red-200/50'
    }`}>
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`text-6xl mb-4 animate-pulse ${
          loginType === 'admin'
            ? isDark ? 'text-indigo-300' : 'text-orange-500'
            : isDark ? 'text-purple-300' : 'text-red-500'
        }`}>
          {loginType === 'admin' ? '管理' : '入門'}
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Welcome Back
        </h2>
        <p className={`text-lg ${
          isDark ? 'text-purple-100' : 'text-gray-600'
        }`}>
          {loginType === 'admin' ? 'Administrator Access' : 'Continue your learning journey'}
        </p>
      </div>

      {/* Login Type Toggle */}
      {setLoginType && (
        <div className="mb-6">
          <div className={`flex rounded-xl p-1 ${
            isDark ? 'bg-slate-700/50' : 'bg-gray-100'
          }`}>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                loginType === 'admin'
                  ? isDark
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-orange-500 text-white shadow-lg'
                  : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginType('student')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                loginType === 'student'
                  ? isDark
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-red-500 text-white shadow-lg'
                  : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Student
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={`mb-4 p-4 rounded-xl ${
          isDark 
            ? 'bg-red-900/50 border border-red-500/50 text-red-200' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <div className="space-y-6">
        
        {/* Email Field */}
        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
            isDark ? 'text-purple-400' : 'text-red-400'
          }`}>
            <Mail size={20} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className={`w-full pl-10 pr-4 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500' 
                : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-red-500 focus:border-red-500'
            }`}
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
            isDark ? 'text-purple-400' : 'text-red-400'
          }`}>
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className={`w-full pl-10 pr-12 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-purple-500 focus:border-purple-500' 
                : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-red-500 focus:border-red-500'
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
              isDark ? 'text-purple-400 hover:text-purple-300' : 'text-red-400 hover:text-red-500'
            }`}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>


        {/* Login Button */}
        <button
          onClick={async (e: FormEvent) => {
            e.preventDefault();
            return await handleSubmit(e as any);
          }}
          disabled={isLoading}
          className={`w-full mt-8 py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${
            loginType === 'admin'
              ? isDark
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:ring-indigo-500/50'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 focus:ring-orange-500/50'
              : isDark
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 focus:ring-purple-500/50'
                : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 focus:ring-red-500/50'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>Sign In</span>
              <span className="text-xl">入る</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

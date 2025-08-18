"use client"

import React from 'react';
import Navigation from './Navigation';
import LoginForm from './LoginForm';
import { LoginContainerProps } from '../types/types';

export default function LoginContainer({
  isDark,
  toggleTheme,
  isVisible,
  showPassword,
  setShowPassword,
  loginType,
  setLoginType,
  isLoading,
  formData,
  handleInputChange,
  handleSubmit,
  error
}: LoginContainerProps) {
  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>
      
      {/* Navigation */}
      <Navigation isDark={isDark} toggleTheme={toggleTheme} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          <LoginForm
            isDark={isDark}
            loginType={loginType}
            setLoginType={setLoginType}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isVisible={isVisible}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

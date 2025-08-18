"use client"

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginContainer from '../../components/login/ui/LoginContainer';

export default function JapaneseLMSLogin() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();
  
  const [isDark, setIsDark] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('admin'); // 'student' or 'admin'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Redirect if already logged in
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  interface FormData {
    email: string;
    password: string;
    rememberMe: boolean;
  }

  interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & {
      name: keyof FormData;
      value: string;
      type: string;
      checked: boolean;
    };
  }

  const handleInputChange = (e: InputChangeEvent): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  interface LoginSubmitEvent extends FormEvent<HTMLFormElement> {
    preventDefault(): void;
  }

  const handleSubmit = async (e: LoginSubmitEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // For now, we only support admin login since student login isn't implemented
      if (loginType === 'student') {
        setError('Student login is not yet implemented. Please use admin login.');
        setIsLoading(false);
        return;
      }

      // Use email field as username for admin login
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect will happen automatically via useEffect when user state updates
        router.push('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer
      isDark={isDark}
      toggleTheme={toggleTheme}
      isVisible={isVisible}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      loginType={loginType}
      isLoading={isLoading}
      formData={formData}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      error={error}
    />
  );
}
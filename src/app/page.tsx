"use client";
import React, { useState, useEffect } from 'react';
import { LandingContainer } from '../components/landing/ui';

export default function JapaneseLMSLanding() {
  const [isDark, setIsDark] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };/*  */

  return (
    <LandingContainer
      isDark={isDark}
      toggleTheme={toggleTheme}
      isVisible={isVisible}
    />
  );
}
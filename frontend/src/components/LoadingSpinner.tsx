'use client';

// ============================================
// CodeMentor AI — Loading Spinner Component
// ============================================

import React from 'react';

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional text to display below the spinner */
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Animated spinner with gradient */}
      <div className="relative">
        <div
          className={`${sizeMap[size]} rounded-full border-2 border-white/10 border-t-accent-blue animate-spin`}
        />
        {/* Inner glow */}
        <div
          className={`absolute inset-0 ${sizeMap[size]} rounded-full bg-accent-blue/10 animate-pulse-slow`}
        />
      </div>

      {text && (
        <p className="text-sm text-white/50 animate-pulse">{text}</p>
      )}
    </div>
  );
}

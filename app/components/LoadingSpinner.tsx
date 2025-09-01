'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  global?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary', 
  text, 
  global = false 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-gray-300 border-t-black',
    secondary: 'border-gray-300 border-t-gray-600',
    white: 'border-gray-600 border-t-white'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  if (global) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin-slow"></div>
            {/* Inner ring */}
            <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-black dark:border-t-white rounded-full animate-spin"></div>
            {/* Center dot */}
            <div className="absolute inset-1/2 w-2 h-2 bg-black dark:bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {text || 'Loading'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Please wait...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} rounded-full animate-spin`}></div>
        <div className="absolute inset-2 border-2 border-transparent border-t-current rounded-full animate-spin-reverse opacity-50"></div>
      </div>
      {text && (
        <div className={`text-center ${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;

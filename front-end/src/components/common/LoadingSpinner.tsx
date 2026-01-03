import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'green' | 'blue';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'white',
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    blue: 'border-blue-600 border-t-transparent'
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && <span className="ml-2">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
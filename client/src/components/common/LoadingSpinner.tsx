import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${
        fullHeight ? 'min-h-[50vh]' : ''
      }`}
    >
      <Loader2 className={`${sizeMap[size]} text-[#B8955A] animate-spin mb-3`} />
      {message && <p className="text-sm font-medium text-[#77716B]">{message}</p>}
    </div>
  );
};

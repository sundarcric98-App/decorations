import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#B8955A] hover:bg-[#A17D46] text-white shadow-luxury hover:shadow-luxury-lg focus:ring-[#B8955A]/50',
    gold:
      'bg-gradient-to-r from-[#D4B77D] via-[#B8955A] to-[#96743A] hover:from-[#CEA96E] hover:to-[#846235] text-white shadow-luxury hover:shadow-luxury-lg focus:ring-[#B8955A]/50 border border-[#EBDDBF]/30',
    secondary:
      'bg-[#F3ECE2] hover:bg-[#E8E0D6] text-[#24211F] focus:ring-[#B8955A]/30',
    outline:
      'border border-[#B8955A] text-[#B8955A] hover:bg-[#B8955A] hover:text-white focus:ring-[#B8955A]/40 bg-transparent',
    ghost:
      'text-[#24211F] hover:bg-[#F3ECE2] hover:text-[#B8955A] focus:ring-[#B8955A]/20 bg-transparent',
    danger:
      'bg-[#C74646] hover:bg-[#A83535] text-white shadow-sm focus:ring-[#C74646]/50',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

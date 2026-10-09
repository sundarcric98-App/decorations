import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const variantStyles = {
    gold: 'bg-[#FAF7F2] text-[#96743A] border border-[#B8955A]/30',
    success: 'bg-[#EBF7F0] text-[#24845D] border border-[#24845D]/20',
    warning: 'bg-[#FEF6EE] text-[#D97706] border border-[#D97706]/20',
    danger: 'bg-[#FDF2F2] text-[#C74646] border border-[#C74646]/20',
    info: 'bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20',
    neutral: 'bg-[#F3ECE2] text-[#56504A] border border-[#E8E0D6]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
};

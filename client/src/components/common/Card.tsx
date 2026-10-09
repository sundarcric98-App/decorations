import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'gold-hover' | 'bordered';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const base = 'bg-white rounded-2xl border border-[#E8E0D6] shadow-sm overflow-hidden transition-all duration-300';

  const variantStyles = {
    default: 'hover:shadow-card',
    'gold-hover': 'hover:shadow-luxury hover:border-[#B8955A]/60 hover:-translate-y-1',
    bordered: 'border-2 border-[#EBDDBF]/70 shadow-sm',
  };

  return (
    <div className={`${base} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-[#E8E0D6] ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EBDDBF] flex items-center justify-center text-[#B8955A] mb-4 shadow-sm">
        {icon || <PackageOpen className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="font-serif text-lg font-bold text-[#24211F] mb-1">{title}</h3>
      <p className="text-sm text-[#77716B] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="gold" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

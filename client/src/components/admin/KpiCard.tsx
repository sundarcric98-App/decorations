import React from 'react';
import { Card } from '../common/Card';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}) => {
  return (
    <Card
      className={`p-5 transition-all duration-300 ${
        highlight
          ? 'border-2 border-[#B8955A]/50 bg-gradient-to-br from-white to-[#FAF7F2] shadow-luxury'
          : 'hover:border-[#B8955A]/40'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#77716B] mb-1">
            {title}
          </p>
          <h3 className="font-serif text-2xl font-bold text-[#24211F] tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#77716B] mt-1 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'bg-[#EBF7F0] text-[#24845D]'
                    : 'bg-[#FDF2F2] text-[#C74646]'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-[11px] text-[#77716B]">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EBDDBF] flex items-center justify-center text-[#B8955A] shadow-sm shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
};

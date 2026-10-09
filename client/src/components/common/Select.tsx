import React, { forwardRef } from 'react';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-[#24211F]">
            {label}
            {props.required && <span className="text-[#C74646] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          <select
            id={selectId}
            ref={ref}
            className={`w-full rounded-xl bg-white border text-sm text-[#24211F] px-3.5 py-2.5 appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${
              error
                ? 'border-[#C74646] focus:border-[#C74646] focus:ring-[#C74646]/20'
                : 'border-[#E8E0D6] focus:border-[#B8955A] focus:ring-[#B8955A]/20'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-[#C74646] mt-1 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#77716B] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

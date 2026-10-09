import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#24211F]">
            {label}
            {props.required && <span className="text-[#C74646] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl bg-white border text-sm text-[#24211F] placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-[#C74646] focus:border-[#C74646] focus:ring-[#C74646]/20'
                : 'border-[#E8E0D6] focus:border-[#B8955A] focus:ring-[#B8955A]/20'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#C74646] mt-1 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#77716B] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

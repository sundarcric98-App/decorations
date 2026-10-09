import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-[#24211F]">
            {label}
            {props.required && <span className="text-[#C74646] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-xl bg-white border text-sm text-[#24211F] placeholder-gray-400 p-3.5 focus:outline-none focus:ring-2 transition-all duration-200 resize-y ${
            error
              ? 'border-[#C74646] focus:border-[#C74646] focus:ring-[#C74646]/20'
              : 'border-[#E8E0D6] focus:border-[#B8955A] focus:ring-[#B8955A]/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#C74646] mt-1 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#77716B] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

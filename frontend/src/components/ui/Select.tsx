import React, { forwardRef, useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      options,
      children,
      id: customId,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-[#202020] dark:text-[#FFFDF7] tracking-wider uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={`w-full min-h-[44px] appearance-none rounded-xl bg-[#FFFFFF] dark:bg-[#1E1913] border text-sm text-[#202020] dark:text-[#FFFDF7] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#FFFDF7] dark:focus:ring-offset-[#14110C] disabled:opacity-50 disabled:cursor-not-allowed pl-4 pr-10 py-2.5 cursor-pointer ${
              hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-[#EDE7D9] dark:border-[#332B20] hover:border-[#E2DAC8] dark:hover:border-[#42382A] focus:border-[#FFBF00] focus:ring-[#FFBF00]/25'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#FFFFFF] dark:bg-[#1E1913] text-[#202020] dark:text-[#FFFDF7]">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-[#666666] dark:text-[#B8AF9F]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {hasError && (
          <p id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {!hasError && hint && (
          <p id={`${id}-hint`} className="text-xs text-[#666666] dark:text-[#B8AF9F]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

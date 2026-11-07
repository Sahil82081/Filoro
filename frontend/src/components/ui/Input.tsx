import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
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
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#666666] dark:text-[#B8AF9F]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={`w-full min-h-[44px] rounded-xl bg-[#FFFFFF] dark:bg-[#1E1913] border text-sm text-[#202020] dark:text-[#FFFDF7] placeholder:text-[#666666]/50 dark:placeholder:text-[#B8AF9F]/40 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#FFFDF7] dark:focus:ring-offset-[#14110C] disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : 'pl-4'
            } ${rightIcon || hasError ? 'pr-10' : 'pr-4'} py-2.5 ${
              hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-[#EDE7D9] dark:border-[#332B20] hover:border-[#E2DAC8] dark:hover:border-[#42382A] focus:border-[#FFBF00] focus:ring-[#FFBF00]/25'
            } ${className}`}
            {...props}
          />
          {hasError && !rightIcon && (
            <div className="absolute right-3.5 pointer-events-none text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {rightIcon && !hasError && (
            <div className="absolute right-3.5 pointer-events-none text-[#666666] dark:text-[#B8AF9F]">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary:
    'bg-[#FFBF00] hover:bg-[#E5AC00] active:bg-[#CC9900] text-[#202020] font-semibold shadow-warm-sm hover:shadow-gold-glow border border-[#E5AC00] focus-visible:ring-[#FFBF00] relative overflow-hidden group',
  secondary:
    'bg-[#FFFFFF] dark:bg-[#1E1913] hover:bg-[#FBF3DF] dark:hover:bg-[#2A231A] active:bg-[#F2CF7E]/40 text-[#202020] dark:text-[#FFFDF7] border border-[#EDE7D9] dark:border-[#332B20] hover:border-[#F2CF7E] dark:hover:border-[#FFBF00]/50 shadow-warm-sm focus-visible:ring-[#FFBF00]',
  accent:
    'bg-[#FF7900] hover:bg-[#E66D00] active:bg-[#CC6100] text-[#FFFFFF] font-semibold shadow-warm-sm hover:shadow-orange-glow border border-[#E66D00] focus-visible:ring-[#FF7900]',
  outline:
    'bg-transparent border border-[#EDE7D9] dark:border-[#332B20] text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FBF3DF]/60 dark:hover:bg-[#221D16] hover:border-[#F2CF7E] dark:hover:border-[#FFBF00]/50 focus-visible:ring-[#FFBF00]',
  ghost:
    'bg-transparent hover:bg-[#F8F5EE] dark:hover:bg-[#221D16] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent focus-visible:ring-[#FFBF00]',
  danger:
    'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 active:bg-red-200 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 shadow-warm-sm focus-visible:ring-red-500',
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-xs font-medium rounded-xl gap-1.5 min-h-[36px] sm:min-h-0',
  md: 'px-5 py-2.5 text-sm font-medium rounded-xl gap-2 min-h-[44px]',
  lg: 'px-6 py-3 text-base font-semibold rounded-2xl gap-2.5 min-h-[48px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileHover={!isDisabled && !shouldReduceMotion ? { scale: 1.015 } : undefined}
        whileTap={!isDisabled && !shouldReduceMotion ? { scale: 0.985 } : undefined}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={`inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF7] dark:focus-visible:ring-offset-[#14110C] disabled:opacity-40 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...(props as any)}
      >
        {/* Subtle shimmer sweep on primary buttons */}
        {variant === 'primary' && (
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        )}

        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

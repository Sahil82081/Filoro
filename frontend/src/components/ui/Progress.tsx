import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ProgressProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  label?: string;
  showValue?: boolean;
  variant?: 'brand' | 'emerald' | 'amber' | 'coral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  brand: 'bg-gradient-to-r from-[#FF7900] to-[#FFBF00]',
  emerald: 'bg-[#16A34A]',
  amber: 'bg-[#FFBF00]',
  coral: 'bg-[#FF7900]',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  indeterminate = false,
  label,
  showValue = false,
  variant = 'brand',
  size = 'md',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-[#666666] dark:text-[#B8AF9F]">{label}</span>}
          {showValue && !indeterminate && (
            <span className="font-semibold text-[#FF7900]">{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full bg-[#F8F5EE] dark:bg-[#221D16] border border-[#EDE7D9] dark:border-[#332B20] rounded-full overflow-hidden ${sizeStyles[size]}`}
      >
        {indeterminate ? (
          <motion.div
            className={`h-full ${variantStyles[variant]} rounded-full`}
            initial={{ x: '-100%', width: '40%' }}
            animate={
              shouldReduceMotion
                ? { x: '0%', width: '100%' }
                : { x: ['-100%', '250%'] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'easeInOut',
                  }
            }
          />
        ) : (
          <motion.div
            className={`h-full ${variantStyles[variant]} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: 'easeOut' }
            }
          />
        )}
      </div>
    </div>
  );
};

export default Progress;

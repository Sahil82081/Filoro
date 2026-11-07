import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'white' | 'slate' | 'coral';
  className?: string;
  label?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

const spinnerVariants = {
  brand: 'border-brand-200 border-t-brand-600',
  white: 'border-white/30 border-t-white',
  slate: 'border-slate-200 border-t-slate-600',
  coral: 'border-coral-200 border-t-coral-500',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'brand',
  className = '',
  label = 'Loading...',
}) => {
  return (
    <div role="status" className="inline-flex items-center justify-center">
      <div
        className={`rounded-full animate-spin ${spinnerSizes[size]} ${spinnerVariants[variant]} ${className}`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const roundedMap = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', rounded = 'md' }) => {
  return (
    <div
      aria-hidden="true"
      className={`bg-slate-200/80 animate-pulse ${roundedMap[rounded]} ${className}`}
    />
  );
};

export const DotsLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`inline-flex items-center space-x-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={shouldReduceMotion ? undefined : { opacity: 0.3, y: 0 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: -4 }}
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: 'reverse' as const,
                  ease: 'easeInOut' as const,
                  delay: i * 0.15,
                }
          }
          className="w-2 h-2 rounded-full bg-brand-500"
        />
      ))}
    </div>
  );
};

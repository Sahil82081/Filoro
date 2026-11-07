import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export interface SuccessStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = 'Operation Completed',
  message,
  action,
  icon,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      className={`p-6 rounded-2xl border border-emerald-500/30 bg-[#FFFFFF] dark:bg-[#1E1913] text-[#202020] dark:text-[#FFFDF7] flex flex-col items-center text-center sm:flex-row sm:text-left gap-4 shadow-warm-xs ${className}`}
    >
      <motion.div
        initial={shouldReduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
        animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 shadow-warm-xs"
      >
        {icon || <CheckCircle2 className="w-6 h-6" />}
      </motion.div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7]">{title}</h4>
        {message && <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1 leading-relaxed">{message}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};


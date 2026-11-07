import React from 'react';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] shadow-warm-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FFBF00]/10 dark:bg-[#FFBF00]/20 border border-[#FFBF00]/30 flex items-center justify-center text-[#FF7900] dark:text-[#FFBF00] mb-4 shadow-warm-xs">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-display font-semibold text-[#202020] dark:text-[#FFFDF7] tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-[#666666] dark:text-[#B8AF9F] max-w-sm mt-1.5 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};


import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  icon,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-6 rounded-2xl border border-red-500/30 bg-[#FFFFFF] dark:bg-[#1E1913] text-[#202020] dark:text-[#FFFDF7] flex flex-col items-center text-center sm:flex-row sm:text-left gap-4 shadow-warm-xs ${className}`}
    >
      <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/25 shrink-0">
        {icon || <AlertCircle className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7]">{title}</h4>
        <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="shrink-0">
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};


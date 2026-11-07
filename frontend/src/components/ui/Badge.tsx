import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'coral' | 'emerald' | 'amber' | 'sky' | 'neutral' | 'outline' | 'champagne' | 'lemon' | 'orange';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  brand: 'bg-[#FFBF00]/15 dark:bg-[#FFBF00]/20 text-[#202020] dark:text-[#FFBF00] border-[#FFBF00]/40',
  coral: 'bg-[#FF7900]/15 dark:bg-[#FF7900]/20 text-[#FF7900] border-[#FF7900]/30',
  orange: 'bg-[#FF7900]/15 dark:bg-[#FF7900]/20 text-[#FF7900] border-[#FF7900]/30',
  champagne: 'bg-[#FBF3DF] dark:bg-[#251F17] text-[#202020] dark:text-[#F2CF7E] border-[#F2CF7E] dark:border-[#4A3D2A]',
  lemon: 'bg-[#FFE642]/35 dark:bg-[#FFE642]/20 text-[#202020] dark:text-[#FFE642] border-[#FFE642]/60',
  emerald: 'bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#16A34A] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
  amber: 'bg-[#FFF5D6] dark:bg-[#251F17] text-[#202020] dark:text-[#F2CF7E] border-[#FFBF00]/35 dark:border-[#FFBF00]/30',
  sky: 'bg-[#F8F5EE] dark:bg-[#1E1913] text-[#202020] dark:text-[#FFFDF7] border-[#EDE7D9] dark:border-[#332B20]',
  neutral: 'bg-[#F8F5EE] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] border-[#EDE7D9] dark:border-[#332B20]',
  outline: 'bg-transparent text-[#202020] dark:text-[#FFFDF7] border-[#EDE7D9] dark:border-[#332B20]',
};

const dotColors: Record<string, string> = {
  brand: 'bg-[#FFBF00]',
  coral: 'bg-[#FF7900]',
  orange: 'bg-[#FF7900]',
  champagne: 'bg-[#F2CF7E]',
  lemon: 'bg-[#FFE642]',
  emerald: 'bg-[#16A34A]',
  amber: 'bg-[#FFBF00]',
  sky: 'bg-[#666666]',
  neutral: 'bg-[#888888]',
  outline: 'bg-[#888888]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] font-semibold rounded-full gap-1 tracking-wider uppercase',
  md: 'px-2.5 py-1 text-xs font-semibold rounded-full gap-1.5 tracking-wider uppercase',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  const chosenVariant = variantStyles[variant] ? variant : 'brand';

  return (
    <span
      className={`inline-flex items-center border select-none transition-colors duration-200 ${variantStyles[chosenVariant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[chosenVariant]}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

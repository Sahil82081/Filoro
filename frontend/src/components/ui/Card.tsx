import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'flat' | 'accent';
  animateEntrance?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  animateEntrance = false,
  className = '',
  children,
  onKeyDown,
  onClick,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isInteractive = variant === 'interactive';

  const variantStyles = {
    default:
      'bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] shadow-warm-card',
    interactive:
      'bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] shadow-warm-card hover:border-[#FFBF00] dark:hover:border-[#FFBF00] hover:shadow-warm-hover transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFBF00] focus:ring-offset-2 focus:ring-offset-[#FFFDF7] dark:focus:ring-offset-[#14110C]',
    flat:
      'bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] shadow-none',
    accent:
      'bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] shadow-warm-card relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-[#FF7900] via-[#FFBF00] to-[#FFE642]',
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as any);
    }
    onKeyDown?.(e);
  };

  const Wrapper = animateEntrance || isInteractive ? motion.div : 'div';
  const motionProps =
    !shouldReduceMotion
      ? {
          initial: animateEntrance ? { opacity: 0, y: 14 } : undefined,
          animate: animateEntrance ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
          whileHover: isInteractive ? { y: -4 } : undefined,
        }
      : {};

  return (
    <Wrapper
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className={`rounded-2xl transition-colors duration-200 ${variantStyles[variant]} ${className}`}
      {...(motionProps as any)}
      {...props}
    >
      {children}
    </Wrapper>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-5 sm:p-6 pb-3 flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`text-base sm:text-lg font-display font-bold text-[#202020] dark:text-[#FFFDF7] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F] leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-5 sm:p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-5 sm:p-6 pt-3 border-t border-[#EDE7D9] dark:border-[#332B20] flex items-center ${className}`} {...props}>
    {children}
  </div>
);

export default Card;

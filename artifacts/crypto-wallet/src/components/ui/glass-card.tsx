import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: 'primary' | 'accent' | 'none';
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowColor = 'none', interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
          interactive && "hover:-translate-y-1 hover:shadow-xl hover:bg-white/10 cursor-pointer",
          glowColor === 'primary' && "hover:shadow-primary/20",
          glowColor === 'accent' && "hover:shadow-accent/20",
          className
        )}
        {...props}
      >
        {glowColor !== 'none' && (
          <div className={cn(
            "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none",
            glowColor === 'primary' ? "bg-primary" : "bg-accent"
          )} />
        )}
        <div className="relative z-10">
          {props.children}
        </div>
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

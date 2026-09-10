import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-3 text-fg-muted',
        brand: 'bg-brand-subtle text-brand-fg',
        accent: 'bg-accent-subtle text-accent-fg',
        success: 'bg-success-subtle text-success-fg',
        warning: 'bg-warning-subtle text-warning-fg',
        danger: 'bg-danger-subtle text-danger-fg',
        info: 'bg-info-subtle text-info-fg',
        outline: 'border border-border-strong text-fg-muted',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

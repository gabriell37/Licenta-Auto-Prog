'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Minimal Slot: merges its props (incl. className) onto a single child element.
 * Tolerates being handed multiple children (e.g. a conditional spinner + the real
 * element) by selecting the first valid React element. Enough for `asChild`
 * patterns like <Button asChild><Link/></Button>.
 */
export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>(
  ({ children, className, ...props }, ref) => {
    const child = React.Children.toArray(children).find((c) => React.isValidElement(c)) as
      | React.ReactElement<any>
      | undefined;
    if (!child) return null;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref,
      className: cn(className, child.props.className),
    });
  }
);
Slot.displayName = 'Slot';

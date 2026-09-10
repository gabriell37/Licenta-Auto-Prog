import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';

export function Avatar({
  src,
  name,
  size = 40,
  className,
  rounded = 'full',
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  rounded?: 'full' | 'lg';
}) {
  const radius = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-brand-subtle text-brand-fg font-semibold',
        radius,
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

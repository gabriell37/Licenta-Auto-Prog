'use client';

import * as React from 'react';
import Image from 'next/image';
import { CategoryIcon } from '@/components/category-icon';
import { cn } from '@/lib/utils';

/**
 * Shop cover image with a branded fallback. If the image is missing or fails
 * to load, render a gradient + category icon so a card/profile never shows an
 * empty grey box.
 */
export function ShopCover({
  src,
  iconName,
  sizes,
  priority,
  className,
}: {
  src?: string | null;
  iconName: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const showImage = src && !failed;

  return (
    <div className={cn('absolute inset-0', className)}>
      {showImage ? (
        <Image
          src={src!}
          alt=""
          fill
          sizes={sizes ?? '(max-width: 768px) 100vw, 33vw'}
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-hover">
          <CategoryIcon name={iconName} className="h-12 w-12 text-fg-on-brand/70" />
        </div>
      )}
    </div>
  );
}

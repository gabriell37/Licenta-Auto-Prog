import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({
  rating,
  count,
  size = 14,
  showValue = true,
  className,
}: {
  rating: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`Notă ${rating.toFixed(1)} din 5${count != null ? `, ${count} recenzii` : ''}`}
    >
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(i <= rounded ? 'fill-accent text-accent' : 'fill-transparent text-border-strong')}
          />
        ))}
      </span>
      {showValue && <span className="text-sm font-semibold text-fg">{rating.toFixed(1)}</span>}
      {count != null && <span className="text-xs text-fg-subtle">({count})</span>}
    </span>
  );
}

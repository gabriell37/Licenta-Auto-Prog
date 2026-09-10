import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { RatingStars } from '@/components/rating-stars';
import { Badge } from '@/components/ui/badge';
import { ShopCover } from '@/components/consumer/shop-cover';
import { CATEGORIES } from '@/lib/enums';
import { formatRON } from '@/lib/utils';

type ShopCardShop = {
  slug: string;
  name: string;
  coverUrl: string | null;
  primaryCategory: string;
  ratingAvg: number;
  ratingCount: number;
  locality: string | null;
  county: string | null;
  services?: { priceFromBani: number; name: string }[];
};

export function ShopCard({ shop }: { shop: ShopCardShop }) {
  const cat = CATEGORIES.find((c) => c.slug === shop.primaryCategory);
  const fromPrice = shop.services?.[0]?.priceFromBani;
  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-3">
        <ShopCover src={shop.coverUrl} iconName={cat?.icon ?? 'wrench'} />
        <div className="absolute left-3 top-3 z-10">
          <Badge variant="brand" className="bg-bg/90 backdrop-blur">{cat?.nameRo ?? shop.primaryCategory}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-fg line-clamp-1">{shop.name}</h3>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-fg-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-1">{[shop.locality, shop.county].filter(Boolean).join(', ')}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {shop.ratingCount > 0 ? (
            <RatingStars rating={shop.ratingAvg} count={shop.ratingCount} />
          ) : (
            <Badge variant="accent">Nou pe AutoProg</Badge>
          )}
          {fromPrice != null && fromPrice > 0 && (
            <span className="text-sm font-semibold text-fg">{formatRON(fromPrice, { from: true })}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

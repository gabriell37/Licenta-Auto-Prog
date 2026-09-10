import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MapPin, Phone, Clock, Check, CalendarPlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { RatingStars } from '@/components/rating-stars';
import { FavoriteButton } from '@/components/consumer/favorite-button';
import { ShopCover } from '@/components/consumer/shop-cover';
import { CategoryIcon } from '@/components/category-icon';
import { getShopBySlug } from '@/lib/queries';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CATEGORIES, AMENITIES } from '@/lib/enums';
import { formatRON, formatDuration, parseJson, formatDate } from '@/lib/utils';

const DAYS = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
// Monday-first display order (JS getDay() indices).
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return { title: 'Service negăsit' };
  return { title: shop.name, description: shop.description ?? undefined };
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  const session = await getSession();
  const favorited = session
    ? !!(await prisma.favorite.findUnique({ where: { userId_shopId: { userId: session.userId, shopId: shop.id } } }))
    : false;

  const cat = CATEGORIES.find((c) => c.slug === shop.primaryCategory);
  const amenities = parseJson<string[]>(shop.amenities, []);
  const hours = parseJson<{ day: number; open: string; close: string }[]>(shop.openingHours, []);

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-3 sm:h-64 md:h-80">
        <ShopCover src={shop.coverUrl} iconName={cat?.icon ?? 'wrench'} sizes="100vw" priority />
        {/* no z-index: it must stay under the cards pulled up over the cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
      </div>

      <div className="container relative z-10 -mt-12 pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            <Card className="relative">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="brand" className="mb-2">
                      <CategoryIcon name={cat?.icon ?? 'wrench'} className="h-3 w-3" />
                      {cat?.nameRo ?? shop.primaryCategory}
                    </Badge>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">{shop.name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {[shop.addressLine, shop.locality, shop.county].filter(Boolean).join(', ')}
                      </span>
                      {shop.phone && (
                        <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" /> {shop.phone}</span>
                      )}
                    </div>
                    <div className="mt-3">
                      {shop.ratingCount > 0 ? (
                        <RatingStars rating={shop.ratingAvg} count={shop.ratingCount} size={16} />
                      ) : (
                        <Badge variant="accent">Nou pe AutoProg · fără recenzii încă</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <FavoriteButton shopId={shop.id} initial={favorited} loggedIn={!!session} />
                  </div>
                </div>

                {shop.description && <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">{shop.description}</p>}

                {amenities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {amenities.map((a) => {
                      const meta = AMENITIES.find((x) => x.key === a);
                      return (
                        <span key={a} className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-fg-muted">
                          <Check className="h-3.5 w-3.5 text-success" /> {meta?.ro ?? a}
                        </span>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            <section className="mt-6" aria-labelledby="services-heading">
              <h2 id="services-heading" className="font-display text-xl font-bold text-fg">Servicii & prețuri</h2>
              <div className="mt-3 space-y-2">
                {shop.services.length === 0 && <p className="text-sm text-fg-muted">Acest service nu a listat încă servicii.</p>}
                {shop.services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
                    <div className="min-w-0">
                      <p className="font-medium text-fg">{s.name}</p>
                      <p className="mt-0.5 text-sm text-fg-muted">
                        {formatDuration(s.durationMin)}
                        {s.priceFromBani > 0 && (
                          <> · <span className="font-semibold text-fg">{s.priceType === 'FROM' ? formatRON(s.priceFromBani, { from: true }) : formatRON(s.priceFromBani)}</span></>
                        )}
                        {s.priceType === 'QUOTE' && ' · preț la evaluare'}
                      </p>
                    </div>
                    <Button asChild size="sm" className="shrink-0">
                      <Link href={`/book/${shop.id}?service=${s.id}`}>
                        <CalendarPlus className="h-4 w-4" /> Programează
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="mt-8" aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="font-display text-xl font-bold text-fg">
                Recenzii <span className="text-fg-subtle font-normal">({shop.ratingCount})</span>
              </h2>
              <div className="mt-3 space-y-3">
                {shop.reviews.length === 0 && <p className="text-sm text-fg-muted">Încă nu există recenzii.</p>}
                {shop.reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.user.name} src={r.user.avatarUrl} size={36} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-fg">{r.user.name}</p>
                          <p className="text-xs text-fg-subtle">{formatDate(r.createdAt)}</p>
                        </div>
                        <RatingStars rating={r.rating} showValue={false} />
                      </div>
                      {r.body && <p className="mt-3 text-sm text-fg-muted">{r.body}</p>}
                      {r.reply && (
                        <div className="mt-3 rounded-lg border-l-2 border-brand bg-brand-subtle/40 p-3">
                          <p className="text-xs font-semibold text-brand-fg">Răspuns service</p>
                          <p className="mt-1 text-sm text-fg-muted">{r.reply}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardContent className="pt-5">
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/book/${shop.id}`}>
                      <CalendarPlus className="h-5 w-5" /> Programează-te
                    </Link>
                  </Button>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-fg-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" /> Confirmare instant · fără comision
                  </p>
                </CardContent>
              </Card>

              {hours.length > 0 && (
                <Card>
                  <CardContent className="pt-5">
                    <h3 className="flex items-center gap-2 font-semibold text-fg"><Clock className="h-4 w-4 text-brand" /> Program</h3>
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {WEEK_ORDER.map((day) => {
                        const h = hours.find((x) => x.day === day);
                        return (
                          <li key={day} className="flex justify-between text-fg-muted">
                            <span>{DAYS[day]}</span>
                            {h ? (
                              <span className="font-medium text-fg">{h.open}–{h.close}</span>
                            ) : (
                              <span className="text-fg-subtle">Închis</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-5">
                  <h3 className="flex items-center gap-2 font-semibold text-fg"><MapPin className="h-4 w-4 text-brand" /> Locație</h3>
                  <p className="mt-2 text-sm text-fg-muted">{[shop.addressLine, shop.locality, shop.county].filter(Boolean).join(', ')}</p>
                  <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border bg-surface-3">
                    <iframe
                      title={`Hartă ${shop.name}`}
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${shop.lat ?? 0},${shop.lng ?? 0}&z=14&output=embed`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { toggleFavoriteAction } from '@/app/actions/favorites';
import { cn } from '@/lib/utils';

export function FavoriteButton({ shopId, initial, loggedIn }: { shopId: string; initial: boolean; loggedIn: boolean }) {
  const router = useRouter();
  const [fav, setFav] = React.useState(initial);
  const [pending, start] = React.useTransition();

  function onClick() {
    if (!loggedIn) {
      toast.error('Autentifică-te pentru a salva service-uri favorite.');
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    const optimistic = !fav;
    setFav(optimistic);
    start(async () => {
      const res = await toggleFavoriteAction(shopId);
      if (res.error) {
        setFav(!optimistic);
        toast.error('Nu am putut salva. Încearcă din nou.');
      } else {
        toast.success(res.favorited ? 'Adăugat la favorite' : 'Eliminat de la favorite');
      }
    });
  }

  return (
    <Button variant="outline" size="icon" onClick={onClick} disabled={pending} aria-pressed={fav} aria-label={fav ? 'Elimină de la favorite' : 'Adaugă la favorite'}>
      <Heart className={cn('h-5 w-5 transition-all', fav ? 'fill-danger text-danger scale-110' : 'text-fg-muted')} />
    </Button>
  );
}

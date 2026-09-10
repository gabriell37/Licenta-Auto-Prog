'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_TZ, addDaysKey, dayKey, dayStart } from '@/lib/dates';

export function CalendarDateNav({ dateKey }: { dateKey: string }) {
  const router = useRouter();

  function go(key: string) {
    router.push(`/pro/calendar?date=${key}`);
  }

  const label = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: APP_TZ,
  }).format(dayStart(dateKey));

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={() => go(addDaysKey(dateKey, -1))} aria-label="Ziua anterioară"><ChevronLeft className="h-4 w-4" /></Button>
      <Button variant="outline" size="sm" onClick={() => go(dayKey(new Date()))}>Azi</Button>
      <Button variant="outline" size="icon-sm" onClick={() => go(addDaysKey(dateKey, 1))} aria-label="Ziua următoare"><ChevronRight className="h-4 w-4" /></Button>
      <span className="ml-2 font-display text-lg font-semibold capitalize text-fg">{label}</span>
    </div>
  );
}

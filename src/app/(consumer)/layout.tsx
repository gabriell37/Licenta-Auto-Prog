import * as React from 'react';
import { SiteHeader } from '@/components/consumer/site-header';
import { BottomNav } from '@/components/consumer/bottom-nav';
import { SiteFooter } from '@/components/consumer/site-footer';
import { AssistantWidget } from '@/components/assistant/assistant-widget';

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col" data-density="comfortable">
      <React.Suspense fallback={<div className="h-16 border-b border-border" />}>
        <SiteHeader />
      </React.Suspense>
      <main id="main" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
      <AssistantWidget />
    </div>
  );
}

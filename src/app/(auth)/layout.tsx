import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-dvh bg-bg-subtle flex flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-fg-on-brand">
          <Wrench className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-fg">AutoProg</span>
      </Link>
      <div className="w-full max-w-md animate-fade-up">{children}</div>
      <p className="mt-8 max-w-sm text-center text-xs text-fg-subtle">
        Continuând, ești de acord cu Termenii și Politica de confidențialitate AutoProg.
      </p>
    </main>
  );
}

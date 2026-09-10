import Link from 'next/link';
import { Wrench } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-12 hidden border-t border-border bg-surface md:block">
      <div className="container grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-fg-on-brand">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-extrabold text-fg">AutoProg</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-fg-muted">
            Programări online la service auto de încredere, în toată România. Fără telefoane, fără așteptare.
          </p>
        </div>
        <FooterCol title="Pentru șoferi" links={[['Caută service', '/search'], ['Categorii', '/categories'], ['Garajul meu', '/garage'], ['Programările mele', '/appointments']]} />
        <FooterCol title="Pentru service-uri" links={[['Listează-ți afacerea', '/business'], ['Prețuri', '/business/pricing'], ['Panou Pro', '/pro']]} />
        <FooterCol title="AutoProg" links={[['Despre', '/despre'], ['Termeni', '/termeni'], ['Confidențialitate', '/confidentialitate'], ['Contact', '/contact']]} />
      </div>
      <div className="border-t border-border">
        <div className="container py-4 text-center text-xs text-fg-subtle">
          © {new Date().getFullYear()} AutoProg. Toate drepturile rezervate. Proiect demonstrativ.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-fg-muted transition-colors hover:text-brand">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

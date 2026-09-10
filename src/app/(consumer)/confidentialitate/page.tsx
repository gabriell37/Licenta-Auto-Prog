import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de confidențialitate',
  description: 'Cum prelucrează AutoProg datele tale personale (GDPR).',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold text-fg">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function ConfidentialitatePage() {
  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
        Politica de confidențialitate
      </h1>
      <p className="mt-2 text-sm text-fg-subtle">Ultima actualizare: iunie 2026</p>

      <div className="mt-4 rounded-xl border border-warning/40 bg-warning-subtle p-4 text-sm leading-relaxed text-warning-fg">
        <strong>Proiect demonstrativ.</strong> AutoProg este o aplicație educațională. Politica de
        mai jos descrie exact ce face aplicația cu datele — recomandăm totuși să nu introduci date
        personale reale sensibile.
      </div>

      <Section title="1. Ce date colectăm">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-fg">Cont și profil:</strong> nume, adresă de email, telefon
            (opțional) și parola — stocată exclusiv ca hash criptografic (bcrypt), niciodată în clar.
          </li>
          <li>
            <strong className="text-fg">Vehicule:</strong> datele mașinilor adăugate în garaj
            (marcă, model, an, număr de înmatriculare, VIN, kilometraj) și documentele asociate
            (ITP, RCA, rovinietă — tip, număr, dată de expirare).
          </li>
          <li>
            <strong className="text-fg">Programări:</strong> istoricul programărilor, mesajele
            schimbate cu service-ul, devizele și recenziile lăsate.
          </li>
          <li>
            <strong className="text-fg">Fișiere media:</strong> pozele, videoclipurile sau
            înregistrările audio pe care le încarci pentru a descrie o problemă.
          </li>
          <li>
            <strong className="text-fg">Notificări:</strong> notificările în aplicație legate de
            programările tale (confirmări, remindere, schimbări de status).
          </li>
        </ul>
      </Section>

      <Section title="2. Cookie-uri și sesiune">
        <p>
          Folosim un singur cookie de sesiune (<code className="rounded bg-surface-3 px-1 py-0.5 text-xs">autoprog_session</code>),
          de tip httpOnly, strict necesar pentru autentificare. Nu folosim cookie-uri de tracking,
          de publicitate sau servicii de analiză ale unor terți.
        </p>
      </Section>

      <Section title="3. Unde sunt stocate datele">
        <p>
          Toate datele sunt stocate local, în baza de date a aplicației, iar fișierele încărcate pe
          serverul aplicației. Datele tale nu sunt vândute și nu sunt transmise către terți în
          scopuri de marketing.
        </p>
      </Section>

      <Section title="4. Cine vede datele tale">
        <p>
          Service-ul la care faci o programare vede datele necesare prestației: numele, telefonul,
          vehiculul, descrierea problemei și fișierele atașate programării. Administratorii
          platformei au acces tehnic pentru moderare și suport.
        </p>
      </Section>

      <Section title="5. Drepturile tale (GDPR)">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-fg">Dreptul la portabilitate și acces:</strong> îți poți
            descărca toate datele în format JSON din{' '}
            <Link href="/account/settings" className="font-medium text-brand hover:underline">
              Setări &amp; confidențialitate
            </Link>.
          </li>
          <li>
            <strong className="text-fg">Dreptul la ștergere:</strong> îți poți șterge contul
            definitiv din aceeași pagină — mașinile, programările, recenziile și fișierele încărcate
            sunt eliminate ireversibil.
          </li>
          <li>
            <strong className="text-fg">Dreptul la rectificare:</strong> îți poți actualiza oricând
            numele și telefonul din setările contului.
          </li>
          <li>
            <strong className="text-fg">Consimțământ:</strong> acordurile tale (termeni,
            confidențialitate, comunicări de marketing) sunt înregistrate cu dată și pot fi
            retrase.
          </li>
        </ul>
      </Section>

      <Section title="6. Contact">
        <p>
          Pentru orice întrebare legată de datele tale ne poți scrie la{' '}
          <a href="mailto:contact@autoprog.ro" className="font-medium text-brand hover:underline">
            contact@autoprog.ro
          </a>{' '}
          sau prin pagina de{' '}
          <Link href="/contact" className="font-medium text-brand hover:underline">contact</Link>.
        </p>
      </Section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termeni și condiții',
  description: 'Termenii și condițiile de utilizare a platformei demonstrative AutoProg.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold text-fg">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function TermeniPage() {
  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Termeni și condiții</h1>
      <p className="mt-2 text-sm text-fg-subtle">Ultima actualizare: iunie 2026</p>

      <div className="mt-4 rounded-xl border border-warning/40 bg-warning-subtle p-4 text-sm leading-relaxed text-warning-fg">
        <strong>Proiect demonstrativ.</strong> AutoProg este o aplicație realizată în scop educațional
        (lucrare de licență). Nu este un serviciu comercial, nu intermediază servicii auto reale și
        acest document nu constituie consultanță juridică.
      </div>

      <Section title="1. Utilizarea platformei">
        <p>
          AutoProg oferă un instrument de căutare a service-urilor auto și de gestionare a
          programărilor, vehiculelor și istoricului de service. Pentru a folosi funcțiile principale
          (garaj, programări, recenzii) este necesar un cont.
        </p>
        <p>
          Te angajezi să furnizezi informații corecte la crearea contului, să păstrezi
          confidențialitatea parolei și să nu folosești platforma în scopuri abuzive (conținut
          ilegal, recenzii false, încercări de acces neautorizat).
        </p>
      </Section>

      <Section title="2. Programări">
        <p>
          O programare creată prin platformă reprezintă o solicitare către service-ul ales, în
          intervalul orar selectat. Service-ul o poate confirma, replanifica sau refuza. Statusul
          programării este vizibil în contul tău și primești notificări la fiecare schimbare.
        </p>
        <p>
          Devizele transmise de service prin platformă sunt estimări; lucrările suplimentare se
          execută doar după aprobarea ta explicită din pagina programării.
        </p>
      </Section>

      <Section title="3. Anulări și neprezentare">
        <p>
          Poți anula o programare din contul tău înainte de ora stabilită. Te rugăm să anulezi cât
          mai devreme, pentru ca intervalul să poată fi oferit altui client. Neprezentarea repetată
          poate fi marcată de service în istoricul programărilor.
        </p>
      </Section>

      <Section title="4. Recenzii">
        <p>
          Recenziile pot fi lăsate doar pentru programări finalizate, de către clientul care a
          beneficiat de serviciu. Recenziile care conțin limbaj ofensator, date personale ale unor
          terți sau informații vădit false pot fi moderate sau eliminate.
        </p>
      </Section>

      <Section title="5. Răspundere">
        <p>
          AutoProg este un intermediar tehnic: calitatea lucrărilor, prețurile finale și respectarea
          programărilor sunt responsabilitatea exclusivă a service-urilor listate. Platforma este
          furnizată „ca atare", fără garanții privind disponibilitatea neîntreruptă.
        </p>
        <p>
          Fiind un proiect demonstrativ, datele pot fi șterse sau resetate periodic, fără notificare
          prealabilă.
        </p>
      </Section>

      <Section title="6. Conturi demo">
        <p>
          Platforma pune la dispoziție conturi demonstrative (client, service, administrator) pentru
          evaluare. Acestea sunt publice, iar datele introduse în ele nu sunt confidențiale — nu
          introduce date personale reale în conturile demo.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Pentru întrebări legate de acești termeni ne poți scrie prin pagina de{' '}
          <Link href="/contact" className="font-medium text-brand hover:underline">contact</Link>.
          Modul în care prelucrăm datele personale este descris în{' '}
          <Link href="/confidentialitate" className="font-medium text-brand hover:underline">
            Politica de confidențialitate
          </Link>.
        </p>
      </Section>
    </div>
  );
}

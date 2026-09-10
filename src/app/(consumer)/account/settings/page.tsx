import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Download, Globe, KeyRound, Palette, ShieldCheck, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DeleteAccountButton } from '@/components/account/delete-account-button';
import { ProfileForm } from '@/components/account/profile-form';
import { ChangePasswordForm } from '@/components/account/change-password-form';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Setări & confidențialitate' };

export default async function SettingsPage() {
  const user = await requireUser('/account/settings');
  return (
    <div className="container max-w-2xl py-6 md:py-8">
      <Link href="/account" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Contul meu
      </Link>
      <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Setări & confidențialitate</h1>

      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-5 w-5 text-brand" /> Profil</CardTitle>
            <CardDescription>Datele tale de contact, vizibile service-urilor la care te programezi.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={{ name: user.name, phone: user.phone, email: user.email }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-5 w-5 text-brand" /> Schimbă parola</CardTitle>
            <CardDescription>Alege o parolă nouă de minim 8 caractere.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Palette className="h-5 w-5 text-brand" /> Aspect</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-fg">Temă întunecată / luminoasă</p>
              <p className="text-sm text-fg-muted">Urmează automat setarea sistemului tău.</p>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Globe className="h-5 w-5 text-brand" /> Limbă</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-fg-muted">Aplicația este disponibilă în <strong className="text-fg">Română</strong>. Engleza este în lucru.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-success" /> Datele tale (GDPR)</CardTitle>
            <CardDescription>Ai control complet asupra datelor personale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 p-3">
              <div>
                <p className="text-sm font-medium text-fg">Descarcă datele mele</p>
                <p className="text-sm text-fg-muted">Export complet în format JSON (portabilitate).</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href="/api/account/export" download><Download className="h-4 w-4" /> Descarcă</a>
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger-subtle/40 p-3">
              <div>
                <p className="text-sm font-medium text-fg">Șterge contul</p>
                <p className="text-sm text-fg-muted">Elimină definitiv contul și toate datele asociate.</p>
              </div>
              <DeleteAccountButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

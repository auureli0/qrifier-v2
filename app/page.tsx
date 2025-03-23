import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, CheckCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignOut from "./signout";
import { Metadata } from "next";

// SEO-Metadaten
export const metadata: Metadata = {
  title: "QRifier - Sammle Kundenfeedback mit QR-Codes in Echtzeit",
  description: "QRifier hilft Unternehmen, Kundenfeedback in Echtzeit zu sammeln und zu verwalten. Verbessere deine Servicequalität mit umsetzbaren Erkenntnissen.",
  keywords: ["QR-Codes", "Kundenfeedback", "Analysen", "Umfragen", "Echtzeit-Feedback"],
};

export default async function Home() {
  // Authentifizierungssitzung abrufen
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  const isAuthenticated = !!session;
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-lg font-bold text-primary-foreground">Q</span>
          </div>
          <span className="text-xl font-bold">QRifier</span>
        </div>
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Anmelden
              </Link>
              <Button asChild>
                <Link href="/signup">Registrieren</Link>
              </Button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <p className="text-sm font-medium">{session.user.name}</p>
              <SignOut />
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center md:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Sammle Kundenfeedback <span className="text-primary">Sofort</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          QRifier hilft Unternehmen, Kundenfeedback in Echtzeit mit QR-Codes zu sammeln und zu verwalten. Verbessere deine
          Servicequalität mit umsetzbaren Erkenntnissen.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            {isAuthenticated ? (
              <Link href="/dashboard">
                Zum Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <Link href="/signup">
                Jetzt starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">Demo ansehen</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Hauptfunktionen</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <QrCode className="h-12 w-12 text-primary" />
              <h3 className="mt-4 text-xl font-bold">Individuelle QR-Codes</h3>
              <p className="mt-2 text-muted-foreground">
                Erstelle gebrandete QR-Codes, die zu deiner Unternehmensidentität passen und platziere sie überall.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-primary"
              >
                <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                <path d="M9 22h9a2 2 0 0 0 2-2v-7" />
                <path d="M13 6v4" />
                <path d="M17 8h-6" />
                <circle cx="17" cy="17" r="3" />
                <path d="m21 21-1.9-1.9" />
              </svg>
              <h3 className="mt-4 text-xl font-bold">Anpassbare Formulare</h3>
              <p className="mt-2 text-muted-foreground">
                Erstelle Feedback-Formulare, die deinen Anforderungen entsprechen, mit unserem benutzerfreundlichen Formular-Builder.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-primary"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <h3 className="mt-4 text-xl font-bold">Echtzeit-Analysen</h3>
              <p className="mt-2 text-muted-foreground">
                Erhalte sofortige Einblicke mit leistungsstarken Analyse- und Berichtswerkzeugen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Von Unternehmen vertraut</h2>
          <p className="mt-4 text-lg text-muted-foreground">Sieh, was unsere Kunden über QRifier sagen</p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
              <p className="text-muted-foreground">
                "QRifier hat verändert, wie wir Feedback sammeln. Unsere Antwortrate ist um 70% gestiegen, seit wir QR-Codes implementiert haben."
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  JM
                </div>
                <div>
                  <p className="font-medium">Jana Müller</p>
                  <p className="text-sm text-muted-foreground">Restaurant-Besitzerin</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
              <p className="text-muted-foreground">
                "Das Analytics-Dashboard gibt uns umsetzbare Erkenntnisse, die uns geholfen haben, unseren Kundenservice deutlich zu verbessern."
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  TS
                </div>
                <div>
                  <p className="font-medium">Thomas Schmidt</p>
                  <p className="text-sm text-muted-foreground">Einzelhandelsmanager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/30 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Einfache Preisgestaltung</h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">Wähle den Plan, der für dein Unternehmen passt</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">Starter</h3>
              <p className="mt-2 text-3xl font-bold">
                29€<span className="text-sm font-normal text-muted-foreground">/Monat</span>
              </p>
              <ul className="mt-6 space-y-3">
                {["5 QR-Codes", "Basis-Analysen", "1 Benutzer", "E-Mail-Support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" variant="outline" asChild>
                <Link href="/signup">Jetzt starten</Link>
              </Button>
            </div>
            <div className="rounded-lg border bg-primary p-6 shadow-sm">
              <h3 className="text-xl font-bold text-primary-foreground">Business</h3>
              <p className="mt-2 text-3xl font-bold text-primary-foreground">
                79€<span className="text-sm font-normal text-primary-foreground/70">/Monat</span>
              </p>
              <ul className="mt-6 space-y-3 text-primary-foreground">
                {["Unbegrenzte QR-Codes", "Erweiterte Analysen", "5 Benutzer", "Prioritäts-Support", "Individuelles Branding"].map(
                  (feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span>{feature}</span>
                    </li>
                  ),
                )}
              </ul>
              <Button className="mt-8 w-full bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/signup">Jetzt starten</Link>
              </Button>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">Enterprise</h3>
              <p className="mt-2 text-3xl font-bold">
                199€<span className="text-sm font-normal text-muted-foreground">/Monat</span>
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Alles unbegrenzt",
                  "Individuelle Integrationen",
                  "Unbegrenzte Benutzer",
                  "24/7 Support",
                  "Persönlicher Account Manager",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" variant="outline" asChild>
                <Link href="/contact">Vertrieb kontaktieren</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Bereit loszulegen?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Schließe dich tausenden von Unternehmen an, die QRifier bereits nutzen, um ihr Kundenerlebnis zu verbessern.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/signup">Kostenlos registrieren</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-lg font-bold text-primary-foreground">Q</span>
              </div>
              <span className="text-xl font-bold">QRifier</span>
            </div>
            <div className="flex gap-6">
              <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground">
                Datenschutz
              </Link>
              <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground">
                AGB
              </Link>
              <Link href="/kontakt" className="text-sm text-muted-foreground hover:text-foreground">
                Kontakt
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} QRifier. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}

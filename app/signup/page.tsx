import { auth } from "@/lib/auth";
import { signUp } from "@/server/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Registrieren - QRifier",
  description: "Erstelle ein neues QRifier-Konto und beginne mit dem Sammeln von Kundenfeedback.",
};

export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Wenn der Benutzer bereits angemeldet ist, zur Startseite weiterleiten
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold">Konto erstellen</h1>
          <p className="text-sm text-muted-foreground">
            Gib deine Daten ein, um ein neues Konto zu erstellen
          </p>
        </div>

        <form action={signUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Max Mustermann"
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@beispiel.de"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Das Passwort muss mindestens 8 Zeichen lang sein
            </p>
          </div>
          <Button type="submit" className="w-full">
            Registrieren
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Anmelden
          </Link>
        </div>
      </div>
    </div>
  );
} 
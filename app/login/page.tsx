import { auth } from "@/lib/auth";
import { signIn } from "@/server/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Login - QRifier",
  description: "Melde dich bei deinem QRifier-Konto an.",
};

export default async function LoginPage() {
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
          <h1 className="text-2xl font-bold">Anmelden</h1>
          <p className="text-sm text-muted-foreground">
            Gib deine E-Mail-Adresse und dein Passwort ein, um dich anzumelden
          </p>
        </div>

        <form action={signIn} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
              <Link href="/passwort-vergessen" className="text-xs text-primary hover:underline">
                Passwort vergessen?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full">
            Anmelden
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Noch kein Konto?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
} 
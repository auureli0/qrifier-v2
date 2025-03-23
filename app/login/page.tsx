"use client";

import { signIn } from "@/server/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const result = await signIn(formData);
      
      if (!result.success) {
        toast.error(result.error || "Anmeldung fehlgeschlagen");
        setLoading(false);
        return;
      }

      toast.success("Anmeldung erfolgreich");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
      console.error(error);
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={18} />
                <span>Wird angemeldet...</span>
              </>
            ) : (
              "Anmelden"
            )}
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
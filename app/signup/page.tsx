"use client";

import { signUp } from "@/server/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const result = await signUp(formData);
      
      if (!result.success) {
        toast.error(result.error || "Registrierung fehlgeschlagen");
        setLoading(false);
        return;
      }

      toast.success("Registrierung erfolgreich! Du kannst dich jetzt anmelden.");
      window.location.href = "/login";
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
          <h1 className="text-2xl font-bold">Konto erstellen</h1>
          <p className="text-sm text-muted-foreground">
            Gib deine Daten ein, um ein neues Konto zu erstellen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={18} />
                <span>Wird registriert...</span>
              </>
            ) : (
              "Registrieren"
            )}
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
"use server"

import { auth } from "@/lib/auth";
import { z } from "zod";
import { EmailService } from "@/lib/email-service";

// Validierungsschema für Login
const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
});

// Validierungsschema für Registrierung
const signupSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
});

export const signIn = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Validierung der Eingaben
    loginSchema.parse({ email, password });

    // Authentifizierung durchführen
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Anmeldung fehlgeschlagen. Überprüfe deine Anmeldedaten." };
  }
};

export const signUp = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Validierung der Eingaben
    signupSchema.parse({ name, email, password });

    // Registrierung durchführen
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    // Willkommens-E-Mail senden
    await EmailService.sendWelcomeEmail(email, name);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Registrierung fehlgeschlagen. Versuche es mit einer anderen E-Mail-Adresse." };
  }
};

export async function signOut() {
  try {
    await auth.api.signOut({
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Abmelden fehlgeschlagen" };
  }
}

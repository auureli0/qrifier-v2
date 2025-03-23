import { auth } from "@/lib/auth";
import { authFilter } from "better-auth/next-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware für Authentifizierungsüberprüfung
export default authFilter(
  auth,
  {
    publicRoutes: [
      "/", // Startseite
      "/login", // Login-Seite
      "/signup", // Registrierungsseite
      "/api/auth/(.*)", // Auth API Routen
      "/passwort-vergessen", // Passwort-Reset Seite
      "/kontakt", // Kontaktseite
      "/impressum", // Impressum
      "/datenschutz", // Datenschutzerklärung
      "/api/public/(.*)", // Öffentliche API Endpunkte
    ],
    // Umleitung auf Login-Seite, wenn nicht authentifiziert
    onUnauthenticated: async ({nextUrl}) => {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    },
  }
); 
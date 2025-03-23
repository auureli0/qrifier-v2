import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	// Wichtig: Diese Konfiguration muss mit der in auth.ts übereinstimmen
	// Da dort nextCookies() ohne spezifische Parameter verwendet wird,
	// verwenden wir hier die Standardwerte
	const sessionCookie = getSessionCookie(request, {
		// Standardwerte von better-auth verwenden
		// Nur useSecureCookies an die Umgebung anpassen
		useSecureCookies: process.env.NODE_ENV === "production",
	});

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"], // Hier werden die Routen angegeben, für die der Middleware gilt
};

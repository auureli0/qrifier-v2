import { db } from "@/db/drizzle";
import { user, session, account, verification } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
 
export const auth = betterAuth({
  emailAndPassword: {  
    enabled: true
  },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, session, account, verification }
    }),
    plugins: [nextCookies()]
});

// Hilfsmethode zum Abrufen der aktuellen Sitzung in Server-Komponenten
export const getSession = async () => {
  try {
    // better-auth hat eine eigene Methode zum Abrufen der Session
    const cookiesObj = await cookies();
    const sessionData = await auth.api.getSession({
      headers: { 
        cookie: cookiesObj.toString() 
      } as any
    });
    
    if (!sessionData || !sessionData.user) {
      return null;
    }
    
    return {
      userId: sessionData.user.id,
      user: sessionData.user
    };
  } catch (error) {
    console.error("Fehler beim Abrufen der Sitzung:", error);
    return null;
  }
};

// Hilfsmethode zum Abrufen des aktuellen Benutzers
export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user || null;
};
import { createAuthClient } from "better-auth/react"

// Basis-URL je nach Umgebung bestimmen
const baseURL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== "undefined" 
    ? `${window.location.origin}`
    : "http://localhost:3000");

export const authClient = createAuthClient({
    baseURL: `${baseURL}/api/auth`
});
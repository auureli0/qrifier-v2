import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Exportiere die Handler für GET und POST Anfragen
export const { GET, POST } = toNextJsHandler(auth.handler);
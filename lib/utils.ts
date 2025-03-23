import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Einfache Funktion zur Überprüfung, ob wir uns im Browser oder auf dem Server befinden
 */
export const isBrowser = typeof window !== 'undefined';

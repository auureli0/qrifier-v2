import { useState, useEffect, useCallback } from 'react';
import { getCsrfToken } from './csrf-client';

/**
 * Hook für die Verwendung von CSRF-Tokens in React-Komponenten
 * 
 * @param autoFetch - Ob der Token automatisch abgerufen werden soll, wenn er nicht vorhanden ist
 * @param options - Zusätzliche Optionen
 * @returns Das CSRF-Token, Loading-Status und Hilfsmethoden
 * 
 * @example
 * // Einfache Verwendung
 * const { token, isLoading, error } = useCsrf();
 * 
 * @example
 * // Manuelle Steuerung
 * const { token, isLoading, error, fetchToken } = useCsrf(false);
 * const handleSubmit = async () => {
 *   await fetchToken();
 *   // Token verwenden...
 * };
 */
export function useCsrf(autoFetch = true, options?: { 
  onSuccess?: (token: string) => void;
  onError?: (error: Error) => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  // Funktion zum Abrufen des Tokens
  const fetchToken = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const newToken = await getCsrfToken(forceRefresh);
      setToken(newToken);
      options?.onSuccess?.(newToken);
      return newToken;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Beim ersten Rendern Token abrufen, wenn autoFetch aktiviert ist
  useEffect(() => {
    if (autoFetch && !token) {
      fetchToken();
    }
  }, [autoFetch, token, fetchToken]);

  return {
    /** Das aktuelle CSRF-Token */
    token,
    
    /** Gibt an, ob gerade ein Token abgerufen wird */
    isLoading,
    
    /** Fehler beim Abrufen des Tokens */
    error,
    
    /** Ruft einen neuen Token ab */
    fetchToken,
    
    /** Setzt das Token zurück und ruft einen neuen ab */
    refresh: () => fetchToken(true),
    
    /** Erstellt Headers mit dem CSRF-Token */
    createHeaders: useCallback((headers: HeadersInit = {}): Headers => {
      const newHeaders = new Headers(headers);
      if (token) {
        newHeaders.set('x-csrf-token', token);
      }
      return newHeaders;
    }, [token]),
    
    /**
     * Fügt ein verstecktes Feld für das CSRF-Token zu einem Formular hinzu
     * @param formElement - Das Formular-Element
     */
    attachToForm: useCallback((formElement: HTMLFormElement | null) => {
      if (!formElement || !token) return;
      
      // Prüfen, ob bereits ein CSRF-Feld vorhanden ist
      let csrfInput = formElement.querySelector('input[name="x-csrf-token"]');
      
      if (!csrfInput) {
        // CSRF-Input erstellen, wenn nicht vorhanden
        csrfInput = document.createElement('input');
        csrfInput.setAttribute('type', 'hidden');
        csrfInput.setAttribute('name', 'x-csrf-token');
        formElement.appendChild(csrfInput);
      }
      
      // CSRF-Token setzen oder aktualisieren
      csrfInput.setAttribute('value', token);
    }, [token]),
  };
} 
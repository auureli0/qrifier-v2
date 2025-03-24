import React from 'react';

/**
 * Client-seitige Funktionen für den CSRF-Schutz
 * Diese Datei wird im Frontend verwendet, um CSRF-Token zu verwalten und in Anfragen einzubinden
 */

// Cache für den CSRF-Token
let csrfToken: string | null = null;

// CSRF-Header-Name
const CSRF_HEADER = 'x-csrf-token';

/**
 * Ruft einen CSRF-Token vom Server ab
 * Wenn bereits ein Token im Cache vorhanden ist, wird dieser zurückgegeben
 */
export async function getCsrfToken(forceRefresh = false): Promise<string> {
  // Token aus dem Cache zurückgeben, wenn vorhanden und kein Refresh erzwungen wird
  if (csrfToken && !forceRefresh) {
    return csrfToken;
  }
  
  try {
    // Token vom Server abrufen
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Wichtig für Cookies!
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('CSRF-Token konnte nicht abgerufen werden');
    }
    
    const data = await response.json();
    
    if (!data.token) {
      throw new Error('Ungültiger CSRF-Token-Response');
    }
    
    // Token im Cache speichern
    csrfToken = data.token;
    
    // Da wir überprüft haben, dass data.token existiert, und wir es gerade zu csrfToken zugewiesen haben,
    // ist csrfToken an dieser Stelle garantiert nicht null
    return data.token;
  } catch (error) {
    console.error('Fehler beim Abrufen des CSRF-Tokens:', error);
    throw error;
  }
}

/**
 * Erstellt einen Headers-Objekt mit dem CSRF-Token
 */
export async function createCsrfHeaders(headers: HeadersInit = {}): Promise<Headers> {
  const token = await getCsrfToken();
  const newHeaders = new Headers(headers);
  newHeaders.set(CSRF_HEADER, token);
  return newHeaders;
}

/**
 * Sicheres Fetch mit automatischem CSRF-Token
 * Diese Funktion sollte anstelle des normalen fetch für alle Anfragen verwendet werden,
 * die eine Mutation durchführen (POST, PUT, DELETE, PATCH)
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { method = 'GET', headers = {}, ...restOptions } = options;
  
  // CSRF-Token nur für Mutations-Methoden hinzufügen
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    const csrfHeaders = await createCsrfHeaders(headers);
    
    return fetch(url, {
      method,
      headers: csrfHeaders,
      credentials: 'include', // Wichtig für Cookies!
      ...restOptions,
    });
  }
  
  // Für andere Methoden normales fetch verwenden
  return fetch(url, {
    method,
    headers,
    credentials: 'include', // Wichtig für Cookies!
    ...restOptions,
  });
}

/**
 * Form-Handler, der den CSRF-Token zu Formular-Daten hinzufügt
 * Kann als Wrapper für onSubmit-Handler in React-Formularen verwendet werden
 */
export function createCsrfFormHandler<T extends HTMLElement = HTMLFormElement>(
  onSubmit: (event: React.FormEvent<T>) => void | Promise<void>
): (event: React.FormEvent<T>) => Promise<void> {
  return async (event: React.FormEvent<T>) => {
    event.preventDefault();
    
    try {
      // CSRF-Token abrufen
      const token = await getCsrfToken();
      
      // Wenn das Event von einem Formular stammt, fügen wir ein verstecktes Feld hinzu
      if (event.target instanceof HTMLFormElement) {
        // Prüfen, ob bereits ein CSRF-Feld vorhanden ist
        let csrfInput = event.target.querySelector(`input[name="${CSRF_HEADER}"]`);
        
        if (!csrfInput) {
          // CSRF-Input erstellen, wenn nicht vorhanden
          csrfInput = document.createElement('input');
          (csrfInput as HTMLInputElement).type = 'hidden';
          (csrfInput as HTMLInputElement).name = CSRF_HEADER;
          event.target.appendChild(csrfInput);
        }
        
        // CSRF-Token setzen oder aktualisieren
        (csrfInput as HTMLInputElement).value = token;
      }
      
      // Original-Handler aufrufen
      await onSubmit(event);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des CSRF-Tokens zum Formular:', error);
      throw error;
    }
  };
}

/**
 * React-Hook für die einfache Verwendung des CSRF-Tokens in Komponenten
 * Kann verwendet werden, um den CSRF-Token in UI-Komponenten anzuzeigen oder zu verwenden
 */
export function useCsrfToken(forceRefresh = false): { 
  token: string | null; 
  isLoading: boolean; 
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [token, setToken] = React.useState<string | null>(csrfToken);
  const [isLoading, setIsLoading] = React.useState<boolean>(!csrfToken);
  const [error, setError] = React.useState<Error | null>(null);
  
  const refresh = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newToken = await getCsrfToken(true);
      setToken(newToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  React.useEffect(() => {
    if (!token || forceRefresh) {
      getCsrfToken(forceRefresh)
        .then(newToken => {
          setToken(newToken);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        });
    }
  }, [token, forceRefresh]);
  
  return { token, isLoading, error, refresh };
} 
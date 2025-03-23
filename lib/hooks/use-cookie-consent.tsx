"use client";

import React, { useEffect } from 'react';
import { CookieService, CookieCategory } from '@/lib/cookie-service';

/**
 * Hook zur Prüfung der Cookie-Zustimmung für bestimmte Kategorien
 * 
 * @param category Cookie-Kategorie, die geprüft werden soll
 * @param onConsent Callback, der ausgeführt wird, wenn Zustimmung vorliegt
 * @param onReject Callback, der ausgeführt wird, wenn keine Zustimmung vorliegt
 * 
 * @example
 * // Beispiel für Google Analytics
 * useCookieConsent(CookieCategory.ANALYTICS, 
 *   () => {
 *     // Initialisiere Google Analytics
 *     initGA();
 *   }, 
 *   () => {
 *     // Optional: Lösche vorhandene Analytics-Cookies
 *     window._ga = undefined;
 *   }
 * );
 */
export function useCookieConsent(
  category: CookieCategory,
  onConsent?: () => void,
  onReject?: () => void
) {
  useEffect(() => {
    // Prüfen, ob der Benutzer bereits eine Entscheidung getroffen hat
    const hasConsent = CookieService.hasConsent();
    
    if (hasConsent) {
      const isEnabled = CookieService.isEnabled(category);
      
      if (isEnabled && onConsent) {
        // Zustimmung für diese Kategorie liegt vor
        onConsent();
      } else if (!isEnabled && onReject) {
        // Keine Zustimmung für diese Kategorie
        onReject();
      }
    }

    // Abonnieren von Cookie-Consent-Änderungen
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'qrifier_cookie_consent') {
        const newConsent = CookieService.getConsent();
        const isEnabled = CookieService.isEnabled(category);

        if (isEnabled && onConsent) {
          onConsent();
        } else if (!isEnabled && onReject) {
          onReject();
        }
      }
    };

    // Event-Listener für Änderungen in localStorage
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [category, onConsent, onReject]);

  // Hilfsfunktion zur Prüfung des aktuellen Status (nützlich für bedingte Renderings)
  const isCategoryEnabled = () => {
    return CookieService.hasConsent() && CookieService.isEnabled(category);
  };

  return { isCategoryEnabled };
}

/**
 * Beispiel für eine Wrapper-Komponente, die Inhalte basierend auf der Cookie-Zustimmung darstellt
 * 
 * @example
 * <CookieConsentWrapper category={CookieCategory.ANALYTICS}>
 *   {/* Dieser Inhalt wird nur angezeigt, wenn der Benutzer Analyse-Cookies akzeptiert hat *\/}
 *   <GoogleAnalyticsComponent />
 * </CookieConsentWrapper>
 */
export function CookieConsentWrapper({ 
  category, 
  children, 
  fallback = null 
}: { 
  category: CookieCategory; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const { isCategoryEnabled } = useCookieConsent(category);
  
  // Wenn keine Zustimmung vorliegt, zeige nichts oder den Fallback an
  if (!isCategoryEnabled()) {
    return fallback as React.ReactElement | null;
  }
  
  // Ansonsten zeige den Inhalt an
  return <React.Fragment>{children}</React.Fragment>;
} 
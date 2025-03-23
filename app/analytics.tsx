"use client";

import { useEffect } from 'react';
import Script from 'next/script';
import { CookieCategory } from '@/lib/cookie-service';
import { useCookieConsent, CookieConsentWrapper } from '@/lib/hooks/use-cookie-consent';

// Dummy-Funktion zur Initialisierung von Google Analytics
// In einer realen Anwendung würde dies mit echten Tracking-Codes implementiert
const initGA = (trackingId: string) => {
  console.log('Google Analytics initialisiert mit ID:', trackingId);
  
  // Hier würde normalerweise der tatsächliche GA-Initialisierungscode stehen
  // window.gtag('config', trackingId);
};

// Dummy-Funktion zur Deaktivierung von Google Analytics
const disableGA = () => {
  console.log('Google Analytics deaktiviert');
  
  // Optional: Bereinige existierende GA-Cookies
  document.cookie = '_ga=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = '_gid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = '_gat=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Google Analytics Tracking-ID (würde normalerweise aus env-Variablen geladen)
const GA_TRACKING_ID = 'G-EXAMPLE123456';

/**
 * Komponente zur Verwaltung von Google Analytics basierend auf Cookie-Konsens
 */
export function AnalyticsConsent() {
  // Verwende den Hook, um GA zu initialisieren oder zu deaktivieren,
  // je nach Cookie-Einstellungen des Benutzers
  useCookieConsent(
    CookieCategory.ANALYTICS,
    () => initGA(GA_TRACKING_ID),
    () => disableGA()
  );
  
  return null; // Diese Komponente rendert nichts, führt nur Logik aus
}

/**
 * Google Analytics-Komponente, die nur geladen wird, wenn der Benutzer zugestimmt hat
 * Kann in _app.js oder Layout-Komponenten eingebunden werden
 */
export function GoogleAnalytics() {
  return (
    <CookieConsentWrapper category={CookieCategory.ANALYTICS}>
      {/* Das Script wird nur geladen, wenn der Benutzer Analytics-Cookies akzeptiert hat */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </CookieConsentWrapper>
  );
} 
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  CookieService, 
  CookieCategory,
  cookiesList,
  type CookieConsent
} from "@/lib/cookie-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Zeit in Millisekunden, nach der die Standardaktion ausgeführt wird, wenn der Nutzer nicht interagiert
const AUTO_ACCEPT_NECESSARY_TIMEOUT = 3 * 24 * 60 * 60 * 1000; // 3 Tage

export function CookieConsentModal() {
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [activeTab, setActiveTab] = useState("datenschutz");
  const [consent, setConsent] = useState<CookieConsent>(CookieService.getConsent());
  
  // Timeout-Referenz speichern
  const autoAcceptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prüfen, ob Cookie-Zustimmung bereits gegeben wurde
  useEffect(() => {
    const hasConsent = CookieService.hasConsent();
    if (!hasConsent) {
      setShowBanner(true);
      
      // Timeout setzen für automatische Annahme der notwendigen Cookies,
      // wenn der Nutzer nach einer bestimmten Zeit nicht reagiert
      autoAcceptTimeoutRef.current = setTimeout(() => {
        if (!CookieService.hasConsent()) {
          handleAcceptNecessary();
        }
      }, AUTO_ACCEPT_NECESSARY_TIMEOUT);
    }
    
    // Cleanup beim Unmount
    return () => {
      if (autoAcceptTimeoutRef.current) {
        clearTimeout(autoAcceptTimeoutRef.current);
      }
    };
  }, []);

  // Alle Cookies akzeptieren
  const handleAcceptAll = () => {
    // Timeout löschen, da Benutzer eine Entscheidung getroffen hat
    if (autoAcceptTimeoutRef.current) {
      clearTimeout(autoAcceptTimeoutRef.current);
    }
    
    CookieService.acceptAll();
    setShowBanner(false);
  };

  // Nur notwendige Cookies akzeptieren
  const handleAcceptNecessary = () => {
    // Timeout löschen, da Benutzer eine Entscheidung getroffen hat
    if (autoAcceptTimeoutRef.current) {
      clearTimeout(autoAcceptTimeoutRef.current);
    }
    
    CookieService.acceptNecessaryOnly();
    setShowBanner(false);
  };

  // Individuelle Einstellungen speichern
  const handleSaveSettings = () => {
    // Timeout löschen, da Benutzer eine Entscheidung getroffen hat
    if (autoAcceptTimeoutRef.current) {
      clearTimeout(autoAcceptTimeoutRef.current);
    }
    
    CookieService.saveConsent(consent);
    setOpen(false);
  };

  // Toggle-Handler für die Switches
  const handleToggleCategory = (category: keyof CookieConsent) => {
    if (category === 'necessary' || category === 'timestamp') return; // Notwendige Cookies können nicht deaktiviert werden
    
    setConsent(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Öffnet das Modal manuell (für den Cookie-Einstellungen-Link im Footer)
  const openConsentModal = () => {
    setConsent(CookieService.getConsent());
    setOpen(true);
  };

  const openDetailSettings = () => {
    // Timeout löschen, da Benutzer interagiert
    if (autoAcceptTimeoutRef.current) {
      clearTimeout(autoAcceptTimeoutRef.current);
    }
    
    setShowBanner(false);
    setOpen(true);
  };

  return (
    <>
      {/* Unsichtbarer Button für programmatischen Zugriff */}
      <span id="open-cookie-settings" className="hidden" onClick={openConsentModal} />

      {/* Cookie-Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="max-w-2xl">
                <h2 className="text-lg font-bold mb-2">Cookie-Einstellungen</h2>
                <p className="text-sm text-muted-foreground">
                  Wir nutzen Cookies, um Ihre Erfahrung auf unserer Website zu verbessern und unsere Dienste zu optimieren. 
                  Sie können wählen, welche Cookies Sie zulassen möchten.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="default"
                  onClick={handleAcceptNecessary}
                  className="text-xs sm:text-sm whitespace-nowrap"
                >
                  Nur notwendige akzeptieren
                </Button>
                <Button 
                  variant="outline"
                  onClick={openDetailSettings}
                  className="text-xs sm:text-sm whitespace-nowrap"
                >
                  Einstellungen anpassen
                </Button>
                <Button 
                  onClick={handleAcceptAll}
                  className="text-xs sm:text-sm whitespace-nowrap"
                >
                  Alle Cookies akzeptieren
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detaillierte Einstellungen Dialog */}
      <Dialog open={open} onOpenChange={(value) => {
        // Wenn Dialog geschlossen wird und noch keine Zustimmung vorliegt,
        // muss das Banner wieder angezeigt werden
        if (!value && !CookieService.hasConsent()) {
          setShowBanner(true);
        }
        setOpen(value);
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cookie-Einstellungen</DialogTitle>
            <DialogDescription className="text-base">
              Wir nutzen Cookies, um Ihre Erfahrung auf unserer Website zu verbessern und unsere Dienste zu optimieren.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="datenschutz" className="flex-1">Datenschutz-Einstellungen</TabsTrigger>
              <TabsTrigger value="details" className="flex-1">Cookie-Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="datenschutz" className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">Notwendige Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                    </p>
                  </div>
                  <Switch 
                    checked={true} 
                    disabled 
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">Funktionale Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung wie Spracheinstellungen.
                    </p>
                  </div>
                  <Switch 
                    checked={consent.functional}
                    onCheckedChange={() => handleToggleCategory('functional')}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">Analyse-Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, um die Nutzererfahrung zu verbessern.
                    </p>
                  </div>
                  <Switch 
                    checked={consent.analytics}
                    onCheckedChange={() => handleToggleCategory('analytics')}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">Marketing-Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Diese Cookies werden verwendet, um relevante Inhalte anzuzeigen und Ihre Erfahrung zu personalisieren.
                    </p>
                  </div>
                  <Switch 
                    checked={consent.marketing}
                    onCheckedChange={() => handleToggleCategory('marketing')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="p-4">
              <div className="overflow-auto max-h-[50vh]">
                {cookiesList.map((cookie) => (
                  <div key={cookie.name} className="mb-6 border-b pb-4 last:border-b-0">
                    <h3 className="font-mono text-sm md:text-base font-semibold mb-2">{cookie.name}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Kategorie:</span>{' '}
                        <span className="capitalize font-medium">{cookie.category}</span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Anbieter:</span>{' '}
                        <span className="font-medium">{cookie.provider}</span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Dauer:</span>{' '}
                        <span className="font-medium">{cookie.duration}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-muted-foreground">Zweck:</span>
                      <p className="mt-1">{cookie.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex flex-wrap gap-2 justify-between">
            <div className="space-x-2">
              <Button 
                variant="default" 
                onClick={handleAcceptNecessary}
                className="text-xs sm:text-sm"
              >
                Nur notwendige akzeptieren
              </Button>
              <Button 
                onClick={handleSaveSettings}
                variant="outline"
                className="text-xs sm:text-sm"
              >
                Einstellungen speichern
              </Button>
            </div>
            <Button 
              onClick={handleAcceptAll}
              className="text-xs sm:text-sm"
            >
              Alle Cookies akzeptieren
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CookieSettings() {
  const handleOpenSettings = () => {
    const element = document.getElementById("open-cookie-settings");
    if (element) {
      element.click();
    }
  };

  return (
    <Button variant="link" onClick={handleOpenSettings} className="text-sm text-muted-foreground">
      Cookie-Einstellungen
    </Button>
  );
} 
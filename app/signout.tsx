"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SignOut() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Kurze Verzögerung vor der Weiterleitung
            setTimeout(() => {
              router.push("/login");
              router.refresh(); // Session-Zustand aktualisieren
            }, 300);
          }
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleSignOut} 
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? (
        <>
          <Spinner size={16} />
          <span>Abmelden...</span>
        </>
      ) : (
        "Abmelden"
      )}
    </Button>
  );
}


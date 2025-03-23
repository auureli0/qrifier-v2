"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/server/users";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function LogoutButton({ variant = "default", className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setIsLoading(true);
    try {
      const result = await signOut();
      
      if (result.success) {
        toast.success("Erfolgreich abgemeldet");
        router.push("/");
      } else {
        toast.error("Beim Abmelden ist ein Fehler aufgetreten");
      }
    } catch (error) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner size={18} />
          <span>Wird abgemeldet...</span>
        </>
      ) : (
        "Abmelden"
      )}
    </Button>
  );
} 
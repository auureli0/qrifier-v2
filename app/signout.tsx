"use client";

import { authClient } from "@/lib/auth-client";

export default function SignOut() {
  return (
    <button onClick={() => authClient.signOut()}>Sign Out</button>
  )
}


"use server"

import { auth } from "@/lib/auth";

export const signIn = async () => {
  await auth.api.signInEmail({
    body: {
      email: "test@test.com",
      password: "password",
    },
  });
};

export const signUp = async () => {
  await auth.api.signUpEmail({
    body: {
      email: "test@test.com",
      password: "password",
      name: "Test User",
    },
  });
};

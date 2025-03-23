import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrieren - QRifier",
  description: "Erstelle ein neues QRifier-Konto und beginne mit dem Sammeln von Kundenfeedback.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
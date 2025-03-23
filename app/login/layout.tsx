import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - QRifier",
  description: "Melde dich bei deinem QRifier-Konto an.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
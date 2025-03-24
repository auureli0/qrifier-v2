export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface WelcomeEmailProps {
  name: string;
}

export interface PasswordResetEmailProps {
  name: string;
  resetLink: string;
}
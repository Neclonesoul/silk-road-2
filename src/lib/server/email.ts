import { brand } from '$lib/config';

export async function sendTransactionalEmail(
  env: Env,
  to: string,
  subject: string,
  text: string
): Promise<'sent' | 'not-configured'> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return 'not-configured';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text })
  });
  if (!response.ok) throw new Error(`Email provider rejected request (${response.status})`);
  return 'sent';
}

export function verificationMessage(url: string): { subject: string; text: string } {
  return {
    subject: `Verify your ${brand.shortName} email`,
    text: `Verify your email to finish setting up your marketplace account:\n\n${url}\n\nThis link expires in 24 hours. If you did not request it, ignore this email.`
  };
}

export function resetMessage(url: string): { subject: string; text: string } {
  return {
    subject: `Reset your ${brand.shortName} password`,
    text: `Use this link to reset your password:\n\n${url}\n\nThis link expires in one hour. If you did not request it, no action is required.`
  };
}

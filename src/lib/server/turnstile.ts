export async function verifyTurnstile(
  env: Env,
  token: string,
  ip?: string | null
): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return env.APP_ENV !== 'production';
  const form = new FormData();
  form.set('secret', env.TURNSTILE_SECRET_KEY);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success: boolean };
  return result.success;
}

import { brand } from '$lib/config';

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat(brand.locale, {
    style: 'currency',
    currency: brand.currency,
    maximumFractionDigits: cents % 100 ? 2 : 0
  }).format(cents / 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
}

function parseDatabaseDate(value: string): Date {
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;

  return new Date(normalized);
}

export function relativeTime(value: string | null, now = new Date()): string {
  if (!value) return 'Not published';

  const date = parseDatabaseDate(value);
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Intl.DateTimeFormat(brand.locale, { dateStyle: 'medium' }).format(date);
}

export function safeReturnTo(value: FormDataEntryValue | null, fallback = '/'): string {
  const candidate = typeof value === 'string' ? value : '';
  return candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes('\\')
    ? candidate
    : fallback;
}

export function toCents(value: string): number {
  const normalized = value.replace(/[\s,_]/g, '').replace(/^[A-Za-z$€£¥]+/, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return NaN;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN;
}

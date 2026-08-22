import { z } from 'zod';
import { conditions, limits, reportReasons } from '$lib/config';

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  displayName: z.string().trim().min(2).max(60),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{2,29}$/),
  password: z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
  locality: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(80)
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128)
});

export const listingSchema = z.object({
  title: z.string().trim().min(4).max(limits.title),
  description: z.string().trim().min(20).max(limits.description),
  categoryId: z.string().min(1).max(50),
  condition: z.enum(conditions),
  priceCents: z.number().int().min(0).max(1_000_000_000_00),
  priceNegotiable: z.boolean(),
  locality: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(80),
  attributes: z
    .record(z.string(), z.union([z.string().max(200), z.number(), z.boolean()]))
    .default({})
});

export const searchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().max(50).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  condition: z.enum(conditions).optional(),
  location: z.string().trim().max(80).optional(),
  date: z.enum(['day', 'week', 'month']).optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).default('newest'),
  page: z.coerce.number().int().min(1).max(1000).default(1)
});

export const reportSchema = z.object({
  targetType: z.enum(['listing', 'user', 'message']),
  targetId: z.string().min(1).max(100),
  reason: z.enum(reportReasons),
  detail: z.string().trim().max(1000).default('')
});
export const messageSchema = z.object({ content: z.string().trim().min(1).max(limits.message) });

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Check the highlighted details and try again.';
}

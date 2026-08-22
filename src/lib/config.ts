export const brand = {
  name: 'Silk Road 2.0',
  shortName: 'Silk Road',
  proposition: 'Find it. Sell it. Talk directly.',
  description: 'A fast, direct marketplace for remarkable finds and everyday essentials.',
  defaultUrl: 'https://market.example.invalid',
  supportEmail: 'support@example.invalid',
  locale: 'en-ZA',
  currency: 'ZAR'
} as const;

export const limits = {
  title: 100,
  description: 5000,
  message: 2000,
  images: 12,
  imageBytes: 10 * 1024 * 1024,
  pageSize: 24,
  uploadBodyBytes: 12 * 1024 * 1024
} as const;

export const listingStatuses = [
  'draft',
  'active',
  'reserved',
  'sold',
  'expired',
  'removed'
] as const;
export const conditions = ['new', 'like-new', 'good', 'fair', 'parts'] as const;
export const reportReasons = [
  'prohibited',
  'fraud',
  'misleading',
  'abusive',
  'duplicate',
  'other'
] as const;

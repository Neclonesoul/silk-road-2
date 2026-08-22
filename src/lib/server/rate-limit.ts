import { sha256 } from '$server/crypto';

export async function allowRequest(
  db: D1Database,
  bucket: string,
  subject: string,
  limit: number,
  windowSeconds: number,
  now = Date.now()
): Promise<boolean> {
  const windowStart = String(Math.floor(now / (windowSeconds * 1000)) * windowSeconds);
  const subjectHash = await sha256(subject);
  const row = await db
    .prepare(
      `
    INSERT INTO rate_limits (bucket, subject_hash, window_start, request_count) VALUES (?, ?, ?, 1)
    ON CONFLICT(bucket, subject_hash, window_start) DO UPDATE SET request_count = request_count + 1
    RETURNING request_count
  `
    )
    .bind(bucket, subjectHash, windowStart)
    .first<{ request_count: number }>();
  return Boolean(row && row.request_count <= limit);
}

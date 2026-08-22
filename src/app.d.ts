import type { SessionUser } from '$lib/types';

declare global {
  namespace App {
    interface Error {
      message: string;
      requestId?: string;
    }
    interface Locals {
      user: SessionUser | null;
      sessionToken: string | null;
      requestId: string;
    }
    interface Platform {
      env: Env;
      context: ExecutionContext;
      caches: CacheStorage & { default: Cache };
    }
  }

  interface Env {
    DB: D1Database;
    MEDIA: R2Bucket;
    CHAT_ROOMS: DurableObjectNamespace;
    ASSETS: Fetcher;
    APP_ENV: string;
    SESSION_COOKIE_NAME: string;
    PUBLIC_APP_NAME: string;
    PUBLIC_APP_SHORT_NAME: string;
    PUBLIC_APP_DESCRIPTION: string;
    PUBLIC_APP_URL: string;
    PUBLIC_SUPPORT_EMAIL: string;
    PUBLIC_TURNSTILE_SITE_KEY?: string;
    TURNSTILE_SECRET_KEY?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    ADMIN_EMAILS?: string;
    LEGAL_OPERATOR_NAME?: string;
    LEGAL_OPERATOR_ADDRESS?: string;
  }
}

export {};

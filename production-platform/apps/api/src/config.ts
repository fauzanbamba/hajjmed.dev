import 'dotenv/config';
import { z } from 'zod';

const placeholderPattern = /replace-with|example|demo|changeme|your-secret|your-approved|project-ref|localhost:9000|localhost:5432/i;

export function validateRuntimeConfig(input: Record<string, string | undefined>) {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    OTP_PEPPER: z.string().min(16),
    OTP_DEMO_MODE: z.string().default('false').transform((v) => v === 'true'),
    APP_ORIGIN: z.string().url().default('http://localhost:5173'),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(32).optional(),
    SUPABASE_ANON_KEY: z.string().min(32).optional(),
  }).superRefine((v, ctx) => {
    if (v.JWT_ACCESS_SECRET === v.JWT_REFRESH_SECRET) {
      ctx.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'Access and refresh secrets must be different' });
    }

    if (v.NODE_ENV === 'production' && v.OTP_DEMO_MODE) {
      ctx.addIssue({ code: 'custom', path: ['OTP_DEMO_MODE'], message: 'OTP demo mode must be disabled in production' });
    }

    if (v.NODE_ENV === 'production') {
      if (
        placeholderPattern.test(v.JWT_ACCESS_SECRET) ||
        placeholderPattern.test(v.JWT_REFRESH_SECRET) ||
        placeholderPattern.test(v.OTP_PEPPER)
      ) {
        ctx.addIssue({ code: 'custom', path: ['JWT_ACCESS_SECRET'], message: 'Production secrets cannot contain placeholder values' });
      }

      if (!/^https:\/\//i.test(v.APP_ORIGIN)) {
        ctx.addIssue({ code: 'custom', path: ['APP_ORIGIN'], message: 'Production APP_ORIGIN must use HTTPS' });
      }

      if (!v.SUPABASE_URL) {
        ctx.addIssue({ code: 'custom', path: ['SUPABASE_URL'], message: 'SUPABASE_URL is required in production' });
      } else if (!/^https:\/\//i.test(v.SUPABASE_URL)) {
        ctx.addIssue({ code: 'custom', path: ['SUPABASE_URL'], message: 'Supabase URL must use HTTPS' });
      }

      if (!v.SUPABASE_SERVICE_ROLE_KEY) {
        ctx.addIssue({ code: 'custom', path: ['SUPABASE_SERVICE_ROLE_KEY'], message: 'SUPABASE_SERVICE_ROLE_KEY is required in production' });
      } else if (placeholderPattern.test(v.SUPABASE_SERVICE_ROLE_KEY)) {
        ctx.addIssue({ code: 'custom', path: ['SUPABASE_SERVICE_ROLE_KEY'], message: 'Supabase service role key cannot contain placeholder values' });
      }
    }
  });

  return schema.parse(input);
}

export const config = validateRuntimeConfig(process.env);

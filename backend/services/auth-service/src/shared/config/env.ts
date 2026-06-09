import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3002),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  COOKIE_DOMAIN: z.string().optional().default(''),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('Shoe Store <no-reply@localhost>'),
});

const parsed = schema.parse(process.env);

export const env = {
  PORT: parsed.PORT,
  NODE_ENV: parsed.NODE_ENV,
  DATABASE_URL: parsed.DATABASE_URL,
  REDIS_URL: parsed.REDIS_URL,
  JWT_ACCESS_SECRET: parsed.JWT_ACCESS_SECRET,
  JWT_ACCESS_TTL_SECONDS: parsed.JWT_ACCESS_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS: parsed.REFRESH_TOKEN_TTL_DAYS,
  COOKIE_DOMAIN: parsed.COOKIE_DOMAIN ?? '',
  COOKIE_SECURE: parsed.COOKIE_SECURE ?? false,
  COOKIE_SAME_SITE: parsed.COOKIE_SAME_SITE,
  FRONTEND_URL: parsed.FRONTEND_URL,
  SMTP_HOST: parsed.SMTP_HOST,
  SMTP_PORT: parsed.SMTP_PORT,
  SMTP_SECURE: parsed.SMTP_SECURE ?? false,
  SMTP_USER: parsed.SMTP_USER,
  SMTP_PASS: parsed.SMTP_PASS,
  SMTP_FROM: parsed.SMTP_FROM,
};

import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3003),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:4001'),
});

const parsed = schema.parse(process.env);

export const env = {
  PORT: parsed.PORT,
  NODE_ENV: parsed.NODE_ENV,
  DATABASE_URL: parsed.DATABASE_URL,
  JWT_ACCESS_SECRET: parsed.JWT_ACCESS_SECRET,
  PRODUCT_SERVICE_URL: parsed.PRODUCT_SERVICE_URL,
};

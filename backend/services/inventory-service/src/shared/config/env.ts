import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3005),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
});

export const env = schema.parse(process.env);

import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3004),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  CART_SERVICE_URL: z.string().default('http://localhost:3003'),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:4001'),
  INVENTORY_SERVICE_URL: z.string().default('http://localhost:3005'),
  PAYMENT_SERVICE_URL: z.string().default('http://localhost:3006'),
  NOTIFICATION_SERVICE_URL: z.string().default('http://localhost:3007'),
  USER_SERVICE_URL: z.string().default('http://localhost:3001'),
});

export const env = schema.parse(process.env);

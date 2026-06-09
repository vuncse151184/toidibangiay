import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3006),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  ORDER_SERVICE_URL: z.string().default('http://localhost:3004'),
  NOTIFICATION_SERVICE_URL: z.string().default('http://localhost:3007'),
  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),
  VNPAY_URL: z.string().default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
  API_BASE_URL: z.string().default('http://localhost:3001'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  MOMO_PARTNER_CODE: z.string().optional(),
  MOMO_ACCESS_KEY: z.string().optional(),
  MOMO_SECRET_KEY: z.string().optional(),
  MOMO_URL: z.string().default('https://test-payment.momo.vn/v2/gateway/api/create'),
});

export const env = schema.parse(process.env);

import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z.string().default('dev-secret-change-in-production-min-32-chars'),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:4001'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3002/api'),
  CART_SERVICE_URL: z.string().default('http://localhost:3003/api'),
  ORDER_SERVICE_URL: z.string().default('http://localhost:3004/api'),
  INVENTORY_SERVICE_URL: z.string().default('http://localhost:3005/api'),
  PAYMENT_SERVICE_URL: z.string().default('http://localhost:3006/api'),
  NOTIFICATION_SERVICE_URL: z.string().default('http://localhost:3007/api'),
  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),
  VNPAY_URL: z.string().default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
});

const parsed = schema.parse(process.env);

export const env = {
  PORT: parsed.PORT,
  FRONTEND_URL: parsed.FRONTEND_URL,
  JWT_ACCESS_SECRET: parsed.JWT_ACCESS_SECRET,
  PRODUCT_SERVICE_URL: parsed.PRODUCT_SERVICE_URL.replace(/\/$/, ''),
  AUTH_SERVICE_URL: parsed.AUTH_SERVICE_URL.replace(/\/$/, ''),
  CART_SERVICE_URL: parsed.CART_SERVICE_URL.replace(/\/$/, ''),
  ORDER_SERVICE_URL: parsed.ORDER_SERVICE_URL.replace(/\/$/, ''),
  INVENTORY_SERVICE_URL: parsed.INVENTORY_SERVICE_URL.replace(/\/$/, ''),
  PAYMENT_SERVICE_URL: parsed.PAYMENT_SERVICE_URL.replace(/\/$/, ''),
  NOTIFICATION_SERVICE_URL: parsed.NOTIFICATION_SERVICE_URL.replace(/\/$/, ''),
  VNPAY_TMN_CODE: parsed.VNPAY_TMN_CODE,
  VNPAY_HASH_SECRET: parsed.VNPAY_HASH_SECRET,
  VNPAY_URL: parsed.VNPAY_URL.replace(/\/$/, ''),
};

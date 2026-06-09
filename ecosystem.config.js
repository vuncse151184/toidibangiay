/**
 * PM2 Ecosystem Config — toidibangiay
 *
 * Khởi động tất cả:        pm2 start ecosystem.config.js
 * Restart 1 service:       pm2 restart order-service
 * Reload sau sửa .env:     pm2 reload ecosystem.config.js
 * Xem log realtime:        pm2 logs [name]
 * Dashboard:               pm2 monit
 * Dừng tất cả:             pm2 stop all
 * Xóa tất cả:              pm2 delete all
 * Lưu để auto-start:       pm2 save && pm2 startup
 *
 * Cách hoạt động: PM2 chạy `node --require ts-node/register src/main.ts`
 * Tránh hoàn toàn npm.cmd / shell script — không còn SyntaxError trên Windows.
 */

const BASE = __dirname;

// node_args: load ts-node trước khi chạy file .ts
const TS_ARGS = '--require ts-node/register';

// ts-node chạy transpile-only (nhanh hơn, không type-check)
const TS_ENV = {
  NODE_ENV: 'development',
  TS_NODE_TRANSPILE_ONLY: 'true',
};

module.exports = {
  apps: [

    // ─────────────────────────────────────────────
    //  FRONTEND  :3000
    // ─────────────────────────────────────────────
    {
      name: 'frontend',
      cwd: `${BASE}/shopify-store`,
      script: 'node_modules/.bin/next',
      args: 'dev',
      interpreter: 'node',
      watch: false,
      autorestart: true,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'development' },
      log_date_format: 'HH:mm:ss',
    },

    // ─────────────────────────────────────────────
    //  GATEWAY  :4000
    // ─────────────────────────────────────────────
    {
      name: 'gateway',
      cwd: `${BASE}/backend/apps/gateway`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },

    // ─────────────────────────────────────────────
    //  MICROSERVICES
    // ─────────────────────────────────────────────
    {
      name: 'auth-service',          // :3002
      cwd: `${BASE}/backend/services/auth-service`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },
    {
      name: 'cart-service',          // :3003
      cwd: `${BASE}/backend/services/cart-service`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },
    {
      name: 'order-service',         // :3004
      cwd: `${BASE}/backend/services/order-service`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },
    {
      name: 'payment-service',       // :3006
      cwd: `${BASE}/backend/services/payment-service`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },
    {
      name: 'product-service',       // :4001
      cwd: `${BASE}/backend/services/product-service`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },
    {
      name: 'inventory-service',     // :3005
      cwd: `${BASE}/backend/services/inventory-service`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },
    {
      name: 'notification-service',  // :3007
      cwd: `${BASE}/backend/services/notification-service`,
      script: 'src/main.ts',
      interpreter: 'node',
      interpreter_args: TS_ARGS,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: TS_ENV,
      log_date_format: 'HH:mm:ss',
    },
  ],
};

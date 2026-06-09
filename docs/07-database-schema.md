# 07 — Database Schema

Mỗi microservice có database PostgreSQL riêng biệt. Không có foreign keys xuyên database — các service giao tiếp qua API calls hoặc events, dùng IDs để tham chiếu chéo.

---

## auth-service (`auth_db`)

```prisma
// apps/auth-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../../../node_modules/@prisma/auth-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  fullName     String
  phone        String?
  role         Role     @default(CUSTOMER)
  isActive     Boolean  @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  refreshTokens RefreshToken[]

  @@index([email])
  @@index([role])
  @@index([createdAt])
  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid())
  userId    String
  tokenHash String    @unique  // Lưu hash của token, không phải token gốc
  expiresAt DateTime
  revokedAt DateTime?
  userAgent String?   // Browser/device info
  ipAddress String?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tokenHash])
  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

enum Role {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}
```

---

## user-service (`user_db`)

```prisma
// apps/user-service/prisma/schema.prisma

model Profile {
  id        String   @id @default(uuid())  // = userId từ auth-service
  fullName  String
  phone     String?
  avatarUrl String?
  gender    Gender?
  birthDate DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  addresses Address[]

  @@map("profiles")
}

model Address {
  id         String  @id @default(uuid())
  profileId  String
  label      String  @default("Nhà")  // "Nhà", "Công ty", etc.
  fullName   String
  phone      String
  street     String
  ward       String
  district   String
  city       String
  postalCode String?
  isDefault  Boolean @default(false)
  createdAt  DateTime @default(now())

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([profileId])
  @@map("addresses")
}

enum Gender {
  MALE
  FEMALE
  OTHER
}
```

---

## product-service (`product_db`)

```prisma
// apps/product-service/prisma/schema.prisma

model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  parentId    String?
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]

  @@index([slug])
  @@index([parentId])
  @@index([isActive, sortOrder])
  @@map("categories")
}

model Product {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  brand       String
  categoryId  String
  tags        String[] @default([])
  isActive    Boolean  @default(true)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category Category        @relation(fields: [categoryId], references: [id])
  images   ProductImage[]
  variants ProductVariant[]

  @@index([slug])
  @@index([categoryId])
  @@index([brand])
  @@index([isActive, createdAt])
  @@index([isActive, brand])
  @@map("products")
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  url       String
  altText   String?
  position  Int     @default(0)
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, position])
  @@map("product_images")
}

model ProductVariant {
  id             String   @id @default(uuid())
  productId      String
  sku            String   @unique
  price          Int      // VND, integer (3200000 = 3.200.000đ)
  compareAtPrice Int?     // Giá gạch ngang, null nếu không giảm giá
  attributes     Json     // { "size": "42", "color": "black", "material": "canvas" }
  weight         Int?     // grams, for shipping calculation
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([sku])
  @@index([price])
  @@index([isActive])
  @@map("product_variants")
}
```

---

## inventory-service (`inventory_db`)

```prisma
// apps/inventory-service/prisma/schema.prisma

model InventoryItem {
  id        String   @id @default(uuid())
  variantId String   @unique  // FK → product_variants.id (khác DB)
  quantity  Int      @default(0)   // Tổng trong kho
  reserved  Int      @default(0)   // Đang trong pending orders
  warehouse String   @default("HCM")
  minStock  Int      @default(5)   // Alert threshold
  updatedAt DateTime @updatedAt

  transactions InventoryTransaction[]

  @@index([variantId])
  @@index([warehouse])
  // Partial index để query nhanh low-stock items
  @@map("inventory_items")
}

model InventoryTransaction {
  id          String          @id @default(uuid())
  variantId   String
  type        TransactionType
  quantity    Int             // Positive = nhập vào, Negative = xuất ra
  referenceId String?         // orderId, purchaseOrderId, etc.
  note        String?
  createdBy   String?         // userId hoặc "system"
  createdAt   DateTime        @default(now())

  item InventoryItem @relation(fields: [variantId], references: [variantId])

  @@index([variantId, createdAt])
  @@index([referenceId])
  @@index([type, createdAt])
  @@map("inventory_transactions")
}

enum TransactionType {
  RESTOCK       // Nhập hàng mới từ supplier
  RESERVE       // Reserve khi customer đặt hàng (pending payment)
  RELEASE       // Release khi đơn bị cancel hoặc payment timeout
  SOLD          // Confirm bán khi payment hoàn tất
  ADJUSTMENT    // Điều chỉnh thủ công (kiểm kê, hàng lỗi, etc.)
  RETURN        // Hàng trả lại từ customer
}
```

---

## cart-service

Cart không dùng PostgreSQL — lưu trong Redis.

**Redis key patterns:**

```
cart:user:{userId}           Hash — Cart của logged-in user
cart:session:{sessionId}     Hash — Guest cart

# Hash field: variantId (string)
# Hash value: JSON serialized CartItem
{
  "quantity": 2,
  "addedAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:05:00.000Z"
}

# TTL
cart:user:*     → 2592000 seconds (30 ngày)
cart:session:*  → 604800 seconds (7 ngày)
```

**Lưu ý:** Cart chỉ lưu `variantId` và `quantity`. Thông tin sản phẩm (tên, giá, ảnh) được fetch từ product-service khi cần display.

---

## order-service (`order_db`)

```prisma
// apps/order-service/prisma/schema.prisma

model Order {
  id              String        @id @default(uuid())
  orderCode       String        @unique  // TDB-20240115-0001
  userId          String        // FK → users.id (khác DB)
  status          OrderStatus   @default(PENDING)
  subtotal        Int           // Tổng tiền hàng (VND)
  shippingFee     Int           @default(30000)
  discount        Int           @default(0)
  total           Int           // = subtotal + shippingFee - discount
  paymentMethod   PaymentMethod
  shippingAddress Json          // Snapshot địa chỉ lúc đặt hàng
  note            String?
  trackingNumber  String?       // Mã vận đơn
  cancelReason    String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  items  OrderItem[]
  events OrderEvent[]

  @@index([userId, createdAt])
  @@index([status, createdAt])
  @@index([orderCode])
  @@index([createdAt])
  @@map("orders")
}

model OrderItem {
  id           String @id @default(uuid())
  orderId      String
  variantId    String  // FK → product_variants.id (khác DB)
  productId    String  // FK → products.id (khác DB)
  productName  String  // Snapshot tên sản phẩm lúc đặt
  variantTitle String  // "Size 42 / Black" — snapshot
  sku          String  // Snapshot SKU
  price        Int     // Snapshot giá lúc đặt (không bị ảnh hưởng khi admin thay đổi giá)
  quantity     Int
  imageUrl     String? // Snapshot URL ảnh

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([variantId])
  @@map("order_items")
}

model OrderEvent {
  id        String      @id @default(uuid())
  orderId   String
  status    OrderStatus // Trạng thái tại thời điểm event
  note      String?     // Ghi chú (ví dụ: mã vận đơn khi SHIPPED)
  createdBy String?     // userId (admin) hoặc "system"
  createdAt DateTime    @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId, createdAt])
  @@map("order_events")
}

enum OrderStatus {
  PENDING       // Vừa tạo, chờ thanh toán
  CONFIRMED     // Đã thanh toán, chờ xử lý
  PROCESSING    // Đang chuẩn bị hàng
  SHIPPED       // Đã giao cho vận chuyển
  DELIVERED     // Đã giao đến người nhận
  CANCELLED     // Đã hủy
}

enum PaymentMethod {
  VNPAY
  MOMO
  COD   // Cash on Delivery
}
```

---

## payment-service (`payment_db`)

```prisma
// apps/payment-service/prisma/schema.prisma

model Payment {
  id             String        @id @default(uuid())
  orderId        String        @unique  // 1 order = 1 payment record (max)
  userId         String        // FK → users.id (khác DB)
  idempotencyKey String        @unique  // txnRef (VNPay) hoặc requestId (MoMo)
  method         PaymentMethod
  status         PaymentStatus @default(PENDING)
  amount         Int           // VND
  gatewayRef     String?       // Transaction ID từ payment gateway
  rawRequest     Json?         // Request params gửi lên gateway
  rawResponse    Json?         // Response nhận từ gateway/webhook
  failureReason  String?
  createdAt      DateTime      @default(now())
  completedAt    DateTime?
  updatedAt      DateTime      @updatedAt

  refunds PaymentRefund[]

  @@index([orderId])
  @@index([idempotencyKey])
  @@index([userId, createdAt])
  @@index([status])
  @@map("payments")
}

model PaymentRefund {
  id        String       @id @default(uuid())
  paymentId String
  amount    Int
  reason    String
  status    RefundStatus @default(PENDING)
  gatewayRef String?
  createdAt DateTime     @default(now())
  processedAt DateTime?

  payment Payment @relation(fields: [paymentId], references: [id])

  @@index([paymentId])
  @@map("payment_refunds")
}

enum PaymentMethod {
  VNPAY
  MOMO
  COD
}

enum PaymentStatus {
  PENDING    // Chờ thanh toán
  COMPLETED  // Đã thanh toán thành công
  FAILED     // Thất bại
  CANCELLED  // Bị hủy
  REFUNDED   // Đã hoàn tiền
}

enum RefundStatus {
  PENDING
  PROCESSED
  FAILED
}
```

---

## notification-service (`notification_db`)

```prisma
// apps/notification-service/prisma/schema.prisma

model Notification {
  id          String              @id @default(uuid())
  userId      String?             // Null nếu gửi theo email trực tiếp
  email       String?             // Recipient email
  type        NotificationType
  channel     NotificationChannel @default(EMAIL)
  status      NotificationStatus  @default(PENDING)
  subject     String?             // Email subject (sau khi render template)
  payload     Json                // Data để render template
  attempts    Int                 @default(0)
  maxAttempts Int                 @default(5)
  nextRetryAt DateTime?
  sentAt      DateTime?
  errorMsg    String?
  createdAt   DateTime            @default(now())

  @@index([status, nextRetryAt])  // Query để outbox worker fetch pending
  @@index([userId, createdAt])
  @@index([type, createdAt])
  @@map("notifications")
}

model NotificationTemplate {
  id        String           @id @default(uuid())
  type      NotificationType @unique
  subject   String           // Handlebars template: "Xác nhận đơn {{orderCode}}"
  bodyHtml  String           @db.Text  // Full HTML với Handlebars variables
  bodyText  String?          @db.Text  // Plain text fallback
  isActive  Boolean          @default(true)
  updatedAt DateTime         @updatedAt
  updatedBy String?

  @@map("notification_templates")
}

enum NotificationType {
  WELCOME              // Chào mừng đăng ký
  EMAIL_VERIFY         // Xác nhận email
  PASSWORD_RESET       // Đặt lại mật khẩu
  ORDER_CREATED        // Đơn hàng được tạo
  ORDER_CONFIRMED      // Thanh toán thành công, đơn được xác nhận
  ORDER_SHIPPED        // Đơn đã được giao cho vận chuyển
  ORDER_DELIVERED      // Đơn đã giao thành công
  ORDER_CANCELLED      // Đơn bị hủy
  PAYMENT_FAILED       // Thanh toán thất bại
  LOW_STOCK_ALERT      // Cảnh báo tồn kho thấp (gửi cho admin)
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
}
```

---

## Relationships Diagram

```
auth_db                    user_db
┌─────────────────┐        ┌──────────────────┐
│ User            │        │ Profile          │
│  id (PK)        │───────▷│  id = userId (FK)│
│  email          │        │  fullName        │
│  passwordHash   │        │  phone           │
│  role           │        │  addresses []    │
└─────────────────┘        └──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│ RefreshToken     │
│  id              │
│  userId (FK)     │
│  tokenHash       │
└──────────────────┘


product_db
┌──────────────────┐       ┌──────────────────┐
│ Category         │       │ ProductImage     │
│  id (PK)         │       │  id              │
│  parentId (self) │       │  productId (FK)  │
└────────┬─────────┘       └──────────────────┘
         │ 1:N                      ↑ 1:N
         ▼                          │
┌──────────────────┐                │
│ Product          │────────────────┘
│  id (PK)         │
│  categoryId (FK) │       ┌──────────────────┐
└────────┬─────────┘       │ ProductVariant   │
         │ 1:N             │  id (PK)         │
         └────────────────▷│  productId (FK)  │
                           │  sku (unique)    │
                           │  price           │
                           └──────────────────┘


inventory_db
┌──────────────────────┐
│ InventoryItem        │
│  id                  │
│  variantId (unique)  │◁──── references product_variants.id (khác DB)
│  quantity            │
│  reserved            │
└──────────┬───────────┘
           │ 1:N
           ▼
┌──────────────────────┐
│ InventoryTransaction │
│  id                  │
│  variantId (FK)      │
│  type                │
│  quantity            │
│  referenceId         │◁──── orderId từ order_db
└──────────────────────┘


order_db
┌──────────────────┐
│ Order            │
│  id (PK)         │
│  userId          │◁──── references users.id (khác DB, auth_db)
│  status          │
│  total           │
└────────┬─────────┘
         ├──── 1:N ──▶ OrderItem (snapshot variants)
         └──── 1:N ──▶ OrderEvent (audit log)


payment_db
┌──────────────────┐
│ Payment          │
│  id              │
│  orderId (unique)│◁──── references orders.id (khác DB, order_db)
│  status          │
│  amount          │
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐
│ PaymentRefund    │
│  paymentId (FK)  │
└──────────────────┘
```

---

## Indexing Strategy

### Nguyên tắc chung

1. **Primary keys (UUIDs):** Tự động indexed, dùng cho single-record lookups
2. **Foreign keys:** Luôn index để JOIN nhanh
3. **Filter columns:** Index các cột hay xuất hiện trong WHERE
4. **Sort columns:** Index kết hợp (filter + sort) cho query pattern phổ biến
5. **Unique constraints:** Tự động tạo unique index

### Các index quan trọng cần chú ý

```sql
-- product-service: Query phổ biến là filter theo category + sort theo giá
CREATE INDEX idx_products_category_price ON product_variants (product_id)
  INCLUDE (price);  -- Covering index

-- order-service: Admin thường query theo status + date range
CREATE INDEX idx_orders_status_date ON orders (status, created_at DESC);

-- inventory-service: Real-time check available stock
-- available = quantity - reserved
-- Thay vì tính mỗi lần, stored computed column (PostgreSQL 12+)
ALTER TABLE inventory_items
  ADD COLUMN available INT GENERATED ALWAYS AS (quantity - reserved) STORED;
CREATE INDEX idx_inventory_available ON inventory_items (variant_id, available);

-- notification-service: Outbox worker query
CREATE INDEX idx_notifications_outbox
  ON notifications (status, next_retry_at)
  WHERE status = 'PENDING';  -- Partial index, nhỏ hơn nhiều

-- auth-service: Cleanup expired tokens (cron job)
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at)
  WHERE revoked_at IS NULL;  -- Chỉ index active tokens
```

### Query Examples và Expected Performance

```sql
-- Product listing page (rất phổ biến)
-- Expected: < 10ms với index
EXPLAIN ANALYZE
SELECT p.*, MIN(pv.price) as min_price, MAX(pv.price) as max_price
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.category_id = 'cat-uuid'
  AND p.is_active = true
  AND pv.is_active = true
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 20 OFFSET 0;

-- Order history for user
-- Expected: < 5ms
EXPLAIN ANALYZE
SELECT id, order_code, status, total, created_at
FROM orders
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- Low stock check (inventory service)
-- Expected: < 5ms với partial index
EXPLAIN ANALYZE
SELECT variant_id, available
FROM inventory_items
WHERE available < min_stock
ORDER BY available ASC;
```

---

## Migration Strategy

### Prisma Migrations

```bash
# Tạo migration mới (development)
pnpm --filter <service> prisma migrate dev --name "add_tracking_number_to_orders"

# Apply migrations (production — CI/CD)
pnpm --filter <service> prisma migrate deploy

# Reset database (DEV ONLY — never production!)
pnpm --filter <service> prisma migrate reset

# Generate Prisma Client sau khi thay đổi schema
pnpm --filter <service> prisma generate
```

### Naming Convention cho Migrations

```
YYYYMMDDHHMMSS_verb_subject.sql

Ví dụ:
20240115100000_create_users_table.sql
20240116090000_add_phone_to_users.sql
20240120140000_add_tracking_number_to_orders.sql
```

### Backward-compatible Changes (Zero Downtime)

**An toàn (không cần downtime):**
- Thêm column mới với `DEFAULT` value
- Thêm index mới (`CREATE INDEX CONCURRENTLY`)
- Thêm bảng mới
- Mở rộng kiểu dữ liệu (VARCHAR(100) → VARCHAR(255))

**CẦN downtime hoặc migration đặc biệt:**
- Xóa column (dùng 3-phase: 1. Stop đọc/ghi, 2. Drop column, 3. Deploy)
- Rename column (thêm column mới → sync data → update code → xóa cột cũ)
- Thay đổi kiểu dữ liệu (Int → BigInt cần cẩn thận với large tables)
- Thêm NOT NULL constraint trên existing table có data

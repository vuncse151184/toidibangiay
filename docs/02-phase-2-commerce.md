# 02 — Phase 2: Thương Mại (Tuần 5–8)

## Mục tiêu

Kết thúc Phase 2, người dùng có thể:
- Đặt hàng từ giỏ hàng
- Thanh toán qua VNPay hoặc MoMo
- Nhận email xác nhận đơn hàng
- Theo dõi trạng thái đơn hàng
- Admin cập nhật trạng thái đơn hàng
- Hệ thống tự động quản lý tồn kho (không oversell)

---

## Tuần 5: Order Service

### Tổng quan

Order service quản lý toàn bộ vòng đời đơn hàng. Khi đơn hàng được tạo, nó orchestrate một distributed transaction qua events:
1. Reserve inventory
2. Tạo payment link
3. Xác nhận khi payment thành công
4. Gửi notification

### Order State Machine

```
PENDING ──────────────────────────────────────────→ CANCELLED
   │                                                    ↑
   │ (inventory reserved + payment created)             │
   ▼                                                    │
CONFIRMED ──────────────────────────────────────────→ CANCELLED
   │                                                    ↑
   │ (payment completed)                                │
   ▼                                                    │
PROCESSING ─────────────────────────────────────────→ CANCELLED
   │
   │ (warehouse shipped)
   ▼
SHIPPED
   │
   │ (delivery confirmed)
   ▼
DELIVERED
```

**Quy tắc:**
- PENDING → CANCELLED: nếu inventory reserve thất bại, hoặc user cancel trước khi thanh toán
- CONFIRMED → CANCELLED: nếu payment thất bại hoặc user cancel trong vòng 1 giờ
- PROCESSING → không thể cancel (hàng đang chuẩn bị)
- SHIPPED / DELIVERED: không thể cancel

### Endpoints (qua Gateway)

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | /api/orders | Có | Tạo đơn hàng từ cart |
| GET | /api/orders | Có | Lịch sử đơn hàng của tôi |
| GET | /api/orders/:id | Có | Chi tiết đơn hàng |
| PUT | /api/orders/:id/cancel | Có | Hủy đơn hàng |
| PUT | /api/orders/:id/status | ADMIN | Cập nhật trạng thái (admin) |
| GET | /api/admin/orders | ADMIN | Tất cả đơn hàng (admin view) |

### Request/Response Examples

**POST /api/orders**
```json
// Request
{
  "addressId": "address-uuid",
  "paymentMethod": "VNPAY",
  "note": "Giao hàng giờ hành chính"
}

// Response 201
{
  "data": {
    "orderId": "order-uuid",
    "orderCode": "TDB-20240115-0001",
    "status": "PENDING",
    "items": [
      {
        "variantId": "variant-uuid",
        "productName": "Nike Air Max 270",
        "variantTitle": "Size 42 / Black",
        "price": 3500000,
        "quantity": 2,
        "subtotal": 7000000
      }
    ],
    "subtotal": 7000000,
    "shippingFee": 30000,
    "total": 7030000,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  }
}
```

**GET /api/orders/:id**
```json
// Response 200
{
  "data": {
    "id": "order-uuid",
    "orderCode": "TDB-20240115-0001",
    "status": "SHIPPED",
    "items": [...],
    "subtotal": 7000000,
    "shippingFee": 30000,
    "total": 7030000,
    "shippingAddress": {
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "street": "123 Nguyễn Huệ",
      "ward": "Bến Nghé",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh"
    },
    "events": [
      { "status": "PENDING", "note": "Đơn hàng được tạo", "createdAt": "..." },
      { "status": "CONFIRMED", "note": "Đã thanh toán qua VNPay", "createdAt": "..." },
      { "status": "SHIPPED", "note": "Mã vận đơn: GHTK123456", "createdAt": "..." }
    ],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### Database Schema (Prisma)

```prisma
// apps/order-service/prisma/schema.prisma

model Order {
  id              String      @id @default(uuid())
  orderCode       String      @unique  // TDB-YYYYMMDD-XXXX
  userId          String
  status          OrderStatus @default(PENDING)
  subtotal        Int         // VND
  shippingFee     Int         @default(30000)
  discount        Int         @default(0)
  total           Int
  paymentMethod   PaymentMethod
  shippingAddress Json        // snapshot địa chỉ lúc đặt hàng
  note            String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  items  OrderItem[]
  events OrderEvent[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id           String @id @default(uuid())
  orderId      String
  variantId    String
  productName  String  // snapshot tên lúc đặt
  variantTitle String  // "Size 42 / Black"
  price        Int     // snapshot giá lúc đặt
  quantity     Int

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
}

model OrderEvent {
  id        String      @id @default(uuid())
  orderId   String
  status    OrderStatus
  note      String?
  createdBy String?     // userId hoặc "system"
  createdAt DateTime    @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  VNPAY
  MOMO
  COD
}
```

### Order Code Generation

```typescript
// Format: TDB-YYYYMMDD-XXXX (XXXX = sequential per day)
async generateOrderCode(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await this.prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `TDB-${today}-${seq}`;
}
```

---

## Tuần 6: Inventory Service

### Tổng quan

Inventory service theo dõi số lượng tồn kho real-time. Nó lắng nghe events từ order-service để reserve và release stock. Điều quan trọng là không bao giờ để `quantity - reserved < 0`.

### Stock Concepts

```
Quantity (tổng số):    10 đôi
Reserved (đã đặt):      3 đôi (đang trong quá trình thanh toán)
Available (có thể mua): 7 đôi (= quantity - reserved)
Sold (đã bán):          2 đôi (thanh toán thành công)
```

### Database Schema (Prisma)

```prisma
// apps/inventory-service/prisma/schema.prisma

model InventoryItem {
  id        String   @id @default(uuid())
  variantId String   @unique
  quantity  Int      @default(0)   // Tổng số trong kho
  reserved  Int      @default(0)   // Đang reserve (pending orders)
  warehouse String   @default("HCM")
  updatedAt DateTime @updatedAt

  transactions InventoryTransaction[]

  @@index([variantId])
}

model InventoryTransaction {
  id          String          @id @default(uuid())
  variantId   String
  type        TransactionType
  quantity    Int             // Số lượng thay đổi (positive = thêm, negative = giảm)
  referenceId String?         // orderId, shipmentId, etc.
  note        String?
  createdAt   DateTime        @default(now())

  item InventoryItem @relation(fields: [variantId], references: [variantId])

  @@index([variantId])
  @@index([referenceId])
  @@index([createdAt])
}

enum TransactionType {
  RESTOCK     // Nhập hàng mới
  RESERVE     // Reserve khi đặt hàng
  RELEASE     // Release khi hủy đơn
  SOLD        // Chốt bán khi giao hàng thành công
  ADJUSTMENT  // Điều chỉnh thủ công
}
```

### Reserve/Release Logic

```typescript
// Reserve stock — gọi khi OrderCreated event
@Transactional()
async reserveStock(variantId: string, quantity: number, orderId: string) {
  const item = await this.prisma.inventoryItem.findUniqueOrThrow({
    where: { variantId },
  });

  const available = item.quantity - item.reserved;
  if (available < quantity) {
    throw new InsufficientStockException(variantId, available, quantity);
  }

  await this.prisma.inventoryItem.update({
    where: { variantId },
    data: { reserved: { increment: quantity } },
  });

  await this.prisma.inventoryTransaction.create({
    data: {
      variantId,
      type: 'RESERVE',
      quantity: -quantity,
      referenceId: orderId,
    },
  });
}

// Release stock — gọi khi OrderCancelled event
@Transactional()
async releaseStock(variantId: string, quantity: number, orderId: string) {
  await this.prisma.inventoryItem.update({
    where: { variantId },
    data: { reserved: { decrement: quantity } },
  });

  await this.prisma.inventoryTransaction.create({
    data: {
      variantId,
      type: 'RELEASE',
      quantity,
      referenceId: orderId,
    },
  });
}

// Confirm sold — gọi khi PaymentCompleted event
@Transactional()
async confirmSold(variantId: string, quantity: number, orderId: string) {
  await this.prisma.inventoryItem.update({
    where: { variantId },
    data: {
      quantity: { decrement: quantity },
      reserved: { decrement: quantity },
    },
  });

  await this.prisma.inventoryTransaction.create({
    data: {
      variantId,
      type: 'SOLD',
      quantity: -quantity,
      referenceId: orderId,
    },
  });
}
```

### RabbitMQ Event Consumers

```typescript
// Lắng nghe events từ order-service
@EventPattern('order.created')
async handleOrderCreated(event: OrderCreatedEvent) {
  for (const item of event.items) {
    try {
      await this.inventoryService.reserveStock(
        item.variantId,
        item.quantity,
        event.orderId,
      );
    } catch (e) {
      // Nếu reserve thất bại, emit event để order cancel
      this.eventEmitter.emit('inventory.reserve.failed', {
        orderId: event.orderId,
        reason: e.message,
      });
      return;
    }
  }
  this.eventEmitter.emit('inventory.reserved', { orderId: event.orderId });
}

@EventPattern('order.cancelled')
async handleOrderCancelled(event: OrderCancelledEvent) {
  for (const item of event.items) {
    await this.inventoryService.releaseStock(
      item.variantId,
      item.quantity,
      event.orderId,
    );
  }
}
```

---

## Tuần 7: Payment Integration

### VNPay Integration

VNPay là cổng thanh toán phổ biến nhất Việt Nam, hỗ trợ thẻ ATM nội địa, thẻ quốc tế, và QR.

#### Flow thanh toán VNPay

```
1. Client gọi POST /api/payments/vnpay/create với orderId
2. payment-service tạo payment URL với chữ ký HMAC-SHA512
3. Client redirect đến VNPay payment page
4. User thanh toán trên trang VNPay
5. VNPay redirect user về GET /api/payments/vnpay/return (IPN + Return URL)
6. payment-service verify chữ ký, cập nhật payment status
7. Emit PaymentCompleted hoặc PaymentFailed event
```

#### Tạo VNPay Payment URL

```typescript
async createVNPayUrl(orderId: string, amount: number): Promise<string> {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const returnUrl = `${process.env.API_BASE_URL}/api/payments/vnpay/return`;

  const createDate = moment().format('YYYYMMDDHHmmss');
  const txnRef = `${orderId}-${createDate}`;  // unique per transaction

  const params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(amount * 100),  // VNPay nhân 100
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'billpayment',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate,
  };

  // Sort params alphabetically, build query string
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {} as Record<string, string>);

  const signData = new URLSearchParams(sortedParams).toString();
  const signature = crypto
    .createHmac('sha512', secretKey)
    .update(signData)
    .digest('hex');

  sortedParams.vnp_SecureHash = signature;

  return `${process.env.VNPAY_URL}?${new URLSearchParams(sortedParams).toString()}`;
}
```

#### Verify VNPay Return

```typescript
async verifyVNPayReturn(query: Record<string, string>): Promise<boolean> {
  const secureHash = query.vnp_SecureHash;
  delete query.vnp_SecureHash;
  delete query.vnp_SecureHashType;

  const sortedParams = Object.keys(query).sort().reduce((acc, key) => {
    acc[key] = query[key];
    return acc;
  }, {} as Record<string, string>);

  const signData = new URLSearchParams(sortedParams).toString();
  const checkHash = crypto
    .createHmac('sha512', process.env.VNPAY_HASH_SECRET)
    .update(signData)
    .digest('hex');

  return checkHash === secureHash && query.vnp_ResponseCode === '00';
}
```

### MoMo Integration

MoMo hỗ trợ QR, ví MoMo, và thẻ tín dụng.

#### Tạo MoMo Payment

```typescript
async createMoMoPayment(orderId: string, amount: number): Promise<string> {
  const requestId = `${orderId}-${Date.now()}`;
  const orderInfo = `Thanh toan don hang ${orderId}`;
  const redirectUrl = `${process.env.FRONTEND_URL}/checkout/result`;
  const ipnUrl = `${process.env.API_BASE_URL}/api/payments/momo/notify`;

  const rawSignature =
    `accessKey=${process.env.MOMO_ACCESS_KEY}` +
    `&amount=${amount}` +
    `&extraData=` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${process.env.MOMO_PARTNER_CODE}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=payWithMethod`;

  const signature = crypto
    .createHmac('sha256', process.env.MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  const response = await fetch(process.env.MOMO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerCode: process.env.MOMO_PARTNER_CODE,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType: 'payWithMethod',
      extraData: '',
      lang: 'vi',
      signature,
    }),
  });

  const data = await response.json();
  if (data.resultCode !== 0) {
    throw new Error(`MoMo error: ${data.message}`);
  }

  return data.payUrl;
}
```

### Idempotency

Để tránh double-charge khi webhook được gọi nhiều lần:

```typescript
// Payment record với idempotency key
model Payment {
  id             String        @id @default(uuid())
  orderId        String        @unique  // Mỗi order chỉ có 1 payment record
  idempotencyKey String        @unique  // txnRef từ VNPay/requestId từ MoMo
  method         PaymentMethod
  status         PaymentStatus @default(PENDING)
  amount         Int
  gatewayRef     String?       // Transaction ID từ payment gateway
  rawResponse    Json?         // Raw response để audit
  createdAt      DateTime      @default(now())
  completedAt    DateTime?

  @@index([idempotencyKey])
  @@index([orderId])
}

// Trong webhook handler
async handlePaymentWebhook(idempotencyKey: string, ...) {
  // Check xem đã xử lý chưa
  const existing = await this.prisma.payment.findUnique({
    where: { idempotencyKey },
  });

  if (existing?.status === 'COMPLETED') {
    // Đã xử lý rồi, return success (idempotent)
    return { success: true };
  }

  // Xử lý và update
  await this.prisma.payment.update({ ... });
  await this.eventBus.emit('payment.completed', { ... });
}
```

---

## Tuần 8: Notification Service

### Tổng quan

Notification service gửi email transactional qua AWS SES. Nó sử dụng **Outbox pattern** để đảm bảo mọi notification đều được gửi dù service crash giữa chừng.

### Outbox Pattern

```
Vấn đề: Nếu save notification vào DB thành công nhưng service crash trước khi gửi email
         → Email không được gửi, không có cách retry

Giải pháp Outbox Pattern:
1. Khi nhận event, INSERT vào bảng Notification với status=PENDING trong cùng 1 transaction
2. Một background job chạy mỗi 30 giây, query tất cả PENDING notifications
3. Gửi email qua SES
4. Nếu thành công: UPDATE status=SENT
5. Nếu thất bại: UPDATE attempts++, nextRetryAt (exponential backoff)
6. Sau 5 lần thất bại: status=FAILED, alert team
```

### Database Schema (Prisma)

```prisma
// apps/notification-service/prisma/schema.prisma

model Notification {
  id          String             @id @default(uuid())
  userId      String?
  type        NotificationType
  channel     NotificationChannel @default(EMAIL)
  status      NotificationStatus  @default(PENDING)
  payload     Json                // Data để render template
  attempts    Int                 @default(0)
  maxAttempts Int                 @default(5)
  nextRetryAt DateTime?
  sentAt      DateTime?
  createdAt   DateTime            @default(now())

  @@index([status, nextRetryAt])  // Để query pending notifications
  @@index([userId])
}

model NotificationTemplate {
  id       String           @id @default(uuid())
  type     NotificationType @unique
  subject  String           // Email subject (có thể dùng template variables)
  bodyHtml String           // HTML template với Handlebars syntax

  @@index([type])
}

enum NotificationType {
  ORDER_CONFIRMED
  ORDER_SHIPPED
  ORDER_DELIVERED
  ORDER_CANCELLED
  PAYMENT_SUCCESS
  PAYMENT_FAILED
  WELCOME
  PASSWORD_RESET
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

### Email Templates

Email templates sử dụng Handlebars và được lưu trong DB (có thể edit qua admin):

```html
<!-- ORDER_CONFIRMED template -->
<html>
<body>
  <h2>Xác nhận đơn hàng #{{orderCode}}</h2>
  <p>Xin chào {{customerName}},</p>
  <p>Đơn hàng của bạn đã được xác nhận thành công.</p>

  <table>
    <tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th></tr>
    {{#each items}}
    <tr>
      <td>{{productName}} ({{variantTitle}})</td>
      <td>{{quantity}}</td>
      <td>{{formatVND price}}</td>
    </tr>
    {{/each}}
  </table>

  <p>Tổng cộng: <strong>{{formatVND total}}</strong></p>
  <p>Địa chỉ giao hàng: {{shippingAddress}}</p>

  <a href="{{trackingUrl}}">Theo dõi đơn hàng</a>
</body>
</html>
```

### Outbox Worker

```typescript
@Injectable()
export class OutboxWorker implements OnApplicationBootstrap {
  private readonly logger = new Logger(OutboxWorker.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  onApplicationBootstrap() {
    // Chạy mỗi 30 giây
    setInterval(() => this.processOutbox(), 30_000);
  }

  async processOutbox() {
    const pending = await this.prisma.notification.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } },
        ],
        attempts: { lt: 5 },
      },
      take: 50,
    });

    for (const notification of pending) {
      try {
        await this.emailService.send(notification);
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (error) {
        this.logger.error(`Failed to send notification ${notification.id}`, error);
        const backoffMs = Math.pow(2, notification.attempts) * 60_000; // 1m, 2m, 4m, 8m, 16m
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            attempts: { increment: 1 },
            nextRetryAt: new Date(Date.now() + backoffMs),
            status: notification.attempts >= 4 ? 'FAILED' : 'PENDING',
          },
        });
      }
    }
  }
}
```

---

## Key Patterns Phase 2

### Saga Pattern (Distributed Transaction)

Checkout saga sử dụng choreography-based saga (không có central orchestrator):

```
OrderCreated event
  → inventory-service: ReserveStock
    → Success: InventoryReserved event
      → order-service: UpdateStatus(CONFIRMED)
        → payment-service: CreatePayment
          → Client redirected to payment URL

PaymentCompleted event (từ webhook)
  → order-service: UpdateStatus(PROCESSING)
  → inventory-service: ConfirmSold
  → notification-service: SendOrderConfirmedEmail

PaymentFailed event
  → order-service: UpdateStatus(CANCELLED)
  → inventory-service: ReleaseStock
  → notification-service: SendPaymentFailedEmail

InventoryReserveFailed event (khi hết hàng)
  → order-service: UpdateStatus(CANCELLED)
  → notification-service: SendOutOfStockEmail
```

### Compensation Transaction

Khi có lỗi giữa chừng, cần rollback các bước đã thực hiện:

```typescript
// Ví dụ: Nếu inventory reserve thành công nhưng order bị lỗi
// → Phải emit CompensateInventoryReserve event
// → inventory-service phải có handler để release lại stock

@EventPattern('inventory.compensate.release')
async handleCompensateRelease(event: { orderId: string; items: OrderItem[] }) {
  for (const item of event.items) {
    await this.inventoryService.releaseStock(item.variantId, item.quantity, event.orderId);
  }
  this.logger.log(`Compensated inventory reserve for order ${event.orderId}`);
}
```

---

## Checklist Phase 2

### Order Service
- [x] Tạo đơn hàng từ cart hoạt động
- [x] Order code generate đúng format (TDB-YYYYMMDD-XXXX)
- [x] Snapshot giá sản phẩm lúc đặt hàng (không bị ảnh hưởng khi admin đổi giá)
- [x] State machine đúng (không thể skip state, không thể cancel sau PROCESSING)
- [x] OrderEvent được tạo cho mỗi lần đổi trạng thái
- [x] API lịch sử đơn hàng với pagination
- [x] Admin có thể cập nhật trạng thái và thêm tracking number

### Inventory Service
- [x] Reserve stock khi nhận OrderCreated event (HTTP call từ order-service)
- [x] Release stock khi nhận OrderCancelled event (HTTP call từ order-service)
- [x] Confirm sold khi nhận PaymentCompleted event
- [x] Không bao giờ để available < 0 (atomic update với transaction)
- [x] Inventory transaction log đầy đủ
- [x] Admin có thể nhập hàng (RESTOCK transaction)
- [ ] Alert khi stock < threshold (ví dụ < 5)

### Payment Service — VNPay
- [x] Tạo VNPay payment URL đúng format (HMAC-SHA512)
- [x] Verify signature trên return URL
- [x] Xử lý thành công và thất bại
- [x] Idempotency: webhook gọi nhiều lần không double-process
- [x] Lưu raw response để audit

### Payment Service — MoMo
- [x] Tạo MoMo payment URL (HMAC-SHA256)
- [x] Xử lý IPN webhook
- [x] Verify MoMo signature
- [x] Idempotency hoạt động

### Notification Service
- [x] Nhận order events và tạo notification records (POST /api/notifications)
- [x] Outbox worker gửi email thành công (setInterval 30s)
- [x] Retry với exponential backoff (2^attempts * 60s, tối đa 5 lần)
- [x] Email có đúng nội dung (order details, address)
- [x] Template cho: ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_CANCELLED, PAYMENT_FAILED
- [ ] AWS SES verified domain và email (đang dùng SMTP, SES là phase sau)

### Integration Tests
- [ ] End-to-end checkout flow test (mock payment webhook)
- [ ] Inventory reserve / release cycle test
- [ ] Order cancellation flow test
- [ ] Concurrent order test (race condition không oversell)

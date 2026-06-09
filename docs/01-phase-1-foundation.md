# 01 — Phase 1: Nền Tảng (Tuần 1–4)

## Mục tiêu

Kết thúc Phase 1, người dùng có thể:
- Đăng ký tài khoản mới bằng email/password
- Đăng nhập, nhận JWT token
- Xem danh sách và chi tiết sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Frontend Next.js hiển thị đầy đủ trang chủ, trang sản phẩm, trang giỏ hàng

---

## Kiến Trúc Demo-First

> **Quan trọng:** Dự án được thiết kế theo hướng **demo-first**. Các NestJS services được viết như **modules** trong một monolith, không phải separate TCP processes. Điều này giúp tiết kiệm chi phí AWS (~$270/tháng so với full microservices) trong khi vẫn giữ nguyên cấu trúc code để dễ tách ra sau.

### Demo vs Local Development vs Production

| Môi trường | Services | Database | Message Queue | Deploy |
|-----------|----------|----------|---------------|--------|
| **Local dev** | Docker Compose: tất cả in-container | 4 PostgreSQL containers + 1 DB container demo | RabbitMQ container | `docker compose up` |
| **Demo AWS** | NestJS monolith trên EC2 | RDS db.t3.micro (1 DB, schemas) | Bull (Redis-backed) | SSH + docker compose |
| **Production** | 7 microservices trên EKS | RDS per-service, Multi-AZ | Amazon MQ RabbitMQ | ArgoCD GitOps |

### NestJS Monolith vs Microservices: Cùng Code, Khác Cách Chạy

**Demo/Local (monolith — tất cả trong 1 process):**
```typescript
// apps/monolith/src/app.module.ts
@Module({
  imports: [
    AuthModule,         // module, không phải separate service
    ProductModule,
    OrderModule,
    InventoryModule,
    CartModule,
    NotificationModule,
    // Bull thay RabbitMQ — backed by Redis, không cần Amazon MQ
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      },
    }),
  ],
})
export class AppModule {}
```

**Production (microservice — mỗi module thành app riêng):**
```typescript
// apps/auth-service/src/main.ts
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
  transport: Transport.TCP,
  options: { host: '0.0.0.0', port: 3001 },
});
await app.listen();

// apps/gateway/src/app.module.ts — forward đến các TCP services
ClientsModule.register([
  { name: 'AUTH_SERVICE', transport: Transport.TCP, options: { host: 'auth-service', port: 3001 } },
  // ...
])
```

**Nội bộ `AuthModule` không thay đổi** giữa hai cách chạy này. Chỉ thay đổi cách khởi động và wiring gateway.

---

## Tuần 1: Infrastructure Setup

### Mục tiêu tuần 1
Dựng môi trường local development hoàn chỉnh, mọi developer có thể chạy được dự án với một lệnh.

### Docker Compose (local)

File `backend/docker-compose.yml`:

```yaml
version: "3.9"
services:
  postgres-auth:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: [postgres_auth_data:/var/lib/postgresql/data]

  postgres-product:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: product_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5433:5432"]
    volumes: [postgres_product_data:/var/lib/postgresql/data]

  postgres-order:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: order_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5434:5432"]
    volumes: [postgres_order_data:/var/lib/postgresql/data]

  postgres-inventory:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: inventory_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5435:5432"]
    volumes: [postgres_inventory_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --requirepass redis_password

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    ports:
      - "5672:5672"    # AMQP
      - "15672:15672"  # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports: ["9200:9200"]
    volumes: [es_data:/usr/share/elasticsearch/data]

volumes:
  postgres_auth_data:
  postgres_product_data:
  postgres_order_data:
  postgres_inventory_data:
  es_data:
```

### Running Locally vs Demo AWS: Sự Khác Biệt

**Local development** dùng `docker-compose.yml` ở trên — tất cả chạy local, bao gồm PostgreSQL, Redis, RabbitMQ, Elasticsearch.

**Demo AWS** dùng `docker-compose.prod.yml` trên EC2 — chỉ chạy app và Nginx, **không** chạy database/redis/queue (dùng managed services):

| Thành phần | Local (`docker-compose.yml`) | Demo AWS (`docker-compose.prod.yml`) |
|-----------|------------------------------|--------------------------------------|
| PostgreSQL | 4 containers local | RDS db.t3.micro (AWS managed) |
| Redis | Redis container | ElastiCache cache.t3.micro (AWS managed) |
| RabbitMQ | RabbitMQ container | **Không dùng** — thay bằng Bull queues qua Redis |
| Elasticsearch | Elasticsearch container | **Không dùng** — thay bằng PostgreSQL tsvector |
| App | Nhiều services hoặc monolith | NestJS monolith trong 1 container |
| Proxy | Không (dev mode) | Nginx container |

**Thay đổi quan trọng khi deploy demo:**
1. `RABBITMQ_URL` không dùng nữa — Bull jobs config trỏ vào `REDIS_HOST`
2. `ELASTICSEARCH_URL` không dùng — Product search dùng `tsvector` trong PostgreSQL
3. Tất cả `DATABASE_URL` trỏ vào cùng 1 RDS endpoint, khác nhau ở `?schema=xxx`

**Ví dụ khác biệt Bull vs RabbitMQ:**
```typescript
// Local dev (RabbitMQ consumer):
@MessagePattern('order.created')  // RabbitMQ pattern
async handleOrderCreated(@Payload() data: OrderCreatedEvent) { ... }

// Demo AWS (Bull job processor):
@Process('order.created')  // Bull job name
async handleOrderCreated(@Job() job: Job<OrderCreatedEvent>) { ... }
```

Cả hai đều dùng cùng `OrderCreatedEvent` interface — chỉ decorator và import thay đổi.

---

### Shared Libraries

Tạo các shared packages trong `backend/libs/`:

**libs/shared** — DTOs và types dùng chung:
```
libs/shared/src/
  dto/
    pagination.dto.ts       # PaginationQuery, PaginatedResponse
    id-param.dto.ts         # { id: string }
  types/
    user.types.ts           # UserRole enum, JwtPayload interface
    order.types.ts          # OrderStatus enum
    payment.types.ts        # PaymentMethod, PaymentStatus enum
  constants/
    queues.ts               # QUEUE_NAMES constants
    patterns.ts             # MESSAGE_PATTERNS constants
```

**libs/messaging** — RabbitMQ event contracts:
```typescript
// libs/messaging/src/events/order.events.ts
export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  items: { variantId: string; quantity: number; price: number }[];
  total: number;
  createdAt: Date;
}

export interface PaymentCompletedEvent {
  orderId: string;
  paymentId: string;
  amount: number;
  method: 'VNPAY' | 'MOMO' | 'COD';
  completedAt: Date;
}
```

**libs/common** — Guards, interceptors, pipes:
```
libs/common/src/
  guards/
    jwt-auth.guard.ts
    roles.guard.ts
  interceptors/
    logging.interceptor.ts
    transform.interceptor.ts   # Wrap response in { data, meta }
  pipes/
    validation.pipe.ts
  decorators/
    current-user.decorator.ts
    public.decorator.ts
```

### Khởi động

```bash
# Clone + install
git clone https://github.com/your-org/toidibangiay.git
cd toidibangiay/backend
pnpm install

# Start infrastructure
docker-compose up -d

# Verify tất cả container đang chạy
docker-compose ps

# Run migrations cho tất cả services
pnpm --filter auth-service prisma migrate dev
pnpm --filter product-service prisma migrate dev
pnpm --filter order-service prisma migrate dev
pnpm --filter inventory-service prisma migrate dev
```

---

## Tuần 2: Auth Service

### Tổng quan

Auth service xử lý toàn bộ việc xác thực và phân quyền. Nó expose TCP transport cho gateway và không nhận HTTP trực tiếp.

### Endpoints (qua Gateway)

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | /api/auth/register | Không | Đăng ký tài khoản mới |
| POST | /api/auth/login | Không | Đăng nhập, nhận tokens |
| POST | /api/auth/logout | Có | Revoke refresh token |
| POST | /api/auth/refresh | Không | Lấy access token mới |
| GET | /api/auth/me | Có | Lấy thông tin user hiện tại |

### Request/Response Examples

**POST /api/auth/register**
```json
// Request
{
  "email": "nguyen@example.com",
  "password": "MyP@ssw0rd123",
  "fullName": "Nguyễn Văn A"
}

// Response 201
{
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "nguyen@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**POST /api/auth/login**
```json
// Request
{
  "email": "nguyen@example.com",
  "password": "MyP@ssw0rd123"
}

// Response 200
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}

// Error 401
{
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không đúng"
}
```

### Database Schema (Prisma)

```prisma
// apps/auth-service/prisma/schema.prisma

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  fullName     String
  role         Role      @default(CUSTOMER)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  refreshTokens RefreshToken[]

  @@index([email])
}

model RefreshToken {
  id        String    @id @default(uuid())
  userId    String
  token     String    @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}

enum Role {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}
```

### Security Implementation

```typescript
// Password hashing với Argon2
import * as argon2 from 'argon2';

// Hash khi register
const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,   // 64 MB
  timeCost: 3,
  parallelism: 4,
});

// Verify khi login
const isValid = await argon2.verify(user.passwordHash, password);

// JWT payload structure
interface JwtPayload {
  sub: string;     // userId
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

// Access token: 15 phút
// Refresh token: 30 ngày, stored hashed in DB
```

### Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
JWT_SECRET=change-me-in-production-use-256-bit-random-string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
REDIS_URL=redis://:redis_password@localhost:6379
RATE_LIMIT_WINDOW_MS=900000   # 15 phút
RATE_LIMIT_MAX_ATTEMPTS=5     # 5 lần thất bại thì block
```

### Chạy và test

```bash
# Start auth-service
pnpm --filter auth-service start:dev

# Test với curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","fullName":"Test User"}'

# Unit tests
pnpm --filter auth-service test

# E2E tests
pnpm --filter auth-service test:e2e
```

---

## Tuần 3: Product Service

### Tổng quan

Product service quản lý toàn bộ catalog sản phẩm. Nó expose cả HTTP (qua gateway) và TCP (cho internal calls). Khi sản phẩm thay đổi, nó publish event để Elasticsearch indexer sync.

### Endpoints (qua Gateway)

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | /api/products | Không | Danh sách sản phẩm (filter, paginate) |
| GET | /api/products/:slug | Không | Chi tiết sản phẩm |
| POST | /api/products | ADMIN | Tạo sản phẩm mới |
| PUT | /api/products/:id | ADMIN | Cập nhật sản phẩm |
| DELETE | /api/products/:id | ADMIN | Xóa sản phẩm |
| GET | /api/categories | Không | Danh sách danh mục |
| GET | /api/categories/:slug | Không | Chi tiết danh mục + sản phẩm |
| POST | /api/products/:id/images | ADMIN | Upload ảnh sản phẩm |

### Query Parameters cho GET /api/products

| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| category | string | Slug danh mục | `sneakers` |
| brand | string | Tên thương hiệu | `Nike` |
| minPrice | number | Giá tối thiểu (VND) | `200000` |
| maxPrice | number | Giá tối đa (VND) | `2000000` |
| size | string | Kích cỡ | `42` |
| color | string | Màu sắc | `black` |
| sort | string | Sắp xếp | `price_asc`, `price_desc`, `newest`, `popular` |
| page | number | Trang (default 1) | `2` |
| limit | number | Số item/trang (default 20, max 100) | `20` |
| q | string | Full-text search | `giày chạy bộ` |

### Database Schema (Prisma)

```prisma
// apps/product-service/prisma/schema.prisma

model Category {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  description String?
  imageUrl    String?
  parentId    String?
  sortOrder   Int        @default(0)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())

  parent   Category?  @relation("CategoryChildren", fields: [parentId], references: [id])
  children Category[] @relation("CategoryChildren")
  products Product[]

  @@index([slug])
  @@index([parentId])
}

model Product {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  brand       String
  categoryId  String
  tags        String[]  @default([])
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  category Category       @relation(fields: [categoryId], references: [id])
  images   ProductImage[]
  variants ProductVariant[]

  @@index([slug])
  @@index([categoryId])
  @@index([brand])
  @@index([isActive, createdAt])
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  url       String
  altText   String?
  position  Int     @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

model ProductVariant {
  id             String   @id @default(uuid())
  productId      String
  sku            String   @unique
  price          Int      // VND, stored as integer (không có xu)
  compareAtPrice Int?     // Giá gốc để hiển thị giảm giá
  attributes     Json     // { "size": "42", "color": "black" }
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([sku])
}
```

### S3 Image Upload Flow

```typescript
// Upload ảnh lên S3 và trả về CloudFront URL
async uploadProductImage(file: Express.Multer.File, productId: string) {
  const key = `products/${productId}/${uuid()}.${getExtension(file.originalname)}`;

  await this.s3.putObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  const cdnUrl = `${process.env.CDN_URL}/${key}`;
  // Cloudinary transform: ?w=800&h=800&fit=cover&f=webp
  return cdnUrl;
}
```

### Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/product_db
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=toidibangiay-media-dev
CDN_URL=https://cdn.toidibangiay.vn
RABBITMQ_URL=amqp://admin:admin@localhost:5672
ELASTICSEARCH_URL=http://localhost:9200
```

---

## Tuần 4: Cart Service + API Gateway Wiring

### Cart Service

#### Tổng quan
Cart được lưu trong Redis với TTL 30 ngày. Hỗ trợ cả guest cart (sessionId) và user cart (userId). Khi user đăng nhập, guest cart được merge vào user cart.

#### Endpoints (qua Gateway)

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | /api/cart | Tùy chọn | Xem giỏ hàng hiện tại |
| POST | /api/cart/items | Tùy chọn | Thêm item vào giỏ |
| PUT | /api/cart/items/:variantId | Tùy chọn | Cập nhật số lượng |
| DELETE | /api/cart/items/:variantId | Tùy chọn | Xóa item khỏi giỏ |
| DELETE | /api/cart | Tùy chọn | Xóa toàn bộ giỏ hàng |
| POST | /api/cart/merge | Có | Merge guest cart vào user cart (sau login) |

#### Redis Data Structure

```
# Key pattern
cart:user:{userId}      → Hash
cart:session:{sessionId} → Hash

# Hash fields
field: variantId
value: { quantity: 2, addedAt: "2024-01-15T10:00:00Z" }

# Example
HSET cart:user:abc123 "variant-uuid-1" '{"quantity":2,"addedAt":"2024-01-15T10:00:00Z"}'
HSET cart:user:abc123 "variant-uuid-2" '{"quantity":1,"addedAt":"2024-01-15T10:05:00Z"}'
EXPIRE cart:user:abc123 2592000  # 30 ngày
```

#### Request/Response Examples

**POST /api/cart/items**
```json
// Request
{
  "variantId": "variant-uuid-here",
  "quantity": 2
}

// Response 200
{
  "data": {
    "items": [
      {
        "variantId": "variant-uuid-here",
        "quantity": 2,
        "product": {
          "name": "Nike Air Max 270",
          "slug": "nike-air-max-270",
          "image": "https://cdn.toidibangiay.vn/products/..."
        },
        "variant": {
          "sku": "NAM270-BLK-42",
          "price": 3500000,
          "attributes": { "size": "42", "color": "black" }
        }
      }
    ],
    "subtotal": 7000000,
    "itemCount": 2
  }
}

// Error 400 — hết hàng
{
  "statusCode": 400,
  "message": "Sản phẩm này đã hết hàng"
}
```

### API Gateway Wiring

#### Gateway Pattern

Gateway sử dụng `@nestjs/microservices` để forward requests đến services qua TCP:

```typescript
// apps/gateway/src/app.module.ts
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'auth-service', port: 3001 },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: { host: 'product-service', port: 3003 },
      },
      {
        name: 'CART_SERVICE',
        transport: Transport.TCP,
        options: { host: 'cart-service', port: 3005 },
      },
    ]),
  ],
})
```

```typescript
// apps/gateway/src/cart/cart.controller.ts
@Controller('api/cart')
export class CartController {
  constructor(
    @Inject('CART_SERVICE') private cartClient: ClientProxy,
  ) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  getCart(@CurrentUser() user: JwtPayload, @Session() session: any) {
    const cartId = user?.sub ?? `session:${session.id}`;
    return this.cartClient.send('cart.get', { cartId });
  }

  @Post('items')
  @UseGuards(OptionalJwtGuard)
  addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: JwtPayload,
    @Session() session: any,
  ) {
    const cartId = user?.sub ?? `session:${session.id}`;
    return this.cartClient.send('cart.addItem', { cartId, ...dto });
  }
}
```

#### JWT Validation tại Gateway

```typescript
// apps/gateway/src/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Payload đã được verify bởi Passport
    // Có thể check blacklist ở đây nếu cần
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
```

#### Rate Limiting

```typescript
// apps/gateway/src/main.ts
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100,                  // 100 requests per window per IP
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Strict rate limit cho auth endpoints
// 5 login attempts per 15 minutes per IP
```

---

## Checklist Phase 1

### Infrastructure
- [x] Docker Compose chạy thành công (postgres, redis, rabbitmq)
- [x] PostgreSQL databases: `shoestore_auth`, `shoestore_product`, `shoestore_cart`
- [x] Redis kết nối được (`PONG`)
- [x] RabbitMQ container running, UI tại `localhost:15672` (demo dùng PostgreSQL queue thay thế)
- [ ] Elasticsearch — bỏ qua cho demo, dùng PostgreSQL ILIKE search

### Auth Service
- [x] `POST /api/auth/register` — tạo user, hash Argon2id
- [x] `POST /api/auth/login` — trả về `accessToken` (body) + `refreshToken` (httpOnly cookie)
- [x] `GET /api/auth/me` — trả về thông tin user từ JWT
- [x] `POST /api/auth/refresh` — rotate refresh token
- [x] `POST /api/auth/logout` — revoke refresh token
- [x] `POST /api/auth/forgot-password` / `reset-password` / `verify-email`
- [x] Access token TTL 15 phút (`JWT_ACCESS_TTL_SECONDS=900`)
- [x] Rate limiting sau 5 lần login thất bại (Redis counter)
- [ ] Unit tests — chưa viết

### Product Service
- [x] `GET /api/products` — danh sách, filter (category/brand/color/size/price), pagination
- [x] `GET /api/products/:slug` — chi tiết theo slug
- [x] `POST /api/products` — tạo sản phẩm, auto-generate slug tiếng Việt
- [x] `GET /api/categories`, `GET /api/categories/:slug`
- [x] `GET/POST /api/products/:productId/variants`
- [x] `POST /api/products/:slug/images` — thêm ảnh qua URL
- [x] Swagger docs tại `/api/docs`
- [x] Seed data: 3 categories, 5 sản phẩm (Nike, Adidas, Converse, NB, Vans)
- [ ] ADMIN guard trên POST/DELETE — **chưa có**, bất kỳ ai cũng gọi được
- [ ] Product events (Bull/RabbitMQ) — bỏ qua cho demo

### Cart Service
- [x] `POST /api/cart/items` — thêm item (chỉ cần `variantId + quantity`, service tự lookup)
- [x] `GET /api/cart` — xem giỏ hàng
- [x] `PATCH /api/cart/items/:variantId` — cập nhật số lượng
- [x] `DELETE /api/cart/items/:variantId` — xóa item
- [x] `POST /api/cart/merge` — merge guest cart vào user cart sau login
- [x] Guest cart với `x-session-id` header (không cần đăng nhập)
- [x] User cart với JWT Bearer token
- [x] Trả về đầy đủ: productName, variantLabel, imageUrl, price
- [ ] Cart TTL — đang dùng PostgreSQL, không có TTL tự động (đủ cho demo)

### API Gateway
- [x] HTTP proxy tới tất cả services
- [x] JWT middleware bảo vệ `/checkout/*`
- [x] Public: `/products`, `/categories`, `/auth/*`, `/cart/*` (guest + auth)
- [x] Rate limiting: 10 req/s, 100 req/min (HTTP 429 khi vượt)
- [x] Swagger UI tại `/api/docs`
- [x] Forward `Authorization`, `Cookie`, `x-session-id` headers

### Frontend (Next.js)
- [x] Trang chủ `/` — Hero + ProductGrid (fetch từ backend)
- [x] Trang shop `/products` — filter sidebar (price, size, availability, sort)
- [x] Trang chi tiết `/products/:slug` — gallery + VariantSelector + AddToCart
- [x] Cart drawer — thêm/xóa/cập nhật số lượng, subtotal VND
- [x] Navbar — cart badge count với animation, user icon
- [x] `/login` và `/register` — form validation, redirect sau login
- [x] Auth persist — localStorage (`tdbg_access_token`, `tdbg_user`)
- [x] Guest cart — `x-session-id` tự generate, merge vào user cart sau login
- [x] Product URL dùng slug (`/products/nike-air-max-270`)
- [x] TypeScript clean — 0 lỗi (`tsc --noEmit`)

# 00 — Tổng Quan Dự Án: toidibangiay

## Mục tiêu kinh doanh

**toidibangiay** (tôi đi bán giày) là nền tảng thương mại điện tử bán giày trực tuyến tại thị trường Việt Nam. Dự án nhắm đến:

- Khách hàng Việt Nam, thanh toán bằng VND
- Hỗ trợ cổng thanh toán nội địa: VNPay, MoMo, COD
- Catalog đa dạng: giày thể thao, giày da, dép, phụ kiện
- Quản lý kho hàng real-time, tránh oversell
- Trải nghiệm mobile-first (70% traffic từ điện thoại)
- Scale được đến hàng triệu đơn hàng mà không cần re-architect

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│   │  Next.js App │    │  Mobile Web  │    │   Admin Dashboard    │  │
│   │  (SSR/SSG)   │    │  (PWA)       │    │   (Next.js)          │  │
│   └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
└──────────┼────────────────────┼─────────────────────┼───────────────┘
           │                   │                      │
           ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS CloudFront + WAF                              │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                              │
│         :3000  —  JWT validation, rate limiting, routing            │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐
│  auth-   │ │ product- │ │  cart-  │ │ order-  │ │notification- │
│ service  │ │ service  │ │ service │ │ service │ │   service    │
│  :3001   │ │  :3002   │ │  :3003  │ │  :3004  │ │    :3006     │
└────┬─────┘ └────┬─────┘ └────┬────┘ └────┬────┘ └──────┬───────┘
     │            │             │           │              │
     ▼            ▼             ▼           ▼              │
┌────────┐   ┌────────┐   ┌────────┐  ┌─────────┐        │
│Postgres│   │Postgres│   │ Redis  │  │Postgres │        │
│auth_db │   │prod_db │   │        │  │order_db │        │
└────────┘   └────────┘   └────────┘  └────┬────┘        │
                                           │              │
                               ┌───────────┴──────────────┘
                               ▼
                       ┌───────────────┐
                       │   RabbitMQ    │
                       │  (Amazon MQ)  │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌──────────┐
       │  inventory- │  │  payment-   │  │   SES    │
       │   service   │  │   service   │  │  (email) │
       │    :3005    │  │    :3007    │  └──────────┘
       └─────────────┘  └─────────────┘
              │
              ▼
       ┌─────────────┐
       │  Postgres   │
       │ inventory_db│
       └─────────────┘

       Shared Infrastructure:
       ┌────────────────────────────────────────┐
       │  Elasticsearch (OpenSearch Service)     │
       │  S3 (media uploads)                     │
       │  CloudFront (CDN for images)            │
       │  Secrets Manager (env vars)             │
       └────────────────────────────────────────┘
```

## Tech Stack

### Frontend

| Layer | Technology | Lý do chọn |
|-------|-----------|-------------|
| Framework | Next.js 14 (App Router) | SSR/SSG, SEO tốt, React Server Components |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + shadcn/ui | Nhanh, consistent, accessible |
| State (server) | TanStack Query v5 | Cache, background refetch, optimistic updates |
| State (client) | Zustand | Nhẹ, đơn giản cho cart/auth |
| Animation | Framer Motion | Page transitions, micro-interactions |
| Image CDN | Cloudinary | Transform, optimize, lazy load |
| PWA | next-pwa | Service worker, offline cache |
| Forms | React Hook Form + Zod | Validation tốt, ít re-render |

### Backend

| Layer | Technology | Lý do chọn |
|-------|-----------|-------------|
| Framework | NestJS 10 | Modular, DI, decorator-based, enterprise-ready |
| Language | TypeScript | Shared types với frontend |
| ORM | Prisma | Type-safe queries, migrations, schema |
| Auth | Passport.js + JWT + Argon2 | Industry standard |
| Message Broker | RabbitMQ (Amazon MQ) | Reliable, persistent queues |
| Validation | class-validator + Zod | DTO validation tại gateway |
| API Docs | Swagger (@nestjs/swagger) | Auto-generate từ decorators |
| Testing | Jest + Supertest | Unit + integration tests |

### Database & Cache

| Công nghệ | Dùng cho |
|-----------|---------|
| PostgreSQL 15 (RDS Multi-AZ) | Primary data store cho mỗi service |
| Redis 7 (ElastiCache) | Session, cart cache, rate limiting, job queue |
| Elasticsearch (OpenSearch) | Full-text search sản phẩm, tiếng Việt |
| RabbitMQ (Amazon MQ) | Async messaging giữa services |

### Infrastructure

| Công nghệ | Dùng cho |
|-----------|---------|
| AWS EKS | Kubernetes cluster |
| AWS ECR | Docker image registry |
| AWS RDS | PostgreSQL managed |
| AWS ElastiCache | Redis managed |
| AWS OpenSearch | Elasticsearch managed |
| AWS S3 | Media storage |
| AWS CloudFront | CDN |
| AWS SES | Email transactional |
| AWS WAF | Web application firewall |
| AWS Secrets Manager | Environment variables |
| AWS Route 53 | DNS |
| AWS ACM | SSL certificates |
| Terraform | Infrastructure as Code |
| ArgoCD | GitOps deployment |
| GitHub Actions | CI/CD pipeline |
| Prometheus + Grafana | Monitoring |
| AWS X-Ray | Distributed tracing |
| Sentry | Error tracking |

## Cấu trúc Monorepo

```
toidibangiay/
├── backend/                          # NestJS microservices
│   ├── apps/
│   │   ├── gateway/                  # API Gateway — entry point duy nhất từ client
│   │   ├── auth-service/             # Xác thực, phân quyền
│   │   ├── user-service/             # Profile người dùng, địa chỉ
│   │   ├── product-service/          # Catalog sản phẩm, danh mục
│   │   ├── inventory-service/        # Quản lý tồn kho
│   │   ├── cart-service/             # Giỏ hàng (Redis-backed)
│   │   ├── order-service/            # Đơn hàng, trạng thái
│   │   ├── payment-service/          # VNPay, MoMo integration
│   │   └── notification-service/     # Email, push notifications
│   ├── libs/
│   │   ├── shared/                   # DTOs, types, constants dùng chung
│   │   ├── database/                 # Prisma clients, migrations
│   │   ├── messaging/                # RabbitMQ patterns, event types
│   │   └── common/                   # Guards, interceptors, pipes dùng chung
│   ├── docker-compose.yml            # Local development infrastructure
│   ├── docker-compose.test.yml       # Test environment
│   └── pnpm-workspace.yaml
│
├── shopify-store/                    # Next.js frontend (tên thư mục legacy)
│   ├── app/                          # App Router pages
│   │   ├── (shop)/                   # Public shop pages
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   └── search/
│   │   ├── (auth)/                   # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (account)/                # Protected account pages
│   │   │   ├── orders/
│   │   │   └── profile/
│   │   ├── checkout/                 # Checkout flow
│   │   └── admin/                    # Admin dashboard
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── shop/                     # Product cards, filters, etc.
│   │   ├── cart/                     # Cart drawer, items
│   │   ├── checkout/                 # Checkout form, payment
│   │   └── admin/                    # Admin tables, forms
│   ├── lib/
│   │   ├── api/                      # API client functions
│   │   ├── stores/                   # Zustand stores
│   │   └── utils/                    # Helpers, formatters
│   └── public/                       # Static assets
│
├── infrastructure/                   # Terraform IaC
│   ├── modules/
│   └── environments/
│
└── docs/                             # Tài liệu này
```

## Service Map

### gateway (Port 3000)
**Vai trò:** Single entry point cho tất cả HTTP requests từ frontend.
- Xác thực JWT trên mọi request (trừ public endpoints)
- Rate limiting per IP và per user
- Route requests đến đúng microservice qua TCP/RabbitMQ
- Request/response transformation
- Swagger documentation aggregation

### auth-service (Port 3001)
**Vai trò:** Quản lý identity và session.
- Register/login với email + password (Argon2 hash)
- JWT access token (15 phút) + refresh token (30 ngày)
- Refresh token rotation với revocation
- Role-based: CUSTOMER, ADMIN, SUPER_ADMIN
- Rate limiting đăng nhập thất bại (5 lần / 15 phút)

### user-service (Port 3002 — internal)
**Vai trò:** Profile và địa chỉ người dùng.
- CRUD profile (tên, SĐT, avatar)
- Quản lý địa chỉ giao hàng (tối đa 5 địa chỉ)
- Tích hợp với auth-service qua userId

### product-service (Port 3003)
**Vai trò:** Catalog sản phẩm.
- CRUD sản phẩm, variants (size/color/màu sắc)
- Quản lý danh mục (có hierarchy parent/child)
- Upload ảnh lên S3, sync với CloudFront CDN
- Publish events khi product thay đổi (để Elasticsearch sync)

### inventory-service (Port 3004)
**Vai trò:** Tồn kho real-time.
- Theo dõi số lượng từng variant trong từng kho
- Reserve stock khi đặt hàng (tránh oversell)
- Release stock khi đơn bị cancel hoặc timeout
- Emit events cho order-service

### cart-service (Port 3005)
**Vai trò:** Giỏ hàng (stateless với Redis).
- Guest cart (session ID) và user cart (userId)
- Merge guest cart vào user cart khi đăng nhập
- Validate stock availability khi thêm vào giỏ
- TTL 30 ngày cho cart

### order-service (Port 3006)
**Vai trò:** Quản lý đơn hàng.
- Tạo đơn từ cart (snapshot giá tại thời điểm đặt)
- State machine: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED / CANCELLED
- Order history với event sourcing (OrderEvent table)
- Orchestrate saga: inventory reserve → payment → notification

### payment-service (Port 3007)
**Vai trò:** Tích hợp cổng thanh toán.
- VNPay: tạo payment URL, xử lý return callback
- MoMo: tạo payment, xử lý IPN webhook
- Idempotency để tránh double-charge
- Lưu payment records, refund support

### notification-service (Port 3008)
**Vai trò:** Gửi thông báo.
- Email transactional qua AWS SES
- Template: xác nhận đơn, cập nhật trạng thái, giao hàng
- Outbox pattern: đảm bảo không mất notification khi service crash
- Retry với exponential backoff

## Data Flow

### Luồng duyệt sản phẩm

```
Client
  │── GET /api/products?category=sneakers&size=42&sort=price_asc
  ▼
Gateway
  │── Validate query params
  │── Forward to product-service (TCP)
  ▼
product-service
  │── Query Elasticsearch (full-text + filters)
  │── Enrich với inventory counts từ inventory-service
  │── Return paginated results
  ▼
Client ← JSON response với products + pagination meta
```

### Luồng thêm vào giỏ hàng

```
Client
  │── POST /api/cart/items { variantId, quantity }
  ▼
Gateway
  │── Extract userId từ JWT (hoặc sessionId nếu guest)
  │── Forward to cart-service
  ▼
cart-service
  │── Check inventory availability (sync call đến inventory-service)
  │── If available: upsert CartItem trong Redis
  │── Return updated cart
  ▼
Client ← Updated cart state
```

### Luồng Checkout

```
Client
  │── POST /api/orders { addressId, paymentMethod }
  ▼
Gateway → order-service
  │── Validate cart không rỗng
  │── Snapshot cart items + prices
  │── Create Order record (status: PENDING)
  │── Emit OrderCreated event → RabbitMQ
  ▼
inventory-service (async, consume event)
  │── Reserve stock cho từng variant
  │── Emit InventoryReserved event
  ▼
order-service (consume InventoryReserved)
  │── Update Order status: CONFIRMED
  │── Emit OrderConfirmed event
  ▼
payment-service (async)
  │── Create payment record
  │── Return payment URL (VNPay/MoMo)
  ▼
Client ← Redirect to payment gateway

[Sau khi user thanh toán xong]
  ▼
payment-service (webhook from VNPay/MoMo)
  │── Verify signature
  │── Mark payment COMPLETED
  │── Emit PaymentCompleted event
  ▼
order-service → Update status: PROCESSING
notification-service → Send confirmation email
inventory-service → Mark stock as SOLD (remove reserve)
```

## Environment Variables Overview

Mỗi service cần các env vars sau (lưu trong AWS Secrets Manager, inject qua Kubernetes Secrets):

```bash
# Common — mọi service đều cần
NODE_ENV=production
SERVICE_NAME=auth-service

# Database — mỗi service có DB riêng
DATABASE_URL=postgresql://user:pass@rds-host:5432/auth_db

# JWT — chỉ auth-service và gateway
JWT_SECRET=<256-bit random>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Redis — cart-service, gateway (rate limit)
REDIS_URL=redis://elasticache-host:6379

# RabbitMQ — tất cả services emit/consume events
RABBITMQ_URL=amqps://user:pass@amazonmq-host:5671

# AWS
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=toidibangiay-media
AWS_SES_FROM_EMAIL=no-reply@toidibangiay.vn

# Elasticsearch
ELASTICSEARCH_URL=https://opensearch-host:443

# Payment
VNPAY_TMN_CODE=<from VNPay>
VNPAY_HASH_SECRET=<from VNPay>
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=<from MoMo>
MOMO_ACCESS_KEY=<from MoMo>
MOMO_SECRET_KEY=<from MoMo>
MOMO_URL=https://test-payment.momo.vn/v2/gateway/api/create

# Frontend
NEXT_PUBLIC_API_URL=https://api.toidibangiay.vn
NEXT_PUBLIC_CDN_URL=https://cdn.toidibangiay.vn
NEXTAUTH_SECRET=<256-bit random>
```

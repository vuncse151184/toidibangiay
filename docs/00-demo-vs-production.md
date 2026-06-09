# 00 — Demo vs Production: Kiến Trúc & Lộ Trình Nâng Cấp

## Tổng quan

Dự án được thiết kế theo **hai giai đoạn rõ ràng**:

- **Demo stage (hiện tại)**: Chạy toàn bộ hệ thống với chi phí tối thiểu, đủ để demo và phục vụ vài trăm khách hàng đầu tiên. Mục tiêu: chi phí ~$1–16/tháng trong AWS Free Tier.
- **Production stage (khi scale)**: Tách microservices, Kubernetes, Multi-AZ — khi traffic thực sự đòi hỏi.

Codebase được viết **module-first**: các NestJS services là các module độc lập trong một monolith, dễ tách thành microservice khi cần mà không cần rewrite.

---

## Kiến Trúc Demo (Hiện Tại)

```
Internet
    │
    ▼
[Vercel — Next.js Frontend]  (Free Hobby plan)
    │  HTTPS
    ▼
[Route 53] → [EC2 t2.micro / t3.small]
                  │
          [Nginx reverse proxy]
                  │
          [NestJS Monolith] ← tất cả 7 module trong 1 process
          [Bull queues]     ← Redis-backed, thay RabbitMQ
                  │
         ┌────────┴────────┐
         ▼                 ▼
[RDS db.t3.micro]   [ElastiCache cache.t3.micro]
[PostgreSQL 15]     [Redis 7]
[1 DB, schemas:]    [Session, Cart, Cache]
  auth
  products
  orders
  inventory
  cart
  notifications
         │
         ▼
[S3 + CloudFront]  (media: ảnh sản phẩm)
```

### Chi phí demo (trong Free Tier năm đầu)

| Dịch vụ | Free Tier | Sau Free Tier |
|---------|-----------|---------------|
| EC2 t2.micro | FREE (750hr/tháng, 1 năm) | ~$8.50/tháng |
| EC2 t3.small (khuyến nghị) | — | ~$15/tháng |
| RDS db.t3.micro | FREE (750hr/tháng, 1 năm) | ~$25/tháng |
| ElastiCache cache.t3.micro | FREE (750hr/tháng, 1 năm) | ~$12/tháng |
| S3 | FREE (5GB, 20k GET) | ~$2/tháng |
| CloudFront | FREE (1TB transfer) | ~$3/tháng |
| Route 53 | — | ~$1/tháng |
| SES (từ EC2) | FREE (62k email/tháng) | ~$0.10/1k |
| Vercel | FREE | FREE |
| **Tổng** | **~$1/tháng** | **~$43–58/tháng** |

**$200 AWS Credit runway:**
- Tháng 1–12: ~$12 tổng (gần như free tier hoàn toàn)
- Tháng 13+: ~$50/tháng
- $200 credit kéo dài thêm ~4 tháng sau khi free tier hết

---

## Kiến Trúc Production (Khi Scale)

```
Internet
    │
    ▼
[Vercel / Amplify — Next.js]
    │  HTTPS
    ▼
[Route 53] → [CloudFront] → [ALB (Application Load Balancer)]
                                    │
                    ┌───────────────▼────────────────┐
                    │       EKS Cluster               │
                    │  [Gateway Service]              │
                    │       │                         │
                    │  ┌────┴──────────────────┐      │
                    │  ▼    ▼    ▼    ▼    ▼   ▼      │
                    │ [auth][product][order]           │
                    │ [inventory][cart][payment]       │
                    │ [notification]                   │
                    └───────────────┬────────────────-┘
                                    │
          ┌─────────────────────────┼──────────────────┐
          ▼                         ▼                   ▼
[RDS Multi-AZ]           [ElastiCache Cluster]  [Amazon MQ RabbitMQ]
[PostgreSQL per service]  [Redis Cluster Mode]
          │
          ▼
     [OpenSearch]  (full-text search)
```

### Chi phí production (mid-scale)

| Dịch vụ | Config | Chi phí/tháng |
|---------|--------|---------------|
| EKS | 3–20x t3.medium nodes | $90–600 |
| RDS Multi-AZ | 6x db.t3.medium | $600 |
| ElastiCache Cluster | 3 shards × 2 nodes | $360 |
| OpenSearch | 2x r6g.large | $400 |
| Amazon MQ | 3x mq.m5.large | $330 |
| ALB + WAF + misc | — | ~$50 |
| **Tổng** | | **~$1,500–2,500/tháng** |

---

## So Sánh: Demo vs Production

| Thành phần | Demo | Production | Lý do thay đổi |
|-----------|------|------------|----------------|
| Compute | EC2 t2.micro (1 process) | EKS: 7 microservices | Scale từng service độc lập |
| Message queue | Bull (Redis in-process) | Amazon MQ RabbitMQ | Persistent, multi-consumer, durability |
| Database | 1 RDS, nhiều schemas | RDS riêng từng service | Isolate failures, scale DB độc lập |
| Search | PostgreSQL tsvector | OpenSearch / Elasticsearch | Full-text search hiệu năng cao |
| Cache | ElastiCache cache.t3.micro | ElastiCache Cluster mode | HA, multi-shard |
| RDS mode | Single-AZ | Multi-AZ | Zero downtime failover |
| CDN | 1 CloudFront distribution | Multiple distributions | Tách frontend CDN và media CDN |
| Security | Nginx rate limiting | WAF v2 + ALB | OWASP rules, DDoS protection |
| Deploy | Docker Compose trên EC2 | ArgoCD + Kubernetes | Rolling update, auto-scaling |
| CI/CD | GitHub Actions → EC2 SSH | GitHub Actions → ECR → EKS | Parallel builds, gitops |

---

## Lộ Trình Migration: Demo → Production

### Checklist từng bước

#### Bước 1: Tách NestJS modules thành microservices
- Từng NestJS module (`AuthModule`, `ProductModule`, ...) đã có interface rõ ràng
- Tạo `apps/auth-service/`, `apps/product-service/`, ... từ các module hiện có
- Thêm TCP / gRPC transport thay vì in-process call
- **Trigger**: EC2 CPU > 70% liên tục, hoặc cần deploy riêng từng service

#### Bước 2: Thay Bull bằng RabbitMQ / Amazon MQ
- Thay `BullModule.forFeature(...)` bằng `ClientsModule` với `Transport.RMQ`
- Các event interface (`OrderCreatedEvent`, `PaymentCompletedEvent`) giữ nguyên
- **Trigger**: Cần message persistence, retry với dead-letter queue, hoặc multi-consumer

#### Bước 3: Tách PostgreSQL thành per-service databases
- Từng service chỉ access schema của mình → tách thành DB instance riêng
- Chạy migration cho DB mới, cập nhật `DATABASE_URL`
- **Trigger**: Bất kỳ service nào hits 100k rows và query time > 50ms, hoặc cần scale DB riêng

#### Bước 4: Thêm Elasticsearch / OpenSearch cho search
- Xóa `tsvector` search trong product-service
- Thêm OpenSearch indexer consumer lắng nghe `product.created/updated` events
- **Trigger**: Search latency > 200ms, cần fuzzy search / relevance ranking

#### Bước 5: Chuyển từ Docker Compose sang Kubernetes manifests
- Tạo `k8s/apps/` với Deployment, Service, HPA cho từng microservice
- Setup EKS cluster (xem `04-phase-4-scale.md`)
- **Trigger**: Cần auto-scaling, hoặc 100+ concurrent users peak

#### Bước 6: Enable RDS Multi-AZ
- Thay đổi Terraform: `multi_az = true`
- Apply: RDS sẽ tạo standby instance ở AZ khác (~$25 → $50/tháng mỗi DB)
- **Trigger**: Cần SLA > 99.9%, không chấp nhận downtime khi AZ fails

#### Bước 7: Enable ElastiCache Cluster mode
- Thêm `num_node_groups = 3`, `replicas_per_node_group = 1` trong Terraform
- Cập nhật Redis client để dùng cluster URLs
- **Trigger**: Redis memory > 80%, hoặc cần sharding cho throughput

---

## Bảng Quyết Định: Khi Nào Nâng Cấp

| Metric | Ngưỡng | Action |
|--------|--------|--------|
| EC2 CPU (avg 5 phút) | > 70% liên tục | Tách microservices hoặc nâng instance type |
| RDS connections | > 80 | Thêm PgBouncer connection pooler |
| RDS CPU | > 60% avg | Nâng instance type (micro → small → medium) |
| Redis memory | > 80% | Nâng node type hoặc bật Cluster mode |
| Search latency (P95) | > 200ms | Chuyển sang OpenSearch |
| Concurrent users (peak) | > 100 | Nghiên cứu chuyển sang EKS |
| Daily active orders | > 500/ngày | Enable RDS Multi-AZ |
| Users | > 1,000 registered | Xem xét tách DB per service |
| Revenue at risk | > $1,000/giờ nếu down | Enable Multi-AZ + Read replicas |

---

## Cấu Trúc Code: Tại Sao Demo Và Production Dùng Cùng Codebase

NestJS module system cho phép chạy cùng code theo 2 cách:

**Demo (monolith):**
```typescript
// apps/monolith/src/app.module.ts
@Module({
  imports: [
    AuthModule,
    ProductModule,
    OrderModule,
    InventoryModule,
    CartModule,
    NotificationModule,
    BullModule.forRoot({ redis: { host: process.env.REDIS_HOST } }),
  ],
})
export class AppModule {}
```

**Production (microservice):**
```typescript
// apps/auth-service/src/main.ts
const app = await NestFactory.createMicroservice(AuthModule, {
  transport: Transport.TCP,
  options: { host: '0.0.0.0', port: 3001 },
});
```

Các module (`AuthModule`, `ProductModule`, ...) không thay đổi code nội bộ. Chỉ thay đổi cách khởi động và wiring.

---

## Tóm Tắt

```
Demo Stage → Đang chạy
  EC2 + RDS + ElastiCache + S3 + Vercel
  ~$1–16/tháng
  Đủ cho demo + 1,000 users đầu tiên

Production Stage → Khi cần
  EKS + RDS Multi-AZ + ElastiCache Cluster + OpenSearch + Amazon MQ
  ~$1,500–2,500/tháng
  Xử lý flash sale 10,000 concurrent users

Migration: từng bước, trigger-based, không cần rewrite code
```

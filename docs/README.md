# toidibangiay — Tài Liệu Dự Án

E-commerce bán giày trực tuyến, xây dựng trên kiến trúc microservices với NestJS backend và Next.js frontend. Thiết kế để scale từ 0 đến hàng triệu đơn hàng.

## Cấu trúc tài liệu

| File | Nội dung |
|------|----------|
| [00-project-overview.md](./00-project-overview.md) | Tổng quan dự án, kiến trúc, tech stack |
| [01-phase-1-foundation.md](./01-phase-1-foundation.md) | Phase 1: Nền tảng — Auth, Product, Cart (Tuần 1–4) |
| [02-phase-2-commerce.md](./02-phase-2-commerce.md) | Phase 2: Thương mại — Orders, Payment, Inventory (Tuần 5–8) |
| [03-phase-3-experience.md](./03-phase-3-experience.md) | Phase 3: Trải nghiệm — Search, PWA, Admin (Tuần 9–12) |
| [04-phase-4-scale.md](./04-phase-4-scale.md) | Phase 4: Scale — Kubernetes, CI/CD, AWS (Tuần 13–16) |
| [05-aws-infrastructure.md](./05-aws-infrastructure.md) | Hạ tầng AWS — VPC, EKS, RDS, ElastiCache |
| [06-api-contracts.md](./06-api-contracts.md) | API contracts giữa frontend và backend |
| [07-database-schema.md](./07-database-schema.md) | Schema các service, quan hệ dữ liệu |

## Quick Start

```bash
# 1. Khởi động infrastructure
cd backend && docker-compose up -d

# 2. Chạy backend services
cd backend && pnpm dev

# 3. Chạy frontend
cd shopify-store && pnpm dev
```

## Liên hệ
- Email: contact.me.nguyenvudev@gmail.com

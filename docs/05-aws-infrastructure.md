# 05 — Hạ Tầng AWS

Tài liệu này chia làm 2 phần: **Demo (hiện tại)** và **Production (khi scale)**. Xem thêm `00-demo-vs-production.md` để hiểu lộ trình nâng cấp.

---

# PHẦN A: Demo Infrastructure (Hiện Tại)

## Tổng Quan Demo

```
Region: us-east-2 (Singapore)

[Vercel — Next.js]  (Free)
        │
        │ HTTPS API calls
        ▼
[Route 53]  →  [EC2 t2.micro / t3.small]
                        │
               [Nginx — port 80/443]
                        │
               [NestJS Monolith — port 3000]
               [Bull queues via Redis]
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
  [RDS db.t3.micro]    [ElastiCache cache.t3.micro]
  [PostgreSQL 15]      [Redis 7]
  [schemas: auth,      [cart, sessions, cache]
   products, orders,
   inventory, cart,
   notifications]
              │
              ▼
  [S3 toidibangiay-media-demo]
              │
  [CloudFront distribution]
```

---

## EC2 Setup

**Thông số:**
- Instance type: `t2.micro` (free tier 750hr/tháng năm đầu) hoặc `t3.small` (~$15/tháng nếu hết free tier)
- AMI: Amazon Linux 2023
- Storage: 20GB gp3 (free tier: 30GB)
- Region: `us-east-2`

**Security Group (sg-demo-ec2):**

| Inbound | Port | Source |
|---------|------|--------|
| SSH | 22 | Your IP only |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| App (debug) | 3000 | Your IP only |

**User data script (tự động cài Docker khi launch):**

```bash
#!/bin/bash
# User data cho Amazon Linux 2023
yum update -y
yum install -y docker git

# Start Docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Clone repo và start app
cd /home/ec2-user
git clone https://github.com/your-org/toidibangiay.git
cd toidibangiay/backend
cp .env.production.example .env.production
# Điền giá trị thực vào .env.production trước khi chạy
# docker compose -f docker-compose.prod.yml up -d
```

---

## Docker Compose trên EC2

File `backend/docker-compose.prod.yml` — **chỉ chạy app và nginx, không chạy PostgreSQL / Redis (dùng RDS và ElastiCache)**:

```yaml
version: "3.9"

services:
  nestjs-app:
    build:
      context: .
      dockerfile: Dockerfile.monolith
    container_name: toidibangiay-app
    restart: unless-stopped
    env_file: .env.production
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: toidibangiay-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - nestjs-app

volumes:
  nginx_logs:
```

**Nginx config (`nginx/nginx.conf`):**

```nginx
events { worker_connections 1024; }

http {
  upstream app {
    server nestjs-app:3000;
  }

  # Redirect HTTP → HTTPS
  server {
    listen 80;
    server_name api.toidibangiay.vn;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name api.toidibangiay.vn;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Rate limiting (thay WAF cho demo)
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    location /api/auth/ {
      limit_req zone=auth burst=10 nodelay;
      proxy_pass http://app;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
      limit_req zone=api burst=50 nodelay;
      proxy_pass http://app;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 60s;
    }
  }
}
```

---

## RDS PostgreSQL (Free Tier)

**Cấu hình:**
- Engine: PostgreSQL 15
- Instance class: `db.t3.micro` (free tier: 750hr/tháng, 1 năm)
- Storage: 20GB gp2 (free tier: 20GB)
- Single-AZ (không Multi-AZ cho demo — tiết kiệm 2x cost)
- Publicly accessible: **NO** — chỉ EC2 security group mới truy cập được

**Tạo via AWS Console:**

1. RDS → Create database
2. Standard Create, PostgreSQL 15
3. Free tier template
4. DB instance identifier: `toidibangiay-demo`
5. Master username: `postgres`
6. Master password: (tạo random, lưu vào Secrets Manager)
7. Instance class: `db.t3.micro`
8. Storage: 20 GB gp2, disable autoscaling (để tránh charge)
9. VPC: default VPC (hoặc VPC riêng)
10. Security group: tạo `sg-rds-demo` chỉ allow port 5432 từ `sg-demo-ec2`
11. Publicly accessible: No
12. Initial database name: `toidibangiay`

**Tạo schemas sau khi RDS online:**

```sql
-- Kết nối vào RDS từ EC2
psql -h <rds-endpoint> -U postgres -d toidibangiay

-- Tạo schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS products;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS cart;
CREATE SCHEMA IF NOT EXISTS notifications;
```

**Parameter group quan trọng (demo scale):**

```
max_connections = 100        (t3.micro giới hạn, đủ cho demo)
shared_buffers = 128MB
work_mem = 2MB
log_min_duration_statement = 1000   (log query > 1s)
```

---

## ElastiCache Redis (Free Tier)

**Cấu hình:**
- Engine: Redis 7
- Node type: `cache.t3.micro` (free tier: 750hr/tháng, 1 năm)
- Number of replicas: 0 (single node, không replica cho demo)
- Multi-AZ: Disabled
- Cluster mode: Disabled

**Tạo via AWS Console:**

1. ElastiCache → Create cache
2. Redis OSS
3. Design your own, Serverless: **No** (chọn Standard create)
4. Node type: `cache.t3.micro`
5. Number of replicas: 0
6. Subnet group: tạo mới hoặc dùng default (private subnet)
7. Security group: `sg-redis-demo` — allow port 6379 từ `sg-demo-ec2` only
8. Encryption at rest: enabled (free)
9. Auth token: tạo strong password, lưu vào Secrets Manager

---

## S3 + CloudFront

**S3 Bucket:**
- Tên: `toidibangiay-media-demo`
- Region: `us-east-2`
- Block all public access: **Yes**
- Versioning: Disabled (tiết kiệm storage cho demo)

**Free tier S3:**
- 5GB storage
- 20,000 GET requests
- 2,000 PUT requests

**Bucket policy (cho CloudFront OAC):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::toidibangiay-media-demo/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
        }
      }
    }
  ]
}
```

**CloudFront Distribution:**
- Origin: S3 bucket `toidibangiay-media-demo`
- Origin Access: Origin Access Control (OAC)
- Cache behavior: CachingOptimized policy
- Alternate domain: `cdn.toidibangiay.vn`
- SSL: ACM certificate (free)
- Price class: PriceClass_200 (US, EU, Asia — tối ưu cho VN traffic)

**Free tier CloudFront:**
- 1TB data transfer out
- 10,000,000 HTTP/HTTPS requests

---

## Vercel (Next.js Frontend)

- Plan: **Hobby (Free)**
- Framework: Next.js
- Build command: `next build`
- Output: `.next`

**Environment variables trên Vercel:**

```
NEXT_PUBLIC_API_URL=https://api.toidibangiay.vn
NEXT_PUBLIC_CDN_URL=https://cdn.toidibangiay.vn
NEXT_PUBLIC_SITE_URL=https://toidibangiay.vn
```

**Custom domain:**
- Thêm `toidibangiay.vn` trên Vercel
- Route 53: tạo CNAME record `toidibangiay.vn → cname.vercel-dns.com`

---

## Environment Variables cho Demo

File `backend/.env.production` trên EC2:

```bash
# App
NODE_ENV=production
PORT=3000

# Database (RDS endpoint)
DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>.us-east-2.rds.amazonaws.com:5432/toidibangiay

# Per-schema DATABASE_URL (NestJS monolith với Prisma multi-schema)
AUTH_DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/toidibangiay?schema=auth
PRODUCT_DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/toidibangiay?schema=products
ORDER_DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/toidibangiay?schema=orders
INVENTORY_DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/toidibangiay?schema=inventory
CART_DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/toidibangiay?schema=cart
NOTIFICATION_DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/toidibangiay?schema=notifications

# Redis (ElastiCache endpoint)
REDIS_HOST=<elasticache-endpoint>.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<auth-token>
REDIS_TLS=true

# JWT
JWT_SECRET=<256-bit-random-string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# AWS
AWS_REGION=us-east-2
AWS_S3_BUCKET=toidibangiay-media-demo
CDN_URL=https://cdn.toidibangiay.vn

# SES (email — free 62k/tháng từ EC2)
AWS_SES_FROM_EMAIL=noreply@toidibangiay.vn
AWS_SES_REGION=us-east-2

# Payment (VNPay / MoMo sandbox cho demo)
VNPAY_TMN_CODE=<sandbox-code>
VNPAY_HASH_SECRET=<sandbox-secret>
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
MOMO_PARTNER_CODE=<sandbox-code>
MOMO_ACCESS_KEY=<sandbox-key>
MOMO_SECRET_KEY=<sandbox-secret>
MOMO_ENDPOINT=https://test-payment.momo.vn

# Sentry (optional cho demo)
SENTRY_DSN=<sentry-dsn>

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_ATTEMPTS=5
```

---

## Deploy Workflow (Demo)

```bash
# SSH vào EC2
ssh -i ~/.ssh/toidibangiay-demo.pem ec2-user@<ec2-public-ip>

# Pull code mới
cd /home/ec2-user/toidibangiay
git pull origin main

# Build image mới
docker compose -f backend/docker-compose.prod.yml build nestjs-app

# Run database migrations
docker compose -f backend/docker-compose.prod.yml run --rm nestjs-app \
  npx prisma migrate deploy

# Restart app (zero downtime với --no-deps)
docker compose -f backend/docker-compose.prod.yml up -d --no-deps nestjs-app

# Verify
docker compose -f backend/docker-compose.prod.yml ps
curl -s http://localhost:3000/health | jq .
```

---

## Bảng Chi Phí Demo

| Dịch vụ | Free Tier | Sau Free Tier (tháng 13+) |
|---------|-----------|--------------------------|
| EC2 t2.micro | FREE (750hr/tháng, 1 năm) | ~$8.50/tháng |
| EC2 t3.small (khuyến nghị) | — | ~$15/tháng |
| RDS db.t3.micro | FREE (750hr/tháng, 1 năm) | ~$25/tháng |
| ElastiCache cache.t3.micro | FREE (750hr/tháng, 1 năm) | ~$12/tháng |
| S3 (< 5GB) | FREE | ~$2/tháng |
| CloudFront (< 1TB) | FREE | ~$3/tháng |
| Route 53 (hosted zone) | — | ~$1/tháng |
| SES (từ EC2, < 62k email) | FREE | ~$0.10/1k email |
| Vercel | FREE | FREE |
| ACM Certificate | FREE | FREE |
| **Tổng** | **~$1/tháng** | **~$43–58/tháng** |

**AWS $200 credit runway:**
- Tháng 1–12: ~$12 tổng → còn ~$188 credit
- Tháng 13+: ~$50/tháng → $188 credit kéo dài thêm ~3.7 tháng
- Tổng: **~15–16 tháng** với $200 credit

---

# PHẦN B: Production Infrastructure (Khi Scale)

> Chi tiết đầy đủ trong `04-phase-4-scale.md`. Phần này là tóm tắt để so sánh.

## Tổng Quan Production

**Compute:** EKS Cluster với 7 microservices, HPA auto-scaling 2–20 pods mỗi service.

**Database:** Mỗi service có RDS PostgreSQL riêng (db.t3.medium), Multi-AZ enabled. Total 6 RDS instances.

**Cache:** ElastiCache Redis cluster mode — 3 shards, mỗi shard có 1 replica (6 nodes total).

**Search:** Amazon OpenSearch Service, 2 nodes (zone-aware), tsvector được thay bằng full-text search engine.

**Messaging:** Amazon MQ RabbitMQ, CLUSTER_MULTI_AZ deployment, thay Bull queues.

**CDN/Security:** WAF v2 với OWASP Managed Rules, ALB với SSL termination, 2 CloudFront distributions.

**Observability:** Prometheus + Grafana, AWS X-Ray distributed tracing, Sentry, CloudWatch Logs.

**Chi phí production:** $1,500–2,500/tháng tùy traffic. Xem bảng chi tiết trong `00-demo-vs-production.md`.

## Khi Nào Migrate?

Migrate từng phần khi đạt trigger metrics. Không cần migrate toàn bộ cùng lúc. Xem bảng quyết định trong `00-demo-vs-production.md`.

---

## Cấu Trúc VPC (Production)

```
VPC: 10.0.0.0/16

Public Subnets:
  10.0.1.0/24 (AZ-a)  — ALB, NAT Gateway
  10.0.2.0/24 (AZ-b)  — ALB (multi-AZ)

Private Subnets:
  10.0.10.0/24 (AZ-a) — EKS nodes, RDS, Redis
  10.0.11.0/24 (AZ-b) — EKS nodes, RDS, Redis
  10.0.12.0/24 (AZ-c) — EKS nodes (3rd AZ)
```

Xem `04-phase-4-scale.md` cho Kubernetes manifests, HPA config, CI/CD pipeline, observability setup, và load testing.

---

# PHẦN C: EKS Production (Hiện Tại — Đã Deploy)

> Account: `061083040425`, Region: `us-east-2`, Cluster: `toidibangiay`

## Mô Hình AWS Services

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AWS Cloud (us-east-2)                             │
│                                                                           │
│  ┌──────────────────┐   ┌───────────────────────────────────────────┐   │
│  │       ECR        │   │        EKS Cluster: toidibangiay           │   │
│  │  (10 repos)      │   │                                             │   │
│  │                  │   │  ┌─────────────────────────────────────┐  │   │
│  │  gateway         │   │  │  Node Group: toidibangiay-nodes      │  │   │
│  │  auth-service    │──▶│  │  2x t3.medium (us-east-2a/2b)        │  │   │
│  │  user-service    │   │  └─────────────────────────────────────┘  │   │
│  │  product-service │   │                                             │   │
│  │  cart-service    │   │  ┌───────────────────────────────────────┐ │   │
│  │  order-service   │   │  │   Namespace: toidibangiay-prod         │ │   │
│  │  inventory-svc   │   │  │                                         │ │   │
│  │  payment-svc     │   │  │  gateway           :4000  (API GW)     │ │   │
│  │  notification    │   │  │  auth-service      :3001               │ │   │
│  │  search-service  │   │  │  user-service      :3002               │ │   │
│  └──────────────────┘   │  │  product-service   :3003               │ │   │
│                          │  │  cart-service      :3004               │ │   │
│  ┌──────────────────┐   │  │  order-service     :3005               │ │   │
│  │       IAM        │   │  │  inventory-service :3006               │ │   │
│  │  (IRSA roles)    │   │  │  payment-service   :3007               │ │   │
│  │                  │   │  │  notification-svc  :3008               │ │   │
│  │  EKSNodeRole     │   │  │  search-service    :3009               │ │   │
│  │  ALBCtrlRole     │   │  │                                         │ │   │
│  │  EBSCSIRole      │   │  │  PostgreSQL  (bitnami/postgresql)      │ │   │
│  └──────────────────┘   │  │  Redis       (bitnami/redis)           │ │   │
│                          │  └───────────────────────────────────────┘ │   │
│  ┌──────────────────┐   │                                             │   │
│  │   EBS (gp2)      │──▶│  ┌──────────────┐  ┌──────────────────┐   │   │
│  │  StorageClass    │   │  │  kube-system  │  │    argocd        │   │   │
│  │  (default)       │   │  │              │  │                  │   │   │
│  └──────────────────┘   │  │  aws-node    │  │  App:            │   │   │
│                          │  │  kube-proxy  │  │  toidibangiay   │   │   │
│  ┌──────────────────┐   │  │  coredns     │  │  Auto-sync ✓     │   │   │
│  │   ALB (AWS)      │◀──│  │  aws-lb-ctrl │  └──────────────────┘   │   │
│  └──────────────────┘   │  │  ebs-csi     │                         │   │
│                          │  └──────────────┘                         │   │
│                          └───────────────────────────────────────────┘   │
│  VPC: vpc-05312a3039b858a9a                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline

```
Developer
    │
    │  git push → main
    ▼
┌──────────────────────────────────────────────────┐
│           GitHub: toidibangiay                    │
│   .github/workflows/deploy.yml                   │
│   Trigger: push to main                          │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│   Job 1: Build  (10 parallel matrix jobs)         │
│   environment: AWS  ← GitHub Environment          │
│                                                    │
│   Per service:                                     │
│   1. docker buildx build (multi-stage Dockerfile) │
│      Stage 1: npm install + prisma generate + tsc │
│      Stage 2: production image (node:20-alpine)   │
│   2. Push to ECR:                                  │
│      061083040425.dkr.ecr.us-east-2.amazonaws.com │
│      Tags: {git-sha}  +  latest                  │
└────────────────┬─────────────────────────────────┘
                 │  needs: build
                 ▼
┌──────────────────────────────────────────────────┐
│   Job 2: Update GitOps                            │
│   environment: AWS  ← GitHub Environment          │
│                                                    │
│   1. Checkout toidibangiay-gitops (GITOPS_TOKEN)  │
│   2. Update k8s/apps/{svc}/kustomization.yaml     │
│      → newTag: {git-sha}                         │
│   3. git commit + push                           │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│   GitHub: toidibangiay-gitops                     │
│                                                    │
│   k8s/                                            │
│   ├── kustomization.yaml                          │
│   ├── namespace.yaml                              │
│   ├── apps/{service}/kustomization.yaml ◄ updated │
│   └── ingress/ingress.yaml                       │
└────────────────┬─────────────────────────────────┘
                 │  ArgoCD polls mỗi 3 phút
                 ▼
┌──────────────────────────────────────────────────┐
│   ArgoCD  (namespace: argocd)                     │
│                                                    │
│   App: toidibangiay                               │
│   Source: toidibangiay-gitops  (path: k8s)        │
│   Sync: Automatic + Self Heal + Prune             │
│   → kubectl apply -k k8s/                        │
│   → Rolling update deployments                   │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│   EKS: toidibangiay-prod                          │
│   RollingUpdate: maxUnavailable=0, maxSurge=1     │
│   Image pull từ ECR (tag: {git-sha})              │
└──────────────────────────────────────────────────┘
```

---

## EKS Add-ons

| Addon | Mục đích |
|-------|----------|
| `vpc-cni` | Assign VPC IP cho mỗi pod |
| `kube-proxy` | Service routing |
| `coredns` | DNS resolution (service discovery) |
| `aws-ebs-csi-driver` | Provisioning EBS volumes cho PVC |

## Helm Releases

| Release | Namespace | Chart | Mục đích |
|---------|-----------|-------|----------|
| `aws-load-balancer-controller` | kube-system | eks/aws-load-balancer-controller | Tạo ALB từ Ingress |
| `external-secrets` | kube-system | external-secrets/external-secrets | Sync secrets từ AWS |
| `postgres` | toidibangiay-prod | bitnami/postgresql | In-cluster PostgreSQL |
| `redis` | toidibangiay-prod | bitnami/redis | In-cluster Redis |

## IAM Roles (IRSA)

| Role | Service Account | Policy |
|------|----------------|--------|
| `AmazonEKSNodeRole` | EC2 nodes | EKS Worker + ECR ReadOnly + CNI |
| `AmazonEKSLoadBalancerControllerRole` | aws-load-balancer-controller | ALB/NLB management |
| `AmazonEKS_EBS_CSI_DriverRole` | ebs-csi-controller-sa | Tạo/xóa EBS volumes |

## GitHub Secrets (Environment: AWS)

| Secret | Mục đích |
|--------|----------|
| `AWS_ACCESS_KEY_ID` | IAM credentials |
| `AWS_SECRET_ACCESS_KEY` | IAM credentials |
| `AWS_ACCOUNT_ID` | `061083040425` |
| `GITOPS_TOKEN` | GitHub PAT (repo scope) để push gitops repo |

---

## Lệnh Vận Hành

```bash
# Kết nối cluster
aws eks update-kubeconfig --name toidibangiay --region us-east-2

# Kiểm tra
kubectl get nodes
kubectl get pods -n toidibangiay-prod
kubectl get pods -n argocd

# Logs
kubectl logs -n toidibangiay-prod deployment/gateway --tail=50

# ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# → https://localhost:8080

# Force sync
kubectl annotate application toidibangiay -n argocd \
  argocd.argoproj.io/refresh=hard --overwrite

# Kích hoạt EBS CSI với IRSA (chạy 1 lần sau khi role sẵn sàng)
aws eks update-addon \
  --cluster-name toidibangiay \
  --addon-name aws-ebs-csi-driver \
  --service-account-role-arn arn:aws:iam::061083040425:role/AmazonEKS_EBS_CSI_DriverRole \
  --region us-east-2
```

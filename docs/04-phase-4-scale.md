# 04 — Phase 4: Scale (Tuần 13–16)

---

## Demo → Production Migration Path

> Đây là lộ trình khi bạn sẵn sàng rời Demo stage và scale lên production infrastructure. Không cần làm tất cả cùng lúc — mỗi bước có trigger metric rõ ràng.

### Trigger Metrics: Khi Nào Bắt Đầu

| Metric | Ngưỡng | Hành động |
|--------|--------|-----------|
| EC2 CPU (avg 5 phút) | > 70% liên tục | Tách microservices hoặc nâng EC2 |
| RDS connections | > 80 | Thêm PgBouncer, sau đó nâng instance |
| RDS CPU | > 60% avg | Nâng instance type |
| Redis memory | > 80% | Nâng node type → Cluster mode |
| Search latency (P95) | > 200ms | Chuyển sang OpenSearch |
| Concurrent users (peak) | > 100 sustained | Xem xét EKS |
| Daily orders | > 500/ngày | Enable RDS Multi-AZ |
| Registered users | > 1,000 | Đánh giá tách DB per service |

### Milestone Thực Tế

**100 customers đầu tiên** (~1–3 tháng đầu):
- Vẫn dùng demo stack hoàn toàn
- Monitor metrics weekly
- Tập trung vào product-market fit, không phải infra

**1,000 customers, 100 daily orders** (~6–12 tháng):
- Nâng EC2 lên t3.small hoặc t3.medium
- Enable RDS Multi-AZ (không chấp nhận downtime nữa)
- Bắt đầu tách auth-service ra trước (service ổn định nhất, ít thay đổi)

**5,000 customers, 500+ daily orders** (~12–18 tháng):
- Chuyển sang EKS với 3–5 services được tách
- Thêm PgBouncer
- Chuyển Bull → Amazon MQ

**10,000+ customers** (~18–24 tháng):
- Full production stack
- OpenSearch cho search
- ElastiCache cluster mode
- Toàn bộ 7 microservices trên EKS

### Thứ Tự Tách Services (Khuyến Nghị)

Tách theo độ ổn định và tần suất deploy:

1. **auth-service** — Ổn định nhất, ít thay đổi, dễ tách trước
2. **notification-service** — Async, không blocking critical path
3. **inventory-service** — Logic riêng biệt, quan trọng cho oversell prevention
4. **product-service** — Tách khi cần scale read-heavy traffic
5. **cart-service** — Sau khi Redis đã production-ready
6. **order-service** — Tách cùng payment-service (coupled)
7. **payment-service** — Cuối cùng, cần test kỹ nhất

---

## Mục tiêu

Kết thúc Phase 4:
- Ứng dụng chạy trên Kubernetes (EKS), auto-scale theo load
- CI/CD pipeline fully automated (push to main → production trong 10 phút)
- Observability đầy đủ: metrics, tracing, logging, alerting
- Đã load test và tối ưu để xử lý flash sale 10,000 concurrent users

---

## Setup Guide: Triển Khai Từ Đầu

> Hướng dẫn này đi từng bước để đưa project lên AWS EKS lần đầu. Thực hiện theo thứ tự — mỗi bước phụ thuộc vào bước trước.

### Yêu Cầu

```bash
# Cài đặt các công cụ cần thiết
aws --version          # >= 2.x
kubectl version        # >= 1.28
eksctl version         # >= 0.180
helm version           # >= 3.x
```

Tài khoản AWS cần có quyền: `AmazonEC2FullAccess`, `AmazonEKSFullAccess`, `AmazonECRFullAccess`, `IAMFullAccess`, `SecretsManagerFullAccess`.

---

### Bước 1: Tạo ECR Repositories

Chạy script sau một lần để tạo 10 repositories:

```bash
REGION=us-east-2
SERVICES=(gateway auth-service user-service product-service cart-service \
          order-service inventory-service payment-service notification-service search-service)

for svc in "${SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name "$svc" \
    --region "$REGION" \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null && echo "Created: $svc" || echo "Already exists: $svc"
done

# Lấy ACCOUNT_ID để dùng ở các bước sau
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
echo "ECR prefix: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
```

Sau đó cập nhật `ACCOUNT_ID` trong tất cả `k8s/apps/*/kustomization.yaml`:

```bash
find k8s/apps -name "kustomization.yaml" | xargs \
  sed -i "s|ACCOUNT_ID|$ACCOUNT_ID|g"
```

---

### Bước 2: Tạo EKS Cluster

```bash
# Tạo cluster (~15 phút)
eksctl create cluster \
  --name toidibangiay \
  --region us-east-2 \
  --nodegroup-name standard \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 6 \
  --managed

# Verify
kubectl get nodes
```

Cấu hình kubeconfig:

```bash
aws eks update-kubeconfig \
  --name toidibangiay \
  --region us-east-2
```

---

### Bước 3: Apply Namespaces và Ingress Controller

```bash
# Tạo namespaces
kubectl apply -f k8s/namespace.yaml

# Cài AWS Load Balancer Controller (cần cho ALB Ingress)
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=toidibangiay \
  --set serviceAccount.create=true \
  --set region=us-east-2
```

Lấy Certificate ARN từ ACM rồi cập nhật `k8s/ingress/ingress.yaml`:

```bash
# Lấy ARN của certificate đã tạo cho domain
aws acm list-certificates --region us-east-2

# Sửa file ingress
sed -i "s|\$CERTIFICATE_ARN|arn:aws:acm:...|g" k8s/ingress/ingress.yaml
kubectl apply -f k8s/ingress/ingress.yaml
```

---

### Bước 4: Cài External Secrets Operator

External Secrets đồng bộ secrets từ AWS Secrets Manager vào K8s:

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  -n kube-system \
  --set installCRDs=true
```

Tạo IAM policy cho External Secrets đọc Secrets Manager:

```bash
aws iam create-policy \
  --policy-name ExternalSecretsPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
      "Resource": "arn:aws:secretsmanager:us-east-2:*:secret:/toidibangiay/*"
    }]
  }'
```

Tạo ClusterSecretStore:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-2
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets
            namespace: kube-system
EOF
```

Tạo secrets trên AWS Secrets Manager (ví dụ auth-service):

```bash
aws secretsmanager create-secret \
  --name /toidibangiay/prod/auth-service \
  --region us-east-2 \
  --secret-string '{
    "DATABASE_URL": "postgresql://user:pass@rds-host:5432/ecommerce",
    "REDIS_URL": "redis://elasticache-host:6379",
    "JWT_ACCESS_SECRET": "your-secret-min-32-chars",
    "SMTP_USER": "your@gmail.com",
    "SMTP_PASS": "your-app-password"
  }'

# Lặp tương tự cho: user-service, product-service, cart-service,
# order-service, inventory-service, payment-service, notification-service,
# search-service, gateway
```

---

### Bước 5: Cài ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Đợi ArgoCD khởi động
kubectl wait --for=condition=available deployment/argocd-server \
  -n argocd --timeout=120s

# Port-forward để truy cập UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Lấy mật khẩu admin
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo
```

Truy cập `https://localhost:8080`, đăng nhập `admin` / password vừa lấy.

---

### Bước 6: Tạo GitOps Repository

ArgoCD theo dõi một repo riêng chứa K8s manifests. Tạo repo `toidibangiay-gitops` trên GitHub rồi copy thư mục `k8s/` vào:

```bash
# Trong repo toidibangiay-gitops (repo mới)
cp -r k8s/ .
git add . && git commit -m "init: k8s manifests"
git push
```

Đăng ký repo với ArgoCD:

```bash
argocd repo add https://github.com/YOUR_ORG/toidibangiay-gitops \
  --username YOUR_GITHUB_USER \
  --password YOUR_GITHUB_PAT
```

Tạo ArgoCD Application:

```bash
argocd app create toidibangiay \
  --repo https://github.com/YOUR_ORG/toidibangiay-gitops \
  --path k8s/apps \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace toidibangiay-prod \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

---

### Bước 7: GitHub Secrets

Trong GitHub repo → **Settings → Secrets → Actions**, thêm:

| Secret | Cách lấy |
|--------|---------|
| `AWS_ACCOUNT_ID` | `aws sts get-caller-identity --query Account --output text` |
| `AWS_ACCESS_KEY_ID` | IAM user → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | IAM user → Security credentials |
| `GITOPS_TOKEN` | GitHub → Settings → Developer settings → PAT (repo scope) |

---

### Bước 8: First Deploy

Push một commit vào `main` để trigger pipeline:

```bash
git add .
git commit -m "ci: trigger first deploy"
git push origin main
```

Theo dõi pipeline trên GitHub Actions. Sau khi xong, ArgoCD tự sync. Kiểm tra:

```bash
# Xem tất cả pods
kubectl get pods -n toidibangiay-prod

# Xem logs một service
kubectl logs -n toidibangiay-prod deployment/gateway -f

# Xem ArgoCD sync status
argocd app get toidibangiay
```

---

## Tuần 13: Kubernetes Setup trên EKS

### Kubernetes Resource Overview

```
Namespaces:
  toidibangiay-prod       ← Production workloads
  toidibangiay-staging    ← Staging environment
  monitoring              ← Prometheus, Grafana
  ingress-nginx           ← Ingress controller

Deployments per service:
  gateway, auth-service, product-service, inventory-service,
  cart-service, order-service, payment-service, notification-service
```

### Deployment Manifest (Auth Service ví dụ)

```yaml
# k8s/apps/auth-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: toidibangiay-prod
  labels:
    app: auth-service
    version: "1.0.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0    # Zero downtime deployment
      maxSurge: 1
  template:
    metadata:
      labels:
        app: auth-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: auth-service-sa
      containers:
        - name: auth-service
          image: 123456789.dkr.ecr.us-east-2.amazonaws.com/auth-service:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: auth-service-secrets
                  key: DATABASE_URL
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: auth-service-secrets
                  key: JWT_SECRET
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 5
      terminationGracePeriodSeconds: 30
```

### HPA (Horizontal Pod Autoscaler)

```yaml
# k8s/apps/auth-service/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: toidibangiay-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 60
```

### HPA Config Summary

| Service | Min Replicas | Max Replicas | CPU Target |
|---------|-------------|--------------|------------|
| gateway | 2 | 20 | 70% |
| auth-service | 2 | 10 | 70% |
| product-service | 2 | 15 | 70% |
| cart-service | 2 | 15 | 70% |
| order-service | 2 | 10 | 70% |
| inventory-service | 2 | 10 | 70% |
| payment-service | 2 | 8 | 70% |
| notification-service | 1 | 5 | 80% |

### Ingress với AWS ALB

```yaml
# k8s/ingress/main-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: toidibangiay-ingress
  namespace: toidibangiay-prod
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-2:xxx:certificate/xxx
    alb.ingress.kubernetes.io/ssl-redirect: "443"
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/wafv2-acl-arn: arn:aws:wafv2:us-east-2:xxx:regional/webacl/xxx
spec:
  rules:
    - host: api.toidibangiay.vn
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: gateway
                port:
                  number: 3000
```

### ConfigMap và Secrets

```yaml
# k8s/apps/auth-service/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: auth-service-config
  namespace: toidibangiay-prod
data:
  NODE_ENV: production
  JWT_ACCESS_EXPIRES: 15m
  JWT_REFRESH_EXPIRES: 30d
  RATE_LIMIT_WINDOW_MS: "900000"
  RATE_LIMIT_MAX_ATTEMPTS: "5"

# Secrets được lấy từ AWS Secrets Manager qua ExternalSecrets operator
# k8s/apps/auth-service/external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: auth-service-secrets
  namespace: toidibangiay-prod
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: auth-service-secrets
    creationPolicy: Owner
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: /toidibangiay/prod/auth-service
        property: DATABASE_URL
    - secretKey: JWT_SECRET
      remoteRef:
        key: /toidibangiay/prod/auth-service
        property: JWT_SECRET
```

---

## Tuần 14: CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-2
  ECR_REGISTRY: 123456789.dkr.ecr.us-east-2.amazonaws.com

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service:
          - gateway
          - auth-service
          - product-service
          - inventory-service
          - cart-service
          - order-service
          - payment-service
          - notification-service
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push
        env:
          IMAGE_TAG: ${{ github.sha }}
          SERVICE: ${{ matrix.service }}
        run: |
          IMAGE_URI=$ECR_REGISTRY/$SERVICE:$IMAGE_TAG
          docker build \
            --build-arg SERVICE=$SERVICE \
            --cache-from $ECR_REGISTRY/$SERVICE:latest \
            -t $IMAGE_URI \
            -t $ECR_REGISTRY/$SERVICE:latest \
            -f backend/Dockerfile \
            --build-arg APP=$SERVICE \
            backend/
          docker push $IMAGE_URI
          docker push $ECR_REGISTRY/$SERVICE:latest

  deploy:
    name: Deploy via ArgoCD
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITOPS_TOKEN }}
          repository: your-org/toidibangiay-gitops

      - name: Update image tags
        env:
          IMAGE_TAG: ${{ github.sha }}
        run: |
          # Update kustomization.yaml với image tag mới
          for service in gateway auth-service product-service inventory-service cart-service order-service payment-service notification-service; do
            sed -i "s|$ECR_REGISTRY/$service:.*|$ECR_REGISTRY/$service:$IMAGE_TAG|g" \
              k8s/apps/$service/kustomization.yaml
          done

      - name: Commit and push
        run: |
          git config user.email "ci@toidibangiay.vn"
          git config user.name "GitHub Actions"
          git add .
          git commit -m "ci: update images to ${{ github.sha }}"
          git push
          # ArgoCD sẽ tự phát hiện thay đổi và sync
```

### Dockerfile (Multi-stage Build)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS base
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/*/package.json ./apps/
COPY libs/*/package.json ./libs/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG APP
RUN pnpm --filter $APP build
RUN pnpm deploy --filter $APP --prod /app/dist/$APP

FROM node:20-alpine AS runner
WORKDIR /app
ARG APP
ENV NODE_ENV=production
COPY --from=builder /app/dist/$APP .
COPY --from=builder /app/apps/$APP/prisma ./prisma
RUN npm run prisma:generate 2>/dev/null || true
EXPOSE 300X
CMD ["node", "main.js"]
```

---

## Tuần 15: Observability

### Prometheus Metrics (NestJS)

```typescript
// Tích hợp Prometheus vào mỗi service
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
});

const activeOrders = new Gauge({
  name: 'active_orders_total',
  help: 'Total number of active (non-terminal) orders',
});

const paymentSuccessRate = new Counter({
  name: 'payment_success_total',
  help: 'Total successful payments',
  labelNames: ['method'],  // vnpay, momo, cod
});
```

### Grafana Dashboard

Dashboard chính bao gồm các panels:

```
Row: API Gateway
  - Request rate (req/s) per endpoint
  - Error rate (4xx, 5xx) over time
  - P50, P95, P99 response time
  - Active connections

Row: Business Metrics
  - Orders per minute
  - Revenue per hour (VND)
  - Cart abandonment rate
  - Payment success rate by method

Row: Infrastructure
  - CPU usage per service
  - Memory usage per service
  - Pod count per service (actual vs desired)
  - RabbitMQ queue depth

Row: Database
  - PostgreSQL queries per second
  - PostgreSQL connection pool usage
  - Redis hit/miss rate
  - Elasticsearch search latency
```

### Alerting Rules (Prometheus Alertmanager)

```yaml
# monitoring/alerts.yaml
groups:
  - name: toidibangiay.critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High 5xx error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"

      - alert: PaymentWebhookFailing
        expr: rate(payment_webhook_failures_total[5m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Payment webhooks are failing"

  - name: toidibangiay.warning
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning

      - alert: LowInventory
        expr: inventory_available_units < 5
        labels:
          severity: warning
        annotations:
          summary: "Low stock for variant {{ $labels.variant_id }}"

      - alert: RabbitMQQueueDepth
        expr: rabbitmq_queue_messages > 1000
        for: 10m
        labels:
          severity: warning

# Alertmanager → Slack channel #alerts-prod
```

### Distributed Tracing (AWS X-Ray)

```typescript
// Tích hợp X-Ray vào NestJS
import AWSXRay from 'aws-xray-sdk-core';

// Middleware để bắt đầu trace cho mỗi request
app.use(AWSXRay.express.openSegment('toidibangiay-gateway'));

// Trace database calls
const capturedPrisma = AWSXRay.captureAWSv3Client(prismaClient);

// Custom subsegments cho business logic
const segment = AWSXRay.getSegment();
const subsegment = segment.addNewSubsegment('checkout.validateCart');
try {
  await validateCart(cartId);
  subsegment.close();
} catch (err) {
  subsegment.addError(err);
  subsegment.close();
  throw err;
}

app.use(AWSXRay.express.closeSegment());
```

### Sentry Error Tracking

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.GIT_SHA,
  tracesSampleRate: 0.1,  // 10% của requests
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: prismaClient }),
  ],
  beforeSend(event) {
    // Xóa sensitive data trước khi gửi
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.creditCard;
    }
    return event;
  },
});
```

---

## Tuần 16: Load Testing + Tuning

### k6 Test Scripts

#### Scenario 1: Normal Traffic (100 concurrent users)

```javascript
// k6/scenarios/normal-traffic.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '10m', target: 100 },  // Steady state
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% dưới 500ms
    http_req_failed: ['rate<0.01'],     // Dưới 1% lỗi
  },
};

export default function () {
  // 50% browse products
  if (Math.random() < 0.5) {
    const res = http.get('https://api.toidibangiay.vn/api/products?page=1&limit=20');
    check(res, { 'products loaded': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 1);
    return;
  }

  // 30% view product detail
  if (Math.random() < 0.6) {
    const res = http.get('https://api.toidibangiay.vn/api/products/nike-air-max-270');
    check(res, { 'product detail loaded': (r) => r.status === 200 });
    sleep(Math.random() * 5 + 2);
    return;
  }

  // 20% search
  const terms = ['giày chạy bộ', 'Nike', 'size 42', 'giày da', 'sneakers'];
  const q = terms[Math.floor(Math.random() * terms.length)];
  const res = http.get(`https://api.toidibangiay.vn/api/products?q=${encodeURIComponent(q)}`);
  check(res, { 'search results': (r) => r.status === 200 });
  sleep(2);
}
```

#### Scenario 2: Peak Traffic (1000 concurrent users)

```javascript
// k6/scenarios/peak-traffic.js
export const options = {
  stages: [
    { duration: '5m', target: 1000 },
    { duration: '20m', target: 1000 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};
```

#### Scenario 3: Flash Sale (10,000 concurrent users, single product)

```javascript
// k6/scenarios/flash-sale.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const cartAddTime = new Trend('cart_add_duration');
const cartAddErrors = new Counter('cart_add_errors');

export const options = {
  scenarios: {
    flash_sale: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10000 },  // Spike lên 10k trong 30 giây
        { duration: '5m', target: 10000 },   // Giữ 5 phút (thời gian flash sale)
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    'cart_add_duration': ['p(99)<3000'],
    'cart_add_errors': ['count<100'],      // Tối đa 100 lỗi trong toàn bộ test
  },
};

export default function () {
  // Tất cả user cố gắng thêm flash sale product vào giỏ
  const start = Date.now();
  const res = http.post(
    'https://api.toidibangiay.vn/api/cart/items',
    JSON.stringify({ variantId: 'flash-sale-variant-id', quantity: 1 }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    },
  );

  cartAddTime.add(Date.now() - start);

  if (res.status !== 200 && res.status !== 400) {
    // 400 là "hết hàng" — expected behavior
    cartAddErrors.add(1);
  }

  check(res, {
    'cart add success or out of stock': (r) => [200, 400].includes(r.status),
  });

  sleep(0.5);
}
```

### Performance Tuning

#### Database Indexes

```sql
-- product-service: Index cho tất cả filter patterns
CREATE INDEX CONCURRENTLY idx_products_active_created
  ON products (is_active, created_at DESC)
  WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_product_variants_product
  ON product_variants (product_id, is_active);

CREATE INDEX CONCURRENTLY idx_product_variants_price
  ON product_variants (price)
  WHERE is_active = true;

-- order-service: Index cho order queries
CREATE INDEX CONCURRENTLY idx_orders_user_created
  ON orders (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_orders_status_created
  ON orders (status, created_at DESC);

-- inventory-service: Index cho real-time queries
CREATE INDEX CONCURRENTLY idx_inventory_variant
  ON inventory_items (variant_id);

-- Partial index cho low stock alerts
CREATE INDEX CONCURRENTLY idx_inventory_low_stock
  ON inventory_items ((quantity - reserved))
  WHERE (quantity - reserved) < 10;
```

#### Redis Cache Tuning

```typescript
// Product detail cache: 5 phút
async getProduct(slug: string) {
  const cacheKey = `product:${slug}`;
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const product = await this.prisma.product.findUnique({ ... });
  await this.redis.set(cacheKey, JSON.stringify(product), 'EX', 300);
  return product;
}

// Category list cache: 1 giờ (ít thay đổi)
async getCategories() {
  const cacheKey = 'categories:all';
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const categories = await this.prisma.category.findMany({ ... });
  await this.redis.set(cacheKey, JSON.stringify(categories), 'EX', 3600);
  return categories;
}

// Inventory available stock: 10 giây (cần real-time nhưng giảm DB load)
async getAvailableStock(variantId: string): Promise<number> {
  const cacheKey = `stock:available:${variantId}`;
  const cached = await this.redis.get(cacheKey);
  if (cached) return parseInt(cached);

  const item = await this.prisma.inventoryItem.findUnique({ where: { variantId } });
  const available = item.quantity - item.reserved;
  await this.redis.set(cacheKey, String(available), 'EX', 10);
  return available;
}
```

#### Connection Pooling

```typescript
// PrismaClient với connection pool tuning
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20',
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

// PgBouncer cho production (giảm connection overhead)
// DATABASE_URL=postgresql://user:pass@pgbouncer-host:6432/db?pgbouncer=true
```

---

## Checklist Phase 4

### Kubernetes (EKS)
- [ ] Tất cả 8 services chạy trên EKS
- [ ] HPA hoạt động (test bằng cách tạo load, xem pod count tăng)
- [ ] Rolling deployment không có downtime
- [ ] Liveness + readiness probes hoạt động
- [ ] Secrets được lấy từ AWS Secrets Manager qua External Secrets
- [ ] Resource requests/limits set đúng cho tất cả services
- [ ] ALB Ingress hoạt động, HTTPS redirect
- [ ] WAF rules bảo vệ against common attacks

### CI/CD
- [ ] Push to main → tests chạy tự động
- [ ] Nếu tests fail → không deploy
- [ ] Build Docker images song song cho tất cả services
- [ ] Images push lên ECR với git SHA tag
- [ ] ArgoCD phát hiện thay đổi và auto-sync
- [ ] Deployment hoàn thành trong < 10 phút từ push
- [ ] Rollback trong < 2 phút (ArgoCD sync previous commit)

### Observability
- [ ] Prometheus scraping metrics từ tất cả services
- [ ] Grafana dashboards có đủ panels (business + infra)
- [ ] Alerting gửi vào Slack khi:
  - [ ] Service down
  - [ ] Error rate > 5%
  - [ ] Payment webhook failing
  - [ ] Low inventory
- [ ] AWS X-Ray traces có thể trace request qua tất cả services
- [ ] Sentry catches unhandled errors với stack trace
- [ ] Centralized logging (CloudWatch Logs / Loki)

### Load Testing
- [ ] Normal traffic (100 VUs): P95 < 500ms, error rate < 1%
- [ ] Peak traffic (1000 VUs): P95 < 2000ms, error rate < 5%
- [ ] Flash sale (10000 VUs): Inventory không oversell, P99 < 3000ms
- [ ] Database queries với EXPLAIN ANALYZE — không có Seq Scan trên large tables
- [ ] Redis cache hit rate > 80% cho product detail
- [ ] RabbitMQ queue depth ổn định (không tăng vô hạn)

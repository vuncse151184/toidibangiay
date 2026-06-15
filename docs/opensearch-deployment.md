# OpenSearch — Triển khai tìm kiếm sản phẩm (AWS)

## Tổng quan kiến trúc

```
product-service --(create/update/delete)--> RabbitMQ
                                                |
                                                v
                                       search-service (NestJS)
                                                |
                                    index / update / delete
                                                v
                               AWS OpenSearch Service (us-east-2)
                                                ^
                             Next.js /api/search
```

**Lý do dùng Managed Domain thay vì Serverless:**
- Serverless NextGen không hỗ trợ custom analysis settings (Vietnamese asciifolding)
- Managed domain hỗ trợ đầy đủ index template + custom analyzer
- `t3.small.search` ~28 USD/tháng — phù hợp dev/staging

---

## Phần 1 — Provision AWS OpenSearch Domain

### 1.1 Tạo domain qua AWS Console

1. Vào **AWS Console > Amazon OpenSearch Service > Create domain**
2. Điền thông tin:

| Trường | Dev | Production |
|--------|-----|------------|
| Domain name | toidibangiay-search | toidibangiay-search-prod |
| Engine | OpenSearch 2.17 | OpenSearch 2.17 |
| Instance type | t3.small.search | r6g.large.search |
| Nodes | 1 | 3 (Multi-AZ) |
| Storage | 20 GiB gp3 | 100 GiB gp3 |

3. **Network**: Dev dùng Public access + IP-based policy; Production dùng VPC access
4. **Fine-grained access control**: Enable, tạo master user `admin` với password mạnh
5. Click **Create** — đợi ~15 phút đến khi status **Active**

Sau khi active, copy Domain endpoint:
```
https://search-toidibangiay-search-xxxx.us-east-2.es.amazonaws.com
```

### 1.2 Tạo domain qua AWS CLI (thay thế)

```bash
aws opensearch create-domain \
  --domain-name toidibangiay-search \
  --engine-version OpenSearch_2.17 \
  --cluster-config InstanceType=t3.small.search,InstanceCount=1 \
  --ebs-options EBSEnabled=true,VolumeType=gp3,VolumeSize=20 \
  --advanced-security-options Enabled=true,InternalUserDatabaseEnabled=true \
  --encryption-at-rest-options Enabled=true \
  --node-to-node-encryption-options Enabled=true \
  --domain-endpoint-options EnforceHTTPS=true \
  --region us-east-2

# Kiểm tra trạng thái (đợi đến khi Processing=false)
aws opensearch describe-domain \
  --domain-name toidibangiay-search \
  --query 'DomainStatus.Processing' \
  --region us-east-2
```

### 1.3 Biến môi trường

```env
# backend/services/search-service/.env
OPENSEARCH_ENDPOINT=https://search-toidibangiay-xxxx.us-east-2.es.amazonaws.com
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=<master-password>
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672
PORT=3005

# product-service/.env — thêm vào
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672

# shopify-store/.env.local — thêm vào
SEARCH_SERVICE_URL=http://localhost:3005
```

---

## Phần 2 — Tạo Index Mapping

Chạy **một lần** sau khi domain active. Dùng curl hoặc OpenSearch Dashboards (port 443/_dashboards).

```bash
ENDPOINT="https://search-toidibangiay-xxxx.us-east-2.es.amazonaws.com"
AUTH="admin:<password>"

curl -X PUT "$ENDPOINT/products" \
  -u "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "analysis": {
        "analyzer": {
          "vietnamese_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase", "asciifolding", "vn_stop"]
          },
          "autocomplete_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase", "asciifolding", "edge_ngram_filter"]
          },
          "autocomplete_search": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase", "asciifolding"]
          }
        },
        "filter": {
          "vn_stop": {
            "type": "stop",
            "stopwords": ["va","cua","la","co","trong","cho","voi","tu","duoc","nay","do","cac","mot","nhung"]
          },
          "edge_ngram_filter": { "type": "edge_ngram", "min_gram": 2, "max_gram": 20 }
        }
      }
    },
    "mappings": {
      "properties": {
        "id":           { "type": "keyword" },
        "name": {
          "type": "text",
          "analyzer": "vietnamese_analyzer",
          "fields": {
            "autocomplete": { "type": "text", "analyzer": "autocomplete_analyzer", "search_analyzer": "autocomplete_search" },
            "keyword":      { "type": "keyword" }
          }
        },
        "description":  { "type": "text", "analyzer": "vietnamese_analyzer" },
        "brand":        { "type": "keyword" },
        "categoryId":   { "type": "keyword" },
        "categoryName": { "type": "keyword" },
        "tags":         { "type": "keyword" },
        "slug":         { "type": "keyword" },
        "isActive":     { "type": "boolean" },
        "minPrice":     { "type": "integer" },
        "maxPrice":     { "type": "integer" },
        "sizes":        { "type": "keyword" },
        "colors":       { "type": "keyword" },
        "imageUrl":     { "type": "keyword", "index": false },
        "totalSold":    { "type": "integer" },
        "createdAt":    { "type": "date" },
        "updatedAt":    { "type": "date" }
      }
    }
  }'

# Xác nhận mapping đã tạo đúng
curl -u "$AUTH" "$ENDPOINT/products/_mapping" | python -m json.tool
```

---

## Phần 3 — Search Service (NestJS mới)

### 3.1 Khởi tạo project

```bash
mkdir -p backend/services/search-service/src/{modules/search/dto,scripts}
cd backend/services/search-service

npm init -y
npm install @nestjs/common @nestjs/core @nestjs/platform-express \
  @opensearch-project/opensearch \
  @golevelup/nestjs-rabbitmq amqplib \
  class-transformer class-validator dotenv reflect-metadata rxjs
npm install -D typescript ts-node-dev @types/node
```

`package.json` scripts:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/main.ts",
    "build": "tsc -p tsconfig.json",
    "reindex": "ts-node src/scripts/reindex.ts"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "ES2021",
    "outDir": "./dist",
    "skipLibCheck": true,
    "strictNullChecks": false
  }
}
```

---

### 3.2 src/modules/search/opensearch.client.ts

```typescript
import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchClient {
  readonly client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.OPENSEARCH_ENDPOINT!,
      ...(process.env.OPENSEARCH_USERNAME
        ? { auth: { username: process.env.OPENSEARCH_USERNAME, password: process.env.OPENSEARCH_PASSWORD! } }
        : {}),
      ssl: { rejectUnauthorized: false },
    });
  }
}
```

---

### 3.3 src/modules/search/dto/search-products.dto.ts

```typescript
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductsDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxPrice?: number;
  @IsOptional() @IsString() sizes?: string;    // dấu phẩy ngăn cách: "39,40,41"
  @IsOptional() @IsString() colors?: string;   // dấu phẩy ngăn cách: "Black,White"
  @IsOptional() @IsIn(['popular','newest','price_asc','price_desc','relevance']) sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}
```

---

### 3.4 src/modules/search/search.service.ts

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OpenSearchClient } from './opensearch.client';
import { SearchProductsDto } from './dto/search-products.dto';

const INDEX = 'products';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  constructor(private readonly os: OpenSearchClient) {}

  async search(params: SearchProductsDto) {
    const { q, category, brand, minPrice, maxPrice, sort = 'popular', page = 1, limit = 20 } = params;
    const sizes  = params.sizes?.split(',').filter(Boolean) ?? [];
    const colors = params.colors?.split(',').filter(Boolean) ?? [];

    const must: any[] = [{ term: { isActive: true } }];
    const filter: any[] = [];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['name^4', 'name.autocomplete^2', 'brand^2', 'description', 'tags'],
          type: 'best_fields',
          fuzziness: 'AUTO',
          prefix_length: 1,
        },
      });
    }

    if (category) filter.push({ term: { categoryId: category } });
    if (brand)    filter.push({ term: { brand } });
    if (sizes.length)  filter.push({ terms: { sizes } });
    if (colors.length) filter.push({ terms: { colors } });
    if (minPrice !== undefined || maxPrice !== undefined)
      filter.push({ range: { minPrice: { gte: minPrice, lte: maxPrice } } });

    const sortMap: Record<string, any[]> = {
      popular:    [{ totalSold: 'desc' }, { createdAt: 'desc' }],
      newest:     [{ createdAt: 'desc' }],
      price_asc:  [{ minPrice: 'asc' }],
      price_desc: [{ maxPrice: 'desc' }],
      relevance:  ['_score', { totalSold: 'desc' }],
    };

    const { body } = await this.os.client.search({
      index: INDEX,
      body: {
        query: { bool: { must, filter } },
        sort: sortMap[sort] ?? sortMap.popular,
        from: (page - 1) * limit,
        size: limit,
        aggs: {
          brands:     { terms: { field: 'brand', size: 30 } },
          sizes:      { terms: { field: 'sizes', size: 20 } },
          colors:     { terms: { field: 'colors', size: 20 } },
          categories: { terms: { field: 'categoryName', size: 20 } },
          priceStats: { stats: { field: 'minPrice' } },
        },
      },
    });

    return {
      products:   body.hits.hits.map((h: any) => ({ id: h._id, ...h._source })),
      total:      body.hits.total.value,
      page, limit,
      totalPages: Math.ceil(body.hits.total.value / limit),
      facets: {
        brands:     body.aggregations.brands.buckets,
        sizes:      body.aggregations.sizes.buckets,
        colors:     body.aggregations.colors.buckets,
        categories: body.aggregations.categories.buckets,
        priceStats: body.aggregations.priceStats,
      },
    };
  }

  async suggest(q: string): Promise<string[]> {
    if (!q || q.length < 2) return [];
    const { body } = await this.os.client.search({
      index: INDEX,
      body: {
        query: {
          bool: {
            must: [
              { term: { isActive: true } },
              { multi_match: { query: q, fields: ['name.autocomplete', 'brand'], type: 'phrase_prefix' } },
            ],
          },
        },
        _source: ['name'],
        size: 8,
      },
    });
    const seen = new Set<string>();
    return body.hits.hits
      .map((h: any) => h._source.name as string)
      .filter((n: string) => !seen.has(n) && seen.add(n));
  }

  async indexProduct(product: any) {
    await this.os.client.index({ index: INDEX, id: product.id, body: this.toDoc(product), refresh: 'wait_for' });
    this.logger.log(`Đã index ${product.id}`);
  }

  async deleteProduct(id: string) {
    await this.os.client.delete({ index: INDEX, id, refresh: 'wait_for' });
    this.logger.log(`Đã xóa ${id}`);
  }

  async bulkIndex(products: any[]) {
    const body = products.flatMap((p) => [{ index: { _index: INDEX, _id: p.id } }, this.toDoc(p)]);
    const { body: result } = await this.os.client.bulk({ body, refresh: 'wait_for' });
    if (result.errors) this.logger.error('Có lỗi trong quá trình bulk index');
  }

  private toDoc(p: any) {
    const prices = p.variants?.map((v: any) => v.price) ?? [];
    return {
      id: p.id, name: p.name, description: p.description ?? '',
      brand: p.brand ?? '', categoryId: p.categoryId ?? '',
      categoryName: p.category?.name ?? '', tags: p.tags ?? [],
      slug: p.slug, isActive: p.isActive ?? true,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      sizes:  [...new Set(p.variants?.map((v: any) => v.size).filter(Boolean) ?? [])],
      colors: [...new Set(p.variants?.map((v: any) => v.color).filter(Boolean) ?? [])],
      imageUrl: p.images?.[0]?.url ?? '', totalSold: p.totalSold ?? 0,
      createdAt: p.createdAt, updatedAt: p.updatedAt,
    };
  }
}
```

---

### 3.5 src/modules/search/search.consumer.ts

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { SearchService } from './search.service';

@Injectable()
export class SearchConsumer {
  private readonly logger = new Logger(SearchConsumer.name);
  constructor(private readonly searchService: SearchService) {}

  @RabbitSubscribe({ exchange: 'products', routingKey: 'product.created', queue: 'search.product.created' })
  async onCreated(p: any) { await this.searchService.indexProduct(p); }

  @RabbitSubscribe({ exchange: 'products', routingKey: 'product.updated', queue: 'search.product.updated' })
  async onUpdated(p: any) { await this.searchService.indexProduct(p); }

  @RabbitSubscribe({ exchange: 'products', routingKey: 'product.deleted', queue: 'search.product.deleted' })
  async onDeleted({ id }: { id: string }) { await this.searchService.deleteProduct(id); }
}
```

---

### 3.6 src/modules/search/search.controller.ts

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchProductsDto } from './dto/search-products.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() dto: SearchProductsDto) { return this.searchService.search(dto); }

  @Get('suggest')
  suggest(@Query('q') q: string) { return this.searchService.suggest(q ?? ''); }
}
```

---

### 3.7 search.module.ts + app.module.ts + main.ts

```typescript
// search.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { OpenSearchClient } from './opensearch.client';
import { SearchService } from './search.service';
import { SearchConsumer } from './search.consumer';
import { SearchController } from './search.controller';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: process.env.RABBITMQ_URL!,
      exchanges: [{ name: 'products', type: 'topic' }],
    }),
  ],
  providers: [OpenSearchClient, SearchService, SearchConsumer],
  controllers: [SearchController],
})
export class SearchModule {}

// app.module.ts
import { Module } from '@nestjs/common';
import { SearchModule } from './modules/search/search.module';
@Module({ imports: [SearchModule] })
export class AppModule {}

// main.ts
import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ?? 3005);
  console.log(`Search service đang chạy trên cổng ${process.env.PORT ?? 3005}`);
}
bootstrap();
```

---

## Phần 4 — Publish Events từ product-service

Khi product được tạo/sửa/xóa, `product-service` cần publish event để `search-service` đồng bộ dữ liệu.

```typescript
// products.service.ts — thêm vào
constructor(
  private readonly prisma: PrismaService,
  private readonly amqpConnection: AmqpConnection,
) {}

private async publishEvent(routingKey: string, payload: any) {
  await this.amqpConnection.publish('products', routingKey, payload);
}

// Sau create $transaction:
await this.publishEvent('product.created', { ...product, variants, images, category });

// Sau update $transaction:
await this.publishEvent('product.updated', { ...product, variants, images, category });

// Trước delete return:
await this.publishEvent('product.deleted', { id });
```

Thêm vào `products.module.ts`:
```typescript
RabbitMQModule.forRoot(RabbitMQModule, {
  uri: process.env.RABBITMQ_URL!,
  exchanges: [{ name: 'products', type: 'topic' }],
})
```

---

## Phần 5 — Script Bulk Reindex

Dùng khi lần đầu thiết lập hoặc cần rebuild lại toàn bộ index:

```typescript
// src/scripts/reindex.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { OpenSearchClient } from '../modules/search/opensearch.client';
import { SearchService } from '../modules/search/search.service';

async function main() {
  const prisma = new PrismaClient();
  const service = new SearchService(new OpenSearchClient());

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true, images: true, category: true },
  });
  console.log(`Đang reindex ${products.length} sản phẩm...`);

  const CHUNK = 500;
  for (let i = 0; i < products.length; i += CHUNK) {
    await service.bulkIndex(products.slice(i, i + CHUNK));
    console.log(`  ${Math.min(i + CHUNK, products.length)} / ${products.length}`);
  }
  await prisma.$disconnect();
  console.log('Hoàn tất!');
}
main().catch(console.error);
```

Chạy: `npm run reindex`

---

## Phần 6 — Next.js API Route (proxy)

```typescript
// shopify-store/src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
const SEARCH_URL = process.env.SEARCH_SERVICE_URL ?? 'http://localhost:3005';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const res = await fetch(`${SEARCH_URL}/search?${params}`, { next: { revalidate: 30 } });
  return NextResponse.json(await res.json());
}

// shopify-store/src/app/api/search/suggest/route.ts
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const res = await fetch(`${SEARCH_URL}/search/suggest?q=${encodeURIComponent(q)}`);
  return NextResponse.json(await res.json());
}
```

---

## Phần 7 — Frontend Search Hook

```typescript
// shopify-store/src/hooks/useSearch.ts
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

export interface SearchParams {
  q?: string; category?: string; brand?: string;
  minPrice?: number; maxPrice?: number;
  sizes?: string; colors?: string; sort?: string; page?: number;
}

export function useSearch(initial: SearchParams = {}) {
  const [params, setParams] = useState<SearchParams>(initial);
  const [debouncedQ] = useDebounce(params.q, 300);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const active = { ...params, q: debouncedQ };
    const qs = new URLSearchParams(
      Object.entries(active)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    if (!qs) return;
    setLoading(true);
    fetch(`/api/search?${qs}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [JSON.stringify({ ...params, q: params.q })]);

  return { data, loading, params, setParams };
}

// Hook gợi ý tìm kiếm (autocomplete)
export function useSuggest(q: string) {
  const [debouncedQ] = useDebounce(q, 200);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) { setSuggestions([]); return; }
    fetch(`/api/search/suggest?q=${encodeURIComponent(debouncedQ)}`)
      .then((r) => r.json())
      .then(setSuggestions);
  }, [debouncedQ]);

  return suggestions;
}
```

---

## Phần 8 — Docker Compose (dev local, không cần AWS)

```yaml
# Thêm vào docker-compose.yml phần services:
  opensearch:
    image: opensearchproject/opensearch:2.17.0
    environment:
      - discovery.type=single-node
      - DISABLE_SECURITY_PLUGIN=true      # chỉ dùng cho môi trường dev
      - OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - opensearch_data:/usr/share/opensearch/data

  opensearch-dashboards:
    image: opensearchproject/opensearch-dashboards:2.17.0
    environment:
      - OPENSEARCH_HOSTS=http://opensearch:9200
      - DISABLE_SECURITY_DASHBOARDS_PLUGIN=true
    ports:
      - "5601:5601"    # giao diện web tại http://localhost:5601
    depends_on: [opensearch]

  search-service:
    build: ./backend/services/search-service
    environment:
      - OPENSEARCH_ENDPOINT=http://opensearch:9200
      - RABBITMQ_URL=amqp://user:pass@rabbitmq:5672
      - PORT=3005
    ports:
      - "3005:3005"
    depends_on: [opensearch, rabbitmq]

# Thêm vào phần volumes:
#   opensearch_data:
```

---

## Phần 9 — Checklist triển khai

```
### Thiết lập AWS
[ ] Tạo OpenSearch domain (Console hoặc CLI)
[ ] Copy endpoint vào file .env của search-service
[ ] Tạo index mapping: curl -X PUT /products
[ ] Kiểm tra: curl -u admin:<pass> <endpoint>/_cluster/health → trả về "green"

### search-service
[ ] npm install + tạo các file src theo Phần 3
[ ] npm run dev → xuất hiện log "Search service đang chạy trên cổng 3005"
[ ] npm run reindex → bulk index toàn bộ sản phẩm từ DB

### product-service
[ ] npm install @golevelup/nestjs-rabbitmq amqplib
[ ] Thêm publishEvent vào các hàm create/update/delete
[ ] Kiểm tra: sửa 1 sản phẩm → xem log search-service "Đã index <id>"

### Next.js
[ ] Tạo /api/search route proxy
[ ] Tạo /api/search/suggest route
[ ] Dùng useSearch + useSuggest hook ở trang /products

### Kiểm thử E2E
[ ] Tìm "giày chạy bộ" → thấy sản phẩm chạy bộ (asciifolding loại bỏ dấu)
[ ] Tìm "Niike" → thấy Nike (fuzzy search)
[ ] Filter brand=Nike + size=42 → kết quả đúng
[ ] Autocomplete "Air" → gợi ý tên sản phẩm trong < 300ms
[ ] Tạo sản phẩm mới → xuất hiện trong kết quả tìm kiếm sau < 3 giây
[ ] Xóa sản phẩm → biến mất khỏi kết quả tìm kiếm
```

---

## Chi phí ước tính (AWS us-east-2)

| Cấu hình | Mô tả | Chi phí/tháng |
|----------|-------|---------------|
| Dev/Staging | t3.small.search × 1, 20 GiB gp3 | ~28 USD |
| Production nhỏ | r6g.large.search × 2 Multi-AZ, 100 GiB | ~280 USD |
| Production vừa | r6g.xlarge.search × 3 Multi-AZ, 200 GiB | ~580 USD |

**Mẹo tiết kiệm chi phí:**
- Dùng **UltraWarm** cho dữ liệu cũ hơn 30 ngày — chi phí lưu trữ giảm 10 lần so với EBS
- Dùng **Index State Management (ISM)** để tự động xóa log cũ
- Tắt domain dev khi không sử dụng qua AWS Console để tránh tốn phí
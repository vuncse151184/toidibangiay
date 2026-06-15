# 03 — Phase 3: Trải Nghiệm (Tuần 9–12)

## Mục tiêu

Kết thúc Phase 3:
- Tìm kiếm sản phẩm nhanh, hỗ trợ tiếng Việt có dấu
- Frontend mượt mà với skeleton loading, optimistic updates
- PWA — cài được trên điện thoại, hoạt động offline một phần
- Admin dashboard quản lý đầy đủ
- SEO tốt: sitemap, structured data, Open Graph

---

## Tuần 9: Elasticsearch Integration

### Tổng quan

Dùng AWS OpenSearch Service (Elasticsearch compatible) để tìm kiếm full-text tiếng Việt. Sản phẩm được index từ product-service qua RabbitMQ events.

### Elasticsearch Index Mapping

```json
PUT /products
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "vietnamese_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding",
            "vietnamese_stop"
          ]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding",
            "edge_ngram_filter"
          ]
        }
      },
      "filter": {
        "vietnamese_stop": {
          "type": "stop",
          "stopwords": ["và", "của", "là", "có", "trong", "cho", "với", "từ", "được", "này", "đó"]
        },
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 20
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id":            { "type": "keyword" },
      "name":          { "type": "text", "analyzer": "vietnamese_analyzer", "fields": { "autocomplete": { "type": "text", "analyzer": "autocomplete_analyzer" }, "keyword": { "type": "keyword" } } },
      "description":   { "type": "text", "analyzer": "vietnamese_analyzer" },
      "brand":         { "type": "keyword" },
      "categoryId":    { "type": "keyword" },
      "categoryName":  { "type": "keyword" },
      "tags":          { "type": "keyword" },
      "slug":          { "type": "keyword" },
      "isActive":      { "type": "boolean" },
      "minPrice":      { "type": "integer" },
      "maxPrice":      { "type": "integer" },
      "sizes":         { "type": "keyword" },
      "colors":        { "type": "keyword" },
      "imageUrl":      { "type": "keyword", "index": false },
      "totalSold":     { "type": "integer" },
      "createdAt":     { "type": "date" },
      "updatedAt":     { "type": "date" }
    }
  }
}
```

### Search Query DSL

```typescript
// Full-text search với filters + sort + pagination
async searchProducts(params: SearchProductsDto): Promise<SearchResult> {
  const {
    q, category, brand, minPrice, maxPrice, sizes, colors,
    sort = 'popular', page = 1, limit = 20,
  } = params;

  const must: any[] = [{ term: { isActive: true } }];
  const filter: any[] = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ['name^3', 'name.autocomplete^2', 'description', 'brand', 'tags'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }

  if (category) filter.push({ term: { categoryId: category } });
  if (brand) filter.push({ term: { brand } });
  if (sizes?.length) filter.push({ terms: { sizes } });
  if (colors?.length) filter.push({ terms: { colors } });
  if (minPrice || maxPrice) {
    filter.push({ range: { minPrice: { gte: minPrice, lte: maxPrice } } });
  }

  const sortConfig: Record<string, any> = {
    popular:    [{ totalSold: 'desc' }, { createdAt: 'desc' }],
    newest:     [{ createdAt: 'desc' }],
    price_asc:  [{ minPrice: 'asc' }],
    price_desc: [{ maxPrice: 'desc' }],
    relevance:  ['_score', { totalSold: 'desc' }],
  };

  const response = await this.elasticsearchService.search({
    index: 'products',
    body: {
      query: { bool: { must, filter } },
      sort: sortConfig[sort] || sortConfig.popular,
      from: (page - 1) * limit,
      size: limit,
      aggs: {
        brands:   { terms: { field: 'brand', size: 20 } },
        sizes:    { terms: { field: 'sizes', size: 20 } },
        colors:   { terms: { field: 'colors', size: 20 } },
        priceRange: { stats: { field: 'minPrice' } },
      },
    },
  });

  return {
    products: response.hits.hits.map(hit => hit._source),
    total: response.hits.total.value,
    aggregations: {
      brands: response.aggregations.brands.buckets,
      sizes:  response.aggregations.sizes.buckets,
      colors: response.aggregations.colors.buckets,
    },
    page,
    limit,
    totalPages: Math.ceil(response.hits.total.value / limit),
  };
}
```

### Autocomplete Endpoint

```typescript
// GET /api/search/suggest?q=nike+air
async suggest(q: string): Promise<string[]> {
  const response = await this.elasticsearchService.search({
    index: 'products',
    body: {
      suggest: {
        productSuggest: {
          prefix: q,
          completion: {
            field: 'name.autocomplete',
            size: 5,
            fuzzy: { fuzziness: 1 },
          },
        },
      },
      _source: false,
      size: 0,
    },
  });

  return response.suggest.productSuggest[0].options.map(
    (opt: any) => opt.text,
  );
}
```

### Sync Strategy: Product → Elasticsearch

```typescript
// product-service publish event khi có thay đổi
async updateProduct(id: string, dto: UpdateProductDto) {
  const product = await this.prisma.product.update({ ... });

  // Publish sync event
  await this.rabbitMQ.publish('product.updated', {
    id: product.id,
    name: product.name,
    brand: product.brand,
    // ... all indexable fields
  });

  return product;
}

// search-service lắng nghe và index
@EventPattern('product.updated')
async handleProductUpdated(event: ProductUpdatedEvent) {
  await this.elasticsearchService.index({
    index: 'products',
    id: event.id,
    document: this.mapToDocument(event),
  });
}

@EventPattern('product.deleted')
async handleProductDeleted(event: { id: string }) {
  await this.elasticsearchService.delete({ index: 'products', id: event.id });
}
```

---

## Tuần 10: Frontend Polish

### React Query Patterns

```typescript
// lib/api/products.ts — API client functions
export async function getProducts(params: GetProductsParams) {
  const searchParams = new URLSearchParams(params as any);
  const res = await fetch(`/api/products?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

// hooks/use-products.ts — TanStack Query hook
export function useProducts(params: GetProductsParams) {
  return useInfiniteQuery({
    queryKey: ['products', params],
    queryFn: ({ pageParam = 1 }) => getProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60_000,  // 1 phút
  });
}

// Optimistic cart update
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot current state
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update
      queryClient.setQueryData(['cart'], (old: Cart) => ({
        ...old,
        items: [...old.items, newItem],
        subtotal: old.subtotal + newItem.price * newItem.quantity,
      }));

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(['cart'], context?.previousCart);
      toast.error('Không thể thêm vào giỏ hàng');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
```

### Zustand Stores

```typescript
// lib/stores/cart-store.ts
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  // Derived
  itemCount: () => number;
  subtotal: () => number;
  // Actions
  openCart: () => void;
  closeCart: () => void;
  syncFromServer: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  syncFromServer: (items) => set({ items }),
}));

// lib/stores/auth-store.ts
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        const data = await authApi.login(email, password);
        set({ user: data.user, accessToken: data.accessToken, isLoading: false });
      },
      logout: async () => {
        await authApi.logout();
        set({ user: null, accessToken: null });
      },
      refreshToken: async () => {
        const data = await authApi.refresh();
        set({ accessToken: data.accessToken });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      // accessToken KHÔNG persist vào localStorage (security)
    },
  ),
);
```

### Skeleton Loading Components

```typescript
// components/shop/product-card-skeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-square" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

// components/shop/product-grid.tsx
export function ProductGrid({ params }: { params: GetProductsParams }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProducts(params);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const products = data?.pages.flatMap(page => page.products) ?? [];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={infiniteScrollRef} className="h-10" />
        // infiniteScrollRef = useIntersectionObserver → gọi fetchNextPage
      )}

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}
    </>
  );
}
```

### Framer Motion Transitions

```typescript
// app/(shop)/layout.tsx — Page transitions
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={usePathname()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// components/cart/add-to-cart-button.tsx — Micro-interaction
export function AddToCartButton({ variantId, price }: AddToCartButtonProps) {
  const { mutate, isPending } = useAddToCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    mutate({ variantId, quantity: 1, price }, {
      onSuccess: () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      },
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileTap={{ scale: 0.95 }}
      className="w-full btn-primary"
    >
      <AnimatePresence mode="wait">
        {added ? (
          <motion.span key="added" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            Đã thêm vào giỏ
          </motion.span>
        ) : (
          <motion.span key="add">
            {isPending ? <Spinner /> : 'Thêm vào giỏ'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

### PWA Configuration

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/cdn\.toidibangiay\.vn\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'product-images',
        expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/api\.toidibangiay\.vn\/api\/products.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'products-api',
        expiration: { maxAgeSeconds: 5 * 60 },
      },
    },
  ],
});

// public/manifest.json
{
  "name": "Tôi Đi Bán Giày",
  "short_name": "toidibangiay",
  "description": "Mua giày trực tuyến chính hãng",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Tuần 11: Admin Dashboard

### Trang quản lý sản phẩm

```
/admin/products
  - Bảng sản phẩm với cột: Ảnh, Tên, Danh mục, Giá, Stock, Trạng thái
  - Tìm kiếm theo tên/SKU
  - Filter theo danh mục, brand
  - Phân trang (server-side)
  - Nút: Thêm mới, Sửa, Xóa, Ẩn/Hiện

/admin/products/new
  - Form tạo sản phẩm: name, slug, description, brand, category
  - Upload ảnh (drag & drop, preview, reorder)
  - Thêm variants: mỗi variant có size, color, price, compareAtPrice, sku
  - Preview trước khi publish

/admin/products/:id/edit
  - Giống trang new nhưng pre-filled với data hiện tại
  - Nút "Preview" mở trang sản phẩm trên store
```

### Trang quản lý đơn hàng

```
/admin/orders
  - Bảng đơn hàng: Order Code, Khách hàng, Tổng tiền, Trạng thái, Ngày đặt
  - Filter theo trạng thái, ngày, thanh toán
  - Export CSV

/admin/orders/:id
  - Chi tiết đơn hàng
  - Order items với ảnh sản phẩm
  - Thông tin khách hàng + địa chỉ giao hàng
  - Payment info
  - Order event timeline
  - Actions: Xác nhận, Cập nhật tracking, Mark shipped, Mark delivered, Cancel

/admin/inventory
  - Bảng tồn kho theo variant
  - Cột: SKU, Sản phẩm, Size/Color, Tổng kho, Reserved, Available
  - Nút "Nhập hàng" (RESTOCK transaction)
  - Alert màu đỏ cho variants có available < 5
```

### Admin Route Guard

```typescript
// app/admin/layout.tsx
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login?callbackUrl=/admin');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

---

## Tuần 12: Analytics + SEO

### Product View Tracking

```typescript
// Frontend: Track product view
// app/(shop)/products/[slug]/page.tsx
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <ProductDetail product={product} />
    </>
  );
}

// components/analytics/product-view-tracker.tsx
'use client';
export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    // Fire and forget — không block UI
    fetch(`/api/analytics/product-view`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
      keepalive: true,  // Gửi ngay cả khi user navigate away
    });
  }, [productId]);

  return null;
}
```

### Next.js SEO Configuration

```typescript
// app/(shop)/products/[slug]/page.tsx — Metadata API
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);

  return {
    title: `${product.name} | toidibangiay`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: [{ url: product.images[0]?.url, width: 800, height: 800 }],
      type: 'website',
    },
    alternates: {
      canonical: `https://toidibangiay.vn/products/${product.slug}`,
    },
  };
}
```

### Structured Data (JSON-LD)

```typescript
// components/seo/product-structured-data.tsx
export function ProductStructuredData({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => img.url),
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: product.variants.map(variant => ({
      '@type': 'Offer',
      price: variant.price / 100,
      priceCurrency: 'VND',
      availability: variant.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      sku: variant.sku,
    })),
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Sitemap Generation

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://toidibangiay.vn';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Dynamic: products
  const products = await getAllProductSlugs();
  const productPages: MetadataRoute.Sitemap = products.map(({ slug, updatedAt }) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Dynamic: categories
  const categories = await getAllCategorySlugs();
  const categoryPages: MetadataRoute.Sitemap = categories.map(({ slug }) => ({
    url: `${baseUrl}/categories/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
```

---

## Checklist Phase 3

### Search (OpenSearch / Elasticsearch)
- [x] Index mapping tạo đúng — `INDEX_MAPPING` trong `search.service.ts`: keyword/text/float/integer/date đúng type; `brand` multi-field `.keyword` cho aggregation; `ensureIndex()` tự tạo nếu chưa có
- [x] Full-text search hoạt động — `multi_match` query trên `name^4`, `name.autocomplete^2`, `brand^2`, `description`, `tags`; frontend `ShopCatalogClient` fetch `/api/search` → search-service
- [x] Fuzzy search bắt được typo — `fuzziness: "AUTO"`, `prefix_length: 1` trong multi_match query
- [x] Filter theo category, brand, price range, size, color — `term/terms/range` filter đầy đủ trong `search.service.ts`
- [x] Aggregations trả về facets đúng — `brands` dùng `brand.keyword`, `sizes`/`colors`/`categories` dùng keyword field; bug `illegal_argument_exception` đã fix
- [x] Autocomplete (type-ahead) trong search bar — `SearchOverlay` gọi `/api/search/suggest?q=...` (debounce 150ms), hiển thị chips phía trên kết quả; click chip → điền query + trigger full search
- [x] Product events sync vào OpenSearch khi create/update/delete — `SearchConsumerModule` đã mount vào `app.module.ts`; `connectionInitOptions: { wait: false }` đảm bảo HTTP routes không bị block nếu RabbitMQ chưa sẵn sàng
- [ ] Search response < 100ms (95th percentile) — cần đo thực tế trên AWS OpenSearch

### Frontend Performance
- [x] Skeleton loading trên tất cả trang có data fetch — `TableSkeleton` trong admin/products, loading state trong hero, products pages
- [x] Infinite scroll hoạt động — `useInfiniteShowMore` hook dùng IntersectionObserver; `InfiniteProductGrid` dùng CSS `fade-in-up` thay framer-motion per-card (fix scroll lag)
- [x] Smooth scroll — `ReactLenis` từ `lenis/react` với `lerp: 0.08`; fix RAF leak của implementation cũ
- [x] Optimistic update cho add-to-cart — `cart.store.ts` `addItem()` nhận `optimistic` param, update Zustand ngay trước khi server trả về
- [x] Cart count update ngay khi thêm — `AddToCartButton` truyền `optimistic` data, store update đồng bộ
- [x] Images lazy loaded, WebP format — Next.js `<Image>` dùng xuyên suốt; `sizes` prop thêm cho hero shoe + thumbnails; `priority`/`loading="eager"` cho LCP card đầu tiên
- [x] INP search bar cải thiện — `startTransition` cho `setResults`; bỏ `height: "auto"` framer-motion (layout reflow per keystroke); CSS opacity transition
- [ ] Lighthouse Performance score > 85 trên mobile — cần đo thực tế
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms — cần đo thực tế

### PWA
- [x] Manifest.json đúng (icon, name, display: standalone) — `public/manifest.json` đầy đủ với shortcuts
- [x] Service worker registered — `ServiceWorkerRegister.tsx` đăng ký `/sw.js`
- [x] Product images cached (CacheFirst strategy) — `sw.js` cache Cloudinary + Nike static images
- [x] API responses cached ngắn hạn (NetworkFirst) — `sw.js` NetworkFirst cho `/api/products`, `/api/collections`
- [x] Install prompt hoạt động trên Android Chrome — `PwaInstallPrompt.tsx` lắng nghe `beforeinstallprompt`, bottom sheet với nút Cài đặt / Để sau

### Admin Dashboard
- [x] CRUD sản phẩm từ admin panel — list/search/hide/show + form tạo mới (`/admin/products/new`) + form chỉnh sửa (`/admin/products/[id]/edit`) + backend `PATCH /products/:id` + `GET /products/by-id/:id`
- [x] Upload ảnh — lazy upload + drag &amp; drop vào `ImageMultiUpload` (kéo thả với visual feedback, filter image-only files)
- [x] Quản lý order với cập nhật trạng thái — `/admin/orders` + `/admin/orders/[id]` với filter theo status
- [x] Xem và nhập tồn kho — `/admin/inventory` với RestockModal gọi `/inventory/restock`
- [x] Export orders CSV — `exportCSV()` trong `/admin/orders`, UTF-8 BOM, download file `orders-YYYY-MM-DD.csv`
- [x] Admin routes bảo vệ đúng — layout guard + `/admin/login` page riêng; redirect non-admin về `/admin/login`
- [x] **[BONUS]** Quản lý Hero Banner — `/admin/hero` CRUD đầy đủ typography, slides, CTA, isActive
- [x] **[BONUS]** Admin login page riêng — `/admin/login` tách khỏi consumer login, kiểm tra role sau đăng nhập
- [x] **[BONUS]** Clone variant — nút nhân bản trên mỗi variant row (cả `/admin/products/new` và `edit`)
- [x] **[BONUS]** PriceInput định dạng VND real-time, shadcn Select + Sonner toast với progress upload
- [x] **[BONUS]** AdminSidebar tách component riêng, sticky layout (`sticky top-0 h-screen`)
- [x] **[BONUS]** Nike product seed — 10 sản phẩm, ~120 variants, idempotent upsert (`seed:nike`)

### SEO
- [x] Mỗi trang sản phẩm có unique title + meta description — `generateMetadata()` trong `/products/[slug]/page.tsx`
- [x] Open Graph tags cho social sharing — có trong product page + home page
- [x] Structured data (Product schema) trên trang sản phẩm — `JsonLd` + `buildProductSchema()`
- [x] Sitemap.xml generate đúng tất cả products + categories — `sitemap.ts` fetch từ API
- [x] robots.txt đúng (block /admin, /api) — `robots.ts` disallow `/api/`, `/admin/`
- [x] Canonical URLs — `buildLocaleAlternates()` trong metadata
- [x] Next.js Image component cho tất cả product images

# 🛍️ Headless Shopify Storefront

A modern **headless e-commerce storefront** built with **Next.js, TypeScript, and Shopify Storefront API**.

This project provides a scalable, production-ready architecture for building fast and flexible Shopify storefronts.

---

# 🚀 Tech Stack

### Frontend

* **Next.js (App Router)**
* **TypeScript**
* **TailwindCSS**
* **shadcn/ui**
* **TanStack Query**
* **Zustand**

### Commerce Backend

* **Shopify Storefront API**
* **GraphQL**

### Optional Services

* Node.js API gateway
* Redis caching
* Search service (Meilisearch / Algolia)

---

# 🧱 Architecture

This project uses a **Headless Commerce architecture**.

```
Customer Browser
      │
      ▼
Next.js Storefront
      │
      │ GraphQL
      ▼
Shopify Storefront API
      │
      ▼
Shopify Platform
 ├ Products
 ├ Variants (SKU)
 ├ Inventory
 ├ Checkout
 ├ Orders
 └ Payments
```

Optional:

```
Next.js API / Node Service
 ├ Webhooks
 ├ Search
 ├ Analytics
 └ Caching
```

---

# 📁 Project Structure

```
root
│
├ apps
│   └ web                # Next.js storefront application
│
├ packages
│   ├ shopify            # Shopify client + GraphQL queries
│   ├ ui                 # Shared UI components
│   ├ types              # Shared TypeScript types
│   └ utils              # Shared utilities
│
├ services
│   └ webhooks           # Optional webhook service
│
├ public                 # Static assets
├ docker                 # Docker configs
├ .env.example           # Environment variables template
└ package.json
```

---

# 📦 Next.js Application Structure

```
apps/web/src
│
├ app
│   ├ layout.tsx
│   ├ page.tsx
│   ├ products
│   │   └ [handle]
│   │       └ page.tsx
│   ├ cart
│   │   └ page.tsx
│   └ checkout
│
├ components
│   ├ product
│   ├ cart
│   ├ layout
│   └ ui
│
├ hooks
│   ├ useProducts.ts
│   └ useCart.ts
│
├ store
│   └ cart.store.ts
│
├ services
│   ├ product.service.ts
│   └ cart.service.ts
│
├ lib
│   ├ shopify-client.ts
│   └ fetcher.ts
│
└ types
```

---

# 📦 Package Responsibilities

### `apps/web`

Main storefront application.

Responsibilities:

* UI rendering
* routing
* product pages
* cart experience
* checkout redirect

---

### `packages/shopify`

Shopify integration layer.

Responsibilities:

* Storefront API client
* GraphQL queries
* Shopify helpers

Example:

```
packages/shopify
│
├ client.ts
├ queries
│   ├ products.query.ts
│   ├ product.query.ts
│   └ cart.query.ts
```

---

### `packages/ui`

Reusable UI components.

Examples:

```
packages/ui
│
├ button.tsx
├ card.tsx
├ modal.tsx
└ product-card.tsx
```

---

### `packages/types`

Shared TypeScript types.

```
Product
ProductVariant
Cart
CartItem
Collection
```

---

### `packages/utils`

General helper utilities.

Examples:

```
formatPrice
slugify
debounce
currency formatter
```

---

# 🧠 Codebase Conventions

## 1️⃣ Folder-Based Feature Organization

Features are grouped by domain:

```
components/product
components/cart
components/layout
```

This improves maintainability.

---

## 2️⃣ Service Layer Pattern

External APIs should always go through **services**.

Example:

```
services/product.service.ts
```

Responsibilities:

* fetch Shopify data
* transform responses
* normalize types

Example:

```ts
export async function getProducts() {
  const { data } = await shopifyClient.request(PRODUCTS_QUERY)
  return data.products.edges.map((p: any) => p.node)
}
```

---

## 3️⃣ State Management

Global client state uses **Zustand**.

Example:

```
store/cart.store.ts
```

Responsibilities:

* cart state
* item updates
* cart persistence

---

## 4️⃣ Server Components First

Use **React Server Components whenever possible**.

Benefits:

* smaller bundles
* faster page load
* better SEO

Example:

```
app/products/[handle]/page.tsx
```

---

## 5️⃣ GraphQL Query Separation

GraphQL queries must live inside:

```
packages/shopify/queries
```

Example:

```
products.query.ts
cart.query.ts
```

---

# 🛒 Commerce Features

### Product Catalog

Supports:

* product list
* product detail
* variants
* SKU
* inventory status

---

### Shopping Cart

Cart features:

* add item
* remove item
* update quantity
* checkout redirect

Uses **Shopify Cart API**.

---

### Checkout

Checkout is handled directly by **Shopify**.

Flow:

```
User clicks Checkout
      │
      ▼
Redirect to Shopify Checkout
      │
      ▼
Payment + Order processing
```

---

# ⚡ Performance Strategy

The storefront is optimized for performance.

Techniques used:

* Server Components
* Incremental Static Regeneration
* CDN caching
* image optimization
* lazy loading

Example:

```ts
export const revalidate = 60
```

---

# 🔐 Environment Variables

Create `.env.local`.

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=
```

Example:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=my-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxx
```

---

# 🧪 Development

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Application runs at:

```
http://localhost:3000
```

---

# 🚀 Deployment

Recommended deployment:

Frontend:

```
Vercel
```

Optional backend:

```
Railway
Fly.io
AWS
```

Shopify provides:

* global CDN
* checkout infrastructure
* payment processing

---

# 📈 Future Improvements

Possible enhancements:

* product search (Meilisearch / Algolia)
* wishlist
* product reviews
* personalization
* recommendation engine
* analytics pipeline

---

# 📄 License

MIT License

---

# 🤝 Contributing

1. Create feature branch
2. Follow project conventions
3. Submit pull request

---

# 💡 Summary

This project provides a **scalable headless Shopify storefront** built with modern web technologies.

Key benefits:

* fast storefront performance
* scalable architecture
* clean codebase organization
* flexible commerce backend

---

import type { Metadata } from "next"
import type { Collection } from "@/types/collection"
import type { Product } from "@/types/product"

const fallbackSiteUrl = "https://something.store"

export const siteConfig = {
  name: "Toidibangiay",
  url: process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl,
  description:
    "Toidibangiay chuyên giày sneaker chính hãng, streetwear và các bộ sưu tập giới hạn dành cho khách hàng tại Việt Nam.",
  locale: "vi_VN",
  language: "vi-VN",
  country: "VN",
  city: "Ba Ria - Vung Tau",
  defaultImagePath: "/images/logo.png",
  email: "contactme.nguyenvudev@gmail.com",
  phoneDisplay: "+84 338 0104 26",
  phoneSchema: "+84338010426",
} as const

export const defaultKeywords = [
  "giày sneaker chính hãng",
  "sneaker Việt Nam",
  "streetwear Việt Nam",
  "mua giày online",
  "giày Nike chính hãng",
  "Jordan chính hãng",
  "Toidibangiay",
  "Tôi đi bán giày",
  "Toidibangiay"
]

export function buildAbsoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString()
}

export function buildLocaleAlternates(path: string) {
  return {
    canonical: path,
    languages: {
      vi: path,
      "vi-VN": path,
    },
  }
}

export function normalizeDescription(
  value: string | null | undefined,
  fallback: string = siteConfig.description,
  maxLength: number = 160
) {
  const cleaned = (value || fallback).replace(/\s+/g, " ").trim()

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  return `${cleaned.slice(0, maxLength - 3).trimEnd()}...`
}

export function resolveMetadataImage(url?: string | null) {
  if (!url) {
    return buildAbsoluteUrl(siteConfig.defaultImagePath)
  }

  if (/^https?:\/\//.test(url)) {
    return url
  }

  return buildAbsoluteUrl(url)
}

export function getMetadataImages(url?: string | null, alt?: string) {
  return [
    {
      url: resolveMetadataImage(url),
      width: 1200,
      height: 630,
      alt: alt || `${siteConfig.name} | Sneaker chính hãng tại Việt Nam`,
    },
  ]
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Toidibangiay | Sneaker chính hãng tại Việt Nam",
    template: "%s | Toidibangiay",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: defaultKeywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "shopping",
  alternates: buildLocaleAlternates("/"),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Toidibangiay | Sneaker chính hãng tại Việt Nam",
    description: siteConfig.description,
    images: getMetadataImages(undefined, `${siteConfig.name} | Sneaker chính hãng tại Việt Nam`),
  },
  twitter: {
    card: "summary_large_image",
    title: "Toidibangiay | Sneaker chính hãng tại Việt Nam",
    description: siteConfig.description,
    images: [resolveMetadataImage()],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification:{
    google: "gc56lmMGF5svD8cHlPccsXbZ2iLsN-Q-BfOJtelUxYc"
  },
  other: {
    "geo.region": "VN-43",
    "geo.placename": "Ba Ria - Vung Tau",
    "ICBM": "10.3460, 107.0843",
  },
}

export function buildProductMetadata(product: Product): Metadata {
  const path = `/products/${product.handle}`
  const image = product.images[0]?.url
  const firstVariant = product.variants[0]
  const description = normalizeDescription(
    product.description,
    `${product.title} chính hãng tại Toidibangiay, hỗ trợ giao hàng toàn quốc và tư vấn chọn size tại Việt Nam.`
  )

  return {
    title: product.title,
    description,
    keywords: [
      product.title,
      `${product.title} chính hãng`,
      "giày sneaker chính hãng",
      "mua sneaker Việt Nam",
      ...defaultKeywords,
    ],
    alternates: buildLocaleAlternates(path),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: buildAbsoluteUrl(path),
      siteName: siteConfig.name,
      title: `${product.title} | ${siteConfig.name}`,
      description,
      images: getMetadataImages(image, product.title),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | ${siteConfig.name}`,
      description,
      images: [resolveMetadataImage(image)],
    },
    other: firstVariant
      ? {
        "product:price:amount": Number.parseFloat(firstVariant.price.amount).toFixed(0),
        "product:price:currency": firstVariant.price.currencyCode,
        "product:availability": firstVariant.availableForSale ? "in stock" : "out of stock",
      }
      : undefined,
  }
}

export function buildCollectionMetadata(collection: Collection): Metadata {
  const path = `/collections/${collection.handle}`
  const image = collection.image?.url || collection.products[0]?.images[0]?.url
  const description = normalizeDescription(
    collection.description,
    `Khám phá bộ sưu tập ${collection.title} tại Toidibangiay với các mẫu sneaker chính hãng dành cho thị trường Việt Nam.`
  )

  return {
    title: `${collection.title} - Bộ sưu tập`,
    description,
    keywords: [
      collection.title,
      `bộ sưu tập ${collection.title}`,
      "bộ sưu tập sneaker",
      "giày sneaker Việt Nam",
      ...defaultKeywords,
    ],
    alternates: buildLocaleAlternates(path),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: buildAbsoluteUrl(path),
      siteName: siteConfig.name,
      title: `${collection.title} | ${siteConfig.name}`,
      description,
      images: getMetadataImages(image, collection.title),
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | ${siteConfig.name}`,
      description,
      images: [resolveMetadataImage(image)],
    },
  }
}

export function buildMissingPageMetadata(title: string, path: string): Metadata {
  return {
    title,
    description: "Trang bạn tìm hiện không còn khả dụng tại Toidibangiay.",
    alternates: buildLocaleAlternates(path),
    robots: {
      index: false,
      follow: false,
    },
  }
}

export function buildOrganizationSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "@id": `${siteConfig.url}#store`,
      name: siteConfig.name,
      url: siteConfig.url,
      image: resolveMetadataImage(),
      description: siteConfig.description,
      email: siteConfig.email,
      telephone: siteConfig.phoneSchema,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.city,
        addressCountry: siteConfig.country,
      },
      areaServed: siteConfig.country,
      priceRange: "₫₫",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteConfig.url}#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: siteConfig.language,
    },
  ]
}

export function buildHomePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteConfig.url}#home`,
    url: siteConfig.url,
    name: `${siteConfig.name} | Sneaker chính hãng tại Việt Nam`,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    isPartOf: {
      "@id": `${siteConfig.url}#website`,
    },
  }
}

export function buildAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${buildAbsoluteUrl("/about")}#about`,
    url: buildAbsoluteUrl("/about"),
    name: `Giới thiệu ${siteConfig.name}`,
    description:
      "Tìm hiểu về Toidibangiay, cửa hàng sneaker và streetwear chính hãng phục vụ khách hàng tại Việt Nam.",
    inLanguage: siteConfig.language,
    about: {
      "@id": `${siteConfig.url}#store`,
    },
  }
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  }
}

export function buildProductSchema(product: Product) {
  const path = `/products/${product.handle}`
  const firstVariant = product.variants[0]
  const price = firstVariant ? Number.parseFloat(firstVariant.price.amount).toFixed(0) : undefined

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${buildAbsoluteUrl(path)}#product`,
      name: product.title,
      description: normalizeDescription(product.description),
      image: product.images.map((image) => resolveMetadataImage(image.url)),
      sku: undefined,
      url: buildAbsoluteUrl(path),
      offers: firstVariant
        ? {
          "@type": "Offer",
          url: buildAbsoluteUrl(path),
          priceCurrency: firstVariant.price.currencyCode,
          price,
          availability:
            firstVariant.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: siteConfig.name,
          },
        }
        : undefined,
    },
    buildBreadcrumbSchema([
      { name: "Trang chủ", path: "/" },
      { name: "Sản phẩm", path: "/products" },
      { name: product.title, path },
    ]),
  ]
}

export function buildCollectionSchema(collection: Collection) {
  const path = `/collections/${collection.handle}`

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${buildAbsoluteUrl(path)}#collection`,
      url: buildAbsoluteUrl(path),
      name: collection.title,
      description: normalizeDescription(collection.description),
      inLanguage: siteConfig.language,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: collection.products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildAbsoluteUrl(`/products/${product.handle}`),
          name: product.title,
        })),
      },
    },
    buildBreadcrumbSchema([
      { name: "Trang chủ", path: "/" },
      { name: "Bộ sưu tập", path: "/collections" },
      { name: collection.title, path },
    ]),
  ]
}

export function buildProductListSchema(
  title: string,
  path: string,
  products: Product[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${buildAbsoluteUrl(path)}#products`,
    url: buildAbsoluteUrl(path),
    name: title,
    description: "Danh mục sneaker và streetwear chính hãng tại Toidibangiay.",
    inLanguage: siteConfig.language,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: buildAbsoluteUrl(`/products/${product.handle}`),
        name: product.title,
      })),
    },
  }
}

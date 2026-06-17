import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/seo"
import { getCollections } from "@/services/collection.service"
import { getProducts } from "@/services/product.service"

// Render on-demand instead of at build time. This route makes the heaviest
// backend calls in the app (all products + all collections), and the backend
// isn't reliably reachable during the Vercel build — generating it statically
// hangs past Next's 60s route-build limit and fails the deploy. Serving it
// dynamically keeps deploys green and the sitemap fresh against the live backend.
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteConfig.url

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  let productPages: MetadataRoute.Sitemap = []

  try {
    const products = await getProducts()
    productPages = products.map((product) => ({
      url: `${siteUrl}/products/${product.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {
    productPages = []
  }

  let collectionPages: MetadataRoute.Sitemap = []

  try {
    const collections = await getCollections()
    collectionPages = collections.map((collection) => ({
      url: `${siteUrl}/collections/${collection.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch {
    collectionPages = []
  }

  return [...staticPages, ...productPages, ...collectionPages]
}

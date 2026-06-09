import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/seo"
import { getCollections } from "@/services/collection.service"
import { getProducts } from "@/services/product.service"

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

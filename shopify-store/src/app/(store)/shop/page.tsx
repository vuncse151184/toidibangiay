import type { Metadata } from "next"
import ShopCatalogClient from "@/components/pages/ShopCatalogClient"
import { buildLocaleAlternates, getMetadataImages, siteConfig } from "@/lib/seo"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Shop sneaker chính hãng",
  description:
    "Shop toàn bộ sneaker và streetwear chính hãng tại Something Store, kèm bộ lọc nhanh theo giá, size và tình trạng sản phẩm.",
  keywords: [
    "shop sneaker",
    "giày sneaker chính hãng",
    "streetwear Việt Nam",
    "Something Store",
  ],
  alternates: buildLocaleAlternates("/shop"),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/shop`,
    siteName: siteConfig.name,
    title: "Shop | Something Store",
    description:
      "Shop toàn bộ sneaker và streetwear chính hãng tại Something Store, kèm bộ lọc nhanh theo giá, size và tình trạng sản phẩm.",
    images: getMetadataImages(undefined, "Shop | Something Store"),
  },
}

export default function ShopPage() {
  return <ShopCatalogClient />
}

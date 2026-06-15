import type { Metadata } from "next"
import ShopCatalogClient from "@/components/pages/ShopCatalogClient"
import { buildLocaleAlternates, getMetadataImages, siteConfig } from "@/lib/seo"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Tất cả sản phẩm sneaker chính hãng",
  description:
    "Khám phá toàn bộ giày sneaker và streetwear chính hãng tại Toidibangiay, tối ưu cho khách hàng mua sắm tại Việt Nam.",
  keywords: [
    "tất cả sản phẩm sneaker",
    "giày sneaker chính hãng",
    "mua sneaker Việt Nam",
    "Toidibangiay",
  ],
  alternates: buildLocaleAlternates("/products"),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/products`,
    siteName: siteConfig.name,
    title: "Tất cả sản phẩm | Toidibangiay",
    description:
      "Khám phá toàn bộ giày sneaker và streetwear chính hãng tại Toidibangiay, tối ưu cho khách hàng mua sắm tại Việt Nam.",
    images: getMetadataImages(undefined, "Tất cả sản phẩm | Toidibangiay"),
  },
}

export default function ProductsPage() {
  return <ShopCatalogClient />
}

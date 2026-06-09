import type { Metadata } from "next"
import ShopCatalogClient from "@/components/pages/ShopCatalogClient"
import JsonLd from "@/components/seo/JsonLd"
import {
  buildLocaleAlternates,
  buildProductListSchema,
  getMetadataImages,
  siteConfig,
} from "@/lib/seo"
import { getProductsPage } from "@/services/product.service"
import type { PageInfo, Product } from "@/types/product"

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

export default async function ProductsPage() {
  let initialProducts: Product[] = []
  let initialPageInfo: PageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    endCursor: null,
    startCursor: null,
  }
  let hasError = false

  try {
    const page = await getProductsPage()
    initialProducts = page.products
    initialPageInfo = page.pageInfo
  } catch {
    hasError = true
  }

  return (
    <>
      {initialProducts.length > 0 && (
        <JsonLd
          data={buildProductListSchema("Tất cả sản phẩm Toidibangiay", "/products", initialProducts)}
        />
      )}
      <ShopCatalogClient
        initialProducts={initialProducts}
        initialPageInfo={initialPageInfo}
        hasError={hasError}
      />
    </>
  )
}

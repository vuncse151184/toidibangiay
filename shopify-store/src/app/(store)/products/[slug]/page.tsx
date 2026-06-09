import { cache } from "react"
import type { Metadata } from "next"
import ProductDetailClient from "@/components/pages/ProductDetailClient"
import JsonLd from "@/components/seo/JsonLd"
import {
  buildMissingPageMetadata,
  buildProductMetadata,
  buildProductSchema,
} from "@/lib/seo"
import { getProductByHandle, getProducts } from "@/services/product.service"

export const revalidate = 3600

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

const getCachedProduct = cache(async (slug: string) => getProductByHandle(slug))

export async function generateStaticParams() {
  try {
    const products = await getProducts()
    return products.map((product) => ({ slug: product.handle }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const product = await getCachedProduct(slug)
    return product
      ? buildProductMetadata(product)
      : buildMissingPageMetadata("Sản phẩm không tồn tại", `/products/${slug}`)
  } catch {
    return buildMissingPageMetadata("Sản phẩm đang cập nhật", `/products/${slug}`)
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params

  let product = null

  try {
    product = await getCachedProduct(slug)
  } catch {
    product = null
  }

  return (
    <>
      {product ? <JsonLd data={buildProductSchema(product)} /> : null}
      <ProductDetailClient slug={slug} />
    </>
  )
}

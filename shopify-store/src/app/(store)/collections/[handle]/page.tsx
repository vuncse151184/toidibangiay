import { cache } from "react"
import type { Metadata } from "next"
import CollectionDetailClient from "@/components/pages/CollectionDetailClient"
import JsonLd from "@/components/seo/JsonLd"
import {
  buildCollectionMetadata,
  buildCollectionSchema,
  buildMissingPageMetadata,
} from "@/lib/seo"
import {
  getCollectionByHandle,
  getCollectionByHandlePage,
  getCollections,
} from "@/services/collection.service"

export const revalidate = 3600

type CollectionPageProps = {
  params: Promise<{ handle: string }>
}

const getCachedCollection = cache(async (handle: string) => getCollectionByHandle(handle))

export async function generateStaticParams() {
  try {
    const collections = await getCollections()
    return collections.map((collection) => ({ handle: collection.handle }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params

  try {
    const collection = await getCachedCollection(handle)
    return collection
      ? buildCollectionMetadata(collection)
      : buildMissingPageMetadata("Bộ sưu tập không tồn tại", `/collections/${handle}`)
  } catch {
    return buildMissingPageMetadata("Bộ sưu tập đang cập nhật", `/collections/${handle}`)
  }
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { handle } = await params

  let collection = null
  let initialCollection = null

  try {
    collection = await getCachedCollection(handle)
    initialCollection = await getCollectionByHandlePage(handle)
  } catch {
    collection = null
    initialCollection = null
  }

  return (
    <>
      {collection ? <JsonLd data={buildCollectionSchema(collection)} /> : null}
      <CollectionDetailClient handle={handle} initialCollection={initialCollection} />
    </>
  )
}

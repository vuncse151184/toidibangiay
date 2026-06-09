import type { Metadata } from "next"
import { buildLocaleAlternates, getMetadataImages, siteConfig } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Bộ sưu tập sneaker chính hãng",
  description:
    "Khám phá các bộ sưu tập sneaker và streetwear được tuyển chọn cho khách hàng tại Việt Nam.",
  alternates: buildLocaleAlternates("/collections"),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/collections`,
    siteName: siteConfig.name,
    title: "Bộ sưu tập | Toidibangiay",
    description:
      "Khám phá các bộ sưu tập sneaker và streetwear được tuyển chọn cho khách hàng tại Việt Nam.",
    images: getMetadataImages(undefined, "Bộ sưu tập | Toidibangiay"),
  },
}

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

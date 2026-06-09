import type { Metadata } from "next"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import JsonLd from "@/components/seo/JsonLd"
import FeaturedProducts from "@/components/sections/FeaturedProducts"
import SneakerHero from "@/components/sections/SneakerHero"
import {
  buildHomePageSchema,
  buildLocaleAlternates,
  getMetadataImages,
  siteConfig,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Sneaker chính hãng và streetwear cho khách hàng Việt Nam",
  description:
    "Mua sneaker chính hãng, streetwear chọn lọc và các mẫu giới hạn tại Toidibangiay với giao hàng toàn quốc.",
  keywords: [
    "sneaker chính hãng",
    "streetwear Việt Nam",
    "mua giày online",
    "Toidibangiay",
  ],
  alternates: buildLocaleAlternates("/"),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Toidibangiay | Sneaker chính hãng tại Việt Nam",
    description:
      "Mua sneaker chính hãng, streetwear chọn lọc và các mẫu giới hạn tại Toidibangiay với giao hàng toàn quốc.",
    images: getMetadataImages(undefined, "Toidibangiay | Sneaker chính hãng tại Việt Nam"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Toidibangiay | Sneaker chính hãng tại Việt Nam",
    description:
      "Mua sneaker chính hãng, streetwear chọn lọc và các mẫu giới hạn tại Toidibangiay với giao hàng toàn quốc.",
    images: getMetadataImages().map((image) => image.url),
  },
}

export default function Home() {
  return (
    <>
      <JsonLd data={buildHomePageSchema()} />
      <Navbar />
      <SneakerHero />
      <FeaturedProducts />
      <Footer />
    </>
  )
}

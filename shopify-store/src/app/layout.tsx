import "./globals.css"
import type { Metadata } from "next"
import { Geist, Oswald } from "next/font/google"
import { ReactNode } from "react"
import JsonLd from "@/components/seo/JsonLd"
import { cn } from "@/lib/utils"
import { buildOrganizationSchema, defaultMetadata } from "@/lib/seo"
import { Providers } from "./providers"
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  ...defaultMetadata,
  manifest: "/manifest.json",
}

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
})

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable, oswald.variable)}>
      <body className="bg-black text-white antialiased">
        <ServiceWorkerRegister />
        <JsonLd data={buildOrganizationSchema()} />
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

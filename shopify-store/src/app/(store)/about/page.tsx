import type { Metadata } from "next"
import { Store, Truck, ShieldCheck, RefreshCw, Clock, PackageCheck, AlertCircle, Phone } from "lucide-react"
import JsonLd from "@/components/seo/JsonLd"
import { buildAboutPageSchema, buildLocaleAlternates, getMetadataImages, siteConfig } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Gi\u1edbi thi\u1ec7u",
  description:
    "T\u00ecm hi\u1ec3u v\u1ec1 Toidibangiay, c\u1eeda h\u00e0ng gi\u00e0y sneaker v\u00e0 streetwear ch\u00ednh h\u00e3ng v\u1edbi giao h\u00e0ng to\u00e0n qu\u1ed1c v\u00e0 ch\u00ednh s\u00e1ch \u0111\u1ed5i tr\u1ea3 minh b\u1ea1ch.",
  keywords: [
    "gi\u1edbi thi\u1ec7u Toidibangiay",
    "sneaker ch\u00ednh h\u00e3ng Vi\u1ec7t Nam",
    "ch\u00ednh s\u00e1ch \u0111\u1ed5i tr\u1ea3 sneaker",
    "c\u1eeda h\u00e0ng gi\u00e0y B\u00e0 R\u1ecba V\u0169ng T\u00e0u",
  ],
  alternates: buildLocaleAlternates("/about"),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    title: "Gi\u1edbi thi\u1ec7u | Toidibangiay",
    description:
      "T\u00ecm hi\u1ec3u v\u1ec1 Toidibangiay, c\u1eeda h\u00e0ng gi\u00e0y sneaker v\u00e0 streetwear ch\u00ednh h\u00e3ng v\u1edbi giao h\u00e0ng to\u00e0n qu\u1ed1c v\u00e0 ch\u00ednh s\u00e1ch \u0111\u1ed5i tr\u1ea3 minh b\u1ea1ch.",
    images: getMetadataImages(undefined, "Gi\u1edbi thi\u1ec7u | Toidibangiay"),
  },
}

const values = [
  {
    icon: ShieldCheck,
    title: "Chính Hãng 100%",
    description: "Mọi sản phẩm đều được nhập khẩu trực tiếp từ thương hiệu, đảm bảo chính hãng và có hóa đơn đầy đủ.",
  },
  {
    icon: Truck,
    title: "Giao Hàng Toàn Quốc",
    description: "Miễn phí vận chuyển cho đơn từ 1.000.000₫. Giao hàng nhanh 2-5 ngày trên toàn quốc.",
  },
  {
    icon: RefreshCw,
    title: "Đổi Trả Dễ Dàng",
    description: "Hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng với điều kiện sản phẩm chưa qua sử dụng.",
  },
  {
    icon: Store,
    title: "Tư Vấn Tận Tâm",
    description: "Đội ngũ tư vấn viên am hiểu sản phẩm, sẵn sàng hỗ trợ bạn chọn size và mẫu phù hợp nhất.",
  },
]

const returnPolicySteps = [
  {
    step: "01",
    title: "Kiểm Tra Điều Kiện",
    description: "Sản phẩm còn nguyên tem, nhãn, chưa qua sử dụng và còn trong thời hạn 7 ngày kể từ ngày nhận.",
    icon: PackageCheck,
  },
  {
    step: "02",
    title: "Liên Hệ Hỗ Trợ",
    description: "Gửi yêu cầu đổi/trả qua email contactme.nguyenvudev@gmail.com hoặc gọi hotline +84 338 0104 26.",
    icon: Phone,
  },
  {
    step: "03",
    title: "Gửi Hàng Về",
    description: "Đóng gói sản phẩm cẩn thận và gửi về địa chỉ kho theo hướng dẫn. Chi phí ship đổi trả do khách hàng chịu.",
    icon: Truck,
  },
  {
    step: "04",
    title: "Nhận Hoàn Tiền / Đổi Mới",
    description: "Sau khi kiểm tra, chúng tôi sẽ hoàn tiền hoặc gửi sản phẩm mới trong vòng 3-5 ngày làm việc.",
    icon: RefreshCw,
  },
]

const returnNotes = [
  "Sản phẩm giảm giá trên 50% không áp dụng đổi trả.",
  "Không đổi trả với sản phẩm đã qua sử dụng, giặt, hoặc có dấu hiệu hư hỏng do khách hàng.",
  "Đổi size miễn phí 1 lần (chỉ áp dụng nếu còn hàng).",
  "Hoàn tiền qua chuyển khoản ngân hàng trong 3-5 ngày làm việc.",
  "Với sản phẩm lỗi từ nhà sản xuất, chúng tôi chịu toàn bộ chi phí đổi trả.",
]

export default function AboutPage() {
  return (
    <>
      <JsonLd data={buildAboutPageSchema()} />
      <div className="min-h-screen bg-black text-white">

      {/* Hero section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_30%_20%,rgba(220,38,38,0.2),transparent_60%)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

        <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
              Về Chúng Tôi
            </span>
            <div className="w-8 h-[2px] bg-red-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-display)] tracking-tight leading-tight">
            Đam Mê Sneaker,{" "}
            <span className="text-red-500">Phong Cách</span> Đường Phố
          </h1>

          <p className="mt-6 text-base md:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
            Toidibangiay là điểm đến dành cho những tín đồ sneaker và streetwear tại Việt Nam.
            Chúng tôi mang đến những đôi giày chính hãng, phiên bản giới hạn và bộ sưu tập
            được tuyển chọn kỹ lưỡng từ các thương hiệu hàng đầu thế giới.
          </p>
        </div>
      </section>

      {/* Values grid */}
      <section className="py-16 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((item) => (
              <div
                key={item.title}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors duration-300">
                  <item.icon size={22} className="text-red-500" />
                </div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="py-16 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[900px] mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
              Câu Chuyện
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] tracking-tight mb-8">
            Từ Đam Mê Đến Thương Hiệu
          </h2>

          <div className="space-y-5 text-sm md:text-base text-white/45 leading-relaxed">
            <p>
              Toidibangiay được thành lập bởi những người yêu sneaker thực thụ tại Bà Rịa - Vũng Tàu.
              Xuất phát từ niềm đam mê sưu tầm giày và văn hóa đường phố, chúng tôi mong muốn mang đến
              cho cộng đồng sneakerhead Việt Nam một nguồn cung cấp đáng tin cậy.
            </p>
            <p>
              Mỗi đôi giày tại Toidibangiay đều được kiểm tra kỹ lưỡng về chất lượng và tính xác thực
              trước khi đến tay khách hàng. Chúng tôi cam kết chỉ bán hàng chính hãng 100%, đi kèm
              hóa đơn và giấy tờ đầy đủ.
            </p>
            <p>
              Với phương châm &quot;Chất lượng đi đôi với niềm tin&quot;, chúng tôi không ngừng nỗ lực
              để mang đến trải nghiệm mua sắm tốt nhất — từ sản phẩm, dịch vụ tư vấn cho đến chính sách
              hậu mãi.
            </p>
          </div>
        </div>
      </section>

      {/* Return policy */}
      <section className="py-16 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
              Chính Sách
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] tracking-tight mb-4">
            Chính Sách Đổi Trả
          </h2>
          <p className="text-sm md:text-base text-white/40 mb-12 max-w-2xl">
            Chúng tôi cam kết mang đến sự hài lòng tuyệt đối. Nếu sản phẩm không phù hợp,
            bạn hoàn toàn có thể đổi trả theo quy trình đơn giản sau:
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {returnPolicySteps.map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
              >
                <span className="text-5xl font-bold font-[var(--font-display)] text-white/[0.06] absolute top-4 right-5">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-red-500" />
                </div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Return policy notes */}
          <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-5">
              <AlertCircle size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-white">
                Lưu Ý Quan Trọng
              </h3>
            </div>
            <ul className="space-y-3">
              {returnNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-white/40 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 mt-1.5 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[700px] mx-auto px-6 md:px-8 text-center">
          <Clock size={32} className="text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] tracking-tight mb-3">
            Cần Hỗ Trợ?
          </h2>
          <p className="text-sm text-white/40 mb-6">
            Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn từ 9:00 - 21:00 mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contactme.nguyenvudev@gmail.com"
              className="px-6 py-3 bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-lg hover:bg-red-500 transition-colors duration-300 shadow-lg shadow-red-600/20"
            >
              Gửi Email
            </a>
            <a
              href="tel:+84338010426"
              className="px-6 py-3 border-2 border-white/20 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-lg hover:border-white/40 transition-colors duration-300"
            >
              Gọi Hotline
            </a>
          </div>
        </div>
      </section>

      </div>
    </>
  )
}

import Link from "next/link"
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Youtube } from "lucide-react"
import Image from "next/image"

const footerLinks = {
  shop: [
    { label: "New Arrivals", href: "/collections" },
    { label: "Best Sellers", href: "/collections" },
    { label: "Men", href: "/collections" },
    { label: "Women", href: "/collections" },
    { label: "Kids", href: "/collections" },
    { label: "Sale", href: "/collections" },
  ],
  help: [
    { label: "Shipping & Returns", href: "#" },
    { label: "Size Guide", href: "#" },
    { label: "Order Tracking", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "Youtube" },
]

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.06]">
      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image src="https://res.cloudinary.com/dtov4zdy4/image/upload/v1773218437/ChatGPT_Image_Mar_11_2026_03_37_06_PM_1_iolztk.png" alt="Jumpman" width={120} height={120} />
            </Link>

            <p className="mt-5 text-sm text-white/35 leading-relaxed max-w-xs">
              Your destination for exclusive sneakers and streetwear. Authentic products, curated collections.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-3">
              <a href="mailto:support@something.store" className="flex items-center gap-3 text-xs text-white/30 hover:text-red-400 transition-colors">
                <Mail size={14} className="text-red-500/50" />
                contactme.nguyenvudev@gmail.com
              </a>
              <a href="tel:+84338010426" className="flex items-center gap-3 text-xs text-white/30 hover:text-red-400 transition-colors">
                <Phone size={14} className="text-red-500/50" />
                +84 338 0104 26
              </a>
              <span className="flex items-center gap-3 text-xs text-white/30">
                <MapPin size={14} className="text-red-500/50" />
                Bà Rịa - Vũng Tàu
              </span>
            </div>

            {/* Social link icons */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/30 hover:text-red-400 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-5">
              Help
            </h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/30 hover:text-red-400 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/30 hover:text-red-400 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-5">
              Newsletter
            </h3>
            <p className="text-xs text-white/30 leading-relaxed mb-4">
              Get exclusive deals and early access to new drops.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-all duration-300"
              />
              <button className="w-full py-3 bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-lg hover:bg-red-500 transition-all duration-300 shadow-lg shadow-red-600/10">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Toidibangiay. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-wider">
              Privacy
            </Link>
            <Link href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-wider">
              Terms
            </Link>
            <Link href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-wider">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

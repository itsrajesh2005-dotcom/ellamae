"use client"

import { ArrowRight } from "lucide-react"
import { Reveal } from "./reveal"
import Link from "next/link"

const columns = [
  {
    title: "Shop Collections",
    links: [
      { label: "Birthday Gifts", href: "/collections/birthday-gifts" },
      { label: "Anniversary Gifts", href: "/collections/anniversary-gifts" },
      { label: "Wedding Gifts", href: "/collections/wedding-gifts" },
      { label: "Corporate Gifts", href: "/collections/corporate-gifts" },
      { label: "Personalized Gifts", href: "/collections/personalized-gifts" },
      { label: "Home & Lifestyle", href: "/collections/home-lifestyle" },
      { label: "Utility Products", href: "/collections/utility-products" },
      { label: "Car Accessories", href: "/collections/car-accessories" },
      { label: "Festive Gift Hampers", href: "/collections/festive-gift-hampers" },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/#why" },
      { label: "Why Ellamae", href: "/#why" },
      { label: "Kind Words", href: "/#testimonials" },
      { label: "Catalogue", href: "/what-we-offer" }
    ]
  },
  {
    title: "Support & Contact",
    links: [
      { label: "Contact Us", href: "https://wa.me/919790666769" },
      { label: "WhatsApp Concierge", href: "https://wa.me/919790666769" },
      { label: "Phone: +91 9790666769", href: "tel:+919790666769" },
      { label: "Email Support", href: "mailto:ellamae.azstore@gmail.com" }
    ]
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#2a0812] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        {/* <Reveal>
          <div className="flex flex-col items-center gap-6 border-b border-background/15 pb-14 text-center">
            <h2 className="text-balance font-serif text-3xl font-light sm:text-5xl">
              Join the <span className="gold-shimmer-text italic">Ellamae</span> circle
            </h2>
            <p className="max-w-md text-pretty leading-relaxed text-background/60">
              Receive early access to seasonal collections and the art of thoughtful giving.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md items-center gap-2 rounded-full border border-background/20 bg-background/5 p-1.5"
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                className="flex-1 bg-transparent px-4 py-2 text-sm text-background placeholder:text-background/40 focus:outline-none"
              />
              <button
                data-cursor="pointer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-primary-foreground transition-transform hover:scale-105"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </Reveal> */}

        <div className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="font-serif text-2xl font-semibold tracking-[0.35em]">ELLAMAE</Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Thoughtfully curated luxury gifts, crafted to celebrate life’s most meaningful moments.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/ellamae_gifts_"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="pointer"
                aria-label="Instagram profile"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-gold hover:text-primary-foreground text-white/80 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://ellamae.in"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="pointer"
                aria-label="Website"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-gold hover:text-primary-foreground text-white/80 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </a>
              <a
                href="mailto:ellamae.azstore@gmail.com"
                data-cursor="pointer"
                aria-label="Send email"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-gold hover:text-primary-foreground text-white/80 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
              <a
                href="https://wa.me/919790666769"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="pointer"
                aria-label="WhatsApp chat"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-gold hover:text-primary-foreground text-white/80 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium tracking-wide text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        data-cursor="pointer"
                        className="text-sm text-white/55 transition-colors hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        data-cursor="pointer"
                        className="text-sm text-white/55 transition-colors hover:text-gold"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip: content details match the pamphlet exactly */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/15 pt-8 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Ellamae. All rights reserved.</p>
          <p className="text-center tracking-[0.2em] font-medium text-gold/80 uppercase">
            Thoughtful Gifts. Meaningful Moments. Beautiful Memories.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" data-cursor="pointer" className="transition-colors hover:text-gold text-white/45">Privacy Policy</Link>
            <Link href="/terms-and-conditions" data-cursor="pointer" className="transition-colors hover:text-gold text-white/45">Terms & Conditions</Link>
            <Link href="/refund-policy" data-cursor="pointer" className="transition-colors hover:text-gold text-white/45">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

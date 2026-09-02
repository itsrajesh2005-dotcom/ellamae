"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight, Gift } from "lucide-react"
import Link from "next/link"

const links = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/#categories" },
  { label: "Products", href: "/products" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Why Ellamae", href: "/#why" },
]

interface NavbarProps {
  /** 
   * "dark"  → page starts with a dark hero (white text at top, glass on scroll)
   * "light" → page has a light background (dark text always)
   * "hero"  → page has a dark hero but scrollsp into a light section (collection pages)
   */
  variant?: "dark" | "light" | "hero"
}

export function Navbar({ variant = "dark" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isHome = window.location.pathname === "/"

    // Only intercept hash links when already on the homepage
    if (isHome && (href.startsWith("#") || href.startsWith("/#"))) {
      e.preventDefault()
      const targetId = href.replace(/^\/#|#/, "")
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
      setOpen(false)
    }
    // For all other cases (non-home pages clicking /#categories, etc.),
    // let the default <Link> navigation happen — it will go to homepage + hash
  }

  // Determine text color based on variant and scroll state
  const getTextColor = () => {
    return "text-white"
  }

  const getLogoColor = () => {
    return "text-white/80 hover:text-white"
  }

  const getLinkColor = () => {
    return "text-white/80 hover:text-white"
  }

  const getSocialIconClass = () => {
    const base = "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300"
    return `${base} border-white/20 text-white/80 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white`
  }

  const getMobileButtonClass = () => {
    const base = "inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden transition-all duration-300"
    return `${base} border-white/20 text-white`
  }

  const getGlassStyle = () => {
    if (variant === "light") {
      return "bg-[#2a0812] border-b border-white/5 shadow-[0_8px_30px_rgba(42,8,18,0.15)]"
    }
    return scrolled 
      ? "bg-[#2a0812]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_30px_rgba(42,8,18,0.15)]" 
      : "bg-transparent"
  }

  const getMobileMenuBg = () => {
    return "border-t border-gold/15 bg-card/90 backdrop-blur-xl"
  }

  const getMobileLinkColor = () => {
    return "text-foreground/80 hover:bg-accent hover:text-foreground"
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ${getGlassStyle()}`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex flex-col leading-none" data-cursor="pointer">
          <span className={`font-serif text-2xl font-semibold tracking-[0.35em] transition-colors ${getLogoColor()}`}>
            ELLAMAE
          </span>
        </Link>
        <Link href="/products" className="hover:text-[#D4AF37] transition-colors">
  Products
</Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => handleLinkClick(e, l.href)}
              data-cursor="pointer"
              className={`group relative px-3 py-2 text-sm tracking-wide transition-all ${getLinkColor()}`}
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <a href="https://instagram.com/ellamae_gifts_" target="_blank" rel="noopener noreferrer" data-cursor="pointer" aria-label="Instagram" className={getSocialIconClass()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" data-cursor="pointer" aria-label="Facebook" className={getSocialIconClass()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="https://www.youtube.com/@ellamae-az" target="_blank" rel="noopener noreferrer" data-cursor="pointer" aria-label="YouTube" className={getSocialIconClass()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
            </a>
            <a href="mailto:ellamae.azstore@gmail.com" data-cursor="pointer" aria-label="Email" className={getSocialIconClass()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </a>
            <a href="https://wa.me/919790666769" target="_blank" rel="noopener noreferrer" data-cursor="pointer" aria-label="WhatsApp" className={getSocialIconClass()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </a>
          </div>
          <button
            data-cursor="pointer"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className={getMobileButtonClass()}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />

            {/* Menu Card */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="
            bg-[#2a0812]/95
            backdrop-blur-2xl
            p-4
          "
              >
                {/* Links */}
                <div className="space-y-2">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={(e) => {
                        handleLinkClick(e, l.href)
                        setOpen(false)
                      }}
                      className="
                  flex items-center
                  justify-between
                  rounded-2xl
                  px-4
                  py-4
                  text-white/90
                  hover:bg-white/10
                  transition-all
                "
                    >
                      <span>{l.label}</span>
                      <ArrowRight className="h-4 w-4 text-[#d4af37]" />
                    </Link>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20 p-4">
                  <p className="text-white text-sm font-medium">
                    Looking for a custom gift box?
                  </p>

                  <p className="text-white/60 text-xs mt-1">
                    Personalized gifts for every occasion.
                  </p>

                  <a
                    href="https://wa.me/919790666769"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
      mt-4
      flex
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-[#d4af37]
      py-3
      font-semibold
      text-[#410d1c]
    "
                  >
                    <Gift className="h-4 w-4" />
                    Create Your Gift Box
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

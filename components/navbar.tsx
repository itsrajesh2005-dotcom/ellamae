"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"

const links = [
  { label: "Collections", href: "/#categories" },
  { label: "What We Offer", href: "/what-we-offer" },
  { label: "Why Ellamae", href: "/#why" },
  { label: "Stories", href: "/#testimonials" },
]

export function Navbar() {
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
    const isWhatWeOfferPage = window.location.pathname === "/what-we-offer"

    if (isHome && (href.startsWith("#") || href.startsWith("/#") || href === "/what-we-offer")) {
      e.preventDefault()
      const targetId = href === "/what-we-offer" ? "what-we-offer" : href.replace(/^\/#|#/, "")
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
      setOpen(false)
    } else if (isWhatWeOfferPage && href === "/what-we-offer") {
      e.preventDefault()
      const element = document.getElementById("what-we-offer")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
      setOpen(false)
    }
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-[0_8px_30px_rgba(180,140,90,0.08)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex flex-col leading-none" data-cursor="pointer">
          <span className="font-serif text-2xl font-semibold tracking-[0.35em] text-foreground">
            ELLAMAE
          </span>
          <span className="mt-0.5 text-[10px] tracking-[0.45em] text-gold">LUXURY GIFTING</span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => handleLinkClick(e, l.href)}
              data-cursor="pointer"
              className="group relative text-sm tracking-wide text-foreground/80 transition-colors hover:text-foreground"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            data-cursor="pointer"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-foreground md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gold/15 bg-card/90 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleLinkClick(e, l.href)}
                  className="rounded-lg px-2 py-3 text-base text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

"use client"

import { ArrowRight, AtSign, Send, Share2 } from "lucide-react"
import { Reveal } from "./reveal"

const columns = [
  { title: "Shop", links: ["Birthday", "Anniversary", "Wedding", "Corporate", "Personalized"] },
  { title: "Company", links: ["Our Story", "Craftsmanship", "Sustainability", "Press", "Careers"] },
  { title: "Support", links: ["Contact", "Shipping", "Returns", "Gift Concierge", "FAQ"] },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal>
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
        </Reveal>

        <div className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <span className="font-serif text-2xl font-semibold tracking-[0.35em]">ELLAMAE</span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/55">
              Thoughtfully curated luxury gifts, crafted to celebrate life’s most meaningful moments.
            </p>
            <div className="mt-6 flex gap-3">
              {[AtSign, Send, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  data-cursor="pointer"
                  aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:bg-gold hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium tracking-wide text-background">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      data-cursor="pointer"
                      className="text-sm text-background/55 transition-colors hover:text-gold"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-8 text-xs text-background/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Ellamae. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" data-cursor="pointer" className="transition-colors hover:text-gold">Privacy</a>
            <a href="#" data-cursor="pointer" className="transition-colors hover:text-gold">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

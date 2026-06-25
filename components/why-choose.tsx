"use client"

import { motion } from "framer-motion"
import { Gem, Sparkles, PenLine, Gift, Truck, Building2 } from "lucide-react"
import { Reveal } from "./reveal"

const features = [
  { icon: Gem, title: "Premium Quality", desc: "Only the finest materials and makers, vetted for lasting beauty." },
  { icon: Sparkles, title: "Curated Collections", desc: "Every piece hand-selected by our in-house gifting stylists." },
  { icon: PenLine, title: "Personalized Gifts", desc: "Monograms, notes and bespoke touches that feel truly theirs." },
  { icon: Gift, title: "Elegant Packaging", desc: "Signature boxes and ribbons that make unwrapping a moment." },
  { icon: Truck, title: "Doorstep Delivery", desc: "White-glove delivery, beautifully on time, every time." },
  { icon: Building2, title: "Corporate Gifting", desc: "Refined gifting at scale for the clients you cherish most." },
]

export function WhyChoose() {
  return (
    <section id="why" className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <div className="mx-auto max-w-[320px] max-h-[400px] overflow-hidden rounded-[2rem] border border-gold/15 shadow-[0_20px_60px_rgba(180,140,90,0.12)]">
            <img src="/story.png" alt="Artisan tying a ribbon on a luxury gift box" className="h-full w-full object-cover" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="text-xs tracking-[0.4em] text-gold">WHY ELLAMAE</span>
            <h2 className="mt-4 text-balance font-serif text-4xl font-light text-foreground sm:text-5xl">
              The art of giving, <span className="italic text-gold">elevated</span>
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 0.08}>
                <motion.div whileHover={{ y: -4 }} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-accent text-gold">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-medium text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

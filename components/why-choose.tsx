"use client"

import { motion } from "framer-motion"
import { LayoutGrid, PenTool, Award, PackageCheck, Tags, Headphones } from "lucide-react"
import { Reveal } from "./reveal"

const features = [
  { icon: LayoutGrid, title: "Wide Product Collection", desc: "Hundreds of gift options for every age, occasion, and budget." },
  { icon: PenTool, title: "Customization Available", desc: "Add names, logos, photos, messages, and unique designs." },
  { icon: Award, title: "Quality Products", desc: "Carefully selected products with attention to detail." },
  { icon: PackageCheck, title: "Bulk Order Support", desc: "Suitable for events, celebrations, schools, organizations, and businesses." },
  { icon: Tags, title: "Affordable Pricing", desc: "Beautiful gifts that fit every budget." },
  { icon: Headphones, title: "Dedicated Customer Support", desc: "We're here to help you find the perfect gift." },
]

export function WhyChoose() {
  return (
    <section id="why" className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10 bg-white">
      {/* <section id="why" className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10"> */}
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <div className="mx-auto  overflow-hidden rounded-[2rem] border border-gold/15 shadow-[0_20px_60px_rgba(180,140,90,0.12)]">
            <img src="/ellamaegift.webp" alt="Artisan tying a ribbon on a luxury gift box" className="h-full w-full object-cover" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="text-xs tracking-[0.4em] text-gold uppercase font-semibold">Why Choose Us</span>
            <h2 className="mt-4 text-balance font-serif text-3xl font-medium text-black sm:text-5xl">
              Making Gifting <span className="italic text-gold">Simple and Memorable</span>
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 0.08}>
                <motion.div whileHover={{ y: -4 }} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/5 text-gold">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-black">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-black/80">{f.desc}</p>
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

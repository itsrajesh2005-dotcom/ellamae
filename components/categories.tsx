"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"

const categories = [
  { name: "Birthday Gifts", desc: "Celebrate another beautiful year", img: "/categories/birthday.png" },
  { name: "Anniversary Gifts", desc: "Honour love that endures", img: "/categories/anniversary.png" },
  { name: "Wedding Gifts", desc: "Begin forever, beautifully", img: "/categories/wedding.png" },
  { name: "Corporate Gifts", desc: "Gratitude, refined", img: "/categories/corporate.png" },
  { name: "Personalized Gifts", desc: "Made uniquely theirs", img: "/categories/personalized.png" },
  { name: "Home & Lifestyle", desc: "Everyday elegance", img: "/categories/lifestyle.png" },
  { name: "Utility Products", desc: "Everyday utilities, elevated", img: "/categories/lifestyle_utility.png" },
  { name: "Car Accessories", desc: "Luxury accessories for the journey", img: "/categories/car_accessories.png" },
  { name: "Festive Gift Hampers", desc: "Celebratory hampers crafted for joy", img: "/categories/festive_hampers.png" },
]

function Card({ c, i }: { c: (typeof categories)[number]; i: number }) {
  return (
    <Reveal delay={(i % 3) * 0.1}>
      <motion.div
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="group relative block overflow-hidden rounded-3xl border border-gold/15 bg-card/60 shadow-[0_10px_40px_rgba(180,140,90,0.08)] backdrop-blur-md"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={c.img || "/placeholder.svg"}
            alt={c.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
        </div>
        <div className="flex items-center justify-between gap-4 p-6">
          <div>
            <h3 className="font-serif text-2xl font-medium text-foreground">{c.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        </div>
      </motion.div>
    </Reveal>
  )
}

export function Categories() {
  return (
    <section id="categories" className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs tracking-[0.4em] text-gold">CURATED COLLECTIONS</span>
          <h2 className="mt-4 text-balance font-serif text-4xl font-light text-foreground sm:text-5xl md:text-6xl">
            Gifts for every <span className="italic text-gold">moment</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Each collection is thoughtfully composed to turn ordinary occasions into cherished memories.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <Card key={c.name} c={c} i={i} />
        ))}
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { Gift, Heart, Gem, Briefcase, Package, Home, Utensils, Car, PenLine, ShoppingBag } from "lucide-react"
import { Reveal } from "./reveal"

const categories = [
  { name: "Birthday Gifts", icon: Gift, slug: "birthday-gifts" },
  { name: "Anniversary Gifts", icon: Heart, slug: "anniversary-gifts" },
  { name: "Wedding & Return Gifts", icon: Gem, slug: "wedding-return-gifts" },
  { name: "Corporate Gifts", icon: Briefcase, slug: "corporate-gifts" },
  { name: "Festive Gift Hampers", icon: Package, slug: "festive-gift-hampers" },
  { name: "Home Accessories", icon: Home, slug: "home-accessories" },
  { name: "Kitchen Essentials", icon: Utensils, slug: "kitchen-essentials" },
  { name: "Car Accessories", icon: Car, slug: "car-accessories" },
  { name: "Personalized Gifts", icon: PenLine, slug: "personalized-gifts" },
  { name: "Utility Products", icon: ShoppingBag, slug: "utility-products" },
]

function Card({ c, i }: { c: (typeof categories)[number]; i: number }) {
  const Icon = c.icon
  return (
    <motion.div
      whileHover={{ 
        y: -4,
        backgroundColor: "rgba(255, 255, 255, 0.85)"
      }}
      transition={{ duration: 0.3 }}
      className={`
        flex flex-col items-center justify-center py-12 px-6 text-center transition-all duration-500 bg-white/40
        border-b border-gold/15
        ${(i + 1) % 2 === 0 ? "border-r-0" : "border-r border-r-gold/15"}
        lg:${(i + 1) % 5 === 0 ? "border-r-0" : "border-r border-r-gold/15"}
        ${i >= 8 ? "border-b-0" : ""}
        lg:${i >= 5 ? "lg:border-b-0" : "lg:border-b"}
      `}
    >
      <div className="relative w-14 h-14 rounded-full bg-[#fdf2f4] flex items-center justify-center border border-rose-100/50 mb-5 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#fbe7eb] shadow-[0_4px_12px_rgba(253,242,244,0.3)]">
        <Icon className="text-[#8c2d47] w-5.5 h-5.5 stroke-[1.5] transition-transform duration-500 group-hover:rotate-6" />
      </div>
      <h3 className="font-serif text-[17px] text-zinc-800 tracking-wide transition-colors duration-300 group-hover:text-[#8c2d47]">
        {c.name}
      </h3>
    </motion.div>
  )
}

export function WhatWeOffer() {
  return (
    <section id="what-we-offer" className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="text-[11px] tracking-[0.45em] text-[#8c2d47] font-semibold uppercase">THE CATALOGUE</span>
          <h2 className="mt-4 text-balance font-serif text-4xl font-light text-[#5c0632] sm:text-5xl md:text-6xl">
            What We Offer
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-zinc-600 text-[15px] tracking-wide">
            Ten curated categories, one beautifully wrapped destination — picked for every relationship and every reason to celebrate.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="rounded-[2.5rem] border border-gold/15 bg-white/30 backdrop-blur-md shadow-[0_20px_50px_rgba(180,140,90,0.06)] overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-5">
            {categories.map((c, i) => (
              <Card key={c.name} c={c} i={i} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Gift, Heart, Gem, Briefcase, Package, Sparkles, Car, PenLine, ShoppingBag, Star, ArrowRight } from "lucide-react"
import { Reveal } from "./reveal"

const categories = [
  {
    name: "Birthday Gifts",
    desc: "Celebrate another beautiful year",
    icon: Gift,
    slug: "birthday-gifts",
    color: "from-rose-500/20 to-pink-400/10",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50 border-rose-200/60",
    accent: "#f43f5e",
  },
  {
    name: "Anniversary Gifts",
    desc: "Honour love that endures",
    icon: Heart,
    slug: "anniversary-gifts",
    color: "from-red-500/20 to-rose-400/10",
    iconColor: "text-red-500",
    iconBg: "bg-red-50 border-red-200/60",
    accent: "#ef4444",
  },
  {
    name: "Wedding & Return Gifts",
    desc: "Begin forever, beautifully",
    icon: Gem,
    slug: "wedding-gifts",
    color: "from-violet-500/20 to-purple-400/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50 border-violet-200/60",
    accent: "#7c3aed",
  },
  {
    name: "Corporate Gifts",
    desc: "Gratitude, refined",
    icon: Briefcase,
    slug: "corporate-gifts",
    color: "from-blue-500/20 to-sky-400/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200/60",
    accent: "#2563eb",
  },
  {
    name: "Festive Gift Hampers",
    desc: "Celebratory hampers crafted for joy",
    icon: Package,
    slug: "festive-gift-hampers",
    color: "from-amber-500/20 to-yellow-400/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-200/60",
    accent: "#d97706",
  },
  {
    name: "Personalized Gifts",
    desc: "Made uniquely theirs",
    icon: PenLine,
    slug: "personalized-gifts",
    color: "from-teal-500/20 to-emerald-400/10",
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50 border-teal-200/60",
    accent: "#0d9488",
  },
  {
    name: "Home & Lifestyle",
    desc: "Everyday elegance",
    icon: Sparkles,
    slug: "home-lifestyle",
    color: "from-orange-500/20 to-amber-400/10",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50 border-orange-200/60",
    accent: "#f97316",
  },
  {
    name: "Utility Products",
    desc: "Everyday utilities, elevated",
    icon: ShoppingBag,
    slug: "utility-products",
    color: "from-indigo-500/20 to-blue-400/10",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50 border-indigo-200/60",
    accent: "#4f46e5",
  },
  {
    name: "Car Accessories",
    desc: "Luxury accessories for the journey",
    icon: Car,
    slug: "car-accessories",
    color: "from-slate-500/20 to-gray-400/10",
    iconColor: "text-slate-600",
    iconBg: "bg-slate-50 border-slate-200/60",
    accent: "#475569",
  },
]

function CategoryCard({ c, i }: { c: (typeof categories)[number]; i: number }) {
  const Icon = c.icon
  return (
    <Reveal delay={(i % 3) * 0.06}>
      <Link
        href={`/collections/${c.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl"
        aria-label={`Explore ${c.name} collection`}
      >
        <motion.div
          // whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className={`group relative overflow-hidden rounded-2xl border border-gold/10 bg-gradient-to-br ${c.color} cursor-pointer transition-all duration-400 hover:border-gold/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)] p-5 flex items-center gap-4 min-h-[88px]`}
        // className={`group relative overflow-hidden rounded-2xl border border-gold/10 bg-gradient-to-br ${c.color} backdrop-blur-sm cursor-pointer transition-all duration-400 hover:border-gold/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)] p-5 flex items-center gap-4 min-h-[88px]`}
        >
          {/* Icon */}
          <div
            className={`shrink-0 flex h-14 w-14 items-center justify-center rounded-xl border ${c.iconBg} transition-transform duration-300  shadow-sm`}
          >
            <Icon className={`h-6 w-6 ${c.iconColor} stroke-[1.7]`} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif  font-semibold text-black leading-tight transition-colors duration-300 group-hover:text-gold group-hover:font-bold">
              {c.name}
            </h3>
            <p className="mt-0.5 text-xs text-black/70 leading-relaxed truncate">
              {c.desc}
            </p>
          </div>

          {/* Arrow */}
          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 bg-white opacity-0 group-hover:opacity-100 group-hover:border-gold/50 transition-all duration-300 shadow-sm">
            <ArrowRight className="h-3.5 w-3.5 text-gold" />
          </div>

          {/* Hover shimmer */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-gold/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
        </motion.div>
      </Link>
    </Reveal>
  )
}

export function Categories() {
  return (
    <section id="categories" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 bg-white">
      {/* Section header */}
      <Reveal>
        <div className="mx-auto max-w-2xl text-center mb-6">
          <span className="text-xs tracking-[0.4em] text-gold font-semibold uppercase">Shop by Occasion</span>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium text-black sm:text-5xl">
            Find the Perfect Gift for <span className="italic text-gold">Every Celebration</span>
          </h2>
        </div>
      </Reveal>

      {/* Occasions strip */}
      <Reveal delay={0.1}>
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["Birthday Gifts", "Wedding Gifts", "Anniversary Gifts", "Baby Shower Gifts", "Housewarming Gifts", "Return Gifts", "Festival Gifts", "Corporate Gifts", "Employee Appreciation Gifts", "Promotional Gifts", "Customized Gifts", "Special Occasion Gifts"].map((occ) => (
            <span
              key={occ}
              className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-[11px] tracking-wide text-black/80 font-medium"
            >
              {occ}
            </span>
          ))}
        </div>
      </Reveal>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <CategoryCard key={c.name} c={c} i={i} />
        ))}
      </div>

      {/* Bottom CTA */}
      <Reveal delay={0.2}>
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-gold fill-gold" />
            <span className="text-black">Doorstep delivery across India</span>
            <Star className="h-4 w-4 text-gold fill-gold" />
          </div>
          <a
            href={`https://wa.me/919790666769?text=${encodeURIComponent("Hi, I would like to explore gift options from Ellamae. Can you help me?")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-[#c5a02e] to-gold px-7 py-3 text-sm font-semibold tracking-wider text-ivory shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(212,175,55,0.45)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enquire on WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  )
}

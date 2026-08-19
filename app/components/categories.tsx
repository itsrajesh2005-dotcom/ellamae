"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Gift, Heart, Gem, Briefcase, Package, Sparkles, Car, PenLine, ShoppingBag, Star } from "lucide-react"
import { Reveal } from "./reveal"

interface CategoryItem {
  name: string
  desc: string
  icon: React.ReactNode
  slug: string
  col: string
  height: string
  large: boolean
  image: string
  imageFallback?: string
}

/* Arrow icon */
function ArrowRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

/* Individual Category Card */
function GridCard({ item }: { item: CategoryItem }) {
  const isLarge = item.large

  return (
    <Link
      href={`/collections/${item.slug}`}
      aria-label={`Explore ${item.name}`}
      className={`group relative overflow-hidden rounded-xl ${item.col} ${item.height} block`}
      style={{ transition: "all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)" }}
    >
      {/* Image */}
      <img
        src={item.imageFallback ?? item.image}
        alt={item.name}
        onError={(e) => {
          const el = e.currentTarget
          if (item.imageFallback && el.src !== item.imageFallback) {
            el.src = item.imageFallback
          } else {
            el.src = item.image
          }
        }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Glass overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)" }}
      />

      {/* Hover tint */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />

      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-8`}
      >
        <div className="mb-4">{item.icon}</div>
        <h3
          className={`font-serif font-semibold text-white leading-tight mb-2 ${isLarge ? "text-4xl" : "text-2xl"
            }`}
        >
          {item.name}
        </h3>
        <p className={`text-white/80 font-medium ${isLarge ? "text-base max-w-md" : "text-sm"}`}>{item.desc}</p>

        {/* CTA */}
        <div
          className={`mt-4 inline-flex items-center gap-2 text-white font-semibold text-sm group/link mt-4`}
        >
          <span
            className={`border-b transition-colors border-b border-white/30 group-hover/link:border-white`}
          >
            Explore
          </span>
          <span className="group-hover/link:translate-x-1 transition-transform">
            <ArrowRight />
          </span>
        </div>
      </div>

      {/* Scale on hover via group */}
      <div className="absolute inset-0 pointer-events-none group-hover:ring-2 group-hover:ring-white/10 rounded-xl transition-all duration-500" />
    </Link>
  )
}

// ─── Categories Configuration & Mappings ───────────────────────────────────

const categoryDetailMap: Record<string, {
  desc: string;
  image: string;
  icon: React.ReactNode;
}> = {
  "birthday": {
    desc: "Celebrate another beautiful year with curated luxury.",
    image: "https://images.pexels.com/photos/8819120/pexels-photo-8819120.jpeg?_gl=1*t0upty*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk4NzgkajMkbDAkaDA.",
    icon: <Gift className="w-7 h-7 text-white/90" />
  },
  "anniversary": {
    desc: "Honour love that endures.",
    image: "https://images.pexels.com/photos/8819857/pexels-photo-8819857.jpeg?_gl=1*1huv73f*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk3NzAkajI3JGwwJGgw",
    icon: <Heart className="w-7 h-7 text-white/90" />
  },
  "corporate": {
    desc: "Gratitude, refined for professionals.",
    image: "https://images.pexels.com/photos/7580804/pexels-photo-7580804.jpeg?_gl=1*1uenv9n*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk1MTIkajM0JGwwJGgw",
    icon: <Briefcase className="w-7 h-7 text-white/90" />
  },
  "personalized": {
    desc: "Made uniquely theirs.",
    image: "https://images.unsplash.com/photo-1647221598276-124ebb861536?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: <PenLine className="w-7 h-7 text-white/90" />
  },
  "lifestyle": {
    desc: "Everyday elegance for the home.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuXmEoKeMOjVbWwFMimGxGnFyCaAkQeV1-NF0RS5UpZEQCHBsI2qYV_1Ti5umkf2J4bHardWxh5KZVzqWKO-VD5O-4i2MaOjluMyuEVHen6BjVROvnK2m00LvK9BMEjfbftfM9Y5j6l25aSVjcGIV2dv5rXIcZ2ONHTZXv_KpglUxaEfP0JG1fnwvJ_-MWucznbjqVZ2HG4dn3xL2azm97KcAq8R1FBjTd3EGd4ik7oChAtLEbC5iZEJwSILUEWJu2IoqSIq4qHIU",
    icon: <Sparkles className="w-7 h-7 text-white/90" />
  },
  "home": {
    desc: "Everyday elegance for the home.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuXmEoKeMOjVbWwFMimGxGnFyCaAkQeV1-NF0RS5UpZEQCHBsI2qYV_1Ti5umkf2J4bHardWxh5KZVzqWKO-VD5O-4i2MaOjluMyuEVHen6BjVROvnK2m00LvK9BMEjfbftfM9Y5j6l25aSVjcGIV2dv5rXIcZ2ONHTZXv_KpglUxaEfP0JG1fnwvJ_-MWucznbjqVZ2HG4dn3xL2azm97KcAq8R1FBjTd3EGd4ik7oChAtLEbC5iZEJwSILUEWJu2IoqSIq4qHIU",
    icon: <Sparkles className="w-7 h-7 text-white/90" />
  },
  "wedding": {
    desc: "Begin forever, beautifully.",
    image: "https://plus.unsplash.com/premium_photo-1682090789715-a1acbfe72404?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: <Gem className="w-7 h-7 text-white/90" />
  },
  "return": {
    desc: "Begin forever, beautifully.",
    image: "https://plus.unsplash.com/premium_photo-1682090789715-a1acbfe72404?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: <Gem className="w-7 h-7 text-white/90" />
  },
  "festive": {
    desc: "Celebratory hampers crafted for pure joy and tradition.",
    image: "https://plus.unsplash.com/premium_photo-1682090874106-6d85c6eb94a8?q=80&w=1141&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: <Package className="w-7 h-7 text-white/90" />
  },
  "hampers": {
    desc: "Celebratory hampers crafted for pure joy and tradition.",
    image: "https://plus.unsplash.com/premium_photo-1682090874106-6d85c6eb94a8?q=80&w=1141&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: <Package className="w-7 h-7 text-white/90" />
  },
  "utility": {
    desc: "Beautiful, functional items for everyday living.",
    image: "https://plus.unsplash.com/premium_photo-1661320959699-fed526e1461e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: <ShoppingBag className="w-7 h-7 text-white/90" />
  },
  "car": {
    desc: "Premium accessories to elevate your drive.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeFQ6k3_pWUrTAzLgKuIi1O-U82-Hm-PG8hGrLq8Rhy-hVNXNqbxdMVyBDx8ObFWcElE5CpZtrwiVlXFSeIKG5t8PlA-LUDPwCEXwjWfpExn376BqVI5tyauDbBLf4GUYBNIXv2pPXD_uxarzFJbtAklRBDsLF3Aj58yCCk0X97QaZDsQTwgcDofYfEyXmQfdpkyiRDL8f1d8cffYj08_iXTmsgCvFYHZEPwn1S9WQEdW_Z95Sd9Lg0KKI28ao_Wr6j-nrceGxZZg",
    icon: <Car className="w-7 h-7 text-white/90" />
  }
}

const defaultDetail = {
  desc: "Celebrate special moments",
  image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80",
  icon: <Gift className="w-7 h-7 text-white/90" />
}

const layout = [
  "md:col-span-8",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-8",
  "md:col-span-6",
  "md:col-span-6",
  "md:col-span-12",
]

export function Categories() {
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/categories?status=Active")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbCategories(data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const displayedCategories = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((cat: any, idx: number) => {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        const key = Object.keys(categoryDetailMap).find(k => slug.includes(k)) || ""
        const detail = key ? categoryDetailMap[key] : defaultDetail

        return {
          name: cat.name,
          desc: cat.description || detail.desc,
          icon: detail.icon,
          slug: slug,
          col: layout[idx % layout.length] || "md:col-span-4",
          height: "h-[300px]",
          large: idx % 3 === 0,
          image: cat.banner_image || detail.image,
        }
      })
    }
    return []
  }, [dbCategories])

  return (
    <section id="categories" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Section header */}
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">Shop by Occasion</span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-medium text-black sm:text-5xl mb-10">
            Find the Perfect Gift for <span className="italic text-gold">Every Celebration</span>
          </h2>
        </Reveal>

        {/* Grid loading / skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[300px] rounded-xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop grid (md+) */}
            <div className="hidden md:grid grid-cols-12 gap-6 md:gap-8">
              {displayedCategories.map((item) => (
                <GridCard key={item.slug} item={item} />
              ))}
            </div>

            {/* Mobile grid */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {displayedCategories.map((item) => (
                <div
                  key={item.slug}
                  className={item.large ? "h-[380px]" : "h-[280px]"}
                >
                  <GridCard item={{ ...item, col: "", height: "h-full" }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Occasions strip */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mt-16 mb-4">
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

      </div>
    </section>
  )
}


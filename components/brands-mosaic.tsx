"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Reveal } from "./reveal"

interface BrandItem {
  slug: string
  name: string
  desc: string
  cta: string
  icon: React.ReactNode
  image: string
  col: string
  height: string
  large: boolean
  horizontal?: boolean
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

/* Individual card */
function GridCard({ item }: { item: BrandItem }) {
  const isLarge = item.large
  const isHorizontal = item.horizontal

  return (
    <Link
      href={`/brands/${item.slug}`}
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
        className={`absolute inset-0 flex flex-col justify-end ${isLarge ? "p-10" : isHorizontal ? "p-8" : "p-8"}`}
      >
        {isHorizontal ? (
          /* Horizontal layout: icon + text side by side */
          <div className="flex items-center gap-6">
            <div className="shrink-0">{item.icon}</div>
            <div>
              <h3 className="font-serif font-semibold text-white text-2xl mb-1 leading-tight">{item.name}</h3>
              <p className="text-white/80 text-sm font-medium">{item.desc}</p>
            </div>
          </div>
        ) : (
          /* Vertical layout */
          <>
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
              className={`mt-4 inline-flex items-center gap-2 text-white font-semibold text-sm group/link ${isLarge ? "mt-6" : "mt-4"
                }`}
            >
              <span
                className={`border-b transition-colors ${isLarge
                  ? "border-b-2 border-white/30 group-hover/link:border-white"
                  : "border-b border-white/30 group-hover/link:border-white"
                  }`}
              >
                {item.cta}
              </span>
              <span className="group-hover/link:translate-x-1 transition-transform">
                <ArrowRight />
              </span>
            </div>
          </>
        )}
      </div>

      {/* Scale on hover via group */}
      <div className="absolute inset-0 pointer-events-none group-hover:ring-2 group-hover:ring-white/10 rounded-xl transition-all duration-500" />
    </Link>
  )
}

/* ─── exported section ─────────────────────────────────────────────────────── */
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

export function BrandsMosaic() {
  const [dbBrands, setDbBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brands-db?status=Active")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbBrands(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const displayedItems = useMemo(() => {
    if (dbBrands.length > 0) {
      return dbBrands.map((brand: any, idx: number) => {
        const slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return {
          slug: slug,
          name: brand.name,
          desc: brand.description || "Explore our exclusive collections",
          cta: "Explore Collection",
          icon: (
            <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.44 1.44 0 002.037 0l4.318-4.318a1.44 1.44 0 000-2.037l-9.58-9.58A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          ),
          image: brand.banner_image || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80",
          col: layout[idx] || "md:col-span-4",
          height: "h-[300px]",
          large: idx % 3 === 0,
        };
      });
    }
    return [];
  }, [dbBrands]);

  return (
    <section id="brands" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Section header — matches reference exactly */}
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">Shop by Brand</span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-medium text-black sm:text-5xl mb-10">
            "Find the Perfect Gift from <span className="italic text-gold">Our Luxury Brands"</span>
          </h2>

        </Reveal>


        {/* ── Desktop grid (md+) — 12 columns asymmetric ─────────────────── */}
        <div className="hidden md:grid grid-cols-12 gap-6 md:gap-8">
          {displayedItems.map((item) => (
            <GridCard key={item.slug} item={item} />
          ))}
        </div>

        {/* ── Mobile grid — single column, featured cards taller ──────────── */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {displayedItems.map((item) => (
            <div
              key={item.slug}
              className={item.large ? "h-[380px]" : (item as any).horizontal ? "h-[220px]" : "h-[280px]"}
            >
              <GridCard item={{ ...item, col: "", height: "h-full" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

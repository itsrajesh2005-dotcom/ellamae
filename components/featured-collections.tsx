"use client"

import { useState, useEffect, useMemo } from "react"
import { Reveal } from "./reveal"
import Link from "next/link"

const staticCollections = [
  { name: "Personalized Gifts", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" },
  { name: "Premium Gift Sets", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop" },
  { name: "Home & Lifestyle Gifts", image: "https://images.unsplash.com/photo-1602910344008-22f323cc1817?q=80&w=600&auto=format&fit=crop" },
  { name: "Office & Corporate Gifts", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop" },
  { name: "Festival Hampers", image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=600&auto=format&fit=crop" },
  { name: "Customized Mugs & Bottles", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop" },
  { name: "Photo Gifts", image: "https://images.unsplash.com/photo-1583847268964-b28ce8f31154?q=80&w=600&auto=format&fit=crop" },
  { name: "Wooden Crafts & Décor", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop" },
  { name: "Gift Hampers", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop" },
  { name: "Event & Return Gifts", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop" },
]

export function FeaturedCollections() {
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories-db?status=Active")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbCategories(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const collections = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((cat: any) => {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const matched = staticCollections.find((s) => s.name.toLowerCase() === cat.name.toLowerCase());
        return {
          name: cat.name,
          slug: slug,
          image: cat.banner_image || (matched ? matched.image : "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop"),
        };
      });
    }
    return staticCollections.map((s) => ({
      ...s,
      slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }, [dbCategories]);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">Featured Collections</span>
            <h2 className="mt-4 text-balance font-serif text-3xl font-light text-white sm:text-5xl">
              Explore Our Popular <span className="italic text-gold">Gift Categories</span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {collections.map((item, i) => (
            <Reveal key={`${item.slug || item.name}-${i}`} delay={i * 0.05}>
              <Link href={`/collections/${item.slug}`}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#2a0812] transition-all hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1 cursor-pointer">
                  <div className="aspect-square relative overflow-hidden bg-black/20">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <span className="text-[15px] font-serif font-medium text-white leading-tight block">
                        {item.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

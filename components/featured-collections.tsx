"use client"

import { useState, useEffect, useMemo } from "react"
import { Reveal } from "./reveal"
import Link from "next/link"

export function FeaturedCollections() {
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories?status=Active")
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
        return {
          name: cat.name,
          slug: slug,
          image: cat.banner_image || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop",
        };
      });
    }
    return [];
  }, [dbCategories]);

  return (
    <section id="categories" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">Popular Categories</span>
            <h2 className="mt-4 text-balance font-serif text-3xl font-light text-white sm:text-5xl">
              Explore Our Popular <span className="italic text-gold">Categories</span>
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

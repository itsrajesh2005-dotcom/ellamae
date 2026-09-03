"use client"

import { useState, useMemo, useEffect } from "react"
import { products as staticProducts, CATEGORIES as staticCategories, type Product } from "@/data/products"
import { CategoryTabs } from "./CategoryTabs"
import { ProductSearch } from "./ProductSearch"
import { ProductSort, type SortOption } from "./ProductSort"
import { ProductGrid } from "./ProductGrid"
import { Reveal } from "./reveal"
import { Sparkles } from "lucide-react"

export function ProductSection() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("featured")

  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [dbGifts, setDbGifts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBackendData() {
      try {
        let catMap: Record<number, string> = {};

        // 1. Fetch Categories
        const catRes = await fetch("/api/categories?status=Active");
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData) && catData.length > 0) {
            setDbCategories(catData);
            // Build catMap directly from catData instead of cloning catRes
            catData.forEach((c: any) => {
              catMap[c.id] = c.name;
            });
          }
        }

        // 2. Fetch Products
        const giftsRes = await fetch("/api/products?status=Active");
        if (giftsRes.ok) {
          const giftsData = await giftsRes.json();
          if (Array.isArray(giftsData) && giftsData.length > 0) {
            const formattedGifts: Product[] = giftsData.map((g: any) => {
              const primaryImg = (() => {
                if (Array.isArray(g.images) && g.images.length > 0 && g.images[0]) return g.images[0];
                if (typeof g.images === 'string' && g.images.trim().startsWith('[')) {
                  try { const p = JSON.parse(g.images); if (Array.isArray(p) && p[0]) return p[0]; } catch (e) {}
                }
                if (typeof g.images === 'string' && g.images.length > 0) return g.images;
                if (typeof g.image === 'string' && g.image.length > 0) return g.image;
                if (typeof g.image_path === 'string' && g.image_path.length > 0) return g.image_path;
                return "";
              })();

              const gallery = Array.isArray(g.images) ? g.images.filter(Boolean) : [primaryImg];

              return {
                id: g.id,
                name: g.title,
                category: catMap[g.category_id] || "Gifts",
                price: parseFloat(g.price || "0"),
                description: g.description || "",
                image: primaryImg,
                galleryImages: gallery,
                status: g.status,
              };
            });
            setDbGifts(formattedGifts);
          }
        }
      } catch (err) {
        console.error("Error loading backend data for ProductSection:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBackendData();
  }, []);

  const categories = useMemo(() => {
    if (dbCategories.length > 0) {
      return ["All", ...dbCategories.map((c) => c.name)];
    }
    return staticCategories;
  }, [dbCategories]);

  const allProducts = useMemo(() => {
    if (dbGifts.length > 0) {
      return dbGifts;
    }
    return staticProducts;
  }, [dbGifts]);

  // Filter and Sort Products
  const processedProducts = useMemo(() => {
    // 1. Filter by category
    let result = allProducts.filter((p) => p.status !== 'Inactive')
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // 2. Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    }

    // 3. Apply sorting
    const sorted = [...result]
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price)
    } else if (sortBy === "latest") {
      sorted.sort((a, b) => b.id - a.id)
    }

    return sorted
  }, [allProducts, selectedCategory, searchQuery, sortBy])

  return (
    <section id="signature-collection" className="relative px-6 py-24 lg:px-10 overflow-hidden">
      {/* Background soft ambient gold glow blobs */}
      <div className="absolute top-1/4 -left-20 -z-10 h-72 w-72 rounded-full bg-gold/5 blur-[80px]" />
      <div className="absolute bottom-1/4 -right-20 -z-10 h-72 w-72 rounded-full bg-gold-soft/5 blur-[80px]" />

      {/* Header Info */}
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[10px] font-semibold tracking-[0.25em] text-gold uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Exquisite Catalogue</span>
          </div>
          <h2 className="mt-5 text-balance font-serif text-4xl font-light text-foreground sm:text-5xl md:text-6xl leading-tight">
            Explore Our <span className="italic text-gold">Signature</span> Collection
          </h2>
        </div>
      </Reveal>

      {/* Search and Sort Toolbar */}
      <Reveal delay={0.15}>
        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gold/10 pb-6">
          <ProductSearch value={searchQuery} onChange={setSearchQuery} />

          <div className="flex items-center justify-between sm:justify-end gap-4">
            {/* Product Counter */}
            <span className="text-xs tracking-wider text-muted-foreground/80 font-medium">
              Showing {processedProducts.length} of {allProducts.length} products
            </span>
            <ProductSort value={sortBy} onChange={setSortBy} />
          </div>
        </div>
      </Reveal>

      {/* Filter Tabs */}
      <Reveal delay={0.2}>
        <div className="mt-8">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
      </Reveal>

      {/* Dynamic Products Area */}
      <div className="mt-12">
        {processedProducts.length > 0 ? (
          <ProductGrid products={processedProducts} />
        ) : (
          <Reveal>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold">
                <svg
                  className="h-10 w-10 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gold animate-ping" />
              </div>
              <h3 className="font-serif text-2xl font-light text-foreground">
                No gifts found matching your search.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Try adjusting your search query or switching categories to explore other luxury options.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  setSortBy("featured")
                }}
                className="mt-6 rounded-full border border-gold/40 hover:border-gold px-6 py-2 text-xs font-semibold tracking-wider text-gold hover:bg-gold/5 transition-all duration-300 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
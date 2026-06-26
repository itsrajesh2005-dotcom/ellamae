"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ChevronDown, Check, ChevronRight, Sparkles, Maximize2 } from "lucide-react"
import type { Product } from "@/data/products"
import type { Category } from "@/data/categories"

// ─── WhatsApp Button ─────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "919790666769"

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-[24px] border border-gold/10 bg-card/30 overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-beige/60" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-3/4 rounded-full bg-beige/80" />
        <div className="h-3 w-full rounded-full bg-beige/60" />
        <div className="h-3 w-2/3 rounded-full bg-beige/60" />
        <div className="mt-4 flex justify-between items-center">
          <div className="h-6 w-20 rounded-full bg-beige/80" />
          <div className="h-9 w-28 rounded-full bg-gold/20" />
        </div>
      </div>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product
  index: number
  onImageClick: (img: string, name: string) => void
}

function ProductCard({ product, index, onImageClick }: ProductCardProps) {
  const whatsappMsg = `Hi, I am interested in ${product.name}. Can you share more details?`
  const whatsappLink = `https://wa.me/919790666769?text=${encodeURIComponent(whatsappMsg)}`
  const price = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.24), ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[20px] bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 cursor-zoom-in"
      onClick={() => onImageClick(product.image, product.name)}
    >
      <div className="aspect-[4/4] relative overflow-hidden w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          priority={index < 4}
        />

        {/* Gradient Overlay for Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

        {/* Hover zoom icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-3 text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-400">
            <Maximize2 className="h-5 w-5 stroke-[2]" />
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10">
          {product.tag && (
            <span className="rounded-full bg-gold px-3 py-1.5 text-[10px] font-bold tracking-wider text-black uppercase shadow-md backdrop-blur-md">
              {product.tag}
            </span>
          )}
        </div>

        {/* Details Overlaid at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end">
          <h3 className="font-serif text-xl font-medium leading-snug text-white line-clamp-1 group-hover:text-gold transition-colors">
            {product.name}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-lg font-semibold text-white tracking-wide">{price}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(whatsappLink, "_blank");
              }}
              aria-label={`Enquire about ${product.name} on WhatsApp`}
              className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 text-[10px] font-bold tracking-wider text-white transition-all duration-300 hover:bg-gold hover:border-gold hover:text-black hover:scale-105"
            >
              <WhatsAppIcon />
              <span>ENQUIRE</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────
type SortOption = "featured" | "price-asc" | "price-desc"
const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
}

function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative z-20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-gold/20 bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:border-gold"
      // className="flex items-center gap-2 rounded-full border border-gold/20 bg-card/60 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-gold"
      >
        <span>{SORT_LABELS[value]}</span>
        <ChevronDown className={`h-4 w-4 text-gold transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-52 rounded-2xl border border-gold/15 bg-card/95 p-1.5 shadow-[0_12px_30px_rgba(45,33,27,0.12)] backdrop-blur-xl"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors ${value === opt ? "bg-gold/10 text-gold font-medium" : "text-foreground/75 hover:bg-gold/5"}`}
              >
                {SORT_LABELS[opt]}
                {value === opt && <Check className="h-4 w-4 text-gold" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Collection Page Client ──────────────────────────────────────────────
interface CollectionPageClientProps {
  category: Category
  initialProducts: Product[]
}

export function CollectionPageClient({ category, initialProducts }: CollectionPageClientProps) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("featured")
  const [loading] = useState(false)

  // Lightbox State
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null)

  // ESC key handler for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const filtered = useMemo(() => {
    let result = [...initialProducts]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price)
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price)
    return result
  }, [initialProducts, search, sort])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner with dark overlays for high text contrast ────────────────── */}
      <div className="relative h-[55vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src={category.banner}
          alt={category.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Layered dark overlays to ensure the light ivory text is fully visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-14 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs tracking-widest text-ivory/70">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/#categories" className="hover:text-gold transition-colors">Collections</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gold">{category.name}</span>
            </nav>

            <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold tracking-[0.25em] text-gold uppercase backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              <span>Signature Collection</span>
            </div>
            <h1 className="font-serif text-5xl font-light text-ivory sm:text-6xl md:text-7xl leading-none">
              {category.name}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ivory/75">
              {category.description}
              {/* {category.subtitle} */}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Category Description ─────────────────────────────────────────────── */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl px-6 pt-14 pb-0 lg:px-16 bg-rose-50"
      >
        <div className="flex flex-col gap-6 border-b border-gold/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-base leading-relaxed text-black">
            {category.description}
          </p>
          <span className="shrink-0 text-sm  font-medium tracking-wider text-black">
            {filtered.length} of {initialProducts.length} gifts
          </span>
        </div>
      </motion.div> */}

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-6 lg:px-10 bg-rose-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex max-w-md w-full items-center rounded-full border border-gold/20 bg-white backdrop-blur-md px-5 py-2.5 transition-all duration-300 focus-within:border-gold focus-within:shadow-[0_0_15px_rgba(212,175,55,0.12)]">
            <Search className="h-4 w-4 text-gold/60 mr-3 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${category.name.toLowerCase()}...`}
              className="w-full bg-white text-sm text-black placeholder:text-black/50 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="ml-2 text-muted-foreground/50 hover:text-gold transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Sort */}
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 bg-rose-50">
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onImageClick={(url, name) => setLightbox({ url, name })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : search.trim() ? (
          /* No search results */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold">
              <Search className="h-9 w-9 opacity-60" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-black">No gifts found.</h3>
            <p className="mt-2 max-w-xs text-sm text-gray-700">
              Try adjusting your search to explore more of our curated {category.name.toLowerCase()}.
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-6 rounded-full border border-gold/40 px-6 py-2 text-xs font-semibold tracking-wider text-gold hover:bg-gold/5 hover:border-gold transition-all duration-300"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          /* Coming soon — no products in this category yet */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            {/* Decorative ring */}
            <div className="relative mb-8">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-gold/25 bg-gradient-to-br from-gold/8 to-transparent text-gold">
                <svg className="h-12 w-12 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold/60 animate-ping" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold" />
            </div>
            <span className="text-[10px] tracking-[0.35em] text-gold uppercase font-semibold mb-3">Coming Soon</span>
            <h3 className="font-serif text-3xl font-light text-foreground">
              Curating Something Special
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Our team is thoughtfully selecting the finest {category.name.toLowerCase()} to add to this collection.
              Check back soon for an exquisite curation.
            </p>
            <a
              href={`https://wa.me/919790666769?text=${encodeURIComponent(`Hi, I am looking for ${category.name}. Can you help me find the right gift?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-[#c8a830] to-gold px-7 py-3 text-xs font-semibold tracking-wider text-ivory shadow-[0_4px_18px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.03] hover:shadow-[0_8px_28px_rgba(212,175,55,0.42)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enquire on WhatsApp
            </a>
          </motion.div>
        )}
      </div>

      {/* ── Premium Lightbox Modal for Products ─────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-10 cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors duration-300 p-2 cursor-pointer z-[110]"
              aria-label="Close image lightbox"
            >
              <X className="h-8 w-8 stroke-[1.5]" />
            </button>

            {/* Modal Content Wrapper */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[75vh] w-full h-full flex items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] cursor-default bg-zinc-950/20"
            >
              <img
                src={lightbox.url}
                alt={lightbox.name}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>

            {/* Product Title in Lightbox */}
            <motion.h4
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-center text-ivory font-serif text-2xl tracking-wide max-w-xl"
            >
              {lightbox.name}
            </motion.h4>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

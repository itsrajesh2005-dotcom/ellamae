"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Sparkles, X } from "lucide-react"
import type { Product } from "@/data/products"
import { CATEGORY_SLUG } from "@/data/products"

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}

function getProductGalleryImages(product: Product) {
  const customImages = product.galleryImages?.filter(Boolean)
  if (customImages && customImages.length > 0) {
    return customImages
  }

  return [product.image]
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function ProductDetailClient({ product }: { product: Product }) {
  const [activeView, setActiveView] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  const galleryImages = useMemo(() => getProductGalleryImages(product), [product])
  const activeImage = galleryImages[activeView] ?? product.image
  const collectionSlug = CATEGORY_SLUG[product.category] ?? (product.category ? product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "birthday-gifts")

  useEffect(() => {
    setActiveView(0)
    setIsZoomOpen(false)
  }, [product.id])

  return (
    <div className="min-h-screen bg-white text-[#1f1f1f]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-start justify-end gap-3 rounded-[1.75rem] bg-[#fff8dc]/40 p-3 shadow-[0_10px_30px_rgba(212,175,55,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#fff8dc] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b8860b]">
            <Sparkles className="h-3.5 w-3.5" />
            {product.category}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <Link
                href={`/collections/${collectionSlug}`}
                className="absolute left-30 top-25 z-20 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/30 bg-[#fff8dc]/90 px-2 py-1 text-sm font-medium text-[#1f1f1f] transition hover:border-[#d4af37] hover:bg-[#fff8dc] shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to collection
              </Link>
          <div className="rounded-[2rem] p-4 sm:p-6">
            <div className="relative overflow-hidden rounded-[1.5rem]">


              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="group relative w-full"
                title="Open full-size product view"
              >
                <Image
                  src={activeImage}
                  alt={product.name}
                  width={800}
                  height={560}
                  className="h-[280px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[360px]"
                  priority
                />

                <div className="absolute inset-0 flex items-center justify-center bg-transparent transition">
                  <div className="rounded-full border border-[#d4af37]/30 bg-[#fff8dc]/60 p-3 text-[#1f1f1f] opacity-0 shadow-lg backdrop-blur-sm transition group-hover:opacity-100">
                    <Maximize2 className="h-5 w-5" />
                  </div>
                </div>
              </button>

              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                  className="rounded-full border border-[#5c1328]/40 bg-[#faf6f0]/90 p-2 text-[#2a0812] transition hover:bg-[#faf6f0]"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView((prev) => (prev + 1) % galleryImages.length)}
                  className="rounded-full border border-[#5c1328]/40 bg-[#faf6f0]/90 p-2 text-[#2a0812] transition hover:bg-[#faf6f0]"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((image, index) => (
                <button
                  key={`${product.id}-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveView(index)}
                    className={`shrink-0 rounded-[1rem] border p-1.5 transition ${activeView === index ? "border-[#5c1328] bg-[#5c1328]/15" : "border-zinc-700 bg-[#2a0812] hover:border-[#83224a]"}`}
                  aria-label={`Show view ${index + 1}`}
                  title={`Show view ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    width={96}
                    height={72}
                    className="h-14 w-20 rounded-[0.8rem] object-cover sm:h-16 sm:w-22"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="p-6 rounded-[1.5rem]">
              <div className="inline-flex w-full flex-col gap-2 rounded-[1.75rem] bg-[#fff8dc]/60 px-4 py-4 text-[#1f1f1f] backdrop-blur-sm shadow-[0_12px_30px_rgba(212,175,55,0.08)] sm:px-5 sm:py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#6b3343]">Luxury Gift</p>
                <h1 className="font-serif text-[2rem] leading-tight text-[#1f1f1f] sm:text-[2.6rem]">{product.name}</h1>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[1.35rem] font-semibold text-[#1f1f1f]">{formatPrice(product.price)}</span>
                {product.tag && (
                  <span className="rounded-full bg-[#f6e5da] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#58212f]">
                    {product.tag}
                  </span>
                )}
              </div>

              <p className="mt-5 text-[0.95rem] leading-8 text-[#4b4b4b]">{product.description}</p>

              <div className="mt-6 pt-5">
                <h2 className="text-[0.9rem] font-semibold uppercase tracking-[0.25em] text-[#6b3343]">Why it stands out</h2>
                <ul className="mt-4 space-y-3 text-[0.95rem] text-[#4b4b4b]">
                  {(product.details?.length ? product.details : [
                    "Handpicked luxury gifting experience",
                    "Elegant presentation with premium finishing",
                    "Perfect for birthdays, celebrations, and memorable occasions",
                  ]).map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#83224a]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href={`https://wa.me/919790666769?text=${encodeURIComponent(`Hi, I am interested in ${product.name}. Can you share more details?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7d27d] to-[#d4af37] px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#1f1f1f] shadow-[0_12px_30px_rgba(212,175,55,0.2)] transition hover:scale-[1.02]"
            >
              <WhatsAppIcon />
              Enquire now
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomOpen(false)}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-[#410d1c]/95 p-2 sm:p-6"
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute right-4 top-4 z-[140] rounded-full border border-[#5c1328]/40 bg-[#faf6f0] p-2 text-[#2a0812] transition hover:bg-[#e3d1d9]"
              aria-label="Close zoom view"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
className="relative w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-[#5c1328]/40 bg-[#2a0812]"
            >
              <div className="flex items-center justify-between border-b border-[#5c1328]/40 bg-[#2a0812] px-4 py-3 text-sm text-[#faf6f0] sm:px-6">
                <span className="font-medium">{product.name}</span>
                <span className="text-xs uppercase tracking-[0.25em] text-[#e3c4cc]">Full View</span>
              </div>

              <div className="relative bg-[#2a0812] p-2 sm:p-4">
                <Image
                  src={activeImage}
                  alt={product.name}
                  width={640}
                  height={480}
                  className="max-h-[75vh] w-full rounded-[1.25rem] object-contain"
                />

                <button
                  type="button"
                  onClick={() => setActiveView((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[#5c1328]/40 bg-[#faf6f0]/90 p-2 text-[#2a0812] transition hover:bg-[#faf6f0]"
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView((prev) => (prev + 1) % galleryImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[#5c1328]/40 bg-[#faf6f0]/90 p-2 text-[#2a0812] transition hover:bg-[#faf6f0]"
                  aria-label="Next image"
                  title="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#5c1328]/40 bg-[#2a0812] px-4 py-3 sm:px-6">
                <div className="flex flex-wrap gap-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${product.id}-zoom-${index}`}
                      type="button"
                      onClick={() => setActiveView(index)}
                      className={`rounded-[0.85rem] border p-1 transition ${activeView === index ? "border-[#5c1328] bg-[#5c1328]/15" : "border-zinc-700 bg-[#2a0812]/90 hover:bg-[#3a0a1c]"}`}
                      aria-label={`Show view ${index + 1}`}
                      title={`Show view ${index + 1}`}
                    >
                      <Image src={image} alt={`${product.name} ${index + 1}`} width={72} height={56} className="h-10 w-14 rounded-[0.7rem] object-cover" />
                    </button>
                  ))}
                </div>
                <div className="text-xs uppercase tracking-[0.25em] text-[#d9c3cd]">Tap thumbnails to explore</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

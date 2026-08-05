"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import type { Product } from "@/data/products"

interface ProductCardProps {
  product: Product
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  const whatsappMessage = `Hi, I am interested in ${product.name}. Can you share more details?`
  const whatsappLink = `https://wa.me/919790666769?text=${encodeURIComponent(whatsappMessage)}`

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.215, 0.61, 0.355, 1],
      }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-gold/15 bg-card/45 shadow-[0_8px_30px_rgba(180,140,90,0.04)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.12)] hover:border-gold/30"
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[23px] bg-beige/30">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={index < 4}
          />
          {/* Gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/85 via-transparent to-transparent opacity-80" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="rounded-full bg-card/80 backdrop-blur-md px-3.5 py-1 text-[10px] font-semibold tracking-wider text-gold border border-gold/20 uppercase">
              {product.category.replace(" Gifts", "").replace(" & Lifestyle", "")}
            </span>
            {product.tag && (
              <span className="rounded-full bg-gradient-to-r from-gold to-gold-soft px-3 py-1 text-[10px] font-bold tracking-wider text-ivory shadow-[0_2px_8px_rgba(212,175,55,0.2)] uppercase">
                {product.tag}
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h3 className="font-serif text-xl font-light leading-snug tracking-wide text-foreground transition-colors duration-300 group-hover:text-gold">
            {product.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="p-6 pt-0">
        <div className="flex items-center justify-between border-t border-gold/10 pt-4 gap-3">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">Price</span>
            <span className="text-xl font-medium text-foreground tracking-tight">{formattedPrice}</span>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-gold via-[#c5a02e] to-gold px-5 py-2.5 text-[11px] font-semibold tracking-wider text-ivory shadow-[0_4px_15px_rgba(212,175,55,0.25)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)] active:scale-95"
          >
            {/* WhatsApp SVG */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>Enquire</span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}

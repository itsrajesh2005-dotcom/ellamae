"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Reveal } from "./reveal"

const cards = [
  { name: "Personalised Watches", img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop" },
  { name: "Scented Candles", img: "https://images.unsplash.com/photo-1602910344008-22f323cc1817?q=80&w=600&auto=format&fit=crop" },
  { name: "Printed Mugs", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=600&auto=format&fit=crop" },
  { name: "Leather Goods", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" },
]

export function GiftsUnwrapping() {
  const [activeImg, setActiveImg] = useState<string | null>(null)

  // ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveImg(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <section className="relative overflow-hidden bg-secondary/30 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <span className="text-[11px] tracking-[0.45em] text-[#8c2d47] font-semibold uppercase">A PEEK INSIDE</span>
            <h2 className="mt-4 text-balance font-serif text-4xl font-light text-[#5c0632] sm:text-5xl md:text-6xl">
              Gifts Worth Unwrapping
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-zinc-600 text-[15px] tracking-wide">
              A small taste of what arrives at the doorstep — wrapped, ribboned, and ready.
            </p>
          </div>
        </Reveal>

        {/* Responsive grid / snap carousel */}
        <Reveal>
          <div className="flex w-full gap-6 overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-x-visible pb-6 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {cards.map((card, i) => (
              <motion.div
                key={card.name}
                onClick={() => setActiveImg(card.img)}
                whileHover={{ 
                  scale: 1.025,
                  boxShadow: "0 25px 50px rgba(140, 110, 70, 0.15)"
                }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="group relative min-w-[85vw] sm:min-w-[48vw] lg:min-w-0 snap-center snap-always aspect-[4/5] overflow-hidden rounded-[2rem] bg-card border border-gold/15 cursor-pointer shadow-[0_10px_35px_rgba(180,140,90,0.04)]"
              >
                {/* Image element with group hover zoom */}
                <img
                  src={card.img || "/placeholder.svg"}
                  alt={card.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.06]"
                />
                
                {/* Gradient overlay and label */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-8">
                  <p className="text-white font-serif text-[17px] tracking-wider transition-transform duration-500 group-hover:translate-x-1">
                    {card.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Premium Lightbox Modal */}
      <AnimatePresence>
        {activeImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImg(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-10 cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveImg(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors duration-300 p-2 cursor-pointer z-[110]"
              aria-label="Close image lightbox"
            >
              <X className="h-8 w-8 stroke-[1.5]" />
            </button>

            {/* Modal Image Wrapper */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] cursor-default bg-zinc-950/20"
            >
              <img
                src={activeImg}
                alt="Enlarged Gift View"
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

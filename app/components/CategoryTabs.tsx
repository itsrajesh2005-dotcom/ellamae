"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface CategoryTabsProps {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export function CategoryTabs({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll the active category into view if it's clipped on mobile horizontal scroll
  useEffect(() => {
    const activeElement = containerRef.current?.querySelector("[data-active='true']")
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [selectedCategory])

  return (
    <div className="relative  border-b border-gold/10 pb-4">
      <div
        ref={containerRef}
        className="flex items-center gap-3 pb-2 scrollbar-none md:justify-center md:pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              data-active={isActive}
              className={`relative z-10 shrink-0 cursor-pointer rounded-full px-6 py-20 text-sm font-medium-black tracking-wide transition-all duration-300 ${
                isActive
                  ? "text-black font-semibold"
                  : "text-black/70 hover:text-foreground hover:#410d1c"
              }`}
            >
              {/* Glass background for non-active or border */}
              <span className="absolute inset-0 rounded-full border border-gold/15 bg-card/45 backdrop-blur-sm -z-10" />

              {/* Slider highlight */}
              {isActive && (
                <motion.span
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 rounded-full bg-black shadow-[0_4px_15px_rgba(0,0,0,0.1)] -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}

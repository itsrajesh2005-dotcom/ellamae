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
    <div className="relative w-full border-b border-gold/10 pb-4">
      <div
        ref={containerRef}
        className="flex w-full items-center gap-3 overflow-x-auto  pb-2 scrollbar-0 md:justify-center md:pb-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              data-active={isActive}
              className={`relative z-1 shrink-0 cursor-pointer   ms-2  rounded-full px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                isActive
                  ? "text-amber-900 font-semibold"
                  : "text-amber-900 hover:text-foreground hover:bg-[#2b030e]"
              }`}
            >
              {/* Glass background for non-active or border */}
              <span className="absolute inset-0 rounded-full border border-gold/15 bg-card/45-z-10" />

              {/* Slider highlight */}
              {isActive && (
                <motion.span
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 rounded-full bg-[#2b030e]] -z-10 "
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

"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type SortOption = "featured" | "price-asc" | "price-desc" | "latest"

interface ProductSortProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  latest: "Latest Arrivals",
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative z-20 w-full sm:w-56">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-full border border-gold/20 bg-card/60 backdrop-blur-md px-5 py-2.5 text-sm font-medium tracking-wide text-foreground transition-all duration-300 hover:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      >
        <span className="truncate">Sort: {SORT_LABELS[value]}</span>
        <ChevronDown
          className={`ml-2 h-4 w-4 text-gold transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Options List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 mt-2 rounded-2xl border border-gold/15 bg-card/95 p-1.5 shadow-[0_10px_30px_rgba(45,33,27,0.15)] backdrop-blur-lg"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => {
              const isSelected = value === option
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gold/10 text-gold font-medium"
                      : "text-foreground/80 hover:bg-gold/5 hover:text-foreground"
                  }`}
                >
                  <span>{SORT_LABELS[option]}</span>
                  {isSelected && <Check className="h-4 w-4 text-gold" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

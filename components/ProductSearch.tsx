"use client"

import { Search, X } from "lucide-react"

interface ProductSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      {/* Outer wrapper to styling focus/glow */}
      <div className="relative flex items-center w-full rounded-full border border-gold/20 bg-card/60 backdrop-blur-md px-5 py-2.5 transition-all duration-300 focus-within:border-gold focus-within:shadow-[0_0_15px_rgba(212,175,55,0.15)]">
        <Search className="h-5 w-5 text-gold/60 mr-3 flex-shrink-0" />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search gifts..."
          className="w-full bg-transparent text-sm font-sans tracking-wide text-foreground placeholder:text-muted-foreground/60 outline-none"
        />

        {value && (
          <button
            onClick={() => onChange("")}
            className="text-muted-foreground/60 hover:text-gold transition-colors duration-200 cursor-pointer ml-2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

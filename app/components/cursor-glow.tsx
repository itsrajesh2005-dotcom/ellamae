"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CursorGlow() {
  const [enabled, setEnabled] = useState(false)
  const [pointer, setPointer] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.4 })

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return
    setEnabled(true)

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const el = e.target as HTMLElement
      setPointer(!!el.closest("a, button, [data-cursor='pointer']"))
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [x, y])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* soft ambient glow */}
      <motion.div
        className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: sx,
          top: sy,
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--gold) 22%, transparent) 0%, transparent 65%)",
        }}
      />
      {/* precise dot */}
      <motion.div
        className="absolute rounded-full border border-gold/70 bg-gold/10"
        style={{
          left: sx,
          top: sy,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: pointer ? 44 : 14,
          height: pointer ? 44 : 14,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </div>
  )
}

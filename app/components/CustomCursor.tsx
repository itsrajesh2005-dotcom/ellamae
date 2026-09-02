"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

interface StarParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
}

export function CursorGlow() {
  const [enabled, setEnabled] = useState(false)
  const [pointer, setPointer] = useState(false)
  const [particles, setParticles] = useState<StarParticle[]>([])

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.4 })

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return
    setEnabled(true)

    let particleId = 0

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)

      const el = e.target as HTMLElement
      setPointer(!!el.closest("a, button, [data-cursor='pointer']"))

      // Gold Theme Twinkling Stars Trail
      const colors = ["#d4af37", "#ffd700", "#ffffff", "#f7d27d"]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      const randomSize = Math.random() * 8 + 6
      const randomRotation = Math.random() * 360

      const newParticle: StarParticle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
        size: randomSize,
        color: randomColor,
        rotation: randomRotation,
      }

      setParticles((prev) => [...prev.slice(-18), newParticle])
    }

    window.addEventListener("mousemove", move)

    const interval = setInterval(() => {
      setParticles((prev) => prev.filter((p) => Date.now() - p.id < 450))
    }, 40)

    return () => {
      window.removeEventListener("mousemove", move)
      clearInterval(interval)
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* Soft Ambient Gold Glow */}
      <motion.div
        className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: sx,
          top: sy,
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--gold) 22%, transparent) 0%, transparent 65%)",
        }}
      />

      {/* Twinkling Star Trail */}
      {particles.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 24 24"
          fill={p.color}
          className="animate-sparkle absolute"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            filter: `drop-shadow(0 0 6px ${p.color})`,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
          }}
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      ))}

      {/* Precise Expanding Cursor Dot */}
      <motion.div
        className="absolute rounded-full border border-gold/70 bg-gold/10 backdrop-blur-[1px]"
        style={{
          left: sx,
          top: sy,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: pointer ? 48 : 14,
          height: pointer ? 48 : 14,
          backgroundColor: pointer ? "rgba(212, 175, 55, 0.15)" : "rgba(212, 175, 55, 0.05)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </div>
  )
}
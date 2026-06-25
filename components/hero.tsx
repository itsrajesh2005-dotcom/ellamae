"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

const HeroScene = dynamic(() => import("./three/hero-scene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full" style={{ background: "linear-gradient(135deg, #faf6f0 0%, #f3ede2 50%, #faf6f0 100%)" }} />
  ),
})

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero() {
  const [opened, setOpened] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* 3D scene fills the section */}
      <div
        className="absolute inset-0 z-0 pointer-events-auto"
        style={{ width: "100%", height: "100%" }}
        data-cursor={hovered ? "pointer" : undefined}
      >
        <HeroScene opened={opened} setOpened={setOpened} hovered={hovered} setHovered={setHovered} />
      </div>

      {/* soft ambient gradients */}
      {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_55%,var(--background)_100%)]" /> */}

      {/* content */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="flex flex-col items-center translate-y-20">
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-balance font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Where Memories <span className="gold-shimmer-text italic">Begin</span>
          </motion.h1>

          <motion.span
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="pointer-events-auto mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/50 px-4 py-1.5 text-xs tracking-[0.25em] text-gold backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            THE ART OF THOUGHTFUL GIFTING
          </motion.span>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Thoughtfully curated gifts designed to celebrate life’s most meaningful moments.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="pointer-events-auto mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <a
              href="#categories"
              data-cursor="pointer"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all hover:shadow-[0_14px_40px_rgba(212,175,55,0.45)]"
            >
              Explore Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#why"
              data-cursor="pointer"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-8 py-3.5 text-sm font-medium tracking-wide text-foreground transition-colors hover:border-gold hover:text-gold"
            >
              Discover Our Story
            </a>
          </motion.div>
        </div>
      </div>


    </section>
  )
}

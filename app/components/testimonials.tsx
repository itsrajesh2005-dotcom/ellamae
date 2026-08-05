"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Reveal } from "./reveal"

const testimonials = [
  {
    quote:
      "The unboxing felt like a ceremony. Every detail, from the ribbon to the handwritten note, was pure poetry. My sister cried.",
    name: "Aria Whitman",
    role: "Anniversary Gift",
  },
  {
    quote:
      "Ellamae transformed our client gifting into something genuinely memorable. We've never received so many thank-you calls.",
    name: "Julian Cross",
    role: "Corporate Partner",
  },
  {
    quote:
      "I gasped when it arrived. The packaging alone is worth framing. This is gifting as it was always meant to feel.",
    name: "Noor Faraz",
    role: "Wedding Gift",
  },
]

const testimonialVariants = {
  enter: (d: number) => ({
    opacity: 0,
    rotateY: d * 35,
    x: d * 60,
  }),
  center: {
    opacity: 1,
    rotateY: 0,
    x: 0,
  },
  exit: (d: number) => ({
    opacity: 0,
    rotateY: d * -35,
    x: d * -60,
  }),
}

export function Testimonials() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)

  const go = (d: number) => {
    setDir(d)
    setIndex((p) => (p + d + testimonials.length) % testimonials.length)
  }

  const t = testimonials[index]

  return (
    <section id="testimonials" className="relative overflow-hidden bg-secondary/50 py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <span className="text-xs tracking-[0.4em] text-gold">KIND WORDS</span>
          <h2 className="mt-4 text-balance font-serif text-4xl font-light text-foreground sm:text-5xl">
            Moments worth <span className="italic text-gold">remembering</span>
          </h2>
        </Reveal>

        <div className="relative mt-14 min-h-[280px]" style={{ perspective: 1400 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={index}
              custom={dir}
              variants={testimonialVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-2xl rounded-[2rem] border border-gold/15 bg-card/70 p-10 shadow-[0_20px_60px_rgba(180,140,90,0.12)] backdrop-blur-md sm:p-14"
              style={{ transformStyle: "preserve-3d" }}
            >
              <Quote className="mx-auto h-9 w-9 text-gold/60" />
              <blockquote className="mt-6 text-balance font-serif text-2xl font-light italic leading-relaxed text-foreground sm:text-3xl">
                {t.quote}
              </blockquote>
              <figcaption className="mt-8">
                <p className="text-base font-medium text-foreground">{t.name}</p>
                <p className="text-sm tracking-wide text-gold">{t.role}</p>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            data-cursor="pointer"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-foreground transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                data-cursor="pointer"
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => {
                  setDir(i > index ? 1 : -1)
                  setIndex(i)
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-gold" : "w-2 bg-gold/30"
                }`}
              />
            ))}
          </div>
          <button
            data-cursor="pointer"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-foreground transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

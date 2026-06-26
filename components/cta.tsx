"use client"

import { Reveal } from "./reveal"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#410d1c] py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 text-center">
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">Perfect Gifts for Every Moment</span>
          <h2 className="mt-6 mx-auto max-w-3xl text-balance font-serif text-3xl font-light text-white sm:text-5xl md:text-6xl leading-[1.1]">
            Looking for the <span className="italic text-gold">Perfect Gift?</span>
          </h2>
          
          <div className="mt-8 mx-auto max-w-2xl space-y-6 text-base text-white/80 sm:text-lg">
            <p>
              Whether you're celebrating a birthday, expressing gratitude, welcoming a new beginning, or organizing a special event, we offer gifts that bring joy and create lasting memories.
            </p>
            <p>
              From personal celebrations to professional occasions, we help you find the perfect gift for every moment worth celebrating.
            </p>
            <p className="text-white font-medium mt-4">
              Explore our collection and discover thoughtful gifts for every occasion.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/#categories"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-[#410d1c] transition-all hover:scale-105 hover:bg-[#d4b54e] sm:w-auto"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/919790666769"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition-all hover:bg-white/10 hover:border-white/40 sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

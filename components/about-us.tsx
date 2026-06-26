"use client"

import { motion } from "framer-motion"
import { Reveal } from "./reveal"

export function AboutUs() {
  return (
    <section id="about" className="relative bg-rose-50 py-24">
      {/* <section id="about" className="relative bg-[#2a0812] py-24 sm:py-32"> */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">About Us</span>
            <h2 className="mt-4 text-balance font-serif text-3xl font-medium text-black sm:text-5xl">
              "Your One-Stop Destination for <span className="italic text-gold">Meaningful Gifts"</span>
            </h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-black/80 sm:text-lg">
              <p>
                We offer a wide range of gifting solutions designed for every occasion and every recipient. Whether you're celebrating a personal milestone, organizing a corporate event, planning a wedding, or looking for festive gifts, we have something special for everyone.
              </p>
              <p>
                Our collection includes customized gifts, premium gift sets, home décor items, personalized products, return gifts, corporate gifts, festival hampers, and much more.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

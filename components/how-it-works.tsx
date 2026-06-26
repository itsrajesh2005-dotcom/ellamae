"use client"

import { motion } from "framer-motion"
import { Search, Heart, MessageCircle, UserCheck, CheckCircle2 } from "lucide-react"
import { Reveal } from "./reveal"

const steps = [
  { icon: Search, title: "Browse Products", desc: "Explore our collection by category or occasion." },
  { icon: Heart, title: "Choose Your Favorite Items", desc: "Select products that match your needs." },
  { icon: MessageCircle, title: "Send an Enquiry", desc: "Contact us instantly through WhatsApp." },
  { icon: UserCheck, title: "Get Personalized Assistance", desc: "Receive pricing, customization options, and recommendations." },
  { icon: CheckCircle2, title: "Place Your Order", desc: "Confirm your requirements and let us handle the rest." },
]

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#2a0812] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">How It Works</span>
            <h2 className="mt-4 text-balance font-serif text-3xl font-light text-white sm:text-5xl">
              Simple Gift <span className="italic text-gold">Selection Process</span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 mx-auto max-w-5xl">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gold/20 md:left-1/2 md:-ml-px" />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.1}>
                  <div className={`relative flex items-center md:justify-between ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                    {/* Icon node */}
                    <div className="absolute left-0 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#2a0812] bg-[#410d1c] shadow-[0_4px_12px_rgba(212,175,55,0.2)] md:left-1/2 md:-ml-7">
                      <step.icon className="h-5 w-5 text-gold" />
                    </div>

                    {/* Content */}
                    <div className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                      <h3 className="text-xl font-serif font-medium text-white">{step.title}</h3>
                      <p className="mt-2 text-sm text-white/80 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

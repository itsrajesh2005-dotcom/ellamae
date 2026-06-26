"use client"

import { motion } from "framer-motion"
import { ArrowRight, Gift, Award, Truck, Heart } from "lucide-react"

export function Hero() {
  return (
    <section
      id="top"
      className="relative bg-[#410d1c] overflow-hidden"
    >
      {/* Background Effects */} <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/10 pointer-events-none" />

      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.1)_0%,transparent_60%)] pointer-events-none" />

      <div
        className="
      relative z-10
      mx-auto
      max-w-7xl
      px-6
      lg:px-10

      min-h-[calc(100vh-88px)]
      pt-24
      pb-10

      flex
      flex-col
      lg:flex-row

      items-center
      justify-center

      gap-8
    "
      >
        {/* Left Content */}
        <div
          className="
        flex-1
        w-full
        max-w-2xl

        flex
        flex-col
        justify-center

        lg:scale-95
        origin-left
      "
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
          font-serif
          text-4xl
          sm:text-5xl
          lg:text-6xl
          leading-[1.05]
        "
          >
            <span className="block text-white">
              Every Gift
            </span>

            <span className="block mt-1 text-[#d4af37]">
              Tells A Story
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="
          mt-4
          max-w-xl
          text-white/80
          text-sm
          sm:text-base
          leading-relaxed
        "
          >
            Every gift. Every occasion. This is our destination.
            Whether you're celebrating a personal milestone,
            organizing a corporate event, planning a wedding,
            or looking for festive gifts, we have something
            special for everyone.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="
          mt-5
          flex
          flex-wrap
          items-center
          gap-4
        "
          >
            <a
              href="#categories"
              className="
            flex items-center justify-center gap-3
            bg-[#d4af37]
            hover:bg-[#c5a02e]
            text-[#410d1c]
            px-8 py-3.5
            rounded-[4px]
            font-bold
            text-[11px]
            tracking-wider
            transition-colors
          "
            >
              EXPLORE GIFTS
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/919790666769"
              target="_blank"
              rel="noopener noreferrer"
              className="
            flex items-center justify-center gap-3
            border border-[#d4af37]
            text-[#d4af37]
            hover:bg-[#d4af37]/10
            px-8 py-3.5
            rounded-[4px]
            font-bold
            text-[11px]
            tracking-wider
            transition-colors
          "
            >
              <Gift className="w-4 h-4" />
              CREATE YOUR GIFT BOX
            </a>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="
          mt-6
          flex
          flex-wrap
          items-center
          gap-x-6
          gap-y-4
        "
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#d4af37]" />
              <span className="text-[11px] text-white/90 leading-snug">
                Premium
                <br />
                Quality
              </span>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/15" />

            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-[#d4af37]" />
              <span className="text-[11px] text-white/90 leading-snug">
                Personalized
                <br />
                Gifts
              </span>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/15" />

            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#d4af37]" />
              <span className="text-[11px] text-white/90 leading-snug">
                Doorstep
                <br />
                Delivery
              </span>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/15" />

            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-[#d4af37]" />
              <span className="text-[11px] text-white/90 leading-snug">
                Made
                <br />
                With Love
              </span>
            </div>
          </motion.div>

          {/* Delivery Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="
          mt-6
          inline-flex
          items-center
          gap-4

          bg-[#2a0812]/50
          border border-white/10

          rounded-full
          p-2
          pr-6

          backdrop-blur-sm

          w-fit
        "
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                alt="India"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <p className="text-[#d4af37] text-[10px] font-bold tracking-widest">
                DELIVERED ACROSS INDIA
              </p>

              <p className="text-white/70 text-[10px] mt-1">
                Proudly serving 1000+ cities and towns
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="
        flex-1
        w-full

        flex
        justify-center
        lg:justify-end
        items-center
      "
        >
          <div className="absolute inset-0 bg-[#d4af37]/5 rounded-full blur-3xl " />

          <img
            src="/luxury-gift-box.png"
            alt="Luxury Gift Box"
            className="
          relative
          z-10
      
          max-w-[470px]
          object-contain
        "
          />
        </motion.div>
      </div>
    </section>


  )
}

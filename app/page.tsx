import { Loader } from "@/components/loader"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { WhatWeOffer } from "@/components/what-we-offer"
import { Categories } from "@/components/categories"
import { WhyChoose } from "@/components/why-choose"
import { GiftsUnwrapping } from "@/components/gifts-unwrapping"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <WhatWeOffer />
        <Categories />
        <WhyChoose />
        <GiftsUnwrapping />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}


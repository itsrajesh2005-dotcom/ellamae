import { Loader } from "@/components/loader"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { AboutUs } from "@/components/about-us"
import  FeaturedProducts from "@/components/featured-products";

import { WhyChoose } from "@/components/why-choose"
import { HowItWorks } from "@/components/how-it-works"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <FeaturedProducts/>
        <WhyChoose />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

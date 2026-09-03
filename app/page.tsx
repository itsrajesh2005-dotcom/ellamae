import { Loader } from "@/components/loader"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { ProductSection } from "@/components/ProductSection" 
import { WhyChoose } from "@/components/why-choose"
import { HowItWorks } from "@/components/how-it-works"
import { AboutUs } from "@/components/about-us"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <main>
        <Hero />
        {/* Static featured products-ku badhula ippo backend data oda dynamic product section work aagum */}
        <ProductSection />
        <WhyChoose />
        <HowItWorks />
        <AboutUs />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
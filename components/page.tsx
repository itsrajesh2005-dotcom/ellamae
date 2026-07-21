import { Loader } from "@/components/loader"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { AboutUs } from "@/components/about-us"
// import { Categories } from "@/components/categories" // kept for reference
import { CategoriesMosaic } from "@/components/categories-mosaic"
import { FeaturedCollections } from "@/components/featured-collections"
import { WhyChoose } from "@/components/why-choose"
import { HowItWorks } from "@/components/how-it-works"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <CategoriesMosaic />
        <FeaturedCollections />
        <WhyChoose />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

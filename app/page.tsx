import { Loader } from "@/components/loader"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { AboutUs } from "@/components/about-us"
import { Categories } from "@/components/categories"
import { FeaturedCollections } from "@/components/featured-collections"
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
        <Categories />
        <FeaturedCollections />
        <WhyChoose />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

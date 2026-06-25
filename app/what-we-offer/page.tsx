import { Loader } from "@/components/loader"
import { Navbar } from "@/components/navbar"
import { WhatWeOffer } from "@/components/what-we-offer"
import { Footer } from "@/components/footer"

export default function WhatWeOfferPage() {
  return (
    <>
      <Loader />
      <Navbar />
      <main className="pt-20 bg-background">
        <WhatWeOffer />
      </main>
      <Footer />
    </>
  )
}

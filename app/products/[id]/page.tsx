import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetailClient } from "@/components/ProductDetailClient"
import { products } from "@/data/products"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = products.find((item) => item.id.toString() === id)

  if (!product) return { title: "Product Not Found — ELLAMAE" }

  return {
    title: `${product.name} — ELLAMAE Luxury Gifts`,
    description: product.description,
  }
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id.toString() }))
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = products.find((item) => item.id.toString() === id)

  if (!product) notFound()

  return (
    <>
      <Navbar variant="hero" />
      <main className="bg-white">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </>
  )
}

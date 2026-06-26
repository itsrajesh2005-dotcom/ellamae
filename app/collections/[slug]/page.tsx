import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionPageClient } from "@/components/CollectionPageClient"
import { getCategoryBySlug } from "@/data/categories"
import { products, SLUG_CATEGORY } from "@/data/products"

interface Props {
  params: Promise<{ slug: string }>
}

// ── Dynamic SEO metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return { title: "Collection Not Found — ELLAMAE" }
  return {
    title: `${category.name} — ELLAMAE Luxury Gifts`,
    description: category.description,
    openGraph: {
      title: `${category.name} — ELLAMAE`,
      description: category.subtitle,
      images: [{ url: category.banner, width: 1600, height: 900, alt: category.name }],
    },
  }
}

// ── Static params for pre-rendering ──────────────────────────────────────────
export function generateStaticParams() {
  return [
    { slug: "birthday-gifts" },
    { slug: "anniversary-gifts" },
    { slug: "wedding-gifts" },
    { slug: "corporate-gifts" },
    { slug: "personalized-gifts" },
    { slug: "home-lifestyle" },
    { slug: "utility-products" },
    { slug: "car-accessories" },
    { slug: "festive-gift-hampers" },
  ]
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  // Resolve products for this category.
  // "festive-gift-hampers" shows products from both "Gift Hampers" and "Festive Gift Hampers".
  // "utility-products" has no products → shows empty state.
  let categoryName = SLUG_CATEGORY[slug] ?? null

  const categoryProducts =
    slug === "festive-gift-hampers"
      ? products.filter((p) => p.category === "Gift Hampers" || p.category === "Festive Gift Hampers")
      : categoryName
        ? products.filter((p) => p.category === categoryName)
        : [] // utility-products → empty state

  return (
    <>
      <Navbar variant="hero" />
      <main>
        <CollectionPageClient category={category} initialProducts={categoryProducts} />
      </main>
      <Footer />
    </>
  )
}

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchCategories, fetchBrands } from "@/lib/phpApi"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `${categoryName} Collections — ELLAMAE Luxury`,
    description: `Explore exclusive brands under ${categoryName}`,
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  
  // 1. Fetch active categories from PHP backend
  const catRows = await fetchCategories("Active")
  const category = catRows.find((c: any) => slugify(c.name) === slug)

  if (!category) {
    notFound()
  }

  // 2. Fetch all active brands from PHP backend (brands comes in every categories)
  const brands = await fetchBrands("Active")

  return (
    <>
      <Navbar variant="hero" />
      <main className="bg-neutral-50 min-h-screen">
        {/* Category Hero Banner */}
        <div className="relative h-[45vh] min-h-[350px] w-full overflow-hidden">
          <img
            src={category.banner_image || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1200&auto=format&fit=crop"}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6 lg:px-10 max-w-7xl mx-auto w-full">
            <span className="text-xs font-semibold tracking-[0.4em] text-amber-500 uppercase mb-2">
              Shop by Occasion
            </span>
            <h1 className="font-serif text-4xl font-medium text-white sm:text-6xl">
              {category.name}
            </h1>
            <p className="mt-4 text-base text-neutral-300 leading-relaxed max-w-2xl">
              {category.description || "Indulge in our curated luxury brands."}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 sm:py-24">
          {brands.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-neutral-100">
              <p className="text-neutral-500 font-medium font-serif text-xl">
                No brands found under this category yet.
              </p>
              <p className="text-neutral-400 mt-2 text-sm">
                Check back soon or contact support for customized curation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brands.map((brand: any) => {
                const brandSlug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return (
                  <Link
                    key={brand.id}
                    href={`/brands/${brandSlug}?category=${slug}`}
                    className="group relative flex flex-col h-[400px] overflow-hidden rounded-2xl bg-white shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="relative w-full h-[240px] overflow-hidden bg-neutral-100">
                      <img
                        src={brand.banner_image || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600"}
                        alt={brand.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {/* Content */}
                    <div className="flex flex-col flex-1 p-6 justify-between">
                      <div>
                        <h2 className="font-serif text-2xl font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
                          {brand.name}
                        </h2>
                        <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
                          {brand.description || "Curated collection under our premium brand."}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm">
                        <span>Explore Brand</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

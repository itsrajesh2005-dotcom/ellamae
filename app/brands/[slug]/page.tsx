import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionPageClient } from "@/components/CollectionPageClient"
import { fetchBrands, fetchCategories, fetchProducts } from "@/lib/phpApi"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brandName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `${brandName} Collection — ELLAMAE Luxury`,
    description: `Explore exclusive products under ${brandName}`,
  }
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;
  const categorySlug = typeof sParams.category === "string" ? sParams.category : undefined;

  // 1. Fetch active brands from PHP backend
  const brands = await fetchBrands("Active")
  const brand = brands.find((b: any) => slugify(b.name) === slug);

  if (!brand) {
    notFound();
  }

  // 2. Fetch category details from PHP backend if categorySlug is present
  let categoryId: number | undefined = undefined;
  if (categorySlug) {
    const categories = await fetchCategories("Active");
    const matchedCat = categories.find((c: any) => slugify(c.name) === categorySlug);
    if (matchedCat) {
      categoryId = matchedCat.id;
    }
  }

  // 3. Fetch products under this brand (filtered by category if provided)
  const productRows = await fetchProducts({
    brand_id: brand.id,
    category_id: categoryId,
    status: 'Active'
  });

  const productsMap: Record<number, any> = {}
  for (const row of productRows) {
    const productId = row.id
    if (!productsMap[productId]) {
      productsMap[productId] = {
        id: row.id.toString(),
        name: row.title,
        price: parseFloat(row.price || "0"),
        stacks: parseInt(row.stacks || "0", 10),
        description: row.description,
        image: "",
        images: [],
        category: brand.name,
        status: row.status
      }
    }

    // Process image path mapping
    const rawImages = Array.isArray(row.images) ? row.images : [row.image_path].filter(Boolean);
    for (const img of rawImages) {
      if (img && !productsMap[productId].images.includes(img)) {
        productsMap[productId].images.push(img);
        if (!productsMap[productId].image) {
          productsMap[productId].image = img;
        }
      }
    }
  }

  const brandProducts = Object.values(productsMap)

  const brandCategoryAdaptor = {
    slug: slug,
    name: brand.name,
    subtitle: brand.description || "Explore our collection",
    banner: brand.banner_image || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1200&auto=format&fit=crop",
    description: brand.description || "Explore our curated collection",
    accent: "from-stone-900/60 to-card/0",
  }

  return (
    <>
      <Navbar variant="hero" />
      <main>
        <CollectionPageClient category={brandCategoryAdaptor} initialProducts={brandProducts} />
      </main>
      <Footer />
    </>
  )
}

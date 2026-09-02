import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetailClient } from "@/components/ProductDetailClient"
import { products } from "@/data/products"
import { fetchProductDetail } from "@/lib/phpApi"

interface Props {
  params: Promise<{ id: string }>
}

// Ensure dynamic fetching for XAMPP database items
export const dynamic = "force-dynamic"
export const revalidate = 0

async function getProductFromDb(id: string) {
  if (!id) return null
  const cleanId = id.replace(/^ELLAMAE/i, "")
  
  try {
    const data = await fetchProductDetail(cleanId)

    if (data && (data.id || data.status !== "error")) {
      // Safely extract images matching PHP backend keys (data.images or data.image)
      const rawImages = Array.isArray(data.images) && data.images.length > 0 
        ? data.images 
        : [data.image, data.image_path].filter(Boolean)

      const images = rawImages.filter((img: any) => typeof img === "string" && img.trim() !== "")
      const primaryImg = images.length > 0 ? images[0] : "/placeholder.svg"
      
      return {
        id: (data.id || cleanId).toString(),
        name: data.title || data.name || data.product_title || `Product #${cleanId}`,
        price: typeof data.price === "number" ? data.price : parseFloat(data.price || "0"),
        stacks: typeof data.stacks === "number" ? data.stacks : parseInt(data.stacks || "0", 10),
        description: data.description || data.description_specifications || "",
        category: data.category_name || data.category || "Gifts",
        image: primaryImg,
        galleryImages: images.length > 0 ? images : ["/placeholder.svg"],
        status: data.status || "Active",
      }
    }
  } catch (err) {
    console.warn("PHP Backend fetch bypassed or failed, falling back to static products:", err)
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  let product: any = await getProductFromDb(id)

  if (!product) {
    const cleanId = id.replace(/^ELLAMAE/i, "")
    const staticProd = products.find((item) => item.id.toString() === cleanId || item.id.toString() === id)
    if (staticProd) {
      product = {
        id: staticProd.id.toString(),
        name: staticProd.name,
        price: staticProd.price,
        stacks: 0,
        description: staticProd.description,
        category: staticProd.category,
        image: staticProd.image,
        galleryImages: staticProd.galleryImages || [staticProd.image],
        status: staticProd.status || "Active",
      }
    }
  }

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

  let product: any = await getProductFromDb(id)

  // Fallback to static product list
  if (!product) {
    const cleanId = id.replace(/^ELLAMAE/i, "")
    const staticProd = products.find((item) => item.id.toString() === cleanId || item.id.toString() === id)
    if (staticProd) {
      product = {
        id: staticProd.id.toString(),
        name: staticProd.name,
        price: staticProd.price,
        stacks: 0,
        description: staticProd.description,
        category: staticProd.category,
        image: staticProd.image,
        galleryImages: staticProd.galleryImages || [staticProd.image],
        status: staticProd.status || "Active",
      }
    }
  }

  if (!product) notFound()

  return (
    <>
      <Navbar variant="light" />
      <main className="bg-white">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </>
  )
}
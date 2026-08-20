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

async function getProductFromDb(id: string) {
  const cleanId = id.replace(/^ELLAMAE/i, "")
  try {
    const data = await fetchProductDetail(cleanId)

    if (data && data.id) {
      const rawImages = Array.isArray(data.images) ? data.images : [data.image_path].filter(Boolean)
      const images = rawImages.filter(Boolean)
      const primaryImg = images.length > 0 ? images[0] : ""
      
      return {
        id: data.id.toString(),
        name: data.title || data.name || data.product_title || "",
        price: parseFloat(data.price || "0"),
        stacks: parseInt(data.stacks || "0", 10),
        description: data.description || data.description_specifications || "",
        category: data.category_name || data.category || "Gifts",
        image: primaryImg,
        galleryImages: images,
        status: data.status || "Active",
      }
    }
  } catch (err) {
    console.error("Failed to query product from PHP backend:", err)
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

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

  let product: any = null
  const cleanId = id.replace(/^ELLAMAE/i, "")

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    let res = await fetch(
      `http://localhost:3000/api/gifts?status=all&search=${encodeURIComponent(id)}`,
      { cache: "no-store", signal: controller.signal }
    ).catch(() => null)
    
    if (!res || !res.ok) {
      res = await fetch(
        `http://localhost/luxury-backend/manage-gifts.php?status=all&search=${encodeURIComponent(id)}`,
        { cache: "no-store", signal: controller.signal }
      ).catch(() => null)
    }
    clearTimeout(timeoutId)

    if (res && res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const match = data.find((g: any) => g.id.toString() === cleanId || g.display_id === id) || data[0]
        if (match) {
          const primaryImg = (() => {
            if (Array.isArray(match.images) && match.images.length > 0 && match.images[0]) return match.images[0];
            if (typeof match.images === 'string' && match.images.trim().startsWith('[')) {
              try { const p = JSON.parse(match.images); if (Array.isArray(p) && p[0]) return p[0]; } catch (e) {}
            }
            if (typeof match.images === 'string' && match.images.length > 0) return match.images;
            if (typeof match.image === 'string' && match.image.length > 0) return match.image;
            if (typeof match.image_path === 'string' && match.image_path.length > 0) return match.image_path;
            return "";
          })();

          product = {
            id: match.id.toString(),
            name: match.title,
            price: parseFloat(match.price || "0"),
            stacks: parseInt(match.stacks || "0", 10),
            description: match.description,
            category: match.category_name || match.category || "Gifts",
            image: primaryImg,
            galleryImages: match.images || (primaryImg ? [primaryImg] : []),
            status: match.status,
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch product from backend:", err)
  }

  // Fallback to static product list
  if (!product) {
    product = products.find((item) => item.id.toString() === cleanId || item.id.toString() === id)
  }

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

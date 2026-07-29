import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetailClient } from "@/components/ProductDetailClient"
import { products } from "@/data/products"
import { getDbConnection, initializeDatabase } from "@/lib/db"

interface Props {
  params: Promise<{ id: string }>
}

async function getProductFromDb(id: string) {
  const cleanId = id.replace(/^ELLAMAE/i, "")
  try {
    await initializeDatabase()
    const db = await getDbConnection()
    
    const [rows]: any = await db.query(`
      SELECT p.*, c.name as category_name, pi.image_path AS rel_image_path
      FROM products p 
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id 
      WHERE p.id = ? OR p.id = ?
    `, [cleanId, id])

    if (rows.length > 0) {
      const match = rows[0]
      const images: string[] = []
      
      if (match.image_path) {
        images.push(match.image_path)
      }
      
      for (const row of rows) {
        if (row.rel_image_path && !images.includes(row.rel_image_path)) {
          images.push(row.rel_image_path)
        }
      }
      
      const primaryImg = images.length > 0 ? images[0] : ""
      
      return {
        id: match.id.toString(),
        name: match.title,
        price: parseFloat(match.price || "0"),
        stacks: parseInt(match.stacks || "0", 10),
        description: match.description || "",
        category: match.category_name || "Gifts",
        image: primaryImg,
        galleryImages: images,
        status: match.status,
      }
    }
  } catch (err) {
    console.error("Failed to query product from database:", err)
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  let product = await getProductFromDb(id)

  if (!product) {
    const cleanId = id.replace(/^ELLAMAE/i, "")
    product = products.find((item) => item.id.toString() === cleanId || item.id.toString() === id)
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

  let product = await getProductFromDb(id)

  // Fallback to static product list
  if (!product) {
    const cleanId = id.replace(/^ELLAMAE/i, "")
    product = products.find((item) => item.id.toString() === cleanId || item.id.toString() === id)
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

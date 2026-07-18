import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionPageClient } from "@/components/CollectionPageClient"
import { getCategoryBySlug } from "@/data/categories"
import { products, SLUG_CATEGORY } from "@/data/products"
import { getDbConnection, initializeDatabase } from "@/lib/db"

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

  let categoryProducts: any[] = []
  let isDbDataUsed = false

  try {
    await initializeDatabase()
    const db = await getDbConnection()

    // Fetch active category info from database
    const [catRows]: any = await db.query(
      "SELECT * FROM category WHERE status = 'Active' AND name = ?",
      [categoryName]
    )

    if (catRows.length > 0) {
      const dbCat = catRows[0]
      
      // Override details if customized in database
      if (dbCat.description) {
        category.description = dbCat.description
      }
      if (dbCat.banner_image) {
        category.banner = dbCat.banner_image
      }

      // Query active gifts associated with this category
      let giftQuery = `
        SELECT g.*, gi.image_path 
        FROM gifts g 
        LEFT JOIN gift_images gi ON g.id = gi.gift_id 
        WHERE g.status = 'Active' AND g.category_id = ?
      `;
      let giftParams = [dbCat.id];

      if (slug === "festive-gift-hampers") {
        const [hampersCat]: any = await db.query(
          "SELECT id FROM category WHERE name = 'Gift Hampers' AND status = 'Active'"
        )
        if (hampersCat.length > 0) {
          giftQuery = `
            SELECT g.*, gi.image_path 
            FROM gifts g 
            LEFT JOIN gift_images gi ON g.id = gi.gift_id 
            WHERE g.status = 'Active' AND (g.category_id = ? OR g.category_id = ?)
          `;
          giftParams = [dbCat.id, hampersCat[0].id];
        }
      }

      const [giftRows]: any = await db.query(giftQuery, giftParams)

      const giftsMap: Record<number, any> = {}
      for (const row of giftRows) {
        const giftId = row.id
        if (!giftsMap[giftId]) {
          giftsMap[giftId] = {
            id: row.id.toString(),
            name: row.title,
            price: parseFloat(row.price || "0"),
            stacks: parseInt(row.stacks || "0", 10),
            description: row.description,
            image: "",
            images: [],
            category: categoryName,
            status: row.status
          }
        }
        if (row.image_path) {
          giftsMap[giftId].images.push(row.image_path)
          if (!giftsMap[giftId].image) {
            giftsMap[giftId].image = row.image_path
          }
        }
      }
      categoryProducts = Object.values(giftsMap)
      isDbDataUsed = true
    }
  } catch (err) {
    console.error("Database query failed in CollectionPage, falling back to static files:", err)
  }

  // Static fallback if DB lacks this category or contains no products
  if (!isDbDataUsed || categoryProducts.length === 0) {
    categoryProducts = (slug === "festive-gift-hampers"
      ? products.filter((p) => p.category === "Gift Hampers" || p.category === "Festive Gift Hampers")
      : categoryName
        ? products.filter((p) => p.category === categoryName)
        : []
    )
  }

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

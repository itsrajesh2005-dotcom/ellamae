import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionPageClient } from "@/components/CollectionPageClient"
import { getDbConnection, initializeDatabase } from "@/lib/db"

interface Props {
  params: Promise<{ slug: string }>
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

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  
  await initializeDatabase();
  const db = await getDbConnection();
  
  // 1. Fetch the active brand details
  const [brands]: any = await db.query("SELECT * FROM brands WHERE status = 'Active'");
  const brand = brands.find((b: any) => slugify(b.name) === slug);
  
  if (!brand) {
    notFound();
  }
  
  // 2. Fetch products under this brand
  const [productRows]: any = await db.query(
    `SELECT p.*, pi.image_path 
     FROM products p 
     LEFT JOIN product_images pi ON p.id = pi.product_id 
     WHERE p.status = 'Active' AND p.brand_id = ?
     ORDER BY p.id DESC, pi.id ASC`,
    [brand.id]
  );
  
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
    if (row.image_path) {
      productsMap[productId].images.push(row.image_path)
      if (!productsMap[productId].image) {
        productsMap[productId].image = row.image_path
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

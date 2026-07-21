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
  let category: any = getCategoryBySlug(slug)

  let categoryName = SLUG_CATEGORY[slug] ?? null
  let categoryProducts: any[] = []
  let isDbDataUsed = false

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    let catRes = await fetch("http://localhost:3000/api/categories?status=Active", { cache: "no-store", signal: controller.signal }).catch(() => null);
    if (!catRes || !catRes.ok) {
      catRes = await fetch("http://localhost/luxury-backend/manage-categories.php?status=Active", { cache: "no-store", signal: controller.signal }).catch(() => null);
    }
    clearTimeout(timeoutId)

    if (catRes && catRes.ok) {
      const catRows = await catRes.json()

      if (Array.isArray(catRows)) {
        // Match category by slug or name
        const dbCat = catRows.find((c: any) => {
          const catSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return catSlug === slug || c.name === categoryName || c.name.toLowerCase() === slug.replace(/-/g, " ");
        });

        if (dbCat) {
          categoryName = dbCat.name;
          if (!category) {
            category = {
              slug: slug,
              name: dbCat.name,
              subtitle: "Curated luxury gift selection",
              banner: dbCat.banner_image || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1600&auto=format&fit=crop&q=80",
              description: dbCat.description || "Thoughtfully curated luxury gifts.",
              accent: "from-rose-900/60 to-card/0",
            };
          } else {
            if (dbCat.description) category.description = dbCat.description
            if (dbCat.banner_image) category.banner = dbCat.banner_image
          }

          const giftController = new AbortController()
          const giftTimeoutId = setTimeout(() => giftController.abort(), 2000)

          let giftsRes = await fetch(`http://localhost:3000/api/gifts?status=Active&category_id=${dbCat.id}`, { cache: "no-store", signal: giftController.signal }).catch(() => null);
          if (!giftsRes || !giftsRes.ok) {
            giftsRes = await fetch(`http://localhost/luxury-backend/manage-gifts.php?status=Active&category_id=${dbCat.id}`, { cache: "no-store", signal: giftController.signal }).catch(() => null);
          }
          clearTimeout(giftTimeoutId)

          if (giftsRes && giftsRes.ok) {
            const fetchedGifts = await giftsRes.json()
            let allGifts = Array.isArray(fetchedGifts) ? fetchedGifts : []

            categoryProducts = allGifts.map((g: any) => {
              const primaryImg = (() => {
                if (Array.isArray(g.images) && g.images.length > 0 && g.images[0]) return g.images[0];
                if (typeof g.images === 'string' && g.images.trim().startsWith('[')) {
                  try { const p = JSON.parse(g.images); if (Array.isArray(p) && p[0]) return p[0]; } catch (e) {}
                }
                if (typeof g.images === 'string' && g.images.length > 0) return g.images;
                if (typeof g.image === 'string' && g.image.length > 0) return g.image;
                if (typeof g.image_path === 'string' && g.image_path.length > 0) return g.image_path;
                return "";
              })();

              return {
                id: g.id.toString(),
                name: g.title,
                price: parseFloat(g.price || "0"),
                stacks: parseInt(g.stacks || "0", 10),
                description: g.description,
                image: primaryImg,
                images: g.images || (primaryImg ? [primaryImg] : []),
                category: categoryName,
                status: g.status,
              };
            });
            isDbDataUsed = true
          }
        }
      }
    }
  } catch (err) {
    console.error("Backend query failed in CollectionPage:", err)
  }

  if (!category) notFound()

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

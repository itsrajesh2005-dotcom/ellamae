"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number | string;
  title: string;
  price: number | string;
  images: string[];
  category_id?: string;
  brand_id?: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndShuffleProducts() {
      try {
        // Multi-url fallback (Handles both /ellamae/ and root XAMPP paths)
        const urls = [
          "http://localhost/ellamae/luxury-backend/manage-products.php",
          "http://localhost/luxury-backend/manage-products.php",
          "/api/products"
        ];

        let rawData: any = null;

        for (const url of urls) {
          try {
            const res = await fetch(url, { method: "GET" });
            if (res.ok) {
              rawData = await res.json();
              break; // Success-a fetch aayitta loop break panni kalathula irangidum
            }
          } catch (e) {
            // Ignore single fetch error and try next URL
          }
        }

        if (rawData) {
          let rawProducts: Product[] = [];

          if (Array.isArray(rawData)) {
            rawProducts = rawData;
          } else if (rawData && Array.isArray(rawData.data)) {
            rawProducts = rawData.data;
          }

          if (rawProducts.length > 0) {
            // 1. Sort by ID descending (Latest products first)
            rawProducts.sort((a, b) => Number(b.id) - Number(a.id));

            // 2. Shuffle / Alternate logic on page refresh (Keep top 3 latest, shuffle rest)
            if (rawProducts.length > 3) {
              const topLatest = rawProducts.slice(0, 3);
              const remaining = rawProducts.slice(3);

              for (let i = remaining.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
              }

              rawProducts = [...topLatest, ...remaining];
            }

            setProducts(rawProducts.slice(0, 8)); // Top 8 items
          }
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAndShuffleProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-amber-200/60 font-serif">
        Loading Featured Products...
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-[#2A0812]/90 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-amber-400/80 mb-2 font-serif">
            POPULAR GIFTS
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-amber-100 font-normal">
            Explore Our <span className="italic text-amber-300">Featured Products</span>
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            let parsedImages: string[] = [];
            if (Array.isArray(product.images)) {
              parsedImages = product.images;
            } else if (typeof product.images === "string") {
              try {
                parsedImages = JSON.parse(product.images);
              } catch {
                parsedImages = [product.images];
              }
            }

            const mainImg = parsedImages[0] || "/placeholder.png";

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative rounded-xl overflow-hidden bg-black/40 border border-amber-500/20 hover:border-amber-400/60 transition-all duration-300 shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-square relative w-full overflow-hidden">
                  <Image
                    src={mainImg}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={mainImg.startsWith("data:")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm font-medium text-amber-100 truncate group-hover:text-amber-300 transition-colors">
                    {product.title}
                  </h3>
                  {product.price && (
                    <p className="text-xs font-semibold text-amber-400 mt-1">
                      ₹{product.price}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
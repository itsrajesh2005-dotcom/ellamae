import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';

interface Product {
  id: number;
  title?: string;
  name?: string;
  product_title?: string;
  price: number;
  image?: string;
  images?: string[];
  category_name?: string;
  category_id?: number;
}

interface Category {
  id: number;
  name: string;
}

// 1. Categories Fetch Function Update
async function getCategories(): Promise<Category[]> {
  try {
    // 💥 Updated to 'manage-categories.php'
    const res = await fetch('http://localhost/luxury-backend/manage-categories.php', {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.categories)) return data.categories;
    if (Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// 2. Products Fetch Function Update
async function getProducts(): Promise<Product[]> {
  try {
    // 💥 Updated to 'manage-products.php' (Alladhu 'manage-gifts.php' use pannanum na adha thanga)
    const res = await fetch('http://localhost/luxury-backend/manage-products.php', {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function ProductsListPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const hasCategories = categories.length > 0;
  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-[white] text-black/90 dark:bg-[#0f0f0f] dark:text-white/90 transition-colors duration-300">
      <Navbar variant="dark" />

      <main className="max-w-7xl mx-auto py-28 px-6 lg:px-10 space-y-16">
        <header className="text-center space-y-4">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-wide text-[#d4af37]">
            Our Exclusive Collections
          </h1>
          <p className="text-black/70 max-w-2xl mx-auto text-sm sm:text-base">
            Explore all our luxury gift items categorized just for you.
          </p>
        </header>

        {hasCategories ? (
          categories.map((cat) => {
            const categoryProducts = products.filter(
              (p) =>
                (p.category_name && p.category_name.toLowerCase() === cat.name.toLowerCase()) ||
                p.category_id === cat.id
            );

            if (categoryProducts.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
                  <h2 className="font-serif text-2xl font-semibold text-[#d4af37] tracking-wider">
                    {cat.name}
                  </h2>
                  <span className="text-xs text-black/60 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {categoryProducts.length} Items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => {
                    const title =
                      product.title || product.name || product.product_title || `Product #${product.id}`;
                    
                    const mainImg =
                      product.image ||
                      (product.images && product.images[0]) ||
                      '/placeholder.svg';

                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#d4af37]/50 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="aspect-square w-full overflow-hidden bg-black/20 relative">
                          <img
                            src={mainImg}
                            alt={title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <h3 className="font-medium text-black/90 group-hover:text-[#d4af37] transition-colors line-clamp-1">
                            {title}
                          </h3>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-lg font-bold text-[#d4af37]">
                              ₹{product.price}
                            </span>
                            <span className="text-xs text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-xl border border-[#d4af37]/20 font-medium">
                              View Details
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        ) : hasProducts ? (
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#d4af37]">All Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const title = product.title || product.name || product.product_title || `Product #${product.id}`;
                const mainImg = product.image || (product.images && product.images[0]) || '/placeholder.svg';
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#d4af37]/50 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-black/20 relative">
                      <img src={mainImg} alt={title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <h3 className="font-medium text-black/90 group-hover:text-[#d4af37] transition-colors line-clamp-1">{title}</h3>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-lg font-bold text-[#d4af37]">₹{product.price}</span>
                        <span className="text-xs text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-xl border border-[#d4af37]/20 font-medium">View Details</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-20 text-black/50 bg-white/5 rounded-3xl border border-white/10">
            No categories or products found in Database.
          </div>
        )}
      </main>
    </div>
  );
}
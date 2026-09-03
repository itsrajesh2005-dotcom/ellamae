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
    <div className="min-h-screen bg-[#fcfbf7] text-black/80 transition-colors duration-300">
      <Navbar variant="hero" />

      <main className="max-w-7xl mx-auto py-28 px-6 lg:px-4 space-y-16">

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
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                  <h2 className="font-serif text-2xl font-medium text-amber-900 tracking-wide">
                    {cat.name}
                  </h2>
                  <span className="text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
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

                    const whatsappMessage = `Hi, I am interested in ${title}. Can you share more details?`;
                    const whatsappLink = `https://wa.me/919790666769?text=${encodeURIComponent(whatsappMessage)}`;

                    return (
                      <div
                        key={product.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-stone-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(180,140,90,0.15)] hover:border-amber-400/40 w-full max-w-[280px] h-[360px] mx-auto"
                      >
                        <Link href={`/products/${product.id}`} className="block flex-1 overflow-hidden">
                          <div>
                            <div className="relative h-[230px] w-full overflow-hidden rounded-[22px] bg-[#f8f6f0]">
                              <img
                                src={mainImg}
                                alt={title}
                                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              />
                              <div className="absolute top-4 left-4 z-10">
                                <span className="rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-[10px] font-bold tracking-wider text-amber-800 border border-amber-200/60 uppercase shadow-sm">
                                  {cat.name.replace(" Gifts", "").replace(" & Lifestyle", "")}
                                </span>
                              </div>
                            </div>

                            <div className="px-4 pt-3 pb-1">
                              <h3 className="font-serif text-base font-medium leading-snug tracking-wide text-amber-900 transition-colors duration-300 group-hover:text-amber-600 line-clamp-2">
                                {title}
                              </h3>
                            </div>
                          </div>
                        </Link>

                        <div className="p-4 pt-0">
                          <div className="flex items-center justify-between border-t border-stone-100 pt-3 gap-3">
                            <div className="flex flex-col shrink-0">
                              <span className="text-[10px] tracking-[0.2em] text-stone-400 font-semibold uppercase">Price</span>
                              <span className="text-lg font-bold text-stone-900 tracking-tight">₹{product.price}</span>
                            </div>

                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Enquire about ${title} on WhatsApp`}
                              className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-white shadow-[0_4px_15px_rgba(217,119,6,0.25)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(217,119,6,0.4)] active:scale-95"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              <span>Enquire</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        ) : hasProducts ? (
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-medium text-amber-900 tracking-wide">All Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const title = product.title || product.name || product.product_title || `Product #${product.id}`;
                const mainImg = product.image || (product.images && product.images[0]) || '/placeholder.svg';
                const whatsappMessage = `Hi, I am interested in ${title}. Can you share more details?`;
                const whatsappLink = `https://wa.me/919790666769?text=${encodeURIComponent(whatsappMessage)}`;

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[30px] border border-stone-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(180,140,90,0.15)] hover:border-amber-400/40 w-full max-w-[280px] h-[360px] mx-auto"
                  >
                    <Link href={`/products/${product.id}`} className="block flex-1 overflow-hidden">
                      <div>
                        <div className="relative h-[230px] w-full overflow-hidden rounded-[22px] bg-[#f8f6f0]">
                          <img
                            src={mainImg}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        </div>

                        <div className="px-4 pt-3 pb-1">
                          <h3 className="font-serif text-base font-medium leading-snug tracking-wide text-amber-900 transition-colors duration-300 group-hover:text-amber-600 line-clamp-2">
                            {title}
                          </h3>
                        </div>
                      </div>
                    </Link>

                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between border-t border-stone-100 pt-3 gap-3">
                        <div className="flex flex-col shrink-0">
                          <span className="text-[10px] tracking-[0.2em] text-stone-400 font-semibold uppercase">Price</span>
                          <span className="text-lg font-bold text-stone-900 tracking-tight">₹{product.price}</span>
                        </div>

                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Enquire about ${title} on WhatsApp`}
                          className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-white shadow-[0_4px_15px_rgba(217,119,6,0.25)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(217,119,6,0.4)] active:scale-95"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          <span>Enquire</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-20 text-stone-500 bg-white rounded-3xl border border-stone-200">
            No categories or products found in Database.
          </div>
        )}
      </main>
    </div>
  );
}
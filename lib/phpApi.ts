import { Category } from './adminApi';

const PHP_BASE_URL = 'http://localhost/luxury-backend';

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function fetchCategories(status = 'Active'): Promise<Category[]> {
  try {
    const url = `${PHP_BASE_URL}/manage-categories.php?status=${status}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`Failed to fetch categories (${res.status})`);
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list.map((item: any) => {
      const banner = item.banner_image ?? item.image ?? '/placeholder.svg';
      return {
        id: Number(item.id),
        name: String(item.name ?? ''),
        description: String(item.description ?? ''),
        status: String(item.status ?? 'Active'),
        banner_image: banner,
        image: banner,
      };
    });
  } catch (error) {
    console.warn("fetchCategories error:", error);
    return [];
  }
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  status?: string;
  banner_image?: string;
  category_id?: number | null;
  category_ids?: number[];
  category_name?: string | null;
}

export async function fetchBrands(status = 'Active', categoryId?: number | string): Promise<Brand[]> {
  try {
    let url = `${PHP_BASE_URL}/manage-brands.php?status=${status}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`Failed to fetch brands (${res.status})`);
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list.map((item: any) => ({
      id: Number(item.id),
      name: String(item.name ?? ''),
      description: item.description,
      status: item.status,
      banner_image: item.banner_image,
      category_id: item.category_id ? Number(item.category_id) : null,
      category_ids: Array.isArray(item.category_ids) ? item.category_ids.map(Number) : [],
      category_name: item.category_name,
    }));
  } catch (error) {
    console.warn("fetchBrands error:", error);
    return [];
  }
}

export interface Product {
  id: string;
  name: string;
  category: string;
  category_slug?: string;
  price: number;
  stacks: number;
  description: string;
  image: string;
  images: string[];
  status: string;
}

export async function fetchProducts(params: {
  status?: string;
  category_id?: number | string;
  brand_id?: number | string;
  search?: string;
} = {}): Promise<any[]> {
  try {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.category_id) query.set('category_id', params.category_id.toString());
    if (params.brand_id) query.set('brand_id', params.brand_id.toString());
    if (params.search) query.set('search', params.search);

    const url = `${PHP_BASE_URL}/manage-products.php?${query.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`Failed to fetch products (${res.status})`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch (error) {
    console.warn("fetchProducts error:", error);
    return [];
  }
}

export async function fetchProductDetail(id: string | number) {
  if (!id) return null;

  try {
    const res = await fetch(`${PHP_BASE_URL}/get_product_detail.php?id=${id}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      console.warn(`PHP Backend returned error (${res.status}): ${errorMsg}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("fetchProductDetail error:", error);
    return null;
  }
}
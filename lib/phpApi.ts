import { Category } from './adminApi';

const getPhpServerBaseUrl = () => {
  if (process.env.PHP_PRODUCTS_API) {
    return process.env.PHP_PRODUCTS_API.substring(0, process.env.PHP_PRODUCTS_API.lastIndexOf('/'));
  }
  if (process.env.NEXT_PUBLIC_PHP_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_PHP_BACKEND_URL.replace(/\/$/, '');
  }
  return 'http://localhost/luxury-backend';
};

const PHP_BASE_URL = getPhpServerBaseUrl();

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function fetchCategories(status = 'Active'): Promise<Category[]> {
  const url = `${PHP_BASE_URL}/manage-categories.php?status=${status}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch categories from PHP backend: ${res.status}`);
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
  let url = `${PHP_BASE_URL}/manage-brands.php?status=${status}`;
  if (categoryId) {
    url += `&category_id=${categoryId}`;
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch brands from PHP backend: ${res.status}`);
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
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.category_id) query.set('category_id', params.category_id.toString());
  if (params.brand_id) query.set('brand_id', params.brand_id.toString());
  if (params.search) query.set('search', params.search);

  const url = `${PHP_BASE_URL}/manage-products.php?${query.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch products from PHP backend: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function fetchProductDetail(id: string | number): Promise<any> {
  const url = `${PHP_BASE_URL}/get_product_detail.php?id=${id}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch product detail from PHP backend: ${res.status}`);
  }
  return await res.json();
}

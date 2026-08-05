// PHP API integration and response normalization. This file intentionally has no UI concerns.
// Resolve backend dynamically: prefer NEXT_PUBLIC_PHP_BACKEND_URL; otherwise derive from window.location
const getPhpBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_PHP_BACKEND_URL) return process.env.NEXT_PUBLIC_PHP_BACKEND_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    // Use same host (hostname only) so requests work when accessed via IP on the local network.
    return `${window.location.protocol}//${window.location.hostname}/luxury-backend`;
  }
  // Server-side without explicit env: leave empty so callers can fall back to Next API proxies instead of hardcoding localhost.
  return '';
};

const PHP_BACKEND_URL = getPhpBackendUrl();

export interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
  banner_image: string;
  image: string;
}

export interface Gift {
  id: number;
  category_id: number;
  title: string;
  price: number;
  stacks: number;
  description: string;
  status: string;
  display_id: string;
  images: string[];
}

export interface ProductDetail {
  id: number;
  name: string;
  category: string;
  category_slug?: string;
  price: number;
  image: string;
  galleryImages: string[];
  description: string;
  details: string[];
  status: 'Active' | 'Inactive';
}

type ApiResult = { status?: string; message?: string; [key: string]: unknown };

const toNumber = (value: unknown, fallback = 0) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
};

export const resolveBackendImageUrl = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return '/placeholder.svg';
  const image = value.trim().replace(/\\/g, '/');
  if (/^(data:|https?:\/\/|blob:)/i.test(image)) return image;

  // PHP may store `uploads/file.jpg`, `/uploads/file.jpg`, or a filename only.
  const path = image.replace(/^\.\//, '').replace(/^\//, '');
  if (!path) return '/placeholder.svg';
  return `${PHP_BACKEND_URL}/${path.includes('/') ? path : `uploads/${path}`}`;
};

const readJson = async <T>(response: Response): Promise<T> => {
  const body = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    throw new Error(`PHP request failed (${response.status}): ${body.slice(0, 200) || response.statusText}`);
  }
  if (!contentType.includes('application/json')) {
    throw new Error(`PHP returned a non-JSON response: ${body.slice(0, 200) || 'empty response'}`);
  }
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`PHP returned invalid JSON: ${body.slice(0, 200) || 'empty response'}`);
  }
};

const requestPhp = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const url = PHP_BACKEND_URL ? `${PHP_BACKEND_URL}/${path}` : null;
  try {
    if (url) {
      return await readJson<T>(await fetch(url, { ...init, headers: { Accept: 'application/json', ...init?.headers } }));
    }
    // If PHP backend URL is not available on the server, trigger fallback logic below.
    throw new Error('PHP backend URL not configured');
  } catch (error) {
    const [basePath, queryString = ''] = path.split('?');
    const fallbackUrl = (() => {
      if (basePath.startsWith('get_product_detail.php')) {
        const productId = new URLSearchParams(queryString).get('id');
        return productId ? `/api/products/${productId}` : '/api/products';
      }
      if (basePath.includes('manage-gifts.php')) {
        return `/api/gifts${queryString ? `?${queryString}` : ''}`;
      }
      if (basePath.includes('manage-categories.php')) {
        return `/api/categories${queryString ? `?${queryString}` : ''}`;
      }
      return null;
    })();

    if (!fallbackUrl) {
      throw error;
    }

    const response = await fetch(fallbackUrl, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.headers || {}) },
    });
    return readJson<T>(response);
  }
};
const normalizeCategory = (item: Record<string, unknown>): Category => {
  const banner = resolveBackendImageUrl(item.banner_image ?? item.image ?? item.image_url ?? item.img_url);
  return {
    id: toNumber(item.id ?? item.cat_id ?? item.category_id),
    name: String(item.name ?? item.category_name ?? item.title ?? ''),
    description: String(item.description ?? ''),
    status: String(item.status ?? 'Active'),
    banner_image: banner,
    image: banner,
  };
};

const normalizeGift = (item: Record<string, unknown>): Gift => {
  const rawImages = Array.isArray(item.images)
    ? item.images
    : [item.image ?? item.image_path ?? item.image_url ?? item.img_url].filter(Boolean);
  return {
    id: toNumber(item.id ?? item.gift_id ?? item.product_id),
    category_id: toNumber(item.category_id ?? item.cat_id),
    title: String(item.title ?? item.name ?? item.gift_name ?? item.product_name ?? ''),
    price: toNumber(item.price ?? item.gift_price ?? item.product_price),
    stacks: toNumber(item.stacks),
    description: String(item.description ?? ''),
    status: String(item.status ?? 'Active'),
    display_id: String(item.display_id ?? `ELLAMAE${toNumber(item.id ?? item.gift_id ?? item.product_id)}`),
    images: rawImages.map(resolveBackendImageUrl).filter(Boolean),
  };
};

const responseList = (data: unknown): unknown[] | null => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.results)) return record.results;
  }
  return null;
};

export const fetchAllCategories = async (search = ''): Promise<Category[]> => {
  const query = new URLSearchParams({ action: 'get_all', status: 'all' });
  if (search.trim()) query.set('search', search.trim());
  const data = await requestPhp<unknown>(`manage-categories.php?${query}`);
  const list = responseList(data);
  if (!list) throw new Error('PHP category response was not a list.');
  return list.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object').map(normalizeCategory);
};

export const fetchAllGifts = async (search = ''): Promise<Gift[]> => {
  const query = new URLSearchParams({ action: 'READ', status: 'all' });
  if (search.trim()) query.set('search', search.trim());
  const data = await requestPhp<unknown>(`manage-gifts.php?${query}`);
  const list = responseList(data);
  if (!list) throw new Error('PHP gift response was not a list.');
  return list.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object').map(normalizeGift);
};

export const fetchProductDetail = async (id: string | number): Promise<ProductDetail> => {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) throw new Error('Invalid product id.');

  const data = await requestPhp<unknown>(`get_product_detail.php?id=${productId}`, { cache: 'no-store' });
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('PHP product response was invalid.');
  const item = data as Record<string, unknown>;
  if (item.status === 'error') throw new Error(String(item.message || 'Product could not be loaded.'));

  const rawImages = Array.isArray(item.images)
    ? item.images
    : [item.image ?? item.image_path ?? item.img_url].filter(Boolean);
  const galleryImages = rawImages.map(resolveBackendImageUrl).filter(Boolean);
  const description = String(item.description_specifications ?? item.description ?? '');
  const rawDetails = Array.isArray(item.specifications) ? item.specifications : [];

  return {
    id: toNumber(item.id ?? item.gift_id ?? item.product_id),
    name: String(item.product_title ?? item.title ?? item.name ?? ''),
    category: String(item.category_name ?? item.category ?? ''),
    category_slug: typeof item.category_slug === 'string' ? item.category_slug : undefined,
    price: toNumber(item.price ?? item.gift_price ?? item.product_price),
    image: galleryImages[0] || '/placeholder.svg',
    galleryImages: galleryImages.length ? galleryImages : ['/placeholder.svg'],
    description,
    details: rawDetails.map((detail) => String(detail)).filter(Boolean),
    status: String(item.status ?? 'Active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
  };
};

export const createCategory = (data: Omit<Category, 'id' | 'image'>) =>
  requestPhp<ApiResult>('manage-categories.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'CREATE', ...data }) });

export const updateCategory = (id: number, data: Omit<Category, 'id' | 'image'>) =>
  requestPhp<ApiResult>('manage-categories.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'UPDATE', id, ...data }) });

export const deleteCategory = (id: number) =>
  requestPhp<ApiResult>('manage-categories.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'DELETE', id }) });

export const createGift = (data: Omit<Gift, 'id' | 'display_id'>) =>
  requestPhp<ApiResult>('manage-gifts.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'CREATE', ...data }) });

export const updateGift = (id: number, data: Omit<Gift, 'id' | 'display_id'>) =>
  requestPhp<ApiResult>('manage-gifts.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'UPDATE', id, ...data }) });

export const deleteGift = (id: number) =>
  requestPhp<ApiResult>('manage-gifts.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'DELETE', id }) });

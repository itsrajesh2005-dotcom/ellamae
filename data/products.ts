export interface Product {
  id: number
  name: string
  category: string
  category_slug?: string
  price: number
  image: string
  description: string
  tag?: string
  galleryImages?: string[]
  details?: string[]
  status?: 'Active' | 'Inactive'
}

export const CATEGORIES = [
  "All",
  "Birthday Gifts",
  "Anniversary Gifts",
  "Wedding Gifts",
  "Corporate Gifts",
  "Personalized Gifts",
  "Home & Lifestyle",
  "Gift Hampers",
]

/** Map category name → URL slug */
export const CATEGORY_SLUG: Record<string, string> = {
  "Birthday Gifts": "birthday-gifts",
  "Anniversary Gifts": "anniversary-gifts",
  "Wedding Gifts": "wedding-gifts",
  "Corporate Gifts": "corporate-gifts",
  "Personalized Gifts": "personalized-gifts",
  "Home & Lifestyle": "home-lifestyle",
  "Gift Hampers": "gift-hampers",
  "Festive Gift Hampers": "festive-gift-hampers",
  "Utility Products": "utility-products",
  "Car Accessories": "car-accessories",
}

/** Map URL slug → category name */
export const SLUG_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG).map(([k, v]) => [v, k])
)

export const products: Product[] = []

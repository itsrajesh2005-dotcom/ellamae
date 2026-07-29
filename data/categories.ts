export interface Category {
  slug: string
  name: string
  subtitle: string
  banner: string
  description: string
  accent: string
}

export const categories: Category[] = []

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

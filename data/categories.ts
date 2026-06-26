export interface Category {
  slug: string
  name: string
  subtitle: string
  banner: string
  description: string
  accent: string
}

export const categories: Category[] = [
  {
    slug: "birthday-gifts",
    name: "Birthday Gifts",
    subtitle: "Celebrate another beautiful year in style.",
    banner:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&auto=format&fit=crop&q=80",
    description:
      "Thoughtfully curated gifts designed to celebrate life's most joyful milestones — from indulgent hampers to bespoke keepsakes that make every birthday unforgettable.",
    accent: "from-rose-900/60 to-card/0",
  },
  {
    slug: "anniversary-gifts",
    name: "Anniversary Gifts",
    subtitle: "Honour love that endures through time.",
    banner:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600&auto=format&fit=crop&q=80",
    description:
      "Mark each cherished year with a gift that speaks the language of enduring love — precious, personal, and worthy of the bond you share.",
    accent: "from-amber-900/60 to-card/0",
  },
  {
    slug: "wedding-gifts",
    name: "Wedding Gifts",
    subtitle: "Begin forever, beautifully.",
    banner:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1600&auto=format&fit=crop&q=80",
    description:
      "Grace a new beginning with gifts that will become heirlooms — exquisitely crafted pieces that celebrate love and set the tone for a lifetime of elegance.",
    accent: "from-stone-900/60 to-card/0",
  },
  {
    slug: "corporate-gifts",
    name: "Corporate Gifts",
    subtitle: "Gratitude, refined.",
    banner:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80",
    description:
      "Make a lasting impression on clients, partners, and teams with premium corporate gifts that reflect your brand's standards of excellence and sophistication.",
    accent: "from-slate-900/60 to-card/0",
  },
  {
    slug: "personalized-gifts",
    name: "Personalized Gifts",
    subtitle: "Made uniquely, unmistakably theirs.",
    banner:
      "https://images.unsplash.com/photo-1627124765135-566b57db453f?w=1600&auto=format&fit=crop&q=80",
    description:
      "A gift becomes a treasure when it carries a name, a date, or a story. Our personalized collection transforms every piece into a one-of-a-kind expression of love.",
    accent: "from-yellow-900/60 to-card/0",
  },
  {
    slug: "home-lifestyle",
    name: "Home & Lifestyle",
    subtitle: "Everyday elegance, elevated.",
    banner:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1600&auto=format&fit=crop&q=80",
    description:
      "Transform living spaces into sanctuaries of warmth and luxury with our curated home and lifestyle collection — where beauty meets function in perfect harmony.",
    accent: "from-emerald-900/50 to-card/0",
  },
  {
    slug: "utility-products",
    name: "Utility Products",
    subtitle: "Everyday utilities, thoughtfully elevated.",
    banner:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop&q=80",
    description:
      "Practical never meant ordinary. Our utility collection reimagines everyday essentials through the lens of luxury — objects that earn their place through both beauty and purpose.",
    accent: "from-zinc-900/60 to-card/0",
  },
  {
    slug: "car-accessories",
    name: "Car Accessories",
    subtitle: "Luxury accessories for the journey ahead.",
    banner:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&auto=format&fit=crop&q=80",
    description:
      "Elevate every drive with premium automotive accessories crafted for discerning tastes — from bespoke leather interiors to refined dashboard accents that command presence.",
    accent: "from-neutral-900/60 to-card/0",
  },
  {
    slug: "festive-gift-hampers",
    name: "Festive Gift Hampers",
    subtitle: "Celebratory hampers crafted for pure joy.",
    banner:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1600&auto=format&fit=crop&q=80",
    description:
      "An art form in itself — our festive hampers are curated with intention, brimming with premium selections that delight every sense and leave a lasting impression on every occasion.",
    accent: "from-orange-900/50 to-card/0",
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

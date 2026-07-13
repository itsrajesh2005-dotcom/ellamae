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
      "https://images.pexels.com/photos/8819120/pexels-photo-8819120.jpeg?_gl=1*t0upty*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk4NzgkajMkbDAkaDA",
    description:
      "Thoughtfully curated gifts designed to celebrate life's most joyful milestones — from indulgent hampers to bespoke keepsakes that make every birthday unforgettable.",
    accent: "from-rose-900/60 to-card/0",
  },
  {
    slug: "anniversary-gifts",
    name: "Anniversary Gifts",
    subtitle: "Honour love that endures through time.",
    banner:
      "https://images.pexels.com/photos/8819857/pexels-photo-8819857.jpeg?_gl=1*1huv73f*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk3NzAkajI3JGwwJGgw",
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
      "https://images.pexels.com/photos/7580804/pexels-photo-7580804.jpeg?_gl=1*1uenv9n*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk1MTIkajM0JGwwJGgw",
    description:
      "Make a lasting impression on clients, partners, and teams with premium corporate gifts that reflect your brand's standards of excellence and sophistication.",
    accent: "from-slate-900/60 to-card/0",
  },
  {
    slug: "personalized-gifts",
    name: "Personalized Gifts",
    subtitle: "Made uniquely, unmistakably theirs.",
    banner:
      "https://images.unsplash.com/photo-1647221598276-124ebb861536?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description:
      "A gift becomes a treasure when it carries a name, a date, or a story. Our personalized collection transforms every piece into a one-of-a-kind expression of love.",
    accent: "from-yellow-900/60 to-card/0",
  },
  {
    slug: "home-lifestyle",
    name: "Home & Lifestyle",
    subtitle: "Everyday elegance, elevated.",
    banner:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuXmEoKeMOjVbWwFMimGxGnFyCaAkQeV1-NF0RS5UpZEQCHBsI2qYV_1Ti5umkf2J4bHardWxh5KZVzqWKO-VD5O-4i2MaOjluMyuEVHen6BjVROvnK2m00LvK9BMEjfbftfM9Y5j6l25aSVjcGIV2dv5rXIcZ2ONHTZXv_KpglUxaEfP0JG1fnwvJ_-MWucznbjqVZ2HG4dn3xL2azm97KcAq8R1FBjTd3EGd4ik7oChAtLEbC5iZEJwSILUEWJu2IoqSIq4qHIU",
    description:
      "Transform living spaces into sanctuaries of warmth and luxury with our curated home and lifestyle collection — where beauty meets function in perfect harmony.",
    accent: "from-emerald-900/50 to-card/0",
  },
  {
    slug: "utility-products",
    name: "Utility Products",
    subtitle: "Everyday utilities, thoughtfully elevated.",
    banner:
      "https://plus.unsplash.com/premium_photo-1661320959699-fed526e1461e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      "https://plus.unsplash.com/premium_photo-1682090874106-6d85c6eb94a8?q=80&w=1141&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description:
      "An art form in itself — our festive hampers are curated with intention, brimming with premium selections that delight every sense and leave a lasting impression on every occasion.",
    accent: "from-orange-900/50 to-card/0",
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

"use client"

import Link from "next/link"
import { Reveal } from "./reveal"

/* ─── card data ────────────────────────────────────────────────────────────── */
const items = [
  /* Row 1 */
  {
    slug: "birthday-gifts",
    name: "Birthday Gifts",
    desc: "Celebrate another beautiful year with curated luxury.",
    cta: "Explore Collection",
    icon: (
      <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21v-9.75M21 11.25A2.25 2.25 0 0018.75 9h-1.5M21 11.25H3M3 11.25A2.25 2.25 0 015.25 9h1.5M3 11.25v0M5.25 9V6.375A2.625 2.625 0 017.875 3.75h.375m0 0A2.625 2.625 0 0110.875 6.375V9m-3-5.25h3m0 0h3.375m0 0A2.625 2.625 0 0116.125 6.375V9m0-5.25h-.375m.375 0A2.625 2.625 0 0118.75 6.375V9M10.875 3.75h3.375" />
      </svg>
    ),
    image: "https://images.pexels.com/photos/8819120/pexels-photo-8819120.jpeg?_gl=1*t0upty*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk4NzgkajMkbDAkaDA.",
    col: "md:col-span-8",
    height: "h-[300px]",
    large: true,
  },
  {
    slug: "anniversary-gifts",
    name: "Anniversary Gifts",
    desc: "Honour love that endures.",
    cta: "Explore",
    icon: (
      <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    image: "https://images.pexels.com/photos/8819857/pexels-photo-8819857.jpeg?_gl=1*1huv73f*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk3NzAkajI3JGwwJGgw",
    col: "md:col-span-4",
    height: "h-[300px]",
    large: false,
  },
  /* Row 2 */
  {
    slug: "corporate-gifts",
    name: "Corporate Gifts",
    desc: "Gratitude, refined for professionals.",
    cta: "Enquire Now",
    icon: (
      <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    image: "https://images.pexels.com/photos/7580804/pexels-photo-7580804.jpeg?_gl=1*1uenv9n*_ga*MTE1NTYyODM4NS4xNzgyNDc5MTk0*_ga_8JE65Q40S6*czE3ODI0NzkxOTQkbzEkZzEkdDE3ODI0Nzk1MTIkajM0JGwwJGgw",
    col: "md:col-span-4",
    height: "h-[320px]",
    large: false,
  },
  {
    slug: "personalized-gifts",
    name: "Personalized Gifts",
    desc: "Made uniquely theirs.",
    cta: "Explore",
    icon: (
      <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCW3hVQXVmHeE5A6w86Xjo-CVmwJVyQPeQptra7QqdoJAuN5xmdDJ9K1qKOXlKjLNolWI9t0AgWCpRaXsMQHrwZwzY77Vsbbks2CSL9DCZXcBcVA81WBGQptra7QqdoJAuN5xmdDJ9K1qKOXlKjLNolWI9t0AgWCpRaXsMQHrwZwzY77Vsbbks2CSL9DCZXcBcVA81WBGQptra7",
    col: "md:col-span-4",
    height: "h-[320px]",
    large: false,
    imageFallback: "https://images.unsplash.com/photo-1647221598276-124ebb861536?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    slug: "home-lifestyle",
    name: "Home & Lifestyle",
    desc: "Everyday elegance for the home.",
    cta: "View All",
    icon: (
      <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuXmEoKeMOjVbWwFMimGxGnFyCaAkQeV1-NF0RS5UpZEQCHBsI2qYV_1Ti5umkf2J4bHardWxh5KZVzqWKO-VD5O-4i2MaOjluMyuEVHen6BjVROvnK2m00LvK9BMEjfbftfM9Y5j6l25aSVjcGIV2dv5rXIcZ2ONHTZXv_KpglUxaEfP0JG1fnwvJ_-MWucznbjqVZ2HG4dn3xL2azm97KcAq8R1FBjTd3EGd4ik7oChAtLEbC5iZEJwSILUEWJu2IoqSIq4qHIU",
    col: "md:col-span-4",
    height: "h-[320px]",
    large: false,
  },
  /* Row 3 */
  {
    slug: "wedding-gifts",
    name: "Wedding & Return Gifts",
    desc: "Begin forever, beautifully.",
    cta: "Explore",
    icon: (
      <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    image: "https://plus.unsplash.com/premium_photo-1682090789715-a1acbfe72404?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    col: "md:col-span-4",
    height: "h-[300px]",
    large: false,
  },
  {
    slug: "festive-gift-hampers",
    name: "Festive Gift Hampers",
    desc: "Celebratory hampers crafted for pure joy and tradition.",
    cta: "Shop Festive Special",
    icon: (
      <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21v-9.75M21 11.25A2.25 2.25 0 0018.75 9h-1.5M21 11.25H3M3 11.25A2.25 2.25 0 015.25 9h1.5M3 11.25v0M12 9V3.75m0 0a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
      </svg>
    ),
    image: "https://plus.unsplash.com/premium_photo-1682090874106-6d85c6eb94a8?q=80&w=1141&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    col: "md:col-span-8",
    height: "h-[300px]",
    large: true,
  },
  /* Row 4 */
  {
    slug: "utility-products",
    name: "Utility Products",
    desc: "Elevated objects for daily use.",
    cta: "Explore",
    icon: (
      <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    image: "https://plus.unsplash.com/premium_photo-1661320959699-fed526e1461e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    col: "md:col-span-6",
    height: "h-[280px]",
    large: false,
    horizontal: true,
  },
  {
    slug: "car-accessories",
    name: "Car Accessories",
    desc: "Luxury for the journey.",
    cta: "Explore",
    icon: (
      <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeFQ6k3_pWUrTAzLgKuIi1O-U82-Hm-PG8hGrLq8Rhy-hVNXNqbxdMVyBDx8ObFWcElE5CpZtrwiVlXFSeIKG5t8PlA-LUDPwCEXwjWfpExn376BqVI5tyauDbBLf4GUYBNIXv2pPXD_uxarzFJbtAklRBDsLF3Aj58yCCk0X97QaZDsQTwgcDofYfEyXmQfdpkyiRDL8f1d8cffYj08_iXTmsgCvFYHZEPwn1S9WQEdW_Z95Sd9Lg0KKI28ao_Wr6j-nrceGxZZg",
    col: "md:col-span-6",
    height: "h-[280px]",
    large: false,
    horizontal: true,
  },
]

/* Arrow icon */
function ArrowRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

/* Individual card */
function GridCard({ item }: { item: (typeof items)[number] }) {
  const isLarge = item.large
  const isHorizontal = (item as any).horizontal

  return (
    <Link
      href={`/collections/${item.slug}`}
      aria-label={`Explore ${item.name}`}
      className={`group relative overflow-hidden rounded-xl ${item.col} ${item.height} block`}
      style={{ transition: "all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)" }}
    >
      {/* Image */}
      <img
        src={(item as any).imageFallback ?? item.image}
        alt={item.name}
        onError={(e) => {
          const el = e.currentTarget
          if ((item as any).imageFallback && el.src !== (item as any).imageFallback) {
            el.src = (item as any).imageFallback
          } else {
            el.src = item.image
          }
        }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Glass overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)" }}
      />

      {/* Hover tint */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />

      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col justify-end ${isLarge ? "p-10" : isHorizontal ? "p-8" : "p-8"}`}
      >
        {isHorizontal ? (
          /* Horizontal layout: icon + text side by side */
          <div className="flex items-center gap-6">
            <div className="shrink-0">{item.icon}</div>
            <div>
              <h3 className="font-serif font-semibold text-white text-2xl mb-1 leading-tight">{item.name}</h3>
              <p className="text-white/80 text-sm font-medium">{item.desc}</p>
            </div>
          </div>
        ) : (
          /* Vertical layout */
          <>
            <div className="mb-4">{item.icon}</div>
            <h3
              className={`font-serif font-semibold text-white leading-tight mb-2 ${isLarge ? "text-4xl" : "text-2xl"
                }`}
            >
              {item.name}
            </h3>
            <p className={`text-white/80 font-medium ${isLarge ? "text-base max-w-md" : "text-sm"}`}>{item.desc}</p>

            {/* CTA */}
            <a
              className={`mt-4 inline-flex items-center gap-2 text-white font-semibold text-sm group/link ${isLarge ? "mt-6" : "mt-4"
                }`}
              href={`/collections/${item.slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className={`border-b transition-colors ${isLarge
                  ? "border-b-2 border-white/30 group-hover/link:border-white"
                  : "border-b border-white/30 group-hover/link:border-white"
                  }`}
              >
                {item.cta}
              </span>
              <span className="group-hover/link:translate-x-1 transition-transform">
                <ArrowRight />
              </span>
            </a>
          </>
        )}
      </div>

      {/* Scale on hover via group */}
      <div className="absolute inset-0 pointer-events-none group-hover:ring-2 group-hover:ring-white/10 rounded-xl transition-all duration-500" />
    </Link>
  )
}

/* ─── exported section ─────────────────────────────────────────────────────── */
export function CategoriesMosaic() {
  return (
    <section id="categories" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Section header — matches reference exactly */}
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.4em] text-gold uppercase">Shop by Occasion</span>
          <h2 className="mt-4 text-balance font-serif text-3xl font-medium text-black sm:text-5xl mb-10">
            "Find the Perfect Gift for <span className="italic text-gold">Every Celebration"</span>
          </h2>

        </Reveal>


        {/* ── Desktop grid (md+) — 12 columns asymmetric ─────────────────── */}
        <div className="hidden md:grid grid-cols-12 gap-6 md:gap-8">
          {items.map((item) => (
            <GridCard key={item.slug} item={item} />
          ))}
        </div>

        {/* ── Mobile grid — single column, featured cards taller ──────────── */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {items.map((item) => (
            <div
              key={item.slug}
              className={item.large ? "h-[380px]" : (item as any).horizontal ? "h-[220px]" : "h-[280px]"}
            >
              <GridCard item={{ ...item, col: "", height: "h-full" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

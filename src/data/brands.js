import { products } from './products'

const brandProfiles = [
  {
    name: 'Lisa Folawiyo',
    tagline: 'Luxury tailoring with vivid Ankara storytelling.',
    accent: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    name: 'ATAFO',
    tagline: 'Refined modern cuts with a sharp editorial edge.',
    accent: 'from-slate-900 via-slate-700 to-zinc-500',
  },
  {
    name: 'Andrea Iyamah',
    tagline: 'Elegant silhouettes designed for resort and occasion wear.',
    accent: 'from-fuchsia-500 via-pink-500 to-rose-400',
  },
  {
    name: 'Orange Culture',
    tagline: 'Bold, expressive design with a contemporary street feel.',
    accent: 'from-orange-400 via-red-500 to-pink-500',
  },
  {
    name: 'Yomi Casual',
    tagline: 'Tailored occasionwear with strong cultural presence.',
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    name: 'Ashluxe',
    tagline: 'Minimal streetwear built around texture and ease.',
    accent: 'from-indigo-500 via-violet-500 to-slate-900',
  },
  {
    name: 'Deola Sagoe',
    tagline: 'A luxury formalwear aesthetic with graceful detailing.',
    accent: 'from-rose-400 via-pink-500 to-purple-500',
  },
  {
    name: 'Wanni Fuga',
    tagline: 'Elegant silhouettes with polished finishing touches.',
    accent: 'from-slate-800 via-zinc-700 to-stone-500',
  },
]

export const brands = brandProfiles.map((brand) => {
  const brandProducts = products.filter((product) => product.brand === brand.name)

  return {
    ...brand,
    slug: brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    productCount: brandProducts.length,
    featuredProduct: brandProducts[0],
  }
})

export const getBrandBySlug = (slug) =>
  brands.find((brand) => brand.slug === slug)

export const getProductsByBrandSlug = (slug) => {
  const brand = getBrandBySlug(slug)
  if (!brand) return []
  return products.filter((product) => product.brand === brand.name)
}
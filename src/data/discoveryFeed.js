import { brands } from './brands'
import { products } from './products'
import { getContentFeed } from './content'

// Discovery feed entity model — the feed is assembled from Content Units,
// Brands, and Products rather than a flat product list.
//
// Card kinds: 'hero' | 'brand' | 'styling' | 'milestone' | 'newBrand' | 'product'

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// Content units grouped by brand slug, newest first
const contentByBrandSlug = new Map()
for (const unit of getContentFeed()) {
  if (!contentByBrandSlug.has(unit.brandSlug)) {
    contentByBrandSlug.set(unit.brandSlug, [])
  }
  contentByBrandSlug.get(unit.brandSlug).push(unit)
}

const unitsByType = (type) => getContentFeed().filter((unit) => unit.type === type)

const findBrand = (slug) => brands.find((b) => b.slug === slug)

const findProduct = (productId) =>
  products.find((p) => String(p.id) === String(productId)) ?? null

const toContentCard = (unit, kind, brand) => ({
  kind,
  unitId: unit.id,
  id: `unit-${unit.id}`,
  type: unit.type,
  title: unit.title,
  body: unit.body,
  media: unit.media,
  publishDate: unit.publishDate,
  brand: brand ? { name: brand.name, slug: brand.slug } : null,
  product: findProduct(unit.productId),
})

// ── Card builders ─────────────────────────────────────────────────────────────

export const buildHeroEditorialCards = (limit = 2) =>
  unitsByType('story')
    .slice(0, limit)
    .map((unit) => {
      const brand = findBrand(unit.brandSlug)
      return {
        ...toContentCard(unit, 'hero', brand),
        location: brand?.location ?? null,
      }
    })

export const buildStylingCards = (limit = 3) =>
  unitsByType('styling')
    .slice(0, limit)
    .map((unit) => toContentCard(unit, 'styling', findBrand(unit.brandSlug)))

export const buildMilestoneCards = (limit = 2) =>
  unitsByType('milestone')
    .slice(0, limit)
    .map((unit) => {
      const brand = findBrand(unit.brandSlug)
      return {
        ...toContentCard(unit, 'milestone', brand),
        // Milestones reference the brand's milestone entity when one matches
        milestone:
          brand?.milestones?.find((m) => unit.title.includes(m.title)) ?? null,
      }
    })

export const buildDropCards = (limit = 2) =>
  unitsByType('drop')
    .slice(0, limit)
    .map((unit) => toContentCard(unit, 'drop', findBrand(unit.brandSlug)))

export const buildBrandCards = (limit = brands.length) =>
  brands.slice(0, limit).map((brand) => {
    const latestUnit = (contentByBrandSlug.get(brand.slug) ?? [])[0]
    return {
      kind: 'brand',
      id: `brand-${brand.slug}`,
      slug: brand.slug,
      name: brand.name,
      tagline: brand.tagline,
      coverImage: brand.coverImage,
      location: brand.location,
      accent: brand.accent,
      productCount: brand.productCount,
      hasSale: brand.hasSale,
      foundedDate: brand.foundedDate,
      latestUpdate: latestUnit
        ? { title: latestUnit.title, publishDate: latestUnit.publishDate }
        : null,
    }
  })

export const buildNewBrandCards = (limit = 3) => {
  const seen = new Set()
  const result = []
  for (const product of products.filter((p) => p.isNew)) {
    const brandName = product.brand
    if (seen.has(brandName)) continue
    seen.add(brandName)
    const brand = brands.find((b) => b.name === brandName)
    result.push({
      kind: 'newBrand',
      id: `new-brand-${brand?.slug ?? slugify(brandName)}`,
      slug: brand?.slug ?? slugify(brandName),
      name: brandName,
      isNewBrand: !brand,
      productCount: brand?.productCount ?? null,
      coverImage: product.productImage,
      accent: brand?.accent ?? 'from-neutral-600 via-neutral-500 to-neutral-700',
      sampleProduct: product,
    })
    if (result.length >= limit) break
  }
  return result
}

// ── Feed assembly ─────────────────────────────────────────────────────────────

export const FEED_FILTERS = {
  FOR_YOU: 'forYou',
  FOLLOWING: 'following',
  NEW_BRANDS: 'newBrands',
}

export const buildForYouFeed = () => {
  const heroes = buildHeroEditorialCards(2)
  const styling = buildStylingCards(4)
  const milestones = buildMilestoneCards(3)
  const drops = buildDropCards(2)
  const brandCards = buildBrandCards()
  const newBrands = buildNewBrandCards(2)

  const feed = []
  if (heroes[0]) feed.push(heroes[0])
  if (styling[0]) feed.push(styling[0])
  if (milestones[0]) feed.push(milestones[0])
  brandCards.slice(0, 4).forEach((card) => feed.push(card))
  if (styling[1]) feed.push(styling[1])
  if (milestones[1]) feed.push(milestones[1])
  if (drops[0]) feed.push(drops[0])
  brandCards.slice(4, 8).forEach((card) => feed.push(card))
  if (styling[2]) feed.push(styling[2])
  if (milestones[2]) feed.push(milestones[2])
  if (drops[1]) feed.push(drops[1])
  newBrands.forEach((card) => feed.push(card))
  if (styling[3]) feed.push(styling[3])

  return feed.filter(Boolean)
}

export const buildFollowingFeed = (followedSlugs) => {
  const slugs = Array.isArray(followedSlugs) ? followedSlugs : []
  if (slugs.length === 0) return []

  const feed = []
  for (const slug of slugs) {
    const brand = findBrand(slug)
    if (!brand) continue

    // Content units from followed brands. Story units render through
    // StylingCard, which deep-links into the Brand Story page.
    for (const unit of contentByBrandSlug.get(slug) ?? []) {
      const kind = unit.type === 'story' ? 'styling' : unit.type
      feed.push(toContentCard(unit, kind, brand))
    }

    // Products from followed brands — the shop surface, scoped to follows.
    for (const product of brand.saleProducts) {
      feed.push({ kind: 'product', ...product })
    }

    // The brand card itself so follows surface even without content
    feed.push(
      buildBrandCards().find((card) => card.slug === slug) ?? {
        kind: 'brand',
        id: `brand-${brand.slug}`,
        slug: brand.slug,
        name: brand.name,
        tagline: brand.tagline,
        coverImage: brand.coverImage,
        location: brand.location,
        accent: brand.accent,
        productCount: brand.productCount,
        hasSale: brand.hasSale,
        foundedDate: brand.foundedDate,
        latestUpdate: null,
      }
    )
  }

  // Newest first
  return feed.sort(
    (a, b) => new Date(b.publishDate ?? 0) - new Date(a.publishDate ?? 0)
  )
}

// ── Curated follow suggestions (zero-follow state) ───────────────────────────
// Hand-picked marquee labels the empty state asks new users to follow.
export const CURATED_FOLLOW_SLUGS = ['lisa-folawiyo', 'orange-culture', 'ashluxe']

export const getCuratedFollowBrands = () =>
  CURATED_FOLLOW_SLUGS.map((slug) => findBrand(slug)).filter(Boolean)

export const buildNewBrandsFeed = () => [
  ...buildNewBrandCards(6),
  ...products
    .filter((p) => p.isNew)
    .slice(0, 8)
    .map((product) => ({ kind: 'product', ...product })),
]

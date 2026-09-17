import img1 from '../assets/imgFolder/Female/img1.jpg'
import img2 from '../assets/imgFolder/Female/img2.jpg'
import img3 from '../assets/imgFolder/Female/img3.jpg'
import img5 from '../assets/imgFolder/Female/img5.jpg'
import img6 from '../assets/imgFolder/Female/img6.jpg'
import img12 from '../assets/imgFolder/Female/img12.jpg'
import img13 from '../assets/imgFolder/Female/img13.jpg'
import img14 from '../assets/imgFolder/Female/img14.jpg'
import male3 from '../assets/imgFolder/Male/male3.jfif'
import male4 from '../assets/imgFolder/Male/male4.jfif'
import male7 from '../assets/imgFolder/Male/male7.jfif'
import male8 from '../assets/imgFolder/Male/male8.jfif'

// Content Unit entity
// type: 'story' | 'styling' | 'milestone' | 'drop'
// Each unit references a brand by slug and/or a product by id.
const contentUnits = [
  {
    id: 'c1',
    type: 'story',
    title: 'The Hand That Beads: Inside Lisa Folawiyo’s Atelier',
    body: 'Every Lisa Folawiyo piece passes through the hands of artisans who bead Ankara fabric panel by panel. A single dress can take over 240 hours. The studio calls it "painting with patience" — and the result is wearable art that has travelled from Lagos to the world’s most photographed rooms.',
    media: img1,
    brandSlug: 'lisa-folawiyo',
    productId: 1,
    publishDate: '2026-08-02',
  },
  {
    id: 'c2',
    type: 'styling',
    title: '3 Ways to Wear the Adire Print Blazer',
    body: 'Office: layer it over a white tee with tailored trousers. Weekend: throw it over a slip dress with sneakers. Occasion: belt it, add gold hoops, and let the pattern do the talking. One blazer, three entirely different energies.',
    media: img2,
    brandSlug: 'atafo',
    productId: 2,
    publishDate: '2026-08-10',
  },
  {
    id: 'c3',
    type: 'milestone',
    title: 'Andrea Iyamah Opens Its Purpose-Built Atelier',
    body: 'Design, dyeing, and finishing now live under one roof in Delta State. The new space doubles the brand’s small-batch capacity while keeping every pleat set by hand.',
    media: img13,
    brandSlug: 'andrea-iyamah',
    productId: 7,
    publishDate: '2026-07-18',
  },
  {
    id: 'c4',
    type: 'drop',
    title: 'Orange Culture: Chapter IX Is Live',
    body: 'A small, story-led release of hand-finished unisex pieces. Chapter IX explores softness as strength — expect painted prints and fluid tailoring. Once it’s gone, it’s gone.',
    media: img14,
    brandSlug: 'orange-culture',
    productId: 6,
    publishDate: '2026-09-01',
  },
  {
    id: 'c5',
    type: 'story',
    title: 'Three Decades of Aso-Oke: The Deola Archive',
    body: 'From her first couture house in 1989 to a formal archive established in 2020, Deola Sagoe has spent a career proving hand-woven Nigerian fabric belongs on the global stage. We look back at the silhouettes that changed everything.',
    media: img5,
    brandSlug: 'deola-sagoe',
    productId: 4,
    publishDate: '2026-06-20',
  },
  {
    id: 'c6',
    type: 'styling',
    title: 'The Ashluxe Capsule: Texture Over Logo',
    body: 'Heavyweight cottons, tonal embroidery, and silhouettes cut for Lagos heat. Style the Dashiki Tee under the Dashiki Jacket for a layered look that reads street without shouting.',
    media: male3,
    brandSlug: 'ashluxe',
    productId: 16,
    publishDate: '2026-08-25',
  },
  {
    id: 'c7',
    type: 'milestone',
    title: 'Yomi Casual’s Second Workshop Opens',
    body: 'Made-to-order demand earned the house a second dedicated workshop. Every Agbada set is still cut by hand — there just are more hands now.',
    media: male4,
    brandSlug: 'yomi-casual',
    productId: 39,
    publishDate: '2026-07-05',
  },
  {
    id: 'c8',
    type: 'drop',
    title: 'Wanni Fuga: The Entrance Collection',
    body: 'Liquid gowns and lace overlays built for entrances. The label’s first full ready-to-wear drop of the season arrives with limited quantities per size.',
    media: img6,
    brandSlug: 'wanni-fuga',
    productId: 5,
    publishDate: '2026-09-10',
  },
  {
    id: 'c9',
    type: 'story',
    title: 'ATAFO: From Bespoke Bench to Runway Headliner',
    body: 'The house that started with made-to-measure suits now closes Lagos Fashion Week. A look at how ATAFO translates sharp bespoke tailoring into ready-to-wear without losing the fit.',
    media: male8,
    brandSlug: 'atafo',
    productId: 21,
    publishDate: '2026-05-28',
  },
  {
    id: 'c10',
    type: 'styling',
    title: 'Kente, But Make It Evening',
    body: 'The Kente Maxi Skirt works harder than you think. Pair with a fitted black bodysuit and heels for dinner; swap in a white shirt for daytime. The pattern carries the look — keep everything else quiet.',
    media: img3,
    brandSlug: 'andrea-iyamah',
    productId: 3,
    publishDate: '2026-08-30',
  },
  {
    id: 'c11',
    type: 'story',
    title: 'Why Orange Culture Designs Without a Gender',
    body: 'The label’s founder has always dressed people, not categories. We explore how Orange Culture’s gender-aware silhouettes reshaped the conversation around Nigerian design.',
    media: img12,
    brandSlug: 'orange-culture',
    productId: 38,
    publishDate: '2026-04-15',
  },
  {
    id: 'c12',
    type: 'milestone',
    title: 'Ashluxe Flagship: More Than a Store',
    body: 'Drops, fittings, and community events — the new Lagos flagship is designed as a hub for the culture that built the brand.',
    media: male7,
    brandSlug: 'ashluxe',
    productId: 22,
    publishDate: '2026-09-05',
  },
]

export const content = contentUnits

export const getContentByBrandSlug = (slug) =>
  content.filter((unit) => unit.brandSlug === slug)

export const getContentByProductId = (productId) =>
  content.filter(
    (unit) => String(unit.productId) === String(productId)
  )

export const getContentByType = (type) =>
  content.filter((unit) => unit.type === type)

// Feed: newest first
export const getContentFeed = () =>
  [...content].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))

export const getLatestContentByBrandSlug = (slug, limit = 3) =>
  getContentByBrandSlug(slug)
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(0, limit)

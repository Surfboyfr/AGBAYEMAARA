import { products } from './products'
import img1 from '../assets/imgFolder/Female/img1.jpg'
import img3 from '../assets/imgFolder/Female/img3.jpg'
import img5 from '../assets/imgFolder/Female/img5.jpg'
import img6 from '../assets/imgFolder/Female/img6.jpg'
import img13 from '../assets/imgFolder/Female/img13.jpg'
import img14 from '../assets/imgFolder/Female/img14.jpg'
import male3 from '../assets/imgFolder/Male/male3.jfif'
import male4 from '../assets/imgFolder/Male/male4.jfif'
import male7 from '../assets/imgFolder/Male/male7.jfif'

const brandProfiles = [
  {
    name: 'Lisa Folawiyo',
    tagline: 'Luxury tailoring with vivid Ankara storytelling.',
    accent: 'from-amber-400 via-orange-500 to-rose-500',
    location: 'Lagos, Nigeria',
    foundedDate: '2005',
    coverImage: img1,
    story: [
      'Lisa Folawiyo began with a simple obsession: what would happen if the bold geometry of Ankara fabric was treated with the patience of haute couture? From a small Lagos studio, the label started hand-embellishing West African prints with beads, sequins, and crystals — turning cloth into narrative.',
      'Nearly two decades later, that craft-first philosophy still defines the house. Every piece is cut for the modern African woman who moves between Lagos, London, and New York without ever leaving her roots behind.',
      'The brand remains a family-run atelier, working with local artisans and championing slow, deliberate production over seasonal noise.',
    ],
    milestones: [
      { year: '2005', title: 'The atelier opens', description: 'Lisa Folawiyo launches from a Lagos studio with a first capsule of hand-embellished Ankara wraps.' },
      { year: '2012', title: 'First international showcase', description: 'The label presents at New York Fashion Week, introducing embellished Ankara to a global audience.' },
      { year: '2018', title: 'Flagship store', description: 'A permanent Lagos flagship opens, anchoring the brand in the city that shaped it.' },
      { year: '2024', title: 'Craft academy', description: 'The house launches an in-house training program for local beading and embroidery artisans.' },
    ],
  },
  {
    name: 'ATAFO',
    tagline: 'Refined modern cuts with a sharp editorial edge.',
    accent: 'from-slate-900 via-slate-700 to-zinc-500',
    location: 'Lagos, Nigeria',
    foundedDate: '2012',
    coverImage: male7,
    story: [
      'ATAFO was founded on the belief that menswear in Nigeria could be as daring as it is precise. The studio pairs bespoke tailoring traditions with a streetwise, editorial sensibility — sharp shoulders, clean lines, and fabric choices that photograph like sculpture.',
      'Known first as a made-to-measure house, ATAFO dressed grooms, executives, and creatives before expanding into full ready-to-wear collections that move fluidly between ceremony and city.',
      'Today the label is a fixture of Lagos Fashion Week, pushing print-forward outerwear and tailored separates that refuse to choose between heritage and modernity.',
    ],
    milestones: [
      { year: '2012', title: 'Bespoke beginnings', description: 'ATAFO opens as a made-to-measure menswear studio serving Lagos creatives and professionals.' },
      { year: '2016', title: 'Ready-to-wear debut', description: 'The first full RTW collection drops, translating the bespoke line for everyday wear.' },
      { year: '2021', title: 'Lagos Fashion Week headliner', description: 'A landmark runway show cements ATAFO’s place among Nigeria’s leading menswear houses.' },
      { year: '2025', title: 'Global stockists', description: 'The brand expands to international stockists across Europe and North America.' },
    ],
  },
  {
    name: 'Andrea Iyamah',
    tagline: 'Elegant silhouettes designed for resort and occasion wear.',
    accent: 'from-fuchsia-500 via-pink-500 to-rose-400',
    location: 'Delta State, Nigeria',
    foundedDate: '2011',
    coverImage: img13,
    story: [
      'Andrea Iyamah grew out of Delta State with one clear ambition: dresses that carry African color into resort and occasion spaces around the world.',
      'The label’s signature is movement — flowing hems, architectural pleats, and saturated prints engineered to catch light and camera alike. It is a favorite of brides, honeymooners, and everyone in between.',
      'Still family-operated, the house produces in small batches, prioritizing fit and finish over volume.',
    ],
    milestones: [
      { year: '2011', title: 'First collection', description: 'Andrea Iyamah debuts with a resort capsule rooted in Delta State color and craft.' },
      { year: '2015', title: 'Destination bridal', description: 'The brand becomes a go-to for destination weddings across Africa and the diaspora.' },
      { year: '2019', title: 'Celebrity moment', description: 'International celebrities begin wearing the label on red carpets, amplifying its global reach.' },
      { year: '2023', title: 'New atelier', description: 'A purpose-built atelier opens, uniting design, dyeing, and finishing under one roof.' },
    ],
  },
  {
    name: 'Orange Culture',
    tagline: 'Bold, expressive design with a contemporary street feel.',
    accent: 'from-orange-400 via-red-500 to-pink-500',
    location: 'Lagos, Nigeria',
    foundedDate: '2011',
    coverImage: img14,
    story: [
      'Orange Culture is less a clothing label than a moving exhibition. Founded in Lagos, the brand treats every collection as a story about identity, softness, and the many ways Nigerian men and women can choose to be seen.',
      'Its gender-aware silhouettes and hand-painted prints have made it one of the most recognisable names from the continent, shown from Lagos to London.',
      'Every drop is deliberately small — narrative-first pieces for people who dress like they have something to say.',
    ],
    milestones: [
      { year: '2011', title: 'A label is born', description: 'Orange Culture launches with a unisex narrative collection and hand-finished prints.' },
      { year: '2014', title: 'International runway', description: 'The brand shows abroad for the first time, earning critical acclaim for its gender-fluid tailoring.' },
      { year: '2019', title: 'Woolmark recognition', description: 'A regional award win brings the label’s craft to a wider industry stage.' },
      { year: '2024', title: 'Narrative drops', description: 'The house formalises its story-led drop model, releasing small seasonal chapters.' },
    ],
  },
  {
    name: 'Yomi Casual',
    tagline: 'Tailored occasionwear with strong cultural presence.',
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
    location: 'Lagos, Nigeria',
    foundedDate: '2009',
    coverImage: male4,
    story: [
      'Yomi Casual built its name on the moments that matter: weddings, ceremonies, and the photographs that outlive them. The label’s Agbada sets and kaftans balance ceremonial grandeur with an unmistakably modern fit.',
      'From its Lagos base, the house has dressed a generation of Nigerian grooms, entertainers, and tastemakers, becoming shorthand for occasion dressing done right.',
    ],
    milestones: [
      { year: '2009', title: 'Studio launch', description: 'Yomi Casual opens in Lagos specialising in bespoke occasionwear for men.' },
      { year: '2014', title: 'The Agbada era', description: 'The label’s ceremonial sets become a cultural fixture at weddings across Nigeria.' },
      { year: '2020', title: 'Ready-to-wear line', description: 'A formal RTW collection brings the house’s fits to a wider audience.' },
      { year: '2025', title: 'Second workshop', description: 'A dedicated made-to-order workshop opens to serve growing demand.' },
    ],
  },
  {
    name: 'Ashluxe',
    tagline: 'Minimal streetwear built around texture and ease.',
    accent: 'from-indigo-500 via-violet-500 to-slate-900',
    location: 'Lagos, Nigeria',
    foundedDate: '2017',
    coverImage: male3,
    story: [
      'Ashluxe answers a simple question: what does luxury streetwear look like when it is designed in Lagos, for Lagos? The answer is texture — heavyweight cottons, tonal embroidery, and silhouettes cut for ease in the city’s heat.',
      'The label’s restrained graphics hide layers of cultural reference, from Adire dyeing traditions to contemporary Lagos street culture.',
      'Drops sell through quickly and deliberately; Ashluxe has mastered the art of the small, considered release.',
    ],
    milestones: [
      { year: '2017', title: 'First drop', description: 'Ashluxe releases its debut capsule of tonal tees and heavyweight basics.' },
      { year: '2020', title: 'Streetwear staple', description: 'The label becomes a fixture of Lagos street style and music culture.' },
      { year: '2022', title: 'Collaboration chapter', description: 'High-profile collabs introduce the brand to international audiences.' },
      { year: '2025', title: 'Flagship opening', description: 'A Lagos flagship store opens as a hub for drops, fittings, and community events.' },
    ],
  },
  {
    name: 'Deola Sagoe',
    tagline: 'A luxury formalwear aesthetic with graceful detailing.',
    accent: 'from-rose-400 via-pink-500 to-purple-500',
    location: 'Lagos, Nigeria',
    foundedDate: '1989',
    coverImage: img5,
    story: [
      'Deola Sagoe is the doyenne of Nigerian couture. Since founding her house in 1989, she has spent more than two decades proving that African luxury belongs at the top table of global fashion.',
      'The label is famed for its mastery of aso-oke — hand-woven Nigerian fabric reimagined in sculptural, regal silhouettes that have appeared on runways, royalty, and magazine covers worldwide.',
      'To wear Deola is to wear history in motion: garments that honour Yoruba craft traditions while pointing firmly at the future.',
    ],
    milestones: [
      { year: '1989', title: 'The house is founded', description: 'Deola Sagoe establishes her couture house in Lagos, championing hand-woven aso-oke.' },
      { year: '2000', title: 'Continental recognition', description: 'The label wins major African fashion honours and expands its couture clientele.' },
      { year: '2014', title: 'Biopic costuming', description: 'The house’s work reaches cinema, dressing a new generation in Nigerian heritage couture.' },
      { year: '2020', title: 'Heritage archive', description: 'A formal archive is established to preserve three decades of couture craft.' },
    ],
  },
  {
    name: 'Wanni Fuga',
    tagline: 'Elegant silhouettes with polished finishing touches.',
    accent: 'from-slate-800 via-zinc-700 to-stone-500',
    location: 'Lagos, Nigeria',
    foundedDate: '2016',
    coverImage: img6,
    story: [
      'Wanni Fuga is Lagos polish in fabric form. Founded in 2016, the brand specialises in elegant, woman-led silhouettes — lace overlays, liquid gowns, and refined separates designed for entrances rather than appearances.',
      'Its studio practice is obsessive about finishing: French seams, hand-set zips, and linings chosen as carefully as outer fabric.',
      'The label has grown from a made-to-order service into a full ready-to-wear house trusted for weddings, galas, and the moments in between.',
    ],
    milestones: [
      { year: '2016', title: 'Made-to-order launch', description: 'Wanni Fuga starts as a bespoke service for Lagos occasionwear.' },
      { year: '2018', title: 'First RTW collection', description: 'The brand transitions into ready-to-wear with a polished debut collection.' },
      { year: '2021', title: 'Showroom opens', description: 'A dedicated Lagos showroom gives clients a home for fittings and styling.' },
      { year: '2026', title: 'Diaspora expansion', description: 'The label extends its shipping and styling services to diaspora markets.' },
    ],
  },
]

export const brands = brandProfiles.map((brand) => {
  const brandProducts = products.filter((product) => product.brand === brand.name)
  const saleProducts = brandProducts.filter((p) => p.onSale)

  return {
    ...brand,
    slug: brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    productCount: brandProducts.length,
    featuredProduct: brandProducts[0],
    hasSale: saleProducts.length > 0,
    saleProductCount: saleProducts.length,
    saleProducts,
  }
})

export const getBrandBySlug = (slug) =>
  brands.find((brand) => brand.slug === slug)

export const getProductsByBrandSlug = (slug) => {
  const brand = getBrandBySlug(slug)
  if (!brand) return []
  return products.filter((product) => product.brand === brand.name)
}
// ── Seller portal mock data ──────────────────────────────────────────────────
// Frontend-only stand-in for the future seller API. Each export mirrors the
// payload shape the backend will eventually return, so swapping mock data for
// real fetches happens in ONE place (src/Context/SellerContext.jsx):
//
//   GET    /api/seller/stats     → sellerStats
//   GET    /api/seller/products  → sellerProducts
//   GET    /api/seller/orders    → sellerOrders
//   GET    /api/seller/profile   → sellerProfile
//
// Shared seller constants (statuses, categories) and tiny format helpers also
// live here so every screen stays in sync with the data it renders.

import img1 from '../assets/imgFolder/Female/img1.jpg'
import img2 from '../assets/imgFolder/Female/img2.jpg'
import img3 from '../assets/imgFolder/Female/img3.jpg'
import img5 from '../assets/imgFolder/Female/img5.jpg'
import img6 from '../assets/imgFolder/Female/img6.jpg'
import img12 from '../assets/imgFolder/Female/img12.jpg'
import img13 from '../assets/imgFolder/Female/img13.jpg'
import male1 from '../assets/imgFolder/Male/male1.jfif'
import male3 from '../assets/imgFolder/Male/male3.jfif'
import male4 from '../assets/imgFolder/Male/male4.jfif'
import male9 from '../assets/imgFolder/Male/male9.jfif'
import img4 from '../assets/imgFolder/Male/img4.jpg'
import brandAvatar from '../assets/brand1.jfif'

// Stock at or below this (but above zero) renders as "Low Stock".
export const LOW_STOCK_THRESHOLD = 10

export const SELLER_CATEGORIES = [
  'Women',
  'Men',
  'Unisex',
  'Shoes',
  'Bags',
  'Jewelries',
  'Hats',
]

export const PRODUCT_STATUS = {
  ACTIVE: 'Active',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
}

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUSES = Object.values(ORDER_STATUS)

// Stock level → display status for the inventory/products screens.
export const getProductStatus = (stock) => {
  if (stock <= 0) return PRODUCT_STATUS.OUT_OF_STOCK
  if (stock <= LOW_STOCK_THRESHOLD) return PRODUCT_STATUS.LOW_STOCK
  return PRODUCT_STATUS.ACTIVE
}

// Chip classes per status — same bordered tint pattern the storefront uses
// for availability chips (see ProductDetails.jsx).
export const PRODUCT_STATUS_TONES = {
  [PRODUCT_STATUS.ACTIVE]: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  [PRODUCT_STATUS.LOW_STOCK]: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  [PRODUCT_STATUS.OUT_OF_STOCK]: 'border-red-500/30 bg-red-500/10 text-red-500',
}

export const ORDER_STATUS_TONES = {
  [ORDER_STATUS.PENDING]: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  [ORDER_STATUS.PROCESSING]: 'border-[#ec5800]/30 bg-[#ec5800]/10 text-[#ec5800]',
  [ORDER_STATUS.SHIPPED]: 'border-sky-500/30 bg-sky-500/10 text-sky-500',
  [ORDER_STATUS.COMPLETED]: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  [ORDER_STATUS.CANCELLED]: 'border-red-500/30 bg-red-500/10 text-red-500',
}

// Money/date formatting for seller screens (USD matches the storefront
// catalog's price convention).
export const formatPrice = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// ── Mock stats ───────────────────────────────────────────────────────────────
// Period-over-period comparisons for the dashboard headline cards. The card
// VALUES (products, orders, revenue, low stock) are computed live from
// products/orders state so they react to add/edit/delete; these trends are the
// mock half. Future: GET /api/seller/stats returns both together.
export const sellerStats = {
  revenueTrendPercent: 12.4,
  ordersTrendPercent: 8.1,
  productsTrendPercent: 4.2,
  lowStockTrendPercent: -18.2,
}

// ── Mock products (inventory + products screens) ────────────────────────────
export const sellerProducts = [
  {
    id: 1,
    name: 'Ankara Wrap Dress',
    category: 'Women',
    price: 89.99,
    stock: 24,
    description:
      'Statement wrap dress cut from vibrant Ankara fabric with a flattering waist tie and flowing silhouette.',
    image: img1,
    createdAt: '2026-06-12T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Adire Print Blazer',
    category: 'Women',
    price: 129.99,
    stock: 6,
    description:
      'Tailored blazer with rich Adire-inspired patterning and a sharp, modern cut.',
    image: img2,
    createdAt: '2026-07-02T10:00:00.000Z',
  },
  {
    id: 3,
    name: 'Kente Maxi Skirt',
    category: 'Women',
    price: 74.99,
    stock: 18,
    description:
      'High-rise maxi skirt featuring rich Kente-inspired pattern work and a flowing hem.',
    image: img3,
    createdAt: '2026-07-19T10:00:00.000Z',
  },
  {
    id: 4,
    name: 'Lace Overlay Gown',
    category: 'Women',
    price: 219.99,
    stock: 0,
    description:
      'Formal gown with delicate lace overlay, structured fit, and refined evening appeal.',
    image: img6,
    createdAt: '2026-06-28T10:00:00.000Z',
  },
  {
    id: 5,
    name: 'Kente Shirt',
    category: 'Men',
    price: 84.99,
    stock: 32,
    description:
      'Crisp tailored shirt inspired by Kente geometry and rich earthy tones.',
    image: male1,
    createdAt: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 6,
    name: 'Dashiki Jacket',
    category: 'Men',
    price: 119.99,
    stock: 4,
    description:
      'Structured jacket with bold Dashiki-inspired embroidery and clean lines.',
    image: male3,
    createdAt: '2026-08-14T10:00:00.000Z',
  },
  {
    id: 7,
    name: 'Agbada Kaftan',
    category: 'Men',
    price: 149.99,
    stock: 9,
    description:
      'Relaxed kaftan-inspired set that balances ceremonial style with modern comfort.',
    image: male4,
    createdAt: '2026-08-22T10:00:00.000Z',
  },
  {
    id: 8,
    name: 'Wax Print Jumpsuit',
    category: 'Unisex',
    price: 109.99,
    stock: 15,
    description:
      'Bold one-piece jumpsuit with a relaxed fit, defined waist, and energetic wax-print finish.',
    image: img4,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 9,
    name: 'Gold Hoop Earrings',
    category: 'Jewelries',
    price: 49.99,
    stock: 3,
    description: 'Elegant gold hoops with a polished finish for everyday luxury.',
    image: img12,
    createdAt: '2026-09-09T10:00:00.000Z',
  },
  {
    id: 10,
    name: 'Leather Crossbody Bag',
    category: 'Bags',
    price: 79.99,
    stock: 12,
    description:
      'Compact crossbody bag with polished detailing and everyday practicality.',
    image: img13,
    createdAt: '2026-09-16T10:00:00.000Z',
  },
  {
    id: 11,
    name: 'Woven Fedora Hat',
    category: 'Hats',
    price: 59.99,
    stock: 21,
    description: 'Refined woven fedora designed to elevate any look.',
    image: img5,
    createdAt: '2026-09-21T10:00:00.000Z',
  },
  {
    id: 12,
    name: 'Adire Hoodie',
    category: 'Unisex',
    price: 79.99,
    stock: 0,
    description:
      'Cozy hoodie with traditional Adire patterns and a relaxed fit.',
    image: male9,
    createdAt: '2026-09-27T10:00:00.000Z',
  },
]

// ── Mock orders ──────────────────────────────────────────────────────────────
// Totals equal the sum of their line items so the orders table, dashboard
// revenue and product cells stay internally consistent.
export const sellerOrders = [
  {
    id: 'AGB-2041',
    customer: { name: 'Chidinma Eze', email: 'chidinma.eze@example.com' },
    items: [
      { productId: 5, name: 'Kente Shirt', quantity: 2, price: 84.99, image: male1 },
      { productId: 11, name: 'Woven Fedora Hat', quantity: 1, price: 59.99, image: img5 },
    ],
    total: 229.97,
    date: '2026-09-30T10:24:00.000Z',
    status: ORDER_STATUS.PROCESSING,
  },
  {
    id: 'AGB-2040',
    customer: { name: 'Tunde Bakare', email: 'tunde.bakare@example.com' },
    items: [
      { productId: 7, name: 'Agbada Kaftan', quantity: 1, price: 149.99, image: male4 },
    ],
    total: 149.99,
    date: '2026-09-29T14:05:00.000Z',
    status: ORDER_STATUS.PENDING,
  },
  {
    id: 'AGB-2039',
    customer: { name: 'Amara Nwosu', email: 'amara.nwosu@example.com' },
    items: [
      { productId: 4, name: 'Lace Overlay Gown', quantity: 1, price: 219.99, image: img6 },
      { productId: 9, name: 'Gold Hoop Earrings', quantity: 2, price: 49.99, image: img12 },
    ],
    total: 319.97,
    date: '2026-09-28T09:41:00.000Z',
    status: ORDER_STATUS.SHIPPED,
  },
  {
    id: 'AGB-2038',
    customer: { name: 'Zainab Ibrahim', email: 'zainab.i@example.com' },
    items: [
      { productId: 1, name: 'Ankara Wrap Dress', quantity: 1, price: 89.99, image: img1 },
    ],
    total: 89.99,
    date: '2026-09-27T17:12:00.000Z',
    status: ORDER_STATUS.COMPLETED,
  },
  {
    id: 'AGB-2037',
    customer: { name: 'Emeka Obi', email: 'emeka.obi@example.com' },
    items: [
      { productId: 6, name: 'Dashiki Jacket', quantity: 2, price: 119.99, image: male3 },
    ],
    total: 239.98,
    date: '2026-09-25T11:58:00.000Z',
    status: ORDER_STATUS.CANCELLED,
  },
  {
    id: 'AGB-2036',
    customer: { name: 'Funke Adeyemi', email: 'funke.a@example.com' },
    items: [
      { productId: 8, name: 'Wax Print Jumpsuit', quantity: 1, price: 109.99, image: img4 },
      { productId: 11, name: 'Woven Fedora Hat', quantity: 1, price: 59.99, image: img5 },
    ],
    total: 169.98,
    date: '2026-09-24T08:33:00.000Z',
    status: ORDER_STATUS.COMPLETED,
  },
  {
    id: 'AGB-2035',
    customer: { name: 'Kelechi Okeke', email: 'kelechi.o@example.com' },
    items: [
      { productId: 2, name: 'Adire Print Blazer', quantity: 1, price: 129.99, image: img2 },
      { productId: 10, name: 'Leather Crossbody Bag', quantity: 1, price: 79.99, image: img13 },
    ],
    total: 209.98,
    date: '2026-09-22T13:20:00.000Z',
    status: ORDER_STATUS.SHIPPED,
  },
  {
    id: 'AGB-2034',
    customer: { name: 'Aisha Bello', email: 'aisha.bello@example.com' },
    items: [
      { productId: 3, name: 'Kente Maxi Skirt', quantity: 2, price: 74.99, image: img3 },
    ],
    total: 149.98,
    date: '2026-09-20T15:47:00.000Z',
    status: ORDER_STATUS.COMPLETED,
  },
]

// ── Mock seller profile ──────────────────────────────────────────────────────
export const sellerProfile = {
  businessName: 'Ọjà Atelier',
  ownerName: 'Adaeze Okonkwo',
  email: 'hello@oja-atelier.example',
  phone: '+234 803 456 7890',
  location: 'Lekki, Lagos, Nigeria',
  description:
    'Contemporary Nigerian fashion house blending Ankara, Adire and Kente craftsmanship with modern silhouettes. Made-to-order pieces shipped worldwide from Lagos.',
  avatar: brandAvatar,
  joinedAt: '2024-03-18T09:00:00.000Z',
}

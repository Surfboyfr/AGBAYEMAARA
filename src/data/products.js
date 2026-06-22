import img1 from '../assets/imgFolder/img1.jpg'
import img2 from '../assets/imgFolder/img2.jpg'
import img3 from '../assets/imgFolder/img3.jpg'
import img4 from '../assets/imgFolder/img4.jpg'
import img5 from '../assets/imgFolder/img5.jpg'
import img6 from '../assets/imgFolder/img6.jpg'
import img12 from '../assets/imgFolder/img12.jpg'
import img13 from '../assets/imgFolder/img13.jpg'

export const products = [
  {
    id: 1,
    productName: 'Ankara Wrap Dress',
    productPrice: 89.99,
    productImage: img1,
    brand: 'Lisa Folawiyo',
    category: 'Women',
    availability: 'In stock',
    rating: 4.8,
    description:
      'A statement wrap dress cut from vibrant Ankara fabric with a flattering waist tie and flowing silhouette.',
    overview:
      'Designed for effortless movement and bold styling, this piece works for daytime events, dinner dates, and special occasions.',
    details: ['Lightweight cotton blend', 'Adjustable wrap closure', 'Midi length'],
    care: 'Hand wash cold and hang dry to preserve the print and shape.',
  },
  {
    id: 2,
    productName: 'Adire Print Blazer',
    productPrice: 129.99,
    productImage: img2,
    brand: 'ATAFO',
    category: 'Women',
    availability: 'Limited stock',
    rating: 4.7,
    description:
      'A tailored blazer with rich Adire-inspired patterning and a sharp, modern cut.',
    overview:
      'Ideal for elevating office wear or pairing with matching trousers for a polished statement set.',
    details: ['Structured fit', 'Fully lined interior', 'Single-breasted closure'],
    care: 'Dry clean recommended.',
  },
  {
    id: 3,
    productName: 'Kente Maxi Skirt',
    productPrice: 74.99,
    productImage: img3,
    brand: 'Andrea Iyamah',
    category: 'Women',
    availability: 'In stock',
    rating: 4.6,
    description:
      'A high-rise maxi skirt featuring rich Kente-inspired pattern work and a flowing hem.',
    overview:
      'Pair it with a fitted top or cropped blouse for events, celebrations, or elevated weekend wear.',
    details: ['High-waist fit', 'Breathable fabric', 'Easy to style'],
    care: 'Machine wash on gentle cycle with similar colors.',
  },
  {
    id: 4,
    productName: 'Wax Print Jumpsuit',
    productPrice: 109.99,
    productImage: img4,
    brand: 'Orange Culture',
    category: 'Unisex',
    availability: 'In stock',
    rating: 4.9,
    description:
      'A bold one-piece jumpsuit with a relaxed fit, defined waist, and energetic wax-print finish.',
    overview:
      'Built for standout style and comfort, this silhouette balances statement graphics with easy wearability.',
    details: ['Relaxed leg', 'Belted waist', 'Soft breathable feel'],
    care: 'Wash cold and avoid bleach.',
  },
  {
    id: 5,
    productName: 'Agbada Set',
    productPrice: 199.99,
    productImage: img5,
    brand: 'Yomi Casual',
    category: 'Men',
    availability: 'Made to order',
    rating: 5.0,
    description:
      'A modern Agbada set with flowing layers, refined trim, and ceremonial presence.',
    overview:
      'Perfect for weddings, cultural events, and special occasions where presence and detail matter.',
    details: ['Traditional silhouette', 'Layered top and trousers', 'Premium finish'],
    care: 'Dry clean only.',
  },
  {
    id: 6,
    productName: 'Dashiki Tee',
    productPrice: 44.99,
    productImage: img6,
    brand: 'Ashluxe',
    category: 'Unisex',
    availability: 'In stock',
    rating: 4.5,
    description:
      'A casual Dashiki-inspired tee with clean tailoring and a relaxed everyday fit.',
    overview:
      'An easy staple for layering, weekend looks, and everyday streetwear styling.',
    details: ['Soft cotton fabric', 'Relaxed fit', 'Crew neckline'],
    care: 'Machine wash cold.',
  },
  {
    id: 7,
    productName: 'Beaded Kaftan',
    productPrice: 159.99,
    productImage: img12,
    brand: 'Deola Sagoe',
    category: 'Women',
    availability: 'Limited stock',
    rating: 4.8,
    description:
      'A graceful kaftan decorated with bead accents and a fluid silhouette for formal styling.',
    overview:
      'Designed for occasions that call for elegance, comfort, and a luxurious visual finish.',
    details: ['Flowing cut', 'Beaded embellishment', 'Elegant drape'],
    care: 'Dry clean recommended.',
  },
  {
    id: 8,
    productName: 'Lace Overlay Gown',
    productPrice: 219.99,
    productImage: img13,
    brand: 'Wanni Fuga',
    category: 'Women',
    availability: 'Pre-order',
    rating: 4.9,
    description:
      'A formal gown with delicate lace overlay, structured fit, and refined evening appeal.',
    overview:
      'Ideal for red-carpet moments, formal events, and occasions where detail and silhouette matter most.',
    details: ['Lace overlay', 'Full-length gown', 'Tailored bodice'],
    care: 'Dry clean only.',
  },
]

export const getProductById = (productId) =>
  products.find((product) => String(product.id) === String(productId))
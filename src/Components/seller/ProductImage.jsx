import { Store } from 'lucide-react'

// Product thumbnail with a placeholder fallback. Mock/API products can have
// an empty image URL — never render <img src=""> (the browser would resolve
// it to the page URL and React warns about it).
const ProductImage = ({ src, alt = '', className = 'h-11 w-11 rounded-lg' }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      className={`${className} shrink-0 border border-line object-cover`}
    />
  ) : (
    <span
      className={`flex ${className} shrink-0 items-center justify-center border border-dashed border-line bg-raised text-faint`}
      role='img'
      aria-label={alt || 'Product image placeholder'}
    >
      <Store size={16} aria-hidden='true' />
    </span>
  )

export default ProductImage

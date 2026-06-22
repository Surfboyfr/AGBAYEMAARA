import ProductCard from '../Components/ProductCard'
import { useState } from 'react'
import { products } from '../data/products'

const ShopHome = () => {

  const [selectedProduct, setSelectedProduct] = useState(null)


  return (
    <section>
      <div className="flex flex-col gap-5 lg:w-full mb-15 lg:mb-0 p-5">
        <h3 className='font-bold text-2xl text-black'>All Products</h3>
        <div className="lg:w-full ml-2 p-3">
          <input
            type="search"
            placeholder="Search products..."
            className="border border-gray-300 rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-gray-400 lg:w-3/4 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5 m-5">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </section>
  )
}

export default ShopHome
import React from 'react'
import ProductCard from '../Components/ProductCard'

const products = [
  { id: 1, productName: "Ankara Wrap Dress", productPrice: 89.99, productImage: "https://via.placeholder.com/300", brand: "Lisa Folawiyo" },
  { id: 2, productName: "Adire Print Blazer", productPrice: 129.99, productImage: "https://via.placeholder.com/300", brand: "ATAFO" },
  { id: 3, productName: "Kente Maxi Skirt", productPrice: 74.99, productImage: "https://via.placeholder.com/300", brand: "Andrea Iyamah" },
  { id: 4, productName: "Wax Print Jumpsuit", productPrice: 109.99, productImage: "https://via.placeholder.com/300", brand: "Orange Culture" },
  { id: 5, productName: "Agbada Set", productPrice: 199.99, productImage: "https://via.placeholder.com/300", brand: "Yomi Casual" },
  { id: 6, productName: "Dashiki Tee", productPrice: 44.99, productImage: "https://via.placeholder.com/300", brand: "Ashluxe" },
  { id: 7, productName: "Beaded Kaftan", productPrice: 159.99, productImage: "https://via.placeholder.com/300", brand: "Deola Sagoe" },
  { id: 8, productName: "Lace Overlay Gown", productPrice: 219.99, productImage: "https://via.placeholder.com/300", brand: "Wanni Fuga" },
]

const ShopHome = () => {
  return (
    <section>
      <div className="flex flex-col gap-5 lg:w-full mb-15 lg:mb-0 border-b p-5">
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
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}

export default ShopHome
import React from 'react'
import ProductCard from '../Components/ProductCard'


// const productList = [
//   {
//     productName="",
//     productImage="",
//     productPrice=''
    
//   },
//   {
//     productName="",
//     productImage="",
//     productPrice=''
    
//   },
//   {
//     productName="",
//     productImage="",
//     productPrice=''
    
//   },

// ]

const ShopHome = () => {
  return (
    <section className=' '>
        <div className="flex flex-col gap-5 lg:w-full mb-15 lg:mb-0 lg:pr-10 border p-5  ">
        <h3 className='font-bold text-2xl text-black'>All Products</h3>
          <div className=" lg:w-full ml-2 p-3  ">
            <input type="search" placeholder="Search products..." name="" id="" className="border border-gray-300 rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-3/4 w-full " />
          </div>
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5 m-5">
          {/* Example product cards */}
          <ProductCard 
            productName="Product 1" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />

          <ProductCard 
            productName="Product 2" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />

          <ProductCard 
            productName="Product 3" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />

          <ProductCard 
            productName="Product 4" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />
          <ProductCard 
            productName="Product 4" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />
          <ProductCard 
            productName="Product 4" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />
          <ProductCard 
            productName="Product 4" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />
          <ProductCard 
            productName="Product 4" 
            productPrice={49.99} 
            productImage="https://via.placeholder.com/300" 
          />
        </div>
      </div>
    </section>
  )
}

export default ShopHome
          

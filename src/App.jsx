import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './Pages/LandingPage'
import ShopHome from './Pages/ShopHome'
import ShopLayout from './Layouts/ShopLayout'
import Brands from './Pages/Brands'

function App() {

  return (
    <Routes>
      
      <Route
        index
        element={
              <section className='bg-[#0A0B0F] w-full'>
                  < LandingPage />
              </section>
                 } />
      
      <Route path="/shop" element={<ShopLayout />}>
            {/* Homepage inside shop */}
        <Route path="" element={<ShopHome />} />
      
        
        
      </Route>
        <Route path="/brands" element={<Brands />} />
      </Routes>
  
  )
}
 
export default App

     

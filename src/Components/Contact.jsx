import React from 'react'

const Contact = () => {
  return (
     <div className='px-9 mt-11 lg:flex lg:p-3 lg:gap-5 md:flex  lg:items-center lg:px-25 lg:flex-row lg:mb-20'>
        <div className="flex flex-col gap-5 lg:w-1/2 mb-15 lg:mb-0 lg:pr-10 ">
        <h1 className='font-bold text-2xl text-center mt-11 text-white'>Contact Us</h1>
        <p className='text-gray-300 text-center mt-5'>For inquiries, support, or feedback, please reach out to us at:</p>
        <div className='flex flex-col items-center gap-3 mt-5'>
           <p className='text-gray-300'>Email:
              <a href="mailto:info@agbayemaara.com" className='text-[#988558] hover:underline'>
                info@agbayemaara.com
              </a>
           </p>
           <p className='text-gray-300'>Phone:
              <a href="tel:+1234567890" className='text-[#988558] hover:underline'>
                 +1 (234) 567-890
              </a>
           </p>
           <p className='text-gray-300'>Address:
              <a href="https://www.google.com/maps/place/123+Fashion+St,+Cityville" target="_blank" rel="noopener noreferrer" className='text-[#988558] hover:underline'>
                 123 Fashion St, Cityville
              </a>
           </p>
           </div>
        </div>
        <div className="shrink-0 w-full lg:w-1/2 mt-5 lg:mt-10 rounded-lg ">
           <form className='flex flex-col items-center gap-5 mt-10 px-5 lg:px-10'>
              
              <input type="text" placeholder='Your Name' className='border border-white rounded-md py-2 px-3 w-full lg:w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-500 '  />

              <input type="email" placeholder='Your Email' className='border border-white rounded-md py-2 px-3 w-full lg:w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-500 ' />

              <textarea placeholder='Your Message' className='border border-white rounded-md py-2 px-3 w-full lg:w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-500 ' />
              <button type='submit' className='bg-[#ec5800] text-white px-4 py-2 rounded hover:bg-blue-600'>Send Message</button>
             </form>
        </div>
      </div>
   )
        

  
}

export default Contact
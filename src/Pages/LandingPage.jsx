import NavBar from '../Components/LandingNavBar'
import Hero from '../Components/Hero'
import Marquee from '../Components/Marquee'
import Footer from '../Components/Footer'
import About from '../Components/About'
import Contact from '../Components/Contact'

const LandingPage = () => {
  return (
   <section className='bg-radial from-black via-zinc-900 to-zinc-900] w-full'>   
      < NavBar />
      <Hero />
        <Marquee />
      <About />
      <Contact />
      <Footer />
   </section>
   )
}

export default LandingPage
import { Outlet } from "react-router-dom";
import Footer from './../Components/Footer';
import ShopNavbar from './../Components/ShopNavbar';


function MainLayout() {
  return (
    <main>
      {/* <ShopNavbar /> */}
      <Outlet />
      <Footer />
    </main>
  );
}

export default MainLayout;
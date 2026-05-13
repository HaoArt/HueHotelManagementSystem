import Header from "../../components/common/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../../components/common/Footer";

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;

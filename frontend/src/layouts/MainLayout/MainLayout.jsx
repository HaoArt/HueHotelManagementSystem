import Header from "../../components/common/Navbar";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="bg-dark text-white py-4 mt-5">
        <Container className="text-center">
          <p className="mb-0">
            © 2026 HuếHotel - Hệ thống Quản lý Khách sạn Cố Đô
          </p>
          <small className="text-muted">
            Đồ án Tốt nghiệp - Hue University of Science
          </small>
        </Container>
      </footer>
    </div>
  );
};

export default MainLayout;

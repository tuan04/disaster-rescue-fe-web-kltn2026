import Footer from "@/components/ui/common/Footer";
import Header from "@/components/ui/common/Header";
import { Outlet } from "react-router-dom";

export default function LandingLayout() {
  return (
    <main>
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
}

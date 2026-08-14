import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/common/Button";
import { CiLogin } from "react-icons/ci";
import { NavLink } from "react-router-dom";

const navItems = [
  { title: "Trang chủ", route: "/" },
  { title: "Về chúng tôi", route: "/about" },
  { title: "Liên hệ", route: "/contact" },
];

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="bg-primary py-4">
        <Container className="flex h-full items-center justify-between">
          <div className="text-white">Logo</div>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.route}
                to={item.route}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-secondary/80 ${
                    isActive ? "text-text-muted" : "text-secondary"
                  }`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>

          <Button className="gap-2 leading-none" onClick={() => setLoginOpen(true)}>
            <CiLogin className="shrink-0" size={20} />
            <span>Đăng nhập</span>
          </Button>
        </Container>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

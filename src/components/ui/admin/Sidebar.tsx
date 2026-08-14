import { NavLink } from "react-router-dom";
import { FaFileAlt, FaHome, FaTachometerAlt, FaUsers } from "react-icons/fa";

type SidebarProps = {
  collapsed: boolean;
};

const navItems = [
  { key: "dashboard", label: "Tổng quan", path: "/admin", icon: FaTachometerAlt, end: true },
  { key: "users", label: "Quản lý người dùng", path: "/admin/users", icon: FaUsers },
  { key: "reports", label: "Báo cáo cứu hộ", path: "/admin/reports", icon: FaFileAlt },
  { key: "home", label: "Về trang chủ", path: "/", icon: FaHome },
];

export default function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={`flex shrink-0 flex-col bg-primary text-white transition-all duration-200 ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
        <span className="whitespace-nowrap text-title-sm font-bold text-secondary">
          {collapsed ? "SOS" : "SOS Admin Panel"}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-primary" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="shrink-0 text-base" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

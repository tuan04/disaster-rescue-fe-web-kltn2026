import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSignOutAlt, FaUser, FaUserCircle } from "react-icons/fa";
import { FiSidebar } from "react-icons/fi";
import Button from "../common/Button";
import Popover from "../common/Popover";

type HeaderProps = {
  collapsed: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ collapsed, onToggleSidebar }: HeaderProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();

  const accountItems = [
    {
      label: "Tài khoản",
      icon: <FaUserCircle />,
      onClick: () => setAccountOpen(false),
    },
    {
      label: "Thông báo",
      icon: <FaBell />,
      onClick: () => setAccountOpen(false),
    },
    {
      label: "Đăng xuất",
      icon: <FaSignOutAlt />,
      onClick: () => navigate("/"),
    },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-surface px-6">
      <Button
        type="button"
        onClick={onToggleSidebar}
        className="bg-white! px-2! text-primary! hover:bg-slate-200!"
        aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
      >
        <FiSidebar size={18} />
      </Button>

      <Popover
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        className="w-64 p-2"
        trigger={
          <Button
            className="gap-3 bg-white! text-primary! hover:bg-slate-200!"
            onClick={() => setAccountOpen((value) => !value)}
          >
            <FaUser size={18}/>
            <span className="hidden text-sm font-medium text-text sm:inline">Administrator</span>
          </Button>
        }
      >
        <div className="flex flex-col py-1">
          {accountItems.map((item) => (
            <Button
              key={item.label}
              type="button"
              className="h-auto! w-full justify-start gap-3 bg-transparent! px-3! py-2! text-left text-sm font-medium text-text! hover:bg-slate-100!"
              onClick={item.onClick}
            >
              <span className="text-primary">{item.icon}</span>
              {item.label}
            </Button>
          ))}
        </div>
      </Popover>
    </header>
  );
}

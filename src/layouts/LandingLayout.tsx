import { Outlet, Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, Info, Map, LayoutDashboard } from 'lucide-react';

export default function LandingLayout() {
  const location = useLocation();

  const navItems = [
    { label: 'Trang chủ', path: '/', icon: <Home size={18} /> },
    { label: 'Giới thiệu', path: '/about', icon: <Info size={18} /> },
    { label: 'Bản đồ cứu hộ', path: '/map', icon: <Map size={18} /> },
    { label: 'Quản trị', path: '/admin', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text)]">
      {/* Sticky Header with Glassmorphism */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl hover:opacity-90 transition-opacity">
            <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
            <span>SOS Rescue</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--primary)] ${isActive
                    ? 'text-[var(--primary)] font-semibold'
                    : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Call to Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:bg-orange-600 dark:hover:bg-orange-500 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-[#1e1e1e] transition-colors py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-lg">
                <AlertTriangle className="h-5 w-5" />
                <span>SOS Rescue System</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Hệ thống cứu hộ thiên tai trực tuyến kết nối khẩn cấp các lực lượng cứu hộ và người gặp nạn trong thời gian thực.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Lối tắt</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-sm text-gray-500 dark:text-gray-400 hover:text-[var(--primary)] transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Liên hệ hỗ trợ</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Đường dây nóng hỗ trợ khẩn cấp: <span className="font-bold text-[var(--danger)]">112</span> hoặc <span className="font-bold text-[var(--danger)]">114</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Email: support@sosrescue.gov.vn
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} SOS Rescue. Thiết kế và phát triển phục vụ cộng đồng.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

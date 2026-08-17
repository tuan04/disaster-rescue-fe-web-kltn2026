import { type ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import type { RoleEnum } from '@/types/auth';
import type { RootState } from '@/store/store';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: RoleEnum[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, accessToken } = useSelector(
    (state: RootState) => state.auth,
  );

  // Chờ bootstrap refresh token hoàn tất để tránh flash redirect
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const hasAuthState = isAuthenticated || Boolean(accessToken) || Boolean(user);

    if (hasAuthState) {
      setIsCheckingAuth(false);
      return;
    }

    // Nếu Redux chưa cập nhật sau khi F5 / reload, chờ 1 nhịp để bootstrap xong
    const timer = window.setTimeout(() => {
      setIsCheckingAuth(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, accessToken, user]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">
        Đang xác thực...
      </div>
    );
  }

  // 1. Chưa đăng nhập => về public
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // 2. Có allowedRoles nhưng role không hợp lệ => về public
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
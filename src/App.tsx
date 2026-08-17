import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import LandingLayout from '@/layouts/LandingLayout';
import MapLayout from '@/layouts/MapLayout';
import AdminLayout from '@/layouts/AdminLayout';

import Home from '@/pages/public/Home';
import About from '@/pages/public/About';
import MapPage from '@/pages/public/MapPage';
import Dashboard from '@/pages/admin/Dashboard';
import Users from '@/pages/admin/Users';
import Reports from '@/pages/admin/Reports';
import { login } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store/store';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { refreshToken } from './services/auth';

function AuthBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated || accessToken) {
      return;
    }

    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const response = await refreshToken();

        if (!isMounted) return;


        if (!response?.accessToken) return;

        dispatch(
          login({
            accessToken: response.accessToken,
            user: response.userInfoResponse ?? null,
          }),
        );
      } catch {
        // Không làm gì ở đây: nếu refresh thất bại, ProtectedRoute sẽ redirect về /
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, isAuthenticated, dispatch]);

  return null;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
    ],
  },
  {
    path: '/map',
    element: <MapLayout />,
    children: [{ index: true, element: <MapPage /> }],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <RouterProvider router={router} />
    </>
  );
}
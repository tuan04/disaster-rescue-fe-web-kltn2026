
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import LandingLayout from '@/layouts/LandingLayout';
import MapLayout from '@/layouts/MapLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Pages
import Home from '@/pages/public/Home';
import About from '@/pages/public/About';
import MapPage from '@/pages/public/MapPage';
import Dashboard from '@/pages/admin/Dashboard';
import Users from '@/pages/admin/Users';
import Reports from '@/pages/admin/Reports';

const router = createBrowserRouter([
  // 1. Landing Layout Group
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
    ],
  },

  // 2. Map Layout Group (Full Screen, No Header/Footer)
  {
    path: '/map',
    element: <MapLayout />,
    children: [
      {
        index: true,
        element: <MapPage />,
      },
    ],
  },

  // 3. Admin Layout Group
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
    ],
  },

  // Fallback Route - Redirect to Home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}


import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '@/App';
import { LoginPage, AdminPage, DashboardPage, ProductDetailPage, ForgotPasswordPage, CheckoutPage, OrderConfirmationPage } from '@/pages';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      // Protected routes - require authentication
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'dashboard/product/:id',
            element: <ProductDetailPage />,
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          {
            path: 'order-confirmation',
            element: <OrderConfirmationPage />,
          },
        ],
      },
    ],
  },
]);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BasketProvider } from '@/features/basket';
import { router } from '@/router';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Make sure there is a <div id="root"></div> in your HTML.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <BasketProvider>
        <RouterProvider router={router} />
      </BasketProvider>
    </ErrorBoundary>
  </StrictMode>,
);

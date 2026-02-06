import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from '@/features/basket';
import './OrderConfirmation.css';

// Generate order number outside component to avoid React purity rules
function generateOrderNumber(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function OrderConfirmation(): React.JSX.Element {
  const { clearBasket } = useBasket();

  // Store order number in state - initialized once via lazy initializer
  const [orderNumber] = useState(generateOrderNumber);

  // Clear basket when order is confirmed
  useEffect(() => {
    clearBasket();
  }, [clearBasket]);

  return (
    <div className="order-confirmation" data-testid="order-confirmation-page">
      <div className="order-confirmation__card">
        <div className="order-confirmation__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="order-confirmation__title" data-testid="order-confirmation-title">
          Thank You for Your Order!
        </h1>

        <p className="order-confirmation__message" data-testid="order-confirmation-message">
          Your order has been successfully placed. We&apos;ll send you an email confirmation
          shortly.
        </p>

        <div className="order-confirmation__details">
          <div className="order-confirmation__detail-row">
            <span>Order Number:</span>
            <span data-testid="order-number">#{orderNumber}</span>
          </div>
          <div className="order-confirmation__detail-row">
            <span>Estimated Delivery:</span>
            <span data-testid="delivery-estimate">3-5 Business Days</span>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="order-confirmation__button"
          data-testid="return-to-dashboard"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

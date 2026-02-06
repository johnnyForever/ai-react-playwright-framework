import type React from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from './BasketContext';
import './BasketIcon.css';

export function BasketIcon(): React.JSX.Element {
  const { getBasketCount } = useBasket();
  const count = getBasketCount();

  return (
    <Link to="/checkout" className="basket-icon" data-testid="basket-icon">
      <svg
        className="basket-icon__svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="basket-icon__count" data-testid="basket-count">
          {count}
        </span>
      )}
      <span className="visually-hidden">Shopping basket</span>
    </Link>
  );
}

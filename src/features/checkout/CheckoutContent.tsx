import { Link } from 'react-router-dom';
import { useBasket } from '@/features/basket';
import type { Product } from '@/types/product';
import './CheckoutContent.css';

function CheckoutItem({ product, onRemove }: { product: Product; onRemove: () => void }): React.JSX.Element {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <article className="checkout-item" data-testid={`checkout-item-${product.id}`}>
      <img
        src={product.imageUrl}
        alt={product.name}
        className="checkout-item__image"
        data-testid={`checkout-item-image-${product.id}`}
      />
      <div className="checkout-item__details">
        <h3 className="checkout-item__name" data-testid={`checkout-item-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="checkout-item__description" data-testid={`checkout-item-description-${product.id}`}>
          {product.description}
        </p>
        <div className="checkout-item__price" data-testid={`checkout-item-price-${product.id}`}>
          {formattedPrice}
        </div>
      </div>
      <button
        type="button"
        className="checkout-item__remove"
        onClick={onRemove}
        data-testid={`checkout-remove-${product.id}`}
        aria-label={`Remove ${product.name} from basket`}
      >
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
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
        Remove
      </button>
    </article>
  );
}

export function CheckoutContent(): React.JSX.Element {
  const { items, removeFromBasket, getBasketTotal, getBasketCount } = useBasket();

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(getBasketTotal());

  const totalQuantity = getBasketCount();

  if (items.length === 0) {
    return (
      <div className="checkout" data-testid="checkout-page">
        <h1 className="checkout__title" data-testid="checkout-title">Checkout</h1>
        <div className="checkout__empty" data-testid="checkout-empty">
          <p>Your basket is empty.</p>
          <Link to="/dashboard" className="checkout__continue-shopping" data-testid="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout" data-testid="checkout-page">
      <h1 className="checkout__title" data-testid="checkout-title">Checkout</h1>
      
      <div className="checkout__content">
        <section className="checkout__items">
          <h2 className="checkout__section-title">Your Items ({totalQuantity})</h2>
          {items.map((product) => (
            <CheckoutItem
              key={product.id}
              product={product}
              onRemove={() => removeFromBasket(product.id)}
            />
          ))}
        </section>

        <aside className="checkout__summary" data-testid="checkout-summary">
          <h2 className="checkout__section-title">Order Summary</h2>
          <div className="checkout__summary-row">
            <span>Total Items:</span>
            <span data-testid="checkout-total-quantity">{totalQuantity}</span>
          </div>
          <div className="checkout__summary-row checkout__summary-row--total">
            <span>Total Price:</span>
            <span data-testid="checkout-total-price">{formattedTotal}</span>
          </div>
          <Link to="/order-confirmation" className="checkout__finish-order" data-testid="finish-order">
            Finish Order
          </Link>
          <Link to="/dashboard" className="checkout__continue-shopping" data-testid="continue-shopping">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

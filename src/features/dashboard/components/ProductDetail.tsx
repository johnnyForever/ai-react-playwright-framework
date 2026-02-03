import { Link } from 'react-router-dom';
import type { Product } from '@/types/product';
import { useBasket } from '@/features/basket';
import './ProductDetail.css';

interface ProductDetailProps {
  product: Product | undefined;
}

export function ProductDetail({ product }: ProductDetailProps): React.JSX.Element {
  const { addToBasket, removeFromBasket, isInBasket } = useBasket();

  if (!product) {
    return (
      <div className="product-detail" data-testid="product-detail-page">
        <Link to="/dashboard" className="product-detail__back" data-testid="back-to-products">
          ← Back to Products
        </Link>
        <div className="product-detail__not-found" data-testid="product-not-found">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const inBasket = isInBasket(product.id);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const handleBasketClick = (): void => {
    if (inBasket) {
      removeFromBasket(product.id);
    } else {
      addToBasket(product);
    }
  };

  return (
    <div className="product-detail" data-testid="product-detail-page">
      <Link to="/dashboard" className="product-detail__back" data-testid="back-to-products">
        ← Back to Products
      </Link>
      <article className="product-detail__card" data-testid="product-detail">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-detail__image"
          data-testid="product-detail-image"
        />
        <div className="product-detail__content">
          <h1 className="product-detail__name" data-testid="product-detail-name">
            {product.name}
          </h1>
          <p className="product-detail__description" data-testid="product-detail-description">
            {product.description}
          </p>
          <div className="product-detail__price" data-testid="product-detail-price">
            {formattedPrice}
          </div>
          <button
            type="button"
            className={`product-detail__basket-btn ${inBasket ? 'product-detail__basket-btn--remove' : ''}`}
            onClick={handleBasketClick}
            data-testid="product-detail-basket-btn"
          >
            {inBasket ? 'Remove from Basket' : 'Add to Basket'}
          </button>
        </div>
      </article>
    </div>
  );
}

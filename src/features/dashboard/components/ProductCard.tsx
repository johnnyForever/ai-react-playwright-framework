import { Link } from 'react-router-dom';
import type { Product } from '@/types/product';
import { useBasket } from '@/features/basket';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  const { addToBasket, removeFromBasket, isInBasket } = useBasket();
  const inBasket = isInBasket(product.id);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const productDetailUrl = `/dashboard/product/${product.id}`;

  const handleBasketClick = (): void => {
    if (inBasket) {
      removeFromBasket(product.id);
    } else {
      addToBasket(product);
    }
  };

  return (
    <article className="product-card" data-testid={`product-card-${product.id}`}>
      <Link to={productDetailUrl} data-testid={`product-image-link-${product.id}`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-card__image"
          data-testid={`product-image-${product.id}`}
        />
      </Link>
      <div className="product-card__content">
        <h3 className="product-card__name">
          <Link
            to={productDetailUrl}
            className="product-card__name-link"
            data-testid={`product-link-${product.id}`}
          >
            {product.name}
          </Link>
        </h3>
        <p className="product-card__description" data-testid={`product-description-${product.id}`}>
          {product.description}
        </p>
        <div className="product-card__footer">
          <div className="product-card__price" data-testid={`product-price-${product.id}`}>
            {formattedPrice}
          </div>
          <button
            type="button"
            className={`product-card__basket-btn ${inBasket ? 'product-card__basket-btn--remove' : ''}`}
            onClick={handleBasketClick}
            data-testid={`product-basket-btn-${product.id}`}
          >
            {inBasket ? 'Remove from Basket' : 'Add to Basket'}
          </button>
        </div>
      </div>
    </article>
  );
}

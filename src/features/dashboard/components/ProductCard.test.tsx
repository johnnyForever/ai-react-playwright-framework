import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithBasket, createMockProduct } from '@/test/testUtils';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = createMockProduct({
    id: '1',
    name: 'Test Product',
    description: 'A great product',
    price: 49.99,
    imageUrl: '/images/product-1.jpg',
  });

  describe('rendering', () => {
    it('should render product card', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
    });

    it('should display product name', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('product-link-1')).toHaveTextContent('Test Product');
    });

    it('should display product description', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('product-description-1')).toHaveTextContent('A great product');
    });

    it('should display formatted price', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('product-price-1')).toHaveTextContent('$49.99');
    });

    it('should display product image', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      const image = screen.getByTestId('product-image-1');
      expect(image).toHaveAttribute('src', '/images/product-1.jpg');
      expect(image).toHaveAttribute('alt', 'Test Product');
    });

    it('should have link to product detail page', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('product-link-1')).toHaveAttribute(
        'href',
        '/dashboard/product/1'
      );
    });

    it('should have image link to product detail page', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      expect(screen.getByTestId('product-image-link-1')).toHaveAttribute(
        'href',
        '/dashboard/product/1'
      );
    });
  });

  describe('basket functionality', () => {
    it('should show "Add to Basket" button by default', () => {
      renderWithBasket(<ProductCard product={mockProduct} />);

      const button = screen.getByTestId('product-basket-btn-1');
      expect(button).toHaveTextContent('Add to Basket');
    });

    it('should add product to basket when clicking "Add to Basket"', async () => {
      const user = userEvent.setup();
      renderWithBasket(<ProductCard product={mockProduct} />);

      const button = screen.getByTestId('product-basket-btn-1');
      await user.click(button);

      expect(button).toHaveTextContent('Remove from Basket');
    });

    it('should remove product from basket when clicking "Remove from Basket"', async () => {
      const user = userEvent.setup();
      renderWithBasket(<ProductCard product={mockProduct} />);

      const button = screen.getByTestId('product-basket-btn-1');
      
      // Add to basket
      await user.click(button);
      expect(button).toHaveTextContent('Remove from Basket');

      // Remove from basket
      await user.click(button);
      expect(button).toHaveTextContent('Add to Basket');
    });

    it('should apply remove class when product is in basket', async () => {
      const user = userEvent.setup();
      renderWithBasket(<ProductCard product={mockProduct} />);

      const button = screen.getByTestId('product-basket-btn-1');
      await user.click(button);

      expect(button).toHaveClass('product-card__basket-btn--remove');
    });
  });

  describe('price formatting', () => {
    it('should format whole number prices', () => {
      const product = createMockProduct({ id: '2', price: 100 });
      renderWithBasket(<ProductCard product={product} />);

      expect(screen.getByTestId('product-price-2')).toHaveTextContent('$100.00');
    });

    it('should format prices with cents', () => {
      const product = createMockProduct({ id: '3', price: 19.95 });
      renderWithBasket(<ProductCard product={product} />);

      expect(screen.getByTestId('product-price-3')).toHaveTextContent('$19.95');
    });

    it('should format large prices with comma separators', () => {
      const product = createMockProduct({ id: '4', price: 1299.99 });
      renderWithBasket(<ProductCard product={product} />);

      expect(screen.getByTestId('product-price-4')).toHaveTextContent('$1,299.99');
    });
  });
});

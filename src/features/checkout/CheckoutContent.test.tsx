import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as BasketContext from '@/features/basket/BasketContext';
import { createMockProduct, renderWithBasket } from '@/test/testUtils';
import type { Product } from '@/types/product';
import { CheckoutContent } from './CheckoutContent';

describe('CheckoutContent', () => {
  const mockProducts: Product[] = [
    createMockProduct({ id: '1', name: 'Product 1', price: 49.99 }),
    createMockProduct({ id: '2', name: 'Product 2', price: 99.99 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty basket', () => {
    it('should show empty message when basket is empty', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-empty')).toBeInTheDocument();
      expect(screen.getByText('Your basket is empty.')).toBeInTheDocument();
    });

    it('should show checkout title when empty', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-title')).toHaveTextContent('Checkout');
    });

    it('should show continue shopping link when empty', () => {
      renderWithBasket(<CheckoutContent />);

      const link = screen.getByTestId('continue-shopping');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('should not show order summary when empty', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.queryByTestId('checkout-summary')).not.toBeInTheDocument();
    });
  });

  describe('basket with items', () => {
    beforeEach(() => {
      vi.spyOn(BasketContext, 'useBasket').mockReturnValue({
        items: mockProducts,
        addToBasket: vi.fn(),
        removeFromBasket: vi.fn(),
        isInBasket: vi.fn(),
        getBasketCount: () => 2,
        getBasketTotal: () => 149.98,
        clearBasket: vi.fn(),
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should render checkout page', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-page')).toBeInTheDocument();
    });

    it('should show checkout title', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-title')).toHaveTextContent('Checkout');
    });

    it('should display all items in basket', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-item-2')).toBeInTheDocument();
    });

    it('should display item names', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-item-name-1')).toHaveTextContent('Product 1');
      expect(screen.getByTestId('checkout-item-name-2')).toHaveTextContent('Product 2');
    });

    it('should display item prices', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-item-price-1')).toHaveTextContent('$49.99');
      expect(screen.getByTestId('checkout-item-price-2')).toHaveTextContent('$99.99');
    });

    it('should display item images', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-item-image-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-item-image-2')).toBeInTheDocument();
    });

    it('should display item descriptions', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-item-description-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-item-description-2')).toBeInTheDocument();
    });

    it('should show order summary', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-summary')).toBeInTheDocument();
    });

    it('should display total quantity', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-total-quantity')).toHaveTextContent('2');
    });

    it('should display total price', () => {
      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-total-price')).toHaveTextContent('$149.98');
    });

    it('should show finish order button', () => {
      renderWithBasket(<CheckoutContent />);

      const finishButton = screen.getByTestId('finish-order');
      expect(finishButton).toBeInTheDocument();
      expect(finishButton).toHaveAttribute('href', '/order-confirmation');
    });

    it('should show continue shopping link', () => {
      renderWithBasket(<CheckoutContent />);

      const link = screen.getByTestId('continue-shopping');
      expect(link).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('remove item functionality', () => {
    it('should have remove button for each item', () => {
      const mockRemoveFromBasket = vi.fn();
      vi.spyOn(BasketContext, 'useBasket').mockReturnValue({
        items: mockProducts,
        addToBasket: vi.fn(),
        removeFromBasket: mockRemoveFromBasket,
        isInBasket: vi.fn(),
        getBasketCount: () => 2,
        getBasketTotal: () => 149.98,
        clearBasket: vi.fn(),
      });

      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-remove-1')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-remove-2')).toBeInTheDocument();

      vi.restoreAllMocks();
    });

    it('should call removeFromBasket when remove button is clicked', async () => {
      const user = userEvent.setup();
      const mockRemoveFromBasket = vi.fn();

      vi.spyOn(BasketContext, 'useBasket').mockReturnValue({
        items: mockProducts,
        addToBasket: vi.fn(),
        removeFromBasket: mockRemoveFromBasket,
        isInBasket: vi.fn(),
        getBasketCount: () => 2,
        getBasketTotal: () => 149.98,
        clearBasket: vi.fn(),
      });

      renderWithBasket(<CheckoutContent />);

      await user.click(screen.getByTestId('checkout-remove-1'));

      expect(mockRemoveFromBasket).toHaveBeenCalledWith('1');

      vi.restoreAllMocks();
    });

    it('should have accessible label for remove button', () => {
      vi.spyOn(BasketContext, 'useBasket').mockReturnValue({
        items: mockProducts,
        addToBasket: vi.fn(),
        removeFromBasket: vi.fn(),
        isInBasket: vi.fn(),
        getBasketCount: () => 2,
        getBasketTotal: () => 149.98,
        clearBasket: vi.fn(),
      });

      renderWithBasket(<CheckoutContent />);

      const removeButton = screen.getByTestId('checkout-remove-1');
      expect(removeButton).toHaveAttribute('aria-label', 'Remove Product 1 from basket');

      vi.restoreAllMocks();
    });
  });

  describe('price formatting', () => {
    it('should format prices with currency symbol', () => {
      vi.spyOn(BasketContext, 'useBasket').mockReturnValue({
        items: [createMockProduct({ id: '1', price: 1000.5 })],
        addToBasket: vi.fn(),
        removeFromBasket: vi.fn(),
        isInBasket: vi.fn(),
        getBasketCount: () => 1,
        getBasketTotal: () => 1000.5,
        clearBasket: vi.fn(),
      });

      renderWithBasket(<CheckoutContent />);

      expect(screen.getByTestId('checkout-item-price-1')).toHaveTextContent('$1,000.50');
      expect(screen.getByTestId('checkout-total-price')).toHaveTextContent('$1,000.50');

      vi.restoreAllMocks();
    });
  });
});

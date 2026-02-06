import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithBasket } from '@/test/testUtils';
import * as BasketContext from './BasketContext';
import { BasketIcon } from './BasketIcon';

describe('BasketIcon', () => {
  it('should render basket icon', () => {
    renderWithBasket(<BasketIcon />);

    expect(screen.getByTestId('basket-icon')).toBeInTheDocument();
  });

  it('should link to checkout page', () => {
    renderWithBasket(<BasketIcon />);

    const link = screen.getByTestId('basket-icon');
    expect(link).toHaveAttribute('href', '/checkout');
  });

  it('should render SVG icon', () => {
    renderWithBasket(<BasketIcon />);

    const svg = screen.getByTestId('basket-icon').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have accessible label for screen readers', () => {
    renderWithBasket(<BasketIcon />);

    expect(screen.getByText('Shopping basket')).toBeInTheDocument();
  });

  it('should not show count badge when basket is empty', () => {
    renderWithBasket(<BasketIcon />);

    expect(screen.queryByTestId('basket-count')).not.toBeInTheDocument();
  });

  it('should show count badge when basket has items', () => {
    // Mock useBasket to return items
    vi.spyOn(BasketContext, 'useBasket').mockReturnValue({
      items: [
        { id: '1', name: 'Product 1', description: 'Desc', price: 10, imageUrl: '/img.jpg' },
        { id: '2', name: 'Product 2', description: 'Desc', price: 20, imageUrl: '/img.jpg' },
      ],
      addToBasket: vi.fn(),
      removeFromBasket: vi.fn(),
      isInBasket: vi.fn(),
      getBasketCount: () => 2,
      getBasketTotal: () => 30,
      clearBasket: vi.fn(),
    });

    renderWithBasket(<BasketIcon />);

    const badge = screen.getByTestId('basket-count');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('2');

    vi.restoreAllMocks();
  });

  it('should display correct count number', () => {
    vi.spyOn(BasketContext, 'useBasket').mockReturnValue({
      items: [{ id: '1', name: 'Product 1', description: 'Desc', price: 10, imageUrl: '/img.jpg' }],
      addToBasket: vi.fn(),
      removeFromBasket: vi.fn(),
      isInBasket: vi.fn(),
      getBasketCount: () => 1,
      getBasketTotal: () => 10,
      clearBasket: vi.fn(),
    });

    renderWithBasket(<BasketIcon />);

    expect(screen.getByTestId('basket-count')).toHaveTextContent('1');

    vi.restoreAllMocks();
  });
});

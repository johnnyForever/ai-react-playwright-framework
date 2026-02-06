import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/types/product';
import { BasketProvider, useBasket } from './BasketContext';

// Helper to create mock products
const createProduct = (id: string, price: number = 10): Product => ({
  id,
  name: `Product ${id}`,
  description: `Description for product ${id}`,
  price,
  imageUrl: `/images/product-${id}.jpg`,
});

describe('BasketContext', () => {
  describe('useBasket hook', () => {
    it('should throw error when used outside BasketProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useBasket());
      }).toThrow('useBasket must be used within a BasketProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('BasketProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BasketProvider>{children}</BasketProvider>
    );

    it('should initialize with empty basket', () => {
      const { result } = renderHook(() => useBasket(), { wrapper });

      expect(result.current.items).toEqual([]);
      expect(result.current.getBasketCount()).toBe(0);
      expect(result.current.getBasketTotal()).toBe(0);
    });

    describe('addToBasket', () => {
      it('should add a product to the basket', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product = createProduct('1', 25);

        act(() => {
          result.current.addToBasket(product);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toEqual(product);
        expect(result.current.getBasketCount()).toBe(1);
      });

      it('should add multiple different products', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product1 = createProduct('1', 25);
        const product2 = createProduct('2', 50);

        act(() => {
          result.current.addToBasket(product1);
          result.current.addToBasket(product2);
        });

        expect(result.current.items).toHaveLength(2);
        expect(result.current.getBasketCount()).toBe(2);
      });

      it('should not add duplicate products', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product = createProduct('1', 25);

        act(() => {
          result.current.addToBasket(product);
          result.current.addToBasket(product);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.getBasketCount()).toBe(1);
      });
    });

    describe('removeFromBasket', () => {
      it('should remove a product from the basket', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product = createProduct('1', 25);

        act(() => {
          result.current.addToBasket(product);
        });

        expect(result.current.items).toHaveLength(1);

        act(() => {
          result.current.removeFromBasket('1');
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.getBasketCount()).toBe(0);
      });

      it('should only remove the specified product', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product1 = createProduct('1', 25);
        const product2 = createProduct('2', 50);

        act(() => {
          result.current.addToBasket(product1);
          result.current.addToBasket(product2);
        });

        act(() => {
          result.current.removeFromBasket('1');
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].id).toBe('2');
      });

      it('should handle removing non-existent product gracefully', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });

        act(() => {
          result.current.removeFromBasket('non-existent');
        });

        expect(result.current.items).toHaveLength(0);
      });
    });

    describe('isInBasket', () => {
      it('should return true for product in basket', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product = createProduct('1');

        act(() => {
          result.current.addToBasket(product);
        });

        expect(result.current.isInBasket('1')).toBe(true);
      });

      it('should return false for product not in basket', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });

        expect(result.current.isInBasket('1')).toBe(false);
      });
    });

    describe('getBasketTotal', () => {
      it('should return 0 for empty basket', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });

        expect(result.current.getBasketTotal()).toBe(0);
      });

      it('should calculate total price correctly', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product1 = createProduct('1', 25.5);
        const product2 = createProduct('2', 74.5);

        act(() => {
          result.current.addToBasket(product1);
          result.current.addToBasket(product2);
        });

        expect(result.current.getBasketTotal()).toBe(100);
      });
    });

    describe('clearBasket', () => {
      it('should remove all items from basket', () => {
        const { result } = renderHook(() => useBasket(), { wrapper });
        const product1 = createProduct('1', 25);
        const product2 = createProduct('2', 50);

        act(() => {
          result.current.addToBasket(product1);
          result.current.addToBasket(product2);
        });

        expect(result.current.items).toHaveLength(2);

        act(() => {
          result.current.clearBasket();
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.getBasketCount()).toBe(0);
        expect(result.current.getBasketTotal()).toBe(0);
      });
    });
  });
});

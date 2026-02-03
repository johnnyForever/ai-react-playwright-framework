import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Product } from '@/types/product';

interface BasketContextType {
  items: Product[];
  addToBasket: (product: Product) => void;
  removeFromBasket: (productId: string) => void;
  isInBasket: (productId: string) => boolean;
  getBasketCount: () => number;
  getBasketTotal: () => number;
  clearBasket: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

interface BasketProviderProps {
  children: ReactNode;
}

export function BasketProvider({ children }: BasketProviderProps): React.JSX.Element {
  const [items, setItems] = useState<Product[]>([]);

  const addToBasket = useCallback((product: Product): void => {
    setItems((prevItems) => {
      // Check if product already in basket (each product can only be added once)
      if (prevItems.some((item) => item.id === product.id)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
  }, []);

  const removeFromBasket = useCallback((productId: string): void => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const isInBasket = useCallback(
    (productId: string): boolean => {
      return items.some((item) => item.id === productId);
    },
    [items]
  );

  const getBasketCount = useCallback((): number => {
    return items.length;
  }, [items]);

  const getBasketTotal = useCallback((): number => {
    return items.reduce((total, item) => total + item.price, 0);
  }, [items]);

  const clearBasket = useCallback((): void => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      addToBasket,
      removeFromBasket,
      isInBasket,
      getBasketCount,
      getBasketTotal,
      clearBasket,
    }),
    [items, addToBasket, removeFromBasket, isInBasket, getBasketCount, getBasketTotal, clearBasket]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketContextType {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
}

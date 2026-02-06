import { type RenderOptions, type RenderResult, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { BasketProvider } from '@/features/basket/BasketContext';

/**
 * Custom render function that wraps components with common providers
 */
interface WrapperProps {
  children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries'];
  withRouter?: boolean;
  withBasket?: boolean;
}

/**
 * Creates a wrapper component with the specified providers
 */
function createWrapper({
  initialEntries = ['/'],
  withRouter = true,
  withBasket = false,
}: CustomRenderOptions = {}): React.FC<WrapperProps> {
  return function Wrapper({ children }: WrapperProps): React.JSX.Element {
    let content = <>{children}</>;

    if (withBasket) {
      content = <BasketProvider>{content}</BasketProvider>;
    }

    if (withRouter) {
      content = <MemoryRouter initialEntries={initialEntries}>{content}</MemoryRouter>;
    }

    return content;
  };
}

/**
 * Custom render with router support
 */
export function renderWithRouter(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
): RenderResult {
  const { initialEntries, withBasket, ...renderOptions } = options;
  return render(ui, {
    wrapper: createWrapper({ initialEntries, withRouter: true, withBasket }),
    ...renderOptions,
  });
}

/**
 * Custom render with basket provider support
 */
export function renderWithBasket(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
): RenderResult {
  const { initialEntries = ['/'], ...renderOptions } = options;
  return render(ui, {
    wrapper: createWrapper({ initialEntries, withRouter: true, withBasket: true }),
    ...renderOptions,
  });
}

/**
 * Custom render with all providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
): RenderResult {
  const { initialEntries = ['/'], ...renderOptions } = options;
  return render(ui, {
    wrapper: createWrapper({ initialEntries, withRouter: true, withBasket: true }),
    ...renderOptions,
  });
}

/**
 * Mock product factory for tests
 */
export function createMockProduct(
  overrides: Partial<import('@/types/product').Product> = {},
): import('@/types/product').Product {
  return {
    id: '1',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    imageUrl: '/test-image.jpg',
    ...overrides,
  };
}

/**
 * Mock user factory for tests
 */
export function createMockUser(
  overrides: Partial<import('@/types/auth').User> = {},
): import('@/types/auth').User {
  return {
    id: '1',
    email: 'test@test.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

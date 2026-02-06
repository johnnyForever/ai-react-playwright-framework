import { useMemo, useState } from 'react';
import type { Product, SortOption } from '@/types/product';
import { ProductCard } from './ProductCard';
import { SortSelector } from './SortSelector';
import './ProductList.css';

interface ProductListProps {
  products: Product[];
}

function sortProducts(products: Product[], sortOption: SortOption): Product[] {
  const sorted = [...products];

  switch (sortOption) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
}

export function ProductList({ products }: ProductListProps): React.JSX.Element {
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  const sortedProducts = useMemo(() => sortProducts(products, sortOption), [products, sortOption]);

  return (
    <section className="product-list">
      <div className="product-list__header">
        <h2 className="product-list__title">Products</h2>
        <SortSelector value={sortOption} onChange={setSortOption} />
      </div>
      <div className="product-list__grid" data-testid="product-grid">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

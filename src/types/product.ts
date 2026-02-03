export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export interface SortConfig {
  value: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
];

import type { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    description: 'High-performance laptop with 16GB RAM, 512GB SSD, and a stunning 15.6" Retina display. Perfect for professionals and creatives.',
    price: 999.99,
    imageUrl: 'https://picsum.photos/seed/laptop/400/300',
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life. Crystal clear audio and comfortable over-ear design.',
    price: 149.99,
    imageUrl: 'https://picsum.photos/seed/headphones/400/300',
  },
  {
    id: '3',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health monitoring, GPS tracking, and seamless smartphone integration. Water-resistant up to 50m.',
    price: 299.99,
    imageUrl: 'https://picsum.photos/seed/watch/400/300',
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches. Customizable backlighting and durable aluminum frame for gaming enthusiasts.',
    price: 89.99,
    imageUrl: 'https://picsum.photos/seed/keyboard/400/300',
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

import { DashboardHeader, ProductList } from '@/features/dashboard';
import { products } from '@/data/products';
import '@/styles/dashboard.css';

export function DashboardPage(): React.JSX.Element {
  return (
    <div className="dashboard-layout">
      <DashboardHeader />
      <main>
        <ProductList products={products} />
      </main>
    </div>
  );
}

import { products } from '@/data/products';
import { DashboardHeader, ProductList } from '@/features/dashboard';
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

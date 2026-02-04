import { useParams } from 'react-router-dom';
import { DashboardHeader, ProductDetail } from '@/features/dashboard';
import { getProductById } from '@/data/products';
import '@/styles/dashboard.css';

export function ProductDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : undefined;

  return (
    <div className="dashboard-layout">
      <DashboardHeader />
      <main>
        <ProductDetail product={product} />
      </main>
    </div>
  );
}

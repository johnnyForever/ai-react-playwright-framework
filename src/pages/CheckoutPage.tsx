import { CheckoutContent } from '@/features/checkout';
import { DashboardHeader } from '@/features/dashboard';
import '@/styles/dashboard.css';

export function CheckoutPage(): React.JSX.Element {
  return (
    <div className="dashboard-layout">
      <DashboardHeader />
      <main>
        <CheckoutContent />
      </main>
    </div>
  );
}

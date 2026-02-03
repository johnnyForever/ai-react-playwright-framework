import { DashboardHeader } from '@/features/dashboard';
import { CheckoutContent } from '@/features/checkout';
import '@/styles/dashboard.css';

export function CheckoutPage(): JSX.Element {
  return (
    <div className="dashboard-layout">
      <DashboardHeader />
      <main>
        <CheckoutContent />
      </main>
    </div>
  );
}

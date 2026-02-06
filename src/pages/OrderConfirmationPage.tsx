import { OrderConfirmation } from '@/features/checkout';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';

export function OrderConfirmationPage(): React.JSX.Element {
  return (
    <>
      <DashboardHeader />
      <OrderConfirmation />
    </>
  );
}

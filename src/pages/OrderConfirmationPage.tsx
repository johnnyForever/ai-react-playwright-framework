import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { OrderConfirmation } from '@/features/checkout';

export function OrderConfirmationPage(): React.JSX.Element {
  return (
    <>
      <DashboardHeader />
      <OrderConfirmation />
    </>
  );
}

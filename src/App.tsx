import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';

export function App(): React.JSX.Element {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}

import { RequireLeader } from '@/features/auth/components/require-leader';
import { ImportChartScreen } from '@/features/cifras/screens/import-chart-screen';

export default function ImportarCifraRoute() {
  return (
    <RequireLeader>
      <ImportChartScreen />
    </RequireLeader>
  );
}

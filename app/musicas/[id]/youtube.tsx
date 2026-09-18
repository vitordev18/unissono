import { RequireLeader } from '@/features/auth/components/require-leader';
import { VideoSearchScreen } from '@/features/youtube/screens/video-search-screen';

export default function BuscarVideoRoute() {
  return (
    <RequireLeader>
      <VideoSearchScreen />
    </RequireLeader>
  );
}

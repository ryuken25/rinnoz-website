'use client';

import { useHashScrollOffset } from '@/hooks/useHashScrollOffset';
import { useNavHeight } from '@/hooks/useNavHeight';

export function SiteShell({ children }: { children: React.ReactNode }) {
  useNavHeight();
  useHashScrollOffset();
  return <>{children}</>;
}

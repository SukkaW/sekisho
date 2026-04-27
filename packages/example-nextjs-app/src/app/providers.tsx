'use client';

import { SekishoProvider } from 'sekisho';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <SekishoProvider onNeedLogin={() => router.push('/login')}>
      {children}
    </SekishoProvider>
  );
}

'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // CRITICAL: basePath points to the admin auth route
    <SessionProvider basePath="/api/admin/auth">
      {children}
    </SessionProvider>
  );
}
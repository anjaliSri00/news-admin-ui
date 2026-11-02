// app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import App from '../App';
import { internalMe } from '@/helper/api_data_store';

export default function Page() {
 
   const { data: session , status} = useSession();

  useEffect(() => {
    if (!session?.accessToken) return;
    (async () => {
      try {
        const { body } = await internalMe(
          process.env.NEXT_PUBLIC_API_URL ?? '',
          session.accessToken,
          session.refreshToken
        );
        if (body.meta.status === 200) {
          // Optional: dispatch to a store, or compare body.data.user.user_types
          // against session.user.userTypes and force re-login if downgraded.
          // console.log('[cms/me] fresh roles:', body.data.user.user_types);
        }
      } catch {
        // 401 will bubble through fetchApiResponseFull; middleware handles redirect
      }
    })();
  }, [session?.accessToken]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8]">
        <span className="font-sans text-[12px] uppercase tracking-widest text-secondary">
          Loading Editorial Desk…
        </span>
      </div>
    );
  }

  if (status === 'unauthenticated') return null; // redirect is in flight

  return <App />;
}
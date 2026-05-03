'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import api from '@/lib/api/client';
import { LoginModal } from '@/components/auth/LoginModal';

interface ProvidersProps {
  children: React.ReactNode;
}

// Default SWR fetcher: hits our axios client, returns response.data.data (unwrapped payload)
const swrFetcher = async (key: string) => {
  const res = await api.get(key);
  return res.data?.data ?? res.data;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          revalidateOnFocus: false,
          dedupingInterval: 30_000,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <LoginModal />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'var(--font-be-vietnam-pro)', fontSize: '14px' },
          }}
        />
      </SWRConfig>
    </SessionProvider>
  );
}

// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const metadata: Metadata = {
  title: 'FORM & FIELD — Editorial CMS',
  description:
    'Editorial CMS & Architecture Dispatch broadsheet dashboard for curatorial intelligence, monograph circulation, and publication workflows.',
  openGraph: {
    title: 'FORM & FIELD — Editorial CMS',
    description:
      'Editorial CMS & Architecture Dispatch broadsheet dashboard for curatorial intelligence, monograph circulation, and publication workflows.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FORM & FIELD — Editorial CMS',
    description:
      'Editorial CMS & Architecture Dispatch broadsheet dashboard for curatorial intelligence, monograph circulation, and publication workflows.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-[#fcf9f8] text-on-surface antialiased selection:bg-primary-container selection:text-white"
        suppressHydrationWarning
      >
        {/* Wrap children in the Provider */}
        <Providers>{children}
          <ToastContainer position="top-right" autoClose={3000} />
        </Providers>
      </body>
    </html>
  );
}
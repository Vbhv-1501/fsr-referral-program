import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Free Study Resources — Referral Contest | Invite Friends & Win ₹5000',
  description: 'Join the Free Study Resources referral contest. Invite your friends to our Telegram channel, earn referral points, climb the leaderboard, and win monthly cash prizes up to ₹5000.',
  keywords: 'free study resources, referral contest, telegram, free courses, win prizes, leaderboard',
  openGraph: {
    title: 'Free Study Resources — Referral Contest',
    description: 'Invite friends to Telegram & Win Monthly Prizes!',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={{ background: '#FAF7F7', color: '#181414' }}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  color: '#181414',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
                success: { iconTheme: { primary: '#B85B5B', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

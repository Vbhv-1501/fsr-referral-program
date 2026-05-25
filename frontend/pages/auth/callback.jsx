// frontend/pages/auth/callback.jsx
// This page handles the Telegram Login Widget redirect-mode callback.
// Telegram redirects here with query params: id, first_name, last_name,
// username, photo_url, auth_date, hash
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../lib/store';

export default function AuthCallback() {
  const router = useRouter();
  const { loginWithTelegram } = useAuthStore();

  useEffect(() => {
    if (!router.isReady) return;

    const {
      id, first_name, last_name, username,
      photo_url, auth_date, hash, ref,
    } = router.query;

    if (!id || !hash) {
      toast.error('Invalid authentication data');
      router.push('/');
      return;
    }

    const telegramData = {
      id,
      first_name,
      last_name,
      username,
      photo_url,
      auth_date,
      hash,
    };

    const doLogin = async () => {
      try {
        await loginWithTelegram(telegramData, ref || null);
        toast.success('Welcome to Free Study Resources! 🎉');
        router.push('/dashboard');
      } catch (err) {
        const msg = err?.response?.data?.error || 'Login failed. Please try again.';
        toast.error(msg);
        setTimeout(() => router.push('/'), 2000);
      }
    };

    doLogin();
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Logging you in… — Free Study Resources</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-brand-yellow border-t-transparent rounded-full"
        />
        <div className="text-center">
          <p className="font-display font-semibold text-brand-white text-lg mb-1">
            Logging you in…
          </p>
          <p className="text-sm text-brand-white-muted">
            Verifying your Telegram identity. This takes a second.
          </p>
        </div>
      </div>
    </>
  );
}

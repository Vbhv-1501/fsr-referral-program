// frontend/components/TelegramLogin.jsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuthStore } from '../lib/store';

const BOT_NAME = process.env.NEXT_PUBLIC_BOT_NAME || 'YourBotName';

export default function TelegramLogin({ onSuccess }) {
  const ref = useRef(null);
  const router = useRouter();
  const { loginWithTelegram } = useAuthStore();

  useEffect(() => {
    if (!ref.current) return;

    const ref_code = router.query.ref || null;

    // Inject Telegram Login Widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-auth-url', `${window.location.origin}/auth/callback`);
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    ref.current.appendChild(script);

    // Or use onauth callback (client-side)
    window.onTelegramAuth = async (user) => {
      const id = toast.loading('Logging you in...');
      try {
        await loginWithTelegram(user, ref_code);
        toast.success('Welcome to FSR! 🎉', { id });
        onSuccess?.();
        router.push('/dashboard');
      } catch (err) {
        const msg = err?.response?.data?.error || 'Login failed. Please try again.';
        toast.error(msg, { id });
      }
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [router.query.ref]);

  return <div ref={ref} />;
}

// ──────────────────────────────────────────────────────────────
// Join Section (full CTA block shown on homepage)
// ──────────────────────────────────────────────────────────────
export function JoinSection() {
  return (
    <section id="join" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-glow text-center"
        >
          {/* Glow behind */}
          <div className="absolute inset-0 rounded-2xl bg-brand-yellow/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 py-4">
            <div className="text-5xl mb-4">🚀</div>
            <span className="section-badge">Join Now — It's Free</span>
            <h2 className="section-title mt-2 mb-3">Start Earning Referrals</h2>
            <p className="text-brand-white-muted text-sm mb-8 max-w-md mx-auto">
              Login with Telegram below. Your referral link is generated instantly.
              No email or password required.
            </p>

            {/* Telegram Widget */}
            <div className="flex justify-center mb-6">
              <TelegramLogin />
            </div>

            <div className="flex items-center gap-3 justify-center text-xs text-brand-white-muted">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure Telegram OAuth
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No spam. Ever.
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free forever
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

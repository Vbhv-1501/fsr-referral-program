// frontend/pages/404.jsx
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="font-display text-8xl font-bold text-brand-yellow/20 mb-4 select-none">
            404
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-white mb-3">
            Page Not Found
          </h1>
          <p className="text-brand-white-muted mb-8 max-w-sm">
            Looks like this page doesn't exist. Head back to safety.
          </p>
          <Link href="/" className="btn-primary">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </>
  );
}

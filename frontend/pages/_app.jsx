// frontend/pages/_app.jsx
import '../styles/globals.css';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../lib/store';

export default function App({ Component, pageProps }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161616',
            color: '#FAFAFA',
            border: '1px solid #222',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#E6B800', secondary: '#0A0A0A' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#FAFAFA' } },
        }}
      />
    </>
  );
}

'use client';
import Image from 'next/image';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/config';

export default function Footer() {
  return (
    <footer style={{ background: '#FFFFFF', color: '#181414', borderTop: '1px solid rgba(80,48,48,0.08)' }} className="py-20">
      <div className="section-shell">
        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3 md:items-start">

          {/* Brand */}
          <div>
            <div className="mb-5 flex justify-center">
              {/*
                FOOTER LOGO PLACEMENT:
                Image file: frontend/public/logo.png
                Recommended size: 400×120px transparent PNG
                For dark background, use a light/white version of logo
                OR save as: frontend/public/logo-white.png (200×60px)
              */}
            <Image
              src="/logo.png"
              alt="Free Study Resources"
              width={140}
              height={42}
              className="h-9 w-auto object-contain"
            />
              <span className="font-black text-lg text-[#181414] hidden">
                Free<span style={{ color: '#B85B5B' }}>Study</span> Resources
              </span>
            </div>
            <p className="mx-auto max-w-sm text-sm leading-relaxed" style={{ color: '#6F6868' }}>
              India's fastest-growing free learning community. Daily free courses, notes, and exam resources on Telegram.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {[
                { href: SOCIAL_LINKS.telegram, label: 'TG', color: '#2AABEE' },
                { href: SOCIAL_LINKS.instagram, label: 'IG', color: '#E1306C' },
                { href: SOCIAL_LINKS.youtube, label: 'YT', color: '#FF0000' },
                { href: SOCIAL_LINKS.twitter, label: 'X', color: '#1DA1F2' },
                { href: SOCIAL_LINKS.whatsapp, label: 'WA', color: '#25D366' },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                  style={{ background: '#FAF7F7', color: '#8C8383', border: '1px solid rgba(80,48,48,0.08)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${s.color}20`;
                    (e.currentTarget as HTMLElement).style.color = s.color;
                    (e.currentTarget as HTMLElement).style.borderColor = `${s.color}40`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '#FAF7F7';
                    (e.currentTarget as HTMLElement).style.color = '#8C8383';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(80,48,48,0.08)';
                  }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-[#181414] mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#6F6868' }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/winners', label: 'Past Winners' },
                { href: '/register', label: 'Join Contest' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href}
                    className="transition-colors hover:text-[#B85B5B]"
                    style={{ color: 'inherit' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[#181414] mb-4 text-sm">Legal & Support</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#6F6868' }}>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: 'mailto:support@freestudyresources.in', label: 'Contact Support' },
                { href: SOCIAL_LINKS.telegram, label: 'Telegram Channel', external: true },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href}
                    target={l.external ? '_blank' : undefined}
                    rel={l.external ? 'noopener noreferrer' : undefined}
                    className="transition-colors hover:text-[#B85B5B]"
                    style={{ color: 'inherit' }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 pt-8 text-center"
          style={{ borderTop: '1px solid rgba(80,48,48,0.08)' }}>
          <p className="text-xs" style={{ color: '#8C8383' }}>
            © {new Date().getFullYear()} Free Study Resources. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#8C8383' }}>Built for learners. Made in India.</p>
        </div>
      </div>
    </footer>
  );
}


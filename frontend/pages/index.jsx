// frontend/pages/index.jsx
import Head from 'next/head';
import Hero from '../components/Hero';
import { LiveStats, HowItWorks, RewardsSection, FAQ } from '../components/Sections';
import LeaderboardPreview from '../components/LeaderboardPreview';
import { JoinSection } from '../components/TelegramLogin';

const SOCIAL_LINKS = [
  { name: 'Telegram', url: 'https://t.me/teamfreestudyresources', icon: '✈️', color: 'from-blue-500/20 to-blue-700/5', border: 'border-blue-500/20', desc: 'Main community & updates' },
  { name: 'YouTube', url: '#', icon: '▶️', color: 'from-red-500/20 to-red-700/5', border: 'border-red-500/20', desc: 'Video lectures & guides' },
  { name: 'Instagram', url: '#', icon: '📸', color: 'from-pink-500/20 to-pink-700/5', border: 'border-pink-500/20', desc: 'Daily study tips' },
  { name: 'WhatsApp', url: '#', icon: '💬', color: 'from-green-500/20 to-green-700/5', border: 'border-green-500/20', desc: 'Quick help & support' },
];

function SocialHub() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow mb-4">
            🌐 Community
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-white">
            Join Our Social Hub
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SOCIAL_LINKS.map(({ name, url, icon, color, border, desc }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-2xl border ${border} bg-gradient-to-b ${color} p-5 text-center hover:scale-105 transition-transform duration-200 group`}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-display font-semibold text-brand-white text-sm mb-1">{name}</div>
              <div className="text-xs text-brand-white-muted">{desc}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-brand-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-brand-yellow flex items-center justify-center font-display font-bold text-brand-black text-xs">
                FSR
              </div>
              <span className="font-display font-semibold text-brand-white">Free Study Resources</span>
            </div>
            <p className="text-xs text-brand-white-muted">
              Empowering students with free quality resources.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-brand-white-muted">
            <a href="/privacy" className="hover:text-brand-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-brand-white transition-colors">Terms of Service</a>
            <a href="mailto:support@freestudyresources.in" className="hover:text-brand-white transition-colors">Contact</a>
            <a href="https://t.me/teamfreestudyresources" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors">
              Telegram ↗
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-border/40 text-center text-xs text-brand-white-muted">
          © {new Date().getFullYear()} Free Study Resources. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Free Study Resources — Referral Contest | Win Monthly Prizes</title>
        <meta
          name="description"
          content="Invite friends to the Free Study Resources Telegram channel and win monthly cash prizes. Join thousands of students competing on our live leaderboard."
        />
        <meta property="og:title" content="Free Study Resources Referral Contest" />
        <meta property="og:description" content="Invite friends & win up to ₹5,000 every month!" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative z-10">
        <Hero />
        <LiveStats />
        <HowItWorks />
        <LeaderboardPreview />
        <RewardsSection />
        <SocialHub />
        <JoinSection />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}

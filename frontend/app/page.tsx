import { Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import LeaderboardPreview from '@/components/landing/LeaderboardPreview';
import RewardsSection from '@/components/landing/RewardsSection';
import SocialHub from '@/components/landing/SocialHub';
import FAQ from '@/components/landing/FAQ';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF7F7]">
      <Navbar />
      <Suspense fallback={null}>
        <HeroSection />
      </Suspense>
      <HowItWorks />
      <RewardsSection />
      <LeaderboardPreview />
      <SocialHub />
      <FAQ />
      <Footer />
    </main>
  );
}

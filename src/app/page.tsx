// Bhai ye home page h — SSG (Static Site Generation) se ultimate fast render hota h
// AppNavbar + UpgradePage + Testimonials = poora landing page
import UpgradePage from './upgrade/page';
import { AppNavbar } from '@/components/layout/AppNavbar';
import dynamic from 'next/dynamic';

const Testimonials = dynamic(() =>
  import('@/components/home/Testimonials').then((m) => m.Testimonials)
);

export default function Home() {
  return (
    <main>
      <AppNavbar user={null} />
      <UpgradePage />
      {/* AppInstallGuide moved to UpgradePage */}
      <Testimonials />
    </main>
  );
}

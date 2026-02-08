// Bhai ye home page h — SSG (Static Site Generation) se ultimate fast render hota h
// AppNavbar + UpgradePage + Testimonials = poora landing page
import UpgradePage from "./upgrade/page";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <main>
      <AppNavbar user={null} />
      <UpgradePage />
      <Testimonials />
    </main>
  );
}

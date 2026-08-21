import { AmbientBackground } from "@/components/AmbientBackground";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ReciterSelector } from "@/components/ReciterSelector";
import { SurahBrowser } from "@/components/SurahBrowser";
import { AmbientSelector } from "@/components/AmbientSelector";
import { RecitationView } from "@/components/RecitationView";
import { PlayerBar } from "@/components/PlayerBar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AmbientBackground />
      <Header />
      <main className="relative z-10 pb-48 sm:pb-40">
        <Hero />
        <ReciterSelector />
        <SurahBrowser />
        <AmbientSelector />
        <RecitationView />
      </main>
      <Footer />
      <PlayerBar />
    </>
  );
}
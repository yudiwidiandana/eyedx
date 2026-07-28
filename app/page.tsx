import Header from "./components/Header";
import HeroSection from "./components/HeroSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 flex flex-col">
        <HeroSection />
      </main>
    </div>
  );
}

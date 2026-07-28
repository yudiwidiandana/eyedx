import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import { type Locale } from "./lib/translations";

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header locale={locale} />
      <main className="flex flex-1 flex-col">
        <HeroSection locale={locale} />
      </main>
    </div>
  );
}

export default function Home() {
  return <HomePage locale="en" />;
}

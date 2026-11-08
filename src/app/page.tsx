import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Ticker } from "@/components/landing/ticker";
import { Work } from "@/components/landing/work";
import { FilmStrip } from "@/components/landing/film-strip";
import { Services } from "@/components/landing/services";
import { About } from "@/components/landing/about";
import { Testimonials } from "@/components/landing/testimonials";
import { Process } from "@/components/landing/process";
import { Faq } from "@/components/landing/faq";
import { Waveform } from "@/components/landing/waveform";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { ScrollFx } from "@/components/landing/scroll-fx";
import { SectionRail } from "@/components/landing/section-rail";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import { BriefDialog } from "@/components/landing/brief-dialog";
import { getSiteData } from "@/lib/site-data";

/* Render per request so Recent cuts / showreel edits made in /admin
   appear on the portfolio immediately — no rebuild needed. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const { cuts, showreel } = await getSiteData();

  return (
    <SmoothScroll>
      <div className="flex min-h-screen flex-col bg-ink text-bone">
        <ScrollFx />
        <SectionRail />
        <Nav />
        <main className="flex-1">
          <Hero reel={showreel} />
          <Ticker />
          <Work cuts={cuts} />
          <FilmStrip />
          <Services />
          <About />
          <Testimonials />
          <Process />
          <Faq />
          <Waveform label="A1 — LET'S TALK / SOUND ON" />
          <Contact />
        </main>
        <Footer />
      </div>
      <BriefDialog />
    </SmoothScroll>
  );
}

import type { Metadata } from "next";
import Checker from "@/components/checker";
import DitherImage from "@/components/dither-image";
import PaperPanel from "@/components/paper-panel";

export const metadata: Metadata = {
  title: "Colophon — bambino",
  description: "About Lorenzo Scardicchio and how this site is made.",
};

export default function AboutPage() {
  return (
    <main className="pb-32">
      <header className="mx-auto w-[min(1100px,94vw)] pt-20 lg:pt-6">
        <div className="mono-label flex items-center justify-between border-b border-ink-2 pb-3">
          <span className="inline-flex items-center gap-3">
            <Checker /> [ COLOPHON ]
          </span>
          <span>BY WAY OF INTRODUCTION</span>
        </div>
      </header>

      <section className="mx-auto mt-16 grid w-[min(1100px,94vw)] grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="figlabel lg:hidden">
            <em>fig 00</em> — THE AUTHOR, SOMEWHERE WITH CHECKERED FLOORS
          </div>
          <div className="frame fig-hover relative" data-fx-drift="24" data-rot="-1.4">
            <DitherImage
              src="/art/IMG_5663.jpg"
              aspect="4 / 5"
              colorBack="#e3e6d8"
              colorFront="#464b36"
            />
            <span className="fig-chip">
              <em>fig 00</em>—THE AUTHOR, SOMEWHERE WITH CHECKERED FLOORS
            </span>
          </div>
        </div>

        <div>
          <h1
            className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[1] font-[380]"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            A Portrait <em>of</em>
            <br />
            Lorenzo Scardicchio
          </h1>

          <div className="prose-book mt-10">
            <p>
              Lorenzo Scardicchio is a philosopher and the founder of Journey
              Nudge, where he builds holistic technology that nudges people
              toward who they want to be. He paints, designs, and writes — and
              he is suspicious of any machine that wants his attention more
              than he does.
            </p>
            <p>
              The essays collected here first appeared in his Substack
              newsletter. They circle a single question from many directions:
              in an economy engineered to harvest human attention, what does it
              take to keep hold of your own mind — and to point it at a life
              worth wanting?
            </p>
          </div>

          <div className="mono-label mt-10 flex flex-wrap gap-x-8 gap-y-3">
            <a
              href="https://lorenzoscardicchio.substack.com"
              target="_blank"
              rel="noreferrer"
            >
              SUBSTACK ↗
            </a>
            <a
              href="https://lorenzoscardicchio.com"
              target="_blank"
              rel="noreferrer"
            >
              ARTWORK ↗
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-28 w-[min(860px,92vw)]">
        <PaperPanel tint="blue" className="px-7 py-9 sm:px-14 sm:py-12">
          <div className="mono-label pb-6">
            <Checker /> &nbsp;HOW THIS SITE IS MADE
          </div>
          <div className="prose-book text-[1.02rem]">
            <p>
              Display type is <em>Blacker Pro Display Light</em>, with{" "}
              <em>Source Serif</em> for text and <em>Paper Mono</em> — the
              open-source monospace by Paper — for everything that ticks.
              Textures and dithering are drawn live in WebGL by Paper Shaders.
              Built with Next.js and Tailwind, typeset like a book, and
              designed after an evening spent reading Stripe Press editions
              and wishing the web looked more like them.
            </p>
          </div>
        </PaperPanel>
      </section>
    </main>
  );
}

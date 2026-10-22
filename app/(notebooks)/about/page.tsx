import Link from "next/link";
import type { Metadata } from "next";
import Checker from "@/components/checker";
import PaperPanel from "@/components/paper-panel";

export const metadata: Metadata = {
  title: "About — Lorenzo Scardicchio",
  description: "Lorenzo Scardicchio, and what inspires the paintings and the essays.",
};

export default function AboutPage() {
  return (
    <main className="pb-32">
      <header className="mx-auto w-[min(1100px,94vw)] pt-6">
        <div className="mono-label flex items-center justify-between border-b border-ink-2 pb-3">
          <span className="inline-flex items-center gap-3">
            <Checker /> [ ABOUT ]
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art/IMG_5663.jpg"
              alt="Lorenzo Scardicchio, somewhere with checkered floors"
              className="block aspect-[4/5] w-full object-cover"
            />
            <span className="fig-chip">
              <em>fig 00</em>—THE AUTHOR, SOMEWHERE WITH CHECKERED FLOORS
            </span>
          </div>

          {/* the portrait, below the picture */}
          <h1 className="mt-14 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1] font-[400]">
            A Portrait <em>of</em>
            <span className="signature">Lorenzo Scardicchio</span>
          </h1>
          <div className="prose-book mt-8">
            <p>
              Lorenzo Scardicchio is a philosopher and the founder of Journey
              Nudge, where he builds holistic technology that nudges people
              toward who they want to be. He paints, designs, and writes, and
              he is suspicious of any machine that wants his attention.
            </p>
            <p>
              The essays collected here first appeared in his Substack
              newsletter. They circle a single question from many directions:
              in an economy engineered to harvest human attention, what does it
              take to keep hold of your own mind, and to point it at a life
              worth wanting?
            </p>
          </div>
          <div className="mono-label mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <a
              href="https://lorenzoscardicchio.substack.com"
              target="_blank"
              rel="noreferrer"
            >
              SUBSTACK ↗
            </a>
            <Link href="/gallery">THE GALLERY →</Link>
          </div>
        </div>

        {/* what inspires the work, on a sheet that rolls up as you read on */}
        <div>
          <PaperPanel tint="blue" className="px-7 pt-14 pb-24 sm:px-11 sm:pt-20 sm:pb-32">
            <div className="mono-label pb-8">
              <Checker /> &nbsp;WHAT INSPIRES THE WORK
            </div>
            <div className="sheet-prose">
              <p>
                I grew up in the back of a coffee shop. My family ran it, and most
                of what I know about paying attention I learned there, from the
                old-timers at the card table, who could read a whole hand in the
                way a man set down his cup. The shuffle of the deck, the clink of
                the cups, the long afternoon light on a checkered floor. I have
                been trying to get that feeling into things ever since.
              </p>
              <p>
                The paintings come from the same place. I paint quick and thick,
                and I like a colour next to the one it isn&rsquo;t supposed to sit
                beside. A window with a light left on. A rose on black. A
                chessboard coming apart. I am not trying to make something pretty;
                I am trying to make something that holds still long enough to be
                looked at twice.
              </p>
              <p>
                The essays are the other half of the same argument. I build
                technology for a living, and I have spent years uncomfortably
                close to the machines that farm human attention. So I write about
                what they take, and about the slower things that give it back: a
                phone face down on the table, a long walk, a partner who reminds
                you that the body is the primary source and the ring is only the
                interpreter. Charlie Munger taught me to look for the incentive.
                The card players taught me to look for the tell. This whole site
                is me trying to do both at once.
              </p>
            </div>
          </PaperPanel>
        </div>
      </section>

      <div className="h-[30svh]" aria-hidden />
    </main>
  );
}

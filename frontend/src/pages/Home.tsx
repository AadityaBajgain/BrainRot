import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <main className="flex flex-col gap-12 pb-16">
      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <span className="inline-flex items-center rounded-full border border-black/20 px-4 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-black/70">
            Brainrot Study
          </span>
          <h1 className="mt-6 font-['Bebas_Neue'] text-5xl uppercase leading-[0.95] tracking-[0.02em] text-black md:text-7xl">
            Brainrot study material, on demand.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-black/70 md:text-xl">
            Upload a PDF or describe the topic. Get a short, memeified explanation
            instantly.
          </p>
          <span className="mt-3 block text-xs uppercase tracking-[0.3em] text-black/40">
            Powered by a local LLM - private and offline-ready.
          </span>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              to="/create"
              className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Generate Now
            </Link>
          </div>
        </div>
      </section>

      <h1 className="text-center text-black/70 text-4xl">How It Works</h1>
      <section id="how" className="border-y border-black/10 py-8">
        <div className="grid gap-4 text-sm text-black/70 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              Step 1
            </p>
            <p className="mt-2 text-base text-black">Add a PDF or topic.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              Step 2
            </p>
            <p className="mt-2 text-base text-black">Pick a style + chaos.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              Step 3
            </p>
            <p className="mt-2 text-base text-black">Get a compact summary.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;

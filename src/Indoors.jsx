// src/Indoors.jsx — jogous.io/indoors, the pitch to indoor facilities.
//
// The link we send to facility owners (DMs, Instagram bio, a text to a
// manager). Same Matchday language as the homepage. Applying happens in the
// app (+ → Create game → "Own an indoor?"), reviewed by hand in Jogo-admin.
// Money copy matches the decided model: the indoor keeps its full price; what
// the player pays covers Jogo's 5% and the card fee (the app's withFee).

import React, { useState, useEffect } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Check, ArrowRight, Mail } from 'lucide-react';

import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import jogoLogo from './assets/jogo-logo-2026.png';
import { EASE, DISPLAY, BODY, useMatchdayFonts, Reveal, Band, StoreRow } from './App.jsx';

const CONTACT = 'mailto:jogo.tech@outlook.com?subject=' + encodeURIComponent('Hosting my indoor on Jogo');

// Illustrative slots, drawn like the app's game cards.
const SLOTS = [
  { when: 'TONIGHT', time: '8 PM', left: '4 spots left', price: '$12' },
  { when: 'TONIGHT', time: '9 PM', left: '7 spots left', price: '$12' },
  { when: 'SAT', time: '10 AM', left: 'Full', price: '$10' },
];

const STEPS = [
  { n: '01', t: 'Set up your page', b: 'Banner, logo, address and socials. Players follow you and see everything you post.' },
  { n: '02', t: 'Post your open hours', b: 'Pick the hours, set a price per player (or make it free) and the min and max players.' },
  { n: '03', t: 'Players book and pay', b: 'Each hour becomes a game on Jogo, with its own page, chat and share link. Players pay up front.' },
];

const GETS = [
  'Your slots on Home for players nearby',
  'Your own page that players follow',
  'Paid up front, straight to your bank through Stripe',
  'A chat with every game’s players',
  'Share links made for Instagram and group chats',
];

function SlotCard({ s, i }) {
  const full = s.left === 'Full';
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.25 + i * 0.12, ease: EASE }}
      className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.55)]"
    >
      <div className="w-[68px] h-[68px] rounded-xl bg-[#0B0D10] text-white flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-extrabold tracking-[0.14em] text-[#4ADE80]">{s.when}</span>
        <span style={DISPLAY} className="text-2xl leading-tight">{s.time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[#0B0D10] font-extrabold text-[15px] truncate">Your indoor · Court 1</div>
        <div className={`text-sm font-semibold ${full ? 'text-[#9CA3AF]' : 'text-[#15803D]'}`}>{s.left}</div>
      </div>
      <div style={DISPLAY} className="text-2xl text-[#0B0D10]">{s.price}</div>
    </motion.div>
  );
}

export default function Indoors() {
  useMatchdayFonts();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'Host your indoor on Jogo';
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#EDEEF1] text-[#0B0D10] antialiased overflow-x-hidden" style={BODY}>
        <style>{`html { scroll-behavior: smooth; } ::selection { background: rgba(22,163,74,0.3); } .hp-anchor { scroll-margin-top: 96px; }`}</style>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-6 pt-3">
          <div
            className={`max-w-6xl mx-auto flex items-center justify-between rounded-2xl pl-4 pr-2 py-2 border transition-all duration-300 ${
              scrolled ? 'bg-[#0B0D10]/85 border-white/10 shadow-xl shadow-black/20 backdrop-blur-xl' : 'bg-white/5 border-white/10 backdrop-blur-md'
            }`}
          >
            <a href="/" aria-label="Jogo" className="flex items-center gap-3">
              <img src={jogoLogoWhite} alt="Jogo" className="h-[20px] sm:h-[22px] w-auto" />
              <span className="hidden sm:inline text-[11px] font-extrabold tracking-[0.18em] uppercase text-white/50">for indoors</span>
            </a>
            <a href="#apply" className="bg-white text-[#0B0D10] rounded-xl px-4 py-2 text-sm font-extrabold hover:bg-white/90 transition-colors">
              Apply to host
            </a>
          </div>
        </header>

        <main>
          {/* ── HERO ───────────────────────────────────────────────────── */}
          <section className="relative bg-[#0B0D10] text-white overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-28">
            <Band className="max-lg:hidden w-[40vw] max-w-[560px] h-[180%] -top-[40%] right-[-8vw]" opacity={0.9} />
            <Band className="lg:hidden w-[60vw] h-[120%] top-[45%] right-[-30vw]" opacity={0.8} />

            <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-10 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-white/60 mb-7"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  For indoor facilities
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.06, ease: EASE }}
                  style={DISPLAY}
                  className="uppercase text-[3.4rem] leading-[0.98] sm:text-[6rem] lg:text-[5.8rem]"
                >
                  Your empty hours.<br />
                  <span className="text-[#16A34A]">Full of players.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="mt-6 text-lg sm:text-xl text-white/70 max-w-lg leading-relaxed font-medium"
                >
                  Jogo puts your open court time in front of players nearby who are looking for a game tonight. They book, they pay, they show up.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <a href="#apply" className="inline-flex items-center gap-2 bg-white text-[#0B0D10] rounded-xl px-6 py-3.5 font-extrabold text-base hover:bg-white/90 transition-colors">
                    Apply to host <ArrowRight size={18} />
                  </a>
                  <a href={CONTACT} className="inline-flex items-center gap-2 border border-white/20 text-white rounded-xl px-6 py-3.5 font-extrabold text-base hover:bg-white/10 transition-colors">
                    <Mail size={17} /> Talk to us
                  </a>
                </motion.div>

                <div className="mt-10 flex items-center gap-8">
                  {[
                    { v: '5,000+', l: 'Players' },
                    { v: '2,000+', l: 'Games created' },
                  ].map((s) => (
                    <div key={s.l}>
                      <span style={DISPLAY} className="block text-3xl sm:text-4xl text-white">{s.v}</span>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-white/50">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto space-y-3">
                {SLOTS.map((s, i) => <SlotCard key={i} s={s} i={i} />)}
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
          <section className="px-5 sm:px-8 py-20 sm:py-28">
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <div className="text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-emerald-700 mb-4">How it works</div>
                <h2 style={DISPLAY} className="uppercase text-[2.8rem] leading-[1.02] sm:text-6xl lg:text-7xl max-w-3xl">
                  Set up once.<br /><span className="text-[#15803D]">Fill it every week.</span>
                </h2>
              </Reveal>
              <div className="mt-12 grid md:grid-cols-3 gap-4">
                {STEPS.map((s, i) => (
                  <Reveal key={s.n} delay={i * 0.08}>
                    <div className="h-full bg-white rounded-3xl p-7 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.25)]">
                      <span style={DISPLAY} className="text-5xl text-[#16A34A]">{s.n}</span>
                      <h3 className="mt-4 text-xl font-extrabold">{s.t}</h3>
                      <p className="mt-2 text-[#4B5563] leading-relaxed font-medium">{s.b}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── MONEY ──────────────────────────────────────────────────── */}
          <section className="relative bg-[#0B0D10] text-white overflow-hidden px-5 sm:px-8 py-20 sm:py-28">
            <Band className="max-lg:hidden w-[30vw] max-w-[420px] h-[170%] -top-[35%] right-[-8vw]" opacity={0.75} />
            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <div className="text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-emerald-300/90 mb-4">Your price</div>
                <h2 style={DISPLAY} className="uppercase text-[2.8rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                  You set it.<br /><span className="text-[#4ADE80]">You keep it.</span>
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl text-white/65">
                  Players pay your price plus a service fee on top, so our cut and the card fees never come out of yours. Payouts go straight to your bank through Stripe.
                </p>
                <ul className="space-y-3 mt-7">
                  {GETS.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-[15px] sm:text-base font-semibold text-white/80">
                      <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-400/15 text-emerald-300">
                        <Check size={12} strokeWidth={3.5} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="bg-white text-[#0B0D10] rounded-3xl p-7 sm:p-8 max-w-md lg:ml-auto">
                  <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-[#6B7280]">One player, one hour</div>
                  {[
                    { k: 'Your price', v: '$10.00' },
                    { k: 'Service fee, paid by the player', v: '+ $1.13' },
                  ].map((r) => (
                    <div key={r.k} className="flex justify-between items-baseline py-4 border-b border-[#E5E7EB]">
                      <span className="font-semibold text-[#4B5563]">{r.k}</span>
                      <span className="font-extrabold">{r.v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-baseline pt-4">
                    <span className="font-extrabold">Player pays</span>
                    <span style={DISPLAY} className="text-3xl">$11.13</span>
                  </div>
                  <div className="mt-6 rounded-2xl bg-[#ECFDF3] px-5 py-4 flex justify-between items-baseline">
                    <span className="font-extrabold text-[#15803D]">You get</span>
                    <span style={DISPLAY} className="text-3xl text-[#15803D]">$10.00</span>
                  </div>
                  <p className="mt-3 text-xs text-[#9CA3AF] font-medium">No card fees off your price. Free games cost you nothing.</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── APPLY ──────────────────────────────────────────────────── */}
          <section id="apply" className="hp-anchor px-5 sm:px-8 py-20 sm:py-28">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
              <Reveal>
                <div className="text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-emerald-700 mb-4">Apply to host</div>
                <h2 style={DISPLAY} className="uppercase text-[2.8rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                  Takes five<br /><span className="text-[#15803D]">minutes.</span>
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl text-[#4B5563]">
                  We review every indoor by hand, usually within a day. No contracts, no monthly fee.
                </p>
                <StoreRow className="mt-8" />
                <a href={CONTACT} className="mt-6 inline-flex items-center gap-2 font-extrabold hover:text-[#16A34A] transition-colors">
                  Rather talk first? Email us <ArrowRight size={18} />
                </a>
              </Reveal>

              <Reveal delay={0.1}>
                <ol className="bg-white rounded-3xl p-7 sm:p-8 space-y-6 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.25)]">
                  {[
                    { t: 'Get Jogo', b: 'Free on iPhone and Android.' },
                    { t: 'Tap + then Create game', b: 'You’ll see “Own an indoor?” right under the game name.' },
                    { t: 'Build your page', b: 'Banner, logo, address and socials. Send it for review.' },
                    { t: 'Post your hours', b: 'Once you’re approved, your slots go live for players nearby.' },
                  ].map((s, i) => (
                    <li key={s.t} className="flex gap-4">
                      <span className="w-9 h-9 rounded-full bg-[#0B0D10] text-white flex items-center justify-center flex-shrink-0 font-extrabold">{i + 1}</span>
                      <div>
                        <div className="font-extrabold text-lg">{s.t}</div>
                        <div className="text-[#4B5563] font-medium">{s.b}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="bg-[#EDEEF1] pb-10 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-[#DDE1E5]">
            <a href="/"><img src={jogoLogo} alt="Jogo" className="h-6 w-auto" /></a>
            <p className="text-xs text-[#9CA3AF] font-medium">© {new Date().getFullYear()} Jogo. Pioneered in New Jersey by players, for players.</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

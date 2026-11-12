// src/WhatsNew.jsx — the 2.3 drop (jogous.io/whats-new)
//
// Laid out like a release drop, in the homepage's Matchday language (Anton
// display caps, Barlow body, ink / green band / gold — shared pieces from
// App.jsx): a hero with the sideways scoreboard, a tracklist of what's in the
// drop, then a chapter per track:
//   01 King of the field — set it, rule it, run it (kotf1, kotf2, kotf3)
//   02 The coin toss     — a gold section, the coin on loop (KOTFFLIP → coinflip.webp)
//   03 Jogo Indoors      — winter: indoor games, verified indoor hosts, indoor pages
//   04 Host on Jogo      — paid games, or bring your indoor (links /indoors)
// Screenshots are 640px webp copies in src/assets/release (PNGs next to them).
//
// Rules: copy only describes what the app really does. Indoor money copy
// follows Indoors.jsx: no fee math, never "free forever", players need the app
// to book and pay. Don't name a facility as a partner unless they are one.

import React from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { ArrowRight, ArrowDown, Check, BadgeCheck, MapPin, Bell, KeyRound, Ticket, Building2 } from 'lucide-react';
import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import appIcon from './assets/jogo-app-icon.png';
import { EASE, DISPLAY, BODY, useMatchdayFonts, Reveal, Band, StoreRow, Phone } from './App.jsx';
import kotfSetup from './assets/release/kotf1.webp';
import kotfRules from './assets/release/kotf2.webp';
import kotfBoard from './assets/release/kotf3.webp';
import coinFlip from './assets/release/coinflip.webp';
import indoorGame from './assets/release/indoor01.webp';
import hostPick from './assets/release/indoor02.webp';
import indoorPage from './assets/release/indoor03.webp';
import indoorAbout from './assets/release/indoor04.webp';

const VERSION = '2.3';
const PAPER = '#F3F1EA';

const TRACKS = [
  { n: '01', href: '#king-of-the-field', title: 'King of the field', sub: 'The whole night, one phone' },
  { n: '02', href: '#coin-toss', title: 'The coin toss', sub: 'Draws, settled' },
  { n: '03', href: '#indoors', title: 'Jogo Indoors', sub: 'Winter, handled' },
  { n: '04', href: '#host', title: 'Host on Jogo', sub: 'Run games. Fill your fields.' },
];

// The scoreboard is drawn sideways inside a portrait capture: stand the phone
// on its side and turn the screenshot upright, the way the host holds it.
function LandscapePhone({ src, alt, className = '', eager = false }) {
  return (
    <div className={`rounded-[6%/13%] p-[1.3%] bg-[#16181C] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/10 ${className}`}>
      <div className="relative rounded-[5%/11%] overflow-hidden bg-black" style={{ aspectRatio: '1939 / 864' }}>
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          className="absolute top-1/2 left-1/2 block max-w-none"
          style={{ width: `${(864 / 1939) * 100}%`, aspectRatio: '864 / 1939', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
        />
      </div>
    </div>
  );
}

function Kicker({ children, className = '', color = 'text-[#16A34A]' }) {
  return <div className={`text-[11px] sm:text-xs font-extrabold tracking-[0.24em] uppercase ${color} ${className}`}>{children}</div>;
}

// The chapter opener: a huge outlined track number and the chapter name.
function Chapter({ n, label, dark = false, onGold = false }) {
  const stroke = onGold ? 'rgba(11,13,16,0.85)' : dark ? 'rgba(255,255,255,0.22)' : 'rgba(11,13,16,0.18)';
  return (
    <div className="flex items-end gap-4 sm:gap-6">
      <span
        aria-hidden="true"
        style={{ ...DISPLAY, WebkitTextStroke: `2px ${stroke}`, color: 'transparent' }}
        className="text-[5.5rem] sm:text-[9rem] leading-[0.85] select-none"
      >
        {n}
      </span>
      <Kicker className="pb-2 sm:pb-4" color={onGold ? 'text-[#0B0D10]' : dark ? 'text-[#F5C542]' : 'text-[#0E7A43]'}>
        Track {n} · {label}
      </Kicker>
    </div>
  );
}

function Line({ children, dark = false }) {
  return (
    <li className={`flex items-start gap-3 text-[15px] sm:text-base leading-relaxed ${dark ? 'text-white/75' : 'text-[#374151]'}`}>
      <Check size={18} strokeWidth={3} className={`mt-0.5 flex-shrink-0 ${dark ? 'text-[#F5C542]' : 'text-[#16A34A]'}`} />
      <span>{children}</span>
    </li>
  );
}

// Falling snow for the winter chapter (decorative; off with reduced motion).
const FLAKES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 9 + ((i * 13) % 9),
  delay: -((i * 11) % 17),
  drift: ((i % 5) - 2) * 14,
  opacity: 0.25 + ((i * 3) % 5) / 10,
  top: (i * 29) % 96, // where it rests when motion is off
}));

export default function WhatsNew() {
  useMatchdayFonts();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    const previous = document.title;
    document.title = `Jogo ${VERSION}: the winter drop`;
    return () => { document.title = previous; };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div style={BODY} className="min-h-screen bg-[#0B0D10] text-white antialiased overflow-x-hidden scroll-smooth">
        <style>{`
          @keyframes wn-snow {
            0% { transform: translate3d(0,-10vh,0); }
            100% { transform: translate3d(var(--drift),110vh,0); }
          }
          .wn-flake { animation: wn-snow linear infinite; }
          .wn-anchor { scroll-margin-top: 16px; }
          .wn-strike { position: relative; }
          .wn-strike::after {
            content: ''; position: absolute; left: -4%; right: -4%; top: 52%; height: 0.09em;
            background: #F5C542; transform: rotate(-4deg);
          }
          @media (prefers-reduced-motion: reduce) {
            .wn-flake { animation: none; }
            .wn-flake { top: var(--rest) !important; }
          }
          ::selection { background: rgba(245,197,66,0.35); }
        `}</style>

        {/* ── HERO ───────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden">
          <Band className="w-[42vw] max-w-[620px] h-[220%] -top-[60%] right-[-20vw] sm:right-[-4vw]" opacity={0.9} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 50% at 20% 0%, rgba(245,197,66,0.10), transparent 70%)' }} />

          <nav className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-5 flex items-center justify-between">
            <a href="/" aria-label="Jogo"><img src={jogoLogoWhite} alt="Jogo" className="h-[22px] w-auto" /></a>
            <a href="#get" className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.16em] bg-white text-[#0B0D10] rounded-full px-4 py-2 hover:bg-white/90 transition-colors">
              Get {VERSION}
            </a>
          </nav>

          <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20 sm:pb-28 grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-12 lg:gap-6 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3 mb-6">
                <span style={DISPLAY} className="bg-[#16A34A] text-white text-sm px-2.5 py-0.5 rounded-md tracking-wide">DROP {VERSION}</span>
                <Kicker color="text-white/55">The winter drop</Kicker>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
                style={DISPLAY}
                className="uppercase text-[3.4rem] leading-[0.98] sm:text-[5.4rem] lg:text-[4.5rem] xl:text-[5rem]"
              >
                No off&#8209;season.<br />
                <span className="text-[#F5C542]">No stopwatch.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="text-white/65 text-lg sm:text-xl mt-6 max-w-lg leading-relaxed"
              >
                King of the field now runs the whole night from one phone. And when the cold hits,
                the game moves indoors.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}>
                <StoreRow invert className="mt-9" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
              className="relative"
            >
              <LandscapePhone
                src={kotfBoard}
                alt="The sideways scoreboard: Orange 0, Green 0, 6:54 on the clock, first to 2, Black next"
                className="w-full max-w-[640px] mx-auto"
                eager
              />
              <div className="absolute -bottom-6 left-[6%] rotate-6 bg-[#F5C542] text-[#0B0D10] rounded-xl px-4 py-2 shadow-xl">
                <span style={DISPLAY} className="uppercase text-lg sm:text-xl tracking-wide">Turn it sideways</span>
              </div>
            </motion.div>
          </div>
        </header>

        <main>
          {/* ── TRACKLIST ────────────────────────────────────────────── */}
          <section style={{ background: PAPER }} className="text-[#0B0D10] px-5 sm:px-8 py-16 sm:py-24">
            <div className="max-w-6xl mx-auto">
              <Reveal className="flex items-end justify-between gap-6 flex-wrap mb-8 sm:mb-12">
                <h2 style={DISPLAY} className="uppercase text-[2.6rem] leading-none sm:text-7xl">In this drop</h2>
                <Kicker color="text-[#0E7A43]">Jogo {VERSION} · iPhone &amp; Android</Kicker>
              </Reveal>
              <ol className="border-t-2 border-[#0B0D10]">
                {TRACKS.map((t, i) => (
                  <Reveal key={t.n} delay={i * 0.05}>
                    <li>
                      <a href={t.href} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-8 py-5 sm:py-7 border-b border-[#0B0D10]/15 hover:bg-[#0B0D10]/[0.03] transition-colors">
                        <span style={DISPLAY} className="text-3xl sm:text-5xl text-[#0E7A43] w-12 sm:w-20">{t.n}</span>
                        <span>
                          <span style={DISPLAY} className="block uppercase text-2xl sm:text-5xl leading-none group-hover:text-[#0E7A43] transition-colors">{t.title}</span>
                          <span className="block text-sm sm:text-base text-[#6B7280] font-semibold mt-1.5">{t.sub}</span>
                        </span>
                        <ArrowDown size={22} className="text-[#0B0D10]/40 group-hover:text-[#0E7A43] group-hover:translate-y-1 transition-all" />
                      </a>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </section>

          {/* ── 01 KING OF THE FIELD ─────────────────────────────────── */}
          <section id="king-of-the-field" className="wn-anchor relative overflow-hidden px-5 sm:px-8 py-20 sm:py-32">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(50% 40% at 85% 10%, rgba(245,197,66,0.12), transparent 70%)' }} />
            <div className="relative max-w-6xl mx-auto">
              <Reveal>
                <Chapter n="01" label="King of the field" dark />
                <h2 style={DISPLAY} className="uppercase text-[2.45rem] min-[400px]:text-[2.8rem] leading-[1.02] sm:text-7xl lg:text-8xl mt-6 max-w-4xl">
                  Run the whole night<br /><span className="text-[#F5C542]">from one phone.</span>
                </h2>
                <p className="text-white/60 text-lg sm:text-xl mt-6 max-w-2xl leading-relaxed">
                  Pick the matchup, set the rules, hit Kick off. Jogo keeps the clock, blows the
                  whistle, sends the winner back out and rolls the next team in. You just play.
                </p>
              </Reveal>

              {/* Set it → Rule it → Run it */}
              <div className="relative mt-16 sm:mt-24">
                <div aria-hidden="true" className="hidden lg:block absolute top-[34px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="grid lg:grid-cols-3 gap-14 lg:gap-10">
                  {[
                    { k: 'Set it', src: kotfSetup, alt: 'Kickoff screen: Green vs Black first, Orange next', copy: 'Pick who plays first. Every squad and the line, on one screen.' },
                    { k: 'Rule it', src: kotfRules, alt: 'Match rules: 7 minute games, first to 2', copy: '5 or 7 minutes, or any length. Add a goal limit like first to 2.' },
                    { k: 'Run it', src: null, copy: 'Phone sideways: a full-screen scoreboard with one-tap goals. The whistle goes off at full time, even with the app closed.' },
                  ].map((s, i) => (
                    <Reveal key={s.k} delay={i * 0.08} className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <span style={DISPLAY} className="w-[68px] h-[68px] rounded-full bg-[#0B0D10] ring-2 ring-[#F5C542] text-[#F5C542] text-2xl flex items-center justify-center relative z-10">{i + 1}</span>
                        <span style={DISPLAY} className="uppercase text-3xl sm:text-4xl">{s.k}</span>
                      </div>
                      <p className="text-white/60 text-[15px] leading-relaxed mt-4 max-w-sm">{s.copy}</p>
                      <div className="mt-7 flex-1 flex items-start justify-center">
                        {s.src ? (
                          <Phone src={s.src} alt={s.alt} className={`w-[64%] max-w-[250px] ${i === 0 ? '-rotate-3' : 'rotate-3'}`} />
                        ) : (
                          <div className="w-full lg:mt-24">
                            <LandscapePhone src={kotfBoard} alt="Full-screen scoreboard with a 6:54 clock and goal buttons" className="w-full max-w-[460px] mx-auto rotate-2" />
                          </div>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* What it replaces */}
              <Reveal className="mt-20 sm:mt-28 border-y border-white/10 py-10 sm:py-14">
                <Kicker color="text-white/45" className="mb-6">What it replaces</Kicker>
                <div style={DISPLAY} className="uppercase text-[2rem] leading-[1.25] sm:text-6xl sm:leading-[1.2] flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-2 text-white/35">
                  <span className="wn-strike">Stopwatch app</span>
                  <span className="wn-strike">Notes app</span>
                  <span className="wn-strike">The whistle</span>
                  <span className="wn-strike">The argument</span>
                  <span className="text-white inline-flex items-center gap-4"><ArrowRight className="text-[#F5C542]" size={44} /> Jogo</span>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3 mt-10 max-w-4xl">
                  <Line dark>Winner stays on, loser goes to the back. The next team slides in by itself.</Line>
                  <Line dark>A game ends at full time or at the goal limit, whichever comes first.</Line>
                  <Line dark>Live standings: wins, draws, losses and goal difference.</Line>
                  <Line dark>Scored one wrong? The host can fix any game, and the table follows.</Line>
                </ul>
              </Reveal>
            </div>
          </section>

          {/* ── 02 COIN TOSS ─────────────────────────────────────────── */}
          <section id="coin-toss" className="wn-anchor relative overflow-hidden bg-[#F5C542] text-[#0B0D10] px-5 sm:px-8 py-20 sm:py-32">
            <div aria-hidden="true" style={{ ...DISPLAY, WebkitTextStroke: '2px rgba(11,13,16,0.08)', color: 'transparent' }} className="absolute -right-[4vw] top-1/2 -translate-y-1/2 text-[38vw] leading-none select-none pointer-events-none hidden lg:block">
              50/50
            </div>
            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 lg:gap-12 items-center">
              <Reveal>
                <Chapter n="02" label="The coin toss" onGold />
                <h2 style={DISPLAY} className="uppercase text-[3.4rem] leading-[0.98] sm:text-8xl lg:text-[7.5rem] mt-6">
                  Tied?<br />Flip for it.
                </h2>
                <p className="text-[#0B0D10]/75 text-lg sm:text-xl mt-6 max-w-lg leading-relaxed font-semibold">
                  When a game ends level, the Jogo coin decides who stays on. The team that was on
                  calls it. The host flips. Nobody argues with a coin.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-9 max-w-md">
                  <div className="bg-[#0B0D10] text-white rounded-2xl p-5">
                    <Kicker color="text-[#F5C542]">Heads</Kicker>
                    <img src={jogoLogoWhite} alt="Jogo" className="h-5 w-auto mt-3" />
                  </div>
                  <div className="bg-[#0B0D10] text-white rounded-2xl p-5">
                    <Kicker color="text-[#F5C542]">Tails</Kicker>
                    <div style={DISPLAY} className="uppercase text-2xl leading-none mt-2.5 text-[#F5C542]">The crown</div>
                  </div>
                </div>

                <ul className="space-y-3 mt-9 max-w-lg">
                  {[
                    'A true 50/50, locked the moment it\'s flipped.',
                    'It only picks who stays on. The game still counts as a draw.',
                    'Old school? Skip the toss and the usual rule decides.',
                    'Night over? Snap the winning team and post the King of the field poster.',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-[15px] sm:text-base font-semibold text-[#0B0D10]/80">
                      <span className="mt-1 w-4 h-4 rounded-full bg-[#0B0D10] flex items-center justify-center flex-shrink-0">
                        <Check size={10} strokeWidth={4} className="text-[#F5C542]" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.1} className="flex justify-center">
                <Phone
                  src={coinFlip}
                  alt="The Jogo coin toss: a team calls it, the coin spins and lands, the winner stays on"
                  className="w-[66%] max-w-[300px] rotate-3 shadow-[0_50px_90px_-30px_rgba(11,13,16,0.7)]"
                />
              </Reveal>
            </div>
          </section>

          {/* ── 03 INDOORS ───────────────────────────────────────────── */}
          <section id="indoors" className="wn-anchor relative overflow-hidden px-5 sm:px-8 py-20 sm:py-32" style={{ background: 'linear-gradient(180deg, #0A1220 0%, #0B0D10 100%)' }}>
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
              {FLAKES.map((f, i) => (
                <span
                  key={i}
                  className="wn-flake absolute top-0 rounded-full bg-white"
                  style={{ left: `${f.left}%`, width: f.size, height: f.size, opacity: f.opacity, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, '--drift': `${f.drift}px`, '--rest': `${f.top}%` }}
                />
              ))}
            </div>
            <div className="relative max-w-6xl mx-auto">
              <Reveal>
                <Chapter n="03" label="Jogo Indoors" dark />
                <h2 style={DISPLAY} className="uppercase text-[2.45rem] min-[400px]:text-[2.8rem] leading-[1.02] sm:text-7xl lg:text-8xl mt-6 max-w-5xl">
                  Winter isn&apos;t the<br /><span className="text-[#60A5FA]">off&#8209;season</span> anymore.
                </h2>
              </Reveal>

              <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-14 lg:gap-16 items-center mt-12 sm:mt-16">
                <Reveal>
                  <blockquote className="border-l-4 border-[#16A34A] pl-5 sm:pl-7">
                    <p style={DISPLAY} className="uppercase text-2xl sm:text-4xl leading-[1.15]">
                      Indoor facilities are partnering with Jogo to keep the games going all winter, and
                      to keep them affordable for everyone who wants to play.
                    </p>
                  </blockquote>

                  {/* The indoor game, as a matchday ticket */}
                  <div className="mt-10 bg-white text-[#0B0D10] rounded-2xl overflow-hidden flex shadow-2xl max-w-md">
                    <div className="flex-1 min-w-0 p-5 sm:p-6">
                      <Kicker color="text-[#0E7A43]">Indoor · King of the field</Kicker>
                      <div style={DISPLAY} className="uppercase text-3xl leading-none mt-2">Indoor Footy</div>
                      <div className="text-sm text-[#6B7280] font-semibold mt-2">Thu, Nov 12 · 8–9 PM · Union, NJ</div>
                      <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#0E7A43] mt-3">
                        <BadgeCheck size={15} className="flex-shrink-0" /> Verified Jogo Indoor Host
                      </div>
                    </div>
                    <div className="relative w-[32%] bg-[#0B0D10] text-white flex flex-col items-center justify-center p-3 border-l-2 border-dashed border-white/30">
                      <div style={DISPLAY} className="text-[1.7rem] sm:text-4xl leading-none">$12.78</div>
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/55 mt-1.5 text-center">per player</div>
                    </div>
                  </div>

                  <ul className="space-y-3 mt-10">
                    <Line dark>Games from Verified Jogo Indoor Hosts, with the price per player up front.</Line>
                    <Line dark>Join and pay right in the app, and see the refund cutoff before you commit.</Line>
                    <Line dark>Every indoor gets its own page. Follow it to hear the moment new times drop.</Line>
                    <Line dark>Hours, a map and one-tap directions. Rent a whole field for your group.</Line>
                  </ul>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm font-bold text-white/70">
                    <span className="inline-flex items-center gap-2"><Bell size={16} className="text-[#60A5FA]" /> Follow indoors</span>
                    <span className="inline-flex items-center gap-2"><KeyRound size={16} className="text-[#60A5FA]" /> Rent a field</span>
                    <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[#60A5FA]" /> Directions</span>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="relative flex justify-center items-start">
                    <Phone src={indoorPage} alt="Jogo Indoor facility page: verified on Jogo, Follow, Join a game, Rent a field" className="w-[44%] max-w-[230px] -rotate-6 mt-10" />
                    <Phone src={indoorGame} alt="Indoor Footy: indoor King of the field from a verified indoor host, $12.78 per player" className="w-[48%] max-w-[250px] -ml-[8%] rotate-3 relative z-10" />
                    <Phone src={indoorAbout} alt="Indoor about section with hours, map and directions" className="hidden sm:block w-[36%] max-w-[190px] -ml-[10%] mt-24 rotate-[8deg]" />
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── 04 HOST ON JOGO ──────────────────────────────────────── */}
          <section id="host" className="wn-anchor relative overflow-hidden px-5 sm:px-8 py-20 sm:py-32" style={{ background: PAPER }}>
            <div className="relative max-w-6xl mx-auto text-[#0B0D10]">
              <Reveal>
                <Chapter n="04" label="Host on Jogo" />
                <h2 style={DISPLAY} className="uppercase text-[2.45rem] min-[400px]:text-[2.8rem] leading-[1.02] sm:text-7xl lg:text-8xl mt-6">
                  Don&apos;t just <span className="whitespace-nowrap">play it.</span><br /><span className="text-[#0E7A43]">Run it.</span>
                </h2>
                <p className="text-[#4B5563] text-lg sm:text-xl mt-6 max-w-2xl leading-relaxed">
                  Every game starts from the same New game screen. Free pickup is open to everyone.
                  Ready for more? Two ways to go bigger this winter.
                </p>
              </Reveal>

              <div className="grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-6 lg:gap-8 items-center mt-14">
                <Reveal className="bg-[#0B0D10] text-white rounded-3xl p-7 sm:p-9 h-full">
                  <Ticket size={28} className="text-[#F5C542]" />
                  <div style={DISPLAY} className="uppercase text-4xl sm:text-5xl leading-none mt-5">Run paid games</div>
                  <Kicker color="text-[#F5C542]" className="mt-3">For verified hosts</Kicker>
                  <p className="text-white/65 text-[15px] leading-relaxed mt-4">
                    Get verified as a host, set the price per player, and players join and pay in the app.
                  </p>
                  <div className="mt-6 text-sm font-bold text-white/80">In the app: New game → Paid games</div>
                </Reveal>

                <Reveal delay={0.08} className="flex justify-center">
                  <Phone src={hostPick} alt="New game screen: Free pickup, Paid games for verified hosts, and Own an indoor? Host on Jogo" className="w-[60%] max-w-[250px] lg:w-[230px]" />
                </Reveal>

                <Reveal delay={0.16} className="relative bg-[#0E7A43] text-white rounded-3xl p-7 sm:p-9 h-full overflow-hidden">
                  <Band className="w-[40%] h-[260%] -top-[80%] -right-[18%]" color="#16A34A" opacity={0.55} />
                  <div className="relative">
                    <Building2 size={28} className="text-white" />
                    <div style={DISPLAY} className="uppercase text-4xl sm:text-5xl leading-none mt-5">Own an indoor?</div>
                    <Kicker color="text-white/75" className="mt-3">For facilities</Kicker>
                    <p className="text-white/85 text-[15px] leading-relaxed mt-4">
                      Your empty hours, full of players. Put your times on Jogo and let the local soccer
                      community fill them.
                    </p>
                    <a href="/indoors" className="inline-flex items-center gap-2 mt-6 bg-white text-[#0B0D10] rounded-full px-5 py-2.5 text-sm font-extrabold hover:bg-white/90 transition-colors">
                      Jogo for indoors <ArrowRight size={16} />
                    </a>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── GET IT ───────────────────────────────────────────────── */}
          <section id="get" className="wn-anchor relative overflow-hidden px-5 sm:px-8 py-24 sm:py-36">
            <Band className="w-[34vw] max-w-[480px] h-[200%] -top-[50%] right-[-16vw] sm:right-[-6vw]" opacity={0.85} />
            <Reveal className="relative max-w-6xl mx-auto">
              <img src={appIcon} alt="" className="w-14 h-14 rounded-2xl mb-8" />
              <Kicker color="text-white/50" className="mb-4">Jogo {VERSION} · Free on iPhone &amp; Android</Kicker>
              <h2 style={DISPLAY} className="uppercase text-[3.6rem] leading-[0.98] sm:text-8xl lg:text-9xl">
                Update.<br /><span className="text-[#16A34A]">Lace up.</span>
              </h2>
              <StoreRow invert className="mt-10" />
              <a href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-white/55 hover:text-white mt-8 transition-colors">
                New to Jogo? See how it works <ArrowRight size={14} />
              </a>
            </Reveal>
          </section>
        </main>

        <footer className="border-t border-white/10 px-5 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
            <span>© {new Date().getFullYear()} Jogo · Made in New Jersey</span>
            <nav className="flex items-center gap-4">
              <a href="/policy" className="hover:text-white">Privacy</a>
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/support" className="hover:text-white">Support</a>
              <a href="mailto:jogo.tech@outlook.com" className="hover:text-white">Contact</a>
            </nav>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

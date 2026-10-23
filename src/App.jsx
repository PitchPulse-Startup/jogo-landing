// src/App.jsx — jogous.io homepage.
//
// Drawn in the app's own Matchday language (ink posters, a diagonal green
// band, Anton for the big moments, Barlow for the rest) and built around real
// current screenshots — same rule as WhatsNew.jsx: copy only describes what
// those screens actually show, never a feature the app doesn't have.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig, AnimatePresence } from 'framer-motion';
import { Check, Coffee, ArrowRight } from 'lucide-react';

import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import jogoLogo from './assets/jogo-logo-2026.png';
import matchday from './assets/2.1.0/Screenshot_20261009-121904.png';
import kingMatchday from './assets/2.1.0/Screenshot_20261009-123555.png';
import crewPage from './assets/2.1.0/Screenshot_20261009-123633.png';
import pickKing from './assets/2.1.0/Screenshot_20261009-123657.png';
import newCrew from './assets/2.1.0/newcrew.png';
import gameScreen from './assets/2.0.1Finalized/Screenshot_20260930-114838.png';
import statsScreen from './assets/2.0.1Finalized/Screenshot_20260930-114850.png';
import leaderboard from './assets/2.0.1Finalized/Screenshot_20260930-114855.png';
import { APP_STORE_URL, PLAY_STORE_URL, PlayLogo, AppleLogo, isAndroid } from './appLinks';

const EASE = [0.22, 1, 0.36, 1];
const INK = '#0B0D10';
// Anton at display sizes, uppercase. Web doesn't clip Anton the way iOS does,
// so it can sit tighter than the app's 1.25 line height.
const DISPLAY = { fontFamily: "'Anton', Impact, sans-serif", fontWeight: 400, letterSpacing: '0.005em' };
const BODY = { fontFamily: "'Barlow', system-ui, sans-serif" };

const NAV = [
  { href: '#find', label: 'Find a game' },
  { href: '#crews', label: 'Crews' },
  { href: '#compete', label: 'Compete' },
  { href: '#stats', label: 'Stats' },
];

const TICKER = ['Pickup', 'Crews', 'Mini tournaments', 'King of the field', 'Leaderboards', 'Stats', 'Crew chat', 'Matchday'];

function useMatchdayFonts() {
  useEffect(() => {
    if (document.getElementById('jogo-programme-fonts')) return;
    const link = document.createElement('link');
    link.id = 'jogo-programme-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);
}

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// The screenshots are 864×1939 Android captures, so the frame keeps that ratio.
function Phone({ src, alt, className = '', eager = false }) {
  return (
    <div className={`rounded-[13%/6%] p-[2.6%] bg-[#111111] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10 ${className}`}>
      <div className="rounded-[11%/5%] overflow-hidden bg-[#EDEEF1]" style={{ aspectRatio: '864 / 1939' }}>
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} className="w-full h-full object-cover object-top block" />
      </div>
    </div>
  );
}

// Two overlapping phones, the front one dropped lower.
function PhonePair({ back, front }) {
  return (
    <div className="flex justify-center items-start">
      <Phone {...back} className="w-[46%] max-w-[240px] -rotate-3" />
      <Phone {...front} className="w-[46%] max-w-[240px] mt-12 sm:mt-16 -ml-[7%] rotate-3 relative z-10" />
    </div>
  );
}

// The app's diagonal poster band.
function Band({ className = '', color = '#0E7A43', opacity = 1 }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none ${className}`}
      style={{ background: color, opacity, transform: 'rotate(24deg)' }}
    />
  );
}

function StoreButton({ store, invert = false }) {
  const apple = store === 'apple';
  return (
    <motion.a
      href={apple ? APP_STORE_URL : PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-2.5 rounded-xl px-5 py-3 sm:px-6 sm:py-3.5 transition-colors ${
        invert ? 'bg-white text-[#0B0D10] hover:bg-white/90' : 'bg-[#0B0D10] text-white hover:bg-[#1F2937]'
      }`}
    >
      {apple ? <AppleLogo size={22} /> : <PlayLogo size={20} />}
      <span className="text-left leading-tight">
        <span className={`block text-[10px] font-medium leading-none mb-0.5 ${invert ? 'text-black/55' : 'text-white/60'}`}>
          {apple ? 'Download on the' : 'Get it on'}
        </span>
        <span className="block text-base sm:text-lg font-extrabold leading-none">{apple ? 'App Store' : 'Google Play'}</span>
      </span>
    </motion.a>
  );
}

// Both stores, the visitor's own one first.
function StoreRow({ invert = false, className = '' }) {
  const order = isAndroid ? ['play', 'apple'] : ['apple', 'play'];
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {order.map((s) => <StoreButton key={s} store={s} invert={invert} />)}
    </div>
  );
}

function Kicker({ n, children, dark = false }) {
  return (
    <div className={`flex items-center gap-3 mb-4 text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase ${dark ? 'text-emerald-300/90' : 'text-emerald-700'}`}>
      <span style={DISPLAY} className="text-lg sm:text-xl tracking-normal">{n}</span>
      <span className={`h-px w-8 ${dark ? 'bg-emerald-400/50' : 'bg-emerald-700/40'}`} />
      {children}
    </div>
  );
}

function Points({ items, dark = false }) {
  return (
    <ul className="space-y-3 mt-7">
      {items.map((t) => (
        <li key={t} className={`flex items-start gap-3 text-[15px] sm:text-base font-semibold ${dark ? 'text-white/80' : 'text-[#374151]'}`}>
          <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            <Check size={12} strokeWidth={3.5} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function Ticker() {
  const loop = [...TICKER, ...TICKER];
  return (
    <div className="bg-[#0B0D10] border-t border-white/10">
    <div className="relative overflow-hidden py-5 sm:py-6 hp-fade-x">
      <div className="hp-marquee flex items-center gap-10 sm:gap-14 w-max">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center gap-10 sm:gap-14 whitespace-nowrap text-white/35 text-lg sm:text-2xl uppercase" style={DISPLAY}>
            {t}
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          </span>
        ))}
      </div>
    </div>
    </div>
  );
}

// One feature: copy on one side, a phone pair on the other.
function Feature({ id, n, kicker, title, accent, body, points, phones, dark = false, flip = false, children }) {
  return (
    <div id={id} className="hp-anchor relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <Reveal className={flip ? 'lg:order-2' : ''}>
        <Kicker n={n} dark={dark}>{kicker}</Kicker>
        <h2 style={DISPLAY} className={`uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl ${dark ? 'text-white' : 'text-[#0B0D10]'}`}>
          {title}<br />
          <span className={dark ? 'text-[#4ADE80]' : 'text-[#15803D]'}>{accent}</span>
        </h2>
        <p className={`mt-5 text-base sm:text-lg leading-relaxed max-w-xl ${dark ? 'text-white/65' : 'text-[#4B5563]'}`}>{body}</p>
        <Points items={points} dark={dark} />
        {children}
      </Reveal>
      <Reveal delay={0.12} className={flip ? 'lg:order-1' : ''}>
        <PhonePair {...phones} />
      </Reveal>
    </div>
  );
}

export default function App() {
  useMatchdayFonts();
  const [scrolled, setScrolled] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      setShowSticky(window.scrollY > 520);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#EDEEF1] text-[#0B0D10] antialiased overflow-x-hidden" style={BODY}>
        <style>{`
          html { scroll-behavior: smooth; }
          ::selection { background: rgba(22,163,74,0.3); }
          .hp-anchor { scroll-margin-top: 96px; }
          @keyframes hp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .hp-marquee { animation: hp-marquee 48s linear infinite; }
          .hp-fade-x { -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
          @media (prefers-reduced-motion: reduce) { .hp-marquee { animation: none; } }
        `}</style>

        {/* ── HEADER — floating pill ─────────────────────────────────── */}
        <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-6 pt-3">
          <div
            className={`max-w-6xl mx-auto flex items-center justify-between rounded-2xl pl-4 pr-2 py-2 border transition-all duration-300 ${
              scrolled ? 'bg-[#0B0D10]/85 border-white/10 shadow-xl shadow-black/20 backdrop-blur-xl' : 'bg-white/5 border-white/10 backdrop-blur-md'
            }`}
          >
            <a href="/" aria-label="Jogo" className="flex items-center">
              <img src={jogoLogoWhite} alt="Jogo" className="h-[20px] sm:h-[22px] w-auto" />
            </a>
            <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-white/70">
              {NAV.map((l) => (
                <a key={l.href} href={l.href} className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors">{l.label}</a>
              ))}
              <Link to="/whats-new" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5">
                What's new
                <span className="text-[10px] font-extrabold bg-[#16A34A] text-white rounded-full px-1.5 py-0.5 leading-none">2.1</span>
              </Link>
            </nav>
            <div className="inline-flex items-center bg-white text-[#0B0D10] rounded-xl pl-3 pr-1 py-1 gap-1">
              <span className="text-xs font-extrabold pr-1">Get the app</span>
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store"
                className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors">
                <AppleLogo size={14} />
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play"
                className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors">
                <PlayLogo size={12} />
              </a>
            </div>
          </div>
        </header>

        {/* ── STICKY MOBILE CTA ──────────────────────────────────────── */}
        <AnimatePresence>
          {showSticky && (
            <motion.div
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              exit={{ y: 120 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed bottom-0 inset-x-0 z-50 md:hidden px-4"
              style={{
                paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
                paddingTop: 14,
                background: 'linear-gradient(to top, rgba(11,13,16,0.95) 60%, rgba(11,13,16,0))',
              }}
            >
              <div className={`flex gap-2.5 ${isAndroid ? 'flex-row-reverse' : ''}`}>
                {[
                  { href: APP_STORE_URL, icon: <AppleLogo size={18} />, label: 'App Store' },
                  { href: PLAY_STORE_URL, icon: <PlayLogo size={16} />, label: 'Google Play' },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-[#0B0D10] font-extrabold py-3.5 rounded-xl text-[15px] active:opacity-80">
                    {s.icon}{s.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          {/* ── HERO — an ink matchday poster ──────────────────────────── */}
          <section className="relative bg-[#0B0D10] text-white overflow-hidden pt-28 sm:pt-36 pb-0">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(ellipse at 30% 30%, black 30%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 30% 30%, black 30%, transparent 75%)',
              }}
            />
            <Band className="max-lg:hidden w-[40vw] max-w-[560px] h-[180%] -top-[40%] right-[-8vw]" opacity={0.9} />
            <Band className="max-lg:hidden w-px h-[180%] -top-[40%] right-[40vw]" color="#FFFFFF" opacity={0.12} />

            <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-6 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 pl-3 pr-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-white/60 mb-7"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Now on iPhone &amp; Android
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.06, ease: EASE }}
                  style={DISPLAY}
                  className="uppercase text-[3.6rem] leading-[0.98] sm:text-[6.5rem] lg:text-[6.1rem] xl:text-[6.6rem]"
                >
                  Find a game.<br />
                  <span className="text-[#16A34A]">Just play.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="mt-6 text-lg sm:text-xl text-white/70 max-w-lg leading-relaxed font-medium"
                >
                  Every pickup game near you, your crew in one place, and real stats every time you play.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                >
                  <StoreRow invert className="mt-8" />
                  <div className="mt-8 flex items-center gap-6 sm:gap-8">
                    {[
                      { v: '5,000+', l: 'Players' },
                      { v: '2,000+', l: 'Games created' },
                    ].map((s) => (
                      <div key={s.l}>
                        <span style={DISPLAY} className="block text-3xl sm:text-4xl text-white">{s.v}</span>
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-white/50">{s.l}</span>
                      </div>
                    ))}
                    <div className="hidden sm:block h-10 w-px bg-white/15" />
                    <div className="hidden sm:block">
                      <span style={DISPLAY} className="block text-3xl sm:text-4xl text-white">FREE</span>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-white/50">To download</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Phone fan — rises up out of the bottom edge */}
              <div className="relative flex justify-center items-end mt-4 lg:mt-0 translate-y-[6%]">
                {/* Phones: the band sits behind the fan only, never behind the copy */}
                <Band className="lg:hidden w-[48%] h-[190%] -top-[25%] left-[30%]" opacity={0.9} />
                <motion.div
                  initial={{ opacity: 0, y: 80, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: -9 }}
                  transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
                  className="w-[32%] max-w-[190px] -mr-[8%] mb-[-2%] origin-bottom-right"
                >
                  <Phone src={kingMatchday} alt="King of the field matchday poster" eager />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.22, ease: EASE }}
                  className="w-[42%] max-w-[250px] relative z-10"
                >
                  <Phone src={matchday} alt="Your next game as a matchday poster: Mahala STL, tonight" eager />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 80, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: 9 }}
                  transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
                  className="w-[32%] max-w-[190px] -ml-[8%] mb-[-2%] origin-bottom-left"
                >
                  <Phone src={leaderboard} alt="Weekly leaderboard" eager />
                </motion.div>
              </div>
            </div>
          </section>

          <Ticker />

          {/* ── 01 FIND A GAME ─────────────────────────────────────────── */}
          <section className="px-5 sm:px-8 py-20 sm:py-32">
            <Feature
              id="find"
              n="01"
              kicker="Find a game"
              title="Your next game,"
              accent="one tap away."
              body="Open Jogo and your next game takes over the screen: when, where, who's in, and how many spots are left. Tap it and you're on the lineup."
              points={[
                'Pickup games near you, with the spots left on every card',
                'The field, the time and directions in one tap',
                'A meetup point so nobody wanders the parking lot',
              ]}
              phones={{
                back: { src: matchday, alt: 'Matchday card for a game tonight' },
                front: { src: gameScreen, alt: 'Game screen with field photos, time and directions' },
              }}
            />
          </section>

          {/* ── 02 CREWS — ink with the band ───────────────────────────── */}
          <section className="relative bg-[#0B0D10] text-white overflow-hidden px-5 sm:px-8 py-20 sm:py-32">
            <Band className="w-[30vw] max-w-[420px] h-[170%] -top-[35%] left-[-16vw] sm:left-[-12vw]" opacity={0.75} />
            <div className="relative">
              <Feature
                id="crews"
                n="02"
                kicker="Crews"
                title="Run your crew"
                accent="like a pro."
                body="Your regular group gets its own home: a badge, team colors, a feed, games and chat. Set it up in three steps and everyone knows where the next game is."
                points={[
                  'Crew page with Feed, Games, Chat and About',
                  'Pick a badge, a color and a cover photo',
                  'Owners, admins and organizers keep it running',
                ]}
                phones={{
                  back: { src: newCrew, alt: 'New crew setup with name, color and home area' },
                  front: { src: crewPage, alt: 'Union County Pickup crew page' },
                }}
                dark
                flip
              />
            </div>
          </section>

          {/* ── 03 COMPETE ─────────────────────────────────────────────── */}
          <section className="relative overflow-hidden px-5 sm:px-8 py-20 sm:py-32 bg-[#120B22] text-white">
            <div aria-hidden="true" className="absolute -top-40 right-[-10%] w-[520px] h-[520px] rounded-full bg-violet-500/15 blur-[140px]" />
            <div className="relative">
              <Feature
                id="compete"
                n="03"
                kicker="Compete"
                title="Not just pickup."
                accent="Competition."
                body="Pick a style when you start a game and Jogo handles the teams. Every match has something on the line."
                points={[
                  'Mini tournament: lose and you’re out, last team standing wins',
                  'King of the field: winner stays on, most wins takes the crown',
                  'Color-coded teams with live spots per team',
                ]}
                phones={{
                  back: { src: pickKing, alt: 'Choosing King of the field as the game type' },
                  front: { src: kingMatchday, alt: 'King of the field matchday poster' },
                }}
                dark
              />
            </div>
          </section>

          {/* ── 04 STATS ───────────────────────────────────────────────── */}
          <section className="px-5 sm:px-8 py-20 sm:py-32">
            <Feature
              id="stats"
              n="04"
              kicker="Stats"
              title="Every goal"
              accent="counts."
              body="Log your goals and assists after the game and your teammates confirm them. Climb the weekly leaderboard and watch your form."
              points={[
                'Games, goals and assists on your profile',
                'A weekly leaderboard race with your crew',
                'Stats confirmed by teammates, so the board stays honest',
              ]}
              phones={{
                back: { src: statsScreen, alt: 'Player stats with games, goals and assists' },
                front: { src: leaderboard, alt: 'Weekly leaderboard' },
              }}
              flip
            >
              <Link to="/whats-new" className="mt-8 inline-flex items-center gap-2 font-extrabold text-[#0B0D10] hover:text-[#16A34A] transition-colors">
                See what's new in 2.1 <ArrowRight size={18} />
              </Link>
            </Feature>
          </section>

          {/* ── FINAL CTA — the poster again ───────────────────────────── */}
          <section className="relative bg-[#0B0D10] text-white overflow-hidden px-5 sm:px-8 py-24 sm:py-36">
            <Band className="w-[34vw] max-w-[480px] h-[200%] -top-[50%] right-[-16vw] sm:right-[-6vw]" opacity={0.85} />
            <Reveal className="relative max-w-6xl mx-auto">
              <div className="text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-white/50 mb-4">Free on iPhone &amp; Android</div>
              <h2 style={DISPLAY} className="uppercase text-[3.2rem] leading-[1] sm:text-8xl lg:text-9xl max-w-4xl">
                Your next game<br /><span className="text-[#16A34A]">is waiting.</span>
              </h2>
              <StoreRow invert className="mt-10" />
            </Reveal>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="bg-[#EDEEF1] pt-12 pb-8 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">
              <div>
                <img src={jogoLogo} alt="Jogo" className="h-7 w-auto mb-3" />
                <p className="text-[#6b7280] text-sm max-w-xs font-medium">Pickup soccer, crews and stats. Built in New Jersey.</p>
              </div>
              <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-2.5 text-sm font-semibold text-[#4B5563]">
                <Link to="/whats-new" className="hover:text-[#0B0D10]">What's New</Link>
                <Link to="/blog" className="hover:text-[#0B0D10]">Blog</Link>
                <Link to="/media" className="hover:text-[#0B0D10]">Media</Link>
                <Link to="/feedback" className="hover:text-[#0B0D10]">Feedback</Link>
                <Link to="/support" className="hover:text-[#0B0D10]">Support</Link>
                <Link to="/policy" className="hover:text-[#0B0D10]">Privacy</Link>
                <Link to="/terms" className="hover:text-[#0B0D10]">Terms</Link>
                <Link to="/delete-account" className="hover:text-[#0B0D10]">Delete Account</Link>
                <a href="https://buymeacoffee.com/jogoapp" target="_blank" rel="noopener noreferrer" className="hover:text-[#0B0D10] inline-flex items-center gap-1">
                  <Coffee size={13} /> Support Us
                </a>
              </nav>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-6 border-t border-[#DDE1E5] text-xs text-[#9CA3AF] font-medium">
              <p>© {new Date().getFullYear()} Jogo. All rights reserved.</p>
              <p>Pioneered in New Jersey by players, for players.</p>
            </div>
          </div>
        </footer>

        {/* Room for the sticky store bar on phones */}
        <div className="h-20 md:hidden bg-[#EDEEF1]" />
      </div>
    </MotionConfig>
  );
}

// src/WhatsNew.jsx — release page for Jogo 2.1.0 (jogous.io/whats-new)
//
// Walks through what changed in the update using real screenshots from
// assets/2.1.0 (and assets/2.0.1Finalized for the 2.0 features still shown
// further down). Copy only describes what those screens actually show —
// same rule as index.html: never claim a feature the app doesn't have.

import React, { useEffect } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import {
  Users, Trophy, ShieldCheck, Megaphone, User, Check, Navigation,
  Images, Flag, SlidersHorizontal, CalendarPlus, ArrowRight, Award, Sparkles,
} from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';
import matchday from './assets/2.1.0/Screenshot_20261009-121904.png';
import kingMatchday from './assets/2.1.0/Screenshot_20261009-123555.png';
import crewPage from './assets/2.1.0/Screenshot_20261009-123633.png';
import pickTournament from './assets/2.1.0/Screenshot_20261009-123653.png';
import pickKing from './assets/2.1.0/Screenshot_20261009-123657.png';
import newCrew from './assets/2.1.0/newcrew.png';
import gameScreen from './assets/2.0.1Finalized/Screenshot_20260930-114838.png';
import statsScreen from './assets/2.0.1Finalized/Screenshot_20260930-114850.png';
import leaderboard from './assets/2.0.1Finalized/Screenshot_20260930-114855.png';
import {
  APP_STORE_URL, PLAY_STORE_URL, PlayLogo, AppleLogo, HeaderStoreLinks, isAndroid,
} from './appLinks';

const VERSION = '2.1.0';
const EASE = [0.22, 1, 0.36, 1];

const SECTIONS = [
  { href: '#crews', label: 'Crews, revamped' },
  { href: '#game-modes', label: 'Game modes' },
  { href: '#leaderboard', label: 'Leaderboard' },
  { href: '#game-screen', label: 'Game screen' },
  { href: '#events', label: 'Crew events' },
];

// Mirrors the app's Roles & permissions screen: each tier includes
// everything below it.
const ROLES = [
  { icon: Trophy, name: 'Owner', tone: 'bg-amber-100 text-amber-700', desc: 'Promotes and demotes admins and organizers.' },
  { icon: ShieldCheck, name: 'Admin', tone: 'bg-emerald-100 text-emerald-700', desc: 'Removes members and opens crew settings.' },
  { icon: Megaphone, name: 'Organizer', tone: 'bg-blue-100 text-blue-700', desc: 'Creates pickup games and crew events.' },
  { icon: User, name: 'Member', tone: 'bg-[#EEF0F2] text-[#6b7280]', desc: 'Joins games and chats with the crew.' },
];

// Straight from the "What kind of pickup?" step of the new game flow.
const GAME_MODES = [
  {
    icon: Trophy,
    name: 'Mini tournament',
    rule: "Split into teams. Lose and you're out — last team standing wins.",
    tag: 'Knockout',
  },
  {
    icon: Award,
    name: 'King of the field',
    rule: 'Winner stays on, loser goes to the back. Most wins takes the crown.',
    tag: 'Winner stays on',
  },
];

const GAME_SCREEN_DETAILS = [
  { icon: Images, title: 'Photos up top', desc: 'Swipe through the field before you drive to it.' },
  { icon: Navigation, title: 'One-tap directions', desc: 'The address and a map, right under the kickoff time.' },
  { icon: Flag, title: 'Meetup point', desc: 'Set the exact spot so nobody wanders the parking lot.' },
  { icon: SlidersHorizontal, title: 'Game options', desc: 'Everything you can do with a game, behind one button.' },
];

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// The screenshots are 864×1939 Android captures, so the frame keeps that
// exact ratio instead of cropping them to an iPhone shape.
function Phone({ src, alt, className = '', eager = false }) {
  return (
    <div
      className={`rounded-[13%/6%] p-[2.6%] bg-[#111111] shadow-[0_30px_60px_-20px_rgba(17,17,17,0.45)] ring-1 ring-white/10 ${className}`}
    >
      <div className="rounded-[11%/5%] overflow-hidden bg-[#EDEEF1]" style={{ aspectRatio: '864 / 1939' }}>
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          className="w-full h-full object-cover object-top block"
        />
      </div>
    </div>
  );
}

// Two overlapping phones, the second one dropped lower.
function PhonePair({ front, back }) {
  return (
    <div className="flex justify-center items-start">
      <Phone {...back} className="w-[46%] max-w-[230px] -rotate-2" />
      <Phone {...front} className="w-[46%] max-w-[230px] mt-14 -ml-[6%] rotate-2 relative z-10" />
    </div>
  );
}

function Eyebrow({ children, dark = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 border ${
        dark
          ? 'bg-white/5 border-white/15 text-emerald-300'
          : 'bg-[#F1F8F3] border-emerald-400/25 text-emerald-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
      {children}
    </div>
  );
}

function Points({ items, dark = false }) {
  return (
    <ul className="space-y-2.5 mt-6">
      {items.map((t) => (
        <li key={t} className={`flex items-start gap-2.5 text-sm sm:text-[15px] ${dark ? 'text-white/75' : 'text-[#374151]'}`}>
          <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            <Check size={12} strokeWidth={3.5} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function StoreButton({ store, invert = false }) {
  const apple = store === 'apple';
  return (
    <motion.a
      href={apple ? APP_STORE_URL : PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.035, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center gap-2.5 font-semibold rounded-2xl px-5 py-3 sm:px-7 sm:py-3.5 ${
        invert
          ? 'bg-white text-black hover:bg-gray-100 shadow-xl shadow-black/30'
          : 'bg-[#111111] text-white hover:bg-[#2a2a2a] shadow-lg shadow-black/15'
      }`}
    >
      {apple ? <AppleLogo size={22} /> : <PlayLogo size={20} />}
      <span className="text-left leading-tight">
        <span className={`block text-[10px] font-normal leading-none mb-0.5 ${invert ? 'text-black/60' : 'text-white/60'}`}>
          {apple ? 'Download on the' : 'Get it on'}
        </span>
        <span className="block text-base sm:text-lg font-bold leading-none">
          {apple ? 'App Store' : 'Google Play'}
        </span>
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

export default function WhatsNew() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const previous = document.title;
    document.title = `What's new in Jogo ${VERSION}`;
    return () => { document.title = previous; };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#EDEEF1] text-[#111111] font-sans antialiased overflow-x-hidden scroll-smooth">
        <style>{`
          .wn-g-text {
            background: linear-gradient(130deg,#059669,#16A34A,#15803d);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .wn-ghost {
            -webkit-text-stroke: 2px rgba(22,163,74,0.16);
            color: transparent;
          }
          @keyframes wn-drift {
            0%   { transform: translate(0,0) scale(1); }
            33%  { transform: translate(36px,-28px) scale(1.12); }
            66%  { transform: translate(-28px,22px) scale(0.92); }
            100% { transform: translate(0,0) scale(1); }
          }
          .wn-blob { animation: wn-drift 13s ease-in-out infinite; }
          .wn-blob-2 { animation-delay: -4.5s; }
          .wn-blob-3 { animation-delay: -9s; }
          @keyframes wn-grid-pan {
            from { background-position: 0 0; }
            to   { background-position: 64px 64px; }
          }
          .wn-grid-pan { animation: wn-grid-pan 18s linear infinite; }
          .wn-anchor { scroll-margin-top: 24px; }
          @media (prefers-reduced-motion: reduce) {
            .wn-blob, .wn-grid-pan { animation: none; }
          }
          ::selection { background: rgba(22,163,74,0.25); }
        `}</style>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <div className="relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              backgroundImage: 'radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)',
            }}
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="wn-blob absolute top-[-12%] left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-emerald-300/30 rounded-full blur-[120px]" />
            <div className="wn-blob wn-blob-2 absolute top-[20%] left-[-10%] w-[340px] h-[340px] bg-teal-300/20 rounded-full blur-[100px]" />
            <div className="wn-blob wn-blob-3 absolute top-[30%] right-[-10%] w-[360px] h-[360px] bg-emerald-400/20 rounded-full blur-[100px]" />
          </div>

          <header className="relative z-10 px-4 sm:px-8 pt-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl pl-3 pr-2 py-2 shadow-sm">
              <a href="/" className="flex items-center gap-2">
                <img src={appIcon} alt="" className="w-8 h-8 rounded-[10px]" />
                <span className="text-lg font-black tracking-tight">jogo</span>
              </a>
              <HeaderStoreLinks />
            </div>
          </header>

          <section className="relative z-10 px-4 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white border border-[#DDE1E5] rounded-full pl-1.5 pr-3.5 py-1 shadow-sm mb-6"
              >
                <span className="bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wide rounded-full px-2.5 py-1">
                  New
                </span>
                <span className="text-sm font-semibold text-[#374151]">Version {VERSION}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.08, ease: EASE }}
                className="text-[2.6rem] leading-[1.04] sm:text-7xl font-black tracking-tight"
              >
                Pickup just<br />
                <span className="wn-g-text">leveled up.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="text-base sm:text-xl text-[#6b7280] mt-5 max-w-2xl mx-auto leading-relaxed"
              >
                Jogo {VERSION} is our biggest crew drop yet. A ground-up redesign of Crews built
                around matchday, plus two brand-new competitive game modes: Mini tournament and
                King of the field. Same crew, whole new game.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
              >
                <StoreRow className="justify-center mt-8" />
                <nav aria-label="In this update" className="flex flex-wrap justify-center gap-2 mt-7">
                  {SECTIONS.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      className="text-xs sm:text-sm font-semibold text-[#374151] bg-white/70 hover:bg-white border border-[#DDE1E5] hover:border-emerald-400/60 hover:text-emerald-700 rounded-full px-3.5 py-1.5 transition-colors"
                    >
                      {s.label}
                    </a>
                  ))}
                </nav>
              </motion.div>
            </div>

            {/* Phone fan over a ghosted version number */}
            <div className="relative max-w-2xl mx-auto mt-14 sm:mt-20">
              <div
                aria-hidden="true"
                className="wn-ghost absolute left-1/2 -translate-x-1/2 -top-[8%] text-[34vw] sm:text-[230px] font-black leading-none tracking-tighter select-none pointer-events-none whitespace-nowrap"
              >
                {VERSION}
              </div>
              <div className="relative flex justify-center items-end">
                <motion.div
                  initial={{ opacity: 0, y: 60, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: -8 }}
                  transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
                  className="w-[34%] max-w-[200px] -mr-[7%] mb-[-4%] origin-bottom-right"
                >
                  <Phone src={crewPage} alt="Redesigned crew page for Union County Pickup" eager />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
                  className="w-[44%] max-w-[260px] relative z-10"
                >
                  <Phone src={kingMatchday} alt="Crews tab with a King of the field matchday card and four teams" eager />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 60, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: 8 }}
                  transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
                  className="w-[34%] max-w-[200px] -ml-[7%] mb-[-4%] origin-bottom-left"
                >
                  <Phone src={pickTournament} alt="New game flow asking what kind of pickup, with Mini tournament selected" eager />
                </motion.div>
              </div>
            </div>
          </section>
        </div>

        <main>
          {/* ── CREWS ─────────────────────────────────────────────────── */}
          <section id="crews" className="wn-anchor px-4 sm:px-8 py-16 sm:py-24">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <div className="flex items-center gap-2">
                  <Eyebrow>Crews, revamped</Eyebrow>
                  <span className="mb-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-1">
                    New in {VERSION}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black leading-[1.08] tracking-tight">
                  Cleaner. Bolder.<br />Matchday-ready.
                </h2>
                <p className="text-[#6b7280] text-base sm:text-lg mt-4 leading-relaxed max-w-xl">
                  We rebuilt Crews from the ground up. Your next game now takes over the screen as a
                  full-bleed matchday card: when, where, who's in, and how many spots are left. One
                  tap and you're on the lineup. Zero friction, all signal.
                </p>
                <Points
                  items={[
                    'Your crews live in a swipeable row up top, so switching is instant.',
                    'Matchday card shows the lineup live, like 14 / 16, with a one-tap "Take a spot".',
                    'A fresh crew page: cover photo, badge, location, player count, and Manage crew right up front.',
                    'Feed, Games, Chat, and About, plus join activity so you see the crew growing.',
                    'Crews Near You, to find your next run on the same tab.',
                    'A redesigned New Crew flow: build your crew in three quick steps.',
                  ]}
                />
              </Reveal>
              <Reveal delay={0.1}>
                <PhonePair
                  back={{ src: matchday, alt: 'Crews tab with a Tonight matchday card, lineup, and Take a spot button' }}
                  front={{ src: crewPage, alt: 'Redesigned crew page with cover photo, Manage crew, New game, and Feed tab' }}
                />
              </Reveal>
            </div>

            {/* New crew flow */}
            <Reveal className="max-w-6xl mx-auto mt-16 sm:mt-24">
              <div className="relative bg-[#0d0f12] text-white rounded-3xl overflow-hidden p-6 sm:p-10">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-emerald-700/80 [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)] pointer-events-none" />
                <div className="relative grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 lg:gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 border bg-white/5 border-white/15 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      New crew
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-black leading-tight">
                      Launch a crew in three steps.
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base mt-3 leading-relaxed max-w-lg">
                      A brand-new creation flow that builds your crew's identity live as you type.
                      Name it, pick a color, drop a badge and a cover photo, and your crew card comes
                      to life before you hit Next.
                    </p>
                    <Points
                      dark
                      items={[
                        'Live crew card preview with your badge, name, and est. year.',
                        'Eight team colors to make the crew unmistakably yours.',
                        'Set a home area so nearby players can find you.',
                        'Add a short about line, up to 140 characters.',
                      ]}
                    />
                  </div>
                  <Phone
                    src={newCrew}
                    alt="New Crew screen, step 1 of 3, with a crew card preview, name, team color, home area and about fields"
                    className="w-[62%] max-w-[260px] mx-auto rotate-2"
                  />
                </div>
              </div>
            </Reveal>

            {/* Roles */}
            <Reveal className="max-w-6xl mx-auto mt-16 sm:mt-24">
              <div className="bg-white border border-[#DDE1E5] rounded-3xl shadow-sm p-6 sm:p-10">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-8 lg:gap-12 items-center">
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-[#F1F8F3] border border-emerald-400/25 text-emerald-600 flex items-center justify-center mb-4">
                      <Users size={20} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black leading-tight">Everyone knows their job.</h3>
                    <p className="text-[#6b7280] text-sm sm:text-base mt-3 leading-relaxed">
                      Four roles, each one including everything below it. The owner also decides
                      whether members can start pickup games on their own.
                    </p>
                  </div>
                  <ol className="grid sm:grid-cols-2 gap-3">
                    {ROLES.map(({ icon: Icon, name, tone, desc }) => (
                      <li key={name} className="flex items-start gap-3 bg-[#F7F8F9] border border-[#EEF0F2] rounded-2xl p-4">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tone}`}>
                          <Icon size={18} />
                        </span>
                        <span>
                          <span className="block font-bold text-[15px]">{name}</span>
                          <span className="block text-[13px] text-[#6b7280] leading-snug mt-0.5">{desc}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ── GAME MODES ────────────────────────────────────────────── */}
          <section id="game-modes" className="wn-anchor relative px-4 sm:px-8 py-20 sm:py-28 bg-[#140a26] text-white overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="wn-grid-pan absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
                  backgroundSize: '64px 64px',
                }}
              />
              <div className="wn-blob absolute top-[-15%] right-[5%] w-[440px] h-[440px] bg-violet-500/30 rounded-full blur-[120px]" />
              <div className="wn-blob wn-blob-2 absolute bottom-[-20%] left-[5%] w-[420px] h-[420px] bg-amber-400/15 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 border bg-white/5 border-white/15 text-amber-300">
                  <Sparkles size={12} />
                  Game modes
                </div>
                <h2 className="text-3xl sm:text-5xl font-black leading-[1.08] tracking-tight">
                  Not just pickup.<br />
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Competition.</span>
                </h2>
                <p className="text-white/60 text-base sm:text-lg mt-4 leading-relaxed max-w-xl">
                  Two new formats, built right into your crew. When you create a game, just pick a
                  style. Jogo handles the teams so you can focus on bragging rights.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mt-7">
                  {GAME_MODES.map(({ icon: Icon, name, rule, tag }) => (
                    <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center">
                          <Icon size={19} />
                        </span>
                        <span className="bg-black text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-1">
                          Beta
                        </span>
                      </div>
                      <p className="font-black text-lg leading-tight">{name}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mt-1">{tag}</p>
                      <p className="text-sm text-white/60 leading-relaxed mt-2">{rule}</p>
                    </div>
                  ))}
                </div>

                <Points
                  dark
                  items={[
                    'Pick Regular, Mini tournament, or King of the field when you start a new game.',
                    'Color-coded teams (Green, Black, Orange, Blue) with live spots per team.',
                    'Choose your team when you join, and your matchday card shows where you landed.',
                  ]}
                />
              </Reveal>
              <Reveal delay={0.1}>
                <PhonePair
                  back={{ src: pickKing, alt: 'What kind of pickup screen with King of the field selected' }}
                  front={{ src: kingMatchday, alt: 'King of the field matchday card with Green, Black, Orange and Blue teams' }}
                />
              </Reveal>
            </div>
          </section>

          {/* ── FROM 2.0 ──────────────────────────────────────────────── */}
          <div className="px-4 sm:px-8 pt-20 sm:pt-28 text-center">
            <Reveal>
              <Eyebrow>Still fresh from 2.0</Eyebrow>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Plus everything that got your crew here.
              </h2>
            </Reveal>
          </div>

          {/* ── GAME SCREEN ───────────────────────────────────────────── */}
          <section id="game-screen" className="wn-anchor px-4 sm:px-8 py-16 sm:py-24">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <Eyebrow>Game screen</Eyebrow>
                <h2 className="text-3xl sm:text-5xl font-black leading-[1.08] tracking-tight">
                  The game screen,<br />rebuilt.
                </h2>
                <p className="text-[#6b7280] text-base sm:text-lg mt-4 leading-relaxed max-w-xl">
                  When, where, and how to get there, in that order. The rest stays out of the way
                  until you need it.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-7">
                  {GAME_SCREEN_DETAILS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-white border border-[#DDE1E5] rounded-2xl p-4 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                        <Icon size={18} />
                      </div>
                      <p className="font-bold text-sm mb-1">{title}</p>
                      <p className="text-xs text-[#6b7280] leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.1} className="relative flex justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[420px] aspect-square bg-emerald-300/35 rounded-full blur-[90px] pointer-events-none" />
                <Phone
                  src={gameScreen}
                  alt="Game screen with field photo, date, location, and map"
                  className="relative w-[62%] max-w-[280px]"
                />
              </Reveal>
            </div>
          </section>

          {/* ── LEADERBOARD ───────────────────────────────────────────── */}
          <section id="leaderboard" className="wn-anchor relative px-4 sm:px-8 py-20 sm:py-28 bg-[#05130b] text-white overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="wn-grid-pan absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
                  backgroundSize: '64px 64px',
                }}
              />
              <div className="wn-blob absolute top-[-15%] left-[5%] w-[420px] h-[420px] bg-emerald-500/25 rounded-full blur-[110px]" />
              <div className="wn-blob wn-blob-2 absolute bottom-[-20%] right-[5%] w-[460px] h-[460px] bg-amber-400/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal className="order-2 lg:order-1">
                <PhonePair
                  back={{ src: statsScreen, alt: 'Stats screen with level, streak, games, goals and assists' }}
                  front={{ src: leaderboard, alt: 'Leaderboard with The Race chart and standings' }}
                />
              </Reveal>
              <Reveal delay={0.1} className="order-1 lg:order-2">
                <Eyebrow dark>Leaderboard</Eyebrow>
                <h2 className="text-3xl sm:text-5xl font-black leading-[1.08] tracking-tight">
                  A new race<br />every week.
                </h2>
                <p className="text-white/60 text-base sm:text-lg mt-4 leading-relaxed max-w-xl">
                  Post your stats after a game and watch the race chart move. Flip between this
                  week and all time, then share the race when you're on top.
                </p>

                <dl className="grid grid-cols-3 gap-2.5 mt-7 max-w-md">
                  {[
                    { label: 'Goal', pts: 1 },
                    { label: 'Assist', pts: 1 },
                    { label: 'Win', pts: 2 },
                  ].map((p) => (
                    <div key={p.label} className="bg-white/5 border border-white/10 rounded-2xl px-3 py-4 text-center">
                      <dd className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-white to-emerald-300 bg-clip-text text-transparent leading-none">
                        {p.pts}<span className="text-base font-bold"> pt{p.pts > 1 ? 's' : ''}</span>
                      </dd>
                      <dt className="text-xs text-white/55 mt-1.5 font-semibold uppercase tracking-wide">{p.label}</dt>
                    </div>
                  ))}
                </dl>

                <Points
                  dark
                  items={[
                    'Your stats page tracks games, goals, assists, and win rate.',
                    'Levels and weekly streaks for showing up.',
                    'Separate views for playing and hosting.',
                  ]}
                />
              </Reveal>
            </div>
          </section>

          {/* ── CREW EVENTS ───────────────────────────────────────────── */}
          <section id="events" className="wn-anchor px-4 sm:px-8 py-16 sm:py-24">
            <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#F1F8F3] via-white to-emerald-50 border border-emerald-400/25 rounded-[32px] sm:rounded-[40px] px-5 py-10 sm:p-14 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <Reveal className="order-2 lg:order-1">
                  {/* Real Jogo games, not app screens: this section is about the vibe of an event. */}
                  <div className="relative pb-[18%] sm:pb-[14%]">
                    <div className="rounded-3xl overflow-hidden shadow-[0_30px_60px_-20px_rgba(6,78,59,0.45)] ring-1 ring-black/5 -rotate-2">
                      <img
                        src="/images/jogo-tournament.webp"
                        alt="A Jogo crew lined up under the floodlights before a night game"
                        loading="lazy"
                        className="w-full aspect-[4/3] object-cover block"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-[4%] w-[36%] rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-[-6deg]">
                      <img
                        src="/verified/photos/web/pic8.jpg"
                        alt="Players gathering on a lit turf field at night"
                        loading="lazy"
                        className="w-full aspect-[3/4] object-cover block"
                      />
                    </div>
                    <div className="absolute -bottom-6 right-[4%] w-[36%] rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-[5deg]">
                      <img
                        src="/verified/photos/web/pic5.jpg"
                        alt="A player on the ball during an evening pickup game"
                        loading="lazy"
                        className="w-full aspect-[3/4] object-cover object-[50%_40%] block"
                      />
                    </div>
                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-[#111111]/85 backdrop-blur text-white rounded-full pl-2 pr-3.5 py-1.5 text-xs font-bold shadow-lg">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CalendarPlus size={13} />
                      </span>
                      Crew event
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={0.1} className="order-1 lg:order-2">
                  <div className="flex items-center gap-2">
                    <Eyebrow>Crew events</Eyebrow>
                    <span className="mb-4 bg-[#111111] text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-1">
                      Beta
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black leading-[1.08] tracking-tight">
                    Bigger than<br />a pickup game.
                  </h2>
                  <p className="text-[#6b7280] text-base sm:text-lg mt-4 leading-relaxed max-w-xl">
                    Tap New game inside your crew and choose what you're hosting. Pickup games take
                    a few quick steps. Events get a page of their own.
                  </p>
                  <Points
                    items={[
                      'Add a cover photo, a description, and a cap on players.',
                      'Set the date, time, and field, all from the crew page.',
                      'Organizers, admins, and owners can create events.',
                    ]}
                  />
                  <div className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-emerald-700">
                    <CalendarPlus size={16} />
                    Find it under New game on any crew you help run
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────────── */}
          <section className="px-4 sm:px-8 pb-20 sm:pb-28">
            <Reveal className="max-w-2xl mx-auto text-center">
              <img src={appIcon} alt="" className="w-16 h-16 rounded-[20px] shadow-lg shadow-emerald-900/15 mx-auto mb-7" />
              <h2 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                Update Jogo.<br />
                <span className="wn-g-text">Round up the crew.</span>
              </h2>
              <p className="text-[#6b7280] text-lg sm:text-xl mt-5">
                Version {VERSION} is free on iOS and Android.
              </p>
              <StoreRow className="justify-center mt-9" />
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b7280] hover:text-emerald-700 mt-7 transition-colors"
              >
                New to Jogo? See how it works <ArrowRight size={14} />
              </a>
            </Reveal>
          </section>
        </main>

        {/* ── FOOTER ────────────────────────────────────────────────── */}
        <footer className="border-t border-[#DDE1E5] bg-white/60 px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6b7280]">
            <div className="flex items-center gap-2">
              <img src={appIcon} alt="" className="w-5 h-5 rounded-md" />
              <span>© {new Date().getFullYear()} Jogo · Made in New Jersey</span>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/policy" className="hover:text-[#111111]">Privacy</a>
              <a href="/terms" className="hover:text-[#111111]">Terms</a>
              <a href="/support" className="hover:text-[#111111]">Support</a>
              <a href="mailto:jogo.tech@outlook.com" className="hover:text-[#111111]">Contact</a>
            </nav>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

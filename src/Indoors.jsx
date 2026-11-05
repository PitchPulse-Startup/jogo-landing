// src/Indoors.jsx — jogous.io/indoors, the pitch to indoor facilities.
//
// The link we send to facility owners (DMs, Instagram bio, a text to a
// manager). Same Matchday language as the homepage, built around real app
// screenshots (src/assets/indoors/web, 640px webp copies of the PNGs next to it).
// Applying happens in the app (soccer-ball button in the middle of the tab bar → Create game → "Own an indoor?"), reviewed by
// hand in Jogo-admin.
//
// Money copy: "you set the price, you get your cut; fees are included in the
// price." No fee math, no "what the player pays", no breakdowns.
// Don't promise free forever (we may charge monthly once we have ~20 indoors):
// say "free while we launch", never "no monthly fee" or "no contract".
// Players need the Jogo app to book, pay and check in. Never say "no app needed".

import React, { useState, useEffect } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check, ArrowRight, Mail, ChevronDown, QrCode, Printer, BadgeCheck, MapPin,
  CalendarDays, Key, Wallet, BarChart3, Clock, LayoutDashboard, Users, Share2, Monitor, Bell, Download, CreditCard, Landmark,
} from 'lucide-react';

import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import jogoLogo from './assets/jogo-logo-2026.png';
import appIcon from './assets/jogo-app-icon.png';
import { EASE, DISPLAY, BODY, useMatchdayFonts, Reveal, Band, StoreRow, Phone } from './App.jsx';

import shotApply from './assets/indoors/web/indoor1.webp';
import shotApplyRules from './assets/indoors/web/indoor2.webp';
import shotReview from './assets/indoors/web/indoor3.webp';
import shotNearby from './assets/indoors/web/indoor6.webp';
import shotVerified from './assets/indoors/web/indoor7.webp';
import shotDates from './assets/indoors/web/indoor8.webp';
import shotTimes from './assets/indoors/web/indoor9.webp';
import shotPrice from './assets/indoors/web/indoor10.webp';
import shotLive from './assets/indoors/web/indoor11.webp';
import shotShare from './assets/indoors/web/indoor12.webp';
import shotSchedule from './assets/indoors/web/indoor14.webp';
import shotHome from './assets/indoors/web/indoor15.webp';
import shotPitch from './assets/indoors/web/indoor16.webp';
import shotGame from './assets/indoors/web/indoor17.webp';
import checkInClip from './assets/indoors/web/checkin.webp';
import shotFollow from './assets/indoors/web/indoor20.webp';
import shotRent from './assets/indoors/web/indoor21.webp';

const CONTACT = 'mailto:jogo.tech@outlook.com?subject=' + encodeURIComponent('Hosting my indoor on Jogo');
const PORTAL = '/indoors/portal';

const NAV = [
  { href: '#seen', label: 'Get seen' },
  { href: '#how', label: 'How it works' },
  { href: '#checkin', label: 'Check-in' },
  { href: '#money', label: 'Money' },
  { href: '#portal', label: 'Portal' },
  { href: '#faq', label: 'FAQ' },
];

const TICKER = ['Pickup nights', 'Field rentals', 'Front-desk check-in', 'Paid after every game', 'One-tap share links', 'Your own page', 'Schedule in minutes', 'Player analytics'];

// Every place a player runs into your indoor.
const SEEN = [
  { src: shotHome, t: 'Home', b: 'Your games sit on the first screen players open, with the spots left.', alt: 'Jogo home with an indoor game card: Wed 11, 7 PM, 16 spots left' },
  { src: shotPitch, t: 'The Pitch', b: 'Every game you post lands in Jogo’s social feed.', alt: 'The Pitch feed showing Jogo Indoor reposting a game' },
  { src: shotNearby, t: 'Indoors near you', b: 'Players nearby find your facility even between games.', alt: 'Indoor facilities near you on the Jogo home screen' },
  { src: shotGame, t: 'The game page', b: 'Your logo, the time, the map and directions. One tap to join.', alt: 'Game page for Jogo Indoor with date, place and price' },
];

// Sign-up to a full game, step by step. `note` adds the approval notification.
const JOURNEY = [
  {
    n: '01', t: 'Build your page', short: 'Five minutes in the app.',
    b: 'Banner, logo, photos, address and open hours. Pick your cancellation rules and how many fields you have. Then send it for review.',
    points: ['Photos players swipe through on your banner', 'Your hours, fields and socials in one place', 'Your own cancellation rules for field rentals'],
    shots: [
      { src: shotApply, alt: 'Host on Jogo sign-up: banner, logo, photos and name' },
      { src: shotApplyRules, alt: 'Sign-up continued: address, open hours, booking cancellations and fields' },
    ],
  },
  {
    n: '02', t: 'We review it', short: 'Usually within a day.',
    b: 'A real person on our team checks every indoor by hand. Your page is ready to edit while you wait, and you get a notification the moment you’re approved.',
    points: ['Every indoor is checked by hand', 'Edit your page while it’s in review', 'A push notification when you’re live'],
    shots: [{ src: shotReview, alt: 'Indoor page in review' }],
    note: true,
  },
  {
    n: '03', t: 'You’re verified', short: 'Your page goes live.',
    b: 'Your page gets the Verified on Jogo badge, players can follow you, and your front-desk check-in code is ready.',
    points: ['Verified on Jogo badge', 'Followers get your new games', 'Your check-in code, ready to print'],
    shots: [{ src: shotVerified, alt: 'Verified indoor page with Edit page, Check-in code and Create games' }],
  },
  {
    n: '04', t: 'Post your games', short: 'A whole month in a minute.',
    b: 'Pick your dates (tap a day letter to grab every Monday at once), set the times, the field, the price and how many players. Connect Stripe once and you’re paid.',
    points: ['Grab every Monday in the month with one tap', 'Times, fields, price and player limits', 'Paid or free, your call'],
    shots: [
      { src: shotDates, alt: 'Jogo scheduler: pick your dates on a calendar' },
      { src: shotTimes, alt: 'Jogo scheduler: start time and length' },
      { src: shotPrice, alt: 'Jogo scheduler: price per player and Stripe payouts' },
    ],
  },
  {
    n: '05', t: 'Share it', short: 'One tap to every group chat.',
    b: 'Your game is live for players nearby the second you post it. Share the link to Instagram, WhatsApp or your group chats and bring your regulars onto Jogo.',
    points: ['Live for players nearby right away', 'A share card made for group chats', 'Every link leads players into the Jogo app'],
    shots: [
      { src: shotLive, alt: '1 game is live: share your game' },
      { src: shotShare, alt: 'Invite players sheet with a share link' },
    ],
  },
];

// What players do on your page without you lifting a finger (indoor20, indoor21).
const DEMAND = [
  { I: Bell, t: 'Follow and get alerts', b: 'Players follow your indoor and turn on the bell, so they get a notification the moment you post a new game.' },
  { I: Key, t: 'Rent a field', b: 'Players pick a day, a time and a field and send you a request. You set the price when you approve.' },
  { I: Users, t: 'Split it with friends', b: 'A renter can ask to split the field with other players. You agree on the price per player and a deadline, and every spot has to fill by then.' },
];

const PORTAL_TABS = [
  { l: 'Overview', I: LayoutDashboard },
  { l: 'Analytics', I: BarChart3 },
  { l: 'Schedule', I: CalendarDays },
  { l: 'Bookings', I: Key },
  { l: 'Check-in', I: QrCode },
  { l: 'Slots & rates', I: Clock },
  { l: 'Money', I: Wallet },
];

const FAQ = [
  { q: 'What does it cost to join?', a: 'Nothing right now. Joining is free while we launch with our first indoors. You set your price and get your cut, and card fees and Jogo’s fee are already included in the price.' },
  { q: 'When do I get paid?', a: 'Your cut goes to your bank through Stripe after each game ends. Setting up Stripe takes a few minutes, and free games don’t need it at all.' },
  { q: 'What if a player cancels?', a: 'For field rentals you set the rules: free cancellation until 24, 48 or 72 hours before, and after that you keep 25%, 50% or all of it.' },
  { q: 'What if I have to cancel a game?', a: 'Every player who paid gets a full refund automatically. The card fees on those refunds come out of your balance, so it’s best to cancel only when you have to.' },
  { q: 'Do players need the Jogo app?', a: 'Yes. Players book, pay and check in with the Jogo app, which is free on iPhone and Android. Your share links send new players straight to it.' },
  { q: 'Can players rent a whole field?', a: 'Yes. They pick a day, a time and a field and send you a request. For hours where you’ve set a rate they can book straight away; for the rest you set the price when you approve. A renter can also ask to split the cost with other players, and you decide whether to agree.' },
  { q: 'I have more than one field. Does that work?', a: 'Yes. Tell us how many fields you have and each game gets one. When players check in, Jogo tells them exactly which field to go to.' },
  { q: 'Can I run it from a computer?', a: 'Yes. Sign in at jogous.io/indoors/portal with the same account. You get your schedule, bookings and check-ins, plus hourly rates for set slots, analytics on what fills best, and a spreadsheet of every payment for your accountant.' },
  { q: 'How long does review take?', a: 'Usually within a day. We look at every indoor by hand, and you get a notification as soon as you’re approved.' },
];

// ── Pieces ──────────────────────────────────────────────────────────────

function Kicker({ n, children, dark = false }) {
  return (
    <div className={`flex items-center gap-3 mb-4 text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase ${dark ? 'text-emerald-300/90' : 'text-emerald-700'}`}>
      {n ? <span style={DISPLAY} className="text-lg sm:text-xl tracking-normal">{n}</span> : null}
      {n ? <span className={`h-px w-8 ${dark ? 'bg-emerald-400/50' : 'bg-emerald-700/40'}`} /> : null}
      {children}
    </div>
  );
}

function Points({ items, dark = false, className = 'mt-7' }) {
  return (
    <ul className={`space-y-3 ${className}`}>
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

// The push an owner gets when their page is approved (same words as the app).
function ApprovedNotification({ className = '' }) {
  return (
    <div className={`rounded-2xl bg-[#1C1F24]/95 backdrop-blur-md ring-1 ring-white/10 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] p-3.5 flex gap-3 text-left ${className}`}>
      <img src={appIcon} alt="" className="w-9 h-9 rounded-[10px] flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-white/50">Jogo · now</div>
        <div className="text-[14px] font-extrabold text-white leading-snug">Your indoor is live on Jogo</div>
        <div className="text-[13px] font-medium text-white/70 leading-snug">Your page is approved. Post your first games.</div>
      </div>
    </div>
  );
}

// One to three phones: single, an overlapping pair, or a fan.
function Phones({ shots, eager = false }) {
  if (shots.length === 1) {
    return (
      <div className="flex justify-center">
        <Phone {...shots[0]} eager={eager} className="w-[58%] max-w-[270px]" />
      </div>
    );
  }
  if (shots.length === 2) {
    return (
      <div className="flex justify-center items-start">
        <Phone {...shots[0]} eager={eager} className="w-[46%] max-w-[240px] -rotate-3" />
        <Phone {...shots[1]} eager={eager} className="w-[46%] max-w-[240px] mt-12 sm:mt-16 -ml-[7%] rotate-3 relative z-10" />
      </div>
    );
  }
  return (
    <div className="flex justify-center items-end pt-4">
      <Phone {...shots[0]} eager={eager} className="w-[34%] max-w-[190px] -mr-[7%] mb-[4%] -rotate-6" />
      <Phone {...shots[1]} eager={eager} className="w-[40%] max-w-[230px] relative z-10" />
      <Phone {...shots[2]} eager={eager} className="w-[34%] max-w-[190px] -ml-[7%] mb-[4%] rotate-6" />
    </div>
  );
}

function StepVisual({ step }) {
  return (
    <div className="relative">
      <Phones shots={step.shots} />
      {step.note ? (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6%] w-[86%] max-w-[340px] z-20">
          <ApprovedNotification />
        </div>
      ) : null}
    </div>
  );
}

// Desktop: a story you can click through, auto-advancing until you touch it.
// Phones and narrow screens: the same steps, stacked.
const STEP_MS = 7000;

function Journey() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!auto || reduce) return undefined;
    const t = setTimeout(() => setActive((a) => (a + 1) % JOURNEY.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, auto]);

  const pick = (i) => { setAuto(false); setActive(i); };
  const step = JOURNEY[active];

  return (
    <>
      {/* lg and up */}
      <div className="hidden lg:grid grid-cols-[0.95fr_1.05fr] gap-14 items-center mt-14">
        <div className="space-y-2" role="tablist" aria-label="How it works">
          {JOURNEY.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.n}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => pick(i)}
                className={`relative w-full text-left rounded-2xl px-6 py-5 overflow-hidden transition-colors ${on ? 'bg-white shadow-[0_12px_32px_-20px_rgba(0,0,0,0.3)]' : 'hover:bg-white/60'}`}
              >
                <div className="flex items-baseline gap-4">
                  <span style={DISPLAY} className={`text-3xl ${on ? 'text-[#16A34A]' : 'text-[#9CA3AF]'}`}>{s.n}</span>
                  <div className="min-w-0">
                    <div className={`text-xl font-extrabold ${on ? 'text-[#0B0D10]' : 'text-[#4B5563]'}`}>{s.t}</div>
                    <div className={`text-sm font-semibold ${on ? 'text-[#15803D]' : 'text-[#9CA3AF]'}`}>{s.short}</div>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {on ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pl-[3.25rem] pt-3 text-[#4B5563] font-medium leading-relaxed">{s.b}</p>
                      <Points items={s.points} className="mt-4 pl-[3.25rem]" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {on && auto ? (
                  <motion.span
                    key={`bar-${active}`}
                    aria-hidden="true"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                    className="absolute left-0 bottom-0 h-[3px] w-full bg-[#16A34A] origin-left"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[560px] flex items-center justify-center">
          <div aria-hidden="true" className="absolute inset-x-8 top-10 bottom-10 rounded-[48px] bg-[#0B0D10] overflow-hidden">
            <Band className="w-[38%] h-[200%] -top-[50%] right-[-6%]" opacity={0.9} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative w-full py-6"
            >
              <StepVisual step={step} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* below lg */}
      <div className="lg:hidden mt-12 space-y-20">
        {JOURNEY.map((s) => (
          <Reveal key={s.n}>
            <div className="flex items-baseline gap-4">
              <span style={DISPLAY} className="text-4xl text-[#16A34A]">{s.n}</span>
              <div>
                <h3 className="text-2xl font-extrabold">{s.t}</h3>
                <div className="text-sm font-bold text-[#15803D]">{s.short}</div>
              </div>
            </div>
            <p className="mt-3 text-[#4B5563] font-medium leading-relaxed">{s.b}</p>
            <div className="relative mt-8 pb-10">
              <div aria-hidden="true" className="absolute inset-x-0 top-8 bottom-0 rounded-[36px] bg-[#0B0D10] overflow-hidden">
                <Band className="w-[40%] h-[200%] -top-[50%] right-[-10%]" opacity={0.9} />
              </div>
              <div className="relative pt-2">
                <StepVisual step={s} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

// The front-desk sign (drawn the way the printed sheet comes out of the portal)
// with a real check-in filmed in front of one: tap Scan, point, "Field 3".
function CheckInScene() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] pb-10 sm:pb-6">
      <div className="w-[62%] bg-white text-[#0B0D10] rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 text-center shadow-[0_40px_80px_-24px_rgba(0,0,0,0.7)] rotate-[-3deg]">
        <img src={jogoLogo} alt="Jogo" className="h-4 sm:h-6 w-auto mx-auto" />
        <div style={DISPLAY} className="mt-3 sm:mt-5 text-[1.45rem] sm:text-[2.3rem] leading-none">SCAN TO CHECK IN</div>
        <div className="mt-1.5 sm:mt-2 text-xs sm:text-base font-bold text-[#4B5563]">Your indoor</div>
        <div className="mt-4 sm:mt-6 mx-auto w-[82%] p-1.5 sm:p-2 rounded-2xl ring-1 ring-[#E5E7EB]">
          <QRCodeSVG value="https://jogous.io/indoors" level="M" marginSize={1} style={{ width: '100%', height: 'auto', display: 'block' }} title="Example check-in code" />
        </div>
        <div className="mt-4 sm:mt-6 text-[11px] sm:text-sm font-bold text-[#4B5563]">Open the Jogo app and tap Scan on your game.</div>
      </div>

      <motion.figure
        initial={{ opacity: 0, y: 40, rotate: 0 }}
        whileInView={{ opacity: 1, y: 0, rotate: 3 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className="absolute right-0 top-[20%] w-[44%] max-w-[240px] m-0"
      >
        <div className="relative rounded-[22px] sm:rounded-[28px] overflow-hidden ring-[5px] ring-[#0B0D10] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] bg-[#1C1F24]" style={{ aspectRatio: '260 / 440' }}>
          <img src={checkInClip} alt="A player scans the front-desk code with Jogo and is sent to Field 3" loading="lazy" className="w-full h-full object-cover block" />
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#0B0D10]/80 backdrop-blur px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            Real check-in
          </span>
        </div>
        <figcaption className="mt-3 text-center text-xs sm:text-sm font-bold text-white/60">Scan. Field 3. Done.</figcaption>
      </motion.figure>

      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
        className="absolute left-0 sm:-left-6 bottom-0 bg-[#1C1F24] ring-1 ring-white/10 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
      >
        <Users size={20} className="text-[#4ADE80]" />
        <div className="leading-tight">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/50">Your desk, live</div>
          <div className="font-extrabold">12 of 16 here</div>
        </div>
      </motion.div>
    </div>
  );
}

// ── The owner portal, sketched with its real tabs and real section names ──
// (src/IndoorPortal.jsx, src/indoor/*). Numbers are examples and say so.

function PTile({ k, v, sub, up }) {
  return (
    <div className="bg-white rounded-xl p-3 ring-1 ring-[#EEF0F2] min-w-0">
      <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] text-[#6B7280] leading-tight">{k}</div>
      <div style={DISPLAY} className="text-xl sm:text-2xl text-[#0B0D10] leading-tight mt-0.5">{v}</div>
      {sub ? <div className={`text-[10px] sm:text-[11px] font-bold leading-tight ${up ? 'text-[#15803D]' : 'text-[#9CA3AF]'}`}>{sub}</div> : null}
    </div>
  );
}

function PBars({ title, rows }) {
  const best = rows.reduce((a, b) => (b.v > a.v ? b : a), rows[0]);
  return (
    <div className="bg-white rounded-xl p-3 ring-1 ring-[#EEF0F2]">
      <div className="text-xs font-extrabold text-[#0B0D10] mb-2">{title}</div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center gap-2">
            <span className="w-14 sm:w-16 text-[10px] sm:text-[11px] font-bold text-[#4B5563] shrink-0">{r.l}</span>
            <span className="flex-1 h-2 rounded-full bg-[#F2F3F5] overflow-hidden">
              <span className="block h-full rounded-full bg-[#16A34A]" style={{ width: `${r.v}%`, opacity: r === best ? 1 : 0.45 }} />
            </span>
            <span className="w-8 text-right text-[10px] sm:text-[11px] font-extrabold text-[#0B0D10]">{r.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelOverview() {
  const rows = [
    { time: '7 PM', field: 'Field 1', n: 14, of: 16 },
    { time: '8 PM', field: 'Field 3', n: 10, of: 12 },
    { time: '9 PM', field: 'Field 1', n: 16, of: 16 },
  ];
  return (
    <>
      <div style={DISPLAY} className="text-2xl sm:text-3xl text-[#0B0D10]">TONIGHT</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <PTile k="Games" v="3" /><PTile k="Booked" v="40" /><PTile k="Checked in" v="28" />
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.time} className="bg-white rounded-xl px-3 py-2.5 ring-1 ring-[#EEF0F2] flex items-center gap-3">
            <span style={DISPLAY} className="text-lg w-12 text-[#0B0D10]">{r.time}</span>
            <span className="hidden sm:inline text-xs font-bold text-[#6B7280] w-14">{r.field}</span>
            <span className="flex-1 min-w-[48px] h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
              <span className="block h-full bg-[#16A34A] rounded-full" style={{ width: `${(r.n / r.of) * 100}%` }} />
            </span>
            <span className="text-xs font-extrabold text-[#0B0D10] w-10 text-right">{r.n}/{r.of}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function PanelRates() {
  const days = [
    { d: 'Mon–Thu', slots: [{ t: '6–9 PM', p: '$120/hr' }, { t: '9–11 PM', p: '$90/hr' }] },
    { d: 'Fri', slots: [{ t: '5–11 PM', p: '$140/hr' }] },
    { d: 'Sat', slots: [{ t: '9 AM–1 PM', p: '$100/hr' }, { t: '1–6 PM', p: '$130/hr' }] },
    { d: 'Sun', slots: [{ t: '10 AM–4 PM', p: '$110/hr' }] },
  ];
  return (
    <>
      <div style={DISPLAY} className="text-2xl sm:text-3xl text-[#0B0D10]">SLOTS &amp; RATES</div>
      <div className="mt-3 space-y-2">
        {days.map((r) => (
          <div key={r.d} className="bg-white rounded-xl px-3 py-2.5 ring-1 ring-[#EEF0F2] flex items-center gap-3">
            <span className="w-14 sm:w-16 text-xs font-extrabold text-[#0B0D10] shrink-0">{r.d}</span>
            <div className="flex flex-wrap gap-1.5">
              {r.slots.map((s) => (
                <span key={s.t} className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-[#0B0D10]">
                  {s.t}<span className="text-[#15803D] font-extrabold">{s.p}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-[#0B0D10] text-white px-3 py-2.5 text-[11px] sm:text-xs font-semibold leading-snug">
        Inside a slot, players book right away. Any other open hour, they request and you name the price.
      </div>
    </>
  );
}

function PanelAnalytics() {
  return (
    <>
      <div style={DISPLAY} className="text-2xl sm:text-3xl text-[#0B0D10]">ANALYTICS</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <PTile k="Page views" v="1,240" sub="last 30 days" />
        <PTile k="Tapped rent" v="112" sub="9% of views" />
        <PTile k="Most views" v="8 PM" sub="best time to post" up />
      </div>
      <div className="mt-2 rounded-xl bg-[#0B0D10] text-white px-3 py-2.5 text-[11px] sm:text-xs font-semibold leading-snug">
        <span className="text-[#4ADE80] font-extrabold">Tip</span> · 7–9 PM fills best, at 92% full. $10–$14 games fill best.
      </div>
      <div className="mt-2 grid sm:grid-cols-2 gap-2">
        <PBars title="What time fills best" rows={[{ l: '5–7 PM', v: 64 }, { l: '7–9 PM', v: 92 }, { l: '9–12 AM', v: 71 }]} />
        <PBars title="What price fills best" rows={[{ l: 'Free', v: 80 }, { l: '$10–$14', v: 88 }, { l: '$15–$19', v: 61 }]} />
      </div>
    </>
  );
}

function PanelMoney() {
  const rows = [
    { d: 'Nov 11', t: 'Game spot', p: '$12.00', k: '$12.00', s: 'Paid' },
    { d: 'Nov 11', t: 'Field rental', p: '$120.00', k: '$120.00', s: 'Paid' },
    { d: 'Nov 10', t: 'Game spot', p: '$12.00', k: '$6.00', s: 'Late cancel' },
  ];
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div style={DISPLAY} className="text-2xl sm:text-3xl text-[#0B0D10]">MONEY</div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B0D10] text-white px-3 py-1.5 text-[10px] sm:text-[11px] font-extrabold whitespace-nowrap">
          <Download size={12} /> Export for taxes
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <PTile k="Earned" v="$4,820" sub="↑ 18% vs last 30 days" up />
        <PTile k="Per field hour" v="$96" sub="on hours sold" />
        <PTile k="Field time used" v="62%" sub="of open hours" />
      </div>
      <div className="mt-2 bg-white rounded-xl ring-1 ring-[#EEF0F2] overflow-hidden">
        <div className="grid grid-cols-[1fr_1.4fr_1fr_1fr] sm:grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr] gap-2 px-3 py-2 bg-[#F2F3F5] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6B7280]">
          <span>Date</span><span>Type</span><span className="hidden sm:block">Your price</span><span>You kept</span><span>Status</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.4fr_1fr_1fr] sm:grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr] gap-2 px-3 py-2 border-t border-[#F2F3F5] text-[10px] sm:text-[11px] font-bold text-[#0B0D10]">
            <span>{r.d}</span><span className="truncate">{r.t}</span><span className="hidden sm:block">{r.p}</span><span>{r.k}</span>
            <span className={r.s === 'Paid' ? 'text-[#15803D]' : 'text-[#B45309]'}>{r.s}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const PORTAL_FEATURES = [
  { tab: 'Overview', I: LayoutDashboard, t: 'Tonight at a glance', b: 'Every game, who’s booked, who’s checked in, and requests waiting for an answer.', Panel: PanelOverview },
  { tab: 'Slots & rates', I: Clock, t: 'Set prices for certain hours', b: 'Charge more for prime time and less for off-peak. Set an hourly rate for any slot on any day, and players book it instantly.', Panel: PanelRates },
  { tab: 'Analytics', I: BarChart3, t: 'See what works', b: 'How many players open your page and when, which hours they ask for, and which times, days and prices fill best, with tips once the numbers are clear.', Panel: PanelAnalytics },
  { tab: 'Money', I: Wallet, t: 'A clean sheet for your accountant', b: 'Earnings compared with last period, money per field hour and how much field time you sell. Export every payment to a spreadsheet for taxes in one click.', Panel: PanelMoney },
];

function PortalDemo() {
  const [active, setActive] = useState(0);
  const f = PORTAL_FEATURES[active];
  const Panel = f.Panel;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-5 lg:gap-12 items-start">
      {/* Phones: short pills right above the window, so a tap changes what you're looking at. */}
      <div className="lg:hidden min-w-0">
        <div className="-mx-5 px-5 flex gap-2 overflow-x-auto hp-noscroll" role="tablist" aria-label="Owner portal sections">
          {PORTAL_FEATURES.map(({ tab, I }, i) => {
            const on = i === active;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(i)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold transition-colors ${on ? 'bg-white text-[#0B0D10]' : 'bg-white/10 text-white/75'}`}
              >
                <I size={16} /> {tab}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <div className="text-lg font-extrabold">{f.t}</div>
          <p className="mt-1 text-white/65 font-medium leading-relaxed">{f.b}</p>
        </div>
      </div>

      <div className="hidden lg:block space-y-2" role="tablist" aria-label="Owner portal">
        {PORTAL_FEATURES.map(({ tab, I, t, b }, i) => {
          const on = i === active;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={`w-full text-left rounded-2xl px-4 sm:px-5 py-4 flex gap-4 transition-colors ${on ? 'bg-white text-[#0B0D10]' : 'bg-white/[0.04] text-white hover:bg-white/10'}`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${on ? 'bg-[#ECFDF3] text-[#15803D]' : 'bg-emerald-400/15 text-emerald-300'}`}><I size={19} /></span>
              <span className="min-w-0">
                <span className="block text-base sm:text-lg font-extrabold">{t}</span>
                <span className={`block text-sm font-medium leading-relaxed ${on ? 'text-[#4B5563]' : 'text-white/55'}`}>{b}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-black/5 lg:sticky lg:top-28">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#F2F3F5] border-b border-[#E5E7EB]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
          <span className="ml-3 flex-1 max-w-[280px] rounded-md bg-white px-3 py-1 text-[11px] font-semibold text-[#6B7280] truncate">jogous.io/indoors/portal</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] min-h-[380px]">
          <div className="bg-[#0B0D10] p-2 sm:p-3 space-y-1">
            {PORTAL_TABS.map(({ l, I }) => {
              const i = PORTAL_FEATURES.findIndex((x) => x.tab === l);
              const on = l === f.tab;
              return (
                <button
                  key={l}
                  type="button"
                  disabled={i < 0}
                  onClick={() => i >= 0 && setActive(i)}
                  aria-label={l}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-2 sm:px-3 py-2 text-xs font-bold ${on ? 'bg-white text-[#0B0D10]' : 'text-white/60'} ${i >= 0 && !on ? 'hover:bg-white/10' : ''}`}
                >
                  <I size={15} />
                  <span className="hidden sm:inline whitespace-nowrap">{l}</span>
                </button>
              );
            })}
          </div>
          <div className="p-3 sm:p-5 bg-[#F7F8FA] min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={f.tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <Panel />
              </motion.div>
            </AnimatePresence>
            <div className="mt-2 text-[10px] font-semibold text-[#9CA3AF]">Example data</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-[#DDE1E5] border-y border-[#DDE1E5]">
      {FAQ.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? -1 : i)}
              className="w-full flex items-center justify-between gap-6 py-5 text-left"
            >
              <span className="text-lg sm:text-xl font-extrabold">{f.q}</span>
              <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${on ? 'bg-[#0B0D10] text-white rotate-180' : 'bg-white text-[#0B0D10]'}`}>
                <ChevronDown size={18} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {on ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-12 text-[#4B5563] font-medium leading-relaxed max-w-3xl">{f.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function Indoors() {
  useMatchdayFonts();
  const [scrolled, setScrolled] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    document.title = 'Host your indoor on Jogo';
    // Arriving from the homepage footer keeps the old scroll position; start at the top.
    // 'instant' so the page-wide smooth scroll-behavior doesn't animate the jump.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      const apply = document.getElementById('apply');
      const pastHero = window.scrollY > 640;
      const atApply = apply ? apply.getBoundingClientRect().top < window.innerHeight * 0.8 : false;
      setShowSticky(pastHero && !atApply);
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
          .hp-noscroll { scrollbar-width: none; } .hp-noscroll::-webkit-scrollbar { display: none; }
          @media (prefers-reduced-motion: reduce) { .hp-marquee { animation: none; } }
        `}</style>

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
            <nav className="hidden lg:flex items-center gap-1 text-sm font-bold text-white/70">
              {NAV.map((l) => (
                <a key={l.href} href={l.href} className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors">{l.label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-1.5">
              <a href={PORTAL} className="hidden sm:inline-flex px-3 py-2 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Owner sign in
              </a>
              <a href="#apply" className="bg-white text-[#0B0D10] rounded-xl px-4 py-2 text-sm font-extrabold hover:bg-white/90 transition-colors">
                Apply now
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
              <a href="#apply" className="flex items-center justify-center gap-2 bg-[#16A34A] text-white font-extrabold py-3.5 rounded-xl text-[15px] active:opacity-80">
                Put your indoor on Jogo <ArrowRight size={18} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          {/* ── HERO ───────────────────────────────────────────────────── */}
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

            <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-6 items-center">
              <div className="lg:pb-24">
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
                  Post your open hours on Jogo and players nearby book them, pay up front and check themselves in at your front desk. You set the price and get your cut.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <a href="#apply" className="inline-flex items-center gap-2 bg-[#16A34A] text-white rounded-xl px-6 py-3.5 font-extrabold text-base hover:bg-[#15803D] transition-colors">
                    Apply now <ArrowRight size={18} />
                  </a>
                  <a href="#how" className="inline-flex items-center gap-2 border border-white/20 text-white rounded-xl px-6 py-3.5 font-extrabold text-base hover:bg-white/10 transition-colors">
                    See how it works
                  </a>
                </motion.div>

                <div className="mt-10 flex items-center gap-4 sm:gap-8">
                  {[
                    { v: '5,000+', l: 'Players' },
                    { v: '2,000+', l: 'Games' },
                    { v: '~1 day', l: 'To approve' },
                  ].map((s, i) => (
                    <React.Fragment key={s.l}>
                      {i ? <div className="h-10 w-px bg-white/15" /> : null}
                      <div>
                        <span style={DISPLAY} className="block whitespace-nowrap text-[1.75rem] sm:text-4xl text-white">{s.v}</span>
                        <span className="whitespace-nowrap text-[10px] sm:text-sm font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-white/50">{s.l}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Phone fan rising out of the bottom edge */}
              <div className="relative flex justify-center items-end mt-2 lg:mt-0 translate-y-[6%]">
                <Band className="lg:hidden w-[48%] h-[190%] -top-[25%] left-[30%]" opacity={0.9} />
                <motion.div
                  initial={{ opacity: 0, y: 80, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: -9 }}
                  transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
                  className="w-[32%] max-w-[190px] -mr-[8%] mb-[-2%] origin-bottom-right"
                >
                  <Phone src={shotHome} alt="An indoor game on the Jogo home screen" eager />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.22, ease: EASE }}
                  className="w-[42%] max-w-[250px] relative z-10"
                >
                  <Phone src={shotSchedule} alt="A verified indoor page with its schedule" eager />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 80, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: 9 }}
                  transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
                  className="w-[32%] max-w-[190px] -ml-[8%] mb-[-2%] origin-bottom-left"
                >
                  <Phone src={shotGame} alt="The game page players see" eager />
                </motion.div>

                {/* Positioned by the wrapper; motion owns the inner transform. */}
                <div className="absolute z-20 top-[4%] left-1/2 -translate-x-1/2 lg:left-[-14%] lg:translate-x-0 lg:top-[10%] w-[84%] max-w-[320px]">
                  <motion.div
                    initial={{ opacity: 0, y: -16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.1, ease: EASE }}
                  >
                    <ApprovedNotification />
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          <Ticker />

          {/* ── 01 GET SEEN ────────────────────────────────────────────── */}
          <section id="seen" className="hp-anchor px-5 sm:px-8 py-20 sm:py-32">
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <Kicker n="01">Get seen</Kicker>
                <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl max-w-4xl">
                  Everywhere players look,<br /><span className="text-[#15803D]">there you are.</span>
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-2xl text-[#4B5563]">
                  Players open Jogo to find a game tonight. Every hour you post shows up where they’re already looking, with your name and logo on it.
                </p>
              </Reveal>

              <div className="mt-12 -mx-5 px-5 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory hp-noscroll pb-2">
                {SEEN.map((s, i) => (
                  <Reveal key={s.t} delay={i * 0.08} className="snap-center shrink-0 w-[68%] sm:w-auto">
                    <Phone src={s.src} alt={s.alt} className="w-full max-w-[250px] mx-auto" />
                    <div className="mt-5 text-center sm:text-left max-w-[250px] mx-auto">
                      <div className="text-lg font-extrabold">{s.t}</div>
                      <div className="text-[#4B5563] font-medium leading-snug">{s.b}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── 02 HOW IT WORKS ────────────────────────────────────────── */}
          <section id="how" className="hp-anchor px-5 sm:px-8 pb-20 sm:pb-32">
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <Kicker n="02">How it works</Kicker>
                <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl max-w-4xl">
                  Signed up today.<br /><span className="text-[#15803D]">Booked this week.</span>
                </h2>
              </Reveal>
              <Journey />
            </div>
          </section>

          {/* ── 03 CHECK-IN ────────────────────────────────────────────── */}
          <section id="checkin" className="hp-anchor relative bg-[#0B0D10] text-white overflow-hidden px-5 sm:px-8 py-20 sm:py-32">
            <Band className="w-[30vw] max-w-[420px] h-[170%] -top-[35%] left-[-16vw] sm:left-[-12vw]" opacity={0.75} />
            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <Reveal className="lg:order-2">
                <Kicker n="03" dark>Front-desk check-in</Kicker>
                <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                  No clipboard.<br /><span className="text-[#4ADE80]">No line at the desk.</span>
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl text-white/65">
                  Jogo gives you one check-in code. Put it on a screen at the front desk or print it out. Players scan it when they walk in and Jogo tells them exactly which field to go to.
                </p>
                <Points
                  dark
                  items={[
                    'One code for your whole facility, ready the day you’re verified',
                    'Players see their field the second they scan',
                    'Watch who’s arrived, live, from your phone or computer',
                    'Prints clean on any black-and-white printer',
                  ]}
                />
                <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-white/70">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><Monitor size={16} /> Show it on a screen</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><Printer size={16} /> Or print it</span>
                </div>
              </Reveal>
              <Reveal delay={0.12} className="lg:order-1 py-6">
                <CheckInScene />
              </Reveal>
            </div>
          </section>

          {/* ── 04 MONEY ───────────────────────────────────────────────── */}
          <section id="money" className="hp-anchor px-5 sm:px-8 py-20 sm:py-32">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <Kicker n="04">Getting paid</Kicker>
                <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                  You set the price.<br /><span className="text-[#15803D]">You get your cut.</span>
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl text-[#4B5563]">
                  Players pay up front when they book. Card fees and Jogo’s fee are already included in the price, so there’s nothing to work out on your end.
                </p>
                <Points
                  items={[
                    'Paid up front, so no chasing anyone for cash',
                    'Your cut goes to your bank after every game',
                    'Run free games whenever you want',
                  ]}
                />
              </Reveal>

              <Reveal delay={0.12}>
                <ol className="relative bg-white text-[#0B0D10] rounded-3xl p-6 sm:p-8 max-w-md lg:ml-auto shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
                  {[
                    { I: CreditCard, t: 'A player books', b: 'They pay up front in the Jogo app.' },
                    { I: QrCode, t: 'They show up and play', b: 'Checked in at your front desk.' },
                    { I: Landmark, t: 'Your cut hits your bank', b: 'Sent through Stripe after the game.' },
                  ].map(({ I, t, b }, i) => (
                    <li key={t} className={`relative flex items-center gap-4 ${i ? 'mt-7' : ''}`}>
                      <span className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${i === 2 ? 'bg-[#16A34A] text-white' : 'bg-[#ECFDF3] text-[#15803D]'}`}><I size={21} /></span>
                      <div>
                        <div className="font-extrabold text-lg leading-tight">{t}</div>
                        <div className="text-[#4B5563] font-medium">{b}</div>
                      </div>
                    </li>
                  ))}
                  <li className="mt-7 rounded-2xl bg-[#0B0D10] text-white px-5 py-4 flex items-center gap-3">
                    <BadgeCheck size={20} className="text-[#4ADE80] flex-shrink-0" />
                    <span className="font-extrabold">Fees included. Nothing to work out.</span>
                  </li>
                </ol>
              </Reveal>
            </div>
          </section>

          {/* ── 05 PLAYERS COME TO YOU ──────────────────────────────────── */}
          <section id="demand" className="hp-anchor relative bg-[#0B0D10] text-white overflow-hidden px-5 sm:px-8 py-20 sm:py-32">
            <Band className="w-[30vw] max-w-[420px] h-[170%] -top-[35%] right-[-16vw] sm:right-[-8vw]" opacity={0.75} />
            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
              <Reveal>
                <Kicker n="05" dark>Players come to you</Kicker>
                <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                  They follow.<br /><span className="text-[#4ADE80]">They ask to play.</span>
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl text-white/65">
                  You don’t have to fill every hour yourself. Players keep up with your indoor and bring you bookings of their own.
                </p>
                <div className="mt-8 space-y-6">
                  {DEMAND.map(({ I, t, b }) => (
                    <div key={t} className="flex gap-4">
                      <span className="w-11 h-11 rounded-xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center flex-shrink-0"><I size={21} /></span>
                      <div>
                        <div className="text-lg font-extrabold">{t}</div>
                        <div className="text-white/65 font-medium leading-relaxed">{b}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.12} className="relative">
                <Phones
                  shots={[
                    { src: shotFollow, alt: 'Indoor page as a player sees it, with Follow, the alerts bell and Join a game' },
                    { src: shotRent, alt: 'Rent a field: pick a date, start time, length and field, then send a request' },
                  ]}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
                  className="absolute z-20 left-0 sm:left-[2%] bottom-[-4%] bg-white text-[#0B0D10] rounded-2xl px-4 py-3 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] flex items-center gap-3"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center"><Key size={18} /></span>
                  <div className="leading-tight">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#15803D]">New field request</div>
                    <div className="font-extrabold">Thu · 7–8 PM · Field 2</div>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </section>

          {/* ── 06 YOUR RULES + PORTAL ─────────────────────────────────── */}
          <section className="px-5 sm:px-8 py-20 sm:py-32">
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <Kicker n="06">Run it your way</Kicker>
                <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl max-w-4xl">
                  Your fields.<br /><span className="text-[#15803D]">Your rules.</span>
                </h2>
              </Reveal>

              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { I: Clock, t: 'Your cancellation rules', b: 'Free cancellation until 24, 48 or 72 hours before. After that you keep 25%, 50% or all of it.' },
                  { I: MapPin, t: 'As many fields as you have', b: 'Every game gets its own field, and check-in sends each player to the right one.' },
                  { I: Share2, t: 'Links for every game', b: 'One tap to Instagram, WhatsApp or a group chat to bring your regulars onto Jogo.' },
                  { I: BadgeCheck, t: 'Verified on Jogo', b: 'Every indoor is checked by hand, so players know you’re the real thing.' },
                ].map(({ I, t, b }, i) => (
                  <Reveal key={t} delay={(i % 4) * 0.06}>
                    <div className="h-full bg-white rounded-3xl p-7 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.25)]">
                      <span className="w-11 h-11 rounded-xl bg-[#ECFDF3] text-[#15803D] flex items-center justify-center"><I size={21} /></span>
                      <h3 className="mt-5 text-xl font-extrabold">{t}</h3>
                      <p className="mt-2 text-[#4B5563] leading-relaxed font-medium">{b}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          </section>

          {/* ── 07 OWNER PORTAL ────────────────────────────────────────── */}
          <section id="portal" className="hp-anchor relative bg-[#0B0D10] text-white overflow-hidden px-5 sm:px-8 py-20 sm:py-32">
            <Band className="max-lg:hidden w-[26vw] max-w-[380px] h-[170%] -top-[35%] right-[-10vw]" opacity={0.7} />
            <div className="relative max-w-6xl mx-auto">
              <Reveal className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mb-12">
                <div>
                  <Kicker n="07" dark>The owner portal</Kicker>
                  <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl max-w-4xl">
                    Run the business<br /><span className="text-[#4ADE80]">from a real desk.</span>
                  </h2>
                  <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-2xl text-white/65">
                    Sign in at jogous.io/indoors/portal on any computer with the same account. Everything from the app, plus the numbers that tell you how to price and when to post.
                  </p>
                </div>
                <a href={PORTAL} className="justify-self-start inline-flex items-center gap-2 bg-white text-[#0B0D10] rounded-xl px-5 py-3 font-extrabold hover:bg-white/90 transition-colors">
                  Owner sign in <ArrowRight size={18} />
                </a>
              </Reveal>
              <Reveal delay={0.08}>
                <PortalDemo />
              </Reveal>
            </div>
          </section>

          {/* ── FAQ ────────────────────────────────────────────────────── */}
          <section id="faq" className="hp-anchor px-5 sm:px-8 py-20 sm:py-32">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
              <Reveal>
                <Kicker>Questions</Kicker>
                <h2 style={DISPLAY} className="uppercase text-[2.9rem] leading-[1.02] sm:text-6xl">
                  Straight<br /><span className="text-[#15803D]">answers.</span>
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#4B5563]">
                  Something else on your mind? You’ll be talking to the people who built Jogo.
                </p>
                <a href={CONTACT} className="mt-6 inline-flex items-center gap-2 font-extrabold hover:text-[#16A34A] transition-colors">
                  <Mail size={18} /> Email us
                </a>
              </Reveal>
              <Reveal delay={0.08}>
                <Faq />
              </Reveal>
            </div>
          </section>

          {/* ── APPLY ──────────────────────────────────────────────────── */}
          <section id="apply" className="hp-anchor relative bg-[#0B0D10] text-white overflow-hidden px-5 sm:px-8 py-20 sm:py-32">
            <Band className="w-[34vw] max-w-[480px] h-[200%] -top-[50%] right-[-16vw] sm:right-[-6vw]" opacity={0.85} />
            <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <Reveal>
                <div className="text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-white/50 mb-4">Now onboarding our first indoors</div>
                <h2 style={DISPLAY} className="uppercase text-[3.2rem] leading-[1] sm:text-7xl lg:text-8xl">
                  Fill your<br /><span className="text-[#16A34A]">next empty hour.</span>
                </h2>
                <p className="mt-6 text-base sm:text-lg leading-relaxed max-w-xl text-white/65">
                  Download, apply, start. No paperwork, no sales calls, and you’re usually live within a day.
                </p>
                <StoreRow invert className="mt-8" />
                <a href={CONTACT} className="mt-6 inline-flex items-center gap-2 font-extrabold text-white/80 hover:text-[#4ADE80] transition-colors">
                  Rather talk first? Email us <ArrowRight size={18} />
                </a>
              </Reveal>

              <Reveal delay={0.1}>
                <ol className="bg-white text-[#0B0D10] rounded-3xl p-6 sm:p-8">
                  {[
                    { t: 'Download', b: 'Get Jogo on iPhone or Android.' },
                    { t: 'Apply', b: 'Tap the soccer ball at the bottom of the app, then Create game, then “Own an indoor?” Add your photos and hours.' },
                    { t: 'Start', b: 'Get the green light and post your first game.' },
                  ].map((s, i) => (
                    <li key={s.t} className={`flex items-center gap-4 sm:gap-5 py-5 ${i ? 'border-t border-[#EEF0F2]' : 'pt-1'} ${i === 2 ? 'pb-1' : ''}`}>
                      <span style={DISPLAY} className="w-12 sm:w-14 text-4xl sm:text-5xl text-[#16A34A] leading-none flex-shrink-0">0{i + 1}</span>
                      <div className="min-w-0">
                        <div style={DISPLAY} className="uppercase text-3xl sm:text-4xl leading-none">{s.t}</div>
                        <div className="mt-1.5 text-[#4B5563] font-medium">{s.b}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="bg-[#EDEEF1] pt-10 pb-10 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <a href="/"><img src={jogoLogo} alt="Jogo" className="h-6 w-auto" /></a>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#4B5563]">
              <a href={PORTAL} className="hover:text-[#0B0D10]">Owner sign in</a>
              <a href="/host-terms" className="hover:text-[#0B0D10]">Host Terms</a>
              <a href="/terms" className="hover:text-[#0B0D10]">Terms</a>
              <a href="/policy" className="hover:text-[#0B0D10]">Privacy</a>
            </nav>
          </div>
          <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-[#DDE1E5]">
            <p className="text-xs text-[#9CA3AF] font-medium">© {new Date().getFullYear()} Jogo. Pioneered in New Jersey by players, for players.</p>
          </div>
        </footer>

        {/* Room for the sticky CTA on phones */}
        <div className="h-20 md:hidden bg-[#EDEEF1]" />
      </div>
    </MotionConfig>
  );
}

// src/PaidEvent.jsx — shared-link page for a PAID event (events/{id} with
// `ticketing`, set by the app's "Collect payment in the app" switch).
//
// This page has one job: get the person who tapped the link to claim a
// spot. So it reads like a drop, not a details page — a full-screen black
// poster (the event's photo behind it, Jogo's Matchday look), one giant
// title, one date line, live scarcity and the faces already in, a gold
// ticker, three big tiles, and one sticky button. Everything else (teams,
// seat map, chat, check-in) lives in the app, which is where the button
// sends people. Live via the parent's onSnapshot.

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';
import { APP_URL, HeaderStoreLinks } from './appLinks';

const INK = '#0B0D10';
const GOLD = '#FACC15';
const GOLD_DEEP = '#A16207';
const RED = '#EF4444';
const EASE = [0.22, 1, 0.36, 1];
const ANTON = { fontFamily: "'Anton', Impact, sans-serif", fontWeight: 400 };
const BARLOW = "'Barlow', system-ui, sans-serif";

function useDropFonts() {
  useEffect(() => {
    if (document.getElementById('jogo-programme-fonts')) return;
    const link = document.createElement('link');
    link.id = 'jogo-programme-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);
}

function parseStart(event) {
  if (event?.ticketing?.startsAt?.toDate) return event.ticketing.startsAt.toDate();
  if (!event?.date) return null;
  const [y, m, d] = event.date.split('-').map(Number);
  const [hh, mm] = String(event.time || '').split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
}

// "Riverside Park, Newark, NJ 07102, USA" → "Newark" — the drop shows the
// town, not the address.
const townOf = (location) => {
  if (!location) return null;
  const parts = String(location).split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) return parts[parts.length - 3].replace(/\d+/g, '').trim() || parts[0];
  return parts[0];
};

const dollars = (cents) => `$${(cents / 100) % 1 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;

export default function PaidEvent({ event, refName }) {
  useDropFonts();
  const tk = event.ticketing;
  const start = parseStart(event);
  const photo = event.imageUrl || null;
  const teams = Array.isArray(event.teams) ? event.teams : [];
  const hasTeams = !!event.enableTeams && teams.length > 0;
  const roster = hasTeams ? teams.flatMap((t) => t.players || []) : (Array.isArray(event.participants) ? event.participants : []);
  const cap = tk.capacity || 0;
  const left = Math.max(0, cap - roster.length - (tk.heldCount || 0));
  const pct = cap ? Math.min(100, Math.round(((cap - left) / cap) * 100)) : 0;
  const selling = tk.status === 'open' || tk.status === 'confirming';
  const cancelled = tk.status === 'cancelled';
  const isPast = !!start && start.getTime() < Date.now() - 12 * 3600 * 1000;
  const faces = roster.filter((p) => p.photoURL).slice(0, 5);
  const firstName = (roster[0]?.displayName || '').split(' ')[0];

  useEffect(() => { if (event.title) document.title = `${event.title} · Jogo`; }, [event.title]);

  const dateLine = start
    ? [
      start.toLocaleDateString('en-US', { weekday: 'short' }),
      start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      event.time ? start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '') : null,
      townOf(event.location),
    ].filter(Boolean).join(' · ').toUpperCase()
    : 'DATE TBA';

  const tickerBits = [
    (event.title || 'JOGO EVENT').toUpperCase(),
    start ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : null,
    event.format ? event.format.toUpperCase() : null,
    hasTeams ? `${teams.length} TEAMS` : null,
    tk.collectShirtSize !== false ? 'SHIRT INCLUDED' : null,
    selling && left > 0 ? `${left} SPOTS LEFT` : null,
  ].filter(Boolean);
  const ticker = [...tickerBits, ...tickerBits, ...tickerBits, ...tickerBits];

  const tiles = [
    { big: dollars(tk.priceCents), small: 'TO PLAY' },
    event.format ? { big: event.format.toUpperCase(), small: 'FORMAT' } : null,
    hasTeams ? { big: String(teams.length), small: 'TEAMS' } : { big: String(cap), small: 'SPOTS' },
  ].filter(Boolean).slice(0, 3);

  const ctaLabel = !selling ? 'OPEN IN JOGO' : left > 0 ? 'CLAIM YOUR SPOT' : 'JOIN THE WAITLIST';

  return (
    <div className="min-h-screen antialiased" style={{ background: INK, fontFamily: BARLOW, color: '#FFFFFF' }}>
      <style>{`
        @keyframes drop-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .drop-marquee { animation: drop-marquee 22s linear infinite; }
        @keyframes drop-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.8); } }
        .drop-pulse { animation: drop-pulse 1.4s ease-in-out infinite; }
        @keyframes drop-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.55); } 60% { box-shadow: 0 0 0 14px rgba(250,204,21,0); } }
        .drop-glow { animation: drop-glow 2.4s ease-out infinite; }
      `}</style>

      {/* ── Poster ─────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden">
        {photo ? (
          <motion.img
            src={photo} alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: EASE }}
          />
        ) : null}
        <div className="absolute inset-0" style={{
          background: photo
            ? 'linear-gradient(180deg, rgba(11,13,16,.55) 0%, rgba(11,13,16,.25) 35%, rgba(11,13,16,.92) 78%, #0B0D10 100%)'
            : '#0B0D10',
        }} />
        {!photo ? (
          <div className="absolute -left-1/4 -right-1/4 top-[38%] h-56 -rotate-12" style={{ background: GOLD_DEEP, opacity: 0.55 }} />
        ) : null}

        <header className="relative z-10 px-5 pt-5 flex items-center justify-between max-w-xl w-full mx-auto">
          <a href="/" className="flex items-center gap-2">
            <img src={appIcon} alt="" className="w-8 h-8 rounded-[10px]" />
            <span className="font-extrabold text-lg tracking-tight">jogo</span>
          </a>
          <HeaderStoreLinks />
        </header>

        <div className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-10 max-w-xl w-full mx-auto">
          <motion.p
            className="text-[13px] font-extrabold tracking-[0.22em]" style={{ color: GOLD }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
          >
            {refName ? `${refName.toUpperCase()} INVITED YOU` : 'OFFICIAL JOGO EVENT'}
          </motion.p>

          <motion.h1
            className="mt-2 break-words"
            style={{ ...ANTON, fontSize: 'clamp(64px, 19vw, 132px)', lineHeight: 1.25 }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
          >
            {(event.title || 'Jogo event').toUpperCase()}
          </motion.h1>

          <motion.p
            className="mt-1 text-[15px] font-extrabold tracking-[0.12em] text-white/80"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}
          >
            {dateLine}
          </motion.p>

          {cancelled ? (
            <div className="mt-6 rounded-2xl px-4 py-3 font-extrabold" style={{ background: RED }}>
              CANCELLED — everyone who paid was refunded.
            </div>
          ) : isPast ? (
            <div className="mt-6 rounded-2xl px-4 py-3 font-extrabold bg-white/10">This one already happened. Catch the next one on Jogo.</div>
          ) : (
            <motion.div
              className="mt-7"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6, ease: EASE }}
            >
              <div className="flex items-center gap-2.5">
                <span className="drop-pulse w-2.5 h-2.5 rounded-full" style={{ background: left > 0 && left <= 10 ? RED : GOLD }} />
                <span style={{ ...ANTON, fontSize: 30, lineHeight: 1.25 }}>
                  {!selling ? 'TEAMS ARE LOCKED' : left > 0 ? `${left} SPOT${left === 1 ? '' : 'S'} LEFT` : 'SOLD OUT'}
                </span>
              </div>
              <div className="mt-2.5 h-2 rounded-full bg-white/15 overflow-hidden">
                <motion.div
                  className="h-full rounded-full" style={{ background: GOLD }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.8, duration: 1.2, ease: EASE }}
                />
              </div>
              {roster.length > 0 ? (
                <div className="mt-4 flex items-center gap-3">
                  {faces.length ? (
                    <div className="flex -space-x-2.5">
                      {faces.map((p, i) => (
                        <img key={p.userId || i} src={p.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" style={{ boxShadow: `0 0 0 2px ${INK}` }} />
                      ))}
                    </div>
                  ) : null}
                  <p className="text-[14px] font-bold text-white/80">
                    {firstName
                      ? <><span className="text-white">{firstName}</span>{roster.length > 1 ? ` + ${roster.length - 1} are in` : ' is in'}</>
                      : `${roster.length} already in`}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-[14px] font-bold text-white/80">Be the first one in.</p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Ticker ─────────────────────────────────────────────── */}
      <div className="overflow-hidden py-3 -rotate-1 scale-[1.03]" style={{ background: GOLD, color: INK }}>
        <div className="drop-marquee flex w-max gap-8 whitespace-nowrap">
          {ticker.map((t, i) => (
            <span key={i} className="flex items-center gap-8" style={{ ...ANTON, fontSize: 22, lineHeight: 1.25 }}>
              {t}<span aria-hidden="true">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Tiles ──────────────────────────────────────────────── */}
      <section className="max-w-xl mx-auto px-5 pt-10 pb-40">
        <div className={`grid gap-3 ${tiles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {tiles.map((t, i) => (
            <motion.div
              key={t.small}
              className="rounded-3xl bg-white/[0.06] border border-white/10 px-3 py-5 text-center"
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
            >
              <div style={{ ...ANTON, fontSize: 'clamp(30px, 9vw, 44px)', lineHeight: 1.25, color: i === 0 ? GOLD : '#FFFFFF' }}>{t.big}</div>
              <div className="mt-1 text-[11px] font-extrabold tracking-[0.2em] text-white/55">{t.small}</div>
            </motion.div>
          ))}
        </div>

        {event.description ? (
          <p className="mt-8 text-[16px] leading-[1.55] font-semibold text-white/70 line-clamp-3 whitespace-pre-line">{event.description}</p>
        ) : null}

        <div className="mt-12 flex items-center justify-center gap-2 text-[12px] text-white/45">
          <img src={appIcon} alt="" className="w-5 h-5 rounded-md opacity-80" />
          <span>Pickup, crews & tournaments — all on Jogo</span>
        </div>
      </section>

      {/* ── Sticky CTA ─────────────────────────────────────────── */}
      {!cancelled && !isPast ? (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]"
          style={{ background: 'linear-gradient(180deg, rgba(11,13,16,0) 0%, rgba(11,13,16,.92) 35%)' }}>
          <div className="max-w-xl mx-auto">
            <a
              href={APP_URL} target="_blank" rel="noopener noreferrer"
              className="drop-glow group flex items-center justify-between h-16 rounded-full pl-7 pr-2.5"
              style={{ background: GOLD, color: INK }}
            >
              <span style={{ ...ANTON, fontSize: 24, lineHeight: 1.25 }}>{ctaLabel}</span>
              <span className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1" style={{ background: INK }}>
                <ArrowRight size={22} color={GOLD} strokeWidth={3} />
              </span>
            </a>
            <p className="text-center text-[12px] font-bold text-white/55 mt-2">
              {dollars(tk.priceCents)} · get the Jogo app · takes 30 seconds
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// src/PaidEvent.jsx — shared-link page for a PAID event (events/{id} with
// `ticketing`, set by the app's "Collect payment in the app" switch).
//
// The web twin of the app's components/events/PaidEventLayout.js, so the
// link and the app feel like one thing — a brand campaign drop:
//   1. Cover — the whole first screen is the photo (or a black stadium
//      night under a floodlight), the JOGO × PARTNER lockup up top, and at
//      the bottom whoever invited you, "Presented by", a huge Anton title,
//      date · place and a live spots pill. The photo drifts slower than the
//      scroll and the cover text fades as you leave it.
//   2. Facts — ENTRY · SPOTS LEFT · FORMAT in big numbers over one thin bar.
//   3. About, then an editorial WHEN / WHERE / TEAMS / REFUNDS table.
//   4. The teams — numbered rows with a fill line and JOIN.
//   5. A sign-off lockup, and one black bottom bar: price + GET IN.
// Paying, picking a team, chat and check-in all happen in the app, so every
// button sends people to the app store. Live via the parent's onSnapshot.

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { APP_URL, StoreButtons } from './appLinks';

const INK = '#0A0A0A';
const MUTED = '#6B7280';
const FAINT = '#A3A3A3';
const LINE = '#EBEBEB';
const RED = '#DC2626';
const EASE = [0.22, 1, 0.36, 1];
// Anton: line-height >= 1.25 × font-size or the caps get clipped.
const ANTON = { fontFamily: "'Anton', Impact, sans-serif", fontWeight: 400, lineHeight: 1.25 };
const BARLOW = "'Barlow', system-ui, sans-serif";
// Same fallback palette the app's DynamicEventScreen gives teams.
const TEAM_PALETTE = ['#E5484D', '#0A84FF', '#B8860B', '#16A34A', '#9333EA', '#EA580C', '#DB2777', '#0891B2'];

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

const dollars = (cents) => `$${(cents / 100) % 1 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;
const shortDate = (d) => d?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '';
const placeOf = (location) => (location ? String(location).split(',')[0].trim() : null);
const two = (n) => String(n).padStart(2, '0');

function Face({ player, size = 22 }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, background: '#E5E5E5', boxShadow: '0 0 0 2px #FFFFFF' }}
    >
      {player.photoURL
        ? <img src={player.photoURL} alt="" className="absolute inset-0 w-full h-full object-cover" />
        : <span style={{ color: INK, fontWeight: 800, fontSize: size * 0.42 }}>{(player.displayName || '?')[0].toUpperCase()}</span>}
    </span>
  );
}

function Lockup({ partner, color, size }) {
  const word = { ...ANTON, fontSize: size, lineHeight: 1.3, letterSpacing: 1.2 };
  return (
    <span className="inline-flex items-center gap-[7px] max-w-full" style={{ color }}>
      <span style={word}>JOGO</span>
      {partner ? (
        <>
          <span style={{ fontSize: size * 0.9, fontWeight: 500, opacity: 0.7 }}>×</span>
          <span className="truncate" style={word}>{partner.toUpperCase()}</span>
        </>
      ) : null}
    </span>
  );
}

export default function PaidEvent({ event, refName }) {
  useDropFonts();
  const coverRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: coverRef, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const topOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const tk = event.ticketing;
  const photo = event.imageUrl || null;
  const partner = (event.partnerName || '').trim();
  const start = parseStart(event);
  const teams = Array.isArray(event.teams) ? event.teams : [];
  const hasTeams = !!event.enableTeams && teams.length > 0;
  const roster = hasTeams ? teams.flatMap((t) => t.players || []) : (Array.isArray(event.participants) ? event.participants : []);
  const taken = roster.length;
  const cap = tk.capacity || 0;
  const left = Math.max(0, cap - taken - (tk.heldCount || 0));
  const selling = tk.status === 'open' || tk.status === 'confirming';
  const cancelled = tk.status === 'cancelled';
  const isPast = !!start && start.getTime() < Date.now() - 12 * 3600 * 1000;
  const live = !cancelled && !isPast;
  const lowStock = selling && left > 0 && left <= 10;
  const fillPct = cap ? Math.min(100, Math.round((taken / cap) * 100)) : 0;
  const closesAt = tk.deadlineAt?.toDate ? tk.deadlineAt.toDate() : null;
  const closesEarly = closesAt && start && closesAt.getTime() < start.getTime() - 60 * 1000;

  useEffect(() => { if (event.title) document.title = `${event.title} · Jogo`; }, [event.title]);

  const note = closesEarly && tk.status === 'open'
    ? `Sign-ups close ${shortDate(closesAt)}`
    : tk.status === 'confirming' && tk.confirmingEndsAt?.toDate
      ? `Teams lock ${shortDate(tk.confirmingEndsAt.toDate())} · refunds until then`
      : null;

  const pill = cancelled ? { txt: 'Cancelled · everyone refunded', dot: RED }
    : isPast ? { txt: 'This one already happened', dot: FAINT }
      : !selling ? { txt: `${taken} playing · teams locked`, dot: FAINT }
        : left === 0 ? { txt: 'Sold out · waitlist open', dot: RED }
          : lowStock ? { txt: `Only ${left} spots left`, dot: '#F87171' }
            : { txt: `${left} spots left`, dot: '#4ADE80' };

  const bar = cancelled ? { title: 'Cancelled', sub: 'Everyone was refunded', cta: 'Get Jogo' }
    : isPast ? { title: 'That’s a wrap', sub: 'Catch the next one on Jogo', cta: 'Get Jogo' }
      : selling && left > 0 ? { title: dollars(tk.priceCents), sub: 'per player · takes 30 seconds in the app', cta: 'Get in' }
        : selling ? { title: 'Sold out', sub: 'Join the waitlist in the app', cta: 'Waitlist' }
          : { title: 'Teams locked', sub: `${taken} playing`, cta: 'Get Jogo' };

  const dateLine = start
    ? `${start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${start.toLocaleTimeString('en-US', start.getMinutes() ? { hour: 'numeric', minute: '2-digit' } : { hour: 'numeric' })}`.toUpperCase()
    : 'DATE TBA';
  const place = placeOf(event.location);

  const facts = [
    { label: 'ENTRY', value: dollars(tk.priceCents) },
    { label: selling ? 'SPOTS LEFT' : 'PLAYING', value: cancelled ? '—' : `${selling ? left : taken}`, color: lowStock ? RED : INK },
    event.format
      ? { label: 'FORMAT', value: event.format.toUpperCase() }
      : { label: hasTeams ? 'TEAMS' : 'SPOTS', value: `${hasTeams ? teams.length : cap}` },
  ];
  const table = [
    { k: 'WHEN', v: start ? `${start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'To be announced' },
    event.location ? { k: 'WHERE', v: event.location, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` } : null,
    hasTeams ? { k: 'TEAMS', v: `${teams.length} teams of ${event.teamSize}` } : { k: 'SPOTS', v: `${cap} players` },
    { k: 'REFUNDS', v: 'Full refund until teams lock' },
    partner ? { k: 'PARTNER', v: partner } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen antialiased bg-white" style={{ fontFamily: BARLOW, color: INK }}>
      <style>{`
        @keyframes pe-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        .pe-bob { animation: pe-bob 1.8s ease-in-out infinite; }
        @keyframes pe-pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        .pe-pulse { animation: pe-pulse 1.4s ease-in-out infinite; }
      `}</style>

      {/* 1 · Cover — the first screen, less the bottom bar and a peek of the page */}
      <section ref={coverRef} className="relative overflow-hidden" style={{ height: 'max(560px, calc(100svh - 120px))', background: INK }}>
        <motion.div className="absolute inset-0" style={{ y: photoY }}>
          {photo ? (
            <motion.img
              src={photo} alt=""
              className="w-full h-full object-cover"
              initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: EASE }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: 'radial-gradient(85% 60% at 50% 0%, #3A3F47 0%, #0A0A0A 100%)' }} />
          )}
        </motion.div>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,.15) 50%, rgba(0,0,0,.88) 100%)',
        }} />

        <motion.header className="absolute top-0 inset-x-0 z-10 pt-5 px-5 flex justify-center" style={{ opacity: topOpacity }}>
          <a href="/" aria-label="Jogo"><Lockup partner={partner} color="#FFFFFF" size={15} /></a>
        </motion.header>

        <motion.div className="absolute inset-x-0 bottom-0 pb-[30px]" style={{ opacity: textOpacity, y: textY }}>
          <motion.div
            className="max-w-xl mx-auto px-[22px]"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          >
            {refName ? (
              <span className="inline-flex items-center gap-2 mb-3 rounded-full pl-1 pr-3 h-8" style={{ background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(10px)' }}>
                <span className="w-6 h-6 rounded-full bg-white text-[12px] font-extrabold flex items-center justify-center" style={{ color: INK }}>
                  {refName.trim().charAt(0).toUpperCase()}
                </span>
                <span className="text-white text-[13px] font-bold">{refName} invited you</span>
              </span>
            ) : null}
            <p className="text-white/75 font-extrabold text-[11.5px] tracking-[2.4px]">
              {partner ? `PRESENTED BY ${partner.toUpperCase()}` : 'AN OFFICIAL JOGO EVENT'}
            </p>
            <h1 className="text-white mt-1 break-words" style={{ ...ANTON, fontSize: 'clamp(56px, 17vw, 112px)' }}>
              {(event.title || 'Event').toUpperCase()}
            </h1>
            <p className="text-white font-extrabold text-[13px] tracking-[1.6px] truncate">
              {dateLine}{place ? `  ·  ${place.toUpperCase()}` : ''}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-[7px] h-8 px-3 rounded-full text-white text-[13.5px] font-bold" style={{ background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(10px)' }}>
                <span className={`w-[7px] h-[7px] rounded-full ${live && selling ? 'pe-pulse' : ''}`} style={{ background: pill.dot }} />
                {pill.txt}
              </span>
              <ChevronDown className="pe-bob" size={22} color="rgba(255,255,255,.8)" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* White page */}
      <main className="max-w-xl mx-auto px-[22px] pt-7 pb-44">
        {/* 2 · Facts */}
        <div className="flex">
          {facts.map((x, i) => (
            <div key={x.label} className={`flex-1 min-w-0 ${i > 0 ? 'pl-4 border-l' : ''}`} style={{ borderColor: LINE }}>
              <div className="truncate" style={{ ...ANTON, fontSize: 'clamp(28px, 9vw, 38px)', color: x.color || INK }}>{x.value}</div>
              <div className="font-extrabold text-[10.5px] tracking-[1.8px]" style={{ color: MUTED }}>{x.label}</div>
            </div>
          ))}
        </div>
        {!cancelled ? (
          <>
            <div className="mt-[22px] h-[3px] overflow-hidden" style={{ background: LINE }}>
              <motion.div className="h-full" style={{ background: INK }}
                initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ delay: 0.5, duration: 1, ease: EASE }} />
            </div>
            <div className="mt-2 flex justify-between gap-2.5 text-[12.5px] font-bold" style={{ color: MUTED }}>
              <span>{taken} of {cap} claimed</span>
              {note ? <span style={{ color: INK }}>{note}</span> : null}
            </div>
          </>
        ) : null}

        {/* 3 · About + details */}
        {event.description ? (
          <p className="mt-[30px] text-[17px] leading-[26px] font-medium whitespace-pre-line" style={{ color: '#262626' }}>{event.description}</p>
        ) : null}
        <div className="mt-[26px] border-t" style={{ borderColor: INK }}>
          {table.map((r) => {
            const inner = (
              <>
                <span className="w-[78px] flex-shrink-0 font-extrabold text-[10.5px] tracking-[1.8px]" style={{ color: MUTED }}>{r.k}</span>
                <span className="flex-1 min-w-0 font-bold text-[15px] line-clamp-2">{r.v}</span>
                {r.href ? <ArrowUpRight size={16} color={INK} /> : null}
              </>
            );
            const cls = 'flex items-center gap-3 py-3.5 border-b';
            return r.href ? (
              <a key={r.k} href={r.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:opacity-60 transition-opacity`} style={{ borderColor: LINE }}>{inner}</a>
            ) : (
              <div key={r.k} className={cls} style={{ borderColor: LINE }}>{inner}</div>
            );
          })}
        </div>

        {/* 4 · Teams */}
        {!cancelled ? (
          <section className="mt-10">
            <div className="flex items-baseline justify-between border-b pb-1.5" style={{ borderColor: INK }}>
              <h2 style={{ ...ANTON, fontSize: 30 }}>{hasTeams ? 'THE TEAMS' : 'WHO’S IN'}</h2>
              {hasTeams && selling && live ? <span className="text-[13px] font-bold" style={{ color: MUTED }}>Pick one to join</span> : null}
            </div>
            {hasTeams ? teams.map((t, idx) => {
              const players = t.players || [];
              const size = event.teamSize || 0;
              const held = (tk.teamHeld || {})[t.id] || 0;
              const open = Math.max(0, size - players.length - held);
              const canJoin = live && selling && open > 0;
              const color = t.color || TEAM_PALETTE[idx % TEAM_PALETTE.length];
              const paidPct = size ? Math.min(1, players.length / size) : 0;
              const heldPct = size ? Math.min(1 - paidPct, held / size) : 0;
              return (
                <a key={t.id || idx} href={APP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3.5 py-3.5 border-b" style={{ borderColor: LINE }}>
                  <span className="w-6 flex-shrink-0" style={{ ...ANTON, fontSize: 18, color: '#C4C4C4' }}>{two(idx + 1)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="truncate font-extrabold text-[14.5px] tracking-[0.8px]">{(t.name || '').toUpperCase()}</span>
                      <span className="flex flex-shrink-0">
                        {players.slice(0, 3).map((p, i) => (
                          <span key={p.userId || i} style={i ? { marginLeft: -7 } : null}><Face player={p} /></span>
                        ))}
                      </span>
                      <span className="ml-auto min-w-[30px] text-right font-bold text-[13px]">{players.length}/{size}</span>
                    </div>
                    <div className="mt-2.5 flex h-[2px] overflow-hidden" style={{ background: LINE }}>
                      <motion.div className="h-full" style={{ background: color }}
                        initial={{ width: 0 }} whileInView={{ width: `${paidPct * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} />
                      {heldPct > 0 ? <div className="h-full" style={{ background: color, opacity: 0.3, width: `${heldPct * 100}%` }} /> : null}
                    </div>
                  </div>
                  {canJoin ? (
                    <span className="flex-shrink-0 h-[30px] px-[13px] rounded-full border-[1.5px] flex items-center font-extrabold text-[11.5px] tracking-[1.2px]" style={{ borderColor: INK }}>JOIN</span>
                  ) : (
                    <span className="flex-shrink-0 h-[30px] px-[13px] flex items-center font-extrabold text-[11.5px] tracking-[1.2px]" style={{ color: FAINT }}>FULL</span>
                  )}
                </a>
              );
            }) : (
              <div className="flex flex-wrap gap-1.5 items-center pt-3.5">
                {roster.length ? roster.slice(0, 24).map((p, i) => <Face key={p.userId || i} player={p} size={38} />) : (
                  <p className="text-[15px] font-bold" style={{ color: MUTED }}>Nobody yet — be the first one in.</p>
                )}
                {taken > 24 ? <span className="ml-1 text-[13px] font-bold" style={{ color: MUTED }}>+{taken - 24}</span> : null}
              </div>
            )}
          </section>
        ) : null}

        {/* The sign-up nudge: the spot itself lives in the app */}
        <section className="mt-12 rounded-3xl px-5 py-6" style={{ background: '#F5F5F5' }}>
          <h2 style={{ ...ANTON, fontSize: 26 }}>YOUR SPOT LIVES IN JOGO</h2>
          <p className="mt-1 text-[15px] leading-[22px] font-medium" style={{ color: '#404040' }}>
            Pay in seconds, pick your team, chat with your teammates and check in at the field — all in the free Jogo app.
          </p>
          <StoreButtons label="" className="mt-4" />
        </section>

        {/* 5 · Sign-off */}
        <div className="mt-14 flex flex-col items-center gap-1">
          <Lockup partner={partner} color={INK} size={22} />
          <span className="font-bold text-[10.5px] tracking-[2.4px]" style={{ color: FAINT }}>{partner ? 'IN PARTNERSHIP' : 'OFFICIAL EVENT'}</span>
        </div>
      </main>

      {/* One bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20" style={{ background: INK }}>
        <div className="max-w-xl mx-auto flex items-center gap-3 px-[22px] pt-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
          <div className="flex-1 min-w-0">
            <div className="text-white truncate" style={{ ...ANTON, fontSize: 22, lineHeight: '28px', letterSpacing: 0.4 }}>{bar.title.toUpperCase()}</div>
            <div className="truncate text-[12.5px] font-semibold" style={{ color: FAINT }}>{bar.sub}</div>
          </div>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 h-[52px] min-w-[128px] px-[26px] rounded-full bg-white flex items-center justify-center font-extrabold text-[15px] tracking-[1.4px] hover:bg-white/90 active:scale-[0.97] transition"
            style={{ color: INK }}>
            {bar.cta.toUpperCase()}
          </a>
        </div>
      </div>
    </div>
  );
}

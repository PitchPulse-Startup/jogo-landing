// src/PaidEvent.jsx — the shared-link page for EVERY event (jogous.io/event/:id).
// Paid = events/{id} with `ticketing` (the app's "Collect payment in the
// app" switch); free = no ticketing. Same split as the app, where both
// render components/events/PaidEventLayout.js.
//
// Both tiers get the same premium page, built like a luxury invitation:
// the cinematic cover, then a BLACK page with restraint — hairlines, small
// spaced capitals, one muted champagne accent, quiet fade-ins.
//   • paid — no join on the web: payment, team pick and refunds live in
//     the app, so the page explains how to get in and every button goes
//     to the app.
//   • free — the app comes first too ("GET THE APP" everywhere), but a
//     small, faint "sign up online instead" under the bottom bar lets
//     people join right here in the browser. src/Event.jsx owns that flow
//     and passes it in as `join`. The location stays locked until you've
//     joined.
//
// The page, top to bottom:
//   1. Cover — the whole first screen is the photo (or a black stadium
//      night under a floodlight), the PARTNER × JOGO lockup up top, and at
//      the bottom whoever invited you, the eyebrow, a huge Anton title,
//      date · place and a live spots pill. The photo drifts slower than the
//      scroll and the cover text fades as you leave it.
//   2. Numbers — ENTRY · SPOTS LEFT · FORMAT over one thin bar.
//   3. About, then an editorial WHEN / WHERE / TEAMS / … table.
//   4. Admission — how to get in, through the app.
//   5. The teams (or who's in), a sign-off lockup, and one black bottom
//      bar. Live via the parent's onSnapshot.

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Lock, Check, Loader2 } from 'lucide-react';
import jogoLogoInk from './assets/jogo-logo-2026.png';
import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import { APP_URL, APP_STORE_URL, PLAY_STORE_URL, AppleLogo, PlayLogo } from './appLinks';

const INK = '#0A0A0A';
const FAINT = '#A3A3A3';
const RED = '#DC2626';
// One muted champagne accent on black — used sparingly.
const CHAMP = '#CBB283';
const PAGE_DARK = '#0A0A0A';
const HAIR = 'rgba(255,255,255,0.1)';
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

// The refund rule with the real date — same as the app's refundPolicy:
// full refund until the lock date (capped at kickoff); then final.
function refundText(tk) {
  const ms = (ts) => (ts?.toMillis ? ts.toMillis() : 0);
  if (!tk) return null;
  if (tk.status === 'cancelled') return { short: 'Cancelled — everyone refunded', line: null };
  const start = ms(tk.startsAt) || Infinity;
  const lockMs = Math.min(ms(tk.deadlineAt) || start, start);
  const locked = tk.status === 'locked' || Date.now() >= lockMs;
  if (locked) return { short: 'No refunds — the roster is final', line: null };
  const when = Number.isFinite(lockMs)
    ? new Date(lockMs).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'kickoff';
  return {
    short: `Full refund until ${when}`,
    line: `Drop out before ${when} for a full refund. That day the roster locks${tk.minPlayers ? ` — and if fewer than ${tk.minPlayers} players have joined, it's cancelled and everyone is refunded` : ''}.`,
  };
}

const dollars = (cents) => `$${(cents / 100) % 1 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;
const shortDate = (d) => d?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '';
const placeOf = (location) => (location ? String(location).split(',')[0].trim() : null);
const two = (n) => String(n).padStart(2, '0');

function Face({ player, size = 22 }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, background: '#2A2A2A', boxShadow: `0 0 0 2px ${PAGE_DARK}` }}
    >
      {player.photoURL
        ? <img src={player.photoURL} alt="" className="absolute inset-0 w-full h-full object-cover" />
        : <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: size * 0.42 }}>{(player.displayName || '?')[0].toUpperCase()}</span>}
    </span>
  );
}

function Lockup({ partner, color, size }) {
  const word = { ...ANTON, fontSize: size, lineHeight: 1.3, letterSpacing: 1.2 };
  return (
    <span className="inline-flex items-center gap-[7px] max-w-full" style={{ color }}>
      {partner ? (
        <>
          <span className="truncate" style={word}>{partner.toUpperCase()}</span>
          <span style={{ fontSize: size * 0.9, fontWeight: 500, opacity: 0.7 }}>×</span>
        </>
      ) : null}
      <img src={color === '#FFFFFF' ? jogoLogoWhite : jogoLogoInk} alt="Jogo" className="flex-shrink-0" style={{ height: Math.round(size * 0.95), width: 'auto' }} />
    </span>
  );
}

// Free events: what you only get in the app — built from what THIS event
// actually uses, so the page never promises a feature it doesn't have.
function freePerks(event, hasTeams, tournament) {
  return [
    tournament && 'Live scores & the bracket',
    hasTeams ? 'Your team’s private chat' : 'The group chat',
    'Kickoff reminders',
    event.qrCheckInEnabled && 'QR check-in at the field',
    event.musicMode && 'Pick the music',
    tournament && 'The Champion badge',
    'Pickup games near you',
  ].filter(Boolean).slice(0, 4);
}

const Reveal = ({ children, className = '', delay = 0 }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.8, ease: EASE, delay }}>
    {children}
  </motion.div>
);
const Label = ({ children }) => (
  <p className="font-bold text-[10.5px] tracking-[3px]" style={{ color: CHAMP }}>{children}</p>
);

function AppButton({ className = '' }) {
  return (
    <div className={className}>
      <a href={APP_URL} target="_blank" rel="noopener noreferrer"
        className="h-[58px] rounded-full flex items-center justify-center gap-2 font-bold text-[15.5px] tracking-[1.6px] hover:opacity-90 active:scale-[0.99] transition"
        style={{ background: CHAMP, color: PAGE_DARK }}>
        GET THE JOGO APP <ArrowUpRight size={18} strokeWidth={2.4} />
      </a>
      <div className="mt-4 flex items-center justify-center gap-6 text-[12.5px] font-semibold text-white/45">
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors"><AppleLogo size={13} /> App Store</a>
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors"><PlayLogo size={11} /> Google Play</a>
      </div>
    </div>
  );
}

function PremiumBody({
  free, refund, joined, myTeamName, perks,
  event, entry, left, taken, cap, fillPct, selling, live, cancelled, hasTeams, teams, tk, start, roster,
  table, partner, note,
}) {
  const full = selling && left === 0;
  const days = start ? Math.max(0, Math.floor((start.getTime() - Date.now()) / 86400000)) : null;
  const kickoff = !live || !start ? null : days >= 2 ? `Kickoff in ${days} days` : days === 1 ? 'Kickoff tomorrow' : 'Kickoff today';
  const numbers = [
    { k: 'ENTRY', v: entry },
    free && selling && left == null
      ? { k: 'GOING', v: `${taken}` }
      : { k: selling ? 'SPOTS LEFT' : 'PLAYING', v: cancelled ? '—' : `${selling ? left : taken}` },
    { k: 'FORMAT', v: event.format ? event.format.toUpperCase() : hasTeams ? `${event.teamSize}V${event.teamSize}` : 'PICKUP' },
  ];
  const steps = free ? [
    ['I', 'Download Jogo', 'Free on iPhone and Android.'],
    ['II', 'Create your account', 'Thirty seconds.'],
    full
      ? ['III', 'Catch the next one', 'This one’s full — new games go up every week.']
      : ['III', hasTeams ? 'Join a team — it’s free' : 'Join — it’s free', 'Find it in the app and save your spot.'],
  ] : [
    ['I', 'Download Jogo', 'Free on iPhone and Android.'],
    ['II', 'Create your account', 'Thirty seconds.'],
    ['III', full ? 'Join the waitlist' : `Reserve your spot — ${entry}`, full ? 'You’ll hear the moment a place opens.' : hasTeams ? 'Choose your team at checkout.' : 'Confirmed the moment you pay.'],
  ];
  const lead = free
    ? 'Get the Jogo app first — your spot, the group chat and kickoff reminders all live there.'
    : 'Tickets are reserved in the Jogo app — payment, your team and refunds all live there.';
  return (
    <main className="max-w-xl mx-auto px-[22px] pt-12 pb-48 text-white">
      {/* The numbers */}
      <Reveal>
        <div className="grid grid-cols-3 border-y" style={{ borderColor: HAIR }}>
          {numbers.map((x, i) => (
            <div key={x.k} className={`py-6 min-w-0 ${i > 0 ? 'pl-4 border-l' : ''}`} style={{ borderColor: HAIR }}>
              <p className="font-bold text-[10px] tracking-[2.6px] text-white/45">{x.k}</p>
              <p className="mt-1 truncate" style={{ ...ANTON, fontSize: 'clamp(30px, 9.5vw, 42px)' }}>{x.v}</p>
            </div>
          ))}
        </div>
        {!cancelled && cap ? (
          <>
            <div className="mt-5 h-px relative" style={{ background: HAIR }}>
              <motion.div className="absolute left-0 top-0 h-px" style={{ background: CHAMP }}
                initial={{ width: 0 }} whileInView={{ width: `${fillPct}%` }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.2 }} />
            </div>
            <div className="mt-3 flex justify-between gap-3 text-[12.5px] font-semibold text-white/50">
              <span>{taken} of {cap} {free ? 'in' : 'claimed'}</span>
              {note ? <span>{note}</span> : kickoff ? <span>{kickoff}</span> : null}
            </div>
          </>
        ) : null}
      </Reveal>

      {/* Free, just joined: the app comes first */}
      {free && joined ? (
        <Reveal className="mt-16">
          <Label>YOUR SPOT IS SAVED</Label>
          <h2 className="mt-3" style={{ ...ANTON, fontSize: 'clamp(36px, 11vw, 52px)' }}>YOU’RE IN</h2>
          <p className="mt-2 text-[15px] leading-[23px] font-medium text-white/55 max-w-[34ch]">
            Now get the app and log in with the same email — this event is already waiting for you.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3">
            {perks.map((p) => (
              <p key={p} className="flex items-start gap-2 text-[13.5px] font-medium text-white/70 leading-[19px]">
                <Check size={14} color={CHAMP} strokeWidth={2.4} className="mt-[2px] flex-shrink-0" />{p}
              </p>
            ))}
          </div>
          <AppButton className="mt-8" />
        </Reveal>
      ) : null}

      {/* About */}
      {event.description ? (
        <Reveal className="mt-16">
          <Label>THE EVENT</Label>
          <p className="mt-4 text-[17px] leading-[29px] font-medium whitespace-pre-line text-white/80">{event.description}</p>
        </Reveal>
      ) : null}

      {/* Details */}
      <Reveal className="mt-16">
        <Label>THE DETAILS</Label>
        <div className="mt-4 border-t" style={{ borderColor: HAIR }}>
          {table.map((r) => {
            const inner = (
              <>
                <span className="w-[86px] flex-shrink-0 font-bold text-[10px] tracking-[2.4px] text-white/40">{r.k}</span>
                <span className={`flex-1 min-w-0 font-semibold text-[15.5px] line-clamp-2 ${r.locked ? 'text-white/35' : 'text-white/90'}`}>{r.v}</span>
                {r.href ? <ArrowUpRight size={15} color={CHAMP} /> : r.locked ? <Lock size={14} color="rgba(255,255,255,0.35)" /> : null}
              </>
            );
            const cls = 'flex items-center gap-3 py-4 border-b';
            const st = { borderColor: HAIR };
            return r.href ? (
              <a key={r.k} href={r.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:opacity-70 transition-opacity`} style={st}>{inner}</a>
            ) : (
              <div key={r.k} className={cls} style={st}>{inner}</div>
            );
          })}
        </div>
      </Reveal>

      {/* Admission — the app comes first */}
      {live && !(free && joined) ? (
        <Reveal className="mt-20">
          <Label>ADMISSION</Label>
          <h2 className="mt-3" style={{ ...ANTON, fontSize: 'clamp(36px, 11vw, 52px)' }}>{full ? (free ? 'IT’S FULL' : 'THE WAITLIST') : 'HOW TO GET IN'}</h2>
          <p className="mt-2 text-[15px] leading-[23px] font-medium text-white/55 max-w-[34ch]">{lead}</p>
          <ol className="mt-8 border-t" style={{ borderColor: HAIR }}>
            {steps.map(([n, t, d]) => (
              <li key={n} className="flex items-baseline gap-5 py-5 border-b" style={{ borderColor: HAIR }}>
                <span className="w-8 flex-shrink-0 font-semibold text-[13px] tracking-[2px]" style={{ color: CHAMP }}>{n}</span>
                <div className="min-w-0">
                  <p className="text-[17px] font-bold">{t}</p>
                  <p className="text-[14px] font-medium text-white/45 mt-0.5">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-3">
            {perks.map((p) => (
              <p key={p} className="flex items-start gap-2 text-[13.5px] font-medium text-white/70 leading-[19px]">
                <Check size={14} color={CHAMP} strokeWidth={2.4} className="mt-[2px] flex-shrink-0" />{p}
              </p>
            ))}
          </div>
          {refund?.line ? (
            <p className="mt-6 text-[13px] leading-[20px] font-medium text-white/45">{refund.line}</p>
          ) : null}
          <AppButton className="mt-10" />
        </Reveal>
      ) : !live ? (
        <Reveal className="mt-20 text-center">
          <p className="text-[15px] font-medium text-white/55">
            {cancelled ? (free ? 'This event was cancelled.' : 'This event was cancelled — everyone was refunded.') : 'That’s a wrap. The next one is on Jogo.'}
          </p>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-[52px] px-8 rounded-full items-center font-bold text-[14px] tracking-[1.6px]" style={{ background: CHAMP, color: PAGE_DARK }}>GET THE JOGO APP</a>
        </Reveal>
      ) : null}

      {/* The teams */}
      {!cancelled && hasTeams ? (
        <Reveal className="mt-20">
          <div className="flex items-baseline justify-between">
            <Label>THE TEAMS</Label>
            {selling && live && !joined ? <span className="text-[12px] font-semibold text-white/40">Choose yours in the app</span> : null}
          </div>
          <div className="mt-4 border-t" style={{ borderColor: HAIR }}>
            {teams.map((t, idx) => {
              const players = t.players || [];
              const size = event.teamSize || 0;
              const held = free ? 0 : ((tk.teamHeld || {})[t.id] || 0);
              const open = Math.max(0, size - players.length - held);
              const color = t.color || TEAM_PALETTE[idx % TEAM_PALETTE.length];
              const pct = size ? Math.min(1, players.length / size) : 0;
              const mine = !!myTeamName && t.name === myTeamName;
              return (
                <div key={t.id || idx} className="py-4 border-b" style={{ borderColor: HAIR }}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 flex-shrink-0 font-semibold text-[12px] tracking-[1.5px] text-white/30">{two(idx + 1)}</span>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="truncate font-bold text-[14px] tracking-[1.4px]">{(t.name || '').toUpperCase()}</span>
                    <span className="flex flex-shrink-0 ml-1">
                      {players.slice(0, 3).map((p, i) => <span key={p.userId || i} style={i ? { marginLeft: -6 } : null}><Face player={p} size={20} /></span>)}
                    </span>
                    <span className="ml-auto flex-shrink-0 font-semibold text-[12px] tracking-[1.2px]" style={{ color: mine || open ? CHAMP : 'rgba(255,255,255,0.3)' }}>
                      {mine ? 'YOU' : open ? `${open} OPEN` : 'FULL'}
                    </span>
                  </div>
                  <div className="mt-3 ml-9 h-px relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div className="absolute left-0 top-0 h-px" style={{ background: color }}
                      initial={{ width: 0 }} whileInView={{ width: `${pct * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      ) : null}

      {/* Who's in (free, no teams) */}
      {free && !cancelled && !hasTeams ? (
        <Reveal className="mt-20">
          <Label>WHO’S IN</Label>
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-1.5 items-center" style={{ borderColor: HAIR }}>
            {roster.length ? roster.slice(0, 24).map((p, i) => <Face key={p.userId || i} player={p} size={36} />) : (
              <p className="text-[15px] font-medium text-white/50">Nobody yet — be the first one in.</p>
            )}
            {taken > 24 ? <span className="ml-1 text-[13px] font-semibold text-white/45">+{taken - 24}</span> : null}
          </div>
        </Reveal>
      ) : null}

      {/* Sign-off */}
      <div className="mt-24 flex flex-col items-center gap-2">
        <Lockup partner={partner} color="#FFFFFF" size={20} />
        <span className="font-semibold text-[10px] tracking-[3px] text-white/30">
          {partner ? 'IN PARTNERSHIP' : free ? 'SEE YOU THERE' : 'AN OFFICIAL JOGO EVENT'}
        </span>
      </div>
    </main>
  );
}

// Google Calendar link for someone who's joined (free events).
function calendarUrl(event, start, location) {
  if (!start) return null;
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(start.getTime() + 2 * 3600 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Jogo event',
    dates: `${fmt(start)}/${fmt(end)}`,
    location: location || '',
    details: `On Jogo: ${typeof window !== 'undefined' ? window.location.href.split('?')[0] : ''}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function PaidEvent({ event, refName, join = null, hasTournament = false }) {
  useDropFonts();
  const coverRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: coverRef, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const topOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const free = !event.ticketing;
  const tk = event.ticketing || {};
  const photo = event.imageUrl || null;
  const partner = (event.partnerName || '').trim();
  const start = parseStart(event);
  const teams = Array.isArray(event.teams) ? event.teams : [];
  const hasTeams = !!event.enableTeams && teams.length > 0;
  const roster = hasTeams ? teams.flatMap((t) => t.players || []) : (Array.isArray(event.participants) ? event.participants : []);
  const taken = roster.length;
  // Free: capacity from the event (none = open); open until kickoff.
  const cap = free
    ? (event.maxParticipants || (hasTeams && event.teamSize ? teams.length * event.teamSize : 0))
    : (tk.capacity || 0);
  const left = cap ? Math.max(0, cap - taken - (free ? 0 : (tk.heldCount || 0))) : null;
  const cancelled = free ? event.status === 'cancelled' : tk.status === 'cancelled';
  const isPast = !!start && start.getTime() < Date.now() - 12 * 3600 * 1000;
  const selling = free ? (!cancelled && (!start || Date.now() < start.getTime())) : (tk.status === 'open' || tk.status === 'confirming');
  // Free-event join state (from Event.jsx)
  const joined = !!join?.result;
  const details = join?.result?.details || null;
  const myTeamName = join?.result?.teamName || null;
  const unlockedPlace = details?.location || null;
  const mapsHref = unlockedPlace ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unlockedPlace)}` : null;
  const needsTicket = free && !!join?.needsTicket;
  const live = !cancelled && !isPast;
  const lowStock = selling && left != null && left > 0 && left <= 10;
  const fillPct = cap ? Math.min(100, Math.round((taken / cap) * 100)) : 0;
  const closesAt = tk.deadlineAt?.toDate ? tk.deadlineAt.toDate() : null;
  const closesEarly = closesAt && start && closesAt.getTime() < start.getTime() - 60 * 1000;
  // Free: joining in the browser is the quiet second option.
  const canJoinOnline = free && !joined && live && selling && left !== 0 && !needsTicket && !!join?.onJoin;

  useEffect(() => { if (event.title) document.title = `${event.title} · Jogo`; }, [event.title]);

  const note = closesEarly && tk.status === 'open'
    ? `Sign-ups close ${shortDate(closesAt)}`
    : tk.status === 'confirming' && tk.confirmingEndsAt?.toDate
      ? `Teams lock ${shortDate(tk.confirmingEndsAt.toDate())} · refunds until then`
      : null;

  const pill = free ? (
    joined ? { txt: "You're in", dot: '#4ADE80' }
      : cancelled ? { txt: 'Cancelled', dot: RED }
        : isPast ? { txt: 'This one already happened', dot: FAINT }
          : !selling ? { txt: `${taken} playing`, dot: FAINT }
            : left == null ? { txt: `Free · ${taken} going`, dot: '#4ADE80' }
              : left === 0 ? { txt: 'Full', dot: RED }
                : lowStock ? { txt: `Only ${left} spots left`, dot: '#F87171' }
                  : { txt: `${left} spots left`, dot: '#4ADE80' }
  ) : cancelled ? { txt: 'Cancelled · everyone refunded', dot: RED }
    : isPast ? { txt: 'This one already happened', dot: FAINT }
      : !selling ? { txt: `${taken} playing · teams locked`, dot: FAINT }
        : left === 0 ? { txt: 'Sold out · waitlist open', dot: RED }
          : lowStock ? { txt: `Only ${left} spots left`, dot: '#F87171' }
            : { txt: `${left} spots left`, dot: '#4ADE80' };

  const bar = free ? (
    joined ? { title: "You're in", sub: `${myTeamName ? (/^team\b/i.test(myTeamName) ? myTeamName : `Team ${myTeamName}`) : ''}${myTeamName ? ' · ' : ''}Spot saved`, cta: 'Get the app', check: true }
      : cancelled ? { title: 'Cancelled', sub: 'Find another one on Jogo', cta: 'Get Jogo' }
        : isPast ? { title: 'That’s a wrap', sub: 'Catch the next one on Jogo', cta: 'Get Jogo' }
          : needsTicket ? { title: 'Ticketed', sub: 'Get your ticket in the app', cta: 'Tickets' }
            : !selling ? { title: 'Started', sub: `${taken} playing`, cta: 'Get Jogo' }
              : left === 0 ? { title: 'Full', sub: 'Every spot is taken', cta: 'Get Jogo' }
                : { title: 'Free', sub: left == null ? `${taken} going` : `${left} ${left === 1 ? 'spot' : 'spots'} left`, cta: 'Get the app' }
  ) : cancelled ? { title: 'Cancelled', sub: 'Everyone was refunded', cta: 'Get Jogo' }
    : isPast ? { title: 'That’s a wrap', sub: 'Catch the next one on Jogo', cta: 'Get Jogo' }
      : selling && left > 0 ? { title: dollars(tk.priceCents), sub: 'per player · in the app', cta: 'Get the app' }
        : selling ? { title: 'Sold out', sub: 'Waitlist in the Jogo app', cta: 'Get the app' }
          : { title: 'Teams locked', sub: `${taken} playing`, cta: 'Get Jogo' };

  const dateLine = start
    ? `${start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${start.toLocaleTimeString('en-US', start.getMinutes() ? { hour: 'numeric', minute: '2-digit' } : { hour: 'numeric' })}`.toUpperCase()
    : 'DATE TBA';
  // Free events keep the place locked until you've joined.
  const place = free ? placeOf(unlockedPlace) : placeOf(event.location);

  const whenText = start ? `${start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'To be announced';
  const table = free ? [
    { k: 'WHEN', v: whenText },
    unlockedPlace
      ? { k: 'WHERE', v: unlockedPlace, href: mapsHref }
      : event.location || !joined ? { k: 'WHERE', v: 'Unlocks when you join', locked: true } : null,
    joined && start ? { k: 'CALENDAR', v: 'Add it to your calendar', href: calendarUrl(event, start, unlockedPlace) } : null,
    hasTeams ? { k: 'TEAMS', v: `${teams.length} teams of ${event.teamSize}` } : { k: 'SPOTS', v: cap ? `${cap} players` : 'Open — no limit' },
    event.squadName ? { k: 'CREW', v: `${event.squadName}${event.visibility === 'crew' ? ' · crew only' : ''}` } : null,
    partner ? { k: 'PARTNER', v: `${partner} × Jogo` } : null,
  ].filter(Boolean) : [
    { k: 'WHEN', v: whenText },
    event.location ? { k: 'WHERE', v: event.location, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` } : null,
    hasTeams ? { k: 'TEAMS', v: `${teams.length} teams of ${event.teamSize}` } : { k: 'SPOTS', v: `${cap} players` },
    { k: 'REFUNDS', v: refundText(tk)?.short || 'Full refund until the roster locks' },
    partner ? { k: 'PARTNER', v: `${partner} × Jogo` } : null,
  ].filter(Boolean);

  const refund = free ? null : refundText(tk);
  const perks = free
    ? freePerks(event, hasTeams, hasTournament || !!join?.hasTournament)
    : [
      refund?.short || 'Full refund until the roster locks',
      hasTeams ? 'Private team chat' : 'The group chat',
      'QR check-in at the field',
      hasTournament ? 'Live scores & the bracket' : 'Kickoff reminders',
    ];
  const eyebrow = partner
    ? `${partner.toUpperCase()} × JOGO`
    : free
      ? (event.squadName ? `${event.squadName.toUpperCase()} PRESENTS` : 'PICKUP ON JOGO')
      : 'AN OFFICIAL JOGO EVENT';

  return (
    <div className="min-h-screen antialiased" style={{ fontFamily: BARLOW, color: '#FFFFFF', background: PAGE_DARK }}>
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
          background: 'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,0) 22%, rgba(10,10,10,.5) 48%, rgba(10,10,10,.9) 70%, rgba(10,10,10,1) 100%)',
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
            <p className="flex max-w-full items-center gap-3 font-bold text-[11px] tracking-[3.2px]" style={{ color: CHAMP, textShadow: '0 1px 12px rgba(0,0,0,.8)' }}>
              <span className="w-6 h-px flex-shrink-0" style={{ background: CHAMP }} />
              <span className="truncate">{eyebrow}</span>
            </p>
            <h1 className="text-white mt-1 break-words" style={{ ...ANTON, fontSize: 'clamp(48px, 14vw, 96px)', letterSpacing: '0.01em', textShadow: '0 4px 24px rgba(0,0,0,.55)' }}>
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

      <PremiumBody
        free={free} joined={joined} myTeamName={myTeamName} perks={perks} roster={roster}
        event={event} entry={free ? (needsTicket ? 'TICKET' : 'FREE') : dollars(tk.priceCents || 0)}
        left={left} taken={taken} cap={cap} fillPct={fillPct}
        selling={selling} live={live} cancelled={cancelled} hasTeams={hasTeams} teams={teams} tk={tk} start={start}
        table={table} partner={partner} refund={refund} note={note}
      />

      {/* One bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20" style={{ background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: '1px solid rgba(203,178,131,0.25)' }}>
        {free && join?.joinError ? <p className="text-center text-[13px] font-bold text-red-400 pt-2 px-4">{join.joinError}</p> : null}
        <div className={`max-w-xl mx-auto px-[22px] pt-3.5 ${canJoinOnline || join?.joining ? 'pb-2' : 'pb-[max(14px,env(safe-area-inset-bottom))]'}`}>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {bar.check ? <Check size={18} strokeWidth={3} color="#4ADE80" /> : null}
                <div className="truncate" style={{ ...ANTON, fontSize: 22, lineHeight: '28px', letterSpacing: 0.4, color: '#FFFFFF' }}>{bar.title.toUpperCase()}</div>
              </div>
              <div className="truncate text-[12.5px] font-semibold" style={{ color: FAINT }}>{bar.sub}</div>
            </div>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 h-[52px] min-w-[128px] px-[26px] rounded-full flex items-center justify-center font-extrabold text-[15px] tracking-[1.4px] hover:opacity-90 active:scale-[0.97] transition"
              style={{ background: CHAMP, color: PAGE_DARK }}>
              {bar.cta.toUpperCase()}
            </a>
          </div>
        </div>
        {canJoinOnline || join?.joining ? (
          <div className="text-center pb-[max(10px,env(safe-area-inset-bottom))]">
            <button type="button" onClick={join.onJoin} disabled={join.joining}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-white/35 hover:text-white/60 underline underline-offset-2 decoration-white/20 transition-colors">
              {join.joining ? <><Loader2 size={11} className="animate-spin" /> Saving your spot…</> : 'or sign up online instead'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

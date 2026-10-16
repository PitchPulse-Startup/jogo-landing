// src/PaidEvent.jsx — the shared-link page for EVERY event (jogous.io/event/:id).
// Paid = events/{id} with `ticketing` (the app's "Collect payment in the
// app" switch); free = no ticketing. Same split as the app, where both
// render components/events/PaidEventLayout.js:
//   • paid — the premium tier, built like a luxury invitation: the
//     cinematic cover, then a BLACK page with restraint — hairlines, small
//     spaced capitals, one muted champagne accent, quiet fade-ins. No join
//     on the web: payment, team pick and refunds live in the app, so the
//     page explains how to get in and every button goes to the app.
//   • free — deliberately plainer: a shorter cover (green pitch with no
//     photo), "<CREW> PRESENTS", FREE, no JOGO lockup, a white bottom bar
//     with an ink JOIN. Joining happens right here in the browser —
//     src/Event.jsx owns that flow and passes it in as `join`. The
//     location stays locked until you've joined.
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
import {
  ArrowUpRight, ChevronDown, Lock, Check, Loader2, Trophy, Users, MessageCircle, Bell, QrCode, Music, Award, MapPin,
} from 'lucide-react';
import { APP_URL, APP_STORE_URL, PLAY_STORE_URL, AppleLogo, PlayLogo, StoreButtons } from './appLinks';

const INK = '#0A0A0A';
const MUTED = '#6B7280';
const FAINT = '#A3A3A3';
const LINE = '#EBEBEB';
const RED = '#DC2626';
// Paid events: one muted champagne accent on black — used sparingly.
const CHAMP = '#CBB283';
const PAGE_DARK = '#0A0A0A';
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

// Free events: what you only get in the app — built from what THIS event
// actually uses, so the page never promises a feature it doesn't have.
function AppPerks({ event, hasTeams, joined, tournament }) {
  const perks = [
    tournament && { Icon: Trophy, color: '#FACC15', t: 'Live scores & the bracket', d: 'Follow every game as it’s played, right to the final.' },
    hasTeams
      ? { Icon: Users, color: '#60A5FA', t: 'Your team’s chat', d: 'Plan with your teammates — or switch teams to play with friends.' }
      : { Icon: MessageCircle, color: '#60A5FA', t: 'The group chat', d: 'Talk with everyone who’s going.' },
    { Icon: Bell, color: '#F87171', t: 'Kickoff reminders', d: 'Plus a heads-up the moment anything changes.' },
    event.qrCheckInEnabled && { Icon: QrCode, color: '#4ADE80', t: 'Check in at the field', d: 'Scan the code when you arrive — no list, no line.' },
    event.musicMode && { Icon: Music, color: '#C084FC', t: 'Pick the music', d: 'Request the songs for the day.' },
    tournament && { Icon: Award, color: '#FBBF24', t: 'Win the Champion badge', d: 'Winners get it on their profile for good.' },
    { Icon: MapPin, color: '#4ADE80', t: 'Your next game', d: 'Pickup games near you, every week.' },
  ].filter(Boolean).slice(0, 4);
  return (
    <section className="mt-10 rounded-[28px] overflow-hidden relative text-white" style={{ background: INK }}>
      <div className="absolute pointer-events-none" style={{ top: -80, right: -110, width: 230, height: 420, transform: 'rotate(24deg)', background: '#0E7A43' }} />
      <div className="relative px-5 pt-6 pb-5">
        <p className="font-extrabold text-[11px] tracking-[2.2px]" style={{ color: '#8B93A1' }}>{joined ? 'YOUR SPOT IS SAVED' : 'FREE ON IPHONE & ANDROID'}</p>
        <h2 className="mt-1 pr-16" style={{ ...ANTON, fontSize: 'clamp(30px, 8.5vw, 38px)' }}>{joined ? 'YOU’RE IN. NOW GET THE APP.' : 'IT’S BETTER IN THE APP'}</h2>
        <p className="mt-1 text-[14.5px] leading-[21px] font-semibold text-white/75 pr-10">
          {joined ? 'Log in with the same email — this event is already waiting for you.' : 'Joining here saves your spot. Everything else happens in Jogo.'}
        </p>
        <div className="mt-5 flex flex-col gap-3.5">
          {perks.map(({ Icon, color, t, d }) => (
            <div key={t} className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <Icon size={19} color={color} strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <p className="text-[15.5px] font-extrabold">{t}</p>
                <p className="text-[13.5px] font-semibold text-white/65 leading-[19px]">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <a href={APP_URL} target="_blank" rel="noopener noreferrer"
          className="mt-6 h-[56px] rounded-full bg-white flex items-center justify-center font-extrabold text-[16px] tracking-[0.6px] hover:opacity-90 active:scale-[0.98] transition"
          style={{ color: INK }}>
          GET THE APP — IT’S FREE
        </a>
        <div className="mt-3 flex items-center justify-center gap-5 text-[12.5px] font-bold text-white/60">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white"><AppleLogo size={14} /> App Store</a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white"><PlayLogo size={12} /> Google Play</a>
        </div>
      </div>
    </section>
  );
}

// ── Paid: the premium body (below the cover) ─────────────────────────
const Reveal = ({ children, className = '', delay = 0 }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.8, ease: EASE, delay }}>
    {children}
  </motion.div>
);
const Label = ({ children }) => (
  <p className="font-bold text-[10.5px] tracking-[3px]" style={{ color: CHAMP }}>{children}</p>
);

function PremiumBody({
  refund,
  event, price, left, taken, cap, fillPct, selling, live, cancelled, hasTeams, teams, tk, start,
  table, partner, tournament,
}) {
  const soldOut = selling && left === 0;
  const days = start ? Math.max(0, Math.floor((start.getTime() - Date.now()) / 86400000)) : null;
  const kickoff = !live || !start ? null : days >= 2 ? `Kickoff in ${days} days` : days === 1 ? 'Kickoff tomorrow' : 'Kickoff today';
  const numbers = [
    { k: 'ENTRY', v: price },
    { k: selling ? 'SPOTS LEFT' : 'PLAYING', v: cancelled ? '—' : `${selling ? left : taken}` },
    { k: 'FORMAT', v: event.format ? event.format.toUpperCase() : hasTeams ? `${event.teamSize}V${event.teamSize}` : 'PICKUP' },
  ];
  const steps = [
    ['I', 'Download Jogo', 'Free on iPhone and Android.'],
    ['II', 'Create your account', 'Thirty seconds.'],
    ['III', soldOut ? 'Join the waitlist' : `Reserve your spot — ${price}`, soldOut ? 'You’ll hear the moment a place opens.' : hasTeams ? 'Choose your team at checkout.' : 'Confirmed the moment you pay.'],
  ];
  const perks = [
    refund?.short || 'Full refund until the roster locks',
    hasTeams ? 'Private team chat' : 'The group chat',
    'QR check-in at the field',
    tournament ? 'Live scores & the bracket' : 'Kickoff reminders',
  ];
  return (
    <main className="max-w-xl mx-auto px-[22px] pt-12 pb-44 text-white">
      {/* The numbers */}
      <Reveal>
        <div className="grid grid-cols-3 border-y" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {numbers.map((x, i) => (
            <div key={x.k} className={`py-6 min-w-0 ${i > 0 ? 'pl-4 border-l' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <p className="font-bold text-[10px] tracking-[2.6px] text-white/45">{x.k}</p>
              <p className="mt-1 truncate" style={{ ...ANTON, fontSize: 'clamp(30px, 9.5vw, 42px)' }}>{x.v}</p>
            </div>
          ))}
        </div>
        {!cancelled && cap ? (
          <>
            <div className="mt-5 h-px relative" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div className="absolute left-0 top-0 h-px" style={{ background: CHAMP }}
                initial={{ width: 0 }} whileInView={{ width: `${fillPct}%` }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.2 }} />
            </div>
            <div className="mt-3 flex justify-between gap-3 text-[12.5px] font-semibold text-white/50">
              <span>{taken} of {cap} claimed</span>
              {kickoff ? <span>{kickoff}</span> : null}
            </div>
          </>
        ) : null}
      </Reveal>

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
        <div className="mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {table.map((r) => {
            const inner = (
              <>
                <span className="w-[86px] flex-shrink-0 font-bold text-[10px] tracking-[2.4px] text-white/40">{r.k}</span>
                <span className="flex-1 min-w-0 font-semibold text-[15.5px] line-clamp-2 text-white/90">{r.v}</span>
                {r.href ? <ArrowUpRight size={15} color={CHAMP} /> : null}
              </>
            );
            const cls = 'flex items-center gap-3 py-4 border-b';
            const st = { borderColor: 'rgba(255,255,255,0.1)' };
            return r.href ? (
              <a key={r.k} href={r.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:opacity-70 transition-opacity`} style={st}>{inner}</a>
            ) : (
              <div key={r.k} className={cls} style={st}>{inner}</div>
            );
          })}
        </div>
      </Reveal>

      {/* Admission — tickets live in the app */}
      {live ? (
        <Reveal className="mt-20">
          <Label>ADMISSION</Label>
          <h2 className="mt-3" style={{ ...ANTON, fontSize: 'clamp(36px, 11vw, 52px)' }}>{soldOut ? 'THE WAITLIST' : 'HOW TO GET IN'}</h2>
          <p className="mt-2 text-[15px] leading-[23px] font-medium text-white/55 max-w-[34ch]">
            Tickets are reserved in the Jogo app — payment, your team and refunds all live there.
          </p>
          <ol className="mt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {steps.map(([n, t, d]) => (
              <li key={n} className="flex items-baseline gap-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
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
          <a href={APP_URL} target="_blank" rel="noopener noreferrer"
            className="mt-10 h-[58px] rounded-full flex items-center justify-center gap-2 font-bold text-[15.5px] tracking-[1.6px] hover:opacity-90 active:scale-[0.99] transition"
            style={{ background: CHAMP, color: PAGE_DARK }}>
            GET THE JOGO APP <ArrowUpRight size={18} strokeWidth={2.4} />
          </a>
          <div className="mt-4 flex items-center justify-center gap-6 text-[12.5px] font-semibold text-white/45">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors"><AppleLogo size={13} /> App Store</a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors"><PlayLogo size={11} /> Google Play</a>
          </div>
        </Reveal>
      ) : (
        <Reveal className="mt-20 text-center">
          <p className="text-[15px] font-medium text-white/55">{cancelled ? 'This event was cancelled — everyone was refunded.' : 'That’s a wrap. The next one is on Jogo.'}</p>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-[52px] px-8 rounded-full items-center font-bold text-[14px] tracking-[1.6px]" style={{ background: CHAMP, color: PAGE_DARK }}>GET THE JOGO APP</a>
        </Reveal>
      )}

      {/* The teams */}
      {!cancelled && hasTeams ? (
        <Reveal className="mt-20">
          <div className="flex items-baseline justify-between">
            <Label>THE TEAMS</Label>
            {selling && live ? <span className="text-[12px] font-semibold text-white/40">Choose yours in the app</span> : null}
          </div>
          <div className="mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {teams.map((t, idx) => {
              const players = t.players || [];
              const size = event.teamSize || 0;
              const held = (tk.teamHeld || {})[t.id] || 0;
              const open = Math.max(0, size - players.length - held);
              const color = t.color || TEAM_PALETTE[idx % TEAM_PALETTE.length];
              const pct = size ? Math.min(1, players.length / size) : 0;
              return (
                <div key={t.id || idx} className="py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 flex-shrink-0 font-semibold text-[12px] tracking-[1.5px] text-white/30">{two(idx + 1)}</span>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="truncate font-bold text-[14px] tracking-[1.4px]">{(t.name || '').toUpperCase()}</span>
                    <span className="flex flex-shrink-0 ml-1">
                      {players.slice(0, 3).map((p, i) => <span key={p.userId || i} style={i ? { marginLeft: -6 } : null}><Face player={p} size={20} /></span>)}
                    </span>
                    <span className="ml-auto flex-shrink-0 font-semibold text-[12px] tracking-[1.2px]" style={{ color: open ? CHAMP : 'rgba(255,255,255,0.3)' }}>
                      {open ? `${open} OPEN` : 'FULL'}
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

      {/* Sign-off */}
      <div className="mt-24 flex flex-col items-center gap-2">
        <Lockup partner={partner} color="#FFFFFF" size={20} />
        <span className="font-semibold text-[10px] tracking-[3px] text-white/30">{partner ? 'IN PARTNERSHIP' : 'AN OFFICIAL JOGO EVENT'}</span>
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
    joined ? { title: "You're in", sub: `${myTeamName ? (/^team\b/i.test(myTeamName) ? myTeamName : `Team ${myTeamName}`) : ''}${myTeamName ? ' · ' : ''}Spot saved`, cta: 'Get the app', href: APP_URL, check: true }
      : cancelled ? { title: 'Cancelled', sub: 'Find another one on Jogo', cta: 'Get Jogo', href: APP_URL }
        : isPast ? { title: 'That’s a wrap', sub: 'Catch the next one on Jogo', cta: 'Get Jogo', href: APP_URL }
          : needsTicket ? { title: 'Ticketed', sub: 'Get your ticket in the app', cta: 'Tickets', href: APP_URL }
            : !selling ? { title: 'Started', sub: `${taken} playing`, cta: 'Get Jogo', href: APP_URL }
              : left === 0 ? { title: 'Full', sub: 'Every spot is taken', cta: 'Get Jogo', href: APP_URL }
                : { title: 'Free', sub: left == null ? `${taken} going · no app needed` : `${left} ${left === 1 ? 'spot' : 'spots'} left · no app needed`, cta: hasTeams ? 'Join a team' : 'Join', onClick: join?.onJoin }
  ) : cancelled ? { title: 'Cancelled', sub: 'Everyone was refunded', cta: 'Get Jogo', href: APP_URL }
    : isPast ? { title: 'That’s a wrap', sub: 'Catch the next one on Jogo', cta: 'Get Jogo', href: APP_URL }
      : selling && left > 0 ? { title: dollars(tk.priceCents), sub: 'per player · in the app', cta: 'Get the app', href: APP_URL }
        : selling ? { title: 'Sold out', sub: 'Waitlist in the Jogo app', cta: 'Get the app', href: APP_URL }
          : { title: 'Teams locked', sub: `${taken} playing`, cta: 'Get Jogo', href: APP_URL };

  const dateLine = start
    ? `${start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${start.toLocaleTimeString('en-US', start.getMinutes() ? { hour: 'numeric', minute: '2-digit' } : { hour: 'numeric' })}`.toUpperCase()
    : 'DATE TBA';
  // Free events keep the place locked until you've joined.
  const place = free ? placeOf(unlockedPlace) : placeOf(event.location);

  const facts = [
    { label: 'ENTRY', value: free ? (needsTicket ? 'TICKET' : 'FREE') : dollars(tk.priceCents) },
    free && selling && left == null
      ? { label: 'GOING', value: `${taken}` }
      : { label: selling ? 'SPOTS LEFT' : 'PLAYING', value: cancelled ? '—' : `${selling ? left : taken}`, color: lowStock ? RED : INK },
    event.format
      ? { label: 'FORMAT', value: event.format.toUpperCase() }
      : { label: hasTeams ? 'TEAMS' : 'SPOTS', value: hasTeams ? `${teams.length}` : cap ? `${cap}` : 'OPEN' },
  ];
  const whenText = start ? `${start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'To be announced';
  const table = free ? [
    { k: 'WHEN', v: whenText },
    unlockedPlace
      ? { k: 'WHERE', v: unlockedPlace, href: mapsHref }
      : event.location || !joined ? { k: 'WHERE', v: 'Unlocks when you join', locked: true } : null,
    joined && start ? { k: 'CALENDAR', v: 'Add it to your calendar', href: calendarUrl(event, start, unlockedPlace) } : null,
    hasTeams ? { k: 'TEAMS', v: `${teams.length} teams of ${event.teamSize}` } : { k: 'SPOTS', v: cap ? `${cap} players` : 'Open — no limit' },
    event.squadName ? { k: 'CREW', v: `${event.squadName}${event.visibility === 'crew' ? ' · crew only' : ''}` } : null,
    partner ? { k: 'PARTNER', v: partner } : null,
  ].filter(Boolean) : [
    { k: 'WHEN', v: whenText },
    event.location ? { k: 'WHERE', v: event.location, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` } : null,
    hasTeams ? { k: 'TEAMS', v: `${teams.length} teams of ${event.teamSize}` } : { k: 'SPOTS', v: `${cap} players` },
    { k: 'REFUNDS', v: refundText(tk)?.short || 'Full refund until the roster locks' },
    partner ? { k: 'PARTNER', v: partner } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen antialiased" style={{ fontFamily: BARLOW, color: free ? INK : '#FFFFFF', background: free ? '#FFFFFF' : PAGE_DARK }}>
      <style>{`
        @keyframes pe-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        .pe-bob { animation: pe-bob 1.8s ease-in-out infinite; }
        @keyframes pe-pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        .pe-pulse { animation: pe-pulse 1.4s ease-in-out infinite; }
      `}</style>

      {/* 1 · Cover — the first screen, less the bottom bar and a peek of the page */}
      <section ref={coverRef} className="relative overflow-hidden" style={{ height: free ? 'max(440px, 58svh)' : 'max(560px, calc(100svh - 120px))', background: INK }}>
        <motion.div className="absolute inset-0" style={{ y: photoY }}>
          {photo ? (
            <motion.img
              src={photo} alt=""
              className="w-full h-full object-cover"
              initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: EASE }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: free ? 'linear-gradient(135deg, #2E8B4A 0%, #14532D 100%)' : 'radial-gradient(85% 60% at 50% 0%, #3A3F47 0%, #0A0A0A 100%)' }} />
          )}
        </motion.div>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: free
            ? 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,.15) 50%, rgba(0,0,0,.88) 100%)'
            : 'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,0) 22%, rgba(10,10,10,.5) 48%, rgba(10,10,10,.9) 70%, rgba(10,10,10,1) 100%)',
        }} />

        {!free ? (
          <motion.header className="absolute top-0 inset-x-0 z-10 pt-5 px-5 flex justify-center" style={{ opacity: topOpacity }}>
            <a href="/" aria-label="Jogo"><Lockup partner={partner} color="#FFFFFF" size={15} /></a>
          </motion.header>
        ) : null}

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
            {free ? (
              <p className="text-white/75 font-extrabold text-[11.5px] tracking-[2.4px]">
                {partner ? `PRESENTED BY ${partner.toUpperCase()}` : event.squadName ? `${event.squadName.toUpperCase()} PRESENTS` : 'PICKUP GAME'}
              </p>
            ) : (
              <p className="flex max-w-full items-center gap-3 font-bold text-[11px] tracking-[3.2px]" style={{ color: CHAMP, textShadow: '0 1px 12px rgba(0,0,0,.8)' }}>
                <span className="w-6 h-px flex-shrink-0" style={{ background: CHAMP }} />
                <span className="truncate">{partner ? `PRESENTED BY ${partner.toUpperCase()}` : 'AN OFFICIAL JOGO EVENT'}</span>
              </p>
            )}
            <h1 className="text-white mt-1 break-words" style={{ ...ANTON, fontSize: free ? 'clamp(44px, 13vw, 84px)' : 'clamp(48px, 14vw, 96px)', letterSpacing: free ? undefined : '0.01em', textShadow: '0 4px 24px rgba(0,0,0,.55)' }}>
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
              {!free ? <ChevronDown className="pe-bob" size={22} color="rgba(255,255,255,.8)" /> : null}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {!free ? (
        <PremiumBody
          event={event} price={dollars(tk.priceCents || 0)} left={left} taken={taken} cap={cap} fillPct={fillPct}
          selling={selling} live={live} cancelled={cancelled} hasTeams={hasTeams} teams={teams} tk={tk} start={start}
          table={table} partner={partner} tournament={hasTournament} refund={refundText(tk)}
        />
      ) : null}

      {/* White page (free) */}
      {free ? (
      <main className="max-w-xl mx-auto px-[22px] pt-7 pb-44">
        {/* 2 · Facts (free) */}
        {free ? (
        <div className="flex">
          {facts.map((x, i) => (
            <div key={x.label} className={`flex-1 min-w-0 ${i > 0 ? 'pl-4 border-l' : ''}`} style={{ borderColor: LINE }}>
              <div className="truncate" style={{ ...ANTON, fontSize: 'clamp(28px, 9vw, 38px)', color: x.color || INK }}>{x.value}</div>
              <div className="font-extrabold text-[10.5px] tracking-[1.8px]" style={{ color: MUTED }}>{x.label}</div>
            </div>
          ))}
        </div>
        ) : null}
        {free && !cancelled && cap ? (
          <>
            <div className="mt-[22px] h-[3px] overflow-hidden" style={{ background: LINE }}>
              <motion.div className="h-full" style={{ background: INK }}
                initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ delay: 0.5, duration: 1, ease: EASE }} />
            </div>
            <div className="mt-2 flex justify-between gap-2.5 text-[12.5px] font-bold" style={{ color: MUTED }}>
              <span>{cap ? `${taken} of ${cap} ${free ? 'in' : 'claimed'}` : `${taken} going`}</span>
              {note ? <span style={{ color: INK }}>{note}</span> : null}
            </div>
          </>
        ) : null}

        {/* Just joined: the app pitch comes first */}
        {free && joined ? <AppPerks event={event} hasTeams={hasTeams} joined tournament={!!join?.hasTournament} /> : null}

        {/* 3 · About + details */}
        {event.description ? (
          <p className="mt-[30px] text-[17px] leading-[26px] font-medium whitespace-pre-line" style={{ color: '#262626' }}>{event.description}</p>
        ) : null}
        <div className="mt-[26px] border-t" style={{ borderColor: INK }}>
          {table.map((r) => {
            const inner = (
              <>
                <span className="w-[78px] flex-shrink-0 font-extrabold text-[10.5px] tracking-[1.8px]" style={{ color: MUTED }}>{r.k}</span>
                <span className="flex-1 min-w-0 font-bold text-[15px] line-clamp-2" style={r.locked ? { color: FAINT } : null}>{r.v}</span>
                {r.href ? <ArrowUpRight size={16} color={INK} /> : r.locked ? <Lock size={15} color={FAINT} /> : null}
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
              {hasTeams && selling && live && !free ? <span className="text-[13px] font-bold" style={{ color: MUTED }}>Pick your team in the app</span> : null}
            </div>
            {free && hasTeams && selling && live && !joined ? (
              <p className="mt-2 text-[13px] font-bold" style={{ color: MUTED }}>Joining puts you on the team with the most room — switch in the app.</p>
            ) : null}
            {hasTeams ? teams.map((t, idx) => {
              const players = t.players || [];
              const size = event.teamSize || 0;
              const held = free ? 0 : ((tk.teamHeld || {})[t.id] || 0);
              const open = Math.max(0, size - players.length - held);
              const canJoin = live && selling && open > 0;
              const color = t.color || TEAM_PALETTE[idx % TEAM_PALETTE.length];
              const paidPct = size ? Math.min(1, players.length / size) : 0;
              const heldPct = size ? Math.min(1 - paidPct, held / size) : 0;
              return (
                <a key={t.id || idx} href={free ? undefined : APP_URL} target="_blank" rel="noopener noreferrer"
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
                  {free ? (
                    myTeamName && t.name === myTeamName
                      ? <span className="flex-shrink-0 h-[30px] px-[13px] rounded-full flex items-center font-extrabold text-[11.5px] tracking-[1.2px] text-white" style={{ background: INK }}>YOU</span>
                      : <span className="flex-shrink-0 h-[30px] px-[13px] flex items-center font-extrabold text-[11.5px] tracking-[1.2px]" style={{ color: open > 0 ? MUTED : FAINT }}>{open > 0 ? `${open} OPEN` : 'FULL'}</span>
                  ) : canJoin ? (
                    <span className="flex-shrink-0 h-[30px] px-[13px] flex items-center font-extrabold text-[11.5px] tracking-[1.2px]" style={{ color: CHAMP }}>{open} OPEN</span>
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

        {/* Free, not joined yet: the app pitch after the teams */}
        {free && !joined ? <AppPerks event={event} hasTeams={hasTeams} joined={false} tournament={!!join?.hasTournament} /> : null}

        {/* Paid: the spot itself lives in the app */}
        {!free && !live ? (
        <section className="mt-12 rounded-3xl px-5 py-6" style={{ background: '#F5F5F5' }}>
          <h2 style={{ ...ANTON, fontSize: 26 }}>{free ? 'THE GROUP LIVES IN JOGO' : 'YOUR SPOT LIVES IN JOGO'}</h2>
          <p className="mt-1 text-[15px] leading-[22px] font-medium" style={{ color: '#404040' }}>
            {free
              ? 'Chat with everyone going, get a reminder before kickoff and switch teams — all in the free Jogo app. Log in with the same email.'
              : 'Pay in seconds, pick your team, chat with your teammates and check in at the field — all in the free Jogo app.'}
          </p>
          <StoreButtons label="" className="mt-4" />
        </section>
        ) : null}

        {/* 5 · Sign-off */}
        <div className="mt-14 flex flex-col items-center gap-1">
          {!free ? <Lockup partner={partner} color={INK} size={22} /> : null}
          <span className="font-bold text-[10.5px] tracking-[2.4px]" style={{ color: FAINT }}>{partner ? 'IN PARTNERSHIP' : free ? 'SEE YOU THERE · BUILT BY SOCCER PLAYERS' : 'OFFICIAL EVENT'}</span>
        </div>
      </main>
      ) : null}

      {/* One bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20" style={free ? { background: '#FFFFFF', borderTop: `1px solid ${LINE}` } : { background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: '1px solid rgba(203,178,131,0.25)' }}>
        {free && join?.joinError ? <p className="text-center text-[13px] font-bold text-red-600 pt-2 px-4">{join.joinError}</p> : null}
        <div className="max-w-xl mx-auto flex items-center gap-3 px-[22px] pt-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {bar.check ? <Check size={18} strokeWidth={3} color="#16A34A" /> : null}
              <div className="truncate" style={{ ...ANTON, fontSize: 22, lineHeight: '28px', letterSpacing: 0.4, color: free ? INK : '#FFFFFF' }}>{bar.title.toUpperCase()}</div>
            </div>
            <div className="truncate text-[12.5px] font-semibold" style={{ color: free ? MUTED : FAINT }}>{bar.sub}</div>
          </div>
          {bar.onClick ? (
            <button type="button" onClick={bar.onClick} disabled={join?.joining}
              className="flex-shrink-0 h-[52px] min-w-[128px] px-[26px] rounded-full flex items-center justify-center gap-2 font-extrabold text-[15px] tracking-[1.4px] text-white hover:opacity-90 active:scale-[0.97] transition disabled:opacity-70"
              style={{ background: INK }}>
              {join?.joining ? <Loader2 size={17} className="animate-spin" /> : null}
              {join?.joining ? 'JOINING' : bar.cta.toUpperCase()}
            </button>
          ) : (
            <a href={bar.href || APP_URL} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 h-[52px] min-w-[128px] px-[26px] rounded-full flex items-center justify-center font-extrabold text-[15px] tracking-[1.4px] hover:opacity-90 active:scale-[0.97] transition"
              style={free ? { background: INK, color: '#FFFFFF' } : { background: CHAMP, color: PAGE_DARK }}>
              {bar.cta.toUpperCase()}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

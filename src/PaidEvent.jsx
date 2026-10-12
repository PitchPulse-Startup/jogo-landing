// src/PaidEvent.jsx — shared-link page for a PAID event (events/{id} with
// `ticketing`, set by the app's "Collect payment in the app" switch).
//
// Same language as the app's paid event page (components/events/
// PaidEventLayout.js): an "official Jogo event" programme cover — the
// event's picture behind a giant date, heavy rule and title — a numbered
// index (spots left, entry, teams, format, live kickoff countdown), then
// the seat map: every spot a circle, a face or a soccer ball once taken,
// grey while someone is checking out, dashed gold while open. Live via
// the parent's onSnapshot. Spots are bought in the Jogo app (that's where
// the ticket, team chat and QR check-in live), so the pay bar sends there.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, XCircle } from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';
import { APP_URL, StoreButtons, HeaderStoreLinks } from './appLinks';

const INK = '#0B0D10';
const GOLD = '#A16207';
const GOLD_BRIGHT = '#FACC15';
const RED = '#BE123C';
const MUTED = '#5B6270';
const EASE = [0.22, 1, 0.36, 1];
const ANTON = { fontFamily: "'Anton', Impact, sans-serif", fontWeight: 400 };
const BARLOW = "'Barlow', system-ui, sans-serif";

function useProgrammeFonts() {
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

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return null;
  const ms = target.getTime() - now;
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return d > 0 ? `${d}D ${h}H` : `${h}H ${String(m).padStart(2, '0')}M`;
}

const dollars = (cents) => `$${(cents / 100) % 1 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;

function Ball({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={color} />
      <polygon points="12,7.2 16,10.1 14.5,14.8 9.5,14.8 8,10.1" fill="#FFFFFF" />
      <path d="M12 7.2V3.2M16 10.1l3.8-1.3M14.5 14.8l2.4 3.3M9.5 14.8l-2.4 3.3M8 10.1L4.2 8.8" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function Seat({ player, color, state }) {
  if (player) {
    return player.photoURL
      ? <img src={player.photoURL} alt="" className="w-[22px] h-[22px] rounded-full object-cover" style={{ boxShadow: `0 0 0 1.5px ${color}` }} />
      : <Ball color={color} />;
  }
  return state === 'held'
    ? <span className="w-[22px] h-[22px] rounded-full bg-[#E5E7EB]" title="Someone is checking out" />
    : <span className="w-[22px] h-[22px] rounded-full bg-white" style={{ border: `1.5px dashed ${GOLD}` }} />;
}

export default function PaidEvent({ event, refName }) {
  useProgrammeFonts();
  const tk = event.ticketing;
  const start = parseStart(event);
  const countdown = useCountdown(start);
  const photo = event.imageUrl || null;
  const teams = Array.isArray(event.teams) ? event.teams : [];
  const hasTeams = !!event.enableTeams && teams.length > 0;
  const participants = Array.isArray(event.participants) ? event.participants : [];
  const cap = tk.capacity || (hasTeams ? teams.length * (event.teamSize || 0) : event.maxParticipants || 0);
  const taken = hasTeams ? teams.reduce((n, t) => n + (t.players || []).length, 0) : participants.length;
  const left = Math.max(0, cap - taken - (tk.heldCount || 0));
  const selling = tk.status === 'open' || tk.status === 'confirming';
  const cancelled = tk.status === 'cancelled';
  const isPast = !!start && start.getTime() < Date.now() - 12 * 3600 * 1000;

  useEffect(() => { if (event.title) document.title = `${event.title} · Jogo`; }, [event.title]);

  const rows = [
    { label: 'SPOTS LEFT', value: cancelled ? '—' : `${left} / ${cap}`, color: selling && left <= 10 ? RED : INK },
    { label: 'ENTRY', value: dollars(tk.priceCents) },
    hasTeams ? { label: 'TEAMS', value: String(teams.length) } : null,
    hasTeams && event.teamSize ? { label: 'PER TEAM', value: `${event.teamSize} PLAYERS` } : null,
    event.format ? { label: 'FORMAT', value: event.format.toUpperCase() } : null,
    countdown && !cancelled ? { label: 'KICKOFF IN', value: countdown } : null,
  ].filter(Boolean).map((r, i) => ({ ...r, n: String(i + 1).padStart(2, '0') }));

  const onPhoto = photo ? 'text-white' : '';

  return (
    <div className="min-h-screen bg-white antialiased" style={{ fontFamily: BARLOW, color: INK }}>
      <div className="w-full max-w-md mx-auto pb-36">
        {/* Header — the event's picture sits behind it when there is one */}
        <div className="relative overflow-hidden" style={{ background: photo ? INK : '#FFFFFF' }}>
          {photo ? (
            <>
              <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.78))' }} />
            </>
          ) : null}

          <div className="relative px-4 pt-4 flex items-center justify-between">
            <a href="/" className={`flex items-center gap-2 ${photo ? 'bg-white/90' : 'bg-[#F2F3F5]'} rounded-full pl-1 pr-3 py-1`}>
              <img src={appIcon} alt="" className="w-7 h-7 rounded-full" />
              <span className="font-extrabold text-[15px] tracking-tight text-[#0B0D10]">jogo</span>
            </a>
            <HeaderStoreLinks />
          </div>

          <motion.div className="relative px-[22px] pt-5 pb-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
            <p className="text-[11px] font-extrabold tracking-[0.2em] mb-1" style={{ color: photo ? GOLD_BRIGHT : GOLD }}>OFFICIAL JOGO EVENT</p>
            {refName ? (
              <p className={`text-[13px] font-bold ${photo ? 'text-white/85' : 'text-[#3A404B]'}`}>
                <span className={photo ? 'text-white' : 'text-[#0B0D10]'}>{refName}</span> sent you an invite
              </p>
            ) : null}
            <div className="flex items-end gap-3.5">
              <span className={`leading-[1.25] -mb-6 tracking-[-2px] ${onPhoto}`} style={{ ...ANTON, fontSize: 136 }}>{start ? start.getDate() : '—'}</span>
              <div className="pb-7">
                <div className={`leading-[1.25] ${onPhoto}`} style={{ ...ANTON, fontSize: 34 }}>{start ? start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBA'}</div>
                <div className={`text-[13.5px] font-extrabold tracking-wide ${photo ? 'text-white/85' : 'text-[#5B6270]'}`}>
                  {start ? `${start.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} · ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}
                </div>
              </div>
            </div>
            <div className="h-1.5" style={{ background: photo ? '#FFFFFF' : INK }} />
            <h1 className={`mt-2 leading-[1.25] ${onPhoto}`} style={{ ...ANTON, fontSize: 44 }}>{(event.title || 'Jogo event').toUpperCase()}</h1>
            <a
              href={event.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` : undefined}
              target="_blank" rel="noopener noreferrer"
              className={`mt-1 flex items-center gap-1.5 text-[15px] font-bold ${photo ? 'text-white/90' : 'text-[#3A404B]'}`}
            >
              <MapPin size={15} color={photo ? GOLD_BRIGHT : GOLD} />
              <span className="truncate">{[event.location || 'Location TBA', event.format, 'Paid entry'].filter(Boolean).join(' · ')}</span>
            </a>
          </motion.div>
        </div>

        <div className="px-[22px]">
          {cancelled ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl p-4 text-white" style={{ background: RED }}>
              <XCircle size={22} />
              <div>
                <div className="leading-[1.25]" style={{ ...ANTON, fontSize: 22 }}>CANCELLED</div>
                <div className="text-[13.5px] font-bold text-white/85">Everyone who paid has been fully refunded.</div>
              </div>
            </div>
          ) : null}

          {/* Index */}
          <div className="mt-5 border-t-[1.5px]" style={{ borderColor: INK }}>
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline gap-3.5 py-3 border-b border-[#E5E7EB]">
                <span className="w-[22px] leading-[1.25]" style={{ ...ANTON, fontSize: 14, color: GOLD }}>{r.n}</span>
                <span className="flex-1 text-[14.5px] font-extrabold tracking-wide">{r.label}</span>
                <span className="leading-[1.25] tabular-nums" style={{ ...ANTON, fontSize: 22, color: r.color || INK }}>{r.value}</span>
              </div>
            ))}
          </div>

          {event.description ? (
            <>
              <h2 className="mt-6 leading-[1.25]" style={{ ...ANTON, fontSize: 20 }}>ABOUT</h2>
              <p className="mt-1 text-[15.5px] leading-[1.5] text-[#3A404B] font-semibold whitespace-pre-line">{event.description}</p>
            </>
          ) : null}
        </div>

        {/* Seat map */}
        {!cancelled ? (
          <motion.div className="mt-7 mx-3.5 rounded-[22px] bg-[#F7F7F8] px-3.5 pt-4 pb-2"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15, ease: EASE }}>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="leading-[1.25]" style={{ ...ANTON, fontSize: 22 }}>WHO'S IN</h2>
              <div className="flex gap-3 text-[11.5px] font-bold" style={{ color: MUTED }}>
                <span className="flex items-center gap-1"><Ball color={INK} />Taken</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ border: `1.5px dashed ${GOLD}` }} />Open</span>
              </div>
            </div>
            {hasTeams ? teams.map((t, idx) => {
              const players = t.players || [];
              const held = (tk.teamHeld || {})[t.id] || 0;
              const open = Math.max(0, (event.teamSize || 0) - players.length - held);
              const color = t.color || INK;
              return (
                <div key={t.id || idx} className={`flex items-center gap-2 h-10 border-t border-[#E5E7EB] ${open === 0 ? 'opacity-50' : ''}`}>
                  <span className="w-2 h-[22px] rounded-[3px]" style={{ background: color }} />
                  <span className="w-[62px] text-[13px] font-extrabold truncate">{t.name}</span>
                  <div className="flex-1 flex justify-between">
                    {Array.from({ length: event.teamSize || 0 }).map((_, k) => (
                      <Seat key={k} player={players[k]} color={color} state={k < players.length + held ? 'held' : 'open'} />
                    ))}
                  </div>
                  <span className="w-9 text-right text-[12px] font-extrabold" style={{ color: open > 0 && open <= 2 ? RED : MUTED }}>{open > 0 ? open : 'FULL'}</span>
                </div>
              );
            }) : (
              <div className="flex flex-wrap gap-2 py-2.5">
                {Array.from({ length: Math.min(cap, 120) }).map((_, k) => (
                  <Seat key={k} player={participants[k]} color={INK} state={k < participants.length + (tk.heldCount || 0) ? 'held' : 'open'} />
                ))}
              </div>
            )}
          </motion.div>
        ) : null}

        <div className="px-[22px]">
          <StoreButtons className="mt-8" />
          <div className="mt-8 flex items-center justify-center gap-2 text-[12px]" style={{ color: MUTED }}>
            <img src={appIcon} alt="" className="w-5 h-5 rounded-md opacity-80" />
            <span>Events, games & crews — all on Jogo</span>
          </div>
        </div>
      </div>

      {/* Pay bar */}
      {!cancelled && !isPast ? (
        <div className="fixed inset-x-0 bottom-0 z-20 px-3.5 pt-2.5 pb-[max(14px,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur">
          <div className="max-w-md mx-auto">
            <div className="h-[62px] rounded-full flex items-center justify-between pl-[22px] pr-2" style={{ background: INK }}>
              <div>
                <div className="text-white leading-[1.25]" style={{ ...ANTON, fontSize: 22 }}>{dollars(tk.priceCents)}</div>
                <div className="text-[12px] font-bold text-[#9AA0AB]">{selling ? (left > 0 ? `${left} left` : 'Full — waitlist open') : 'Locked in'}</div>
              </div>
              <a
                href={APP_URL} target="_blank" rel="noopener noreferrer"
                className="h-[46px] px-6 rounded-full bg-white flex items-center text-[15.5px] font-extrabold"
                style={{ color: INK }}
              >
                {selling ? (left > 0 ? 'Get the app & join' : 'Get the app · waitlist') : 'Open in Jogo'}
              </a>
            </div>
            <p className="text-center text-[11.5px] font-semibold mt-1.5" style={{ color: MUTED }}>Your spot, ticket, team chat and check-in all live in the Jogo app</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

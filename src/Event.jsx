// src/Event.jsx — landing page for shared event links (jogous.io/event/:eventId)
//
// The event-link counterpart to src/Invite.jsx (games). Whoever taps a
// shared event link lands here and can join right in the browser through
// the joinEventViaLink Cloud Function (jogo-APP functions/index.js), which
// mirrors the app's own join — a plain event adds you to its participants,
// a team event puts you on the team with the most open spots.
//
// Deliberately NOT the game page's look: games are light and pitch-green;
// events are a dark "ticket" — the event's own photo as an ambient
// backdrop, a poster with a date block, a torn perforation, and a stub with
// a live countdown. Same visual language as the app's ShareEventModal, so
// the share and the landing feel like one thing.
//
// The link IS the invitation: a crew-only event (visibility 'crew') is
// joinable here exactly like a public one. Paid events (?type=paid, the
// separate paidEvents collection) need a ticket bought in the app, so they
// get the details and an App Store button instead of a join button.
//
// The location stays locked until you've joined, same reasoning as the game
// page — people shouldn't just show up off a forwarded link.

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, functions } from './firebase';
import {
  MapPin, Check, Loader2, Lock, CalendarPlus, Navigation, Ticket, Shield, Sparkles, Users, Zap,
} from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/jogo-pickup-soccer-near-you/id6760919244';
const WEB_APP_URL = 'https://www.jogous.io/app';
const EASE = [0.22, 1, 0.36, 1];
const BG = '#07090A';

const joinEventViaLink = httpsCallable(functions, 'joinEventViaLink');

function AppleLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function authErrorMessage(error, mode) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'That email already has a Jogo account — try "I have an account".';
    case 'auth/invalid-email':
      return 'That email address doesn’t look right.';
    case 'auth/weak-password':
      return 'Password should be at least 8 characters with a mix of letters and numbers.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/user-not-found':
      return 'No Jogo account with that email — try "I\'m new".';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return mode === 'signup' ? 'Could not create your account. Please try again.' : 'Could not log you in. Please try again.';
  }
}

// Mirrors screens/LoginScreen.js's password rule.
function isStrongEnoughPassword(pw) {
  return pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
}

function joinErrorMessage(error) {
  if (error?.code === 'functions/failed-precondition') return error.message;
  if (error?.code === 'functions/not-found') return 'This event no longer exists.';
  return 'Something went wrong joining. Please try again.';
}

// Event dates are local 'YYYY-MM-DD' + optional 'HH:MM' strings (see the
// app's OrganizerEventFormScreen) — parsed as local time, same as the app.
function parseEventStart(date, time) {
  if (!date || typeof date !== 'string') return null;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  let h = 0; let min = 0;
  if (time) {
    const [hh, mm] = String(time).split(':').map(Number);
    h = hh || 0; min = mm || 0;
  }
  return new Date(y, m - 1, d, h, min);
}

function formatWhen(date, time) {
  const start = parseEventStart(date, time);
  if (!start) return null;
  return {
    day: start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    weekday: start.toLocaleDateString(undefined, { weekday: 'long' }),
    month: start.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    dayNum: start.getDate(),
    time: time ? start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : null,
  };
}

function googleCalendarUrl(details, eventUrl) {
  const start = parseEventStart(details.date, details.time);
  if (!start) return null;
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(start.getTime() + 2 * 3600 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🎟️ ${details.title || 'Jogo event'}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: details.location || '',
    details: `Event on Jogo: ${eventUrl}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function mapsUrl(details) {
  return details.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.location)}`
    : null;
}

// Ticks every second while the event is upcoming.
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
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

// The torn edge between poster and stub — notches punched out in the page
// color, dashed line between them.
function Perforation() {
  return (
    <div className="relative h-6 flex items-center">
      <span className="absolute -left-3 w-6 h-6 rounded-full" style={{ background: BG }} />
      <span className="absolute -right-3 w-6 h-6 rounded-full" style={{ background: BG }} />
      <div className="mx-5 w-full border-t-2 border-dashed border-white/10" />
    </div>
  );
}

// ── Join flow ─────────────────────────────────────────────────────────
function JoinEvent({ eventId, onResult }) {
  const [user, setUser] = useState(() => auth.currentUser);
  const [mode, setMode] = useState(null); // null | 'signup' | 'login' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const runJoin = async (displayName) => {
    setJoining(true);
    setJoinError('');
    try {
      const res = await joinEventViaLink({ eventId, displayName: displayName || undefined });
      onResult(res.data);
    } catch (e) {
      console.error('Error joining event:', e);
      setJoinError(joinErrorMessage(e));
    } finally {
      setJoining(false);
    }
  };

  const handlePrimary = () => {
    if (joining) return;
    if (user) runJoin(user.displayName);
    else setMode('signup'); // most people off a shared link are new
  };

  const switchMode = (next) => { setMode(next); setAuthError(''); setResetSent(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (mode === 'reset') {
      if (!email.trim()) { setAuthError('Enter your email.'); return; }
      setSubmitting(true);
      try { await sendPasswordResetEmail(auth, email.trim()); setResetSent(true); }
      catch (err) { setAuthError(authErrorMessage(err, 'login')); }
      finally { setSubmitting(false); }
      return;
    }
    if (mode === 'signup' && !name.trim()) { setAuthError('Enter your name so the organizer knows who’s coming.'); return; }
    if (!email.trim() || !password) { setAuthError('Enter your email and password.'); return; }
    if (mode === 'signup' && !isStrongEnoughPassword(password)) {
      setAuthError('Password needs 8+ characters with uppercase, lowercase, and a number.');
      return;
    }
    setSubmitting(true);
    try {
      let displayName;
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        displayName = name.trim();
        try { await updateProfile(cred.user, { displayName }); } catch { /* name is also sent to the join call */ }
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        displayName = cred.user.displayName;
      }
      setMode(null);
      await runJoin(displayName);
    } catch (err) {
      setAuthError(authErrorMessage(err, mode));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white placeholder:text-white/35 outline-none focus:border-lime-400/70 focus:bg-white/[0.09] transition-colors';

  return (
    <div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePrimary}
        disabled={joining}
        className="ev-glow relative overflow-hidden flex items-center justify-center gap-2 w-full bg-lime-400 hover:bg-lime-300 text-[#07090A] font-black text-[17px] py-4 rounded-2xl disabled:opacity-80"
      >
        <span className="ev-shine absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        {joining ? <><Loader2 size={18} className="animate-spin" /> Saving your spot…</> : <><Ticket size={19} strokeWidth={2.6} /> Claim your spot</>}
      </motion.button>

      {user && !mode && (
        <p className="text-center text-[11px] text-white/40 mt-2.5">
          Joining as {user.displayName || user.email} ·{' '}
          <button type="button" onClick={() => signOut(auth)} className="underline underline-offset-2 hover:text-white/70">
            Not you?
          </button>
        </p>
      )}
      {joinError && <p className="text-center text-xs text-red-400 mt-2">{joinError}</p>}

      <AnimatePresence>
        {mode && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 mt-3">
              {mode === 'reset' ? (
                <p className="text-sm text-white/60 mb-3">Enter your email and we’ll send you a reset link.</p>
              ) : (
                <div className="flex bg-white/[0.06] rounded-xl p-1 mb-3">
                  {[['signup', "I'm new"], ['login', 'I have an account']].map(([m, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => switchMode(m)}
                      className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${mode === m ? 'bg-white text-[#07090A] shadow' : 'text-white/55'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {mode === 'signup' && (
                  <input type="text" autoComplete="given-name" placeholder="First name" value={name}
                    onChange={(e) => setName(e.target.value)} className={inputClass} />
                )}
                <input type="email" autoComplete="email" placeholder="Email" value={email}
                  onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                {mode !== 'reset' && (
                  <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signup' ? 'Create a password' : 'Password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                )}
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-white/35 mt-2">8+ characters, with an uppercase letter and a number.</p>
              )}

              {authError && <p className="text-xs text-red-400 mt-2">{authError}</p>}
              {resetSent && <p className="text-xs text-lime-300 mt-2">Check your inbox for a reset link.</p>}

              <button type="submit" disabled={submitting}
                className="w-full bg-white hover:bg-white/90 text-[#07090A] font-bold py-3 rounded-xl mt-3 disabled:opacity-70 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {mode === 'signup' ? 'Create account & claim spot' : mode === 'login' ? 'Log in & claim spot' : 'Send reset link'}
              </button>

              <div className="flex justify-between text-[11px] text-white/35 mt-2">
                <span>Same account as the Jogo app.</span>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('reset')} className="underline underline-offset-2 hover:text-white/70">Forgot password?</button>
                )}
                {mode === 'reset' && (
                  <button type="button" onClick={() => switchMode('login')} className="underline underline-offset-2 hover:text-white/70">Back to log in</button>
                )}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// Once you're in: your ticket — admit-one stub, unlocked location, next steps.
function YourTicket({ result, eventUrl, viewerName }) {
  const details = result.details || {};
  const when = formatWhen(details.date, details.time);
  const cal = googleCalendarUrl(details, eventUrl);
  const maps = mapsUrl(details);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: -2, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 16 }}
      className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-500 text-[#07090A] shadow-[0_24px_60px_-20px_rgba(163,230,53,0.55)]"
    >
      <div className="px-6 pt-6 pb-5 flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 13, delay: 0.15 }}
          className="w-14 h-14 rounded-2xl bg-[#07090A] text-lime-300 flex items-center justify-center flex-shrink-0"
        >
          <Check size={30} strokeWidth={3.4} />
        </motion.div>
        <div className="min-w-0">
          <p className="text-[11px] font-black tracking-[0.2em] opacity-60">ADMIT ONE</p>
          <p className="font-black text-2xl leading-tight tracking-tight">You're in{viewerName ? `, ${viewerName.split(' ')[0]}` : ''}!</p>
          {result.teamName && <p className="text-sm font-bold opacity-75">Team: {result.teamName}</p>}
        </div>
      </div>

      <div className="relative h-6 flex items-center">
        <span className="absolute -left-3 w-6 h-6 rounded-full" style={{ background: BG }} />
        <span className="absolute -right-3 w-6 h-6 rounded-full" style={{ background: BG }} />
        <div className="mx-5 w-full border-t-2 border-dashed border-[#07090A]/25" />
      </div>

      <div className="px-6 pt-3 pb-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[10px] font-black tracking-[0.18em] opacity-55">WHEN</p>
            <p className="font-black text-[15px] leading-snug">{when ? when.day : 'TBA'}</p>
            {when?.time && <p className="text-sm font-bold opacity-70">{when.time}</p>}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black tracking-[0.18em] opacity-55">WHERE</p>
            <p className="font-black text-[15px] leading-snug break-words">{details.location || 'TBA'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {maps && (
            <a href={maps} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#07090A] hover:bg-[#1a1f1c] text-lime-300 text-sm font-bold py-3 rounded-xl transition-colors">
              <Navigation size={15} /> Directions
            </a>
          )}
          {cal && (
            <a href={cal} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#07090A]/10 hover:bg-[#07090A]/20 text-[#07090A] text-sm font-bold py-3 rounded-xl transition-colors">
              <CalendarPlus size={15} /> Add to calendar
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Event() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const isPaid = searchParams.get('type') === 'paid';

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [viewer, setViewer] = useState(undefined);
  const [result, setResult] = useState(null);
  const autoCheckedRef = useRef(null);
  const viewerUid = viewer === undefined ? undefined : viewer?.uid ?? null;

  // Live event doc (events and paidEvents are publicly readable).
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!eventId) { setLoading(false); return undefined; }
    return onSnapshot(doc(db, isPaid ? 'paidEvents' : 'events', eventId), (snap) => {
      setEvent(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }, (e) => {
      console.error('Error loading shared event:', e);
      setEvent(null);
      setLoading(false);
    });
  }, [eventId, isPaid]);

  useEffect(() => onAuthStateChanged(auth, (u) => setViewer(u ?? null)), []);

  const teams = Array.isArray(event?.teams) ? event.teams : [];
  const hasTeams = !!event?.enableTeams && teams.length > 0;
  const participants = Array.isArray(event?.participants) ? event.participants : [];
  const everyone = hasTeams ? teams.flatMap((t) => t.players || []) : participants;

  // Someone already signed up (came back to the link) gets their ticket
  // without tapping — joinEventViaLink is idempotent for them.
  const viewerIn = !isPaid && !!viewerUid && everyone.some((p) => p.userId === viewerUid);
  useEffect(() => {
    if (!viewerIn || result || autoCheckedRef.current === viewerUid) return;
    autoCheckedRef.current = viewerUid;
    joinEventViaLink({ eventId }).then((res) => setResult(res.data)).catch(() => {});
  }, [viewerIn, viewerUid, eventId, result]);
  useEffect(() => {
    if (viewerUid === null) { setResult(null); autoCheckedRef.current = null; }
  }, [viewerUid]);

  useEffect(() => {
    if (event?.title) document.title = `${event.title} · Jogo`;
  }, [event?.title]);

  const start = parseEventStart(event?.date, event?.time);
  const countdown = useCountdown(start);
  const when = formatWhen(event?.date, event?.time);
  const count = everyone.length;
  const capacity = event?.maxParticipants || (hasTeams && event?.teamSize ? teams.length * event.teamSize : null) || null;
  const spotsLeft = capacity ? Math.max(0, capacity - count) : null;
  const isFull = spotsLeft === 0;
  const fillPct = capacity ? Math.min(100, Math.round((count / capacity) * 100)) : 0;
  const isPast = !!start && start.getTime() < Date.now() - 12 * 3600 * 1000;
  const price = typeof event?.price === 'number' ? event.price : 0;
  const needsTicket = isPaid || price > 0;
  const unavailable = !event || event.status === 'cancelled' || isPast;
  const isCrewEvent = event?.visibility === 'crew';
  const faces = everyone.slice(0, 5);
  const extraFaces = Math.max(0, count - faces.length);
  const eventUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
  const scarcity = !unavailable && spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5
    ? (spotsLeft === 1 ? 'Last spot left' : `Only ${spotsLeft} spots left`)
    : null;

  return (
    <div className="min-h-screen text-white font-sans antialiased flex flex-col relative overflow-x-hidden" style={{ background: BG }}>
      <style>{`
        @keyframes ev-shine { 0% { transform: translateX(0); } 60%, 100% { transform: translateX(450%); } }
        .ev-shine { animation: ev-shine 3s ease-in-out infinite; }
        @keyframes ev-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(163,230,53,0.45), 0 18px 40px -12px rgba(163,230,53,0.55); } 50% { box-shadow: 0 0 0 10px rgba(163,230,53,0), 0 18px 40px -12px rgba(163,230,53,0.55); } }
        .ev-glow { animation: ev-pulse 2.6s ease-in-out infinite; }
        @keyframes ev-float { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(24px,-18px) scale(1.08); } }
        .ev-orb { animation: ev-float 12s ease-in-out infinite; }
        .ev-orb-2 { animation-delay: -6s; }
      `}</style>

      {/* Ambient backdrop — the event's own photo, blurred into the page */}
      <div className="absolute inset-x-0 top-0 h-[720px] pointer-events-none overflow-hidden">
        {event?.imageUrl && (
          <img src={event.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-35" />
        )}
        <div className="ev-orb absolute -top-40 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full bg-lime-400/15 blur-[130px]" />
        <div className="ev-orb ev-orb-2 absolute top-40 -left-32 w-[380px] h-[380px] rounded-full bg-emerald-500/15 blur-[110px]" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(7,9,10,0.2), ${BG} 92%)` }} />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <header className="relative z-10 px-4 pt-4">
        <div className="max-w-md mx-auto flex items-center justify-between bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl pl-3 pr-2 py-2">
          <a href="/" className="flex items-center gap-2">
            <img src={appIcon} alt="" className="w-8 h-8 rounded-[10px]" />
            <span className="text-lg font-black tracking-tight">jogo</span>
            <span className="text-[10px] font-black tracking-[0.18em] text-lime-300/90 border border-lime-300/30 rounded-full px-2 py-0.5 ml-1">EVENTS</span>
          </a>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-white/90 text-[#07090A] text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
            <AppleLogo size={14} /> Get the app
          </a>
        </div>
      </header>

      <main className="relative flex-1 px-4 pt-7 pb-14">
        <div className="w-full max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
            className="text-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3.5 py-1">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-lime-300 to-emerald-500 text-[#07090A] text-xs font-black flex items-center justify-center">
                {ref ? ref.trim().charAt(0).toUpperCase() : <Sparkles size={13} />}
              </span>
              <span className="text-sm text-white/75">
                {ref ? <><span className="font-bold text-white">{ref}</span> sent you an invite</> : "You're on the list"}
              </span>
            </div>
          </motion.div>

          {/* The ticket */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.05 }}
            className="relative rounded-[28px] bg-[#111614] border border-white/10 shadow-[0_30px_80px_-24px_rgba(16,185,129,0.35)] mb-5"
          >
            {loading ? (
              <div className="animate-pulse">
                <div className="h-72 bg-white/[0.04] rounded-t-[28px]" />
                <div className="p-6"><div className="h-4 w-1/2 bg-white/[0.06] rounded mb-3" /><div className="h-4 w-2/3 bg-white/[0.06] rounded" /></div>
              </div>
            ) : event ? (
              <>
                {/* Poster */}
                <div className="relative h-72 overflow-hidden rounded-t-[28px] bg-gradient-to-br from-emerald-500 via-emerald-800 to-[#07090A]">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="absolute -right-6 -bottom-10 text-[180px] opacity-[0.12] select-none">🏆</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111614] via-[#111614]/20 to-black/20" />

                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {isCrewEvent && (
                        <span className="inline-flex items-center gap-1 bg-black/45 backdrop-blur-md border border-white/15 text-[11px] font-bold rounded-full px-2.5 py-1">
                          <Shield size={11} className="text-lime-300" /> {event.squadName || 'Crew event'}
                        </span>
                      )}
                      {hasTeams && (
                        <span className="inline-flex items-center gap-1 bg-black/45 backdrop-blur-md border border-white/15 text-[11px] font-bold rounded-full px-2.5 py-1">
                          <Users size={11} className="text-lime-300" /> {teams.length} teams
                        </span>
                      )}
                      {scarcity && (
                        <span className="inline-flex items-center gap-1 bg-red-500 text-[11px] font-black rounded-full px-2.5 py-1">
                          <Zap size={11} strokeWidth={3} /> {scarcity}
                        </span>
                      )}
                    </div>
                    {when && (
                      <div className="flex-shrink-0 w-16 rounded-2xl bg-white text-center py-1.5 shadow-xl">
                        <p className="text-[11px] font-black tracking-widest text-red-500">{when.month}</p>
                        <p className="text-[30px] font-black leading-none text-[#07090A] tracking-tight">{when.dayNum}</p>
                      </div>
                    )}
                  </div>

                  <div className="absolute left-5 right-5 bottom-4">
                    <h1 className="text-[32px] font-black leading-[1.02] tracking-tight drop-shadow-lg">
                      {event.title || 'Jogo event'}
                    </h1>
                    <p className="mt-2 text-lime-300 font-bold text-[15px]">
                      {when ? [when.weekday, when.time].filter(Boolean).join(' · ') : 'Date to be announced'}
                    </p>
                  </div>
                </div>

                <Perforation />

                {/* Stub */}
                <div className="px-5 pb-5 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-white/40">ENTRY</p>
                    <p className="text-xl font-black mt-0.5">{!needsTicket ? 'Free' : price > 0 ? `$${price}` : 'Ticket'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-white/40">GOING</p>
                    <p className="text-xl font-black mt-0.5">
                      {count}{capacity ? <span className="text-white/35 text-base">/{capacity}</span> : null}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-white/40">STARTS IN</p>
                    <p className="text-xl font-black mt-0.5 tabular-nums">
                      {countdown
                        ? (countdown.d > 0 ? `${countdown.d}d ${countdown.h}h` : `${countdown.h}h ${String(countdown.m).padStart(2, '0')}m`)
                        : unavailable ? '—' : 'Now'}
                    </p>
                  </div>
                  {capacity && (
                    <div className="col-span-3 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 1, delay: 0.4, ease: EASE }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
                    </div>
                  )}
                </div>

                {(faces.length > 0 || event.description) && (
                  <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                    {faces.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2.5 flex-shrink-0">
                          {faces.map((p, i) => (
                            p.photoURL ? (
                              <img key={p.userId || i} src={p.photoURL} alt="" className="w-9 h-9 rounded-full border-2 border-[#111614] object-cover" />
                            ) : (
                              <span key={p.userId || i} className="w-9 h-9 rounded-full border-2 border-[#111614] bg-lime-300/15 text-lime-300 text-xs font-black flex items-center justify-center">
                                {(p.displayName || '?').charAt(0).toUpperCase()}
                              </span>
                            )
                          ))}
                          {extraFaces > 0 && (
                            <span className="w-9 h-9 rounded-full border-2 border-[#111614] bg-white/10 text-white/80 text-[11px] font-black flex items-center justify-center">+{extraFaces}</span>
                          )}
                        </div>
                        <p className="text-[13px] text-white/60">
                          <span className="font-bold text-white">{(faces[0]?.displayName || 'People').split(' ')[0]}</span>
                          {count > 1 ? ` and ${count - 1} other${count - 1 === 1 ? '' : 's'} are going` : ' is going'}
                        </p>
                      </div>
                    )}
                    {event.description && (
                      <p className={`text-sm text-white/65 leading-relaxed whitespace-pre-line line-clamp-5 ${faces.length > 0 ? 'mt-4' : ''}`}>{event.description}</p>
                    )}
                  </div>
                )}

                {!result && !unavailable && !needsTicket && event.location && (
                  <div className="mx-5 mb-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-white/40 flex items-center justify-center"><MapPin size={16} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black tracking-[0.18em] text-white/40">LOCATION</p>
                      <div className="h-3 w-36 rounded bg-white/15 mt-1.5 blur-[2px]" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-300/90"><Lock size={12} /> Unlocks on join</span>
                  </div>
                )}

                {needsTicket && !unavailable && event.location && (
                  <div className="mx-5 mb-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-lime-300/10 text-lime-300 flex items-center justify-center flex-shrink-0"><MapPin size={16} /></div>
                    <p className="font-bold text-[15px] min-w-0">{event.location}</p>
                  </div>
                )}

                {unavailable && (
                  <p className="px-5 pb-5 text-sm text-white/55">
                    {event.status === 'cancelled' ? 'This event was cancelled.' : 'This event already happened.'} Find what’s next on Jogo.
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-16 px-7">
                <div className="text-5xl mb-3">🎟️</div>
                <h2 className="text-xl font-black mb-2">This event isn't available</h2>
                <p className="text-white/55 text-sm leading-relaxed">It may have been deleted. Open Jogo to find events near you.</p>
              </div>
            )}
          </motion.div>

          {/* Action */}
          {!loading && event && !unavailable && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2, ease: EASE }}>
              {needsTicket ? (
                <>
                  <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
                    className="ev-glow flex items-center justify-center gap-2.5 w-full bg-lime-400 hover:bg-lime-300 text-[#07090A] font-black text-[17px] py-4 rounded-2xl">
                    <Ticket size={20} strokeWidth={2.6} /> Get tickets in the app
                  </a>
                  <p className="text-center text-[12px] text-white/45 mt-3">Tickets are sold securely in the Jogo app.</p>
                </>
              ) : result ? (
                <YourTicket result={result} eventUrl={eventUrl} viewerName={viewer?.displayName} />
              ) : isFull ? (
                <div className="text-center bg-white/[0.05] border border-white/10 rounded-2xl py-4 font-black text-white/60">Sold out — every spot is taken</div>
              ) : (
                <>
                  <JoinEvent eventId={eventId} onResult={setResult} />
                  <div className="flex items-center justify-center gap-4 mt-3.5 text-[12px] text-white/50">
                    {['Free', 'No app needed', '30 seconds'].map((t) => (
                      <span key={t} className="inline-flex items-center gap-1"><Check size={13} strokeWidth={3} className="text-lime-300" />{t}</span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {!loading && (!event || unavailable) && (
            <div className="flex flex-col items-center gap-3">
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-white hover:bg-white/90 text-[#07090A] font-bold py-4 rounded-2xl">
                <AppleLogo />
                <span className="text-left leading-tight"><span className="block text-[10px] font-normal text-black/50">Find events near you on the</span><span className="block text-lg font-bold">App Store</span></span>
              </a>
              <a href={WEB_APP_URL} className="text-xs text-white/50 underline underline-offset-4">Continue on the web instead →</a>
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-2 text-[12px] text-white/40">
            <img src={appIcon} alt="" className="w-5 h-5 rounded-md opacity-80" />
            <span>Events, games & crews — all on Jogo</span>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-white/[0.06] px-4 py-5">
        <div className="max-w-md mx-auto flex flex-col items-center gap-2 text-xs text-white/40">
          <nav className="flex items-center gap-4">
            <a href="/policy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/support" className="hover:text-white">Support</a>
            <a href="mailto:jogo.tech@outlook.com" className="hover:text-white">Contact</a>
          </nav>
          <span>© {new Date().getFullYear()} Jogo · Made in New Jersey</span>
        </div>
      </footer>
    </div>
  );
}

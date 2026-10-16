// src/Invite.jsx — landing page for shared game links (jogous.io/invite/:gameId)
//
// Whoever taps a game invite link lands here. The goal: get them ON THE
// ROSTER in under a minute, right here in the browser — then into the app.
// Joining goes through the joinGameViaLink Cloud Function (jogo-APP
// functions/index.js), which mirrors the app's own join (team balancing,
// waitlist when full) and only then hands back the time and place.
//
// When/where stay locked until you've joined — showing them up front let
// people just show up off a forwarded link without ever being on the
// roster. The locked rows make that a reason to join instead of a gap.
//
// Design (2026-10-16): the web twin of the app's Matchday poster (Home's
// "next game" card) — black poster, a diagonal kit-colour band with the
// field photo in it, a huge Anton title, a facts strip (WHEN · WHERE ·
// SPOTS) whose WHEN/WHERE are locked until you join. Joining stamps the
// poster YOU'RE IN and unlocks the facts. Anton + Barlow, light page, ink
// buttons — same system as the app.

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
  MapPin, Check, Loader2, Lock, CalendarPlus, Navigation, Clock, ChevronDown, ArrowRight, Trophy, Crown, Shirt,
} from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';
import { APP_STORE_URL, PLAY_STORE_URL, PlayLogo, AppleLogo, StoreButtons, HeaderStoreLinks } from './appLinks';

const WEB_APP_URL = 'https://www.jogous.io/app';
const EASE = [0.22, 1, 0.36, 1];
const INK = '#0B0D10';
const SUB = '#5F6672';
const FAINT = '#9AA1AC';
// Anton: line-height >= 1.25 × font-size or the caps get clipped.
const ANTON = { fontFamily: "'Anton', Impact, sans-serif", fontWeight: 400, lineHeight: 1.25 };
const BARLOW = "'Barlow', system-ui, -apple-system, sans-serif";
// Same kit palette + hash the app uses for a crew's colour (MatchdayCards).
const KIT = ['#0E7A43', '#1D4ED8', '#C2410C', '#6D28D9', '#0F766E', '#BE123C', '#1F2937', '#A16207'];
const hashColor = (key) => {
  const k = String(key || '');
  let h = 0;
  for (let i = 0; i < k.length; i += 1) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return KIT[h % KIT.length];
};

const joinGameViaLink = httpsCallable(functions, 'joinGameViaLink');

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
  if (error?.code === 'functions/not-found') return 'This game no longer exists.';
  return 'Something went wrong joining. Please try again.';
}

function formatWhen(ms) {
  if (!ms) return null;
  const d = new Date(ms);
  return {
    day: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString(undefined, d.getMinutes() ? { hour: 'numeric', minute: '2-digit' } : { hour: 'numeric' }),
  };
}

function googleCalendarUrl(details, gameUrl) {
  const fmt = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = details.startMs;
  if (!start) return null;
  const end = details.endMs || start + 2 * 3600 * 1000;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `⚽ ${details.title || 'Pickup soccer'}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: [details.fieldName, details.address].filter(Boolean).join(', '),
    details: `Game on Jogo: ${gameUrl}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function mapsUrl(details) {
  if (details.latitude != null && details.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${details.latitude},${details.longitude}`;
  }
  const q = [details.fieldName, details.address].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

// Same per-format looks as the app's posters (MatchdayCards themeOf).
function themeOf(game) {
  const fmt = game?.miniTournament?.format;
  if (fmt === 'knockout') return { bg: '#120D02', band: '#A16207', label: 'MINI TOURNAMENT', labelColor: '#FACC15' };
  if (fmt === 'winnerStays') return { bg: '#140A28', band: '#5B21B6', label: 'KING OF THE FIELD', labelColor: '#FBBF24' };
  return { bg: INK, band: game?.squadId ? hashColor(game.squadId) : '#0E7A43', label: null, labelColor: '#C3C9D2' };
}

// Game modes (services/miniTournament.js FORMATS in the app). A game is a
// mode game once it has miniTournament.format + teams (set at creation).
const MODES = {
  knockout: {
    label: 'Mini tournament', Icon: Trophy,
    blurb: "Split into teams. Lose and you're out — last team standing wins.",
    rules: (n, size) => [`${n} teams of ${size}`, "Lose and you're out", 'Last team standing wins'],
  },
  winnerStays: {
    label: 'King of the field', Icon: Crown,
    blurb: 'Winner stays on, loser goes to the back. Most wins takes the crown.',
    rules: (n, size) => [`${n} teams of ${size}`, 'Winner stays on', 'Most wins takes the crown'],
  },
};
function modeOf(game) {
  const mt = game?.miniTournament;
  const m = mt && MODES[mt.format];
  if (!m || !Array.isArray(mt.teams) || !mt.teams.length) return null;
  return { ...m, format: mt.format, teams: mt.teams, size: mt.teamSize || 0 };
}
const seatsOf = (p) => 1 + (Number(p?.guests) || 0);

function Face({ p, size = 36, ring = '#FFFFFF', dark = false }) {
  const style = { width: size, height: size, borderColor: ring };
  return p?.photoURL ? (
    <img src={p.photoURL} alt="" className="rounded-full border-2 object-cover flex-shrink-0" style={{ ...style, background: '#2A2F38' }} />
  ) : (
    <span className="rounded-full border-2 flex items-center justify-center flex-shrink-0"
      style={{ ...style, background: dark ? '#2A2F38' : '#EEF0F3', color: dark ? '#E5E7EB' : INK, fontSize: size * 0.38, fontWeight: 800 }}>
      {(p?.displayName || '?').charAt(0).toUpperCase()}
    </span>
  );
}

// ── The poster ─────────────────────────────────────────────────────────
function GamePoster({ game, coverImage, playerCount, maxPlayers, spotsLeft, isFull, fillPct, host, others, unavailable, result, groups = null }) {
  const theme = themeOf(game);
  const mode = modeOf(game);
  const spotsK = mode ? 'TEAMS' : 'SPOTS';
  const spotsV = mode ? `${mode.teams.length} × ${mode.size}` : (maxPlayers != null ? `${playerCount}/${maxPlayers}` : playerCount);
  const joined = !!result;
  const queued = result && (result.status === 'queued' || result.status === 'already_queued');
  const details = result?.details || null;
  const when = details ? formatWhen(details.startMs) : null;
  const eyebrow = [
    game.squadName ? game.squadName.toUpperCase() : 'PICKUP',
    groups ? 'BIG NIGHT' : null,
    theme.label,
    // A mode name is long — skip the level so the crew + mode fit.
    !mode && game.skillLevel && game.skillLevel !== 'all' ? String(game.skillLevel).toUpperCase() : null,
  ].filter(Boolean).join('  ·  ');
  const tag = game.isLive ? { txt: 'LIVE NOW', bg: '#EF4444', fg: '#FFFFFF', pulse: true }
    : unavailable ? null
    : isFull ? { txt: 'FULL · WAITLIST OPEN', bg: '#FFFFFF', fg: INK }
    : spotsLeft === 1 ? { txt: 'LAST SPOT', bg: '#FACC15', fg: INK }
    : spotsLeft != null && spotsLeft <= 3 ? { txt: `ONLY ${spotsLeft} SPOTS LEFT`, bg: '#FACC15', fg: INK }
    : null;
  const faces = [host, ...others].filter(Boolean).slice(0, 6);
  const extra = Math.max(0, (host ? 1 : 0) + others.length - faces.length);

  const facts = [
    { k: 'WHEN', v: when ? `${when.day} · ${when.time}`.toUpperCase() : null, icon: Clock },
    { k: 'WHERE', v: details ? (details.fieldName || 'Field').toUpperCase() : null, icon: MapPin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative rounded-[28px] overflow-hidden text-white shadow-[0_30px_60px_-24px_rgba(11,13,16,0.55)]"
      style={{ background: theme.bg }}
    >
      {/* The diagonal band — kit colour with the field photo inside */}
      <div className="absolute pointer-events-none overflow-hidden"
        style={{ top: -80, right: -120, width: 270, height: 560, transform: 'rotate(24deg)', background: theme.band }}>
        {coverImage ? (
          <>
            <img src={coverImage} alt="" className="absolute object-cover poster-drift"
              style={{ left: -200, top: -40, width: 680, height: 640, transform: 'rotate(-24deg)', maxWidth: 'none' }} />
            <div className="absolute inset-0" style={{ background: theme.band, opacity: 0.35 }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 22px, transparent 22px 44px)' }} />
        )}
      </div>

      {/* The band fades into the poster lower down, so the faces and the
          facts strip always sit on solid colour. */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${theme.bg}00 0%, ${theme.bg}CC 38%, ${theme.bg} 62%)` }} />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11.5px] tracking-[0.18em] truncate flex items-center gap-1.5" style={{ fontFamily: BARLOW, fontWeight: 800, color: theme.labelColor }}>
            {mode ? <mode.Icon size={14} strokeWidth={2.6} className="flex-shrink-0" /> : null}
            <span className="truncate">{eyebrow}</span>
          </p>
          {tag && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-[10.5px] tracking-[0.08em] flex-shrink-0"
              style={{ background: tag.bg, color: tag.fg, fontFamily: BARLOW, fontWeight: 800 }}>
              {tag.pulse && <span className="relative flex w-1.5 h-1.5"><span className="invite-ping absolute inset-0 rounded-full bg-white" /><span className="relative w-1.5 h-1.5 rounded-full bg-white" /></span>}
              {tag.txt}
            </span>
          )}
        </div>

        <h1 className="mt-2 pr-14 uppercase break-words" style={{ ...ANTON, fontSize: 'clamp(40px, 11vw, 56px)', letterSpacing: '0.01em' }}>
          {game.title || 'Pickup Soccer'}
        </h1>

        {/* Who's in */}
        {faces.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {faces.map((p, i) => <Face key={p.userId || i} p={p} size={34} ring={theme.bg} dark />)}
              {extra > 0 && (
                <span className="w-[34px] h-[34px] rounded-full border-2 bg-white text-[11px] flex items-center justify-center"
                  style={{ borderColor: theme.bg, color: INK, fontWeight: 800 }}>+{extra}</span>
              )}
            </div>
            <p className="text-[13px] text-white/80 leading-snug" style={{ fontFamily: BARLOW, fontWeight: 600 }}>
              {host && <><span className="text-white" style={{ fontWeight: 800 }}>{(host.displayName || 'The host').split(' ')[0]}</span> is hosting</>}
              {host && others.length > 0 && ' · '}
              {others.length > 0 && `${others.length} going`}
            </p>
          </div>
        )}

        {/* Facts strip — WHEN / WHERE locked until you join, then SPOTS.
            Unlocked, it opens up so the real time and field fit in full. */}
        {details ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
            className="mt-5 grid grid-cols-[1fr_auto] gap-y-3 rounded-2xl bg-white/[0.08] py-3.5 px-4">
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.14em]" style={{ fontFamily: BARLOW, fontWeight: 800, color: '#8B93A1' }}>WHEN</p>
              <p className="text-[15px] mt-0.5" style={{ fontFamily: BARLOW, fontWeight: 800 }}>{when ? `${when.day} · ${when.time}`.toUpperCase() : 'TBA'}</p>
            </div>
            <div className="border-l border-white/[0.14] pl-4 ml-4">
              <p className="text-[10px] tracking-[0.14em]" style={{ fontFamily: BARLOW, fontWeight: 800, color: '#8B93A1' }}>{spotsK}</p>
              <p className="text-[15px] mt-0.5" style={{ fontFamily: BARLOW, fontWeight: 800 }}>{spotsV}</p>
            </div>
            <div className="col-span-2 border-t border-white/[0.14] pt-3 min-w-0">
              <p className="text-[10px] tracking-[0.14em]" style={{ fontFamily: BARLOW, fontWeight: 800, color: '#8B93A1' }}>WHERE</p>
              <p className="text-[15px] mt-0.5" style={{ fontFamily: BARLOW, fontWeight: 800 }}>{(details.fieldName || 'Field').toUpperCase()}</p>
            </div>
          </motion.div>
        ) : (
        <div className="mt-5 grid grid-cols-[1.35fr_1fr_0.8fr] rounded-2xl bg-white/[0.08] py-3 px-3.5">
          {facts.map((f, i) => (
            <div key={f.k} className={`min-w-0 ${i > 0 ? 'border-l border-white/[0.14] pl-3 ml-3' : ''}`}>
              <p className="text-[10px] tracking-[0.14em]" style={{ fontFamily: BARLOW, fontWeight: 800, color: '#8B93A1' }}>{f.k}</p>
              <AnimatePresence mode="wait">
                {f.v ? (
                  <motion.p key="v" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
                    className="text-[13.5px] mt-0.5 truncate" style={{ fontFamily: BARLOW, fontWeight: 800 }}>{f.v}</motion.p>
                ) : (
                  <motion.p key="l" exit={{ opacity: 0 }} className="mt-1 flex items-center gap-1.5 text-white/60">
                    <Lock size={12} strokeWidth={2.6} />
                    <span className="h-2.5 w-12 rounded bg-white/20 blur-[1.5px]" />
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
          <div className="min-w-0 border-l border-white/[0.14] pl-3 ml-3">
            <p className="text-[10px] tracking-[0.14em]" style={{ fontFamily: BARLOW, fontWeight: 800, color: '#8B93A1' }}>{spotsK}</p>
            <p className="text-[13.5px] mt-0.5" style={{ fontFamily: BARLOW, fontWeight: 800 }}>{spotsV}</p>
          </div>
        </div>
        )}

        {maxPlayers != null && !unavailable && (
          <div className="mt-3">
            <div className="h-1 rounded-full bg-white/15 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 1, delay: 0.35, ease: EASE }}
                className="h-full rounded-full bg-white" />
            </div>
            <p className="mt-1.5 text-[12px] text-white/60" style={{ fontFamily: BARLOW, fontWeight: 700 }}>
              {isFull ? 'Every spot is taken — the waitlist is open' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} open`}
              {groups ? ` · ${groups.count} groups of ${groups.size}, same field & time` : ''}
            </p>
          </div>
        )}
      </div>

      {/* YOU'RE IN stamp */}
      <AnimatePresence>
        {joined && (
          <motion.div
            initial={{ opacity: 0, scale: 1.8, rotate: -24 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
            className="absolute right-5 bottom-4 rounded-xl border-[3px] px-3 py-0.5 pointer-events-none"
            style={{ borderColor: queued ? '#FACC15' : '#4ADE80', color: queued ? '#FACC15' : '#4ADE80', background: 'rgba(11,13,16,0.35)' }}
          >
            <span style={{ ...ANTON, fontSize: 24, letterSpacing: '0.04em' }}>{queued ? `WAITLIST #${result.position || 1}` : "YOU'RE IN"}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Join flow ─────────────────────────────────────────────────────────
function JoinGame({ gameId, isFull, spotsLeft, onResult }) {
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
      const res = await joinGameViaLink({ gameId, displayName: displayName || undefined });
      onResult(res.data);
    } catch (e) {
      console.error('Error joining game:', e);
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
    if (mode === 'signup' && !name.trim()) { setAuthError('Enter your name so the group knows who’s coming.'); return; }
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

  const inputClass = 'w-full bg-[#F2F3F5] rounded-2xl px-4 py-3.5 text-[15.5px] outline-none ring-2 ring-transparent focus:ring-[#0B0D10] focus:bg-white transition-all placeholder:text-[#9AA1AC]';

  return (
    <div>
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePrimary}
        disabled={joining}
        className="relative overflow-hidden flex items-center justify-center gap-2.5 w-full h-[60px] rounded-full text-white disabled:opacity-80 shadow-[0_14px_30px_-12px_rgba(11,13,16,0.6)]"
        style={{ background: INK, fontFamily: BARLOW, fontWeight: 800, fontSize: 17.5 }}
      >
        <span className="invite-shine absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        {joining ? (
          <><Loader2 size={18} className="animate-spin" /> {isFull ? 'Joining the waitlist…' : 'Grabbing your spot…'}</>
        ) : (
          <>{isFull ? 'Join the waitlist' : 'Grab my spot'} <ArrowRight size={19} strokeWidth={2.6} /></>
        )}
      </motion.button>

      {!mode && !user && (
        <p className="text-center text-[12.5px] mt-2.5" style={{ color: SUB, fontFamily: BARLOW, fontWeight: 600 }}>
          {isFull ? "We'll notify you in the app when a spot opens." : spotsLeft != null && spotsLeft <= 3 ? 'Going fast — takes 30 seconds, no app needed.' : 'Free · No app needed · 30 seconds'}
        </p>
      )}
      {user && !mode && (
        <p className="text-center text-[12px] mt-2.5" style={{ color: FAINT, fontFamily: BARLOW, fontWeight: 600 }}>
          Joining as {user.displayName || user.email} ·{' '}
          <button type="button" onClick={() => signOut(auth)} className="underline underline-offset-2 hover:text-[#5F6672]">Not you?</button>
        </p>
      )}
      {joinError && <p className="text-center text-[13px] text-red-600 mt-2" style={{ fontWeight: 700 }}>{joinError}</p>}

      <AnimatePresence>
        {mode && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[24px] p-4 mt-3 shadow-[0_10px_30px_-14px_rgba(11,18,32,0.25)]">
              {mode === 'reset' ? (
                <p className="text-[14px] mb-3" style={{ color: SUB, fontWeight: 600 }}>Enter your email and we’ll send you a reset link.</p>
              ) : (
                <div className="flex bg-[#F2F3F5] rounded-full p-1 mb-3">
                  {[['signup', "I'm new"], ['login', 'I have an account']].map(([m, label]) => (
                    <button key={m} type="button" onClick={() => switchMode(m)}
                      className={`flex-1 text-[14px] py-2 rounded-full transition-all ${mode === m ? 'bg-[#0B0D10] text-white' : 'text-[#5F6672]'}`}
                      style={{ fontWeight: 800 }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {mode === 'signup' && (
                  <input type="text" autoComplete="given-name" placeholder="First name" value={name}
                    onChange={(e) => setName(e.target.value)} className={inputClass} style={{ fontWeight: 600 }} />
                )}
                <input type="email" autoComplete="email" placeholder="Email" value={email}
                  onChange={(e) => setEmail(e.target.value)} className={inputClass} style={{ fontWeight: 600 }} />
                {mode !== 'reset' && (
                  <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signup' ? 'Create a password' : 'Password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} className={inputClass} style={{ fontWeight: 600 }} />
                )}
              </div>
              {mode === 'signup' && (
                <p className="text-[12px] mt-2 ml-1" style={{ color: FAINT, fontWeight: 600 }}>8+ characters, with an uppercase letter and a number.</p>
              )}

              {authError && <p className="text-[13px] text-red-600 mt-2 ml-1" style={{ fontWeight: 700 }}>{authError}</p>}
              {resetSent && <p className="text-[13px] text-emerald-700 mt-2 ml-1" style={{ fontWeight: 700 }}>Check your inbox for a reset link.</p>}

              <button type="submit" disabled={submitting}
                className="w-full h-[52px] rounded-full text-white mt-3 disabled:opacity-70 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: INK, fontWeight: 800, fontSize: 16 }}>
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {mode === 'signup' ? (isFull ? 'Create account & join waitlist' : 'Create account & join')
                  : mode === 'login' ? (isFull ? 'Log in & join waitlist' : 'Log in & join')
                  : 'Send reset link'}
              </button>

              <div className="flex justify-between text-[12px] mt-2.5 px-1" style={{ color: FAINT, fontWeight: 600 }}>
                <span>Same account as the Jogo app.</span>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('reset')} className="underline underline-offset-2 hover:text-[#5F6672]">Forgot password?</button>
                )}
                {mode === 'reset' && (
                  <button type="button" onClick={() => switchMode('login')} className="underline underline-offset-2 hover:text-[#5F6672]">Back to log in</button>
                )}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// After joining: what to do next (the poster above already shows the
// stamp and the unlocked time + place).
function JoinedActions({ result, gameUrl, myTeam = null }) {
  const queued = result.status === 'queued' || result.status === 'already_queued';
  const details = result.details;
  const cal = details ? googleCalendarUrl(details, gameUrl) : null;
  const maps = details ? mapsUrl(details) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
      <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_-14px_rgba(11,18,32,0.25)]">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: queued ? '#FACC15' : '#4ADE80' }}>
            {queued ? <Clock size={21} strokeWidth={2.6} color={INK} /> : <Check size={23} strokeWidth={3.2} color={INK} />}
          </span>
          <div className="min-w-0">
            <p className="uppercase flex items-center gap-2" style={{ ...ANTON, fontSize: 24, color: INK }}>
              {queued ? `#${result.position || 1} on the waitlist` : myTeam ? <>You're on <span style={{ color: myTeam.color === '#0F1115' ? INK : myTeam.color }}>{myTeam.name}</span></> : result.group ? `You're in group ${result.group.index}` : 'See you on the field'}
            </p>
            <p className="text-[13.5px] -mt-0.5" style={{ color: SUB, fontWeight: 600 }}>
              {queued ? "We'll notify you in the app the moment a spot opens." : myTeam ? 'Your spot is saved. Want to play with friends? Switch teams in the app.' : result.group ? `Of ${result.group.total || 'the'} groups — same field, same time. Your spot is saved.` : 'Your spot is saved.'}
            </p>
          </div>
        </div>
        {details && (details.fieldName || details.address) && (
          <div className="mt-4 rounded-2xl bg-[#F2F3F5] px-4 py-3">
            <p className="text-[10.5px] tracking-[0.14em]" style={{ color: FAINT, fontWeight: 800 }}>THE FIELD</p>
            <p className="text-[15.5px]" style={{ color: INK, fontWeight: 800 }}>{details.fieldName || 'Field'}</p>
            {details.address && <p className="text-[13px]" style={{ color: SUB, fontWeight: 600 }}>{details.address}</p>}
          </div>
        )}
        {(maps || cal) && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {maps && (
              <a href={maps} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 rounded-full border-2 text-[14px] hover:bg-[#F2F3F5] transition-colors"
                style={{ borderColor: INK, color: INK, fontWeight: 800 }}>
                <Navigation size={15} /> Directions
              </a>
            )}
            {cal && (
              <a href={cal} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 rounded-full border-2 text-[14px] hover:bg-[#F2F3F5] transition-colors"
                style={{ borderColor: INK, color: INK, fontWeight: 800 }}>
                <CalendarPlus size={15} /> Calendar
              </a>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[24px] p-5 text-white relative overflow-hidden" style={{ background: INK }}>
        <div className="absolute pointer-events-none" style={{ top: -60, right: -90, width: 200, height: 360, transform: 'rotate(24deg)', background: '#0E7A43', opacity: 0.9 }} />
        <div className="relative">
          <p className="uppercase" style={{ ...ANTON, fontSize: 26 }}>The game lives in the app</p>
          <p className="text-[13.5px] text-white/75 mt-0.5 mb-4" style={{ fontWeight: 600 }}>Team chat, kickoff reminders and changes — log in with the same email.</p>
          <div className="grid grid-cols-2 gap-2">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white rounded-full h-12 hover:opacity-90 transition-opacity" style={{ color: INK }}>
              <AppleLogo size={17} /><span className="text-[14px]" style={{ fontWeight: 800 }}>App Store</span>
            </a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white rounded-full h-12 hover:opacity-90 transition-opacity" style={{ color: INK }}>
              <PlayLogo size={15} /><span className="text-[14px]" style={{ fontWeight: 800 }}>Google Play</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// What the mode is, in plain words, in the mode's own colours.
function FormatCard({ game, mode }) {
  const theme = themeOf(game);
  return (
    <section className="mt-8">
      <h2 className="uppercase mb-2 ml-1" style={{ ...ANTON, fontSize: 24, color: INK }}>The format</h2>
      <div className="rounded-[24px] p-5 text-white relative overflow-hidden" style={{ background: theme.bg }}>
        <div className="absolute pointer-events-none" style={{ top: -70, right: -100, width: 200, height: 360, transform: 'rotate(24deg)', background: theme.band, opacity: 0.85 }} />
        <div className="relative">
          <span className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: theme.labelColor }}>
            <mode.Icon size={22} strokeWidth={2.4} color={theme.bg} />
          </span>
          <p className="uppercase mt-3" style={{ ...ANTON, fontSize: 30 }}>{mode.label}</p>
          <p className="text-[14.5px] text-white/80 pr-14" style={{ fontWeight: 600 }}>{mode.blurb}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {mode.rules(mode.teams.length, mode.size).map((r) => (
              <span key={r} className="h-8 px-3 rounded-full bg-white/10 inline-flex items-center text-[13px]" style={{ fontWeight: 800 }}>{r}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// The teams: colour, who's on it, how full. Joining puts you on the team
// with the most room (joinGameViaLink), so that one is marked.
function TeamsList({ game, mode, viewerUid, joined }) {
  const players = game.players || [];
  const rows = mode.teams.map((t) => {
    const on = players.filter((p) => p.team === t.id);
    const seats = on.reduce((n, p) => n + seatsOf(p), 0);
    return { ...t, on, seats, open: Math.max(0, mode.size - seats), mine: !!viewerUid && on.some((p) => p.userId === viewerUid) };
  });
  const mostRoom = joined ? null : rows.reduce((best, r) => (r.open > (best?.open ?? 0) ? r : best), null);
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between mb-2 mx-1">
        <h2 className="uppercase" style={{ ...ANTON, fontSize: 24, color: INK }}>The teams</h2>
        {!joined && <p className="text-[12.5px]" style={{ color: SUB, fontWeight: 700 }}>Switch teams in the app</p>}
      </div>
      <div className="bg-white rounded-[22px] divide-y divide-[#EEF0F3] shadow-[0_6px_20px_-12px_rgba(11,18,32,0.2)]">
        {rows.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.color }}>
              <Shirt size={18} color="#FFFFFF" strokeWidth={2.4} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] uppercase tracking-[0.04em]" style={{ fontWeight: 800 }}>{t.name}</p>
                {t.mine && <span className="text-[10px] px-2 h-5 rounded-full inline-flex items-center text-white" style={{ background: INK, fontWeight: 800 }}>YOU</span>}
                {mostRoom && mostRoom.id === t.id && t.open > 0 && (
                  <span className="text-[10px] px-2 h-5 rounded-full inline-flex items-center" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 800 }}>MOST ROOM</span>
                )}
              </div>
              <div className="h-1 rounded-full bg-[#EEF0F3] mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${mode.size ? Math.min(100, (t.seats / mode.size) * 100) : 0}%`, background: t.color }} />
              </div>
            </div>
            <div className="flex -space-x-2 flex-shrink-0">
              {t.on.slice(0, 3).map((p, i) => <Face key={p.userId || i} p={p} size={28} />)}
            </div>
            <p className="text-[13.5px] w-10 text-right flex-shrink-0" style={{ fontWeight: 800, color: t.open ? INK : FAINT }}>{t.seats}/{mode.size}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function About({ text }) {
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 2);
  }, [text]);
  return (
    <section className="mt-8">
      <h2 className="uppercase mb-2 ml-1" style={{ ...ANTON, fontSize: 24, color: INK }}>About</h2>
      <div className="bg-white rounded-[22px] p-5 shadow-[0_6px_20px_-12px_rgba(11,18,32,0.2)]">
        <p ref={ref} className={`text-[15.5px] leading-[1.6] whitespace-pre-line ${open ? '' : 'line-clamp-5'}`} style={{ color: INK, fontWeight: 600 }}>{text}</p>
        {(clamped || open) && (
          <button type="button" onClick={() => setOpen((v) => !v)} className="mt-2 inline-flex items-center gap-1 text-[14.5px]" style={{ color: INK, fontWeight: 800 }}>
            {open ? 'See less' : 'See more'} <ChevronDown size={16} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        )}
      </div>
    </section>
  );
}

export default function Invite() {
  useMatchdayFonts();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [fieldPhoto, setFieldPhoto] = useState(null);
  const [viewerUid, setViewerUid] = useState(undefined);
  const [result, setResult] = useState(null);
  const autoCheckedRef = useRef(null);

  // Live game doc (games are publicly readable) — the roster and spots
  // update in real time, including your own join.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!gameId) { setLoading(false); return undefined; }
    return onSnapshot(doc(db, 'games', gameId), (snap) => {
      setGame(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }, (e) => {
      console.error('Error loading invited game:', e);
      setGame(null);
      setLoading(false);
    });
  }, [gameId]);

  // A Big Night split is one game doc per group (shared groupSeriesId) —
  // the link points at one group, but the page shows the whole night:
  // every group's players and spots, live.
  const [siblings, setSiblings] = useState([]);
  useEffect(() => {
    if (!game?.groupSeriesId) { setSiblings([]); return undefined; }
    return onSnapshot(query(collection(db, 'games'), where('groupSeriesId', '==', game.groupSeriesId)), (snap) => {
      setSiblings(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((g) => g.status !== 'cancelled'));
    }, () => setSiblings([]));
  }, [game?.groupSeriesId]);

  // Real field photos live in `field-photos`, keyed by fieldId.
  useEffect(() => {
    let cancelled = false;
    if (!game?.fieldId) return undefined;
    (async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'field-photos'),
          where('fieldId', '==', game.fieldId),
          orderBy('timestamp', 'desc'),
          limit(1)
        ));
        if (!cancelled) setFieldPhoto(snap.empty ? null : snap.docs[0].data().imageUrl || null);
      } catch (e) {
        console.error('Error loading field photo:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [game?.fieldId]);

  useEffect(() => onAuthStateChanged(auth, (u) => setViewerUid(u?.uid ?? null)), []);

  // A signed-in visitor who's already on the roster/waitlist (e.g. came
  // back to the link) gets their unlocked details without tapping anything
  // — joinGameViaLink is idempotent for someone already in.
  const groupDocs = siblings.length > 1 ? siblings : (game ? [game] : []);
  const viewerOnRoster = !!viewerUid && groupDocs.some((g) => (
    (g.players || []).some((p) => p.userId === viewerUid) ||
    (g.queue || []).some((q) => q.userId === viewerUid)
  ));
  useEffect(() => {
    if (!viewerOnRoster || result || autoCheckedRef.current === viewerUid) return;
    autoCheckedRef.current = viewerUid;
    joinGameViaLink({ gameId }).then((res) => setResult(res.data)).catch(() => {});
  }, [viewerOnRoster, viewerUid, gameId, result]);
  // Signing out ("Not you?") hides the previous person's unlocked details.
  useEffect(() => {
    if (viewerUid === null) { setResult(null); autoCheckedRef.current = null; }
  }, [viewerUid]);

  useEffect(() => {
    if (game?.title) document.title = `${game.title} · Join on Jogo`;
  }, [game?.title]);

  // Whole night for a split (players deduped — the host is in every group).
  const groups = siblings.length > 1 ? { count: siblings.length, size: game?.maxPlayers ?? null } : null;
  const players = (() => {
    if (!groups) return game?.players || [];
    const seen = new Set();
    return siblings.flatMap((g) => g.players || []).filter((p) => {
      if (!p.userId) return true;
      if (seen.has(p.userId)) return false;
      seen.add(p.userId);
      return true;
    });
  })();
  const playerCount = players.reduce((t, p) => t + 1 + (p.guests || 0), 0);
  const maxPlayers = groups
    ? siblings.reduce((t, g) => t + (g.maxPlayers || 0), 0) || null
    : (game?.maxPlayers ?? null);
  const spotsLeft = maxPlayers != null ? Math.max(0, maxPlayers - playerCount) : null;
  const isFull = spotsLeft === 0;
  const fillPct = maxPlayers ? Math.min(100, Math.round((playerCount / maxPlayers) * 100)) : 0;
  const coverImage = game?.imageUrl || fieldPhoto || game?.field?.imageUrl || null;
  const host = players.find((p) => p.isCreator) || null;
  const others = players.filter((p) => !p.isCreator);
  const startMs = game?.startDateTime?.toMillis ? game.startDateTime.toMillis() : null;
  const isPast = !!startMs && startMs < Date.now() && !game?.isLive;
  const unavailable = !game || game.status === 'cancelled' || isPast;
  const gameUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
  const mode = modeOf(game);
  const myTeamId = mode && viewerUid ? players.find((p) => p.userId === viewerUid)?.team : null;
  const myTeam = myTeamId ? mode.teams.find((t) => t.id === myTeamId) || null : null;

  return (
    <div className="min-h-screen bg-[#F2F3F5] antialiased flex flex-col overflow-x-hidden" style={{ fontFamily: BARLOW, color: INK }}>
      <style>{`
        @keyframes invite-shine { 0% { transform: translateX(0); } 60%, 100% { transform: translateX(450%); } }
        .invite-shine { animation: invite-shine 3.4s ease-in-out infinite; }
        @keyframes invite-ping { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.6); opacity: 0; } }
        .invite-ping { animation: invite-ping 1.6s cubic-bezier(0,0,.2,1) infinite; }
        @keyframes poster-drift { 0%, 100% { translate: 0 0; } 50% { translate: -18px 10px; } }
        .poster-drift { animation: poster-drift 16s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .invite-shine, .invite-ping, .poster-drift { animation: none; } }
      `}</style>

      <header className="px-4 pt-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={appIcon} alt="" className="w-9 h-9 rounded-[11px] shadow-sm" />
            <span className="uppercase" style={{ ...ANTON, fontSize: 22, letterSpacing: '0.04em' }}>Jogo</span>
          </a>
          <HeaderStoreLinks />
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-14">
        <div className="w-full max-w-md mx-auto">
          {/* Who invited you */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
            className="flex items-center gap-2.5 mb-4 ml-1">
            {ref ? (
              <>
                <span className="w-8 h-8 rounded-full text-white text-[13px] flex items-center justify-center" style={{ background: INK, fontWeight: 800 }}>
                  {ref.trim().charAt(0).toUpperCase()}
                </span>
                <p className="text-[15px]" style={{ color: SUB, fontWeight: 600 }}><span style={{ color: INK, fontWeight: 800 }}>{ref}</span> invited you to play</p>
              </>
            ) : (
              <p className="text-[15px]" style={{ color: SUB, fontWeight: 700 }}>You're invited to play</p>
            )}
          </motion.div>

          {loading ? (
            <div className="rounded-[28px] h-[340px] bg-[#0B0D10] animate-pulse opacity-90" />
          ) : game ? (
            <GamePoster game={game} coverImage={coverImage} playerCount={playerCount} maxPlayers={maxPlayers}
              spotsLeft={spotsLeft} isFull={isFull} fillPct={fillPct} host={host} others={others}
              unavailable={unavailable} result={result} groups={groups} />
          ) : (
            <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_10px_30px_-14px_rgba(11,18,32,0.25)]">
              <p className="uppercase" style={{ ...ANTON, fontSize: 30 }}>Game not found</p>
              <p className="text-[14.5px] mt-1" style={{ color: SUB, fontWeight: 600 }}>It may have been deleted. Open Jogo to find games near you.</p>
            </div>
          )}

          {/* Action */}
          {!loading && game && !unavailable && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: EASE }} className="mt-5">
              {result ? (
                <JoinedActions result={result} gameUrl={gameUrl} myTeam={myTeam} />
              ) : (
                <JoinGame gameId={gameId} isFull={isFull} spotsLeft={spotsLeft} onResult={setResult} />
              )}
            </motion.div>
          )}

          {!loading && game && unavailable && (
            <div className="mt-5 rounded-[24px] bg-white p-5 shadow-[0_10px_30px_-14px_rgba(11,18,32,0.25)]">
              <p className="uppercase" style={{ ...ANTON, fontSize: 24 }}>{game.status === 'cancelled' ? 'This game was cancelled' : 'This one already happened'}</p>
              <p className="text-[14px] mb-4" style={{ color: SUB, fontWeight: 600 }}>There are games near you every week. Find your next one on Jogo.</p>
              <StoreButtons label="" />
              <a href={WEB_APP_URL} className="block text-center text-[13px] mt-3 underline underline-offset-4" style={{ color: SUB, fontWeight: 600 }}>Continue on the web instead →</a>
            </div>
          )}

          {!loading && !game && (
            <div className="mt-5">
              <StoreButtons label="Find games near you" />
            </div>
          )}

          {!loading && game && mode && !unavailable ? (
            <>
              <FormatCard game={game} mode={mode} />
              <TeamsList game={game} mode={mode} viewerUid={viewerUid} joined={!!result} />
            </>
          ) : null}

          {!loading && game?.description ? <About text={game.description} /> : null}

          {/* How it works — only before joining */}
          {!loading && game && !unavailable && !result && (
            <section className="mt-8">
              <h2 className="uppercase mb-2 ml-1" style={{ ...ANTON, fontSize: 24 }}>How it works</h2>
              <div className="bg-white rounded-[22px] divide-y divide-[#EEF0F3] shadow-[0_6px_20px_-12px_rgba(11,18,32,0.2)]">
                {[
                  ['01', 'Grab your spot', 'Free. Takes 30 seconds, right here.'],
                  ['02', 'Time & place unlock', 'You get the field, kickoff and directions.'],
                  ['03', 'Show up and play', 'Chat with the group and get reminders in the app.'],
                ].map(([n, t, d]) => (
                  <div key={n} className="flex items-center gap-4 px-5 py-4">
                    <span style={{ ...ANTON, fontSize: 22, color: '#C4C8CF', width: 28 }}>{n}</span>
                    <div>
                      <p className="text-[15.5px]" style={{ fontWeight: 800 }}>{t}</p>
                      <p className="text-[13.5px]" style={{ color: SUB, fontWeight: 600 }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <StoreButtons className="mt-6" label="Or get the Jogo app" />
            </section>
          )}

          {/* Who we are + the same figures the homepage publishes */}
          <div className="mt-10 rounded-[24px] text-white relative overflow-hidden" style={{ background: INK }}>
            <div className="absolute pointer-events-none" style={{ top: -70, right: -100, width: 210, height: 380, transform: 'rotate(24deg)', background: '#0E7A43' }} />
            <div className="relative px-5 pt-5 pb-4">
              <p className="text-[11px] tracking-[0.18em]" style={{ fontWeight: 800, color: '#8B93A1' }}>WHO MAKES JOGO</p>
              <p className="uppercase mt-1" style={{ ...ANTON, fontSize: 32 }}>Built by soccer players</p>
              <p className="text-[14px] text-white/75 -mt-0.5 pr-16" style={{ fontWeight: 600 }}>
                We got tired of group chats that never turn into games. So we built the app we wanted.
              </p>
            </div>
            <div className="relative grid grid-cols-2 border-t border-white/10">
              {[['4,000+', 'PLAYERS'], ['2,000+', 'GAMES PLAYED']].map(([v, l], i) => (
                <div key={l} className={`text-center py-3.5 ${i > 0 ? 'border-l border-white/10' : ''}`}>
                  <p style={{ ...ANTON, fontSize: 24 }}>{v}</p>
                  <p className="text-[10.5px] tracking-[0.14em] text-white/60" style={{ fontWeight: 800 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-4 py-6">
        <div className="max-w-md mx-auto flex flex-col items-center gap-2 text-[12.5px]" style={{ color: SUB, fontWeight: 600 }}>
          <nav className="flex items-center gap-5">
            <a href="/policy" className="hover:text-[#0B0D10]">Privacy</a>
            <a href="/terms" className="hover:text-[#0B0D10]">Terms</a>
            <a href="/support" className="hover:text-[#0B0D10]">Support</a>
            <a href="mailto:jogo.tech@outlook.com" className="hover:text-[#0B0D10]">Contact</a>
          </nav>
          <span>© {new Date().getFullYear()} Jogo · Built by soccer players in New Jersey</span>
        </div>
      </footer>
    </div>
  );
}

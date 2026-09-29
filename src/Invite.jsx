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
  Users, MapPin, Check, Loader2, Lock, CalendarPlus, Navigation, Clock, Zap, Trophy,
} from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';
import { APP_STORE_URL, PLAY_STORE_URL, APP_URL, PlayLogo, StoreButtons, HeaderStoreLinks } from './appLinks';

const WEB_APP_URL = 'https://www.jogous.io/app';
const EASE = [0.22, 1, 0.36, 1];

const joinGameViaLink = httpsCallable(functions, 'joinGameViaLink');

function AppleLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// Top-down pitch, drawn — used whenever the field has no photo, so a game
// never looks like an empty gray box. Mowing stripes + white lines.
function PitchArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pitchGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16a34a" />
          <stop offset="1" stopColor="#0f7a37" />
        </linearGradient>
        <radialGradient id="pitchGlow" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="200" fill="url(#pitchGrad)" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i * 40} y="0" width="20" height="200" fill="#ffffff" opacity="0.045" />
      ))}
      <g fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2">
        <rect x="16" y="14" width="368" height="172" rx="2" />
        <line x1="200" y1="14" x2="200" y2="186" />
        <circle cx="200" cy="100" r="30" />
        <rect x="16" y="58" width="44" height="84" />
        <rect x="340" y="58" width="44" height="84" />
        <rect x="16" y="80" width="16" height="40" />
        <rect x="368" y="80" width="16" height="40" />
      </g>
      <circle cx="200" cy="100" r="3" fill="#ffffff" fillOpacity="0.7" />
      <rect width="400" height="200" fill="url(#pitchGlow)" />
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
  if (error?.code === 'functions/not-found') return 'This game no longer exists.';
  return 'Something went wrong joining. Please try again.';
}

function formatWhen(ms) {
  if (!ms) return null;
  const d = new Date(ms);
  const day = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return { day, time };
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

// ── Join flow ─────────────────────────────────────────────────────────
function JoinGame({ gameId, isFull, onResult }) {
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

  const inputClass = 'w-full bg-[#F7F8F9] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-emerald-400 focus:bg-white transition-colors';

  return (
    <div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePrimary}
        disabled={joining}
        className="relative overflow-hidden flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[17px] py-4 rounded-2xl shadow-lg shadow-emerald-900/25 disabled:opacity-80"
      >
        <span className="invite-shine absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        {joining ? (
          <><Loader2 size={18} className="animate-spin" /> {isFull ? 'Joining waitlist…' : 'Grabbing your spot…'}</>
        ) : isFull ? 'Join the waitlist' : 'Grab my spot'}
      </motion.button>

      {user && !mode && (
        <p className="text-center text-[11px] text-[#9CA3AF] mt-2">
          Joining as {user.displayName || user.email} ·{' '}
          <button type="button" onClick={() => signOut(auth)} className="underline underline-offset-2 hover:text-[#6b7280]">
            Not you?
          </button>
        </p>
      )}
      {joinError && <p className="text-center text-xs text-red-500 mt-2">{joinError}</p>}

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
            <div className="bg-white border border-[#DDE1E5] rounded-2xl p-4 mt-3 shadow-sm">
              {mode === 'reset' ? (
                <p className="text-sm text-[#6b7280] mb-3">Enter your email and we’ll send you a reset link.</p>
              ) : (
                <div className="flex bg-[#F1F2F4] rounded-xl p-1 mb-3">
                  {[['signup', "I'm new"], ['login', 'I have an account']].map(([m, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => switchMode(m)}
                      className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${mode === m ? 'bg-white shadow-sm text-[#111111]' : 'text-[#6b7280]'}`}
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
                <p className="text-[11px] text-[#9CA3AF] mt-2">8+ characters, with an uppercase letter and a number.</p>
              )}

              {authError && <p className="text-xs text-red-500 mt-2">{authError}</p>}
              {resetSent && <p className="text-xs text-emerald-700 mt-2">Check your inbox for a reset link.</p>}

              <button type="submit" disabled={submitting}
                className="w-full bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold py-3 rounded-xl mt-3 disabled:opacity-70 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {mode === 'signup' ? (isFull ? 'Create account & join waitlist' : 'Create account & join')
                  : mode === 'login' ? (isFull ? 'Log in & join waitlist' : 'Log in & join')
                  : 'Send reset link'}
              </button>

              <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-2">
                <span>Same account as the Jogo app.</span>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('reset')} className="underline underline-offset-2 hover:text-[#6b7280]">Forgot password?</button>
                )}
                {mode === 'reset' && (
                  <button type="button" onClick={() => switchMode('login')} className="underline underline-offset-2 hover:text-[#6b7280]">Back to log in</button>
                )}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// What you get once you're in: the unlocked time + place, and next steps.
function JoinedCard({ result, gameUrl }) {
  const queued = result.status === 'queued' || result.status === 'already_queued';
  const details = result.details;
  const when = details ? formatWhen(details.startMs) : null;
  const cal = details ? googleCalendarUrl(details, gameUrl) : null;
  const maps = details ? mapsUrl(details) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="bg-white border border-emerald-200 rounded-3xl overflow-hidden shadow-[0_16px_40px_-16px_rgba(6,78,59,0.35)]"
    >
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-6 py-5 flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
          className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center flex-shrink-0"
        >
          {queued ? <Clock size={24} strokeWidth={2.6} /> : <Check size={26} strokeWidth={3.2} />}
        </motion.div>
        <div>
          <p className="font-black text-xl leading-tight">
            {queued ? `You're #${result.position || 1} on the waitlist` : "You're in! ⚽"}
          </p>
          <p className="text-white/80 text-sm">
            {queued ? "We'll notify you in the app the moment a spot opens." : 'Your spot is saved. See you on the field.'}
          </p>
        </div>
      </div>

      {details && (
        <div className="px-6 py-5">
          {when && (
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0"><Clock size={17} /></div>
              <div>
                <p className="font-bold text-[15px]">{when.day}</p>
                <p className="text-sm text-[#6b7280]">{when.time}</p>
              </div>
            </div>
          )}
          {(details.fieldName || details.address) && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0"><MapPin size={17} /></div>
              <div className="min-w-0">
                <p className="font-bold text-[15px]">{details.fieldName || 'Field'}</p>
                {details.address && <p className="text-sm text-[#6b7280]">{details.address}</p>}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-5">
            {maps && (
              <a href={maps} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#F4F5F7] hover:bg-[#ECEEF1] text-[#111111] text-sm font-bold py-3 rounded-xl transition-colors">
                <Navigation size={15} /> Directions
              </a>
            )}
            {cal && (
              <a href={cal} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#F4F5F7] hover:bg-[#ECEEF1] text-[#111111] text-sm font-bold py-3 rounded-xl transition-colors">
                <CalendarPlus size={15} /> Add to calendar
              </a>
            )}
          </div>
        </div>
      )}

      <div className="px-6 pb-6 pt-1">
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold py-3.5 rounded-2xl">
          <AppleLogo size={20} />
          <span className="text-left leading-tight">
            <span className="block text-[10px] font-normal text-white/60">Get game updates & chat on the</span>
            <span className="block text-base font-bold">App Store</span>
          </span>
        </a>
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold py-3.5 rounded-2xl mt-2.5">
          <PlayLogo size={18} />
          <span className="text-left leading-tight">
            <span className="block text-[10px] font-normal text-white/60">Or get it on</span>
            <span className="block text-base font-bold">Google Play</span>
          </span>
        </a>
        <p className="text-center text-[11px] text-[#9CA3AF] mt-2">Log in with the same email to see this game in the app.</p>
      </div>
    </motion.div>
  );
}

export default function Invite() {
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
  const viewerOnRoster = !!viewerUid && !!game && (
    (game.players || []).some((p) => p.userId === viewerUid) ||
    (game.queue || []).some((q) => q.userId === viewerUid)
  );
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

  const players = game?.players || [];
  const playerCount = players.reduce((t, p) => t + 1 + (p.guests || 0), 0);
  const maxPlayers = game?.maxPlayers ?? null;
  const spotsLeft = maxPlayers != null ? Math.max(0, maxPlayers - playerCount) : null;
  const isFull = spotsLeft === 0;
  const fillPct = maxPlayers ? Math.min(100, Math.round((playerCount / maxPlayers) * 100)) : 0;
  const coverImage = game?.imageUrl || fieldPhoto || game?.field?.imageUrl || null;
  const host = players.find((p) => p.isCreator) || null;
  const others = players.filter((p) => !p.isCreator);
  const faces = others.slice(0, 5);
  const extraFaces = Math.max(0, others.length - faces.length);
  const startMs = game?.startDateTime?.toMillis ? game.startDateTime.toMillis() : null;
  const isPast = !!startMs && startMs < Date.now() && !game?.isLive;
  const unavailable = !game || game.status === 'cancelled' || isPast;
  const typeLabel = [
    game?.gameType === 'pickup' ? 'Pickup' : game?.gameType,
    game?.skillLevel && game.skillLevel !== 'all' ? game.skillLevel : null,
  ].filter(Boolean).map((s) => String(s).charAt(0).toUpperCase() + String(s).slice(1));
  const gameUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';

  const urgency = game?.isLive ? { text: 'Happening now', tone: 'red' }
    : isFull ? { text: 'Full · waitlist open', tone: 'gray' }
    : spotsLeft === 1 ? { text: 'Last spot!', tone: 'amber' }
    : spotsLeft != null && spotsLeft <= 3 ? { text: `Only ${spotsLeft} spots left`, tone: 'amber' }
    : null;

  return (
    <div className="min-h-screen bg-[#EDEEF1] text-[#111111] font-sans antialiased flex flex-col relative overflow-x-hidden">
      <style>{`
        @keyframes invite-drift {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(30px,-24px) scale(1.12); }
          66%  { transform: translate(-24px,20px) scale(0.92); }
          100% { transform: translate(0,0) scale(1); }
        }
        .invite-blob { animation: invite-drift 11s ease-in-out infinite; }
        .invite-blob-2 { animation-delay: -3.5s; }
        @keyframes invite-shine { 0% { transform: translateX(0); } 60%, 100% { transform: translateX(450%); } }
        .invite-shine { animation: invite-shine 3.2s ease-in-out infinite; }
        @keyframes invite-ping { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.4); opacity: 0; } }
        .invite-ping { animation: invite-ping 1.8s cubic-bezier(0,0,.2,1) infinite; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{ backgroundImage: 'radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      <div className="absolute inset-x-0 top-0 h-[800px] pointer-events-none overflow-hidden">
        <div className="invite-blob absolute top-[-15%] left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-emerald-300/25 rounded-full filter blur-[120px]" />
        <div className="invite-blob invite-blob-2 absolute top-[10%] left-[-10%] w-[340px] h-[340px] bg-teal-300/20 rounded-full filter blur-[100px]" />
      </div>

      <header className="relative z-10 px-4 pt-4">
        <div className="max-w-md mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl pl-3 pr-2 py-2 shadow-sm">
          <a href="/" className="flex items-center gap-2">
            <img src={appIcon} alt="" className="w-8 h-8 rounded-[10px]" />
            <span className="text-lg font-black tracking-tight">jogo</span>
          </a>
          <HeaderStoreLinks />
        </div>
      </header>

      <main className="relative flex-1 px-4 pt-7 pb-14">
        <div className="w-full max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
            className="text-center mb-5">
            {ref ? (
              <div className="inline-flex items-center gap-2 bg-white border border-[#DDE1E5] rounded-full pl-1 pr-3.5 py-1 shadow-sm mb-3">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-black flex items-center justify-center">
                  {ref.trim().charAt(0).toUpperCase()}
                </span>
                <span className="text-sm text-[#374151]"><span className="font-bold text-[#111111]">{ref}</span> invited you to play</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-white border border-[#DDE1E5] rounded-full px-3.5 py-1.5 shadow-sm mb-3">
                <span className="relative flex w-2 h-2">
                  <span className="invite-ping absolute inset-0 rounded-full bg-emerald-500" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-semibold text-[#374151]">You're invited to play</span>
              </div>
            )}
            <h1 className="text-[30px] font-black leading-[1.08] tracking-tight">
              {loading ? ' ' : game ? (game.title || 'Pickup Soccer') : 'Game not found'}
            </h1>
          </motion.div>

          {/* Game card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
            className="bg-white border border-[#DDE1E5] rounded-3xl shadow-[0_12px_40px_-12px_rgba(6,78,59,0.25)] overflow-hidden mb-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-44 bg-[#EEF0F2]" />
                <div className="p-6"><div className="h-4 w-1/2 bg-[#EEF0F2] rounded mb-3" /><div className="h-4 w-2/3 bg-[#EEF0F2] rounded" /></div>
              </div>
            ) : game ? (
              <>
                <div className="relative w-full h-44 overflow-hidden">
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <PitchArt className="w-full h-full" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {typeLabel.map((t) => (
                      <span key={t} className="bg-white/95 text-[#111111] text-[11px] font-bold rounded-full px-2.5 py-1 shadow-sm">{t}</span>
                    ))}
                  </div>
                  {urgency && !unavailable && (
                    <div className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-black rounded-full px-2.5 py-1 shadow-sm ${
                      urgency.tone === 'amber' ? 'bg-amber-400 text-amber-950' : urgency.tone === 'red' ? 'bg-red-500 text-white' : 'bg-white/95 text-[#374151]'
                    }`}>
                      <Zap size={11} strokeWidth={3} /> {urgency.text}
                    </div>
                  )}
                  {maxPlayers != null && (
                    <div className="absolute left-4 right-4 bottom-3 text-white">
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-2xl font-black leading-none">{playerCount}<span className="text-white/70 text-base font-bold">/{maxPlayers}</span></span>
                        <span className="text-xs font-semibold text-white/90">{isFull ? 'Game is full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} open`}</span>
                      </div>
                      <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
                          className="h-full bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 pt-5 pb-6">
                  {/* Who's going */}
                  {(faces.length > 0 || host) && (
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5 flex-shrink-0">
                        {[host, ...faces].filter(Boolean).map((p, i) => (
                          p.photoURL ? (
                            <img key={p.userId || i} src={p.photoURL} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover bg-[#F1F8F3]" />
                          ) : (
                            <span key={p.userId || i} className="w-9 h-9 rounded-full border-2 border-white bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                              {(p.displayName || '?').charAt(0).toUpperCase()}
                            </span>
                          )
                        ))}
                        {extraFaces > 0 && (
                          <span className="w-9 h-9 rounded-full border-2 border-white bg-[#F4F5F7] text-[#374151] text-[11px] font-black flex items-center justify-center">+{extraFaces}</span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#374151] leading-snug">
                        {host && <><span className="font-bold text-[#111111]">{(host.displayName || 'The host').split(' ')[0]}</span> is hosting</>}
                        {host && others.length > 0 && ' · '}
                        {others.length > 0 && <>{others.length} going</>}
                      </p>
                    </div>
                  )}

                  {/* Locked details — unlock on join */}
                  {!result && !unavailable && (
                    <div className="mt-5 rounded-2xl border border-dashed border-[#D5DAE0] bg-[#FAFBFB] p-4">
                      {[[Clock, 'Day & kickoff time'], [MapPin, 'Field & address']].map(([Icon, label]) => (
                        <div key={label} className="flex items-center gap-3 py-1.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center"><Icon size={15} /></div>
                          <div className="flex-1">
                            <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
                            <div className="h-3 w-32 rounded bg-[#E5E7EB] mt-1 blur-[1.5px]" />
                          </div>
                          <Lock size={14} className="text-[#9CA3AF]" />
                        </div>
                      ))}
                      <p className="text-xs text-[#6b7280] mt-2 flex items-center gap-1.5">
                        <Lock size={11} /> Unlocks the moment you grab a spot
                      </p>
                    </div>
                  )}

                  {unavailable && (
                    <p className="mt-4 text-sm text-[#6b7280]">
                      {game.status === 'cancelled' ? 'This game was cancelled.' : 'This game already happened.'} Find another one near you on Jogo.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-14 px-7">
                <div className="text-4xl mb-3">⚽</div>
                <h2 className="text-xl font-bold mb-2">This game isn't available</h2>
                <p className="text-[#6b7280] text-sm leading-relaxed">It may have been deleted. Open Jogo to find games near you.</p>
              </div>
            )}
          </motion.div>

          {/* Action */}
          {!loading && game && !unavailable && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2, ease: EASE }}>
              {result ? (
                <JoinedCard result={result} gameUrl={gameUrl} />
              ) : (
                <>
                  <JoinGame gameId={gameId} isFull={isFull} onResult={setResult} />
                  <div className="flex items-center justify-center gap-4 mt-3 text-[12px] text-[#6b7280]">
                    {['Free', 'No app needed', '30 seconds'].map((t) => (
                      <span key={t} className="inline-flex items-center gap-1"><Check size={13} strokeWidth={3} className="text-emerald-600" />{t}</span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {!loading && (!game || unavailable) && (
            <div className="flex flex-col items-center gap-3">
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold py-4 rounded-2xl">
                <AppleLogo />
                <span className="text-left leading-tight"><span className="block text-[10px] font-normal text-white/60">Find games near you on the</span><span className="block text-lg font-bold">App Store</span></span>
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold py-4 rounded-2xl">
                <PlayLogo size={20} />
                <span className="text-left leading-tight"><span className="block text-[10px] font-normal text-white/60">Or get it on</span><span className="block text-lg font-bold">Google Play</span></span>
              </a>
              <a href={WEB_APP_URL} className="text-xs text-[#6b7280] underline underline-offset-4">Continue on the web instead →</a>
            </div>
          )}

          {/* Both app stores, visible before joining — after joining, the
              joined card has its own; unavailable games show them above. */}
          {!loading && game && !unavailable && !result && (
            <StoreButtons className="mt-8" />
          )}

          {/* Trust — same figures the homepage publishes */}
          <div className="mt-10 grid grid-cols-3 gap-2 text-center">
            {[[Users, '4,000+', 'players'], [Trophy, '2,000+', 'games created'], [MapPin, 'Built in', 'New Jersey']].map(([Icon, v, l]) => (
              <div key={l} className="bg-white/70 border border-[#DDE1E5] rounded-2xl py-3">
                <Icon size={15} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-sm font-black leading-tight">{v}</p>
                <p className="text-[11px] text-[#6b7280]">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative border-t border-[#DDE1E5] bg-white/60 px-4 py-5">
        <div className="max-w-md mx-auto flex flex-col items-center gap-2 text-xs text-[#6b7280]">
          <nav className="flex items-center gap-4">
            <a href="/policy" className="hover:text-[#111111]">Privacy</a>
            <a href="/terms" className="hover:text-[#111111]">Terms</a>
            <a href="/support" className="hover:text-[#111111]">Support</a>
            <a href="mailto:jogo.tech@outlook.com" className="hover:text-[#111111]">Contact</a>
          </nav>
          <span>© {new Date().getFullYear()} Jogo · Made in New Jersey</span>
        </div>
      </footer>
    </div>
  );
}

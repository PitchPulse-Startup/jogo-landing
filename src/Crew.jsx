// src/Crew.jsx — landing page for shared crew links (jogous.io/crew/:squadId)
//
// Same job as Invite.jsx, aimed at a crew instead of a single game: whoever
// taps a crew invite link lands here first. Two ways forward: download the
// app, or join right here on the web via the "Join Crew" flow below, which
// signs them into the same Firebase project the app uses and calls the
// joinCrewViaLink Cloud Function. A shared link is the invitation itself,
// so public (open or request-to-join) and private crews all join instantly.

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
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
  Users, MapPin, Lock, Globe, Check, Loader2,
  MessageCircle, CalendarDays, Newspaper, Bell, BadgeCheck,
} from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';
import appScreenshot from './assets/jogopic1.png';
import { APP_STORE_URL, PLAY_STORE_URL, APP_URL, PlayLogo, HeaderStoreLinks } from './appLinks';

const WEB_APP_URL = 'https://www.jogous.io/app';

function AppleLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// Firebase auth error codes -> copy that matches what a person actually did.
function authErrorMessage(error, mode) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'That email already has a Jogo account — try logging in instead.';
    case 'auth/invalid-email':
      return 'That email address doesn’t look right.';
    case 'auth/weak-password':
      return 'Password should be at least 8 characters with a mix of letters and numbers.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/user-not-found':
      return 'No Jogo account with that email — try signing up instead.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return mode === 'signup'
        ? 'Could not create your account. Please try again.'
        : 'Could not log you in. Please try again.';
  }
}

// Mirrors screens/LoginScreen.js's password rule so a web signup can't
// create an account the app itself would call "weak".
function isStrongEnoughPassword(pw) {
  return pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
}

// joinCrewViaLink error codes -> copy for the person on this page.
function joinErrorMessage(error) {
  switch (error?.code) {
    case 'functions/permission-denied':
      return 'You were removed from this crew, so this link can’t add you back. Ask an admin to invite you again.';
    case 'functions/not-found':
      return 'This crew no longer exists.';
    case 'functions/unauthenticated':
      return 'Please log in again and retry.';
    default:
      return 'Something went wrong joining the crew. Please try again.';
  }
}

const joinCrewViaLink = httpsCallable(functions, 'joinCrewViaLink');

// Renders inline under the crew card. Handles the auth step and the join
// itself — the actual membership write happens in the joinCrewViaLink
// Cloud Function, which works the same for public and private crews.
function JoinCrewButton({ squadId, crewName, isMember, onJoined }) {
  const [user, setUser] = useState(() => auth.currentUser);
  const [mode, setMode] = useState(null); // null | 'login' | 'signup' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joinState, setJoinState] = useState('idle'); // idle | joining | joined | error
  const [joinError, setJoinError] = useState('');

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Membership comes from the server (getCrewInviteDetails' viewerIsMember),
  // never from a local "I joined once" flag — that went stale the moment
  // someone left the crew in the app, and the page kept saying "You're in".
  // justJoinedRef stops a details fetch that raced the join (and so still
  // says "not a member") from flipping a fresh join back to the button.
  const justJoinedRef = useRef(false);
  useEffect(() => {
    if (isMember == null) return;
    setJoinState((prev) => {
      if (prev === 'joining') return prev;
      if (isMember) return 'joined';
      return prev === 'joined' && !justJoinedRef.current ? 'idle' : prev;
    });
  }, [isMember]);

  const runJoin = async (displayName) => {
    setJoinState('joining');
    setJoinError('');
    try {
      await joinCrewViaLink({ crewId: squadId, displayName: displayName || undefined });
      justJoinedRef.current = true;
      setJoinState('joined');
      onJoined?.();
    } catch (e) {
      console.error('Error joining crew:', e);
      setJoinError(joinErrorMessage(e));
      setJoinState('error');
    }
  };

  const handlePrimaryClick = () => {
    if (joinState === 'joined' || joinState === 'joining') return;
    if (user) {
      runJoin(user.displayName);
    } else {
      // Most people arriving from a shared link are new — lead with sign up.
      setMode('signup');
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setAuthError('');
    setResetSent(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (mode === 'reset') {
      if (!email.trim()) {
        setAuthError('Enter your email.');
        return;
      }
      setSubmitting(true);
      try {
        await sendPasswordResetEmail(auth, email.trim());
        setResetSent(true);
      } catch (err) {
        setAuthError(authErrorMessage(err, 'login'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setAuthError('Enter your name so your crew knows who joined.');
      return;
    }
    if (!email.trim() || !password) {
      setAuthError('Enter your email and password.');
      return;
    }
    if (mode === 'signup' && !isStrongEnoughPassword(password)) {
      setAuthError('Password should be at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }

    setSubmitting(true);
    try {
      let displayName;
      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        displayName = name.trim();
        try { await updateProfile(credential.user, { displayName }); } catch {}
      } else {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        displayName = credential.user.displayName;
      }
      setMode(null);
      await runJoin(displayName);
    } catch (err) {
      setAuthError(authErrorMessage(err, mode));
    } finally {
      setSubmitting(false);
    }
  };

  if (joinState === 'joined') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center"
      >
        <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3">
          <Check size={22} strokeWidth={3} />
        </div>
        <p className="font-black text-lg text-emerald-800 leading-tight">
          You're in{crewName ? ` ${crewName}` : ' the crew'}!
        </p>
        <p className="text-sm text-emerald-700/80 mt-1">
          Get the Jogo app and log in with the same account to see games and chat with your crew.
        </p>
      </motion.div>
    );
  }

  const inputClass =
    'w-full bg-[#F7F8F9] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-400';

  return (
    <div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePrimaryClick}
        disabled={joinState === 'joining'}
        className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-900/20 disabled:opacity-70"
      >
        {joinState === 'joining' ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Joining...
          </>
        ) : (
          'Join Crew'
        )}
      </motion.button>

      {user && !mode && (
        <p className="text-center text-[11px] text-[#9CA3AF] mt-2">
          Joining as {user.displayName || user.email} ·{' '}
          <button
            type="button"
            onClick={() => { justJoinedRef.current = false; signOut(auth); setJoinState('idle'); setJoinError(''); }}
            className="underline underline-offset-2 hover:text-[#6b7280]"
          >
            Not you?
          </button>
        </p>
      )}

      {joinState === 'error' && (
        <p className="text-center text-xs text-red-500 mt-2">{joinError}</p>
      )}

      <AnimatePresence>
        {mode && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleAuthSubmit}
            className="overflow-hidden"
          >
            <div className="bg-white border border-[#DDE1E5] rounded-2xl p-4 mt-3">
              {mode !== 'reset' && (
                <div className="flex bg-[#F1F2F4] rounded-xl p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${mode === 'signup' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#6b7280]'}`}
                  >
                    I'm new
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${mode === 'login' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#6b7280]'}`}
                  >
                    I have an account
                  </button>
                </div>
              )}

              {mode === 'reset' && (
                <p className="text-sm text-[#6b7280] mb-3">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              )}

              {mode === 'signup' && (
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputClass} mb-2`}
                />
              )}
              <input
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              {mode !== 'reset' && (
                <input
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} mt-2`}
                />
              )}

              {authError && (
                <p className="text-xs text-red-500 mt-2">{authError}</p>
              )}
              {resetSent && (
                <p className="text-xs text-emerald-700 mt-2">Check your inbox for a reset link.</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold py-3 rounded-xl mt-3 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {mode === 'signup' ? 'Create Account & Join' : mode === 'login' ? 'Log In & Join' : 'Send Reset Link'}
              </button>

              <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-2">
                <span>Same account as the Jogo app.</span>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('reset')} className="underline underline-offset-2 hover:text-[#6b7280]">
                    Forgot password?
                  </button>
                )}
                {mode === 'reset' && (
                  <button type="button" onClick={() => switchMode('login')} className="underline underline-offset-2 hover:text-[#6b7280]">
                    Back to log in
                  </button>
                )}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const getCrewInviteDetails = httpsCallable(functions, 'getCrewInviteDetails');

const AVATAR_GRADIENTS = [
  'from-emerald-500 to-teal-500', 'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500', 'from-amber-500 to-yellow-500', 'from-indigo-500 to-sky-500',
];

function Avatar({ name, photoURL, size = 32, className = '' }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size };
  if (photoURL && !broken) {
    return (
      <img
        src={photoURL}
        alt=""
        onError={() => setBroken(true)}
        style={style}
        className={`rounded-full object-cover bg-[#EEF0F2] ${className}`}
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.4 }}
      className={`rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[[...(name || '?')].reduce((h, c) => h + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length]} text-white font-black flex items-center justify-center ${className}`}
    >
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

function relativeActivity(ms) {
  if (!ms) return null;
  const days = Math.floor((Date.now() - ms) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return null; // older than a month isn't a selling point — just leave it out
}

function sinceLabel(ms) {
  if (!ms) return null;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

// The "this crew is real" block inside the crew card, from the
// getCrewInviteDetails Cloud Function. Every piece is optional and only
// renders when there's real data behind it — an empty stat would do more
// harm than good on a page whose whole job is looking legit.
function CrewProof({ details, memberCount }) {
  if (!details) return null;
  const { owner, memberPreview = [], gamesPlayed, lastActiveMs, createdAtMs, nextGame } = details;

  const stats = [
    gamesPlayed > 0 && { value: gamesPlayed, label: gamesPlayed === 1 ? 'Game played' : 'Games played' },
    relativeActivity(lastActiveMs) && { value: relativeActivity(lastActiveMs), label: 'Last active' },
    sinceLabel(createdAtMs) && { value: sinceLabel(createdAtMs), label: 'Crew since' },
  ].filter(Boolean);

  const othersCount = Math.max(0, (memberCount ?? 0) - memberPreview.length);
  const nextStart = nextGame?.startMs ? new Date(nextGame.startMs) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {memberPreview.length > 0 && (
        <div className="flex items-center gap-3 mt-5">
          <div className="flex -space-x-2.5 flex-shrink-0">
            {memberPreview.map((m, i) => (
              <Avatar key={i} name={m.firstName} photoURL={m.photoURL} size={34} className="border-2 border-white" />
            ))}
          </div>
          <p className="text-[13px] text-[#374151] leading-snug">
            <span className="font-semibold text-[#111111]">
              {memberPreview.slice(0, 2).map((m) => m.firstName).join(', ')}
            </span>
            {othersCount > 0 ? ` and ${othersCount} other${othersCount === 1 ? '' : 's'} are in` : ' are in'}
          </p>
        </div>
      )}

      {stats.length > 0 && (
        <div className={`grid gap-2 mt-5`} style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
          {stats.map((s) => (
            <div key={s.label} className="bg-[#F7F8F9] border border-[#EEF0F2] rounded-xl px-2 py-2.5 text-center">
              <div className="text-[15px] font-black leading-tight">{s.value}</div>
              <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {nextGame && nextStart && (
        <div className="flex items-center gap-3 mt-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3">
          <div className="w-12 flex-shrink-0 rounded-xl bg-white border border-emerald-100 text-center py-1.5 shadow-sm">
            <div className="text-[10px] font-bold text-emerald-700 uppercase">
              {nextStart.toLocaleDateString(undefined, { month: 'short' })}
            </div>
            <div className="text-lg font-black leading-none">{nextStart.getDate()}</div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Next game</p>
            <p className="text-sm font-bold truncate">{nextGame.title || 'Crew game'}</p>
            <p className="text-xs text-[#6b7280] truncate">
              {nextStart.toLocaleDateString(undefined, { weekday: 'short' })}{' '}
              {nextStart.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              {nextGame.fieldName ? ` · ${nextGame.fieldName}` : ''}
            </p>
          </div>
          {nextGame.playerCount != null && nextGame.playerCount > 0 && (
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-black">
                {nextGame.playerCount}{nextGame.maxPlayers ? <span className="text-[#9CA3AF] font-bold">/{nextGame.maxPlayers}</span> : null}
              </div>
              <div className="text-[10px] text-[#6b7280]">going</div>
            </div>
          )}
        </div>
      )}

      {owner && (
        <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-[#EEF0F2]">
          <Avatar name={owner.name} photoURL={owner.photoURL} size={28} />
          <p className="text-[13px] text-[#6b7280] min-w-0 truncate">
            Run by <span className="font-semibold text-[#111111]">{owner.name}</span>
          </p>
          {owner.isProOrganizer && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide rounded-full px-2 py-0.5 flex-shrink-0">
              <BadgeCheck size={11} strokeWidth={3} />
              Pro organizer
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Same numbers the homepage (App.jsx) already publishes — keep the two in
// sync rather than inventing separate figures for this page.
const PROOF_STATS = [
  { value: '4,000+', label: 'Players' },
  { value: '2,000+', label: 'Games created' },
];

// What's actually inside a crew in the app (CrewPageScreen's Feed / Games /
// Chat tabs + push notifications) — nothing here the app doesn't do.
const CREW_FEATURES = [
  { icon: MessageCircle, title: 'Crew chat', desc: 'Messages, polls & GIFs with the whole group.' },
  { icon: CalendarDays, title: 'Crew games', desc: 'Every game in one place. RSVP in a tap.' },
  { icon: Newspaper, title: 'Crew feed', desc: 'Announcements and what the crew is up to.' },
  { icon: Bell, title: 'Never miss a game', desc: 'Get notified the moment a new game drops.' },
];

const TEAM = [
  { initials: 'CV', grad: 'from-emerald-500 to-teal-500' },
  { initials: 'IS', grad: 'from-blue-500 to-cyan-500' },
  { initials: 'AD', grad: 'from-purple-500 to-pink-500' },
  { initials: 'JM', grad: 'from-orange-500 to-red-500' },
];

const EASE = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AppStoreButton({ className = '' }) {
  return (
    <motion.a
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-3 bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-black/15 ${className}`}
    >
      <AppleLogo />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-normal text-white/60">Download on the</span>
        <span className="block text-lg font-bold">App Store</span>
      </span>
    </motion.a>
  );
}

function GooglePlayButton({ className = '' }) {
  return (
    <motion.a
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-3 bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-black/15 ${className}`}
    >
      <PlayLogo size={20} />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-normal text-white/60">Get it on</span>
        <span className="block text-lg font-bold">Google Play</span>
      </span>
    </motion.a>
  );
}

function CrewCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-44 bg-[#EEF0F2]" />
      <div className="p-6 pt-10">
        <div className="h-6 w-2/3 bg-[#EEF0F2] rounded-lg mb-4" />
        <div className="h-4 w-1/3 bg-[#EEF0F2] rounded-lg mb-2" />
        <div className="h-4 w-1/2 bg-[#EEF0F2] rounded-lg" />
      </div>
    </div>
  );
}

export default function Crew() {
  const { squadId } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [loading, setLoading] = useState(true);
  const [crew, setCrew] = useState(null);
  const [details, setDetails] = useState(null);
  // Who's viewing (undefined until Firebase Auth restores the session) —
  // details are fetched per viewer so viewerIsMember is about *them*.
  const [viewerUid, setViewerUid] = useState(undefined);
  const [detailsVersion, setDetailsVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);

    if (!squadId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // crewPreviews mirrors just the safe public subset of every crew
        // (name/banner/description/homeArea/memberCount/visibility — never
        // the members list), kept in sync by the onCrewPreviewSync Cloud
        // Function regardless of the crew's own visibility. Readable by
        // anyone, so a private crew's real name/photo still shows here —
        // same idea as a Discord/Slack invite link surfacing a private
        // server's identity. Joining itself (see JoinCrewButton) still
        // never touches this doc; it goes through joinCrewViaLink.
        const snap = await getDoc(doc(db, 'crewPreviews', squadId));
        if (cancelled) return;
        setCrew(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (e) {
        if (!cancelled) {
          console.error('Error loading invited crew:', e);
          setCrew(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [squadId]);

  // Proof-of-life (owner, faces, games, next game) — loads alongside the
  // preview and simply stays hidden if it fails; the page works without it.
  useEffect(() => onAuthStateChanged(auth, (u) => setViewerUid(u?.uid ?? null)), []);

  useEffect(() => {
    if (!squadId || viewerUid === undefined) return;
    let cancelled = false;
    getCrewInviteDetails({ crewId: squadId })
      .then((res) => { if (!cancelled) setDetails({ ...res.data, forUid: viewerUid }); })
      .catch((e) => console.warn('Crew details unavailable:', e?.message));
    return () => { cancelled = true; };
  }, [squadId, viewerUid, detailsVersion]);

  // null = not known yet for this viewer (don't guess either way).
  const viewerIsMember = details && details.forUid === viewerUid ? !!details.viewerIsMember : null;

  useEffect(() => {
    if (crew?.name) document.title = `Join ${crew.name} · Jogo`;
  }, [crew?.name]);

  const memberCount = crew?.memberCount ?? null;
  const coverImage = crew?.bannerUrl || crew?.imageUrl || null;
  const isPrivate = crew?.visibility === 'private';
  const canJoin = !loading && squadId && crew;
  const crewName = crew?.name || 'a Jogo crew';

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
        .invite-blob-3 { animation-delay: -7s; }
        @keyframes invite-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        .invite-phone-float { animation: invite-float 5s ease-in-out infinite; }
        @keyframes invite-ping {
          0% { transform: scale(1); opacity: .7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .invite-ping { animation: invite-ping 1.8s cubic-bezier(0,0,.2,1) infinite; }
      `}</style>

      {/* dot-grid texture + drifting color glow, matching the rest of the site */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: 'radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[900px] pointer-events-none overflow-hidden">
        <div className="invite-blob absolute top-[-15%] left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-emerald-300/25 rounded-full filter blur-[120px]" />
        <div className="invite-blob invite-blob-2 absolute top-[10%] left-[-10%] w-[340px] h-[340px] bg-teal-300/20 rounded-full filter blur-[100px]" />
        <div className="invite-blob invite-blob-3 absolute top-[5%] right-[-10%] w-[340px] h-[340px] bg-emerald-400/20 rounded-full filter blur-[100px]" />
      </div>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <header className="relative z-10 px-4 sm:px-8 pt-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl pl-3 pr-2 py-2 shadow-sm">
          <a href="/" className="flex items-center gap-2">
            <img src={appIcon} alt="" className="w-8 h-8 rounded-[10px]" />
            <span className="text-lg font-black tracking-tight">jogo</span>
          </a>
          <HeaderStoreLinks />
        </div>
      </header>

      <main className="relative flex-1 px-4 sm:px-8 pt-8 sm:pt-12 pb-16">
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-14 lg:items-start">

          {/* ── LEFT: invite + crew + join ────────────────────────── */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:sticky lg:top-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-center lg:text-left mb-6"
            >
              {ref ? (
                <div className="inline-flex items-center gap-2 bg-white border border-[#DDE1E5] rounded-full pl-1 pr-3.5 py-1 shadow-sm mb-4">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-black flex items-center justify-center">
                    {ref.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm text-[#374151]">
                    <span className="font-bold text-[#111111]">{ref}</span> invited you
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white border border-[#DDE1E5] rounded-full px-3.5 py-1.5 shadow-sm mb-4">
                  <span className="relative flex w-2 h-2">
                    <span className="invite-ping absolute inset-0 rounded-full bg-emerald-500" />
                    <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-semibold text-[#374151]">You're invited</span>
                </div>
              )}
              <h1 className="text-[32px] sm:text-4xl font-black leading-[1.08] tracking-tight">
                Join <span className="text-emerald-600">{crewName}</span> on Jogo
              </h1>
              <p className="text-[#6b7280] text-[15px] mt-3 leading-relaxed">
                The app your soccer group actually uses: games, chat, and everyone in one place.
              </p>
            </motion.div>

            {/* Crew card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
              className="bg-white border border-[#DDE1E5] rounded-3xl shadow-[0_12px_40px_-12px_rgba(6,78,59,0.25)] overflow-hidden mb-5"
            >
              {loading ? (
                <CrewCardSkeleton />
              ) : crew ? (
                <>
                  <div className="relative w-full h-44 bg-gradient-to-br from-emerald-50 via-[#F1F8F3] to-teal-50 overflow-hidden">
                    {coverImage ? (
                      <>
                        <img src={coverImage} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      </>
                    ) : (
                      <span
                        className="absolute select-none pointer-events-none"
                        style={{ right: -30, bottom: -40, transform: 'rotate(-15deg)', fontSize: 170, opacity: 0.08, lineHeight: 1 }}
                      >
                        {crew.icon || '⚽'}
                      </span>
                    )}
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#111111] text-[11px] font-bold rounded-full px-2.5 py-1 shadow-sm">
                      {isPrivate ? <Lock size={11} strokeWidth={3} /> : <Globe size={11} strokeWidth={3} />}
                      {isPrivate ? 'Private · invite only' : 'Public crew'}
                    </div>
                  </div>

                  <div className="relative px-6 pb-6">
                    <div className="-mt-8 mb-3 w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl overflow-hidden">
                      {crew.imageUrl && crew.bannerUrl ? (
                        <img src={crew.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        crew.icon || '⚽'
                      )}
                    </div>
                    <h2 className="text-2xl font-black leading-tight">{crew.name || 'A Jogo Crew'}</h2>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {memberCount != null && (
                        <span className="inline-flex items-center gap-1.5 bg-[#F4F5F7] text-[#374151] text-xs font-semibold rounded-full px-3 py-1.5">
                          <Users size={13} />
                          {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {crew.homeArea && (
                        <span className="inline-flex items-center gap-1.5 bg-[#F4F5F7] text-[#374151] text-xs font-semibold rounded-full px-3 py-1.5">
                          <MapPin size={13} />
                          {crew.homeArea}
                        </span>
                      )}
                    </div>

                    {crew.description && (
                      <p className="text-[#374151] text-sm mt-4 leading-relaxed line-clamp-3">
                        {crew.description}
                      </p>
                    )}

                    <CrewProof details={details} memberCount={details?.memberCount ?? memberCount} />
                  </div>
                </>
              ) : (
                <div className="text-center py-14 px-7">
                  <div className="w-12 h-12 rounded-2xl bg-[#F1F8F3] flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚽</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">This crew isn't available</h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed">
                    It may have been deleted. Open Jogo to find games and crews near you.
                  </p>
                </div>
              )}
            </motion.div>

            {canJoin && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
              >
                <JoinCrewButton
                  squadId={squadId}
                  crewName={crew?.name}
                  isMember={viewerIsMember}
                  onJoined={() => setDetailsVersion((v) => v + 1)}
                />
                <div className="flex items-center justify-center gap-4 mt-3 text-[12px] text-[#6b7280]">
                  {['Free to join', 'Takes 30 seconds', 'No credit card'].map((t) => (
                    <span key={t} className="inline-flex items-center gap-1">
                      <Check size={13} strokeWidth={3} className="text-emerald-600" />
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && !crew && (
              <div className="flex flex-col items-center gap-3">
                <AppStoreButton className="w-full" />
                <GooglePlayButton className="w-full" />
                <a href={WEB_APP_URL} className="text-xs text-[#6b7280] underline underline-offset-4">
                  Continue on the web instead →
                </a>
              </div>
            )}
          </div>

          {/* ── RIGHT: what's inside + phone ───────────────────────── */}
          <div className="w-full max-w-md mx-auto lg:max-w-none mt-14 lg:mt-2">
            <Reveal>
              <p className="text-xs font-bold text-emerald-700 tracking-widest uppercase mb-2 text-center lg:text-left">
                Inside the crew
              </p>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-6 text-center lg:text-left">
                No more lost group chats.
              </h3>
            </Reveal>

            <div className="grid grid-cols-2 gap-3">
              {CREW_FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 0.06}>
                  <div className="h-full bg-white border border-[#DDE1E5] rounded-2xl p-4 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                      <Icon size={18} />
                    </div>
                    <p className="font-bold text-sm mb-1">{title}</p>
                    <p className="text-xs text-[#6b7280] leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-8">
              <div className="relative bg-[#0F1411] rounded-3xl overflow-hidden text-white px-6 pt-7 pb-0 sm:px-8">
                <div className="absolute -top-24 -right-16 w-72 h-72 bg-emerald-500/25 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative grid grid-cols-2 gap-2 text-center mb-7">
                  {PROOF_STATS.map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-white to-emerald-300 bg-clip-text text-transparent">
                        {s.value}
                      </div>
                      <div className="text-[11px] text-white/55 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="relative flex justify-center">
                  <div className="invite-phone-float w-[210px] rounded-t-[34px] border-[6px] border-b-0 border-[#2a2f2c] bg-[#2a2f2c] overflow-hidden shadow-2xl -mb-24">
                    <img src={appScreenshot} alt="The Jogo app" className="w-full block rounded-t-[28px]" />
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <AppStoreButton />
              <GooglePlayButton />
              <a
                href={WEB_APP_URL}
                className="text-sm font-semibold text-[#374151] hover:text-emerald-700 px-4 py-3 transition-colors"
              >
                Or use Jogo on the web →
              </a>
            </Reveal>

            <Reveal className="mt-8">
              <div className="flex items-center gap-4 bg-white/70 border border-[#DDE1E5] rounded-2xl p-4">
                <div className="flex -space-x-2 flex-shrink-0">
                  {TEAM.map((p) => (
                    <div
                      key={p.initials}
                      className={`w-9 h-9 rounded-xl border-2 border-white flex items-center justify-center text-[11px] font-black text-white bg-gradient-to-br ${p.grad}`}
                    >
                      {p.initials}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#374151] leading-relaxed">
                  <span className="font-bold text-[#111111]">Built by players in Jersey City, NJ.</span>{' '}
                                    <a href="/" className="text-emerald-700 font-semibold hover:underline">Meet us →</a>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="relative border-t border-[#DDE1E5] bg-white/60 px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6b7280]">
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
  );
}

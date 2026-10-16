// src/Event.jsx — landing page for shared event links (jogous.io/event/:eventId)
//
// Every event renders src/PaidEvent.jsx — the web twin of the app's event
// page (components/events/PaidEventLayout.js), which draws paid and free
// events alike. Paid (events/{id} with `ticketing`) sends every button to
// the app. Free events can be joined right here in the browser through the
// joinEventViaLink Cloud Function (jogo-APP functions/index.js), which
// mirrors the app's own join — a plain event adds you to its participants,
// a team event puts you on the team with the most open spots. This file
// owns that join: JOIN in the page's bottom bar joins straight away when
// you're signed in, or opens the sign-up sheet below when you're not.
//
// The link IS the invitation: a crew-only event (visibility 'crew') is
// joinable here exactly like a public one. The location stays locked until
// you've joined, same reasoning as the game page — people shouldn't just
// show up off a forwarded link. Legacy priced events (?type=paid → the
// separate paidEvents collection, or a `price`) point to the app instead.

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
import { X, Loader2 } from 'lucide-react';
import { db, auth, functions } from './firebase';
import appIcon from './assets/jogo-app-icon.png';
import { StoreButtons } from './appLinks';
import PaidEvent from './PaidEvent';

const EASE = [0.22, 1, 0.36, 1];
const INK = '#0A0A0A';
const MUTED = '#6B7280';
const FAINT = '#A3A3A3';
const ANTON = { fontFamily: "'Anton', Impact, sans-serif", fontWeight: 400, lineHeight: 1.25 };

const joinEventViaLink = httpsCallable(functions, 'joinEventViaLink');

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

// ── Sign up / log in, then join — a bottom sheet over the event page ──
function JoinSheet({ open, onClose, onSignedIn, eventTitle }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      onSignedIn(displayName);
    } catch (err) {
      setAuthError(authErrorMessage(err, mode));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-[#F5F5F5] rounded-2xl px-4 py-3.5 text-[15.5px] font-semibold outline-none ring-2 ring-transparent focus:ring-[#0A0A0A] focus:bg-white transition-all placeholder:text-[#A3A3A3]';

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 flex items-end justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative w-full max-w-xl bg-white rounded-t-[28px] px-[22px] pt-5 pb-[max(22px,env(safe-area-inset-bottom))]"
            style={{ fontFamily: "'Barlow', system-ui, sans-serif", color: INK }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-extrabold text-[11px] tracking-[2px]" style={{ color: MUTED }}>{mode === 'reset' ? 'RESET PASSWORD' : 'GRAB YOUR SPOT'}</p>
                <p className="truncate" style={{ ...ANTON, fontSize: 28, color: INK }}>{(eventTitle || 'This event').toUpperCase()}</p>
              </div>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0" aria-label="Close">
                <X size={17} color={INK} />
              </button>
            </div>

            {mode !== 'reset' && (
              <div className="flex bg-[#F5F5F5] rounded-full p-1 mt-3 mb-3">
                {[['signup', "I'm new"], ['login', 'I have an account']].map(([m, label]) => (
                  <button key={m} type="button" onClick={() => switchMode(m)}
                    className={`flex-1 text-[14px] font-extrabold py-2 rounded-full transition-all ${mode === m ? 'bg-[#0A0A0A] text-white' : 'text-[#6B7280]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
            {mode === 'reset' && <p className="text-[14px] font-semibold mt-2 mb-3" style={{ color: MUTED }}>Enter your email and we’ll send you a reset link.</p>}

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
            {mode === 'signup' && <p className="text-[12px] font-semibold mt-2 ml-1" style={{ color: FAINT }}>8+ characters, with an uppercase letter and a number.</p>}
            {authError && <p className="text-[13px] font-bold text-red-600 mt-2 ml-1">{authError}</p>}
            {resetSent && <p className="text-[13px] font-bold text-emerald-700 mt-2 ml-1">Check your inbox for a reset link.</p>}

            <button type="submit" disabled={submitting}
              className="w-full h-[54px] rounded-full text-white mt-4 font-extrabold text-[16px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-opacity"
              style={{ background: INK }}>
              {submitting && <Loader2 size={17} className="animate-spin" />}
              {mode === 'signup' ? 'Create account & join' : mode === 'login' ? 'Log in & join' : 'Send reset link'}
            </button>

            <div className="flex justify-between text-[12px] font-semibold mt-3 px-1" style={{ color: FAINT }}>
              <span>Free · same account as the Jogo app</span>
              {mode === 'login' && <button type="button" onClick={() => switchMode('reset')} className="underline underline-offset-2">Forgot password?</button>}
              {mode === 'reset' && <button type="button" onClick={() => switchMode('login')} className="underline underline-offset-2">Back to log in</button>}
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Event() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const isPaidCollection = searchParams.get('type') === 'paid';

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [viewer, setViewer] = useState(undefined);
  const [result, setResult] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const autoCheckedRef = useRef(null);
  const viewerUid = viewer === undefined ? undefined : viewer?.uid ?? null;

  // Live event doc (events and paidEvents are publicly readable).
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!eventId) { setLoading(false); return undefined; }
    return onSnapshot(doc(db, isPaidCollection ? 'paidEvents' : 'events', eventId), (snap) => {
      setEvent(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }, (e) => {
      console.error('Error loading shared event:', e);
      setEvent(null);
      setLoading(false);
    });
  }, [eventId, isPaidCollection]);

  useEffect(() => onAuthStateChanged(auth, (u) => setViewer(u ?? null)), []);

  const teams = Array.isArray(event?.teams) ? event.teams : [];
  const hasTeams = !!event?.enableTeams && teams.length > 0;
  const participants = Array.isArray(event?.participants) ? event.participants : [];
  const everyone = hasTeams ? teams.flatMap((t) => t.players || []) : participants;
  const needsTicket = isPaidCollection || (typeof event?.price === 'number' && event.price > 0);

  const runJoin = async (displayName) => {
    setJoining(true);
    setJoinError('');
    try {
      const res = await joinEventViaLink({ eventId, displayName: displayName || undefined });
      setResult(res.data);
    } catch (e) {
      console.error('Error joining event:', e);
      setJoinError(joinErrorMessage(e));
    } finally {
      setJoining(false);
    }
  };

  // JOIN in the bottom bar: straight in when signed in, else the sheet.
  const onJoin = () => {
    if (joining) return;
    if (auth.currentUser) runJoin(auth.currentUser.displayName);
    else setSheetOpen(true);
  };

  // Someone already signed up (came back to the link) gets their unlocked
  // details without tapping — joinEventViaLink is idempotent for them.
  const viewerIn = !needsTicket && !!viewerUid && everyone.some((p) => p.userId === viewerUid);
  useEffect(() => {
    if (!viewerIn || result || autoCheckedRef.current === viewerUid) return;
    autoCheckedRef.current = viewerUid;
    joinEventViaLink({ eventId }).then((res) => setResult(res.data)).catch(() => {});
  }, [viewerIn, viewerUid, eventId, result]);
  useEffect(() => {
    if (viewerUid === null) { setResult(null); autoCheckedRef.current = null; }
  }, [viewerUid]);

  // Until the doc arrives we don't know which page this is — a neutral splash.
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <img src={appIcon} alt="Jogo" className="w-14 h-14 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <img src={appIcon} alt="" className="w-14 h-14 rounded-2xl mx-auto" />
          <p className="mt-4" style={{ ...ANTON, fontSize: 30, color: INK }}>EVENT NOT FOUND</p>
          <p className="text-[15px] font-semibold mt-1 mb-6" style={{ color: MUTED }}>It may have been deleted. Open Jogo to find what’s on near you.</p>
          <StoreButtons label="" />
        </div>
      </div>
    );
  }

  if (event.ticketing) return <PaidEvent event={event} refName={ref} />;

  return (
    <>
      <PaidEvent
        event={event}
        refName={ref}
        join={{ result, joining, joinError, onJoin, needsTicket }}
      />
      {viewer ? (
        <p className="fixed z-30 left-0 right-0 text-center text-[11.5px] font-semibold pointer-events-none" style={{ bottom: 92, color: FAINT }}>
          {!result ? (
            <span className="pointer-events-auto bg-white/90 rounded-full px-3 py-1">
              Joining as {viewer.displayName || viewer.email} ·{' '}
              <button type="button" onClick={() => signOut(auth)} className="underline underline-offset-2">Not you?</button>
            </span>
          ) : null}
        </p>
      ) : null}
      <JoinSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        eventTitle={event.title}
        onSignedIn={(displayName) => { setSheetOpen(false); runJoin(displayName); }}
      />
    </>
  );
}

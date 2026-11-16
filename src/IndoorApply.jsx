// src/IndoorApply.jsx — jogous.io/indoors/apply, an indoor applies to host on
// Jogo without the app. The same application as the app's VenueApplyScreen
// (jogo-APP screens/venue/VenueApplyScreen.js) and the same venue doc
// (src/indoor/applyKit.js submitVenue), reviewed by hand in Jogo-admin.
//
// Desktop: the form on the left, the page it makes on the right, drawn live in
// a phone (src/indoor/VenuePreview.jsx). Phones: the form, plus a floating
// "Preview my page" pill that opens the same phone full screen.
//
// The login comes LAST: they build the page first, then create a Jogo login
// (or sign in) to send it. One-off closed dates aren't asked here; they set
// those later in the app.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  onAuthStateChanged, updateProfile, signOut,
} from 'firebase/auth';
import {
  ImagePlus, Plus, Minus, X, MapPin, Clock, Loader2, Eye, ArrowRight, Check, CheckCircle2,
} from 'lucide-react';
import jogoLogo from './assets/jogo-logo-2026.png';
import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import { DISPLAY, BODY, EASE, useMatchdayFonts, StoreRow } from './App.jsx';
import { auth } from './firebase';
import VenuePreview from './indoor/VenuePreview.jsx';
import {
  MAX_FIELDS, MAX_PHOTOS, CANCEL_HOURS, CANCEL_KEEP, HOURS_MIN, HOURS_MAX, HOURS_STEP, DEFAULT_DAY,
  DEFAULT_HOURS, WEEK_ORDER, weekdayName, timeText, loadImage, newPlacesSession, autocompletePlaces,
  getPlaceLocation, geocodeAddress, cityFromAddress, getVenue, submitVenue, cleanHandle,
} from './indoor/applyKit';

const PORTAL = '/indoors/portal';
const PHONE_H = 760; // the preview's screen; the frame adds 20

const inputCls = 'w-full h-12 rounded-xl bg-[#F2F3F5] px-4 font-semibold text-[#0B0D10] outline-none ring-2 ring-transparent focus:ring-[#0B0D10] focus:bg-white transition-all placeholder:text-[#9AA0AB]';

function authError(err, mode) {
  switch (err?.code) {
    case 'auth/email-already-in-use': return 'That email already has a Jogo login. Pick "I have a login".';
    case 'auth/invalid-email': return 'That email address doesn’t look right.';
    case 'auth/weak-password': return 'Use 8+ characters with uppercase, lowercase and a number.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'That email and password don’t match.';
    case 'auth/user-not-found': return 'No Jogo login with that email. Pick "I’m new".';
    case 'auth/too-many-requests': return 'Too many tries. Wait a minute and try again.';
    default: return mode === 'signup' ? 'Couldn’t create your login. Try again.' : 'Couldn’t sign in. Try again.';
  }
}
const strongEnough = (pw) => pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw);

// How tall the phone may be: it shrinks on short laptop screens instead of
// running off the bottom.
function usePhoneScale() {
  const get = () => (typeof window === 'undefined' ? 1 : Math.min(1, Math.max(0.6, (window.innerHeight - 150) / (PHONE_H + 20))));
  const [scale, setScale] = useState(get);
  useEffect(() => {
    const on = () => setScale(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return scale;
}

function Section({ n, title, sub, children }) {
  return (
    <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-7">
      <div className="flex items-baseline gap-3 mb-5">
        <span style={DISPLAY} className="text-3xl text-[#16A34A] leading-[1.3]">{String(n).padStart(2, '0')}</span>
        <div className="min-w-0">
          <h2 style={DISPLAY} className="uppercase text-[1.7rem] leading-[1.3] text-[#0B0D10]">{title}</h2>
          {sub ? <p className="text-sm font-semibold text-[#5B6270] -mt-0.5">{sub}</p> : null}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const Label = ({ children, hint }) => (
  <div className="mb-1.5 flex items-baseline justify-between gap-3">
    <span className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#5B6270]">{children}</span>
    {hint ? <span className="text-xs font-semibold text-[#9AA0AB]">{hint}</span> : null}
  </div>
);

// A file input styled as whatever's inside; drops work too.
function Pick({ onFiles, multiple = false, className = '', children, label, onFocus }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => { onFocus?.(); input.current?.click(); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFocus?.(); input.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFocus?.(); onFiles([...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))); }}
      className={`cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#0B0D10] ${over ? 'ring-2 ring-[#16A34A]' : ''} ${className}`}
    >
      {children}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => { onFiles([...(e.target.files || [])]); e.target.value = ''; }}
      />
    </div>
  );
}

function Choice({ on, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-4 rounded-full text-sm font-extrabold border transition-colors ${on ? 'bg-[#0B0D10] border-[#0B0D10] text-white' : 'bg-white border-[#E6E8EC] text-[#0B0D10] hover:border-[#C9CED6]'}`}
    >
      {children}
    </button>
  );
}

function Stepper({ value, onChange, min, max }) {
  return (
    <div className="flex items-center gap-1 bg-[#F2F3F5] rounded-full p-1">
      <button type="button" aria-label="Fewer" disabled={value <= min} onClick={() => onChange(value - 1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center disabled:opacity-40"><Minus size={18} /></button>
      <span style={DISPLAY} className="w-10 text-center text-2xl leading-[1.3]">{value}</span>
      <button type="button" aria-label="More" disabled={value >= max} onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center disabled:opacity-40"><Plus size={18} /></button>
    </div>
  );
}

// ── Open hours: days you're open, one set of hours for all of them, or each
// day its own line (the app's VenueHoursEditor, without closed dates). ──
const OPEN_TIMES = [];
for (let m = HOURS_MIN; m < 24 * 60; m += HOURS_STEP) OPEN_TIMES.push(m);
const closeTimes = (open) => {
  const out = [];
  for (let m = open + HOURS_STEP; m <= HOURS_MAX; m += HOURS_STEP) out.push(m);
  return out;
};
const sameHours = (a, b) => a.open === b.open && a.close === b.close;

function TimeSelect({ value, options, onChange, label, onFocus }) {
  return (
    <select
      aria-label={label}
      value={value}
      onFocus={onFocus}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-11 rounded-xl bg-[#F2F3F5] pl-3 pr-8 font-bold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0B0D10] min-w-0"
    >
      {options.map((m) => <option key={m} value={m}>{timeText(m)}</option>)}
    </select>
  );
}

function HoursRange({ value, onChange, onFocus }) {
  const setOpen = (open) => onChange({ open, close: value.close > open ? value.close : Math.min(HOURS_MAX, open + 60) });
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <TimeSelect label="Opens" value={value.open} options={OPEN_TIMES} onChange={setOpen} onFocus={onFocus} />
      <span className="font-bold text-[#9AA0AB]">to</span>
      <TimeSelect label="Closes" value={value.close} options={closeTimes(value.open)} onChange={(close) => onChange({ ...value, close })} onFocus={onFocus} />
    </div>
  );
}

function HoursEditor({ hours, onChange, onFocus }) {
  const openDays = (hours || []).filter(Boolean);
  const [perDay, setPerDay] = useState(false);
  if (!hours) {
    return (
      <button
        type="button"
        onClick={() => { onFocus(); onChange(DEFAULT_HOURS()); }}
        className="w-full h-14 rounded-2xl bg-[#F2F3F5] hover:bg-[#ECEEF1] px-4 flex items-center gap-3 font-extrabold text-[#0B0D10]"
      >
        <Clock size={18} /> <span className="flex-1 text-left">Set your hours</span> <ArrowRight size={18} className="text-[#9AA0AB]" />
      </button>
    );
  }
  const shared = openDays[0] || null;
  const setDay = (i, v) => onChange(hours.map((d, k) => (k === i ? v : d)));
  const setAll = (v) => onChange(hours.map((d) => (d ? { ...v } : null)));
  const toggleDay = (i) => { onFocus(); setDay(i, hours[i] ? null : { ...(shared || DEFAULT_DAY) }); };
  const togglePerDay = () => {
    onFocus();
    if (perDay && shared) setAll(shared);
    setPerDay(!perDay);
  };
  const mixed = openDays.some((d) => !sameHours(d, openDays[0]));
  return (
    <div>
      <p className="text-sm font-semibold text-[#5B6270] mb-2">Days you’re open</p>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_ORDER.map((i) => {
          const on = !!hours[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              aria-pressed={on}
              className={`h-11 rounded-xl text-[13px] font-extrabold transition-colors ${on ? 'bg-[#0B0D10] text-white' : 'bg-[#F2F3F5] text-[#9AA0AB] line-through'}`}
            >
              {weekdayName(i)}
            </button>
          );
        })}
      </div>
      {!openDays.length ? (
        <p className="mt-3 text-sm font-bold text-[#BE123C]">Pick at least one day you’re open.</p>
      ) : perDay || mixed ? (
        <div className="mt-4 space-y-2">
          {WEEK_ORDER.filter((i) => hours[i]).map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-10 font-extrabold text-[#0B0D10]">{weekdayName(i)}</span>
              <HoursRange value={hours[i]} onChange={(v) => setDay(i, v)} onFocus={onFocus} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#5B6270] mb-2">Hours</p>
          <HoursRange value={shared} onChange={setAll} onFocus={onFocus} />
        </div>
      )}
      {openDays.length > 1 ? (
        <button type="button" onClick={togglePerDay} className="mt-3 text-sm font-extrabold text-[#0E7A43] hover:underline">
          {perDay || mixed ? 'Same hours every day' : 'Different hours on some days'}
        </button>
      ) : null}
    </div>
  );
}

// ── Address with type-ahead (Places API New) ──
function AddressField({ address, setAddress, setLocation, onFocus }) {
  const [sugs, setSugs] = useState([]);
  const picked = useRef(false);
  const session = useRef(newPlacesSession());
  useEffect(() => {
    if (picked.current) return undefined;
    if (address.trim().length < 3) { setSugs([]); return undefined; }
    let stale = false;
    const t = setTimeout(async () => {
      const res = await autocompletePlaces(address, session.current);
      if (!stale) setSugs(res);
    }, 250);
    return () => { stale = true; clearTimeout(t); };
  }, [address]);
  const pick = async (s) => {
    picked.current = true;
    setAddress(s.label);
    setSugs([]);
    const loc = await getPlaceLocation(s.id, session.current);
    if (loc) {
      setLocation({ latitude: loc.latitude, longitude: loc.longitude });
      if (loc.address) setAddress(loc.address);
    }
    session.current = newPlacesSession();
  };
  return (
    <div className="relative">
      <div className="relative">
        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0AB]" />
        <input
          className={`${inputCls} pl-11`}
          value={address}
          onFocus={onFocus}
          onChange={(e) => { picked.current = false; setLocation(null); setAddress(e.target.value); }}
          onBlur={() => setTimeout(() => setSugs([]), 150)}
          placeholder="Start typing your address"
          autoComplete="off"
        />
      </div>
      {sugs.length ? (
        <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-[#E6E8EC] shadow-xl overflow-hidden">
          {sugs.map((s) => (
            <button key={s.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(s)} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#F2F3F5]">
              <MapPin size={16} className="mt-0.5 text-[#5B6270] shrink-0" />
              <span className="min-w-0">
                <span className="block font-bold text-[#0B0D10] truncate">{s.main}</span>
                {s.secondary ? <span className="block text-sm font-semibold text-[#5B6270] truncate">{s.secondary}</span> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Handle({ value, onChange, onFocus, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-[#9AA0AB]">@</span>
      <input className={`${inputCls} pl-9`} value={value} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} onBlur={() => onChange(cleanHandle(value))} placeholder={placeholder} autoCapitalize="none" />
    </div>
  );
}

// ── Done ──
function Sent({ name, already }) {
  return (
    <div className="bg-[#0B0D10] text-white rounded-3xl p-7 sm:p-10">
      <div className="w-14 h-14 rounded-full bg-[#16A34A] flex items-center justify-center"><Check size={28} strokeWidth={3} /></div>
      <h2 style={DISPLAY} className="uppercase text-5xl sm:text-6xl leading-[1.15] mt-6">
        {already ? 'You’re already on Jogo' : <>{name}<br /><span className="text-[#4ADE80]">is in review</span></>}
      </h2>
      <p className="mt-4 text-white/70 font-semibold text-lg max-w-md">
        {already
          ? 'This login already has an indoor. Open it in the app to make changes, or sign in to your portal.'
          : 'We look at every indoor by hand, usually within a day. Get the app and sign in with this login: it tells you the moment you’re approved.'}
      </p>
      <div className="mt-8 border-t border-white/10 pt-7">
        <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-white/50 mb-3">Get the app to create games</div>
        <StoreRow invert />
        <a href={PORTAL} className="mt-6 inline-flex items-center gap-2 font-extrabold text-white/80 hover:text-[#4ADE80]">
          Your portal on the web <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}

export default function IndoorApply() {
  useMatchdayFonts();
  const phoneScale = usePhoneScale();

  const [banner, setBanner] = useState(null); // { file, url }
  const [logo, setLogo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [hours, setHours] = useState(null);
  const [fieldCount, setFieldCount] = useState(1);
  const [cancelHours, setCancelHours] = useState(48);
  const [cancelKeepPct, setCancelKeepPct] = useState(50);
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');

  const [focus, setFocus] = useState('hero');
  const [preview, setPreview] = useState(false); // phones: the full-screen preview
  const [photoError, setPhotoError] = useState(null);

  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('signup');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // what it's doing, in words
  const [sent, setSent] = useState(null); // { already }

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => { document.title = 'Apply · Jogo for indoors'; }, []);

  // Object URLs are freed when a photo is replaced or removed.
  const takeImage = async (file) => {
    setPhotoError(null);
    try {
      const { url } = await loadImage(file);
      return { file, url };
    } catch {
      setPhotoError('That photo won’t open here. Try a JPG or PNG.');
      return null;
    }
  };
  const setOne = (set, current) => async (files) => {
    if (!files[0]) return;
    const img = await takeImage(files[0]);
    if (!img) return;
    if (current) URL.revokeObjectURL(current.url);
    set(img);
  };
  const addPhotos = async (files) => {
    const room = MAX_PHOTOS - photos.length;
    const imgs = (await Promise.all(files.slice(0, room).map(takeImage))).filter(Boolean);
    if (imgs.length) setPhotos((p) => [...p, ...imgs].slice(0, MAX_PHOTOS));
  };
  const removePhoto = (i) => {
    URL.revokeObjectURL(photos[i].url);
    setPhotos(photos.filter((_, k) => k !== i));
  };

  const missing = !banner ? 'Add a banner photo'
    : !logo ? 'Add your logo'
    : !name.trim() ? 'Add your indoor’s name'
    : address.trim().length < 6 ? 'Add your address'
    : !hours ? 'Set your hours'
    : !hours.some(Boolean) ? 'Pick at least one day you’re open'
    : null;

  const previewVenue = useMemo(() => ({
    name, bio, address, location, hours, fieldCount, instagram, tiktok, website,
    city: cityFromAddress(address),
    bannerSrc: banner?.url, logoSrc: logo?.url, photoSrcs: photos.map((p) => p.url),
  }), [name, bio, address, location, hours, fieldCount, instagram, tiktok, website, banner, logo, photos]);

  const reset = async () => {
    if (!email.trim()) { setError('Type your email first.'); return; }
    setError(null);
    try { await sendPasswordResetEmail(auth, email.trim()); setNote('Check your email for a link to reset your password.'); } catch { setError('Couldn’t send that. Check your email address.'); }
  };

  const send = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null); setNote(null);
    if (missing) { setError(missing); return; }
    let who = user;
    if (!who) {
      if (mode === 'signup' && !ownerName.trim()) { setError('Add your name.'); return; }
      if (!email.trim() || !password) { setError('Add your email and a password.'); return; }
      if (mode === 'signup' && !strongEnough(password)) { setError('Use 8+ characters with uppercase, lowercase and a number.'); return; }
    }
    try {
      if (!who) {
        setBusy(mode === 'signup' ? 'Creating your login…' : 'Signing in…');
        if (mode === 'signup') {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          try { await updateProfile(cred.user, { displayName: ownerName.trim() }); } catch { /* the name is optional on the venue */ }
          who = cred.user;
        } else {
          who = (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
        }
      }
    } catch (err) {
      setError(authError(err, mode));
      setBusy(null);
      return;
    }
    try {
      setBusy('Checking your address…');
      const existing = await getVenue(who.uid);
      if (existing && existing.status !== 'denied') { setSent({ already: true }); setBusy(null); return; }
      let place = location;
      let where = address;
      if (!place) {
        const found = await geocodeAddress(address);
        if (!found) {
          setError('We couldn’t find that address. Check it, or pick one of the suggestions as you type.');
          setBusy(null);
          return;
        }
        place = { latitude: found.latitude, longitude: found.longitude };
        where = found.address;
        setLocation(place); setAddress(where);
      }
      setBusy('Uploading your photos…');
      await submitVenue(who, {
        name, bio, address: where, location: place, instagram, tiktok, website, fieldCount, cancelHours, cancelKeepPct, hours,
        logo: logo.file, banner: banner.file, photos: photos.map((p) => p.file),
      }, existing);
      setSent({ already: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('indoor apply failed:', err);
      setError('Couldn’t send it. Check your connection and try again.');
    }
    setBusy(null);
  };

  const f = (part) => () => setFocus(part);

  return (
    <div style={BODY} className="min-h-screen bg-[#EDEEF1] text-[#0B0D10] antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#EDEEF1]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <a href="/indoors" className="flex items-center gap-3" aria-label="Jogo for indoors">
            <img src={jogoLogo} alt="Jogo" className="h-[20px] w-auto" />
            <span className="hidden sm:inline text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#5B6270]">for indoors</span>
          </a>
          <a href={PORTAL} className="px-3 py-2 rounded-xl text-sm font-bold text-[#5B6270] hover:text-[#0B0D10] hover:bg-black/5">Owner sign in</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 grid lg:grid-cols-[minmax(0,1fr)_440px] gap-10 xl:gap-16 items-start">
        {/* ── The form ── */}
        <div className="min-w-0 max-w-[640px] w-full mx-auto lg:mx-0">
          {sent ? (
            <Sent name={name.trim()} already={sent.already} />
          ) : (
            <form onSubmit={send} className="space-y-5" noValidate>
              <div className="pb-2">
                <div className="text-xs font-extrabold tracking-[0.2em] uppercase text-[#16A34A]">Host on Jogo</div>
                <h1 style={DISPLAY} className="uppercase text-[3rem] sm:text-6xl leading-[1.1] mt-2">Build your page</h1>
                <p className="mt-3 text-[#5B6270] font-semibold text-lg max-w-lg">
                  <span className="hidden lg:inline">Watch it come together on the right as you go. </span>
                  We review every indoor, usually within a day.
                </p>
              </div>

              <Section n={1} title="Your look" sub="The first thing players see">
                <div>
                  <Label hint="Wide works best">Banner photo</Label>
                  <Pick label="Add a banner photo" onFiles={setOne(setBanner, banner)} onFocus={f('hero')} className="block rounded-2xl overflow-hidden">
                    {banner ? (
                      <div className="relative aspect-[16/7] bg-[#0B0D10]">
                        <img src={banner.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <span className="absolute right-3 bottom-3 rounded-full bg-black/60 text-white text-xs font-extrabold px-3 py-1.5">Change</span>
                      </div>
                    ) : (
                      <div className="aspect-[16/7] bg-[#F2F3F5] border-2 border-dashed border-[#D5D9DF] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#5B6270] hover:bg-[#ECEEF1]">
                        <ImagePlus size={26} />
                        <span className="font-extrabold">Add a banner photo</span>
                        <span className="text-sm font-semibold text-[#9AA0AB]">Click or drop it here</span>
                      </div>
                    )}
                  </Pick>
                </div>

                <div className="flex items-center gap-5">
                  <Pick label="Add your logo" onFiles={setOne(setLogo, logo)} onFocus={f('hero')} className="shrink-0 rounded-[22px]">
                    <div className="w-24 h-24 rounded-[22px] overflow-hidden bg-[#F2F3F5] border-2 border-dashed border-[#D5D9DF] flex flex-col items-center justify-center text-[#5B6270] hover:bg-[#ECEEF1]" style={logo ? { border: '3px solid #FFFFFF', boxShadow: '0 0 0 1px #E6E8EC' } : null}>
                      {logo ? <img src={logo.url} alt="" className="w-full h-full object-cover" /> : <><Plus size={22} /><span className="text-[11px] font-extrabold tracking-[0.14em]">LOGO</span></>}
                    </div>
                  </Pick>
                  <div className="min-w-0 flex-1">
                    <Label>Name</Label>
                    <input className={inputCls} value={name} maxLength={60} onFocus={f('hero')} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kickoff Indoor Arena" />
                  </div>
                </div>

                <div>
                  <Label hint={`${photos.length} of ${MAX_PHOTOS}`}>More photos</Label>
                  <p className="text-sm font-semibold text-[#5B6270] -mt-0.5 mb-2">Players swipe through these on your banner</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((p, i) => (
                      <div key={p.url} className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F3F5]">
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(i)} aria-label="Remove photo" className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={14} /></button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS ? (
                      <Pick label="Add photos" multiple onFiles={addPhotos} onFocus={f('hero')} className="rounded-xl">
                        <div className="aspect-square rounded-xl bg-[#F2F3F5] border-2 border-dashed border-[#D5D9DF] flex flex-col items-center justify-center gap-1 text-[#5B6270] hover:bg-[#ECEEF1]">
                          <Plus size={22} /><span className="text-sm font-extrabold">Add photos</span>
                        </div>
                      </Pick>
                    ) : null}
                  </div>
                </div>
                {photoError ? <p className="text-sm font-bold text-[#BE123C]">{photoError}</p> : null}
              </Section>

              <Section n={2} title="About" sub="What makes your place good to play at">
                <div>
                  <Label hint={`${bio.length}/500`}>About</Label>
                  <textarea
                    className={`${inputCls} h-auto min-h-[120px] py-3 resize-y`}
                    value={bio}
                    maxLength={500}
                    onFocus={f('about')}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Turf, field sizes, parking, what to bring…"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label hint="Optional">Instagram</Label><Handle value={instagram} onChange={setInstagram} onFocus={f('about')} placeholder="yourindoor" /></div>
                  <div><Label hint="Optional">TikTok</Label><Handle value={tiktok} onChange={setTiktok} onFocus={f('about')} placeholder="yourindoor" /></div>
                </div>
                <div>
                  <Label hint="Optional">Website</Label>
                  <input className={inputCls} type="url" value={website} onFocus={f('about')} onChange={(e) => setWebsite(e.target.value)} placeholder="yourindoor.com" autoCapitalize="none" />
                </div>
              </Section>

              <Section n={3} title="Where and when">
                <div>
                  <Label>Address</Label>
                  <AddressField address={address} setAddress={setAddress} setLocation={setLocation} onFocus={f('map')} />
                </div>
                <div>
                  <Label>Open hours</Label>
                  <HoursEditor hours={hours} onChange={setHours} onFocus={f('hours')} />
                </div>
              </Section>

              <Section n={4} title="Fields and bookings" sub="Sets up your tools. You can change these later.">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold">How many fields do you have?</div>
                    <div className="text-sm font-semibold text-[#5B6270]">Sets up your schedule and check-in</div>
                  </div>
                  <Stepper value={fieldCount} onChange={setFieldCount} min={1} max={MAX_FIELDS} />
                </div>
                <div className="border-t border-[#EEF0F3] pt-5">
                  <div className="font-extrabold mb-2">When someone rents a field, free cancellation until</div>
                  <div className="flex flex-wrap gap-2">
                    {CANCEL_HOURS.map((h) => <Choice key={h} on={cancelHours === h} onClick={() => setCancelHours(h)}>{h} hrs before</Choice>)}
                  </div>
                  <div className="font-extrabold mt-4 mb-2">After that, you keep</div>
                  <div className="flex flex-wrap gap-2">
                    {CANCEL_KEEP.map((p) => <Choice key={p} on={cancelKeepPct === p} onClick={() => setCancelKeepPct(p)}>{p === 100 ? 'All of it' : `${p}%`}</Choice>)}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#5B6270]">
                    {`Players who rent a field can cancel for free until ${cancelHours} hours before. After that you keep ${cancelKeepPct === 100 ? 'the full price' : `${cancelKeepPct}%`}. If you cancel, they always get it all back.`}
                  </p>
                </div>
              </Section>

              <Section n={5} title="Send it" sub={user ? null : 'Your login for the app and your web portal'}>
                {user ? (
                  <p className="font-semibold text-[#5B6270]">
                    Sending as <span className="font-extrabold text-[#0B0D10]">{user.displayName || user.email}</span> ·{' '}
                    <button type="button" onClick={() => signOut(auth)} className="underline underline-offset-2 hover:text-[#0B0D10]">Not you?</button>
                  </p>
                ) : (
                  <>
                    <div className="flex bg-[#F2F3F5] rounded-full p-1">
                      {[['signup', 'I’m new'], ['login', 'I have a login']].map(([m, l]) => (
                        <button key={m} type="button" onClick={() => { setMode(m); setError(null); setNote(null); }} className={`flex-1 h-10 rounded-full text-sm font-extrabold transition-colors ${mode === m ? 'bg-[#0B0D10] text-white' : 'text-[#5B6270]'}`}>{l}</button>
                      ))}
                    </div>
                    {mode === 'signup' ? (
                      <div><Label>Your name</Label><input className={inputCls} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} autoComplete="name" placeholder="First and last name" /></div>
                    ) : null}
                    <div><Label>Email</Label><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
                    <div>
                      <Label hint={mode === 'signup' ? '8+ characters, A–Z, a–z, 0–9' : null}>Password</Label>
                      <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                    </div>
                    {mode === 'login' ? <button type="button" onClick={reset} className="text-sm font-bold text-[#5B6270] hover:text-[#0B0D10]">Forgot your password?</button> : null}
                  </>
                )}
                {error ? <p className="text-sm font-bold text-[#BE123C]">{error}</p> : null}
                {note ? <p className="text-sm font-bold text-[#0E7A43]">{note}</p> : null}
                <button
                  type="submit"
                  disabled={!!busy}
                  className="w-full h-14 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-colors"
                >
                  {busy ? <><Loader2 size={20} className="animate-spin" /> {busy}</> : <>Send for review <ArrowRight size={20} /></>}
                </button>
                {missing && !error ? <p className="text-sm font-semibold text-[#9AA0AB] text-center -mt-2">{missing}</p> : null}
                <p className="text-xs font-semibold text-[#9AA0AB] text-center">
                  By sending, you agree to the <a href="/host-terms" className="underline">Host Terms</a> and <a href="/terms" className="underline">Terms</a>.
                </p>
              </Section>
            </form>
          )}
        </div>

        {/* ── The live page (desktop) ── */}
        <aside className="hidden lg:block sticky top-24">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs font-extrabold tracking-[0.18em] uppercase text-[#5B6270]">
            <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-[#16A34A] animate-ping opacity-60" /><span className="relative w-2 h-2 rounded-full bg-[#16A34A]" /></span>
            {sent ? 'Your page' : 'Live preview · what players see'}
          </div>
          <div style={{ height: (PHONE_H + 20) * phoneScale }}>
            <div style={{ transform: `scale(${phoneScale})`, transformOrigin: 'top center' }}>
              <VenuePreview venue={previewVenue} focus={focus} height={PHONE_H} />
            </div>
          </div>
        </aside>
      </div>

      {/* ── Phones: the preview pill + full-screen preview ── */}
      {!sent ? (
        <button
          type="button"
          onClick={() => setPreview(true)}
          className="lg:hidden fixed z-40 left-1/2 -translate-x-1/2 bottom-5 inline-flex items-center gap-2 rounded-full bg-[#0B0D10] text-white font-extrabold px-5 h-12 shadow-[0_14px_30px_-10px_rgba(11,13,16,0.6)]"
        >
          <Eye size={18} /> Preview my page
        </button>
      ) : null}
      <AnimatePresence>
        {preview ? <MobilePreview venue={previewVenue} focus="hero" onClose={() => setPreview(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function MobilePreview({ venue, focus, onClose }) {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('resize', on); document.body.style.overflow = prev; };
  }, []);
  // The whole phone fits: under the close bar, inside a 16px gutter.
  const scale = Math.min(1, (size.w - 32) / 380, (size.h - 110) / (PHONE_H + 20));
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="lg:hidden fixed inset-0 z-50 bg-[#0B0D10] flex flex-col items-center"
      role="dialog"
      aria-label="Preview of your page"
    >
      <div className="w-full flex items-center justify-between px-4 h-16 shrink-0">
        <img src={jogoLogoWhite} alt="Jogo" className="h-[18px] w-auto" />
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#0B0D10] font-extrabold px-4 h-10">
          <X size={16} /> Back to form
        </button>
      </div>
      <div style={{ height: (PHONE_H + 20) * scale, width: 380 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 380 }}>
          <VenuePreview venue={venue} focus={focus} height={PHONE_H} ring={false} />
        </div>
      </div>
      <div className="mt-3 text-xs font-extrabold tracking-[0.18em] uppercase text-white/50 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-[#4ADE80]" /> What players see once you’re approved
      </div>
    </motion.div>
  );
}

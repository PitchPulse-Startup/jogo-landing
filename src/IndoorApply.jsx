// src/IndoorApply.jsx — jogous.io/indoors/apply, an indoor applies to host on
// Jogo without the app. The same application as the app's VenueApplyScreen
// (jogo-APP screens/venue/VenueApplyScreen.js) and the same venue doc
// (src/indoor/applyKit.js submitVenue), reviewed by hand in Jogo-admin.
//
// Desktop: the form on the left, the page it makes on the right, drawn live in
// a phone (src/indoor/VenuePreview.jsx). Phones: the form, plus a floating
// "Preview my page" pill that opens the page full screen (FullPreview).
//
// The login comes LAST: they build the page first, then create a Jogo login
// (or sign in) to send it. One-off closed dates aren't asked here; they set
// those later in the app.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  onAuthStateChanged, updateProfile, signOut,
} from 'firebase/auth';
import { ImagePlus, Plus, X, Loader2, Eye, ArrowRight, Check } from 'lucide-react';
import jogoLogo from './assets/jogo-logo-2026.png';
import { DISPLAY, BODY, useMatchdayFonts, StoreRow } from './App.jsx';
import { auth } from './firebase';
import VenuePreview, { FullPreview } from './indoor/VenuePreview.jsx';
import {
  MAX_FIELDS, MAX_PHOTOS, CANCEL_HOURS, CANCEL_KEEP, loadImage, geocodeAddress, cityFromAddress, getVenue, submitVenue,
} from './indoor/applyKit';
import {
  PHONE_H, inputCls, usePhoneScale, Section, Label, Pick, Choice, Stepper, HoursEditor, AddressField, Handle,
} from './indoor/formKit.jsx';

const PORTAL = '/indoors/portal';
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

  // Already signed in (e.g. "Fix and send again" from the portal): a denied
  // indoor's form comes back filled in with what it sent, plus the reason; an
  // indoor that's in review or live isn't asked to apply again.
  const [denied, setDenied] = useState(null);
  const sending = useRef(false); // a login made by Send itself isn't a returning owner
  useEffect(() => {
    if (!user) { setDenied(null); return undefined; }
    if (sending.current) return undefined;
    let stale = false;
    getVenue(user.uid).then((v) => {
      if (stale || !v || sending.current) return;
      if (v.status !== 'denied') { setSent({ already: true }); return; }
      const img = (url) => (url ? { file: url, url } : null); // already uploaded: saved as-is
      setDenied(v);
      setBanner(img(v.bannerUrl)); setLogo(img(v.logoUrl)); setPhotos((v.photos || []).map(img).filter(Boolean));
      setName(v.name || ''); setBio(v.bio || ''); setAddress(v.address || ''); setLocation(v.location || null);
      setHours(v.hours || null); setFieldCount(v.fieldCount || 1);
      setCancelHours(v.cancelHours || 48); setCancelKeepPct(v.cancelKeepPct || 50);
      setInstagram(v.instagram || ''); setTiktok(v.tiktok || ''); setWebsite(v.website || '');
    }).catch(() => {});
    return () => { stale = true; };
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

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
    sending.current = true;
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
      sending.current = false;
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
  const closePreview = useCallback(() => setPreview(false), []);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-28 lg:pb-12 grid lg:grid-cols-[minmax(0,1fr)_440px] gap-10 xl:gap-16 items-start">
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
              {denied ? (
                <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-3xl p-5 sm:p-6">
                  <div className="text-xs font-extrabold tracking-[0.16em] uppercase text-[#BE123C]">What to fix</div>
                  <p className="mt-1.5 font-semibold text-[#0B0D10] text-lg whitespace-pre-wrap">{denied.denyReason || 'Check your photos, name and address, then send it again.'}</p>
                </div>
              ) : null}

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
                  {busy ? <><Loader2 size={20} className="animate-spin" /> {busy}</> : <>{denied ? 'Send again' : 'Send for review'} <ArrowRight size={20} /></>}
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
      {preview ? <FullPreview venue={previewVenue} onClose={closePreview} /> : null}
    </div>
  );
}

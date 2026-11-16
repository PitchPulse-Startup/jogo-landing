// src/indoor/applyKit.js — what the web indoor application (src/IndoorApply.jsx)
// needs from the app, copied so both write the same venue doc:
//   jogo-APP services/venues.js      saveVenue, cleanHandle, cleanWebsite, limits
//   jogo-APP services/venueHours.js  hours shape, clock, hoursLines, openStatus
//   jogo-APP utils/placesApi.js      address type-ahead + state/city lookup
//   jogo-APP lib/uploadImage.js      resize → JPEG 0.75 → year-long cache, timestamped paths
// Change one side, change the other.
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// ── Limits (services/venues.js) ──────────────────────────────────────────
export const MAX_FIELDS = 12;
export const MAX_PHOTOS = 12;
export const CANCEL_HOURS = [24, 48, 72];
export const CANCEL_KEEP = [25, 50, 100];

// ── Hours (services/venueHours.js) ───────────────────────────────────────
// hours: 7 entries, Sunday first, { open, close } in minutes from midnight or
// null = closed. Opens 6 AM at the earliest; close may run to 3 AM (1620),
// which still belongs to that day.
export const HOURS_MIN = 6 * 60;
export const MIDNIGHT = 24 * 60;
export const HOURS_MAX = 27 * 60;
export const HOURS_STEP = 30;
export const DEFAULT_DAY = { open: 9 * 60, close: 23 * 60 };
export const DEFAULT_HOURS = () => Array.from({ length: 7 }, () => ({ ...DEFAULT_DAY }));
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const weekdayName = (i) => WEEKDAYS[i];

export const clock = (m) => {
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};
// The hours pickers' wording: "Midnight", and "1 AM (next day)" past it.
export const timeText = (m) => (m === MIDNIGHT ? 'Midnight' : m > MIDNIGHT ? `${clock(m)} (next day)` : clock(m));

const dayText = (h) => (h ? `${clock(h.open)} – ${clock(h.close)}` : 'Closed');

/** Days with the same hours, joined: [{ days: 'Mon – Fri', text: '9 AM – 11 PM', today }]. */
export const hoursLines = (hours, now = new Date()) => {
  if (!Array.isArray(hours) || hours.length !== 7) return [];
  const out = [];
  WEEK_ORDER.forEach((i) => {
    const text = dayText(hours[i]);
    const last = out[out.length - 1];
    if (last && last.text === text) { last.to = i; last.ids.push(i); } else out.push({ from: i, to: i, text, ids: [i] });
  });
  return out.map((l) => ({
    days: l.from === l.to ? weekdayName(l.from) : `${weekdayName(l.from)} – ${weekdayName(l.to)}`,
    text: l.text,
    today: l.ids.includes(now.getDay()),
  }));
};

/** "Open now · until 11 PM", "Closed · opens at 9 AM", "Closed · opens Tue 9 AM". */
export const openStatus = (hours, now = new Date()) => {
  if (!Array.isArray(hours) || hours.length !== 7) return null;
  const on = (d) => hours[d.getDay()] || null;
  const mins = now.getHours() * 60 + now.getMinutes();
  const lastNight = on(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  if (lastNight && mins + MIDNIGHT < lastNight.close) return { open: true, text: `Open now · until ${clock(lastNight.close)}` };
  const today = on(now);
  if (today && mins >= today.open && mins < today.close) return { open: true, text: `Open now · until ${clock(today.close)}` };
  if (today && mins < today.open) return { open: false, text: `Closed · opens at ${clock(today.open)}` };
  for (let i = 1; i <= 7; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const h = on(d);
    if (h) return { open: false, text: `Closed · opens ${i === 1 ? 'tomorrow' : weekdayName(d.getDay())} ${clock(h.open)}` };
  }
  return { open: false, text: 'Closed' };
};

// ── Socials (services/venues.js) ─────────────────────────────────────────
/** "@jogo", "instagram.com/jogo/" → "jogo" */
export const cleanHandle = (s) =>
  String(s || '').trim().replace(/^https?:\/\/(www\.)?(instagram|tiktok)\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '').slice(0, 40);

export const cleanWebsite = (s) => {
  const v = String(s || '').trim();
  if (!v) return '';
  return (/^https?:\/\//i.test(v) ? v : `https://${v}`).slice(0, 200);
};

// ── Address (utils/placesApi.js) ─────────────────────────────────────────
// The app's Maps key (app.json). Places API (New) and Geocoding both answer
// browser calls from jogous.io.
const MAPS_KEY = 'AIzaSyDu5z4Jo-W8XFnNXTVhvQAaFGmd26vi7hI';

export const newPlacesSession = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const autocompletePlaces = async (input, sessionToken) => {
  const text = String(input || '').trim();
  if (!text) return [];
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': MAPS_KEY },
      body: JSON.stringify({ input: text, sessionToken, includedRegionCodes: ['us'] }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return [];
    return (data.suggestions || [])
      .map((x) => x.placePrediction)
      .filter(Boolean)
      .slice(0, 4)
      .map((p) => ({
        id: p.placeId,
        main: p.structuredFormat?.mainText?.text || p.text?.text || '',
        secondary: p.structuredFormat?.secondaryText?.text || '',
        label: p.text?.text || '',
      }));
  } catch {
    return [];
  }
};

export const getPlaceLocation = async (placeId, sessionToken) => {
  try {
    const qs = sessionToken ? `?sessionToken=${encodeURIComponent(sessionToken)}` : '';
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}${qs}`, {
      headers: { 'X-Goog-Api-Key': MAPS_KEY, 'X-Goog-FieldMask': 'location,formattedAddress' },
    });
    const data = await res.json();
    if (!data?.location) return null;
    return { latitude: data.location.latitude, longitude: data.location.longitude, address: data.formattedAddress || null };
  } catch {
    return null;
  }
};

/** A typed-out address (no suggestion tapped) → coordinates, or null. */
export const geocodeAddress = async (text) => {
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(text.trim())}&key=${MAPS_KEY}`);
    const data = await res.json();
    const hit = data.status === 'OK' ? data.results?.[0] : null;
    if (!hit?.geometry?.location) return null;
    return { latitude: hit.geometry.location.lat, longitude: hit.geometry.location.lng, address: hit.formatted_address || text.trim() };
  } catch {
    return null;
  }
};

// Same fallback chain as the app, so state/city match games, fields and crews.
const CITY_COMPONENT_PRIORITY = ['locality', 'postal_town', 'sublocality', 'administrative_area_level_2'];
export const reverseGeocodeStateCity = async (latitude, longitude) => {
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPS_KEY}`);
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.length) return { state: null, city: null };
    let state = null;
    let city = null;
    for (const result of data.results) {
      const components = result.address_components || [];
      if (!state) {
        const st = components.find((c) => c.types.includes('administrative_area_level_1'));
        if (st) state = st.long_name;
      }
      if (!city) {
        for (const type of CITY_COMPONENT_PRIORITY) {
          const c = components.find((x) => x.types.includes(type));
          if (c) { city = c.long_name; break; }
        }
      }
      if (state && city) break;
    }
    return { state, city };
  } catch {
    return { state: null, city: null };
  }
};

/** The city part of an address for the preview ("Indoor · Cherry Hill"). */
export const cityFromAddress = (address) => {
  const parts = String(address || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3) return parts[parts.length - 3];
  return '';
};

// ── Images (lib/uploadImage.js) ──────────────────────────────────────────
// Width caps per purpose; never upscaled; every upload re-encoded as JPEG 0.75.
const PRESETS = { crew: 800, photo: 1600, banner: 1600 };
// Safe because every path is timestamped: a new image is always a new URL.
const CACHE_HEADER = 'public, max-age=31536000, immutable';

/** Can the browser draw it? (Chrome can't open an iPhone HEIC.) */
export const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => resolve({ img, url });
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
  img.src = url;
});

const toJpeg = async (file, maxWidth) => {
  const { img, url } = await loadImage(file);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; // a transparent PNG logo turns white, not black
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', 0.75));
};

export const uploadImage = async (file, preset, path) => {
  const blob = await toJpeg(file, PRESETS[preset]);
  const r = ref(storage, path);
  await uploadBytes(r, blob, { contentType: 'image/jpeg', cacheControl: CACHE_HEADER });
  return getDownloadURL(r);
};

// Same folders as the app (storage rules: banners/{uid}, squad_images/{uid}).
export const upload = (uid, file, kind, i = 0) => {
  if (!file) return Promise.resolve(null);
  if (typeof file === 'string') return Promise.resolve(file); // already uploaded
  const t = Date.now();
  if (kind === 'photo') return uploadImage(file, 'photo', `banners/${uid}/${t}_${i}_venue_photo.jpg`);
  if (kind === 'banner') return uploadImage(file, 'banner', `banners/${uid}/${t}_venue_banner.jpg`);
  return uploadImage(file, 'crew', `squad_images/${uid}/${t}_venue_logo.jpg`);
};

// ── The venue doc (services/venues.js saveVenue) ─────────────────────────
export const getVenue = async (uid) => {
  const snap = await getDoc(doc(db, 'venues', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * First application, or sending again after a denial. Never touches a
 * pending or approved indoor (the caller checks first).
 * form: { name, bio, address, location, instagram, tiktok, website, logo,
 *         banner, photos, fieldCount, cancelHours, cancelKeepPct, hours }
 * logo/banner/photos are File objects (or URLs already uploaded).
 */
// The profile half of the venue doc, built the same way for an application and
// for an edit. Uploads any new images first.
const buildProfile = async (uid, form, existing) => {
  const [logoUrl, bannerUrl, photos] = await Promise.all([
    upload(uid, form.logo, 'logo'),
    upload(uid, form.banner, 'banner'),
    Promise.all((form.photos || []).slice(0, MAX_PHOTOS).map((f, i) => upload(uid, f, 'photo', i))),
  ]);
  const profile = {
    name: form.name.trim().slice(0, 60),
    bio: (form.bio || '').trim().slice(0, 500),
    logoUrl: logoUrl || null,
    bannerUrl: bannerUrl || null,
    address: form.address || null,
    location: form.location ? { latitude: form.location.latitude, longitude: form.location.longitude } : null,
    instagram: cleanHandle(form.instagram),
    tiktok: cleanHandle(form.tiktok),
    website: cleanWebsite(form.website),
    fieldCount: Math.min(MAX_FIELDS, Math.max(1, Math.round(Number(form.fieldCount) || 1))),
    cancelHours: CANCEL_HOURS.includes(form.cancelHours) ? form.cancelHours : 48,
    cancelKeepPct: CANCEL_KEEP.includes(form.cancelKeepPct) ? form.cancelKeepPct : 50,
    photos,
    hours: form.hours || null,
    closedDates: (form.closedDates ?? existing?.closedDates ?? []).slice(0, 60),
    updatedAt: serverTimestamp(),
  };
  if (profile.location) {
    const moved = !existing?.location || existing.location.latitude !== profile.location.latitude || existing.location.longitude !== profile.location.longitude;
    if (moved || !existing?.state) {
      const { state, city } = await reverseGeocodeStateCity(profile.location.latitude, profile.location.longitude);
      if (state) { profile.state = state; profile.city = city; }
    }
  }
  return profile;
};

export const submitVenue = async (user, form, existing = null) => {
  const uid = user.uid;
  const profile = await buildProfile(uid, form, existing);
  const venueRef = doc(db, 'venues', uid);
  if (!existing) {
    await setDoc(venueRef, {
      ...profile,
      ownerId: uid,
      ownerEmail: user.email || null,
      ownerName: user.displayName || null,
      status: 'pending',
      createdAt: serverTimestamp(),
      appliedAt: serverTimestamp(),
    });
  } else if (existing.status === 'denied') {
    await updateDoc(venueRef, { ...profile, status: 'pending', appliedAt: serverTimestamp() });
  } else {
    throw new Error('already-applied');
  }
};

/** The portal's Edit page: saves the profile of a live (or pending) indoor. */
export const saveVenueProfile = async (venue, form) => {
  const profile = await buildProfile(venue.id, form, venue);
  await updateDoc(doc(db, 'venues', venue.id), profile);
};

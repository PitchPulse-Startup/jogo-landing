// src/indoor/PageEditor.jsx — the portal's "Your page" tab: everything the app's
// Edit page does (jogo-APP screens/venue/VenueApplyScreen.js in edit mode),
// next to the page itself in a phone with the indoor's real games and posts.
// Nothing saves until they press Save; the phone shows the change right away.
import React, { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Plus, X, CalendarX2 } from 'lucide-react';
import {
  MAX_FIELDS, MAX_PHOTOS, CANCEL_HOURS, CANCEL_KEEP, loadImage, geocodeAddress, saveVenueProfile,
} from './applyKit';
import {
  PHONE_H, inputCls, usePhoneScale, Section, Label, Pick, Choice, Stepper, HoursEditor, AddressField, Handle,
} from './formKit.jsx';
import VenuePreview, { FullPreview, previewFromVenue } from './VenuePreview.jsx';
import { toast } from './Toast.jsx';

const img = (url) => (url ? { file: url, url } : null); // already uploaded: saved as-is
const fromVenue = (v) => ({
  banner: img(v.bannerUrl), logo: img(v.logoUrl), photos: (v.photos || []).map(img).filter(Boolean),
  name: v.name || '', bio: v.bio || '', address: v.address || '', location: v.location || null,
  hours: v.hours || null, closedDates: v.closedDates || [], fieldCount: v.fieldCount || 1,
  cancelHours: v.cancelHours || 48, cancelKeepPct: v.cancelKeepPct || 50,
  instagram: v.instagram || '', tiktok: v.tiktok || '', website: v.website || '',
});
const sig = (f) => JSON.stringify({ ...f, banner: f.banner?.url, logo: f.logo?.url, photos: f.photos.map((p) => p.url) });
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const keyLabel = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// One-off days the indoor is closed (holidays). The app has the same list.
function ClosedDates({ value, onChange, onFocus }) {
  const [pick, setPick] = useState('');
  const upcoming = value.filter((k) => k >= todayKey()).sort();
  const add = () => {
    if (!pick || value.includes(pick)) return;
    onChange([...value.filter((k) => k >= todayKey()), pick].sort().slice(0, 60));
    setPick('');
  };
  return (
    <div>
      <div className="flex gap-2">
        <input type="date" min={todayKey()} value={pick} onFocus={onFocus} onChange={(e) => setPick(e.target.value)} className={`${inputCls} flex-1 min-w-0`} />
        <button type="button" disabled={!pick} onClick={add} className="h-12 px-5 rounded-xl bg-[#0B0D10] text-white font-extrabold disabled:opacity-40">Add</button>
      </div>
      {upcoming.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {upcoming.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 h-9 pl-3 pr-1.5 rounded-full bg-[#FFF1F2] text-[#BE123C] text-sm font-extrabold">
              <CalendarX2 size={14} /> {keyLabel(k)}
              <button type="button" aria-label={`Open on ${keyLabel(k)}`} onClick={() => onChange(value.filter((x) => x !== k))} className="w-6 h-6 rounded-full hover:bg-[#FECDD3] flex items-center justify-center"><X size={13} /></button>
            </span>
          ))}
        </div>
      ) : <p className="mt-2 text-sm font-semibold text-[#9AA0AB]">No closed days coming up.</p>}
    </div>
  );
}

export default function PageEditor({ venue, games, posts, followers }) {
  const phoneScale = usePhoneScale();
  const [form, setForm] = useState(() => fromVenue(venue));
  const [saved, setSaved] = useState(() => sig(fromVenue(venue)));
  const [focus, setFocus] = useState('hero');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const dirty = sig(form) !== saved;

  // Saved from the app meanwhile: pick it up unless they're mid-edit here.
  useEffect(() => {
    if (!dirty) { const f = fromVenue(venue); setForm(f); setSaved(sig(f)); }
  }, [venue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === 'function' ? v(f[k]) : v }));
  const f = (part) => () => setFocus(part);
  const take = async (file) => {
    try { const { url } = await loadImage(file); return { file, url }; } catch { setError('That photo won’t open here. Try a JPG or PNG.'); return null; }
  };
  const setOne = (k) => async (files) => { if (files[0]) { const i = await take(files[0]); if (i) set(k)(i); } };
  const addPhotos = async (files) => {
    const imgs = (await Promise.all(files.slice(0, MAX_PHOTOS - form.photos.length).map(take))).filter(Boolean);
    if (imgs.length) set('photos')((p) => [...p, ...imgs].slice(0, MAX_PHOTOS));
  };

  const missing = !form.name.trim() ? 'Add your indoor’s name' : !form.logo ? 'Add your logo' : !form.banner ? 'Add a banner photo' : form.address.trim().length < 6 ? 'Add your address' : null;

  const save = async () => {
    if (missing) { setError(missing); return; }
    setBusy(true); setError(null);
    try {
      let { location, address } = form;
      if (!location) {
        const found = await geocodeAddress(address);
        if (!found) { setError('We couldn’t find that address. Pick one of the suggestions as you type.'); setBusy(false); return; }
        location = { latitude: found.latitude, longitude: found.longitude };
        address = found.address;
      }
      const next = { ...form, location, address };
      await saveVenueProfile(venue, {
        ...next, logo: next.logo.file, banner: next.banner.file, photos: next.photos.map((p) => p.file),
      });
      setForm(next);
      setSaved(sig(next));
      toast('Your page is updated', 'Players see the new version now.');
    } catch (e) {
      console.error('saving the page failed:', e);
      setError('Couldn’t save. Check your connection and try again.');
    }
    setBusy(false);
  };

  const page = useMemo(() => ({
    ...previewFromVenue(venue),
    name: form.name, bio: form.bio, address: form.address, location: form.location, hours: form.hours,
    fieldCount: form.fieldCount, instagram: form.instagram, tiktok: form.tiktok, website: form.website,
    bannerSrc: form.banner?.url, logoSrc: form.logo?.url, photoSrcs: form.photos.map((p) => p.url), followers,
  }), [venue, form, followers]);

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
      <div className="min-w-0 space-y-5 pb-24">
        <Section n={1} title="Your look" sub="The first thing players see">
          <div>
            <Label hint="Wide works best">Banner photo</Label>
            <Pick label="Change your banner" onFiles={setOne('banner')} onFocus={f('hero')} className="block rounded-2xl overflow-hidden">
              {form.banner ? (
                <div className="relative aspect-[16/7] bg-[#0B0D10]">
                  <img src={form.banner.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <span className="absolute right-3 bottom-3 rounded-full bg-black/60 text-white text-xs font-extrabold px-3 py-1.5">Change</span>
                </div>
              ) : (
                <div className="aspect-[16/7] bg-[#F2F3F5] border-2 border-dashed border-[#D5D9DF] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#5B6270]">
                  <ImagePlus size={26} /><span className="font-extrabold">Add a banner photo</span>
                </div>
              )}
            </Pick>
          </div>
          <div className="flex items-center gap-5">
            <Pick label="Change your logo" onFiles={setOne('logo')} onFocus={f('hero')} className="shrink-0 rounded-[22px]">
              <div className="w-24 h-24 rounded-[22px] overflow-hidden bg-[#F2F3F5] flex items-center justify-center text-[#5B6270]" style={{ border: '3px solid #FFFFFF', boxShadow: '0 0 0 1px #E6E8EC' }}>
                {form.logo ? <img src={form.logo.url} alt="" className="w-full h-full object-cover" /> : <Plus size={22} />}
              </div>
            </Pick>
            <div className="min-w-0 flex-1">
              <Label>Name</Label>
              <input className={inputCls} value={form.name} maxLength={60} onFocus={f('hero')} onChange={(e) => set('name')(e.target.value)} />
            </div>
          </div>
          <div>
            <Label hint={`${form.photos.length} of ${MAX_PHOTOS}`}>More photos</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {form.photos.map((p, i) => (
                <div key={p.url} className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F3F5]">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => set('photos')((ph) => ph.filter((_, k) => k !== i))} aria-label="Remove photo" className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={14} /></button>
                </div>
              ))}
              {form.photos.length < MAX_PHOTOS ? (
                <Pick label="Add photos" multiple onFiles={addPhotos} onFocus={f('hero')} className="rounded-xl">
                  <div className="aspect-square rounded-xl bg-[#F2F3F5] border-2 border-dashed border-[#D5D9DF] flex flex-col items-center justify-center gap-1 text-[#5B6270]">
                    <Plus size={22} /><span className="text-sm font-extrabold">Add</span>
                  </div>
                </Pick>
              ) : null}
            </div>
          </div>
        </Section>

        <Section n={2} title="About">
          <div>
            <Label hint={`${form.bio.length}/500`}>About</Label>
            <textarea className={`${inputCls} h-auto min-h-[120px] py-3 resize-y`} value={form.bio} maxLength={500} onFocus={f('about')} onChange={(e) => set('bio')(e.target.value)} placeholder="Turf, field sizes, parking, what to bring…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label hint="Optional">Instagram</Label><Handle value={form.instagram} onChange={set('instagram')} onFocus={f('about')} placeholder="yourindoor" /></div>
            <div><Label hint="Optional">TikTok</Label><Handle value={form.tiktok} onChange={set('tiktok')} onFocus={f('about')} placeholder="yourindoor" /></div>
          </div>
          <div><Label hint="Optional">Website</Label><input className={inputCls} value={form.website} onFocus={f('about')} onChange={(e) => set('website')(e.target.value)} placeholder="yourindoor.com" /></div>
        </Section>

        <Section n={3} title="Where and when">
          <div><Label>Address</Label><AddressField address={form.address} setAddress={set('address')} setLocation={set('location')} onFocus={f('map')} /></div>
          <div><Label>Open hours</Label><HoursEditor hours={form.hours} onChange={set('hours')} onFocus={f('hours')} /></div>
          <div><Label hint="Holidays, events">Closed days</Label><ClosedDates value={form.closedDates} onChange={set('closedDates')} onFocus={f('hours')} /></div>
        </Section>

        <Section n={4} title="Fields and bookings">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-extrabold">How many fields do you have?</div>
              <div className="text-sm font-semibold text-[#5B6270]">Sets up your schedule and check-in</div>
            </div>
            <Stepper value={form.fieldCount} onChange={set('fieldCount')} min={1} max={MAX_FIELDS} />
          </div>
          <div className="border-t border-[#EEF0F3] pt-5">
            <div className="font-extrabold mb-2">When someone rents a field, free cancellation until</div>
            <div className="flex flex-wrap gap-2">{CANCEL_HOURS.map((h) => <Choice key={h} on={form.cancelHours === h} onClick={() => set('cancelHours')(h)}>{h} hrs before</Choice>)}</div>
            <div className="font-extrabold mt-4 mb-2">After that, you keep</div>
            <div className="flex flex-wrap gap-2">{CANCEL_KEEP.map((p) => <Choice key={p} on={form.cancelKeepPct === p} onClick={() => set('cancelKeepPct')(p)}>{p === 100 ? 'All of it' : `${p}%`}</Choice>)}</div>
            <p className="mt-3 text-sm font-semibold text-[#5B6270]">New bookings use this. Bookings already made keep the terms they were made with.</p>
          </div>
        </Section>
      </div>

      <aside className="hidden xl:block sticky top-6">
        <div className="flex items-center justify-center gap-2 mb-3 text-xs font-extrabold tracking-[0.18em] uppercase text-[#5B6270]">
          <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-[#16A34A] animate-ping opacity-60" /><span className="relative w-2 h-2 rounded-full bg-[#16A34A]" /></span>
          {dirty ? 'Preview · not saved yet' : 'Live on Jogo'}
        </div>
        <div style={{ height: (PHONE_H + 20) * Math.min(phoneScale, 0.92) }}>
          <div style={{ transform: `scale(${Math.min(phoneScale, 0.92)})`, transformOrigin: 'top center' }}>
            <VenuePreview venue={page} focus={focus} height={PHONE_H} games={games} posts={posts} />
          </div>
        </div>
      </aside>

      {/* Save bar: only while something changed. Phones also get the preview here. */}
      <div className="fixed bottom-4 inset-x-4 lg:left-[calc(16rem+2rem)] z-30 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-[#0B0D10] text-white rounded-full pl-5 pr-2 py-2 shadow-[0_18px_40px_-14px_rgba(11,13,16,0.7)] max-w-full">
          <span className="text-sm font-bold truncate">{error ? <span className="text-[#FDA4AF]">{error}</span> : dirty ? 'Unsaved changes' : 'All saved'}</span>
          <button type="button" onClick={() => setPreview(true)} className="xl:hidden shrink-0 h-10 px-4 rounded-full bg-white/10 text-sm font-extrabold">Preview</button>
          {dirty ? <button type="button" onClick={() => { const v = fromVenue(venue); setForm(v); setError(null); }} className="shrink-0 h-10 px-4 rounded-full text-sm font-extrabold text-white/70 hover:text-white">Undo</button> : null}
          <button type="button" disabled={!dirty || busy} onClick={save} className="shrink-0 h-10 px-5 rounded-full bg-[#16A34A] text-sm font-extrabold disabled:opacity-40">{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      {preview ? <FullPreview venue={page} onClose={() => setPreview(false)} label={dirty ? 'Preview · not saved yet' : 'Your page'} games={games} posts={posts} /> : null}
    </div>
  );
}

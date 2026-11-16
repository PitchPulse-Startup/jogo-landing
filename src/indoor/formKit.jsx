// src/indoor/formKit.jsx — the form pieces the indoor application
// (src/IndoorApply.jsx) and the portal's page editor (src/indoor/PageEditor.jsx)
// share: photo pickers, choices, steppers, open hours, address type-ahead and
// social handles. Styled for light cards.
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Minus, MapPin, Clock, ArrowRight } from 'lucide-react';
import { DISPLAY } from '../App.jsx';
import {
  HOURS_MIN, HOURS_MAX, HOURS_STEP, DEFAULT_DAY, DEFAULT_HOURS, WEEK_ORDER, weekdayName, timeText,
  newPlacesSession, autocompletePlaces, getPlaceLocation, cleanHandle,
} from './applyKit';

export const PHONE_H = 760; // the preview's screen; the frame adds 20
export const inputCls = 'w-full h-12 rounded-xl bg-[#F2F3F5] px-4 font-semibold text-[#0B0D10] outline-none ring-2 ring-transparent focus:ring-[#0B0D10] focus:bg-white transition-all placeholder:text-[#9AA0AB]';

// How tall the phone may be: it shrinks on short laptop screens instead of
// running off the bottom.
export function usePhoneScale() {
  const get = () => (typeof window === 'undefined' ? 1 : Math.min(1, Math.max(0.6, (window.innerHeight - 150) / (PHONE_H + 20))));
  const [scale, setScale] = useState(get);
  useEffect(() => {
    const on = () => setScale(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return scale;
}

export function Section({ n, title, sub, children }) {
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

export const Label = ({ children, hint }) => (
  <div className="mb-1.5 flex items-baseline justify-between gap-3">
    <span className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#5B6270]">{children}</span>
    {hint ? <span className="text-xs font-semibold text-[#9AA0AB]">{hint}</span> : null}
  </div>
);

// A file input styled as whatever's inside; drops work too.
export function Pick({ onFiles, multiple = false, className = '', children, label, onFocus }) {
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

export function Choice({ on, onClick, children }) {
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

export function Stepper({ value, onChange, min, max }) {
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

export function TimeSelect({ value, options, onChange, label, onFocus }) {
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

export function HoursRange({ value, onChange, onFocus }) {
  const setOpen = (open) => onChange({ open, close: value.close > open ? value.close : Math.min(HOURS_MAX, open + 60) });
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <TimeSelect label="Opens" value={value.open} options={OPEN_TIMES} onChange={setOpen} onFocus={onFocus} />
      <span className="font-bold text-[#9AA0AB]">to</span>
      <TimeSelect label="Closes" value={value.close} options={closeTimes(value.open)} onChange={(close) => onChange({ ...value, close })} onFocus={onFocus} />
    </div>
  );
}

export function HoursEditor({ hours, onChange, onFocus }) {
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
export function AddressField({ address, setAddress, setLocation, onFocus }) {
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

export function Handle({ value, onChange, onFocus, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-[#9AA0AB]">@</span>
      <input className={`${inputCls} pl-9`} value={value} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} onBlur={() => onChange(cleanHandle(value))} placeholder={placeholder} autoCapitalize="none" />
    </div>
  );
}


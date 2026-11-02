// src/indoor/RatesEditor.jsx — the indoor's rentable slots and hourly rates.
//
// venues/{uid}.rentalSlots: { '0': [{ from, to, cents }], … '6': [...] }, Sunday
// first; from/to are minutes from midnight, cents is the rate per hour. A day
// with no slots can't be rented. No rentalSlots at all = any open hour, priced
// when the indoor approves. The app reads this in services/venueHours.js.
import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';

const WEEK = [1, 2, 3, 4, 5, 6, 0]; // Monday first, the way a business lists its week
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = Array.from({ length: 37 }, (_, i) => 360 + i * 30); // 6 AM to midnight

export const clock = (m) => {
  if (m >= 1440) return 'Midnight';
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

/** What's wrong with one day's slots, or null. */
export const dayProblem = (slots) => {
  const sorted = [...slots].sort((a, b) => a.from - b.from);
  for (let i = 0; i < sorted.length; i += 1) {
    if (sorted[i].to <= sorted[i].from) return 'A slot has to end after it starts.';
    if (sorted[i].to - sorted[i].from < 60) return 'A slot has to be at least 1 hour.';
    if (!(sorted[i].cents >= 100)) return 'Each slot needs a rate of at least $1 an hour.';
    if (i && sorted[i].from < sorted[i - 1].to) return 'These slots overlap.';
  }
  return null;
};

function TimeSelect({ value, onChange, label, options }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-11 rounded-xl bg-[#F2F3F5] px-3 font-bold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0E7A43]"
    >
      {(options.includes(value) ? options : [value, ...options]).map((m) => <option key={m} value={m}>{clock(m)}</option>)}
    </select>
  );
}

export default function RatesEditor({ slots, hours, onChange }) {
  const setDay = (d, list) => onChange({ ...slots, [d]: list });
  const add = (d) => {
    const list = slots[d] || [];
    const last = [...list].sort((a, b) => a.to - b.to).pop();
    const open = hours?.[d];
    const close = open?.close ?? 1440;
    const from = last ? last.to : (open?.open ?? 540);
    if (from + 60 > close) return; // the day is already full of slots
    setDay(d, [...list, { from, to: Math.min(from + 120, close), cents: last?.cents || 0 }]);
  };
  const patch = (d, i, p) => setDay(d, (slots[d] || []).map((s, k) => {
    if (k !== i) return s;
    const next = { ...s, ...p };
    // Moving the start past the end brings the end along, at least an hour on.
    if (p.from != null && next.to < next.from + 60) next.to = Math.min(next.from + 60, hours?.[d]?.close ?? 1440);
    return next;
  }));
  // Only times inside the indoor's open hours: a slot outside them could never be booked.
  const timesFor = (d) => TIMES.filter((m) => m >= (hours?.[d]?.open ?? 360) && m <= (hours?.[d]?.close ?? 1440));
  const copyToAll = (d) => {
    const next = {};
    WEEK.forEach((k) => { next[k] = hours && !hours[k] ? [] : (slots[d] || []).map((s) => ({ ...s })); });
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {WEEK.map((d) => {
        const list = slots[d] || [];
        const problem = dayProblem(list);
        const closed = hours && !hours[d];
        return (
          <div key={d} className="bg-white rounded-2xl border border-[#E6E8EC] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-extrabold text-[#0B0D10] text-lg">{DAY_NAMES[d]}</div>
                <div className="text-sm font-semibold text-[#6B7280]">
                  {closed ? 'You\'re closed this day' : hours?.[d] ? `Open ${clock(hours[d].open)} – ${clock(hours[d].close)}` : list.length ? `${list.length} slot${list.length === 1 ? '' : 's'}` : 'Not available to rent'}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {list.length ? (
                  <button type="button" onClick={() => copyToAll(d)} className="h-10 px-3 rounded-full text-sm font-bold text-[#0E7A43] hover:bg-[#ECFDF3] inline-flex items-center gap-1.5">
                    <Copy size={15} /> <span className="hidden sm:inline">Use for every day</span><span className="sm:hidden">Copy</span>
                  </button>
                ) : null}
                {!closed && !(list.length && Math.max(...list.map((x) => x.to)) + 60 > (hours?.[d]?.close ?? 1440)) ? (
                  <button type="button" onClick={() => add(d)} className="h-10 px-3 rounded-full text-sm font-bold bg-[#0B0D10] text-white inline-flex items-center gap-1.5">
                    <Plus size={15} /> Add slot
                  </button>
                ) : null}
              </div>
            </div>
            {list.length ? (
              <div className="mt-4 space-y-2">
                {list.map((s, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <TimeSelect label="From" value={s.from} options={timesFor(d).slice(0, -2)} onChange={(v) => patch(d, i, { from: v })} />
                    <span className="font-semibold text-[#6B7280]">to</span>
                    <TimeSelect label="To" value={s.to} options={timesFor(d).filter((m) => m >= s.from + 60)} onChange={(v) => patch(d, i, { to: v })} />
                    <label className="h-11 rounded-xl bg-[#F2F3F5] pl-3 pr-3 inline-flex items-center gap-1 font-bold text-[#0B0D10] focus-within:ring-2 focus-within:ring-[#0E7A43]">
                      $
                      <input
                        aria-label="Rate per hour"
                        inputMode="numeric"
                        placeholder="0"
                        value={s.cents ? String(s.cents / 100) : ''}
                        onChange={(e) => patch(d, i, { cents: Math.round((parseFloat(e.target.value.replace(/[^0-9]/g, "")) || 0) * 100) })}
                        className="w-16 bg-transparent outline-none"
                      />
                      <span className="text-sm font-semibold text-[#6B7280]">/hr</span>
                    </label>
                    <button type="button" onClick={() => setDay(d, list.filter((_, k) => k !== i))} aria-label="Remove slot" className="h-11 w-11 rounded-xl text-[#BE123C] hover:bg-[#FFF1F2] inline-flex items-center justify-center">
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
                {problem ? <p className="text-sm font-semibold text-[#BE123C]">{problem}</p> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// src/indoor/Answers.jsx — answering from the web: a rental request (price, field,
// and keeping that price as a set rate), a split (agree with a deadline, or say
// no), and creating games.
import React, { useMemo, useState } from 'react';
import { Lock, Plus, X } from 'lucide-react';
import {
  answerSplit, approveRental, asDate, canSaveRate, createGames, deadlineText, declineRental, declineSplit, money, openPayouts, rateFor, saveRate, withFee,
} from './actions';
import { clock } from './RatesEditor.jsx';

const DAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const dayLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const timeLabel = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '');
const overlaps = (a1, a2, b1, b2) => a1 < b2 && a2 > b1;
const toLocalInput = (ms) => {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const btn = 'h-11 px-6 rounded-full font-extrabold disabled:opacity-40';

const Head = ({ r, fieldCount }) => {
  const st = asDate(r.start);
  const en = asDate(r.end);
  return (
    <div>
      <div className="font-extrabold text-lg text-[#0B0D10]">{dayLabel(st)}</div>
      <div className="font-extrabold text-lg text-[#0B0D10] -mt-1">{timeLabel(st)} – {timeLabel(en)}</div>
      <div className="text-sm font-semibold text-[#6B7280]">
        {[r.userName, fieldCount > 1 ? (r.field ? `Field ${r.field}` : 'Any field') : null, r.note ? `"${r.note}"` : null].filter(Boolean).join(' · ')}
      </div>
    </div>
  );
};

function PayoutsNeeded({ what }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const go = async () => {
    setBusy(true); setErr(null);
    try { await openPayouts(); } catch (e) { console.error('payouts failed:', e); setErr('Couldn\'t open Stripe. Try again.'); setBusy(false); }
  };
  return (
    <div className="bg-[#FEF3C7] rounded-2xl p-4 mt-3">
      <div className="font-extrabold text-[#0B0D10]">Set up payouts to {what}</div>
      <p className="text-sm font-semibold text-[#6B7280]">What players pay goes straight to your bank. It takes a few minutes with Stripe.</p>
      {err ? <p className="text-sm font-semibold text-[#BE123C] mt-1">{err}</p> : null}
      <button type="button" onClick={go} disabled={busy} className={`${btn} bg-[#0B0D10] text-white mt-3`}>{busy ? 'Opening…' : 'Set up payouts'}</button>
    </div>
  );
}

/** A rental waiting on an answer. */
export function RequestCard({ r, venue, games, rentals }) {
  const fieldCount = Math.max(1, Number(venue.fieldCount) || 1);
  const start = asDate(r.start);
  const end = asDate(r.end);
  const hours = (end - start) / 3600e3;
  const rate = rateFor(venue, start, end);
  const [price, setPrice] = useState(rate ? String(rate / 100) : '');
  const [field, setField] = useState(r.field || 1);
  const [keep, setKeep] = useState(false);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);
  const cents = Math.round((parseFloat(price) || 0) * 100);
  const ready = !!venue.payouts?.ready;
  const clash = games.some((g) => g.status !== 'cancelled' && (!g.venueField || g.venueField === field) && overlaps(start, end, asDate(g.startDateTime), asDate(g.endDateTime) || start))
    || rentals.some((x) => x.id !== r.id && ['approved', 'paid'].includes(x.status) && x.field === field && overlaps(start, end, asDate(x.start), asDate(x.end)));
  const offerKeep = !rate && canSaveRate(venue, start, end) && cents >= 100;
  const perHour = Math.round(cents / hours);
  const from = start.getHours() * 60 + start.getMinutes();

  const act = async (key, fn) => {
    setBusy(key); setErr(null);
    try { await fn(); } catch (e) { console.error(`${key} failed:`, e); setErr('Couldn\'t save. Try again.'); setBusy(null); }
  };
  return (
    <div className="border-t first:border-t-0 border-[#EEF0F3] py-4">
      <Head r={r} fieldCount={fieldCount} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="h-12 rounded-xl bg-[#F2F3F5] px-3 inline-flex items-center gap-1 font-extrabold text-lg text-[#0B0D10] focus-within:ring-2 focus-within:ring-[#0E7A43]">
          $
          <input aria-label="Total price" inputMode="decimal" placeholder="Total price" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, '').slice(0, 7))} className="w-28 bg-transparent outline-none" />
        </label>
        {fieldCount > 1 ? (
          <select aria-label="Field" value={field} onChange={(e) => setField(Number(e.target.value))} className="h-12 rounded-xl bg-[#F2F3F5] px-3 font-bold outline-none">
            {Array.from({ length: fieldCount }, (_, i) => <option key={i} value={i + 1}>Field {i + 1}</option>)}
          </select>
        ) : null}
        {rate ? <span className="text-sm font-semibold text-[#0E7A43]">From your set rate</span> : null}
      </div>
      {cents >= 100 ? (
        <p className="text-sm font-semibold text-[#6B7280] mt-2">
          <span className="font-extrabold text-[#0E7A43]">You get {money(cents)}.</span> Renter pays {money(withFee(cents))}, with the service fee.
        </p>
      ) : null}
      {offerKeep ? (
        <label className="mt-3 flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="mt-1 w-4 h-4 accent-[#0E7A43]" />
          <span className="text-sm font-semibold text-[#0B0D10]">
            Save {money(perHour)}/hr as your rate for {DAY_NAMES[start.getDay()]}, {clock(from)} – {clock(from + hours * 60)}
            <span className="block text-[#6B7280]">Next time, players can book that time without waiting on you.</span>
          </span>
        </label>
      ) : null}
      {clash ? <p className="text-sm font-semibold text-[#B45309] mt-2">Field {field} already has a game or rental then.</p> : null}
      {!ready ? <PayoutsNeeded what="approve this" /> : null}
      <p className="text-sm font-bold text-[#0E7A43] mt-3 inline-flex items-center gap-1.5"><Lock size={14} /> Price locks in when you approve</p>
      {err ? <p className="text-sm font-semibold text-[#BE123C] mt-1">{err}</p> : null}
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={!!busy} onClick={() => act('decline', () => declineRental(r))} className={`${btn} bg-[#F2F3F5] text-[#0B0D10]`}>{busy === 'decline' ? 'Declining…' : 'Decline'}</button>
        <button
          type="button"
          disabled={!!busy || cents < 100 || !ready}
          onClick={() => act('approve', async () => {
            await approveRental(r, { priceCents: cents, field, venue });
            if (keep && offerKeep) await saveRate(venue, start, end, cents).catch((e) => console.error('saving the rate failed:', e));
          })}
          className={`${btn} bg-[#0B0D10] text-white`}
        >
          {busy === 'approve' ? 'Approving…' : `Approve${cents >= 100 ? ` · ${money(cents)}` : ''}`}
        </button>
      </div>
    </div>
  );
}

/** A renter asked to split: their terms, a deadline, and yes or no. */
export function SplitCard({ r, venue }) {
  const fieldCount = Math.max(1, Number(venue.fieldCount) || 1);
  const sp = r.split;
  const startMs = asDate(r.start).getTime();
  const earliest = Date.now() + 3600e3;
  const latest = startMs - 6 * 3600e3;
  const cutoff = startMs - (Number(r.cancelHours) || 48) * 3600e3;
  const recommended = cutoff >= earliest ? cutoff : latest >= earliest ? latest : null;
  const [pick, setPick] = useState(null);
  const [custom, setCustom] = useState(recommended ? toLocalInput(recommended) : '');
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);
  const customMs = custom ? new Date(custom).getTime() : 0;
  const customOk = customMs >= earliest && customMs <= latest;
  const decideMs = pick === 'rec' ? recommended : pick === 'custom' && customOk ? customMs : null;
  const rest = (r.priceCents || 0) - sp.shareCents * (sp.maxPlayers - 1);
  const renter = rest > sp.shareCents && rest - sp.shareCents < sp.maxPlayers ? rest : sp.shareCents;
  const total = sp.shareCents * (sp.maxPlayers - 1) + renter;
  const act = async (key, fn) => {
    setBusy(key); setErr(null);
    try { await fn(); } catch (e) { console.error(`${key} failed:`, e); setErr('Couldn\'t save. Try again.'); setBusy(null); }
  };
  const option = (on) => `w-full text-left rounded-2xl px-4 py-3 font-bold ${on ? 'bg-[#0E7A43] text-white' : 'bg-[#F2F3F5] text-[#0B0D10]'}`;
  return (
    <div className="border-t first:border-t-0 border-[#EEF0F3] py-4">
      <Head r={r} fieldCount={fieldCount} />
      <div className="bg-[#F2F3F5] rounded-2xl p-4 mt-3 text-center">
        <div className="text-sm font-bold text-[#6B7280]">You get</div>
        <div className="text-3xl font-extrabold text-[#0E7A43]">{money(total)}</div>
        <div className="text-sm font-semibold text-[#0B0D10] mt-1">{sp.maxPlayers} players at {money(sp.shareCents)}, {(r.userName || '').split(' ')[0]} included</div>
        <div className="text-sm font-semibold text-[#6B7280]">Each pays {money(withFee(sp.shareCents))} with the service fee, once every spot is paid</div>
      </div>
      {recommended ? (
        <div className="mt-3 space-y-2">
          <div className="font-extrabold text-[#0B0D10]">They need all {sp.maxPlayers} players by</div>
          <button type="button" onClick={() => setPick('rec')} className={option(pick === 'rec')}>
            <span className={`block text-xs tracking-widest ${pick === 'rec' ? 'text-white' : 'text-[#0E7A43]'}`}>RECOMMENDED</span>
            {deadlineText(new Date(recommended))}
          </button>
          <button type="button" onClick={() => setPick('custom')} className={option(pick === 'custom')}>Pick a date and time</button>
          {pick === 'custom' ? (
            <div>
              <input type="datetime-local" aria-label="Deadline" value={custom} min={toLocalInput(earliest)} max={toLocalInput(latest)} onChange={(e) => setCustom(e.target.value)} className="h-12 rounded-xl bg-[#F2F3F5] px-3 font-bold outline-none" />
              {!customOk ? <p className="text-sm font-semibold text-[#BE123C] mt-1">Pick a time between {deadlineText(new Date(earliest))} and {deadlineText(new Date(latest))}.</p>
                : customMs > cutoff && cutoff >= earliest ? <p className="text-sm font-semibold text-[#B45309] mt-1">That's after your free-cancellation time. If it doesn't fill, the field opens back up with less time for you to rebook it.</p> : null}
            </div>
          ) : null}
          <p className="text-sm font-semibold text-[#6B7280]">If it isn't full by then, it cancels and everyone gets refunded.</p>
        </div>
      ) : <p className="text-sm font-semibold text-[#B45309] mt-3">It's too close to the start to split this one.</p>}
      {err ? <p className="text-sm font-semibold text-[#BE123C] mt-2">{err}</p> : null}
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={!!busy} onClick={() => act('no', () => declineSplit(r))} className={`${btn} bg-[#F2F3F5] text-[#0B0D10]`}>{busy === 'no' ? 'Saving…' : 'Say no'}</button>
        {recommended ? <button type="button" disabled={!!busy || !decideMs} onClick={() => act('yes', () => answerSplit(r, new Date(decideMs)))} className={`${btn} bg-[#0B0D10] text-white`}>{busy === 'yes' ? 'Saving…' : 'Agree'}</button> : null}
      </div>
    </div>
  );
}

const TIMES = Array.from({ length: 36 }, (_, i) => 360 + i * 30);
const LENGTHS = [60, 90, 120, 150, 180, 240];

/** Open games, on one date or the same time for several weeks. Teams stay in the app. */
export function CreateGame({ venue, games, rentals, onDone }) {
  const fieldCount = Math.max(1, Number(venue.fieldCount) || 1);
  const [date, setDate] = useState('');
  const [startMin, setStartMin] = useState(1140);
  const [length, setLength] = useState(60);
  const [field, setField] = useState(1);
  const [weeks, setWeeks] = useState(1);
  const [paid, setPaid] = useState(true);
  const [price, setPrice] = useState('');
  const [spots, setSpots] = useState(14);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const cents = paid ? Math.round((parseFloat(price) || 0) * 100) : 0;

  // Each date, and why it can't post if it can't.
  const plan = useMemo(() => {
    if (!date) return [];
    const [y, m, d] = date.split('-').map(Number);
    return Array.from({ length: weeks }, (_, i) => {
      const start = new Date(y, m - 1, d + i * 7, 0, startMin);
      const end = new Date(y, m - 1, d + i * 7, 0, startMin + length);
      const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const open = (venue.closedDates || []).includes(key) ? null : Array.isArray(venue.hours) ? venue.hours[start.getDay()] : { open: 360, close: 1440 };
      const why = start.getTime() <= Date.now() ? 'already passed'
        : !open || startMin < open.open || startMin + length > open.close ? 'outside your hours'
          : games.some((g) => g.status !== 'cancelled' && (!g.venueField || g.venueField === field) && overlaps(start, end, asDate(g.startDateTime), asDate(g.endDateTime) || start))
            || rentals.some((x) => ['approved', 'paid'].includes(x.status) && x.field === field && overlaps(start, end, asDate(x.start), asDate(x.end))) ? 'field taken'
            : null;
      return { start, end, field, why };
    });
  }, [date, weeks, startMin, length, field, games, rentals, venue.hours, venue.closedDates]);
  const good = plan.filter((p) => !p.why);
  const needPayouts = paid && !venue.payouts?.ready;
  const problem = !date ? 'Pick a date' : !good.length ? 'None of those times can post' : paid && cents < 100 ? 'Set a price of at least $1' : needPayouts ? 'Set up payouts to charge for games' : null;
  const input = 'h-11 rounded-xl bg-[#F2F3F5] px-3 font-bold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0E7A43]';
  const label = 'block text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280] mb-1';

  const post = async () => {
    setBusy(true); setErr(null);
    try {
      await createGames(venue, { slots: good, priceCents: cents, maxPlayers: spots, title });
      onDone(good.length);
    } catch (e) {
      console.error('creating games failed:', e);
      setErr('Couldn\'t post your games. Try again.');
      setBusy(false);
    }
  };
  return (
    <div className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold text-lg text-[#0B0D10]">Create games</h2>
        <button type="button" onClick={() => onDone(0)} aria-label="Close" className="w-10 h-10 rounded-full bg-[#F2F3F5] inline-flex items-center justify-center"><X size={17} /></button>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="col-span-2 sm:col-span-1"><span className={label}>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${input} w-full`} /></label>
        <label><span className={label}>Starts</span><select value={startMin} onChange={(e) => setStartMin(Number(e.target.value))} className={`${input} w-full`}>{TIMES.map((m) => <option key={m} value={m}>{clock(m)}</option>)}</select></label>
        <label><span className={label}>How long</span><select value={length} onChange={(e) => setLength(Number(e.target.value))} className={`${input} w-full`}>{LENGTHS.map((m) => <option key={m} value={m}>{m / 60} hr{m === 60 ? '' : 's'}</option>)}</select></label>
        <label><span className={label}>Repeat</span><select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className={`${input} w-full`}>{[1, 2, 3, 4, 6, 8, 12].map((n) => <option key={n} value={n}>{n === 1 ? 'Just once' : `${n} weeks`}</option>)}</select></label>
        {fieldCount > 1 ? <label><span className={label}>Field</span><select value={field} onChange={(e) => setField(Number(e.target.value))} className={`${input} w-full`}>{Array.from({ length: fieldCount }, (_, i) => <option key={i} value={i + 1}>Field {i + 1}</option>)}</select></label> : null}
        <label><span className={label}>Spots</span><input inputMode="numeric" value={spots} onChange={(e) => setSpots(Math.min(40, Number(e.target.value.replace(/[^0-9]/g, '')) || 0))} onBlur={() => setSpots(Math.max(2, spots))} className={`${input} w-full`} /></label>
        <div><span className={label}>Price</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setPaid(true)} className={`h-11 px-3 rounded-xl font-bold text-sm ${paid ? 'bg-[#0E7A43] text-white' : 'bg-[#F2F3F5]'}`}>Paid</button>
            <button type="button" onClick={() => setPaid(false)} className={`h-11 px-3 rounded-xl font-bold text-sm ${!paid ? 'bg-[#0E7A43] text-white' : 'bg-[#F2F3F5]'}`}>Free</button>
          </div>
        </div>
        {paid ? <label><span className={label}>Per player</span><span className={`${input} inline-flex items-center gap-1 w-full`}>$<input inputMode="decimal" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, '').slice(0, 6))} className="w-full bg-transparent outline-none" /></span></label> : null}
        <label className="col-span-2"><span className={label}>Name (optional)</span><input value={title} maxLength={60} placeholder={venue.name} onChange={(e) => setTitle(e.target.value)} className={`${input} w-full`} /></label>
      </div>
      {paid && cents >= 100 ? (
        <p className="text-sm font-semibold mt-3 text-[#6B7280]">
          <span className="font-extrabold text-[#0E7A43]">A full game pays you {money(cents * spots)}.</span> Each player pays {money(withFee(cents))} with the service fee.
        </p>
      ) : null}
      {plan.length > 1 || plan.some((p) => p.why) ? (
        <ul className="mt-3 space-y-1">
          {plan.map((p) => (
            <li key={p.start.getTime()} className={`text-sm font-semibold ${p.why ? 'text-[#9CA3AF]' : 'text-[#0B0D10]'}`}>
              <span className={p.why ? 'line-through' : ''}>{dayLabel(p.start)}, {timeLabel(p.start)} – {timeLabel(p.end)}</span>{p.why ? ` · ${p.why}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
      {needPayouts ? <PayoutsNeeded what="charge for games" /> : null}
      {err ? <p className="text-sm font-semibold text-[#BE123C] mt-2">{err}</p> : null}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <button type="button" disabled={!!problem || busy} onClick={post} className={`${btn} bg-[#0E7A43] text-white`}>{busy ? 'Posting…' : `Post ${good.length || ''} game${good.length === 1 ? '' : 's'}`}</button>
        {problem ? <span className="text-sm font-semibold text-[#6B7280]">{problem}</span> : null}
      </div>
      <p className="text-sm font-semibold text-[#6B7280] mt-3">For King of the field, use the Jogo app.</p>
    </div>
  );
}

export const CreateButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className="h-11 px-5 rounded-full bg-[#0E7A43] text-white font-extrabold inline-flex items-center gap-2"><Plus size={17} /> Create games</button>
);

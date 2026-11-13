// src/indoor/Blocks.jsx — "Booked elsewhere": hours the indoor already sold
// outside Jogo (a league, a phone booking, a party). Players can't ask for those
// times on Rent a field, and the indoor's own tools treat them as taken.
// One date at a time, one field or all of them.
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addBlock, asDate, removeBlock } from './actions';
import { clock } from './RatesEditor.jsx';
import { toast } from './Toast.jsx';

const TIMES = Array.from({ length: 37 }, (_, i) => 360 + i * 30); // 6 AM to midnight
const dayLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const timeLabel = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '');
const overlaps = (a1, a2, b1, b2) => a1 < b2 && a2 > b1;
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Blocks({ venue, blocks, games, rentals }) {
  const fieldCount = Math.max(1, Number(venue.fieldCount) || 1);
  const [date, setDate] = useState('');
  const [from, setFrom] = useState(1080);
  const [to, setTo] = useState(1260);
  const [field, setField] = useState(0); // 0 = every field
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [removing, setRemoving] = useState(null);

  let start = null;
  let end = null;
  if (date) {
    const [y, m, d] = date.split('-').map(Number);
    start = new Date(y, m - 1, d, 0, from);
    end = new Date(y, m - 1, d, 0, to);
  }
  const onField = (fl) => !field || !fl || fl === field;
  // Something on Jogo is already there: blocking doesn't cancel it, so say so.
  const already = start && (
    games.some((g) => g.status !== 'cancelled' && onField(g.venueField) && overlaps(start, end, asDate(g.startDateTime), asDate(g.endDateTime) || start))
    || rentals.some((x) => ['approved', 'paid'].includes(x.status) && onField(x.field) && overlaps(start, end, asDate(x.start), asDate(x.end))));
  const problem = !date ? 'Pick a date'
    : to <= from ? 'Until has to be after From'
      : end.getTime() <= Date.now() ? 'That time has already passed' : null;
  const input = 'h-11 rounded-xl bg-[#F2F3F5] px-3 font-bold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0E7A43]';
  const label = 'block text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280] mb-1';

  const add = async () => {
    setBusy(true); setErr(null);
    try {
      await addBlock(venue.id, { start, end, field: field || null });
      toast('Time blocked', 'Players can\'t ask for it on Jogo now.');
      setDate('');
    } catch (e) {
      console.error('blocking time failed:', e);
      setErr(e?.code === 'permission-denied' ? 'This account can\'t change this indoor.' : 'Couldn\'t save. Try again.');
    }
    setBusy(false);
  };
  const remove = async (b) => {
    setRemoving(b.id);
    try {
      await removeBlock(venue.id, b.id);
      toast('Time opened back up', 'Players can ask for it again.');
    } catch (e) {
      console.error('removing a block failed:', e);
      toast('Couldn\'t remove that', 'Try again.');
    }
    setRemoving(null);
  };

  return (
    <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
      <h2 className="font-extrabold text-lg text-[#0B0D10]">Booked elsewhere</h2>
      <p className="text-[#6B7280] font-semibold mt-1">Already booked by phone, a league or a party? Block it, and players can't ask for that time on Jogo.</p>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="col-span-2 sm:col-span-1"><span className={label}>Date</span><input type="date" min={todayKey()} value={date} onChange={(e) => setDate(e.target.value)} className={`${input} w-full`} /></label>
        <label><span className={label}>From</span><select value={from} onChange={(e) => setFrom(Number(e.target.value))} className={`${input} w-full`}>{TIMES.slice(0, -1).map((m) => <option key={m} value={m}>{clock(m)}</option>)}</select></label>
        <label><span className={label}>Until</span><select value={to} onChange={(e) => setTo(Number(e.target.value))} className={`${input} w-full`}>{TIMES.slice(1).map((m) => <option key={m} value={m}>{clock(m)}</option>)}</select></label>
        {fieldCount > 1 ? (
          <label className="col-span-2 sm:col-span-1"><span className={label}>Field</span>
            <select value={field} onChange={(e) => setField(Number(e.target.value))} className={`${input} w-full`}>
              <option value={0}>All fields</option>
              {Array.from({ length: fieldCount }, (_, i) => <option key={i} value={i + 1}>Field {i + 1}</option>)}
            </select>
          </label>
        ) : null}
      </div>
      {already && !problem ? <p className="text-sm font-semibold text-[#B45309] mt-3">There's already a game or rental on Jogo then. Blocking won't cancel it.</p> : null}
      {err ? <p className="text-sm font-semibold text-[#BE123C] mt-2">{err}</p> : null}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <button type="button" disabled={!!problem || busy} onClick={add} className="h-11 px-6 rounded-full font-extrabold disabled:opacity-40 bg-[#0B0D10] text-white">{busy ? 'Blocking…' : 'Block this time'}</button>
        {problem ? <span className="text-sm font-semibold text-[#6B7280]">{problem}</span> : null}
      </div>

      {blocks.length ? (
        <ul className="mt-5">
          {blocks.map((b) => {
            const st = asDate(b.start);
            const en = asDate(b.end);
            return (
              <li key={b.id} className="border-t border-[#EEF0F3] py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[#0B0D10]">{dayLabel(st)}</div>
                  <div className="text-sm font-semibold text-[#6B7280]">{timeLabel(st)} – {timeLabel(en)}{fieldCount > 1 ? ` · ${b.field ? `Field ${b.field}` : 'All fields'}` : ''}</div>
                </div>
                <button type="button" disabled={removing === b.id} onClick={() => remove(b)} aria-label={`Open ${dayLabel(st)} back up`} className="h-10 px-4 rounded-full bg-[#F2F3F5] text-[#0B0D10] font-bold text-sm inline-flex items-center gap-1.5 disabled:opacity-40">
                  <X size={15} /> {removing === b.id ? 'Removing…' : 'Remove'}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

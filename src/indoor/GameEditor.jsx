// src/indoor/GameEditor.jsx — change or cancel one of the indoor's own games from
// the portal (the app's components/venue/VenueGameEditor.js): start, length,
// field, spots, name. A new time or field tells everyone booked; cancelling
// says exactly what happens to them first (refunds included).
import React, { useMemo, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { asDate, bookedCount, cancelMessage, deleteVenueGame, updateVenueGame } from './actions';
import { clock } from './RatesEditor.jsx';
import { toast } from './Toast.jsx';

const LENGTHS = [60, 90, 120, 150, 180, 240];
const TIMES = Array.from({ length: 42 }, (_, i) => 360 + i * 30);
const overlaps = (a1, a2, b1, b2) => a1 < b2 && a2 > b1;
const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function GameEditor({ game, venue, games, rentals, blocks, onClose }) {
  const start0 = asDate(game.startDateTime);
  const end0 = asDate(game.endDateTime) || start0;
  // A start after midnight still belongs to the evening before.
  const late = start0.getHours() < 4;
  const base = new Date(start0.getFullYear(), start0.getMonth(), start0.getDate() - (late ? 1 : 0));
  const fieldCount = Math.max(1, Number(venue.fieldCount) || 1);
  const booked = bookedCount(game);
  const isTeams = !!game.miniTournament;

  const [date, setDate] = useState(keyOf(base));
  const [startMin, setStartMin] = useState(start0.getHours() * 60 + start0.getMinutes() + (late ? 1440 : 0));
  const [length, setLength] = useState(Math.round((end0 - start0) / 60000));
  const [field, setField] = useState(game.venueField || 1);
  const [spots, setSpots] = useState(game.maxPlayers || 10);
  const [title, setTitle] = useState(game.title || '');
  const [busy, setBusy] = useState(false);
  const [sure, setSure] = useState(false);
  const [err, setErr] = useState(null);

  const [y, m, d] = date.split('-').map(Number);
  const start = new Date(y, m - 1, d, 0, startMin);
  const end = new Date(y, m - 1, d, 0, startMin + length);
  const lengths = LENGTHS.includes(length) ? LENGTHS : [...LENGTHS, length].sort((a, b) => a - b);

  const problem = useMemo(() => {
    if (start.getTime() <= Date.now()) return 'That time has passed';
    const day = new Date(y, m - 1, d);
    const open = (venue.closedDates || []).includes(date) ? null : Array.isArray(venue.hours) ? venue.hours[day.getDay()] : { open: 360, close: 1440 };
    if (!open || startMin < open.open || startMin + length > open.close) return 'Outside your hours';
    const clash = games.some((g) => g.id !== game.id && g.status !== 'cancelled' && (!g.venueField || g.venueField === field) && overlaps(start, end, asDate(g.startDateTime), asDate(g.endDateTime) || start))
      || rentals.some((x) => ['approved', 'paid'].includes(x.status) && x.field === field && overlaps(start, end, asDate(x.start), asDate(x.end)))
      || blocks.some((b) => (!b.field || b.field === field) && overlaps(start, end, asDate(b.start), asDate(b.end)));
    if (clash) return fieldCount > 1 ? `Field ${field} is taken then` : 'Something else is on then';
    if (!isTeams && spots < booked) return `${booked} are already booked`;
    return null;
  }, [date, startMin, length, field, spots, games, rentals, blocks]); // eslint-disable-line react-hooks/exhaustive-deps

  const moved = start.getTime() !== start0.getTime() || end.getTime() !== end0.getTime() || field !== (game.venueField || 1);
  const save = async () => {
    setBusy(true); setErr(null);
    try {
      await updateVenueGame(game, { start, end, field, maxPlayers: isTeams ? undefined : spots, title });
      toast('Game updated', moved && booked ? `${booked} player${booked === 1 ? '' : 's'} told about the change.` : 'Players see the new version now.');
      onClose();
    } catch (e) { console.error('updateVenueGame failed:', e); setErr('Couldn’t save that. Try again.'); setBusy(false); }
  };
  const cancel = async () => {
    setBusy(true); setErr(null);
    try {
      await deleteVenueGame(game);
      toast('Game cancelled', booked ? `${booked} player${booked === 1 ? '' : 's'} told it’s off.` : 'It’s off your schedule.');
      onClose();
    } catch (e) { console.error('deleteVenueGame failed:', e); setErr('Couldn’t cancel it. Try again.'); setBusy(false); }
  };

  const input = 'h-11 w-full rounded-xl bg-[#F2F3F5] px-3 font-bold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0E7A43]';
  const label = 'block text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280] mb-1';
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose} role="dialog" aria-label="Edit game">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg text-[#0B0D10]">Edit game</h2>
            <p className="text-sm font-semibold text-[#6B7280]">{booked ? `${booked} booked · they’re told if the time or field changes` : 'Nobody booked yet'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full bg-[#F2F3F5] inline-flex items-center justify-center"><X size={17} /></button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="col-span-2"><span className={label}>Date</span><input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={input} /></label>
          <label><span className={label}>Starts</span><select value={startMin} onChange={(e) => setStartMin(Number(e.target.value))} className={input}>{TIMES.map((t) => <option key={t} value={t}>{t >= 1440 ? `${clock(t)} (late)` : clock(t)}</option>)}</select></label>
          <label><span className={label}>How long</span><select value={length} onChange={(e) => setLength(Number(e.target.value))} className={input}>{lengths.map((t) => <option key={t} value={t}>{t % 60 ? `${(t / 60).toFixed(1)} hrs` : `${t / 60} hr${t === 60 ? '' : 's'}`}</option>)}</select></label>
          {fieldCount > 1 ? <label><span className={label}>Field</span><select value={field} onChange={(e) => setField(Number(e.target.value))} className={input}>{Array.from({ length: fieldCount }, (_, i) => <option key={i} value={i + 1}>Field {i + 1}</option>)}</select></label> : null}
          {!isTeams ? <label><span className={label}>Spots</span><input inputMode="numeric" value={spots} onChange={(e) => setSpots(Math.min(40, Number(e.target.value.replace(/[^0-9]/g, '')) || 0))} className={input} /></label> : null}
          <label className="col-span-2"><span className={label}>Name</span><input value={title} maxLength={60} placeholder={venue.name} onChange={(e) => setTitle(e.target.value)} className={input} /></label>
        </div>
        {isTeams ? <p className="mt-3 text-sm font-semibold text-[#6B7280]">King of the field · {game.miniTournament.teamCount} teams of {game.miniTournament.teamSize}. Teams stay as they are.</p> : null}
        {err ? <p className="mt-3 text-sm font-bold text-[#BE123C]">{err}</p> : null}
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button type="button" disabled={!!problem || busy} onClick={save} className="h-11 px-6 rounded-full bg-[#0E7A43] text-white font-extrabold disabled:opacity-40">{busy && !sure ? 'Saving…' : 'Save'}</button>
          {problem ? <span className="text-sm font-semibold text-[#6B7280]">{problem}</span> : null}
        </div>
        <div className="mt-6 pt-5 border-t border-[#EEF0F3]">
          {sure ? (
            <div className="rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] p-4">
              <p className="font-extrabold text-[#BE123C]">Cancel this game?</p>
              <p className="mt-1 text-sm font-semibold text-[#0B0D10]">{cancelMessage(game)}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={busy} onClick={cancel} className="h-10 px-5 rounded-full bg-[#BE123C] text-white text-sm font-extrabold disabled:opacity-50">{busy ? 'Cancelling…' : 'Cancel the game'}</button>
                <button type="button" onClick={() => setSure(false)} className="h-10 px-5 rounded-full bg-white text-sm font-extrabold">Keep it</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setSure(true)} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#BE123C]"><Trash2 size={15} /> Cancel this game</button>
          )}
        </div>
      </div>
    </div>
  );
}

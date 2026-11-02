// src/indoor/Countdown.jsx — how long something has before it cancels by itself,
// ticking live: a split filling up (rental.split.decideAt, functions decideSplits)
// and a booking waiting to be paid (payByOf, functions decideUnpaidBookings).
import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { asDate, deadlineText } from './actions';

const left = (ms) => {
  const m = Math.ceil(ms / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ${m % 60 ? `${m % 60} min` : ''}`.trim();
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? '' : 's'}${h % 24 ? ` ${h % 24} hr${h % 24 === 1 ? '' : 's'}` : ''}`;
};
// Calm until it's close: amber inside a day, red inside 3 hours.
const tone = (ms) => (ms < 3 * 3600e3 ? '#BE123C' : ms < 24 * 3600e3 ? '#B45309' : '#0E7A43');

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** Players against a deadline. have/need count everyone, the renter included. */
export function FillCountdown({ have, need, decideAt }) {
  const now = useNow();
  const at = asDate(decideAt);
  if (!at || !need) return null;
  const remaining = at.getTime() - now;
  if (remaining <= 0) return <p className="text-sm font-bold text-[#6B7280] mt-2">Deadline passed. This updates in a few minutes.</p>;
  const full = have >= need;
  const color = full ? '#0E7A43' : tone(remaining);
  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-sm font-bold">
        <span className="text-[#0B0D10]">{Math.min(have, need)} of {need} players</span>
        <span className="inline-flex items-center gap-1.5" style={{ color }}>
          <Timer size={15} />
          {full ? `Full · books ${deadlineText(at)}` : `${left(remaining)} left, then it cancels`}
        </span>
      </div>
      <div className="h-2 rounded bg-[#EEF0F3] mt-1.5 overflow-hidden"><div className="h-full rounded" style={{ width: `${Math.min(100, (have / need) * 100)}%`, background: color }} /></div>
      {!full ? <div className="text-xs font-semibold text-[#6B7280] mt-1">Needs {need - have} more by {deadlineText(at)}. Everyone's refunded if it doesn't fill.</div> : null}
    </div>
  );
}

/** A booking approved and not paid yet. Same as functions payByOf. */
export function PayCountdown({ r }) {
  const now = useNow();
  const start = asDate(r.start)?.getTime();
  const approved = asDate(r.approvedAt)?.getTime() || 0;
  if (!start) return null;
  const by = r.instant ? Math.min(approved + 3600e3, start) : Math.max(start - 3 * 3600e3, Math.min(approved + 3600e3, start));
  const remaining = by - now;
  if (remaining <= 0) return <p className="text-sm font-bold text-[#6B7280] mt-1">Payment deadline passed. This updates in a few minutes.</p>;
  return (
    <p className="text-sm font-bold mt-1 inline-flex items-center gap-1.5" style={{ color: tone(remaining) }}>
      <Timer size={15} /> {left(remaining)} left to pay, then it cancels
    </p>
  );
}

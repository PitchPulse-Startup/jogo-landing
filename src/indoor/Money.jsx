// src/indoor/Money.jsx — an indoor's money, the way a business looks at it: what it
// made, how that compares, how much of its field time is earning, and a file for
// its accountant. Everything is worked out from the payments in gamePayments.
//   What the indoor keeps from a payment: its share if it stands; if a late cancel
//   refunded part of it, the part that stayed; nothing if it was all refunded.
//   When the indoor itself cancelled, it also covers the payment fee.
import React, { useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Download, ExternalLink } from 'lucide-react';
import { DISPLAY } from '../App.jsx';
import { asDate, money, openPayouts } from './actions';

const KIT = '#0E7A43';
const RANGES = [{ id: 7, t: '7 days' }, { id: 30, t: '30 days' }, { id: 90, t: '90 days' }, { id: 0, t: 'All time' }];
const LABEL = { rental: 'Field booking', renterShare: 'Renter\'s share', gameSpot: 'Player spot' };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dollars = (c) => {
  const n = Math.round((c || 0) / 100);
  return `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US')}`;
};
const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** What the indoor ended up with from one payment, and what it cost it. */
export const netOf = (p, rental) => {
  const share = p.shareCents || 0;
  if (p.status === 'paid' || p.status === 'kept') return share;
  if (p.status !== 'refunded') return 0;
  if (rental?.cancelledBy === 'venue') return -(p.cardFeeCents || 0);
  // Free cancellation, minus card fees: the fee went to Stripe, the indoor keeps nothing.
  if (rental?.freeCancel) return 0;
  const partOfBooking = p.kind === 'rental' || p.kind === 'renterShare';
  if (partOfBooking && rental?.refundCents && rental.refundCents < p.amountCents) {
    return Math.round(share * (1 - rental.refundCents / p.amountCents));
  }
  return 0;
};

// Hours each week the field can earn, from its open hours.
const openHoursPerDay = (venue, date) => {
  const h = Array.isArray(venue.hours) ? venue.hours[date.getDay()] : { open: 360, close: 1440 };
  return h ? (h.close - h.open) / 60 : 0;
};

function Chart({ buckets }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...buckets.map((b) => b.cents), 1);
  const shown = hover != null ? buckets[hover] : null;
  return (
    <div>
      <div className="h-6 text-sm font-bold text-white/80">{shown ? `${shown.label}: ${money(shown.cents)}` : ''}</div>
      <div className="flex items-end gap-[2px] h-36" onMouseLeave={() => setHover(null)}>
        {buckets.map((b, i) => (
          <button
            type="button"
            key={b.label}
            aria-label={`${b.label}: ${money(b.cents)}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => setHover(i)}
            className="flex-1 min-w-0 h-full flex items-end"
          >
            <span className="w-full rounded-t block" style={{ height: b.cents > 0 ? `${Math.max(4, (b.cents / max) * 100)}%` : 2, background: b.cents > 0 ? (hover === i ? '#FFFFFF' : '#4ADE80') : 'rgba(255,255,255,0.15)' }} />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-white/50 mt-2"><span>{buckets[0]?.label}</span><span>{buckets[buckets.length - 1]?.label}</span></div>
    </div>
  );
}

const Tile = ({ k, v, sub }) => (
  <div className="bg-white rounded-3xl border border-[#E6E8EC] p-5">
    <div className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280]">{k}</div>
    <div style={DISPLAY} className="text-3xl sm:text-4xl leading-[1.35] text-[#0B0D10] mt-1">{v}</div>
    {sub ? <div className="text-sm font-semibold text-[#6B7280]">{sub}</div> : null}
  </div>
);

function Bars({ rows }) {
  const max = Math.max(...rows.map((r) => r.cents), 1);
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1" title={`${r.label}: ${money(r.cents)}`}>
          <div className="flex-1 sm:flex-none sm:w-28 shrink-0 text-sm font-bold text-[#0B0D10]">{r.label}</div>
          <div className="order-last sm:order-none w-full sm:w-auto sm:flex-1 h-5 sm:h-6 rounded-md bg-[#F2F3F5] overflow-hidden"><div className="h-full rounded-r" style={{ width: `${(Math.max(r.cents, 0) / max) * 100}%`, background: KIT }} /></div>
          <div className="sm:w-16 shrink-0 text-sm text-right font-extrabold text-[#0B0D10]">{dollars(r.cents)}</div>
        </div>
      ))}
    </div>
  );
}

const Card = ({ title, sub, right, children }) => (
  <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="font-extrabold text-lg text-[#0B0D10]">{title}</h2>
        {sub ? <p className="text-sm font-semibold text-[#6B7280]">{sub}</p> : null}
      </div>
      {right}
    </div>
    {children}
  </section>
);

export default function Money({ venue, payments, rentals, games, now = new Date() }) {
  const [range, setRange] = useState(30);
  const [stripeBusy, setStripeBusy] = useState(false);
  const [stripeErr, setStripeErr] = useState(null);

  const d = useMemo(() => {
    const rentalById = new Map(rentals.map((r) => [r.id, r]));
    const rows = payments
      .map((p) => ({ ...p, at: asDate(p.createdAt), net: netOf(p, rentalById.get(p.rentalId)) }))
      .filter((p) => p.at)
      .sort((a, b) => b.at - a.at);
    const oldest = rows.length ? rows[rows.length - 1].at : now;
    const today = dayStart(now);
    const days = range || Math.max(1, Math.ceil((today - dayStart(oldest)) / 864e5) + 1);
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days + 1);
    const prevFrom = new Date(from.getFullYear(), from.getMonth(), from.getDate() - days);
    const inRange = rows.filter((p) => p.at >= from);
    const prev = range ? rows.filter((p) => p.at >= prevFrom && p.at < from) : [];
    const sum = (l) => l.reduce((n, p) => n + p.net, 0);
    const total = sum(inRange);
    const prevTotal = sum(prev);
    const change = range && prevTotal > 0 ? (total - prevTotal) / prevTotal : null;

    // By day up to a month, by week past that.
    const step = days > 45 ? 7 : 1;
    const count = Math.ceil(days / step);
    const buckets = Array.from({ length: count }, (_, i) => {
      const s = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i * step);
      const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + step);
      const label = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label: step > 1 ? `Week of ${label}` : label, cents: sum(inRange.filter((p) => p.at >= s && p.at < e)) };
    });

    const paidCount = inRange.filter((p) => p.status === 'paid' || p.status === 'kept').length;
    const refunded = inRange.filter((p) => p.status === 'refunded');
    const refundFees = inRange.filter((p) => p.net < 0).reduce((n, p) => n - p.net, 0);

    // How much of its open time actually earned: hours sold on the field.
    const stood = (s, e) => { const a = asDate(s); const b = asDate(e); return a && b && a >= from && a <= now ? (b - a) / 3600e3 : 0; };
    const soldHours = rentals.filter((r) => r.status === 'paid').reduce((n, r) => n + stood(r.start, r.end), 0)
      + games.filter((g) => !g.rentalId && g.status !== 'cancelled' && (g.players || []).length).reduce((n, g) => n + stood(g.startDateTime, g.endDateTime), 0);
    let openHours = 0;
    for (let i = 0; i < days; i += 1) openHours += openHoursPerDay(venue, new Date(from.getFullYear(), from.getMonth(), from.getDate() + i));
    openHours *= Math.max(1, Number(venue.fieldCount) || 1);

    const byDay = DAY_NAMES.map((label, i) => ({ label, cents: sum(inRange.filter((p) => p.at.getDay() === i)) }));
    const bySource = [
      { label: 'Player spots', cents: sum(inRange.filter((p) => (p.kind || 'gameSpot') === 'gameSpot')) },
      { label: 'Field bookings', cents: sum(inRange.filter((p) => p.kind === 'rental' || p.kind === 'renterShare')) },
    ];
    const bestDay = [...byDay].sort((a, b) => b.cents - a.cents)[0];
    return { rows, inRange, total, change, prevTotal, buckets, paidCount, refunded, refundFees, soldHours, openHours, byDay, bySource, bestDay, days };
  }, [payments, rentals, games, venue, range, now]);

  const exportCsv = () => {
    const head = ['Date', 'Type', 'Your price', 'You kept', 'Status'];
    const lines = d.inRange.map((p) => [p.at.toISOString().slice(0, 10), LABEL[p.kind || 'gameSpot'] || 'Payment', ((p.shareCents || 0) / 100).toFixed(2), (p.net / 100).toFixed(2), p.status]);
    const csv = [head, ...lines].map((l) => l.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `jogo-earnings-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const openStripe = async () => {
    setStripeBusy(true); setStripeErr(null);
    try { await openPayouts(); } catch (e) { console.error('stripe failed:', e); setStripeErr('Couldn\'t open Stripe. Try again.'); }
    setStripeBusy(false);
  };

  const up = d.change != null && d.change >= 0;
  const perHour = d.soldHours ? d.total / d.soldHours : 0;
  const used = d.openHours ? Math.min(1, d.soldHours / d.openHours) : 0;
  const rangeName = RANGES.find((r) => r.id === range).t.toLowerCase();

  return (
    <div className="space-y-4">
      <div className="bg-[#0B0D10] rounded-3xl p-5 sm:p-7 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-extrabold tracking-[0.16em] uppercase text-[#4ADE80]">You made</div>
          <div className="flex gap-0.5 sm:gap-1 bg-white/10 rounded-full p-1 max-w-full">
            {RANGES.map((r) => (
              <button key={r.id} type="button" onClick={() => setRange(r.id)} className={`h-8 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${range === r.id ? 'bg-white text-[#0B0D10]' : 'text-white/70'}`}>{r.t}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-x-4 mt-1">
          <div style={DISPLAY} className="text-6xl sm:text-7xl leading-[1.3]">{money(d.total)}</div>
          {d.change != null ? (
            <div className={`mb-4 inline-flex items-center gap-1 font-extrabold ${up ? 'text-[#4ADE80]' : 'text-[#FCA5A5]'}`}>
              {up ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}{Math.abs(Math.round(d.change * 100))}% vs the {rangeName} before
            </div>
          ) : null}
        </div>
        <Chart buckets={d.buckets} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile k="Per field hour" v={perHour ? money(Math.round(perHour)) : '–'} sub={`${Math.round(d.soldHours * 10) / 10} hrs sold`} />
        <Tile k="Field time used" v={d.openHours ? `${Math.round(used * 100)}%` : '–'} sub={`of ${Math.round(d.openHours)} open hrs`} />
        <Tile k="Payments" v={d.paidCount} sub={d.paidCount ? `${money(Math.round(d.total / d.paidCount))} average` : 'in this range'} />
        <Tile k="Refunded" v={d.refunded.length} sub={d.refundFees ? `${money(d.refundFees)} in fees you covered` : 'No fees to you'} />
      </div>

      {d.openHours && used < 1 ? (
        <div className="bg-[#E4F5EA] rounded-3xl px-5 py-4 text-[#0B0D10] font-semibold">
          <span className="font-extrabold text-[#0E7A43]">{Math.round(d.openHours - d.soldHours).toLocaleString('en-US')} open hours</span> went unsold in this range{perHour ? <>. At your {money(Math.round(perHour))} per hour, filling just 10% more would add about <span className="font-extrabold text-[#0E7A43]">{dollars(perHour * (d.openHours - d.soldHours) * 0.1)}</span></> : ''}.
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="By day of the week" sub={d.bestDay?.cents > 0 ? `${d.bestDay.label} earns the most` : 'When your money comes in'}><Bars rows={d.byDay} /></Card>
        <Card title="Where it comes from" sub="Games you post and fields people rent"><Bars rows={d.bySource} /></Card>
      </div>

      <Card
        title="Payouts"
        sub={venue.payouts?.ready ? 'On. Your money goes straight to your bank through Stripe.' : 'Not set up yet. Players can\'t pay until they are.'}
        right={(
          <button type="button" onClick={openStripe} disabled={stripeBusy} className="h-10 px-4 rounded-full bg-[#0B0D10] text-white text-sm font-extrabold inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50">
            {stripeBusy ? 'Opening…' : venue.payouts?.ready ? <>Open Stripe <ExternalLink size={14} /></> : 'Set up payouts'}
          </button>
        )}
      >
        <p className="text-sm font-semibold text-[#6B7280]">{stripeErr || 'What you made is shown here as soon as a player pays. Stripe shows when each deposit reaches your bank.'}</p>
      </Card>

      <Card
        title="Payments"
        sub={`${d.inRange.length} in the ${rangeName === 'all time' ? 'whole history' : `last ${rangeName}`}`}
        right={d.inRange.length ? (
          <button type="button" onClick={exportCsv} className="h-10 px-4 rounded-full bg-[#F2F3F5] text-[#0B0D10] text-sm font-extrabold inline-flex items-center gap-1.5 shrink-0"><Download size={15} /> Export for taxes</button>
        ) : null}
      >
        {d.inRange.length ? d.inRange.slice(0, 40).map((p, i) => (
          <div key={p.sessionId || i} className="border-t first:border-t-0 border-[#EEF0F3] py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-bold text-[#0B0D10]">{LABEL[p.kind || 'gameSpot'] || 'Payment'}</div>
              <div className="text-sm font-semibold text-[#6B7280]">{p.at.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(':00', '')}</div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-extrabold ${p.net < 0 ? 'text-[#BE123C]' : p.status === 'refunded' && !p.net ? 'text-[#9CA3AF] line-through' : 'text-[#0B0D10]'}`}>{p.status === 'refunded' && !p.net ? money(p.shareCents) : `${p.net < 0 ? '-' : ''}${money(Math.abs(p.net))}`}</div>
              <div className="text-sm font-semibold text-[#6B7280]">{p.status === 'refunded' ? (p.net > 0 ? 'Late cancel, you kept this' : p.net < 0 ? 'You cancelled, fee' : 'Refunded') : 'Paid'}</div>
            </div>
          </div>
        )) : <p className="text-[#6B7280] font-semibold py-3 text-center">No payments in this range.</p>}
      </Card>
    </div>
  );
}

// src/indoor/Analytics.jsx — what an indoor can learn from its own activity.
//
// Views come from venues/{id}/stats/{YYYY-MM-DD} (the app counts them). Fill comes
// from its games, past and upcoming; demand from rental requests. Every "best"
// claim needs at least MIN_GAMES behind it, so a couple of games can't pretend to
// be a pattern, and has to beat the next one by CLEAR_LEAD: a tie or a hair's
// difference isn't a finding. Until then the section says so.
import React, { useMemo } from 'react';

const KIT = '#0E7A43';
const MIN_GAMES = 3;
const CLEAR_LEAD = 0.05; // 5 points of fill
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BLOCKS = [
  { label: '6–10 AM', from: 6, to: 10 },
  { label: '10–2 PM', from: 10, to: 14 },
  { label: '2–5 PM', from: 14, to: 17 },
  { label: '5–7 PM', from: 17, to: 19 },
  { label: '7–9 PM', from: 19, to: 21 },
  { label: '9–12 AM', from: 21, to: 24 },
];
const asDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
const money = (c) => `$${((c || 0) / 100).toFixed((c || 0) % 100 ? 2 : 0)}`;
const hourLabel = (h) => `${h % 12 || 12} ${h < 12 || h === 24 ? 'AM' : 'PM'}`;
const monIndex = (d) => (d.getDay() + 6) % 7;
const blockOf = (d) => BLOCKS.findIndex((b) => d.getHours() >= b.from && d.getHours() < b.to);
const fillOf = (g) => {
  const n = (g.players || []).reduce((sum, p) => sum + 1 + (Number(p?.guests) || 0), 0);
  return g.maxPlayers ? Math.min(1, n / g.maxPlayers) : 0;
};
const average = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
const PRICE_BUCKETS = [
  { label: 'Free', test: (c) => !c },
  { label: 'Under $10', test: (c) => c > 0 && c < 1000 },
  { label: '$10–$14', test: (c) => c >= 1000 && c < 1500 },
  { label: '$15–$19', test: (c) => c >= 1500 && c < 2000 },
  { label: '$20+', test: (c) => c >= 2000 },
];

const Card = ({ title, sub, children }) => (
  <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
    <h2 className="font-extrabold text-lg text-[#0B0D10]">{title}</h2>
    {sub ? <p className="text-sm font-semibold text-[#6B7280] mt-0.5">{sub}</p> : null}
    <div className="mt-4">{children}</div>
  </section>
);
const NotYet = ({ children }) => <p className="text-[#6B7280] font-semibold py-3">{children}</p>;

// One measure, one hue; the value is written beside each bar.
function Bars({ rows, format, best }) {
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3" title={`${r.label}: ${format(r.value)}${r.note ? ` (${r.note})` : ''}`}>
          <div className="w-24 shrink-0 text-sm font-bold text-[#0B0D10]">{r.label}</div>
          <div className="flex-1 h-7 rounded-md bg-[#F2F3F5] overflow-hidden">
            <div className="h-full rounded-r" style={{ width: `${r.value * 100}%`, background: KIT, opacity: best && r.label !== best ? 0.45 : 1 }} />
          </div>
          <div className="w-28 shrink-0 text-sm text-right">
            <span className="font-extrabold text-[#0B0D10]">{format(r.value)}</span>
            {r.note ? <span className="font-semibold text-[#6B7280]"> · {r.note}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Daily({ days }) {
  const max = Math.max(...days.map((d) => d.views), 1);
  return (
    <div>
      <div className="flex items-end gap-[2px] h-32">
        {days.map((d) => (
          <div key={d.key} className="flex-1 h-full flex items-end group relative" title={`${d.label}: ${d.views} view${d.views === 1 ? '' : 's'}`}>
            <div className="w-full rounded-t" style={{ height: d.views ? `${Math.max(4, (d.views / max) * 100)}%` : 2, background: d.views ? KIT : '#E6E8EC' }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-[#6B7280] mt-2">
        <span>{days[0].label}</span><span>Today</span>
      </div>
    </div>
  );
}

function Heat({ grid }) {
  const max = Math.max(...grid.flat(), 1);
  return (
    <div>
      <table className="w-full table-fixed border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th aria-label="Time" className="w-[68px] sm:w-28" />
            {DAYS.map((d) => <th key={d} className="text-xs font-extrabold text-[#6B7280] pb-1">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {BLOCKS.map((b, bi) => (
            <tr key={b.label}>
              <th scope="row" className="text-[11px] sm:text-xs font-bold text-[#0B0D10] text-left pr-1 leading-tight">{b.label}</th>
              {DAYS.map((d, di) => {
                const n = grid[di][bi];
                const strong = n / max;
                return (
                  <td
                    key={d}
                    title={`${d} ${b.label}: ${n}`}
                    className="h-10 rounded-md text-center text-sm font-extrabold"
                    style={{ background: n ? `rgba(14,122,67,${0.15 + strong * 0.85})` : '#F2F3F5', color: strong > 0.55 ? '#FFFFFF' : '#0B0D10' }}
                  >
                    {n || ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Tile = ({ k, v, sub, f }) => (
  <div className="bg-white rounded-3xl border border-[#E6E8EC] p-5">
    <div className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280]">{k}</div>
    <div style={f} className="text-4xl leading-[1.35] text-[#0B0D10] mt-1">{v}</div>
    {sub ? <div className="text-sm font-semibold text-[#6B7280]">{sub}</div> : null}
  </div>
);

export default function Analytics({ games, rentals, payments, stats, f, now = new Date() }) {
  const a = useMemo(() => {
    const since = now.getTime() - 30 * 864e5;
    const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const byDay = new Map(stats.map((s) => [s.id, s]));
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29 + i);
      return { key: key(d), label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), views: byDay.get(key(d))?.views || 0 };
    });
    const recent = stats.filter((s) => days.some((d) => d.key === s.id));
    const views = recent.reduce((n, s) => n + (s.views || 0), 0);
    const rentOpens = recent.reduce((n, s) => n + (s.rentOpens || 0), 0);
    const gameViews = recent.reduce((n, s) => n + (s.gameViews || 0), 0);

    const viewHours = Array(24).fill(0);
    recent.forEach((s) => Object.entries(s.byHour || {}).forEach(([h, n]) => { viewHours[Number(h)] += n; }));
    const peak = viewHours.indexOf(Math.max(...viewHours));

    const recentRentals = rentals.filter((r) => asDate(r.createdAt)?.getTime() >= since);
    const booked = recentRentals.filter((r) => r.status === 'paid' || r.paidAt).length;

    // Who wanted when: every rental request, and every player on a game.
    const grid = DAYS.map(() => BLOCKS.map(() => 0));
    rentals.forEach((r) => {
      const d = asDate(r.start);
      const b = d ? blockOf(d) : -1;
      if (b >= 0) grid[monIndex(d)][b] += 1;
    });

    const dated = games.filter((g) => g.status !== 'cancelled' && asDate(g.startDateTime));
    const timeRows = BLOCKS.map((b, i) => {
      const list = dated.filter((g) => blockOf(asDate(g.startDateTime)) === i);
      return { label: b.label, value: average(list.map(fillOf)), n: list.length, note: `${list.length} game${list.length === 1 ? '' : 's'}` };
    }).filter((r) => r.n);
    const dayRows = DAYS.map((label, i) => {
      const list = dated.filter((g) => monIndex(asDate(g.startDateTime)) === i);
      return { label, value: average(list.map(fillOf)), n: list.length, note: `${list.length} game${list.length === 1 ? '' : 's'}` };
    }).filter((r) => r.n);
    const priceRows = PRICE_BUCKETS.map((b) => {
      const list = dated.filter((g) => b.test(g.priceCents || 0));
      return { label: b.label, value: average(list.map(fillOf)), n: list.length, note: `${list.length} game${list.length === 1 ? '' : 's'}` };
    }).filter((r) => r.n);
    const bestOf = (rows) => {
      const ok = rows.filter((r) => r.n >= MIN_GAMES);
      if (ok.length < 2) return null;
      const [top, next] = [...ok].sort((x, y) => y.value - x.value);
      return top.value - next.value >= CLEAR_LEAD ? top : null;
    };
    const earned = payments.filter((p) => p.status === 'paid' && asDate(p.createdAt)?.getTime() >= since).reduce((n, p) => n + (p.shareCents || 0), 0);
    return { days, views, rentOpens, gameViews, peak, hasHours: viewHours.some(Boolean), requests: recentRentals.length, booked, grid, gridTotal: grid.flat().reduce((x, y) => x + y, 0), timeRows, dayRows, priceRows, bestTime: bestOf(timeRows), bestDay: bestOf(dayRows), bestPrice: bestOf(priceRows), gameCount: dated.length, earned };
  }, [games, rentals, payments, stats, now]);

  const pct = (v) => `${Math.round(v * 100)}%`;
  const rate = (x, y) => (y ? `${Math.round((x / y) * 100)}%` : '–');
  const tips = [
    a.bestTime ? `${a.bestTime.label} fills best, at ${pct(a.bestTime.value)} full.` : null,
    a.bestDay ? `${a.bestDay.label} is your fullest day, at ${pct(a.bestDay.value)}.` : null,
    a.bestPrice ? `${a.bestPrice.label} games fill best, at ${pct(a.bestPrice.value)}.` : null,
    a.hasHours ? `Most people look at your page around ${hourLabel(a.peak)}, so that's a good time to post.` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile f={f} k="Page views" v={a.views} sub="last 30 days" />
        <Tile f={f} k="Tapped rent" v={a.rentOpens} sub={`${rate(a.rentOpens, a.views)} of views`} />
        <Tile f={f} k="Requests" v={a.requests} sub={`${rate(a.requests, a.rentOpens)} of those`} />
        <Tile f={f} k="Earned" v={money(a.earned)} sub={`${a.booked} booked`} />
      </div>

      <div className="bg-[#0B0D10] rounded-3xl p-5 sm:p-6 text-white">
        <div className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#4ADE80]">What this tells you</div>
        {tips.length ? (
          <ul className="mt-2 space-y-1.5">{tips.map((t) => <li key={t} className="font-semibold">{t}</li>)}</ul>
        ) : (
          <p className="mt-2 font-semibold text-white/80">Nothing clear yet. A tip shows up once one time, day or price clearly beats another, with at least {MIN_GAMES} games behind each.</p>
        )}
      </div>

      <Card title="Page views" sub="People who opened your page, last 30 days">
        {a.views ? <Daily days={a.days} /> : <NotYet>Views start counting when players are on the latest version of the app.</NotYet>}
      </Card>

      <Card title="When people want your field" sub="Rental requests by day and time. Darker means more.">
        {a.gridTotal ? <Heat grid={a.grid} /> : <NotYet>Requests show here as they come in.</NotYet>}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="What time fills best" sub="How full your games get">
          {a.timeRows.length ? <Bars rows={a.timeRows} format={pct} best={a.bestTime?.label} /> : <NotYet>Post a few games to see this.</NotYet>}
        </Card>
        <Card title="What price fills best" sub="How full your games get">
          {a.priceRows.length ? <Bars rows={a.priceRows} format={pct} best={a.bestPrice?.label} /> : <NotYet>Post a few games to see this.</NotYet>}
        </Card>
      </div>
      <Card title="What day fills best" sub="How full your games get">
        {a.dayRows.length ? <Bars rows={a.dayRows} format={pct} best={a.bestDay?.label} /> : <NotYet>Post a few games to see this.</NotYet>}
      </Card>
    </div>
  );
}

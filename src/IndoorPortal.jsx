// src/IndoorPortal.jsx — jogous.io/indoors/portal, an indoor owner's desk on the
// web. They sign in with the same account as the app and see more room than a
// phone gives: the schedule with who's coming, bookings, what they've earned,
// and the set rates that live here. They can answer requests and splits, create
// games, and call off a booking when something happens.
import React, { useEffect, useMemo, useState } from 'react';
import {
  signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut,
} from 'firebase/auth';
import {
  collection, doc, onSnapshot, query, updateDoc, where, serverTimestamp, deleteField,
} from 'firebase/firestore';
import {
  CalendarDays, Key, Wallet, Clock, LayoutDashboard, LogOut, ChevronDown, Users, BarChart3, BadgeCheck, Settings,
} from 'lucide-react';
import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import { DISPLAY, BODY, useMatchdayFonts } from './App.jsx';
import { auth, db } from './firebase';
import RatesEditor, { dayProblem } from './indoor/RatesEditor.jsx';
import Analytics from './indoor/Analytics.jsx';
import Money from './indoor/Money.jsx';
import { CancelBooking, CreateButton, CreateGame, DeleteIndoor, RequestCard, SplitCard } from './indoor/Answers.jsx';
import Toaster, { toast } from './indoor/Toast.jsx';
import { FillCountdown, PayCountdown } from './indoor/Countdown.jsx';

const money = (c) => `$${((c || 0) / 100).toFixed((c || 0) % 100 ? 2 : 0)}`;
const asDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
const dayLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const timeLabel = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '');
const range = (a, b) => `${timeLabel(a)} – ${timeLabel(b)}`;
const attending = (g) => (g.players || []).reduce((n, p) => n + 1 + (Number(p?.guests) || 0), 0);

const TABS = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
  { id: 'schedule', label: 'Schedule', Icon: CalendarDays },
  { id: 'bookings', label: 'Bookings', Icon: Key },
  { id: 'rates', label: 'Slots & rates', Icon: Clock },
  { id: 'money', label: 'Money', Icon: Wallet },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

function SignIn({ f }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setNote(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(err?.code === 'auth/too-many-requests' ? 'Too many tries. Wait a minute and try again.' : 'That email and password don\'t match.');
      setBusy(false);
    }
  };
  const reset = async () => {
    if (!email.trim()) { setError('Type your email first.'); return; }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNote('Check your email for a link to reset your password.');
    } catch (err) {
      setError('Couldn\'t send that. Check your email address.');
    }
  };
  return (
    <div style={BODY} className="min-h-screen bg-[#0B0D10] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <img src={jogoLogoWhite} alt="Jogo" className="h-8 mx-auto" />
        <h1 style={f} className="text-white text-5xl leading-[1.3] text-center mt-6">YOUR INDOOR</h1>
        <p className="text-white/60 font-semibold text-center mb-7">Sign in with your Jogo account.</p>
        <form onSubmit={submit} className="bg-white rounded-3xl p-6 sm:p-7 space-y-3">
          <label className="block">
            <span className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280]">Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full h-12 rounded-xl bg-[#F2F3F5] px-4 font-semibold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0E7A43]" />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280]">Password</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full h-12 rounded-xl bg-[#F2F3F5] px-4 font-semibold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0E7A43]" />
          </label>
          {error ? <p className="text-sm font-semibold text-[#BE123C]">{error}</p> : null}
          {note ? <p className="text-sm font-semibold text-[#0E7A43]">{note}</p> : null}
          <button type="submit" disabled={busy} className="w-full h-12 rounded-full bg-[#0B0D10] text-white font-extrabold disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
          <button type="button" onClick={reset} className="w-full text-sm font-bold text-[#6B7280] py-1">Forgot your password?</button>
        </form>
      </div>
    </div>
  );
}

const Card = ({ title, children, right }) => (
  <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
    {title ? (
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-extrabold text-lg text-[#0B0D10]">{title}</h2>
        {right}
      </div>
    ) : null}
    {children}
  </section>
);

const Stat = ({ k, v, sub, f }) => (
  <div className="bg-white rounded-3xl border border-[#E6E8EC] p-5">
    <div className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#6B7280]">{k}</div>
    <div style={f} className="text-4xl leading-[1.35] text-[#0B0D10] mt-1">{v}</div>
    {sub ? <div className="text-sm font-semibold text-[#6B7280]">{sub}</div> : null}
  </div>
);

const Empty = ({ children }) => <p className="text-[#6B7280] font-semibold py-4 text-center">{children}</p>;

// Scanned the front-desk code, so they're really here (arrivals[uid].via === 'qr').
const verifiedAt = (game, uid) => {
  const a = game.arrivals?.[uid];
  return a?.status === 'arrived' ? asDate(a.at) || true : null;
};

export function GameRow({ game, fieldCount }) {
  const [open, setOpen] = useState(false);
  const st = asDate(game.startDateTime);
  const en = asDate(game.endDateTime);
  const n = attending(game);
  const max = game.maxPlayers || 0;
  const players = game.players || [];
  const here = players.filter((p) => verifiedAt(game, p.userId)).length;
  return (
    <div className="border-t first:border-t-0 border-[#EEF0F3]">
      <button type="button" onClick={() => setOpen(!open)} className="w-full py-3.5 flex items-center gap-4 text-left">
        <div className="w-32 sm:w-40 shrink-0">
          <div className="font-extrabold text-[#0B0D10]">{st ? dayLabel(st) : ''}</div>
          <div className="text-sm font-semibold text-[#6B7280]">{st && en ? range(st, en) : ''}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#0B0D10] truncate">{game.title}{fieldCount > 1 && game.venueField ? ` · Field ${game.venueField}` : ''}</div>
          {game.decideAt && game.minPlayers ? <FillCountdown have={n} need={game.minPlayers} decideAt={game.decideAt} /> : (
            <div className="h-1.5 rounded bg-[#EEF0F3] mt-1.5 overflow-hidden"><div className="h-full bg-[#4ADE80]" style={{ width: `${max ? Math.min(100, (n / max) * 100) : 0}%` }} /></div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-extrabold text-[#0B0D10]">{n}/{max}</div>
          <div className="text-sm font-semibold text-[#6B7280]">{game.priceCents ? money(game.priceCents) : 'Free'}</div>
          {here ? <div className="text-sm font-bold text-[#0E7A43] inline-flex items-center gap-1"><BadgeCheck size={14} /> {here} verified</div> : null}
        </div>
        <ChevronDown size={18} className={`text-[#9CA3AF] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="pb-4 sm:pl-44">
          {players.length ? (
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {players.map((p) => (
                <li key={p.userId} className="flex justify-between gap-3 text-sm font-semibold text-[#0B0D10]">
                  <span className="truncate">{p.displayName || 'Player'}{p.guests ? ` +${p.guests}` : ''}</span>
                  {verifiedAt(game, p.userId) ? (
                    <span className="text-[#0E7A43] font-bold inline-flex items-center gap-1 shrink-0"><BadgeCheck size={15} /> Verified{verifiedAt(game, p.userId) instanceof Date ? ` ${timeLabel(verifiedAt(game, p.userId))}` : ''}</span>
                  ) : <span className="text-[#9CA3AF] shrink-0">{p.paid ? 'Paid, not here yet' : 'Not here yet'}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm font-semibold text-[#6B7280]">Nobody yet.</p>}
        </div>
      ) : null}
    </div>
  );
}

const STATUS = {
  requested: { t: 'Needs an answer', c: 'bg-[#FEF3C7] text-[#B45309]' },
  approved: { t: 'In progress', c: 'bg-[#FEF3C7] text-[#B45309]' },
  paid: { t: 'Booked', c: 'bg-[#E4F5EA] text-[#0E7A43]' },
};

function BookingRow({ r, fieldCount, payments = [], games = [] }) {
  const splitGame = r.gameId ? games.find((g) => g.id === r.gameId) : null;
  const st = asDate(r.start);
  const en = asDate(r.end);
  const s = STATUS[r.status];
  return (
    <div className="border-t first:border-t-0 border-[#EEF0F3] py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1">
      <div className="w-32 sm:w-40 shrink-0">
        <div className="font-extrabold text-[#0B0D10]">{st ? dayLabel(st) : ''}</div>
        <div className="text-sm font-semibold text-[#6B7280]">{st && en ? range(st, en) : ''}</div>
      </div>
      <div className="flex-1 min-w-[140px]">
        <div className="font-bold text-[#0B0D10]">{r.userName}</div>
        <div className="text-sm font-semibold text-[#6B7280]">
          {[fieldCount > 1 ? (r.field ? `Field ${r.field}` : 'Any field') : null, r.split?.maxPlayers ? `${r.split.maxPlayers} players at ${money(r.split.shareCents)}` : null, r.note ? `"${r.note}"` : null].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div className="font-extrabold text-[#0B0D10]">{r.priceCents ? money(r.priceCents) : ''}</div>
      {s ? <span className={`text-xs font-extrabold tracking-wide uppercase rounded-lg px-2.5 py-1 ${s.c}`}>{s.t}</span> : null}
      {r.status === 'approved' && r.split?.status === 'approved' && r.split.decideAt ? (
        <div className="w-full">
          {r.gameId ? <FillCountdown have={splitGame ? attending(splitGame) : 0} need={r.split.minPlayers || r.split.maxPlayers} decideAt={r.split.decideAt} />
            : <FillCountdown have={0} need={r.split.minPlayers || r.split.maxPlayers} decideAt={r.split.decideAt} />}
          {!r.gameId ? <p className="text-xs font-semibold text-[#6B7280] mt-1">Waiting on {(r.userName || 'the renter').split(' ')[0]} to pay their share and start the game.</p> : null}
        </div>
      ) : r.status === 'approved' && !['pending', 'countered'].includes(r.split?.status) && !r.split?.reached ? <div className="w-full"><PayCountdown r={r} /></div> : null}
      {['approved', 'paid'].includes(r.status) ? <div className="w-full mt-1"><CancelBooking r={r} payments={payments} /></div> : null}
    </div>
  );
}

function Rates({ venue }) {
  const [slots, setSlots] = useState(() => venue.rentalSlots || {});
  const [state, setState] = useState(null); // 'saving' | 'saved' | 'error'
  // The database hands fields back in its own order, so compare by value.
  const norm = (o) => JSON.stringify(Object.keys(o || {}).sort().filter((k) => o[k].length).map((k) => [k, o[k].map((x) => [x.from, x.to, x.cents])]));
  const dirty = norm(slots) !== norm(venue.rentalSlots);
  const problem = Object.values(slots).some((l) => dayProblem(l));
  const any = Object.values(slots).some((l) => l.length);
  const write = async (value) => {
    setState('saving');
    try {
      await updateDoc(doc(db, 'venues', venue.id), { rentalSlots: value, updatedAt: serverTimestamp() });
      setState('saved');
      toast('Rates saved', 'Players can book those times right away.');
    } catch (e) {
      console.error('saving slots failed:', e);
      setState(e?.code === 'permission-denied' ? 'denied' : 'error');
    }
  };
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-extrabold text-lg text-[#0B0D10]">Set rates</h2>
        <p className="text-[#6B7280] font-semibold mt-1">
          Inside these times, players book at your rate and pay right away, with nothing for you to approve. Any other open hour they can still ask for, and you set the price when you approve.
        </p>
      </Card>
      <RatesEditor slots={slots} hours={venue.hours} onChange={(s) => { setSlots(s); setState(null); }} saved={venue.rentalSlots || {}} saveState={state} onSave={() => write(slots)} />
      <div className="sticky bottom-4 bg-[#0B0D10] rounded-2xl p-3 pl-5 flex items-center justify-between gap-3 shadow-xl">
        <span className="text-white font-semibold text-sm">
          {state === 'saved' && !dirty ? 'Saved. Players see this now.'
            : state === 'denied' ? 'This account can\'t change this indoor.'
            : state === 'error' ? 'Couldn\'t save. Try again.'
              : problem ? 'Fix the slots marked in red.'
                : dirty ? 'You have changes to save.' : any ? 'Your slots are live.' : 'No slots set yet.'}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {venue.rentalSlots ? (
            <button type="button" onClick={() => { setSlots({}); write(deleteField()); }} className="h-11 px-4 rounded-full text-white/70 font-bold text-sm">Turn off</button>
          ) : null}
          <button type="button" disabled={!dirty || problem || !any || state === 'saving'} onClick={() => write(slots)} className="h-11 px-6 rounded-full bg-[#0E7A43] text-white font-extrabold disabled:opacity-40">
            {state === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Desk({ user, venue }) {
  const [tab, setTab] = useState('overview');
  const [games, setGames] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [followers, setFollowers] = useState(null);
  const [creating, setCreating] = useState(false);
  const [postedNote, setPostedNote] = useState(null);
  // For Analytics: everything, past games and every request, not just what's coming up.
  const [liveGames, setLiveGames] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [allRentals, setAllRentals] = useState([]);
  const [stats, setStats] = useState([]);

  // Everything here is live: a scan, a request or a payment shows without a refresh.
  useEffect(() => {
    const failed = (what) => (e) => console.error(`${what} failed:`, e);
    const forVenue = (name) => query(collection(db, name), where('venueId', '==', venue.id));
    const unsubs = [
      onSnapshot(forVenue('games'), (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const cutoff = Date.now() - 2 * 3600e3;
        setLiveGames(all);
        setGames(all.filter((g) => g.status !== 'cancelled' && asDate(g.startDateTime)?.getTime() >= cutoff)
          .sort((x, y) => asDate(x.startDateTime) - asDate(y.startDateTime)));
      }, failed('games')),
      onSnapshot(forVenue('archived-games'), (snap) => setPastGames(snap.docs.map((d) => d.data())), failed('archived games')),
      onSnapshot(forVenue('rentals'), (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const now = Date.now();
        setAllRentals(all);
        setRentals(all.filter((r) => ['requested', 'approved', 'paid'].includes(r.status) && asDate(r.end)?.getTime() > now)
          .sort((x, y) => asDate(x.start) - asDate(y.start)));
      }, failed('rentals')),
      onSnapshot(forVenue('gamePayments'), (snap) => setPayments(snap.docs.map((d) => d.data())), failed('payments')),
      onSnapshot(collection(db, 'venues', venue.id, 'followers'), (snap) => setFollowers(snap.size), failed('followers')),
      onSnapshot(collection(db, 'venues', venue.id, 'stats'), (snap) => setStats(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), failed('stats')),
    ];
    return () => unsubs.forEach((u) => u());
  }, [venue.id]);
  const allGames = useMemo(() => [...liveGames, ...pastGames], [liveGames, pastGames]);

  const requests = rentals.filter((r) => r.status === 'requested');
  const splits = rentals.filter((r) => r.status === 'approved' && r.split?.status === 'pending');
  const inProgress = rentals.filter((r) => r.status === 'approved' && r.split?.status !== 'pending');
  const booked = rentals.filter((r) => r.status === 'paid');
  const week = Date.now() + 7 * 864e5;
  const thisWeek = games.filter((g) => asDate(g.startDateTime)?.getTime() < week);
  const earned = useMemo(() => payments.filter((p) => p.status === 'paid').reduce((n, p) => n + (p.shareCents || 0), 0), [payments]);
  const spots = thisWeek.reduce((n, g) => n + attending(g), 0);
  const fieldCount = venue.fieldCount || 1;
  const toAnswer = requests.length + splits.length;
  const finishCreating = (n) => { setCreating(false); setPostedNote(n ? `${n} game${n === 1 ? ' is' : 's are'} live.` : null); };

  return (
    <div style={BODY} className="min-h-screen bg-[#F2F3F5] lg:flex">
      <Toaster />
      <aside className="bg-[#0B0D10] text-white lg:w-64 lg:min-h-screen lg:sticky lg:top-0 lg:self-start shrink-0 flex flex-col">
        <div className="p-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#0E7A43] border-2 border-white shrink-0">
            {venue.logoUrl ? <img src={venue.logoUrl} alt="" className="w-full h-full object-cover" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold truncate">{venue.name}</div>
            <div className="text-xs font-semibold text-[#4ADE80]">{venue.status === 'approved' ? 'Verified on Jogo' : 'In review'}</div>
          </div>
        </div>
        <nav className="flex lg:flex-col gap-1 px-3 pb-3 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`h-11 px-3 rounded-xl flex items-center gap-2.5 font-bold text-sm whitespace-nowrap shrink-0 ${tab === id ? 'bg-white text-[#0B0D10]' : 'text-white/70 hover:bg-white/10'}`}>
              <Icon size={17} /> {label}
              {id === 'bookings' && toAnswer ? <span className="ml-auto bg-[#F59E0B] text-[#0B0D10] rounded-full text-xs font-extrabold px-2 py-0.5">{toAnswer}</span> : null}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => signOut(auth)} className="hidden lg:flex mt-auto m-3 h-11 px-3 rounded-xl items-center gap-2.5 font-bold text-sm text-white/60 hover:bg-white/10">
          <LogOut size={17} /> Sign out
        </button>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-8 max-w-5xl">
        <h1 style={DISPLAY} className="text-4xl sm:text-5xl leading-[1.3] text-[#0B0D10] mb-4">{TABS.find((t) => t.id === tab).label.toUpperCase()}</h1>

        {tab === 'overview' ? (
          <div className="space-y-4">
            {/* What needs them comes first: everything else can wait. */}
            {requests.length ? (
              <Card title={`Requests to answer (${requests.length})`}>
                {requests.map((r) => <RequestCard key={r.id} r={r} venue={venue} games={games} rentals={rentals} />)}
              </Card>
            ) : null}
            {splits.length ? (
              <Card title={`Splits to answer (${splits.length})`}>
                {splits.map((r) => <SplitCard key={r.id} r={r} venue={venue} />)}
              </Card>
            ) : null}
            {!toAnswer ? (
              <div className="bg-[#E4F5EA] rounded-3xl px-5 py-4 font-extrabold text-[#0E7A43]">You're all caught up. No requests to answer.</div>
            ) : null}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat f={DISPLAY} k="This week" v={thisWeek.length} sub={`game${thisWeek.length === 1 ? '' : 's'}`} />
              <Stat f={DISPLAY} k="Players" v={spots} sub="this week" />
              <Stat f={DISPLAY} k="Earned" v={money(earned)} sub="so far" />
              <Stat f={DISPLAY} k="Followers" v={followers ?? '–'} />
            </div>
            {inProgress.length ? (
              <Card title={`In progress (${inProgress.length})`} right={<button type="button" onClick={() => setTab('bookings')} className="text-sm font-bold text-[#0E7A43]">See all</button>}>
                {inProgress.slice(0, 5).map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} payments={payments} games={games} />)}
              </Card>
            ) : null}
            {booked.length ? (
              <Card title={`Booked rentals (${booked.length})`} right={<button type="button" onClick={() => setTab('bookings')} className="text-sm font-bold text-[#0E7A43]">See all</button>}>
                {booked.slice(0, 5).map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} payments={payments} games={games} />)}
              </Card>
            ) : null}
            <Card title="Coming up" right={<button type="button" onClick={() => setTab('schedule')} className="text-sm font-bold text-[#0E7A43]">See all</button>}>
              {games.length ? games.slice(0, 5).map((g) => <GameRow key={g.id} game={g} fieldCount={fieldCount} />) : <Empty>No games posted yet.</Empty>}
            </Card>
          </div>
        ) : null}

        {tab === 'analytics' ? <Analytics games={allGames} rentals={allRentals} payments={payments} stats={stats} f={DISPLAY} /> : null}

        {tab === 'schedule' ? (
          <div className="space-y-4">
            {creating ? <CreateGame venue={venue} games={games} rentals={rentals} onDone={finishCreating} /> : (
              <div className="flex items-center gap-3 flex-wrap">
                <CreateButton onClick={() => { setPostedNote(null); setCreating(true); }} />
                {postedNote ? <span className="font-bold text-[#0E7A43]">{postedNote}</span> : null}
              </div>
            )}
            <Card title={`${games.length} upcoming game${games.length === 1 ? '' : 's'}`} right={<span className="text-sm font-semibold text-[#6B7280] inline-flex items-center gap-1.5"><Users size={15} /> Click a game for the roster</span>}>
              {games.length ? games.map((g) => <GameRow key={g.id} game={g} fieldCount={fieldCount} />) : <Empty>No games posted yet.</Empty>}
            </Card>
          </div>
        ) : null}

        {tab === 'bookings' ? (
          <div className="space-y-4">
            <Card title="Requests">{requests.length ? requests.map((r) => <RequestCard key={r.id} r={r} venue={venue} games={games} rentals={rentals} />) : <Empty>No requests right now.</Empty>}</Card>
            {splits.length ? <Card title="Splits to answer">{splits.map((r) => <SplitCard key={r.id} r={r} venue={venue} />)}</Card> : null}
            <Card title="In progress">{inProgress.length ? inProgress.map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} payments={payments} games={games} />) : <Empty>Nothing waiting on payment.</Empty>}</Card>
            <Card title="Booked">{booked.length ? booked.map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} payments={payments} games={games} />) : <Empty>No booked rentals coming up.</Empty>}</Card>
            <p className="text-sm font-semibold text-[#6B7280] px-2">To message a renter, use your page in the Jogo app.</p>
          </div>
        ) : null}

        {tab === 'rates' ? <Rates venue={venue} /> : null}
        {tab === 'settings' ? <DeleteIndoor venue={venue} /> : null}
        {tab === 'money' ? <Money venue={venue} payments={payments} rentals={allRentals} games={allGames} /> : null}

        <button type="button" onClick={() => signOut(auth)} className="lg:hidden mt-8 text-sm font-bold text-[#6B7280] inline-flex items-center gap-2"><LogOut size={15} /> Sign out of {user.email}</button>
      </main>
    </div>
  );
}

export default function IndoorPortal() {
  useMatchdayFonts();
  const [user, setUser] = useState(undefined); // undefined = checking
  const [venue, setVenue] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    setVenue(undefined);
    if (!user) return undefined;
    return onSnapshot(doc(db, 'venues', user.uid), (s) => setVenue(s.exists() ? { id: s.id, ...s.data() } : null), () => setVenue(null));
  }, [user?.uid]);

  if (user === undefined || (user && venue === undefined)) return <div className="min-h-screen bg-[#0B0D10]" />;
  if (!user) return <SignIn f={DISPLAY} />;
  if (!venue) {
    return (
      <div style={BODY} className="min-h-screen bg-[#0B0D10] flex items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <h1 style={DISPLAY} className="text-white text-4xl leading-[1.35]">NO INDOOR ON THIS ACCOUNT</h1>
          <p className="text-white/60 font-semibold mt-2">{user.email} doesn't have an indoor. Sign in with the account you applied with, or apply in the Jogo app.</p>
          <button type="button" onClick={() => signOut(auth)} className="mt-6 h-12 px-6 rounded-full bg-white text-[#0B0D10] font-extrabold">Sign out</button>
        </div>
      </div>
    );
  }
  return <Desk user={user} venue={venue} />;
}

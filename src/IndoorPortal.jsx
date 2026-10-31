// src/IndoorPortal.jsx — jogous.io/indoors/portal, an indoor owner's desk on the
// web. They sign in with the same account as the app and see more room than a
// phone gives: the schedule with who's coming, bookings, what they've earned,
// and the one thing that lives here: the slots they rent out and their rates.
// Answering requests and cancelling stay in the app, where the money rules live.
import React, { useEffect, useMemo, useState } from 'react';
import {
  signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut,
} from 'firebase/auth';
import {
  collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where, serverTimestamp, deleteField,
} from 'firebase/firestore';
import {
  CalendarDays, Key, Wallet, Clock, LayoutDashboard, LogOut, ChevronDown, Users,
} from 'lucide-react';
import jogoLogoWhite from './assets/jogo-logo-2026-white.png';
import { DISPLAY, BODY, useMatchdayFonts } from './App.jsx';
import { auth, db } from './firebase';
import RatesEditor, { dayProblem, clock } from './indoor/RatesEditor.jsx';

const money = (c) => `$${((c || 0) / 100).toFixed((c || 0) % 100 ? 2 : 0)}`;
const asDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
const dayLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const timeLabel = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '');
const range = (a, b) => `${timeLabel(a)} – ${timeLabel(b)}`;
const attending = (g) => (g.players || []).reduce((n, p) => n + 1 + (Number(p?.guests) || 0), 0);

const TABS = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'schedule', label: 'Schedule', Icon: CalendarDays },
  { id: 'bookings', label: 'Bookings', Icon: Key },
  { id: 'rates', label: 'Slots & rates', Icon: Clock },
  { id: 'money', label: 'Money', Icon: Wallet },
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

function GameRow({ game, fieldCount }) {
  const [open, setOpen] = useState(false);
  const st = asDate(game.startDateTime);
  const en = asDate(game.endDateTime);
  const n = attending(game);
  const max = game.maxPlayers || 0;
  const players = game.players || [];
  return (
    <div className="border-t first:border-t-0 border-[#EEF0F3]">
      <button type="button" onClick={() => setOpen(!open)} className="w-full py-3.5 flex items-center gap-4 text-left">
        <div className="w-32 sm:w-40 shrink-0">
          <div className="font-extrabold text-[#0B0D10]">{st ? dayLabel(st) : ''}</div>
          <div className="text-sm font-semibold text-[#6B7280]">{st && en ? range(st, en) : ''}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#0B0D10] truncate">{game.title}{fieldCount > 1 && game.venueField ? ` · Field ${game.venueField}` : ''}</div>
          <div className="h-1.5 rounded bg-[#EEF0F3] mt-1.5 overflow-hidden"><div className="h-full bg-[#4ADE80]" style={{ width: `${max ? Math.min(100, (n / max) * 100) : 0}%` }} /></div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-extrabold text-[#0B0D10]">{n}/{max}</div>
          <div className="text-sm font-semibold text-[#6B7280]">{game.priceCents ? money(game.priceCents) : 'Free'}</div>
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
                  <span className={game.arrivals?.[p.userId]?.status === 'arrived' ? 'text-[#0E7A43]' : 'text-[#9CA3AF]'}>{game.arrivals?.[p.userId]?.status === 'arrived' ? 'Checked in' : p.paid ? 'Paid' : ''}</span>
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

function BookingRow({ r, fieldCount }) {
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
    </div>
  );
}

function Rates({ venue }) {
  const [slots, setSlots] = useState(() => venue.rentalSlots || {});
  const [state, setState] = useState(null); // 'saving' | 'saved' | 'error'
  const dirty = JSON.stringify(slots) !== JSON.stringify(venue.rentalSlots || {});
  const problem = Object.values(slots).some((l) => dayProblem(l));
  const any = Object.values(slots).some((l) => l.length);
  const write = async (value) => {
    setState('saving');
    try {
      await updateDoc(doc(db, 'venues', venue.id), { rentalSlots: value, updatedAt: serverTimestamp() });
      setState('saved');
    } catch (e) {
      console.error('saving slots failed:', e);
      setState('error');
    }
  };
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-extrabold text-lg text-[#0B0D10]">Slots you rent out</h2>
        <p className="text-[#6B7280] font-semibold mt-1">
          Players can only ask to rent inside these slots, and they see your rate before they ask. {venue.rentalSlots ? 'Days with no slots can\'t be rented.' : 'Right now they can ask for any open hour, and you set the price when you approve.'}
        </p>
      </Card>
      <RatesEditor slots={slots} hours={venue.hours} onChange={(s) => { setSlots(s); setState(null); }} />
      <div className="sticky bottom-4 bg-[#0B0D10] rounded-2xl p-3 pl-5 flex items-center justify-between gap-3 shadow-xl">
        <span className="text-white font-semibold text-sm">
          {state === 'saved' && !dirty ? 'Saved. Players see this now.'
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

function Money({ venue, payments }) {
  const paid = payments.filter((p) => p.status === 'paid');
  const refunded = payments.filter((p) => p.status === 'refunded');
  const total = paid.reduce((n, p) => n + (p.shareCents || 0), 0);
  const list = [...payments].sort((a, b) => (asDate(b.createdAt) || 0) - (asDate(a.createdAt) || 0)).slice(0, 50);
  const LABEL = { rental: 'Field booking', renterShare: 'Renter\'s share', gameSpot: 'Player spot' };
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat f={DISPLAY} k="Earned" v={money(total)} sub="Your prices, paid in the app" />
        <Stat f={DISPLAY} k="Payments" v={paid.length} sub={`${refunded.length} refunded`} />
        <Stat f={DISPLAY} k="Payouts" v={venue.payouts?.ready ? 'ON' : 'OFF'} sub={venue.payouts?.ready ? 'Straight to your bank' : 'Set up in the app, on your wallet'} />
      </div>
      <Card title="Recent payments">
        {list.length ? list.map((p, i) => {
          const at = asDate(p.createdAt);
          return (
            <div key={p.sessionId || i} className="border-t first:border-t-0 border-[#EEF0F3] py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-[#0B0D10]">{LABEL[p.kind] || 'Payment'}</div>
                <div className="text-sm font-semibold text-[#6B7280]">{at ? `${dayLabel(at)}, ${timeLabel(at)}` : ''}</div>
              </div>
              <div className="text-right">
                <div className={`font-extrabold ${p.status === 'paid' ? 'text-[#0B0D10]' : 'text-[#9CA3AF] line-through'}`}>{money(p.shareCents)}</div>
                <div className="text-sm font-semibold text-[#6B7280]">{p.status === 'paid' ? 'Paid' : p.status === 'kept' ? 'Kept' : p.status === 'refunded' ? 'Refunded' : p.status}</div>
              </div>
            </div>
          );
        }) : <Empty>Payments show here once players start paying.</Empty>}
      </Card>
    </div>
  );
}

function Desk({ user, venue }) {
  const [tab, setTab] = useState('overview');
  const [games, setGames] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [followers, setFollowers] = useState(null);

  useEffect(() => onSnapshot(query(collection(db, 'games'), where('venueId', '==', venue.id)), (snap) => {
    const cutoff = Date.now() - 2 * 3600e3;
    setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((g) => g.status !== 'cancelled' && asDate(g.startDateTime)?.getTime() >= cutoff)
      .sort((a, b) => asDate(a.startDateTime) - asDate(b.startDateTime)));
  }, (e) => console.error('games failed:', e)), [venue.id]);
  useEffect(() => onSnapshot(query(collection(db, 'rentals'), where('venueId', '==', venue.id)), (snap) => {
    const now = Date.now();
    setRentals(snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => ['requested', 'approved', 'paid'].includes(r.status) && asDate(r.end)?.getTime() > now)
      .sort((a, b) => asDate(a.start) - asDate(b.start)));
  }, (e) => console.error('rentals failed:', e)), [venue.id]);
  useEffect(() => {
    getDocs(query(collection(db, 'gamePayments'), where('venueId', '==', venue.id)))
      .then((s) => setPayments(s.docs.map((d) => d.data()))).catch((e) => console.error('payments failed:', e));
    getDocs(collection(db, 'venues', venue.id, 'followers')).then((s) => setFollowers(s.size)).catch(() => {});
  }, [venue.id]);

  const requests = rentals.filter((r) => r.status === 'requested');
  const inProgress = rentals.filter((r) => r.status === 'approved');
  const booked = rentals.filter((r) => r.status === 'paid');
  const week = Date.now() + 7 * 864e5;
  const thisWeek = games.filter((g) => asDate(g.startDateTime)?.getTime() < week);
  const earned = useMemo(() => payments.filter((p) => p.status === 'paid').reduce((n, p) => n + (p.shareCents || 0), 0), [payments]);
  const spots = thisWeek.reduce((n, g) => n + attending(g), 0);
  const fieldCount = venue.fieldCount || 1;

  return (
    <div style={BODY} className="min-h-screen bg-[#F2F3F5] lg:flex">
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
              {id === 'bookings' && requests.length ? <span className="ml-auto bg-[#F59E0B] text-[#0B0D10] rounded-full text-xs font-extrabold px-2 py-0.5">{requests.length}</span> : null}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat f={DISPLAY} k="This week" v={thisWeek.length} sub={`game${thisWeek.length === 1 ? '' : 's'}`} />
              <Stat f={DISPLAY} k="Players" v={spots} sub="this week" />
              <Stat f={DISPLAY} k="Earned" v={money(earned)} sub="so far" />
              <Stat f={DISPLAY} k="Followers" v={followers ?? '–'} />
            </div>
            {requests.length ? (
              <Card title={`Requests to answer (${requests.length})`}>
                {requests.map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} />)}
                <p className="text-sm font-semibold text-[#6B7280] mt-3">Answer these on your page in the Jogo app.</p>
              </Card>
            ) : null}
            <Card title="Coming up" right={<button type="button" onClick={() => setTab('schedule')} className="text-sm font-bold text-[#0E7A43]">See all</button>}>
              {games.length ? games.slice(0, 5).map((g) => <GameRow key={g.id} game={g} fieldCount={fieldCount} />) : <Empty>No games posted. Create them in the Jogo app.</Empty>}
            </Card>
          </div>
        ) : null}

        {tab === 'schedule' ? (
          <Card title={`${games.length} upcoming game${games.length === 1 ? '' : 's'}`} right={<span className="text-sm font-semibold text-[#6B7280] inline-flex items-center gap-1.5"><Users size={15} /> Tap a game for the roster</span>}>
            {games.length ? games.map((g) => <GameRow key={g.id} game={g} fieldCount={fieldCount} />) : <Empty>No games posted. Create them in the Jogo app.</Empty>}
          </Card>
        ) : null}

        {tab === 'bookings' ? (
          <div className="space-y-4">
            <Card title="Requests">{requests.length ? requests.map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} />) : <Empty>No requests right now.</Empty>}</Card>
            <Card title="In progress">{inProgress.length ? inProgress.map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} />) : <Empty>Nothing waiting on payment.</Empty>}</Card>
            <Card title="Booked">{booked.length ? booked.map((r) => <BookingRow key={r.id} r={r} fieldCount={fieldCount} />) : <Empty>No booked rentals coming up.</Empty>}</Card>
            <p className="text-sm font-semibold text-[#6B7280] px-2">To approve, change a price or message a renter, use your page in the Jogo app.</p>
          </div>
        ) : null}

        {tab === 'rates' ? <Rates venue={venue} /> : null}
        {tab === 'money' ? <Money venue={venue} payments={payments} /> : null}

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

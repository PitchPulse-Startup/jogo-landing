// src/indoor/actions.js — what an indoor can do from the web. The same writes and
// the same notifications as the app (services/rentals.js, services/venues.js), so
// a booking answered here behaves exactly like one answered there.
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';

export const asDate = (t) => (t instanceof Date ? t : t?.toDate ? t.toDate() : t ? new Date(t) : null);
export const money = (c) => `$${((c || 0) / 100).toFixed((c || 0) % 100 ? 2 : 0)}`;

/** What a player is charged. Same as the app's services/gamePayments withFee. */
export const withFee = (cents) => {
  const need = cents + Math.round(cents * 0.05);
  let total = Math.ceil((need + 30) / 0.971);
  while (total - (Math.round(total * 0.029) + 30) < need) total += 1;
  return total;
};

const cancelPolicyOf = (v) => ({
  hours: [24, 48, 72].includes(Number(v?.cancelHours)) ? Number(v.cancelHours) : 48,
  keepPct: [25, 50, 100].includes(Number(v?.cancelKeepPct)) ? Number(v.cancelKeepPct) : 50,
});

const whenText = (start, end) => {
  const t = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '');
  return `${start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${t(start)} – ${t(end)}`;
};
export const deadlineText = (d) => d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(':00', '');

// In-app notification + push, like the app's NotificationService. Best effort.
const push = async (userId, title, body, data) => {
  await addDoc(collection(db, 'notifications'), { userId, type: 'field_update', title, body, data, read: false, timestamp: serverTimestamp() }).catch(() => {});
  await httpsCallable(functions, 'sendPushNotification')({ userId, type: 'field_update', title, body, notificationData: data }).catch(() => {});
};

const rental = (r) => doc(db, 'rentals', r.id);
const when = (r) => whenText(asDate(r.start), asDate(r.end));

export const approveRental = async (r, { priceCents, field, venue }) => {
  const policy = cancelPolicyOf(venue);
  await updateDoc(rental(r), {
    status: 'approved', priceCents, field: field || r.field || 1, ownerNote: '', approvedAt: serverTimestamp(),
    cancelHours: policy.hours, cancelKeepPct: policy.keepPct, updatedAt: serverTimestamp(),
  });
  push(r.userId, `${r.venueName} approved your booking`, `Field ${field || r.field || 1} · ${when(r)} · ${money(withFee(priceCents))} with the service fee. Pay in the app to book it, or it cancels 3 hours before.`, { screen: 'MyGames' });
};

export const declineRental = async (r) => {
  await updateDoc(rental(r), { status: 'declined', ownerNote: '', declinedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  push(r.userId, `${r.venueName} can't take that booking`, `${when(r)} isn't available. Try another time.`, { screen: 'VenuePage', params: { venueId: r.venueId } });
};

export const answerSplit = async (r, decideAt) => {
  const minPlayers = r.split.maxPlayers;
  await updateDoc(rental(r), { split: { ...r.split, status: 'approved', minPlayers, decideAt: Timestamp.fromDate(decideAt) }, updatedAt: serverTimestamp() });
  push(r.userId, `${r.venueName} said yes to your split`, `${money(withFee(r.split.shareCents))} each, as you asked. Pay your share to start your game. All ${minPlayers} spots need to fill by ${deadlineText(decideAt)}.`, { screen: 'MyGames' });
};

export const declineSplit = async (r) => {
  await updateDoc(rental(r), { split: { ...r.split, status: 'declined' }, updatedAt: serverTimestamp() });
  push(r.userId, `${r.venueName} said no to the split`, 'You can still make it a game, or message them about it.', { screen: 'MyGames' });
};

/**
 * The indoor can't host a booking. The server refunds everyone who paid and the
 * indoor covers the fees (functions onRentalCancelled, onPaidGameWritten); here the
 * booking and its game go, and everyone hears why. Same as the app's cancelRental.
 */
export const cancelBooking = async (r, reason) => {
  const why = String(reason || '').trim().slice(0, 200);
  await updateDoc(rental(r), { status: 'cancelled', cancelledAt: serverTimestamp(), cancelledBy: 'venue', cancelReason: why, updatedAt: serverTimestamp() });
  if (r.gameId) {
    const ref = doc(db, 'games', r.gameId);
    const snap = await getDoc(ref).catch(() => null);
    if (snap?.exists()) {
      const g = snap.data();
      const ids = [...new Set([...(g.players || []), ...(g.queue || [])].map((p) => p?.userId).filter((id) => id && id !== r.userId))];
      ids.forEach((id) => push(id, `${r.venueName} cancelled your game`, `${when(r)} is off. ${why} Anyone who paid gets a full refund.`, { gameId: r.gameId, screen: 'GameDetails', params: { game: { id: r.gameId } } }));
      await deleteDoc(ref).catch(() => updateDoc(ref, { status: 'cancelled', cancelledAt: serverTimestamp(), updatedAt: serverTimestamp() }));
      getDocs(query(collection(db, 'game-chats'), where('gameId', '==', r.gameId))).then((c) => c.docs.forEach((m) => deleteDoc(m.ref).catch(() => {}))).catch(() => {});
    }
  }
  push(r.userId, `${r.venueName} cancelled your booking`, `${when(r)}. ${why}`, { screen: 'MyGames' });
};

// ── Set rates ──
const slotAt = (venue, day, m) => (venue.rentalSlots?.[day] || []).find((s) => m >= s.from && m < s.to);

/** The price at its set rates, or null if any of it has no rate. */
export const rateFor = (venue, start, end) => {
  const from = start.getHours() * 60 + start.getMinutes();
  const to = from + Math.round((end - start) / 60000);
  let cents = 0;
  for (let m = from; m < to; m += 30) {
    const s = slotAt(venue, start.getDay(), m);
    if (!s) return null;
    cents += s.cents / 2;
  }
  return Math.round(cents);
};

/** No set rate touches this time, so it can become one. */
export const canSaveRate = (venue, start, end) => {
  const from = start.getHours() * 60 + start.getMinutes();
  const to = from + Math.round((end - start) / 60000);
  return !(venue.rentalSlots?.[start.getDay()] || []).some((s) => from < s.to && to > s.from);
};

/** Keep this time and price as a weekly rate. */
export const saveRate = (venue, start, end, priceCents) => {
  const from = start.getHours() * 60 + start.getMinutes();
  const minutes = Math.round((end - start) / 60000);
  const day = start.getDay();
  const cents = Math.round((priceCents * 60) / minutes);
  return updateDoc(doc(db, 'venues', venue.id), {
    [`rentalSlots.${day}`]: [...(venue.rentalSlots?.[day] || []), { from, to: from + minutes, cents }],
    updatedAt: serverTimestamp(),
  });
};

// ── Creating games ── the same game the app's postVenueSlots writes.
/** slots: [{ start: Date, end: Date, field }]. title blank = the venue's name. */
export const createGames = async (venue, { slots, priceCents, maxPlayers, title }) => {
  const gameTitle = String(title || '').trim().slice(0, 60) || venue.name;
  const fieldCount = Math.max(1, Number(venue.fieldCount) || 1);
  const field = {
    name: venue.name,
    address: venue.address || null,
    latitude: venue.location?.latitude ?? null,
    longitude: venue.location?.longitude ?? null,
    surface: 'indoor',
    imageUrl: venue.bannerUrl || null,
  };
  const noGear = { needed: false, claimedBy: null, claimedByName: null, claimedByPhotoURL: null };
  const batch = writeBatch(db);
  const made = slots.map(({ start, end, field: fl }) => {
    const ref = doc(collection(db, 'games'));
    batch.set(ref, {
      title: gameTitle,
      description: '',
      fieldId: `venue_${venue.id}`,
      field,
      venueId: venue.id,
      venueName: venue.name,
      venueLogoUrl: venue.logoUrl || null,
      venueField: fl || 1,
      venueFieldCount: fieldCount,
      startDateTime: Timestamp.fromDate(start),
      endDateTime: Timestamp.fromDate(end),
      maxPlayers,
      priceCents,
      ...(priceCents > 0 ? { refundUntil: Timestamp.fromDate(new Date(start.getTime() - cancelPolicyOf(venue).hours * 3600e3)) } : {}),
      gameType: 'pickup',
      skillLevel: 'all',
      genderPreference: 'coed',
      squadId: null,
      squadName: null,
      isPrivate: false,
      qrCheckInEnabled: true,
      miniTournament: null,
      status: 'open',
      isLive: false,
      equipment: { soccerBall: noGear, pennies: noGear, nets: noGear },
      createdBy: venue.id,
      creatorDisplayName: venue.name,
      players: [],
      playerIds: [],
      queue: [],
      queueIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id, start, end };
  });
  await batch.commit();
  // Followers hear about it, once per batch, like the app.
  const next = [...made].sort((a, b) => a.start - b.start)[0];
  addDoc(collection(db, 'feedPosts'), {
    authorId: venue.id,
    author: { id: venue.id, displayName: venue.name, username: venue.name, photoURL: venue.logoUrl || null },
    venueId: venue.id,
    venueName: venue.name,
    venueLogoUrl: venue.logoUrl || null,
    content: made.length > 1 ? `${made.length} new games are up. Come play.` : '',
    visibility: 'followers',
    postType: 'game',
    gameData: {
      id: next.id, title: gameTitle, gameType: 'pickup', field,
      startDateTime: Timestamp.fromDate(next.start), endDateTime: Timestamp.fromDate(next.end),
      maxPlayers, currentPlayers: 0, createdBy: venue.id, venueId: venue.id, venueName: venue.name, venueLogoUrl: venue.logoUrl || null, priceCents,
    },
    createdAt: serverTimestamp(), likesCount: 0, commentsCount: 0, likes: [],
  }).catch((e) => console.error('feed post failed:', e));
  getDocs(query(collection(db, 'venues', venue.id, 'followers'), where('notify', '==', true))).then((snap) => {
    snap.docs.map((d) => d.id).filter((id) => id !== venue.id).forEach((id) => push(id, `${venue.name} posted ${made.length} new game${made.length === 1 ? '' : 's'}`, `Next one: ${deadlineText(next.start)}. Tap to grab a spot.`, { venueId: venue.id, screen: 'VenuePage', params: { venueId: venue.id } }));
  }).catch(() => {});
  return made.length;
};

/** Stripe's payouts sign-up, coming back to this page. */
export const openPayouts = async () => {
  const { data } = await httpsCallable(functions, 'startTicketCheckout')({ action: 'venuePayouts', returnUrl: window.location.href });
  if (data?.url) window.location.href = data.url;
  return data;
};

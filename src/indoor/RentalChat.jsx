// src/indoor/RentalChat.jsx — message a renter from the portal, as the indoor
// (the app's components/venue/RentalChat.js with asVenue). Same messages
// subcollection, so the renter sees it in the app and gets a push.
import React, { useEffect, useRef, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { X, Send } from 'lucide-react';
import { db } from '../firebase';
import { markRentalRead, sendRentalMessage } from './actions';

const timeOf = (t) => {
  const d = t?.toDate ? t.toDate() : null;
  return d ? d.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : 'Sending…';
};

export default function RentalChat({ rental: r, uid, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState(null);
  const end = useRef(null);
  const open = ['requested', 'approved', 'paid'].includes(r.status);

  useEffect(() => {
    markRentalRead(r);
    return onSnapshot(query(collection(db, 'rentals', r.id, 'messages'), orderBy('createdAt', 'asc'), limit(200)), (snap) => {
      setMsgs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      markRentalRead(r);
    }, () => setMsgs([]));
  }, [r.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText(''); setErr(null);
    try { await sendRentalMessage(r, uid, t); } catch (ex) { console.error('message failed:', ex); setText(t); setErr('Couldn’t send. Try again.'); }
  };
  const first = (r.userName || 'them').split(' ')[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6" onClick={onClose} role="dialog" aria-label={`Messages with ${r.userName || 'the renter'}`}>
      <div className="w-full sm:max-w-md h-[85vh] sm:h-[640px] bg-[#F2F3F5] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white px-5 py-4 flex items-center gap-3 border-b border-[#E6E8EC]">
          <div className="w-10 h-10 rounded-full bg-[#0B0D10] text-white flex items-center justify-center font-extrabold overflow-hidden shrink-0">
            {r.userPhotoURL ? <img src={r.userPhotoURL} alt="" className="w-full h-full object-cover" /> : (r.userName || '?')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-[#0B0D10] truncate">{r.userName || 'Renter'}</div>
            <div className="text-sm font-semibold text-[#6B7280]">Booking · {r.status === 'paid' ? 'paid' : r.status === 'approved' ? 'approved' : r.status === 'requested' ? 'waiting on you' : r.status}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full bg-[#F2F3F5] inline-flex items-center justify-center"><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {!msgs.length ? <p className="text-center text-sm font-semibold text-[#9AA0AB] mt-10">Send {first} a message about this booking.</p> : null}
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.fromVenue ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${m.fromVenue ? 'bg-[#0E7A43] text-white rounded-br-md' : 'bg-white text-[#0B0D10] rounded-bl-md'}`}>
                <p className="font-semibold whitespace-pre-wrap [overflow-wrap:anywhere]">{m.text}</p>
                <p className={`text-[11px] font-bold mt-0.5 ${m.fromVenue ? 'text-white/60' : 'text-[#9AA0AB]'}`}>{timeOf(m.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={end} />
        </div>
        {open ? (
          <form onSubmit={send} className="bg-white p-3 flex items-center gap-2 border-t border-[#E6E8EC]">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder={`Message ${first}…`} className="flex-1 h-11 rounded-full bg-[#F2F3F5] px-4 font-semibold outline-none focus:ring-2 focus:ring-[#0E7A43]" />
            <button type="submit" disabled={!text.trim()} aria-label="Send" className="w-11 h-11 rounded-full bg-[#0E7A43] text-white flex items-center justify-center disabled:opacity-40"><Send size={17} /></button>
          </form>
        ) : <p className="bg-white p-4 text-center text-sm font-semibold text-[#9AA0AB]">This booking is over, so the chat is closed.</p>}
        {err ? <p className="bg-white px-4 pb-3 text-sm font-bold text-[#BE123C]">{err}</p> : null}
      </div>
    </div>
  );
}

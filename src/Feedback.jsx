// src/Feedback.jsx — jogous.io/feedback. One mood tap, one box, an optional
// email. Saves to `feedback`, which Jogo-admin reads at /admin/feedback:
// feeling = 'happy' | 'neutral' | 'sad' (its mood counts + filter),
// suggestions = the message (its main text). Anyone can send, no sign-in.
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, LoaderCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { DISPLAY, useMatchdayFonts } from './App.jsx';
import jogoLogo from './assets/jogo-logo-2026.png';

const MOODS = [
  { id: 'happy', face: '😀', label: 'Love it' },
  { id: 'neutral', face: '😐', label: "It's okay" },
  { id: 'sad', face: '😕', label: 'Not great' },
];

export default function Feedback({ onBackToMain }) {
  useMatchdayFonts();
  const [feeling, setFeeling] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const canSend = !!message.trim() || !!feeling;
  const send = async (e) => {
    e.preventDefault();
    if (!canSend || busy) return;
    setBusy(true);
    setError('');
    try {
      await addDoc(collection(db, 'feedback'), {
        feeling: feeling || null,
        suggestions: message.trim(),
        email: email.trim(),
        source: 'web',
        submittedAt: serverTimestamp(),
      });
      setSent(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError("Couldn't send it. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#0B0D10]">
      <header className="max-w-xl mx-auto px-4 sm:px-6 pt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToMain}
          className="w-10 h-10 rounded-full bg-white border border-[#E6E8EC] inline-flex items-center justify-center hover:bg-[#F2F3F5]"
          aria-label="Back to Jogo"
        >
          <ArrowLeft size={18} />
        </button>
        <img src={jogoLogo} alt="Jogo" className="h-6 w-auto" />
        <span className="w-10" />
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {sent ? (
          <div className="bg-white rounded-3xl border border-[#E6E8EC] px-6 py-12 text-center">
            <span className="w-14 h-14 rounded-full bg-[#0E7A43] text-white inline-flex items-center justify-center"><Check size={28} /></span>
            <h1 style={DISPLAY} className="text-3xl sm:text-4xl leading-[1.3] mt-4">THANK YOU</h1>
            <p className="text-[#5B6270] font-semibold mt-1">The team reads every message. It helps us make Jogo better.</p>
            <button type="button" onClick={onBackToMain} className="mt-6 h-11 px-6 rounded-full bg-[#0B0D10] text-white font-extrabold">Back to Jogo</button>
          </div>
        ) : (
          <>
            <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-[#0E7A43]">Feedback</p>
            <h1 style={DISPLAY} className="text-4xl sm:text-5xl leading-[1.3] mt-1">TELL US WHAT YOU THINK</h1>
            <p className="text-[#5B6270] font-semibold mt-1">Ideas, bugs, things you love. It goes straight to the team.</p>

            <form onSubmit={send} className="mt-8 bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
              <p className="text-xs font-extrabold tracking-[0.14em] uppercase text-[#8A909B] mb-2">How's Jogo so far?</p>
              <div className="grid grid-cols-3 gap-2">
                {MOODS.map((m) => {
                  const on = feeling === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFeeling(on ? '' : m.id)}
                      aria-pressed={on}
                      className={`rounded-2xl py-3 flex flex-col items-center gap-1 border transition-colors ${on ? 'bg-[#0B0D10] border-[#0B0D10] text-white' : 'bg-[#F2F3F5] border-transparent hover:border-[#D5D9DF]'}`}
                    >
                      <span className="text-2xl leading-none">{m.face}</span>
                      <span className="text-sm font-extrabold">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <label htmlFor="fb-message" className="block text-xs font-extrabold tracking-[0.14em] uppercase text-[#8A909B] mt-6 mb-2">What's on your mind?</label>
              <textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                rows={5}
                placeholder="What should we add, fix or keep doing?"
                className="w-full rounded-2xl bg-[#F2F3F5] px-4 py-3 text-[15px] font-semibold placeholder-[#A3A9B3] outline-none focus:ring-2 focus:ring-[#0E7A43] resize-y"
              />

              <label htmlFor="fb-email" className="block text-xs font-extrabold tracking-[0.14em] uppercase text-[#8A909B] mt-5 mb-2">Email <span className="normal-case tracking-normal font-semibold">(optional, if you'd like a reply)</span></label>
              <input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full h-12 rounded-2xl bg-[#F2F3F5] px-4 text-[15px] font-semibold placeholder-[#A3A9B3] outline-none focus:ring-2 focus:ring-[#0E7A43]"
              />

              {error ? <p className="text-sm font-semibold text-[#BE123C] mt-4">{error}</p> : null}

              <button
                type="submit"
                disabled={!canSend || busy}
                className="mt-6 w-full h-12 rounded-full bg-[#0B0D10] text-white font-extrabold inline-flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {busy ? <LoaderCircle size={20} className="animate-spin" /> : 'Send feedback'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

// src/indoor/NotLive.jsx — what jogous.io/indoors/portal shows an indoor that
// Jogo hasn't approved yet (status 'pending' or 'denied'). The desk itself
// (schedule, bookings, payouts) opens only once approved.
//
// Their own banner + crest up top so it feels like theirs, then where the
// review stands as three steps (Sent → Jogo reviews → You're live). A denial
// puts the reason and "Fix and send again" (→ /indoors/apply, which comes back
// filled in) right in step 2. Desktop shows the page in a phone on the right;
// phones get "See your page", full screen.
import React, { useCallback, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Check, X, ArrowRight, Eye, Building2, LogOut } from 'lucide-react';
import jogoLogoWhite from '../assets/jogo-logo-2026-white.png';
import { DISPLAY, BODY, StoreRow } from '../App.jsx';
import { auth } from '../firebase';
import VenuePreview, { FullPreview, previewFromVenue } from './VenuePreview.jsx';

const asDate = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null);
const day = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

function Step({ n, state, title, sub, last, children }) {
  // state: done | now | fix | later
  const dot = {
    done: <span className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center"><Check size={18} strokeWidth={3} /></span>,
    now: (
      <span className="relative w-9 h-9 rounded-full bg-[#FEF3C7] flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-[#F59E0B]/30 animate-ping" />
        <span className="relative w-3 h-3 rounded-full bg-[#F59E0B]" />
      </span>
    ),
    fix: <span className="w-9 h-9 rounded-full bg-[#BE123C] text-white flex items-center justify-center"><X size={18} strokeWidth={3} /></span>,
    later: <span style={DISPLAY} className="w-9 h-9 rounded-full border-2 border-[#E6E8EC] text-[#9AA0AB] flex items-center justify-center text-base leading-none">{n}</span>,
  }[state];
  return (
    <li className="relative flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        {dot}
        {!last ? <span className={`w-0.5 flex-1 my-1.5 rounded-full ${state === 'done' ? 'bg-[#16A34A]' : 'bg-[#E6E8EC]'}`} /> : null}
      </div>
      <div className={`min-w-0 flex-1 ${last ? '' : 'pb-6'}`}>
        <div className={`font-extrabold text-[17px] leading-9 ${state === 'later' ? 'text-[#9AA0AB]' : state === 'fix' ? 'text-[#BE123C]' : 'text-[#0B0D10]'}`}>{title}</div>
        {sub ? <div className={`-mt-1 font-semibold ${state === 'later' ? 'text-[#9AA0AB]' : 'text-[#5B6270]'}`}>{sub}</div> : null}
        {children}
      </div>
    </li>
  );
}

export default function NotLive({ user, venue }) {
  const denied = venue.status === 'denied';
  const [preview, setPreview] = useState(false);
  const closePreview = useCallback(() => setPreview(false), []);
  const applied = asDate(venue.appliedAt);
  const page = previewFromVenue(venue);

  return (
    <div style={BODY} className="min-h-screen bg-[#0B0D10] text-white antialiased">
      <header className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <img src={jogoLogoWhite} alt="Jogo" className="h-[20px] w-auto" />
        <button type="button" onClick={() => signOut(auth)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-bold text-white/60 hover:text-white hover:bg-white/10">
          <LogOut size={15} /> Sign out
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-2 pb-14 lg:pt-8 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 lg:gap-20 items-start">
        <div className="min-w-0 max-w-[600px] w-full mx-auto lg:mx-0">
          {/* Desktop: the phone on the right carries the banner, so just who they are */}
          <div className="hidden lg:flex items-center gap-3.5">
            <div className="w-14 h-14 shrink-0 rounded-[16px] overflow-hidden bg-[#0E7A43] border-[3px] border-white flex items-center justify-center">
              {venue.logoUrl ? <img src={venue.logoUrl} alt="" className="w-full h-full object-cover" /> : <Building2 size={22} />}
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-lg truncate">{venue.name}</div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.16em] uppercase ${denied ? 'text-[#FB7185]' : 'text-[#FCD34D]'}`}>
                {denied ? <X size={12} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />}
                {denied ? 'Needs a fix' : 'In review'}
              </span>
            </div>
          </div>

          {/* Phones: their indoor, the way it'll look */}
          <div className="lg:hidden relative rounded-[28px] overflow-hidden bg-[#16191F] aspect-[4/3] sm:aspect-[16/9] ring-1 ring-white/10">
            {venue.bannerUrl ? <img src={venue.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" /> : null}
            <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(11,13,16,0.35) 0%, rgba(11,13,16,0) 30%, rgba(11,13,16,0.6) 70%, #0B0D10 100%)' }} />
            <span className={`absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-[0.16em] uppercase backdrop-blur-md ${denied ? 'bg-[#BE123C]/85 text-white' : 'bg-black/55 text-[#FCD34D] ring-1 ring-[#F59E0B]/40'}`}>
              {denied ? <X size={13} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />}
              {denied ? 'Needs a fix' : 'In review'}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-5 flex items-center gap-3.5">
              <div className="w-16 h-16 shrink-0 rounded-[18px] overflow-hidden bg-[#0E7A43] border-[3px] border-white flex items-center justify-center">
                {venue.logoUrl ? <img src={venue.logoUrl} alt="" className="w-full h-full object-cover" /> : <Building2 size={24} />}
              </div>
              <div className="min-w-0">
                <div style={DISPLAY} className="uppercase text-[1.9rem] sm:text-4xl leading-[1.25] line-clamp-2 [overflow-wrap:anywhere]">{venue.name}</div>
                <div className="font-bold text-white/70 truncate">{['Indoor', venue.city].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
          </div>

          <h1 style={DISPLAY} className="uppercase text-[2.9rem] sm:text-6xl lg:text-7xl leading-[1.15] mt-9 lg:mt-8">
            {denied ? <>One thing<br /><span className="text-[#FB7185]">to fix.</span></> : <>Almost<br /><span className="text-[#4ADE80]">live.</span></>}
          </h1>
          <p className="mt-3 text-lg font-semibold text-white/65 max-w-md">
            {denied
              ? 'Your page didn’t pass review yet. Fix what’s below and send it again. It goes straight back to the front of the line.'
              : 'We look at every indoor by hand, usually within a day. This page turns into your portal the moment you’re approved.'}
          </p>

          {/* Where it stands */}
          <ol className="mt-7 bg-white text-[#0B0D10] rounded-3xl p-5 sm:p-7">
            <Step n={1} state="done" title="Page sent" sub={applied ? day(applied) : null} />
            {denied ? (
              <Step n={2} state="fix" title="Needs a fix">
                <div className="mt-2.5 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] p-4">
                  <div className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#BE123C]">From the Jogo team</div>
                  <p className="mt-1 font-semibold text-[#0B0D10] whitespace-pre-wrap [overflow-wrap:anywhere]">{venue.denyReason || 'Check your photos, name and address, then send it again.'}</p>
                </div>
                <a href="/indoors/apply" className="mt-3.5 w-full h-12 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold inline-flex items-center justify-center gap-2 transition-colors">
                  Fix and send again <ArrowRight size={18} />
                </a>
              </Step>
            ) : (
              <Step n={2} state="now" title="Jogo reviews your page" sub="Usually within a day" />
            )}
            <Step n={3} state="later" last title="You’re live" sub="Create games, take bookings and get paid, right here." />
          </ol>

          <button
            type="button"
            onClick={() => setPreview(true)}
            className="lg:hidden mt-4 w-full h-12 rounded-full border border-white/20 text-white font-extrabold inline-flex items-center justify-center gap-2 hover:bg-white/10"
          >
            <Eye size={18} /> See your page
          </button>

          <div className="mt-10 border-t border-white/10 pt-7">
            <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-white/45">While you wait, get the app</div>
            <p className="mt-1.5 mb-4 font-semibold text-white/65">Sign in as {user.email}. It tells you the moment you’re approved.</p>
            <StoreRow invert />
          </div>
        </div>

        {/* Desktop: the page itself */}
        <aside className="hidden lg:block sticky top-8">
          <div className="text-center mb-4 text-xs font-extrabold tracking-[0.18em] uppercase text-white/45">Your page, once you’re live</div>
          <div style={{ height: 702 }}>
            <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
              <VenuePreview venue={page} ring={false} height={760} />
            </div>
          </div>
        </aside>
      </div>

      {preview ? <FullPreview venue={page} onClose={closePreview} label="Your page, once you’re live" /> : null}
    </div>
  );
}

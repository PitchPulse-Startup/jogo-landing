// src/indoor/VenuePreview.jsx — the indoor's page as players will see it in
// the app once approved, drawn live from the web application form
// (src/IndoorApply.jsx). Mirrors jogo-APP screens/venue/VenuePageScreen.js
// (player view, no games yet): 400pt hero fading into ink, VERIFIED ON JOGO,
// logo crest + Anton name, Follow + bell, then JOIN A GAME, Rent a field and
// ABOUT (bio, socials, hours, map, Directions). Change the page there, change
// it here.
//
// `focus` ('hero' | 'about' | 'hours' | 'map') scrolls that part into view and
// rings it, so the owner sees where what they're typing lands.
import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft, CheckCircle2, Plus, Bell, CalendarDays, Key, ChevronRight, ChevronDown, ChevronUp,
  Clock, Navigation, Instagram, Globe, Building2, ImagePlus,
} from 'lucide-react';
import { DISPLAY } from '../App.jsx';
import { hoursLines, openStatus } from './applyKit';

const INK = '#0B0D10';
const MUTED = '#5B6270';
const FAINT = '#9AA0AB';
const SOFT = '#F2F3F5';
const EDGE = '#E6E8EC';
const KIT = '#0E7A43';
const MINT = '#4ADE80';
const HERO_H = 400;

// TikTok isn't in lucide; a small mark in the same weight.
const TikTok = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.6 2.4 4.5 5 5" />
  </svg>
);

const Ring = ({ on, children, className = '', radius = 22 }) => (
  <div className={`relative ${className}`}>
    {children}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 transition-opacity duration-300"
      style={{ opacity: on ? 1 : 0, borderRadius: radius, boxShadow: `inset 0 0 0 3px ${MINT}, inset 0 0 0 7px rgba(74,222,128,0.25)`, zIndex: 5 }}
    />
  </div>
);

export default function VenuePreview({ venue, focus, height = 760, ring = true }) {
  const scroller = useRef(null);
  const parts = { hero: useRef(null), about: useRef(null), hours: useRef(null), map: useRef(null) };
  const [page, setPage] = useState(0);
  const [hoursOpen, setHoursOpen] = useState(false);

  const gallery = [venue.bannerSrc, ...(venue.photoSrcs || [])].filter(Boolean);
  const current = gallery[Math.min(page, gallery.length - 1)] || null;
  useEffect(() => { if (page >= gallery.length) setPage(0); }, [gallery.length, page]);

  // A new photo shows itself right away.
  const lastCount = useRef(gallery.length);
  useEffect(() => {
    if (gallery.length > lastCount.current) setPage(gallery.length - 1);
    lastCount.current = gallery.length;
  }, [gallery.length]);

  useEffect(() => {
    if (focus === 'hours') setHoursOpen(true);
    const el = parts[focus]?.current;
    const box = scroller.current;
    if (!el || !box) return;
    const top = focus === 'hero' ? 0 : el.offsetTop - 90;
    box.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const name = venue.name?.trim();
  const status = openStatus(venue.hours);
  const lines = hoursLines(venue.hours);
  const socials = [
    venue.instagram && { label: 'Instagram', I: Instagram },
    venue.tiktok && { label: 'TikTok', I: TikTok },
    venue.website && { label: 'Website', I: Globe },
  ].filter(Boolean);
  const loc = venue.location;

  return (
    <div className="relative mx-auto" style={{ width: 380 }}>
      {/* The phone */}
      <div className="rounded-[56px] bg-[#0B0D10] p-[10px] shadow-[0_40px_80px_-30px_rgba(11,13,16,0.55)] ring-1 ring-white/15">
        <div className="relative overflow-hidden rounded-[46px]" style={{ height, background: SOFT }}>
          {/* Status bar + island, over everything */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[50px] flex items-center justify-between px-8 text-white text-[14px]" style={{ fontWeight: 700 }}>
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <span className="flex items-end gap-[2px]">{[5, 7, 9, 11].map((h) => <span key={h} className="w-[3px] rounded-sm bg-white" style={{ height: h }} />)}</span>
              <span className="ml-1 w-[22px] h-[11px] rounded-[3px] border border-white/80 p-[1.5px]"><span className="block h-full w-[70%] rounded-[1px] bg-white" /></span>
            </span>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-[11px] z-30 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-black" />
          {/* Back, glass, like the app */}
          <div className="pointer-events-none absolute left-4 top-[58px] z-20 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(11,13,16,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </div>

          <div ref={scroller} className="vp-scroll h-full overflow-y-auto overflow-x-hidden" style={{ fontFamily: "'Barlow', system-ui, sans-serif" }}>
            {/* ── Hero ── */}
            <div ref={parts.hero}>
              <Ring on={ring && focus === 'hero'} radius={0}>
                <div
                  className="relative flex flex-col justify-end"
                  style={{ height: HERO_H + 50, background: INK, cursor: gallery.length > 1 ? 'pointer' : 'default' }}
                  onClick={() => gallery.length > 1 && setPage((page + 1) % gallery.length)}
                  title={gallery.length > 1 ? 'Next photo' : undefined}
                >
                  {current ? (
                    <img src={current} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/35" style={{ paddingBottom: 150 }}>
                      <ImagePlus size={30} />
                      <span className="text-[13px] tracking-[0.14em] uppercase" style={{ fontWeight: 800 }}>Your banner photo</span>
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to bottom, rgba(11,13,16,0.45) 0%, rgba(11,13,16,0) 28%, rgba(11,13,16,0.55) 68%, ${INK} 100%)` }}
                  />
                  <div className="relative px-5 pb-[18px]">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-[5px] rounded-full px-2.5 py-[5px]" style={{ background: 'rgba(11,13,16,0.55)', border: '1px solid rgba(74,222,128,0.35)' }}>
                        <CheckCircle2 size={14} color={MINT} />
                        <span className="text-white text-[10.5px] tracking-[0.12em]" style={{ fontWeight: 800 }}>VERIFIED ON JOGO</span>
                      </span>
                      {gallery.length > 1 ? (
                        <span className="rounded-full px-2.5 py-[5px] text-white text-[10.5px] tracking-[0.12em]" style={{ background: 'rgba(11,13,16,0.55)', fontWeight: 800 }}>
                          {Math.min(page, gallery.length - 1) + 1} / {gallery.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3.5">
                      <div className="shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 72, height: 72, borderRadius: 20, background: KIT, border: '3px solid #FFFFFF' }}>
                        {venue.logoSrc ? <img src={venue.logoSrc} alt="" className="h-full w-full object-cover" /> : <Building2 size={26} color="#FFFFFF" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          style={{ ...DISPLAY, fontSize: 34, lineHeight: '43px', color: name ? '#FFFFFF' : 'rgba(255,255,255,0.35)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}
                        >
                          {(name || 'Your indoor').toUpperCase()}
                        </div>
                        <div className="truncate" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14.5, fontWeight: 700, marginTop: -2 }}>
                          {['Indoor', venue.city].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Ring>
            </div>

            {/* ── The one action, on ink ── */}
            <div style={{ background: INK, padding: '4px 16px 44px' }}>
              <div className="flex gap-2.5">
                <div className="flex-1 mt-3.5 h-[50px] rounded-full bg-white flex items-center justify-center gap-1.5" style={{ color: INK, fontSize: 15.5, fontWeight: 800 }}>
                  <Plus size={18} strokeWidth={2.6} /> Follow
                </div>
                <div className="mt-3.5 w-[50px] h-[50px] rounded-full flex items-center justify-center" style={{ border: '1.5px solid rgba(255,255,255,0.35)' }}>
                  <Bell size={20} color="#FFFFFF" />
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ background: SOFT, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, padding: '6px 16px 40px' }}>
              <div style={{ ...DISPLAY, color: INK, fontSize: 24, lineHeight: '32px', margin: '24px 0 12px 4px' }}>JOIN A GAME</div>
              <div className="bg-white rounded-[20px] p-6 flex flex-col items-center text-center gap-1" style={{ border: `1px solid ${EDGE}` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1.5" style={{ background: '#E4F5EA' }}><CalendarDays size={22} color={KIT} /></div>
                <div style={{ color: INK, fontSize: 16, fontWeight: 800 }}>New times drop soon</div>
                <div style={{ color: MUTED, fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>Follow to hear the moment they post.</div>
              </div>

              <div className="mt-3.5 bg-white rounded-[20px] p-3.5 flex items-center gap-3" style={{ border: `1px solid ${EDGE}` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: INK }}><Key size={19} color="#FFFFFF" /></div>
                <div className="flex-1">
                  <div style={{ color: INK, fontSize: 15.5, fontWeight: 800 }}>Rent a field</div>
                  <div style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>
                    {venue.fieldCount > 1 ? `${venue.fieldCount} fields · book one for your group` : 'Book a whole field for your group'}
                  </div>
                </div>
                <ChevronRight size={18} color={FAINT} />
              </div>

              <div style={{ ...DISPLAY, color: INK, fontSize: 24, lineHeight: '32px', margin: '24px 0 12px 4px' }}>ABOUT</div>
              <div className="bg-white rounded-[22px] overflow-hidden" style={{ border: `1px solid ${EDGE}` }}>
                <div ref={parts.about}>
                  <Ring on={ring && focus === 'about'} radius={0}>
                    <div className="p-[18px]">
                      {venue.bio?.trim() ? (
                        <p className="whitespace-pre-wrap" style={{ color: INK, fontSize: 16, lineHeight: '25px', fontWeight: 500, overflowWrap: 'anywhere' }}>{venue.bio.trim()}</p>
                      ) : (
                        <p style={{ color: FAINT, fontSize: 16, lineHeight: '25px', fontWeight: 500 }}>Turf, field sizes, parking, what to bring…</p>
                      )}
                      {socials.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {socials.map(({ label, I }) => (
                            <span key={label} className="inline-flex items-center gap-1.5 rounded-full px-[13px] py-2" style={{ background: SOFT, color: INK, fontSize: 13.5, fontWeight: 800 }}>
                              <I size={15} /> {label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Ring>
                </div>

                <div ref={parts.hours} style={{ borderTop: `1px solid ${EDGE}` }}>
                  <Ring on={ring && focus === 'hours'} radius={0}>
                    <button type="button" onClick={() => setHoursOpen(!hoursOpen)} className="w-full flex items-center gap-2.5 px-[18px] py-3.5 text-left">
                      <Clock size={18} color={status?.open ? KIT : status ? MUTED : FAINT} />
                      <span className="flex-1 truncate" style={{ color: status ? (status.open ? KIT : INK) : FAINT, fontSize: 15, fontWeight: 800 }}>
                        {status ? status.text : 'Your open hours'}
                      </span>
                      {lines.length ? (hoursOpen ? <ChevronUp size={17} color={FAINT} /> : <ChevronDown size={17} color={FAINT} />) : null}
                    </button>
                    {hoursOpen && lines.length ? (
                      <div className="px-[18px] pb-3.5 space-y-1.5">
                        {lines.map((l) => (
                          <div key={l.days} className="flex justify-between gap-3" style={{ color: INK, fontSize: 14, fontWeight: l.today ? 800 : 600 }}>
                            <span>{l.days}</span><span>{l.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Ring>
                </div>

                <div ref={parts.map}>
                  <Ring on={ring && focus === 'map'} radius={0}>
                    {loc ? (
                      <div className="relative" style={{ height: 170 }}>
                        <iframe
                          title="Map"
                          src={`https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=15&output=embed`}
                          className="absolute inset-0 h-full w-full pointer-events-none"
                          style={{ border: 0 }}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center" style={{ height: 120, background: '#EEF1F4', color: FAINT, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em' }}>
                        YOUR MAP PIN
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex-1 min-w-0" style={{ color: venue.address ? MUTED : FAINT, fontSize: 13.5, lineHeight: '19px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {venue.address || 'Your address'}
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-white" style={{ background: INK, fontSize: 13.5, fontWeight: 800 }}>
                        <Navigation size={15} fill="#FFFFFF" /> Directions
                      </span>
                    </div>
                  </Ring>
                </div>
              </div>
            </div>
          </div>
          {/* Home indicator */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-[5px] w-[130px] -translate-x-1/2 rounded-full bg-black/80" />
        </div>
      </div>
      <style>{'.vp-scroll { scrollbar-width: none; } .vp-scroll::-webkit-scrollbar { display: none; }'}</style>
    </div>
  );
}

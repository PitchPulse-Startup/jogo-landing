// src/Crew.jsx — landing page for shared crew links (jogous.io/crew/:squadId)
//
// Same job as Invite.jsx, aimed at a crew instead of a single game: whoever
// taps a crew invite link lands here first, sees just enough to be worth
// downloading the app for, then "Download on the App Store" is the loud,
// obvious thing to do. Continuing on the web is still there, just small.

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from './firebase';
import { Users, MapPin, Lock } from 'lucide-react';
import appIcon from './assets/jogo-app-icon.png';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/jogo-pickup-soccer-near-you/id6760919244';
const WEB_APP_URL = 'https://www.jogous.io/app';

function AppleLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function Crew() {
  const { squadId } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [loading, setLoading] = useState(true);
  const [crew, setCrew] = useState(null);
  // A private crew's doc read is refused by Firestore rules (by design —
  // only public crews are readable without being a signed-in member). That
  // refusal is itself informative: it means the link is for a real, private
  // crew, not simply a wrong/deleted id, so the fallback card can say so.
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);

    if (!squadId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'squads', squadId));
        if (cancelled) return;
        setCrew(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (e) {
        if (!cancelled) {
          if (e.code === 'permission-denied') {
            setIsPrivate(true);
          } else {
            console.error('Error loading invited crew:', e);
          }
          setCrew(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [squadId]);

  const memberCount = crew?.memberCount || crew?.members?.length || null;
  const coverImage = crew?.bannerUrl || crew?.imageUrl || null;

  return (
    <div className="min-h-screen bg-[#EDEEF1] text-[#111111] font-sans antialiased flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes invite-drift {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(30px,-24px) scale(1.12); }
          66%  { transform: translate(-24px,20px) scale(0.92); }
          100% { transform: translate(0,0) scale(1); }
        }
        .invite-blob { animation: invite-drift 11s ease-in-out infinite; }
        .invite-blob-2 { animation-delay: -3.5s; }
        .invite-blob-3 { animation-delay: -7s; }
        @keyframes invite-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .invite-icon-float { animation: invite-float 3.2s ease-in-out infinite; }
      `}</style>

      {/* dot-grid texture + drifting color glow, matching the rest of the site */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: 'radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="invite-blob absolute top-[-15%] left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-emerald-300/25 rounded-full filter blur-[120px]" />
        <div className="invite-blob invite-blob-2 absolute top-[10%] left-[-10%] w-[340px] h-[340px] bg-teal-300/20 rounded-full filter blur-[100px]" />
        <div className="invite-blob invite-blob-3 absolute top-[5%] right-[-10%] w-[340px] h-[340px] bg-emerald-400/20 rounded-full filter blur-[100px]" />
      </div>

      <main className="relative flex-1 flex items-start justify-center px-4 pt-12 pb-16">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center mb-6"
          >
            <div className="invite-icon-float">
              <img
                src={appIcon}
                alt="Jogo"
                className="w-20 h-20 rounded-[22px] shadow-lg shadow-emerald-900/20 border border-white/60"
              />
            </div>
          </motion.div>

          {ref ? (
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-2xl font-black mb-1.5 leading-tight"
            >
              <span className="text-emerald-600">{ref}</span> invited you to a crew ⚽
            </motion.h1>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-2xl font-black mb-1.5 leading-tight"
            >
              You're invited to a crew ⚽
            </motion.h1>
          )}
          <p className="text-center text-[#6b7280] text-sm mb-6">
            A real home for your soccer group.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-[#DDE1E5] rounded-3xl shadow-md overflow-hidden mb-7"
          >
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : crew ? (
              <>
                {/* Hero — real banner/logo when the crew has one, otherwise
                    a branded placeholder so it still feels alive either way */}
                <div className="relative w-full h-48 bg-[#F1F8F3] overflow-hidden">
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      {/* Same placeholder treatment as the app's own crew
                          cover when there's no photo: a left accent bar and
                          a faint rotated watermark, not a big centered icon. */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                      <span
                        className="absolute select-none pointer-events-none"
                        style={{ right: -30, bottom: -30, transform: 'rotate(-15deg)', fontSize: 150, opacity: 0.06, lineHeight: 1 }}
                      >
                        {crew.icon || '⚽'}
                      </span>
                    </>
                  )}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1 shadow-sm">
                    Crew
                  </div>
                </div>

                <div className="p-7">
                  <h1 className="text-2xl font-black mb-4 leading-tight">
                    {crew.name || 'A Jogo Crew'}
                  </h1>

                  <div className="flex flex-col gap-2">
                    {memberCount != null && (
                      <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                        <Users size={15} className="text-[#6b7280] flex-shrink-0" />
                        {memberCount} member{memberCount !== 1 ? 's' : ''}
                      </div>
                    )}
                    {crew.homeArea && (
                      <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                        <MapPin size={15} className="text-[#6b7280] flex-shrink-0" />
                        {crew.homeArea}
                      </div>
                    )}
                  </div>

                  {crew.description && (
                    <p className="text-[#111111] text-sm mt-4 leading-relaxed line-clamp-3">
                      {crew.description}
                    </p>
                  )}

                  <p className="text-[#9CA3AF] text-xs mt-4">
                    Open the app to see games, chat, and join the crew.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-14 px-7">
                <div className="w-12 h-12 rounded-2xl bg-[#F1F8F3] flex items-center justify-center mx-auto mb-4">
                  {isPrivate ? (
                    <Lock size={20} className="text-emerald-700" />
                  ) : (
                    <span className="text-2xl">⚽</span>
                  )}
                </div>
                <h1 className="text-xl font-bold mb-2">
                  {isPrivate ? "This crew is private" : "You're invited to a crew"}
                </h1>
                <p className="text-[#6b7280] text-sm leading-relaxed">
                  {isPrivate
                    ? 'Ask whoever sent you this link to add you directly, or open Jogo to see crews near you.'
                    : 'This crew may no longer exist. Open Jogo to see what’s happening near you.'}
                </p>
              </div>
            )}
          </motion.div>

          <motion.a
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#111111] hover:bg-[#2a2a2a] text-white font-bold py-4 rounded-2xl shadow-lg shadow-black/15"
          >
            <AppleLogo />
            <span className="text-left leading-tight">
              <span className="block text-[10px] font-normal text-white/60">Download on the</span>
              <span className="block text-lg font-bold">App Store</span>
            </span>
          </motion.a>
          <p className="text-center text-xs text-[#9CA3AF] mt-3">
            Free to join. Find your crew's next game in seconds.
          </p>

          <div className="text-center mt-8">
            <a
              href={WEB_APP_URL}
              className="text-xs text-[#9CA3AF] hover:text-[#6b7280] underline underline-offset-4 transition-colors"
            >
              Continue on the web instead →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

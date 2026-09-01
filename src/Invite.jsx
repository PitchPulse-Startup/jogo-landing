// src/Invite.jsx — landing page for shared game links (jogous.io/invite/:gameId)
//
// Whoever taps a game invite link lands here first. The whole point of this
// page is to get them into the real app, not to be a second web app — so it
// shows just enough of the game to be worth opening the app for, then makes
// "Download on the App Store" the loud, obvious thing to do. Continuing on
// the web is still there, just deliberately small and secondary.

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from './firebase';
import { Users } from 'lucide-react';
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

export default function Invite() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [fieldPhoto, setFieldPhoto] = useState(null);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);

    if (!gameId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'games', gameId));
        if (cancelled) return;
        setGame(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (e) {
        console.error('Error loading invited game:', e);
        if (!cancelled) setGame(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [gameId]);

  // The game document only ever stores a copy of the field's own imageUrl
  // (almost never set) — real field photos live in a separate `field-photos`
  // collection, keyed by fieldId, the same place the app's own field picker
  // pulls them from. That's the piece that was missing before.
  useEffect(() => {
    let cancelled = false;
    if (!game?.fieldId) return;

    (async () => {
      try {
        const q = query(
          collection(db, 'field-photos'),
          where('fieldId', '==', game.fieldId),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        setFieldPhoto(snap.empty ? null : snap.docs[0].data().imageUrl || null);
      } catch (e) {
        console.error('Error loading field photo:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [game?.fieldId]);

  // Deliberately not showing the field/address or the date/time here —
  // this page has no signed-in user and no way to know if someone actually
  // joined. Showing exactly where and when would let people just show up
  // without ever downloading the app or getting on the roster. A cover
  // photo and who's already in are enticing without being enough to act on.
  // Attendee count matches how the app counts capacity everywhere else —
  // each player row plus however many guests they're bringing, since
  // maxPlayers accounts for guest slots too. Just using players.length
  // would undercount any game where people brought +1s.
  const playerCount = game?.players
    ? game.players.reduce((total, p) => total + 1 + (p.guests || 0), 0)
    : game?.currentPlayers ?? null;
  const maxPlayers = game?.maxPlayers ?? null;
  const coverImage = game?.imageUrl || fieldPhoto || game?.field?.imageUrl || null;
  const avatars = (game?.players || []).filter(p => p.photoURL).slice(0, 5);
  const extraCount = Math.max(0, (playerCount || 0) - avatars.length);

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
              <span className="text-emerald-600">{ref}</span> invited you to play ⚽
            </motion.h1>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-2xl font-black mb-1.5 leading-tight"
            >
              You're invited to play ⚽
            </motion.h1>
          )}
          <p className="text-center text-[#6b7280] text-sm mb-6">
            Grab your spot before it's gone.
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
            ) : game ? (
              <>
                {/* Hero — real cover photo when the game/field has one, otherwise
                    a branded placeholder so it still feels alive either way */}
                <div className="relative w-full h-48 bg-[#F1F8F3] overflow-hidden">
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      {/* Same placeholder treatment as the app's own game
                          cards when there's no photo: a left accent bar and
                          a faint rotated watermark, not a big centered icon. */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                      <span
                        className="absolute select-none pointer-events-none"
                        style={{ right: -30, bottom: -30, transform: 'rotate(-15deg)', fontSize: 150, opacity: 0.06, lineHeight: 1 }}
                      >
                        ⚽
                      </span>
                    </>
                  )}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1 shadow-sm">
                    {(game.gameType || 'Pickup')}
                  </div>
                </div>

                <div className="p-7">
                  <h1 className="text-2xl font-black mb-4 leading-tight">
                    {game.title || 'Pickup Soccer Game'}
                  </h1>

                  {avatars.length > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5 flex-shrink-0">
                        {avatars.map((p, i) => (
                          <img
                            key={p.userId || i}
                            src={p.photoURL}
                            alt=""
                            className="w-8 h-8 rounded-full border-2 border-white object-cover bg-[#F1F8F3]"
                          />
                        ))}
                        {extraCount > 0 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-[#F1F8F3] text-emerald-700 text-[11px] font-bold flex items-center justify-center">
                            +{extraCount}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-[#6b7280]">
                        {maxPlayers != null ? `${playerCount ?? 0}/${maxPlayers} joined` : `${playerCount ?? 0} joined`}
                      </span>
                    </div>
                  ) : maxPlayers != null && (
                    <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                      <Users size={15} className="text-[#6b7280] flex-shrink-0" />
                      {playerCount ?? 0}/{maxPlayers} players joined
                    </div>
                  )}

                  <p className="text-[#9CA3AF] text-xs mt-4">
                    Open the app to see the field, date, and time — and grab your spot.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-14 px-7">
                <div className="text-4xl mb-3">⚽</div>
                <h1 className="text-xl font-bold mb-2">You're invited to play</h1>
                <p className="text-[#6b7280] text-sm leading-relaxed">
                  This game may have already started or wrapped up. Open Jogo to see what's happening near you.
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
            Free to join. Find games near you in seconds.
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

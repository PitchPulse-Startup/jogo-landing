// api/og/game.jsx — dynamic branded OG image for a game share link
// (jogous.io/api/og/game?gameId=...), referenced as <meta property="og:image">
// by api/invite-page.js. See api/og/crew.jsx's header comment for why this
// exists — same reasoning, game-flavored.
import { ImageResponse } from '@vercel/og';
import { fetchPublicDoc, queryFirstMatch } from '../_firestoreRest.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId') || '';

  const result = await fetchPublicDoc('games', gameId);
  const game = result.status === 'ok' ? result.data : null;

  let fieldPhoto = null;
  if (game?.fieldId) {
    const photo = await queryFirstMatch('field-photos', 'fieldId', game.fieldId, 'timestamp');
    fieldPhoto = photo?.imageUrl || null;
  }

  const title = game?.title || 'Pickup Soccer Game';
  const playerCount = Array.isArray(game?.players)
    ? game.players.reduce((total, p) => total + 1 + (p.guests || 0), 0)
    : (game?.currentPlayers ?? null);
  const maxPlayers = game?.maxPlayers ?? null;
  const coverImage = game?.imageUrl || fieldPhoto || game?.field?.imageUrl || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          backgroundColor: '#0B3B2E',
          backgroundImage: coverImage
            ? undefined
            : 'linear-gradient(135deg, #0B3B2E 0%, #065F46 55%, #047857 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt=""
            style={{
              position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px', objectFit: 'cover',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px',
            backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.82) 100%)',
            display: 'flex',
          }}
        />

        <div style={{ position: 'absolute', top: 44, left: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}
          >
            ⚽
          </div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: -0.5, display: 'flex' }}>JOGO</div>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: '0 56px 56px', gap: 14 }}>
          <div
            style={{
              display: 'flex', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '8px 20px',
              color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            }}
          >
            {game?.gameType || 'PICKUP GAME'}
          </div>
          <div
            style={{
              display: 'flex', color: '#fff', fontSize: 68, fontWeight: 900, letterSpacing: -1.5,
              lineHeight: 1.05, maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
            <span style={{ display: 'flex' }}>👥</span>
            <span style={{ display: 'flex' }}>
              {maxPlayers != null ? `${playerCount ?? 0}/${maxPlayers} joined` : `${playerCount ?? 0} joined`}
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

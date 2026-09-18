// api/og/crew.jsx — dynamic branded OG image for a crew share link
// (jogous.io/api/og/crew?squadId=...), referenced as <meta property="og:image">
// by api/crew-page.js. This is what actually renders inside the preview
// card when a crew link is pasted into iMessage/WhatsApp/Slack/Discord/
// Twitter-X/Facebook — using the crew's OWN banner photo directly (rather
// than a generic Jogo graphic) is what makes each shared link look
// distinct and worth tapping.
import { ImageResponse } from '@vercel/og';
import { fetchPublicDoc } from '../_firestoreRest.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const url = new URL(request.url);
  const squadId = url.searchParams.get('squadId') || '';

  const result = await fetchPublicDoc('squads', squadId);
  const crew = result.status === 'ok' ? result.data : null;

  const name = crew?.name || 'A Jogo Crew';
  const memberCount = crew?.memberCount ?? (Array.isArray(crew?.members) ? crew.members.length : null);
  const homeArea = crew?.homeArea || '';
  const coverImage = crew?.bannerUrl || crew?.imageUrl || null;

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
        {/* Dark gradient scrim so white text stays readable over any photo */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px',
            backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.82) 100%)',
            display: 'flex',
          }}
        />

        {/* Jogo wordmark, top-left */}
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

        {/* Crew identity, bottom */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: '0 56px 56px', gap: 14 }}>
          <div
            style={{
              display: 'flex', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '8px 20px',
              color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            }}
          >
            CREW
          </div>
          <div
            style={{
              display: 'flex', color: '#fff', fontSize: 68, fontWeight: 900, letterSpacing: -1.5,
              lineHeight: 1.05, maxWidth: 1000,
            }}
          >
            {name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 28, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
            {memberCount != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex' }}>👥</span>
                <span style={{ display: 'flex' }}>{memberCount} member{memberCount === 1 ? '' : 's'}</span>
              </div>
            )}
            {homeArea && (
              <>
                <div style={{ display: 'flex', width: 6, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.5)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex' }}>📍</span>
                  <span style={{ display: 'flex' }}>{homeArea}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

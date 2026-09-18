// api/invite-page.js — real server-rendered HTML for jogous.io/invite/:gameId
// (routed here by vercel.json's rewrite, BEFORE the SPA catch-all).
//
// Same reasoning as api/crew-page.js — see that file's header comment.
// This is the game-invite equivalent, mirroring src/Invite.jsx's data
// logic (attendee-count-with-guests, field-photo fallback lookup,
// deliberately hiding field/time so people have to open the app) in plain
// server-rendered HTML instead of client-side React.
import { fetchPublicDoc, queryFirstMatch, escapeHtml } from './_firestoreRest.js';
import { SHARE_PAGE_STYLES, USERS_ICON_SVG, APPLE_LOGO_SVG, APP_STORE_URL, WEB_APP_URL, SITE_URL } from './_shareStyles.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId') || '';
  const ref = url.searchParams.get('ref') || '';

  const result = await fetchPublicDoc('games', gameId);
  const game = result.status === 'ok' ? result.data : null;

  // The game doc only ever stores a copy of the field's own imageUrl
  // (almost never set) — real field photos live in the separate
  // field-photos collection, keyed by fieldId, same as Invite.jsx's
  // client-side lookup and the app's own field picker.
  let fieldPhoto = null;
  if (game?.fieldId) {
    const photo = await queryFirstMatch('field-photos', 'fieldId', game.fieldId, 'timestamp');
    fieldPhoto = photo?.imageUrl || null;
  }

  const playerCount = Array.isArray(game?.players)
    ? game.players.reduce((total, p) => total + 1 + (p.guests || 0), 0)
    : (game?.currentPlayers ?? null);
  const maxPlayers = game?.maxPlayers ?? null;
  const coverImage = game?.imageUrl || fieldPhoto || game?.field?.imageUrl || '';
  const avatars = (game?.players || []).filter((p) => p.photoURL).slice(0, 5);
  const extraCount = Math.max(0, (playerCount || 0) - avatars.length);
  const gameTitle = game?.title || 'Pickup Soccer Game';

  const pageTitle = game ? `${gameTitle} · Jogo` : 'Game Invite · Jogo';
  const ogDescription = game
    ? `${maxPlayers != null ? `${playerCount ?? 0}/${maxPlayers} joined` : `${playerCount ?? 0} joined`} — grab your spot on Jogo`
    : "This game may have already started or wrapped up. Open Jogo to see what's happening near you.";
  const ogImage = `${SITE_URL}/api/og/game?gameId=${encodeURIComponent(gameId)}`;
  const canonicalUrl = `${SITE_URL}/invite/${encodeURIComponent(gameId)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;

  const heroMarkup = game ? (
    coverImage
      ? `<img src="${escapeHtml(coverImage)}" alt="" class="hero-img" />`
      : `<div class="hero-placeholder"><div class="hero-accent"></div><span class="hero-watermark">⚽</span></div>`
  ) : '';

  const avatarsMarkup = avatars.length > 0 ? `
    <div class="avatar-row">
      <div class="avatar-stack">
        ${avatars.map((p) => `<img src="${escapeHtml(p.photoURL)}" alt="" />`).join('')}
        ${extraCount > 0 ? `<div class="avatar-extra">+${extraCount}</div>` : ''}
      </div>
      <span class="meta-row" style="margin-top:0;">${maxPlayers != null ? `${playerCount ?? 0}/${maxPlayers} joined` : `${playerCount ?? 0} joined`}</span>
    </div>
  ` : (maxPlayers != null ? `<div class="meta-row">${USERS_ICON_SVG}${playerCount ?? 0}/${maxPlayers} players joined</div>` : '');

  const bodyMarkup = game ? `
    <div class="hero">
      ${heroMarkup}
      <div class="hero-badge">${escapeHtml(game.gameType || 'Pickup')}</div>
    </div>
    <div class="card-body">
      <h1 class="entity-name">${escapeHtml(gameTitle)}</h1>
      ${avatarsMarkup}
      <p class="hint">Open the app to see the field, date, and time — and grab your spot.</p>
    </div>
  ` : `
    <div class="empty-state">
      <div class="empty-icon">⚽</div>
      <h1 class="empty-title">You're invited to play</h1>
      <p class="empty-text">This game may have already started or wrapped up. Open Jogo to see what's happening near you.</p>
    </div>
  `;

  const headline = ref
    ? `<span class="accent">${escapeHtml(ref)}</span> invited you to play ⚽`
    : "You're invited to play ⚽";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(ogDescription)}" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Jogo" />
<meta property="og:title" content="${escapeHtml(pageTitle)}" />
<meta property="og:description" content="${escapeHtml(ogDescription)}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${canonicalUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
<meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
<meta name="twitter:image" content="${ogImage}" />
<link rel="icon" href="/jogo-logo2.png" />
<style>${SHARE_PAGE_STYLES}</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="bg-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div><div class="blob blob-3"></div></div>
  <main>
    <div class="wrap">
      <div class="icon-wrap"><img src="${SITE_URL}/jogo-app-icon.png" alt="Jogo" class="app-icon" /></div>
      <h1 class="headline">${headline}</h1>
      <p class="subhead">Grab your spot before it's gone.</p>
      <div class="card">${bodyMarkup}</div>
      <a href="${APP_STORE_URL}" class="cta" target="_blank" rel="noopener noreferrer">
        ${APPLE_LOGO_SVG}
        <span class="cta-text"><span class="cta-sub">Download on the</span><span class="cta-main">App Store</span></span>
      </a>
      <p class="cta-hint">Free to join. Find games near you in seconds.</p>
      <div class="web-link-wrap"><a href="${WEB_APP_URL}" class="web-link">Continue on the web instead →</a></div>
    </div>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}

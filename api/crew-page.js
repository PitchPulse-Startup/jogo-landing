// api/crew-page.js — real server-rendered HTML for jogous.io/crew/:squadId
// (routed here by vercel.json's rewrite, BEFORE the SPA catch-all).
//
// Why this exists instead of just letting src/Crew.jsx (the React/Vite SPA
// page) handle the route: a Vite CSR app serves the exact same index.html
// for every URL, so it's IMPOSSIBLE to vary <title>/og:image/etc. per crew
// there — and link-preview crawlers (iMessage, WhatsApp, Facebook, Slack,
// Discord, Twitter/X) never execute JavaScript, so even if we changed the
// title client-side after the fact, they'd never see it. This function
// renders the real HTML (with correct per-crew meta tags) server-side, so
// EVERY visitor — bot or human — gets a link that actually looks like
// something when shared, not a generic "Jogo" card. See api/_shareStyles.js
// for why this looks just as premium as the React version despite being
// plain HTML/CSS (every animation here is CSS, needs no JS to run).
import { fetchPublicDoc, escapeHtml } from './_firestoreRest.js';
import { SHARE_PAGE_STYLES, USERS_ICON_SVG, PIN_ICON_SVG, APPLE_LOGO_SVG, APP_STORE_URL, WEB_APP_URL, SITE_URL } from './_shareStyles.js';

export const config = { runtime: 'edge' };

// Link-preview crawlers never run JS, so they need this static, per-crew-meta
// HTML. A real visitor needs the opposite: the actual React SPA (src/Crew.jsx),
// since that's where the interactive "Join Crew" flow (sign in + Firestore
// write) lives — plain HTML can't do that. Route by User-Agent: known
// crawlers get this file's static markup as before, everyone else gets the
// real app's index.html fetched from this same deployment and returned
// as-is, so the URL bar never changes and React Router mounts Crew.jsx.
const CRAWLER_UA_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|Slackbot|Discordbot|TelegramBot|LinkedInBot|Googlebot|bingbot|Applebot|SkypeUriPreview|vkShare|W3C_Validator|redditbot|Pinterest|YandexBot|DuckDuckBot|Iframely|Embedly|Bufferbot|Google-InspectionTool/i;

export default async function handler(request) {
  const url = new URL(request.url);
  const squadId = url.searchParams.get('squadId') || '';
  const ref = url.searchParams.get('ref') || '';
  const userAgent = request.headers.get('user-agent') || '';

  if (!CRAWLER_UA_PATTERN.test(userAgent)) {
    const appShell = await fetch(new URL('/index.html', url.origin));
    const html = await appShell.text();
    return new Response(html, {
      status: appShell.status,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  const result = await fetchPublicDoc('squads', squadId);
  const crew = result.status === 'ok' ? result.data : null;
  const isPrivate = result.status === 'private';

  const name = crew?.name || 'A Jogo Crew';
  const memberCount = crew?.memberCount ?? (Array.isArray(crew?.members) ? crew.members.length : null);
  const homeArea = crew?.homeArea || '';
  const description = crew?.description || '';
  const coverImage = crew?.bannerUrl || crew?.imageUrl || '';
  const icon = crew?.icon || '⚽';

  const pageTitle = crew ? `${name} · Jogo Crew` : (isPrivate ? 'Private Crew · Jogo' : 'Crew Invite · Jogo');
  const ogDescription = crew
    ? `${memberCount != null ? `${memberCount} member${memberCount === 1 ? '' : 's'}` : 'Join'}${homeArea ? ` · ${homeArea}` : ''} — join on Jogo`
    : (isPrivate
      ? 'This crew is private. Open Jogo to see crews near you.'
      : "This crew may no longer exist. Open Jogo to see what's happening near you.");
  const ogImage = `${SITE_URL}/api/og/crew?squadId=${encodeURIComponent(squadId)}`;
  const canonicalUrl = `${SITE_URL}/crew/${encodeURIComponent(squadId)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;

  const heroMarkup = crew ? (
    coverImage
      ? `<img src="${escapeHtml(coverImage)}" alt="" class="hero-img" />`
      : `<div class="hero-placeholder"><div class="hero-accent"></div><span class="hero-watermark">${escapeHtml(icon)}</span></div>`
  ) : '';

  const bodyMarkup = crew ? `
    <div class="hero">
      ${heroMarkup}
      <div class="hero-badge">Crew</div>
    </div>
    <div class="card-body">
      <h1 class="entity-name">${escapeHtml(name)}</h1>
      ${memberCount != null ? `<div class="meta-row">${USERS_ICON_SVG}${memberCount} member${memberCount === 1 ? '' : 's'}</div>` : ''}
      ${homeArea ? `<div class="meta-row">${PIN_ICON_SVG}${escapeHtml(homeArea)}</div>` : ''}
      ${description ? `<p class="entity-desc">${escapeHtml(description)}</p>` : ''}
      <p class="hint">Open the app to see games, chat, and join the crew.</p>
    </div>
  ` : `
    <div class="empty-state">
      <div class="empty-icon">${isPrivate ? '🔒' : '⚽'}</div>
      <h1 class="empty-title">${isPrivate ? 'This crew is private' : "You're invited to a crew"}</h1>
      <p class="empty-text">${isPrivate
        ? 'Ask whoever sent you this link to add you directly, or open Jogo to see crews near you.'
        : "This crew may no longer exist. Open Jogo to see what's happening near you."}</p>
    </div>
  `;

  const headline = ref
    ? `<span class="accent">${escapeHtml(ref)}</span> invited you to a crew ⚽`
    : "You're invited to a crew ⚽";

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
      <p class="subhead">A real home for your soccer group.</p>
      <div class="card">${bodyMarkup}</div>
      <a href="${APP_STORE_URL}" class="cta" target="_blank" rel="noopener noreferrer">
        ${APPLE_LOGO_SVG}
        <span class="cta-text"><span class="cta-sub">Download on the</span><span class="cta-main">App Store</span></span>
      </a>
      <p class="cta-hint">Free to join. Find your crew's next game in seconds.</p>
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

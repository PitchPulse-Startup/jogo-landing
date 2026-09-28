// api/event-page.js — real server-rendered HTML for jogous.io/event/:eventId
// (routed here by vercel.json's rewrite, BEFORE the SPA catch-all).
//
// Same split as api/invite-page.js: link-preview crawlers never run JS, so
// they get this file's static per-event meta HTML (title, date, cover image
// for the iMessage/WhatsApp card). Real visitors get the SPA's index.html,
// URL unchanged, and React Router mounts src/Event.jsx — that's where the
// join flow lives. `?type=paid` reads the paidEvents collection instead of
// events, same as Event.jsx.
import { fetchPublicDoc, escapeHtml } from './_firestoreRest.js';
import { SHARE_PAGE_STYLES, USERS_ICON_SVG, APPLE_LOGO_SVG, APP_STORE_URL, WEB_APP_URL, SITE_URL } from './_shareStyles.js';

export const config = { runtime: 'edge' };

const CRAWLER_UA_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|Slackbot|Discordbot|TelegramBot|LinkedInBot|Googlebot|bingbot|Applebot|SkypeUriPreview|vkShare|W3C_Validator|redditbot|Pinterest|YandexBot|DuckDuckBot|Iframely|Embedly|Bufferbot|Google-InspectionTool/i;

// Event dates are local 'YYYY-MM-DD' strings (+ optional 'HH:MM'); format
// them without a timezone round-trip so the preview shows the organizer's
// own date.
function formatEventDate(date, time) {
  if (!date || typeof date !== 'string') return null;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
  if (!time) return day;
  const [hh, mm] = String(time).split(':').map(Number);
  if (Number.isNaN(hh)) return day;
  const h12 = ((hh + 11) % 12) + 1;
  return `${day} · ${h12}:${String(mm || 0).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`;
}

export default async function handler(request) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId') || '';
  const ref = url.searchParams.get('ref') || '';
  const isPaid = url.searchParams.get('type') === 'paid';
  const userAgent = request.headers.get('user-agent') || '';

  if (!CRAWLER_UA_PATTERN.test(userAgent)) {
    const appShell = await fetch(new URL('/index.html', url.origin));
    const html = await appShell.text();
    return new Response(html, {
      status: appShell.status,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  const result = await fetchPublicDoc(isPaid ? 'paidEvents' : 'events', eventId);
  const event = result.status === 'ok' ? result.data : null;

  const teams = Array.isArray(event?.teams) ? event.teams : [];
  const hasTeams = !!event?.enableTeams && teams.length > 0;
  const count = hasTeams
    ? teams.reduce((t, team) => t + (Array.isArray(team.players) ? team.players.length : 0), 0)
    : (Array.isArray(event?.participants) ? event.participants.length : 0);
  const capacity = event?.maxParticipants || null;
  const eventTitle = event?.title || 'Jogo Event';
  const when = formatEventDate(event?.date, event?.time);
  const price = typeof event?.price === 'number' ? event.price : 0;

  const pageTitle = event ? `${eventTitle} · Jogo` : 'Event Invite · Jogo';
  const ogDescription = event
    ? [when, capacity ? `${count}/${capacity} going` : `${count} going`, price > 0 ? `$${price}` : 'Free'].filter(Boolean).join(' — ')
    : 'This event may have already happened. Open Jogo to see what’s happening near you.';
  const ogImage = event?.imageUrl || `${SITE_URL}/jogolandscape-email.png`;
  const params = new URLSearchParams();
  if (isPaid) params.set('type', 'paid');
  if (ref) params.set('ref', ref);
  const canonicalUrl = `${SITE_URL}/event/${encodeURIComponent(eventId)}${params.toString() ? `?${params}` : ''}`;

  const bodyMarkup = event ? `
    <div class="hero">
      ${event.imageUrl
        ? `<img src="${escapeHtml(event.imageUrl)}" alt="" class="hero-img" />`
        : `<div class="hero-placeholder"><div class="hero-accent"></div><span class="hero-watermark">🏆</span></div>`}
      <div class="hero-badge">${price > 0 ? `$${escapeHtml(String(price))}` : 'Free'}</div>
    </div>
    <div class="card-body">
      <h1 class="entity-name">${escapeHtml(eventTitle)}</h1>
      ${when ? `<div class="meta-row">${escapeHtml(when)}</div>` : ''}
      <div class="meta-row">${USERS_ICON_SVG}${capacity ? `${count}/${capacity} going` : `${count} going`}</div>
      <p class="hint">Tap the link to save your spot in seconds.</p>
    </div>
  ` : `
    <div class="empty-state">
      <div class="empty-icon">🏆</div>
      <h1 class="empty-title">You're invited</h1>
      <p class="empty-text">This event may have already happened. Open Jogo to see what’s happening near you.</p>
    </div>
  `;

  const headline = ref
    ? `<span class="accent">${escapeHtml(ref)}</span> invited you ⚽`
    : "You're invited ⚽";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(ogDescription)}" />
<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Jogo" />
<meta property="og:title" content="${escapeHtml(pageTitle)}" />
<meta property="og:description" content="${escapeHtml(ogDescription)}" />
<meta property="og:image" content="${escapeHtml(ogImage)}" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
<meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
<meta name="twitter:image" content="${escapeHtml(ogImage)}" />
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
      <p class="subhead">Save your spot before it's gone.</p>
      <div class="card">${bodyMarkup}</div>
      <a href="${APP_STORE_URL}" class="cta" target="_blank" rel="noopener noreferrer">
        ${APPLE_LOGO_SVG}
        <span class="cta-text"><span class="cta-sub">Download on the</span><span class="cta-main">App Store</span></span>
      </a>
      <div class="web-link-wrap"><a href="${WEB_APP_URL}" class="web-link">Continue on the web instead →</a></div>
    </div>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Never cached by Vercel's CDN: its cache key is the URL, not the
      // user agent, so a cached copy of this crawler-only page (fetched
      // first by e.g. iMessage's link preview) was then served to the
      // real person tapping the link — the old static page instead of the
      // React one. Crawler traffic is tiny, so skipping the cache is free.
      'cache-control': 'private, no-store',
      vary: 'User-Agent',
    },
  });
}

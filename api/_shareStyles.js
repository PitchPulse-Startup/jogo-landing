// api/_shareStyles.js
// Shared CSS for the server-rendered share-preview pages (crew-page.js,
// invite-page.js) — deliberately plain server-rendered HTML/CSS, not the
// React/framer-motion version those routes' CLIENT components (Crew.jsx,
// Invite.jsx) use, since a link-preview crawler (iMessage, WhatsApp,
// Facebook, Slack, Discord, Twitter/X, etc.) never executes JavaScript —
// it only ever reads the raw HTML + <meta> tags Vercel returns for the
// request. Real human visitors land here too (see vercel.json's rewrite
// order), so this is styled to look just as premium as the React version,
// not a stripped-down fallback — every animation here is plain CSS
// (@keyframes/transitions), which needs no JS to run.
export const SHARE_PAGE_STYLES = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #EDEEF1;
    color: #111111;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative;
    overflow-x: hidden;
    min-height: 100vh;
  }
  .bg-grid {
    position: fixed; inset: 0; pointer-events: none; opacity: 0.6;
    background-image: radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px);
    background-size: 22px 22px;
  }
  .bg-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
  .blob { position: absolute; border-radius: 999px; filter: blur(120px); animation: drift 11s ease-in-out infinite; }
  .blob-1 { top: -15%; left: 50%; transform: translateX(-50%); width: 560px; height: 560px; background: rgba(110,231,183,0.25); }
  .blob-2 { top: 10%; left: -10%; width: 340px; height: 340px; background: rgba(94,234,212,0.2); filter: blur(100px); animation-delay: -3.5s; }
  .blob-3 { top: 5%; right: -10%; width: 340px; height: 340px; background: rgba(52,211,153,0.2); filter: blur(100px); animation-delay: -7s; }
  @keyframes drift {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(30px,-24px) scale(1.12); }
    66%  { transform: translate(-24px,20px) scale(0.92); }
    100% { transform: translate(0,0) scale(1); }
  }
  main { position: relative; min-height: 100vh; display: flex; justify-content: center; padding: 48px 16px 64px; }
  .wrap { width: 100%; max-width: 420px; }
  .icon-wrap { display: flex; justify-content: center; margin-bottom: 24px; animation: floatIcon 3.2s ease-in-out infinite; }
  @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  .app-icon { width: 80px; height: 80px; border-radius: 22px; box-shadow: 0 10px 30px rgba(6,78,59,0.2); border: 1px solid rgba(255,255,255,0.6); }
  .headline {
    text-align: center; font-size: 26px; font-weight: 900; line-height: 1.2; margin: 0 0 6px;
    letter-spacing: -0.02em; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }
  .accent { color: #059669; }
  .subhead { text-align: center; color: #6b7280; font-size: 14px; margin: 0 0 24px; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .card {
    background: #fff; border: 1px solid #DDE1E5; border-radius: 24px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 28px;
    animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.18s both;
  }
  .hero { position: relative; width: 100%; height: 192px; background: #F1F8F3; overflow: hidden; }
  .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero-placeholder { position: absolute; inset: 0; }
  .hero-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #059669; }
  .hero-watermark {
    position: absolute; right: -30px; bottom: -30px; transform: rotate(-15deg);
    font-size: 150px; opacity: 0.06; line-height: 1; user-select: none;
  }
  .hero-badge {
    position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.95); color: #047857; font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.06em; border-radius: 999px; padding: 5px 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
  .card-body { padding: 28px; }
  .entity-name { font-size: 24px; font-weight: 900; margin: 0 0 16px; line-height: 1.2; letter-spacing: -0.01em; }
  .meta-row { display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px; margin-top: 8px; }
  .meta-row svg { flex-shrink: 0; }
  .avatar-row { display: flex; align-items: center; gap: 12px; }
  .avatar-stack { display: flex; }
  .avatar-stack img, .avatar-extra {
    width: 32px; height: 32px; border-radius: 999px; border: 2px solid #fff; object-fit: cover;
    background: #F1F8F3; margin-left: -10px;
  }
  .avatar-stack img:first-child, .avatar-extra:first-child { margin-left: 0; }
  .avatar-extra { display: flex; align-items: center; justify-content: center; color: #047857; font-size: 11px; font-weight: 700; }
  .entity-desc { color: #111111; font-size: 14px; margin-top: 16px; line-height: 1.5; }
  .hint { color: #9CA3AF; font-size: 12px; margin-top: 16px; }
  .empty-state { text-align: center; padding: 56px 28px; }
  .empty-icon {
    width: 48px; height: 48px; border-radius: 16px; background: #F1F8F3;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 22px;
  }
  .empty-title { font-size: 20px; font-weight: 800; margin: 0 0 8px; }
  .empty-text { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0; }
  .cta {
    display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%;
    background: #111111; color: #fff; font-weight: 800; padding: 16px; border-radius: 16px;
    text-decoration: none; box-shadow: 0 8px 20px rgba(0,0,0,0.15); transition: background 0.15s ease, transform 0.15s ease;
    animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.28s both;
  }
  .cta:hover { background: #2a2a2a; transform: translateY(-2px); }
  .cta-text { text-align: left; line-height: 1.2; }
  .cta-sub { display: block; font-size: 10px; font-weight: 400; color: rgba(255,255,255,0.6); }
  .cta-main { display: block; font-size: 18px; font-weight: 800; }
  .cta-hint { text-align: center; font-size: 12px; color: #9CA3AF; margin: 12px 0 0; }
  .web-link-wrap { text-align: center; margin-top: 32px; }
  .web-link { font-size: 12px; color: #9CA3AF; text-decoration: underline; text-underline-offset: 4px; }
  .web-link:hover { color: #6b7280; }
`;

export const USERS_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
export const PIN_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
export const APPLE_LOGO_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>';

export const APP_STORE_URL = 'https://apps.apple.com/us/app/jogo-pickup-soccer-near-you/id6760919244';
export const WEB_APP_URL = 'https://www.jogous.io/app';
export const SITE_URL = 'https://www.jogous.io';

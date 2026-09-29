// Store links shared by the homepage and the game / event / crew share pages.
export const APP_STORE_URL =
  'https://apps.apple.com/us/app/jogo-pickup-soccer-near-you/id6760919244';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.chrisvarg2.newpitch';

export const isAndroid =
  typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

// Single-button spots ("Get the app", "Get tickets in the app") send
// Android visitors to Google Play and everyone else to the App Store.
export const APP_URL = isAndroid ? PLAY_STORE_URL : APP_STORE_URL;

export function PlayLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198 2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658 16.802 8.99l-2.303 2.303-8.635-8.635z" />
    </svg>
  );
}

export function AppleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// Both stores, side by side — the always-visible "get the app" row on the
// game / event share pages (the phone's own store listed first).
export function StoreButtons({ label = 'Get the Jogo app', className = '' }) {
  const apple = (
    <a key="apple" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white rounded-xl py-2.5 px-3 transition-colors">
      <AppleLogo size={18} />
      <span className="text-left leading-tight">
        <span className="block text-[9px] font-normal text-white/60">Download on the</span>
        <span className="block text-[14px] font-bold">App Store</span>
      </span>
    </a>
  );
  const play = (
    <a key="play" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white rounded-xl py-2.5 px-3 transition-colors">
      <PlayLogo size={16} />
      <span className="text-left leading-tight">
        <span className="block text-[9px] font-normal text-white/60">Get it on</span>
        <span className="block text-[14px] font-bold">Google Play</span>
      </span>
    </a>
  );
  return (
    <div className={className}>
      {label && <p className="text-center text-[12px] font-semibold text-[#6b7280] mb-2">{label}</p>}
      <div className="grid grid-cols-2 gap-2">{isAndroid ? [play, apple] : [apple, play]}</div>
    </div>
  );
}

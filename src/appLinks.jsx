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

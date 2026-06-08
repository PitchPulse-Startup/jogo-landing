// src/App.jsx — Redesigned to maximize App Store downloads

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Users, Zap, Check, ChevronLeft, ChevronRight,
  Shield, Coffee, Heart, Instagram
} from 'lucide-react';

import jogoLogo from './assets/jogo-logo2.png';
import screenOne from './assets/one.png';
import screenTwo from './assets/two.png';
import screenThree from './assets/three.png';
import screenFour from './assets/four.png';
import soccerBg from './assets/soccer.jpeg';
import founderPhoto from './assets/Team.jpeg';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/jogo-pickup-soccer-near-you/id6760919244';

// ── Icons ──────────────────────────────────────────────────────────────────
function AppleLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.341c-.551 0-.999-.449-.999-.999s.448-.999.999-.999c.551 0 .999.449.999.999s-.448.999-.999.999zm-11.046 0c-.551 0-.999-.449-.999-.999s.448-.999.999-.999c.551 0 .999.449.999.999s-.448.999-.999.999zm11.405-6.02l1.997-3.459a.416.416 0 00-.152-.568.416.416 0 00-.568.152l-2.022 3.503C15.59 8.244 13.853 7.851 12 7.851s-3.59.393-5.137 1.073L4.841 5.421a.416.416 0 00-.568-.152.416.416 0 00-.152.568l1.997 3.459C3.702 10.565 2.3 12.349 2 14.4H22c-.3-2.051-1.702-3.835-4.118-5.079z" />
    </svg>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────
function AppStoreBtn({ large = false }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 bg-white text-black font-semibold rounded-2xl hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-xl shadow-black/30 ${
        large
          ? 'px-5 py-3 sm:px-8 sm:py-4'
          : 'px-5 py-2.5'
      }`}
    >
      <AppleLogo size={large ? 22 : 18} />
      <div className="text-left leading-tight">
        <div className="text-[10px] font-normal text-black/60 leading-none mb-0.5">
          Download on the
        </div>
        <div className={`font-bold leading-none ${large ? 'text-base sm:text-xl' : 'text-sm'}`}>
          App Store
        </div>
      </div>
    </a>
  );
}

function AndroidBtn({ large = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 bg-white/5 text-white/35 font-semibold rounded-2xl border border-white/10 cursor-not-allowed select-none ${
        large
          ? 'px-5 py-3 sm:px-8 sm:py-4'
          : 'px-5 py-2.5'
      }`}
    >
      <AndroidLogo size={large ? 22 : 18} />
      <div className="text-left leading-tight">
        <div className="text-[10px] font-normal leading-none mb-0.5">Coming Soon</div>
        <div className={`font-bold leading-none ${large ? 'text-base sm:text-xl' : 'text-sm'}`}>Android</div>
      </div>
    </div>
  );
}

// ── Phone Mockup ───────────────────────────────────────────────────────────
function PhoneMockup({ src, alt = '', style = {} }) {
  return (
    <div className="relative" style={style}>
      <div
        className="relative rounded-[44px] p-[10px]"
        style={{
          background: 'linear-gradient(145deg, #1f1f1f 0%, #0a0a0a 100%)',
          border: '1.5px solid rgba(255,255,255,0.13)',
          boxShadow:
            '0 60px 120px rgba(0,0,0,0.85), 0 0 80px rgba(16,185,129,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute z-20 rounded-full bg-black"
          style={{ top: 14, left: '50%', transform: 'translateX(-50%)', width: 82, height: 26 }}
        />
        {/* Screen */}
        <div className="rounded-[36px] overflow-hidden bg-black" style={{ aspectRatio: '9/19.5' }}>
          <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
        </div>
        {/* Home bar */}
        <div
          className="mx-auto mt-2 rounded-full"
          style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.22)' }}
        />
      </div>
    </div>
  );
}

// ── Scroll-reveal wrapper ──────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function App() {
  const [showSticky, setShowSticky] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(768);
  const touchStartX = useRef(null);

  const screenshots = [
    { src: screenOne,   label: 'Home Screen', desc: 'Find games happening near you' },
    { src: screenTwo,   label: 'Social',      desc: 'Connect with the local soccer community' },
    { src: screenThree, label: 'Stats',        desc: 'Track your games and progress' },
    { src: screenFour,  label: 'Profile',      desc: 'Build your soccer identity' },
  ];
  const n = screenshots.length;

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobileView = windowWidth < 640;

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) { delta < 0 ? nextSlide() : prevSlide(); }
    touchStartX.current = null;
  };

  const prevSlide = () => setCarouselIndex((i) => (i - 1 + n) % n);
  const nextSlide = () => setCarouselIndex((i) => (i + 1) % n);

  return (
    <div className="bg-[#060606] text-white font-sans antialiased overflow-x-hidden" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes float {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-18px); }
        }
        .float { animation: float 6s ease-in-out infinite; }

        .g-text {
          background: linear-gradient(130deg,#34d399,#10b981,#059669);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .glass {
          background:rgba(255,255,255,0.04);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
        }
        ::selection { background:rgba(16,185,129,0.3); }
      `}</style>

      {/* ── STICKY MOBILE CTA ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-safe-bottom"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
              paddingTop: 12,
              background:
                'linear-gradient(to top, rgba(6,6,6,1) 65%, rgba(6,6,6,0))',
            }}
          >
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold py-4 rounded-2xl text-base transition-all shadow-2xl shadow-emerald-500/40"
            >
              <AppleLogo size={20} />
              Download Free on App Store
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER — desktop only ─────────────────────────────────── */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-40 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-8 py-2 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center flex-shrink-0">
            <img src={jogoLogo} alt="Jogo" className="h-9 w-auto" />
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-white/50">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#screenshots" className="hover:text-white transition-colors">Screenshots</a>
            <a href="#why-jogo" className="hover:text-white transition-colors">Why Jogo</a>
            <a href="https://www.jogous.io/app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sign Up</a>
          </nav>

          <AppStoreBtn />
        </div>
      </header>

      <main>
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center pt-14 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-8 overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${soccerBg})`, opacity: 0.12 }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(16,185,129,0.18) 0%, transparent 70%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#060606]/50 via-transparent to-[#060606]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-6 items-center">
              {/* — Phone — first on mobile, right on desktop — */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex justify-center order-1 lg:order-2"
              >
                <div className="float">
                  <PhoneMockup
                    src={screenOne}
                    alt="Jogo App — pickup soccer near you"
                    style={{ width: 'min(200px, 52vw)' }}
                  />
                </div>
              </motion.div>

              {/* — Text — */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 glass border border-emerald-500/30 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-emerald-400 mb-5 sm:mb-7"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Now Available on iOS
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[2.4rem] leading-[1.08] sm:text-6xl lg:text-7xl font-black tracking-tight mb-4 sm:mb-6"
                >
                  Pickup Soccer.<br />
                  <span className="g-text">Anytime.</span>{' '}
                  <span className="g-text">Anywhere.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="text-base sm:text-xl text-white/55 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                >
                  Join local pickup games, meet players, and play for free.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                  className="flex flex-row items-center justify-center lg:justify-start gap-3 mb-6 sm:mb-8"
                >
                  <AppStoreBtn large />
                  <AndroidBtn large />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-xs sm:text-sm text-white/40"
                >
                  {['100% Free', 'No credit card', 'Join in 60 seconds'].map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-400 flex-shrink-0" />
                      {t}
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-4 text-center lg:text-left"
                >
                  <a
                    href="https://www.jogous.io/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-white/35 hover:text-emerald-400 transition-colors underline underline-offset-4"
                  >
                    Or sign up on the web app →
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ──────────────────────────────────────────── */}
        <section className="py-10 sm:py-14 px-4 sm:px-8 border-y border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="grid grid-cols-3 gap-3 sm:gap-12 text-center">
                {[
                  { value: '2,000+', label: 'Players' },
                  { value: '100+', label: 'Games Created' },
                  { value: '100%', label: 'Free' },
                ].map((s, i) => (
                  <div key={i} className="min-w-0">
                    <div className="text-xl xs:text-2xl sm:text-5xl font-black g-text mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{s.value}</div>
                    <div className="text-white/45 text-[11px] sm:text-base leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black mb-4">How It Works</h2>
              <p className="text-white/45 text-lg">From download to kickoff in under a minute</p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: MapPin,
                  title: 'Find Games',
                  desc: 'Open the app and see every pickup game near you on a live map. Know exactly where the action is before you leave.',
                },
                {
                  step: '02',
                  icon: Users,
                  title: 'Join Instantly',
                  desc: 'Tap to join, see who\'s playing, and coordinate with players in one tap. No emails, no forms.',
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'Play',
                  desc: 'Show up and play. No fees, no subscriptions, no pay walls. Just pure pickup soccer.',
                },
              ].map((step, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <div className="glass border border-white/[0.07] hover:border-emerald-500/25 rounded-3xl p-8 text-center h-full transition-colors group">
                    <div className="text-6xl font-black g-text mb-4 leading-none">{step.step}</div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <step.icon size={22} className="text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCREENSHOTS ───────────────────────────────────────────── */}
        <section id="screenshots" className="py-16 sm:py-24 px-4 sm:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black mb-4">Built for the Beautiful Game</h2>
              <p className="text-white/45 text-lg">Clean, fast, and designed for players</p>
            </Reveal>

            {/* Carousel */}
            <div className="flex items-center gap-3 sm:gap-6 justify-center">
              {/* Arrows hidden on mobile — swipe instead */}
              <button
                onClick={prevSlide}
                aria-label="Previous"
                className="hidden sm:flex flex-shrink-0 w-11 h-11 glass border border-white/10 rounded-full items-center justify-center hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Cards container */}
              <div
                className="relative flex-1 flex items-start justify-center overflow-hidden"
                style={{
                  height: isMobileView ? 'calc(55vw * 2.17 + 70px)' : 'min(580px, 100vw)',
                  maxWidth: 700,
                }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {screenshots.map((s, i) => {
                  const pos = (i - carouselIndex + n) % n;
                  const isActive = pos === 0;
                  const isNext  = pos === 1;
                  const isPrev  = pos === n - 1;

                  // On mobile show only the active card; on desktop show side cards
                  const showSide = !isMobileView && (isNext || isPrev);
                  const opacity  = isActive ? 1 : showSide ? 0.42 : 0;
                  const scale    = isActive ? 1 : 0.8;

                  let tx = '-50%';
                  if (!isMobileView) {
                    if (isNext) tx = 'calc(-50% + min(230px, 38vw))';
                    if (isPrev) tx = 'calc(-50% - min(230px, 38vw))';
                  }

                  return (
                    <div
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className="absolute top-0 left-1/2 cursor-pointer"
                      style={{
                        transform: `translateX(${tx}) scale(${scale})`,
                        opacity,
                        zIndex: isActive ? 30 : showSide ? 20 : 5,
                        transition: 'transform 0.52s cubic-bezier(0.4,0,0.2,1), opacity 0.52s cubic-bezier(0.4,0,0.2,1)',
                        width: isMobileView ? 'min(190px, 55vw)' : 'min(200px, 28vw)',
                        pointerEvents: isActive || showSide ? 'auto' : 'none',
                      }}
                    >
                      <PhoneMockup src={s.src} alt={s.label} />
                      {isActive && (
                        <motion.div
                          key={carouselIndex}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="text-center mt-4 sm:mt-5 px-2"
                        >
                          <div className="text-sm sm:text-base font-bold">{s.label}</div>
                          <div className="text-white/40 text-xs sm:text-sm mt-1">{s.desc}</div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={nextSlide}
                aria-label="Next"
                className="hidden sm:flex flex-shrink-0 w-11 h-11 glass border border-white/10 rounded-full items-center justify-center hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Swipe hint — mobile only */}
            <p className="text-center text-white/25 text-xs mt-3 sm:hidden">Swipe to explore</p>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === carouselIndex ? 28 : 8,
                    height: 8,
                    background: i === carouselIndex ? '#10b981' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY JOGO ──────────────────────────────────────────────── */}
        <section id="why-jogo" className="py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black mb-4">Why Jogo</h2>
              <p className="text-white/45 text-lg">Built because we needed it too</p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: MapPin,
                  grad: 'from-emerald-500 to-teal-500',
                  title: 'Never wonder where the game is',
                  desc: 'See every pickup game on a live map. No more group texts trying to figure out if there\'s a game tonight.',
                },
                {
                  icon: Users,
                  grad: 'from-blue-500 to-cyan-500',
                  title: 'Meet players, not strangers',
                  desc: 'View player profiles and skill levels before you show up. Know your team before kickoff.',
                },
                {
                  icon: Shield,
                  grad: 'from-purple-500 to-pink-500',
                  title: 'No pay-to-play',
                  desc: 'Jogo is 100% free. No subscriptions, no premium tiers. Soccer belongs to everyone.',
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <div className="glass border border-white/[0.07] hover:border-emerald-500/22 rounded-3xl p-8 h-full transition-colors group">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon size={26} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 leading-snug">{item.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── WORLD CUP ─────────────────────────────────────────────── */}
        <section className="relative py-20 sm:py-36 px-4 sm:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: `url(${soccerBg})` }}
            />
            <div className="absolute inset-0 bg-black/83" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16,185,129,0.12) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Reveal>
              <div className="text-6xl mb-7">⚽</div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
                Don't Just Watch<br />
                the World Cup.<br />
                <span className="g-text">Play.</span>
              </h2>
              <p className="text-white/55 text-xl mb-10 max-w-lg mx-auto">
                While the world watches, Jogo players are already on the field. Find local pickup games happening right now.
              </p>
              <AppStoreBtn large />
            </Reveal>
          </div>
        </section>

        {/* ── FOUNDER STORY ─────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="glass border border-white/[0.07] rounded-3xl overflow-hidden">
                {/* Photo */}
                <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={founderPhoto}
                    alt="Christopher and a friend after a Jogo game with the NYC skyline"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 35%' }}
                  />
                  {/* Gradient fade into card body */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                  {/* City badge */}
                  <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 flex items-center gap-2 glass border border-white/15 rounded-full px-3 py-1.5">
                    <span className="text-xs text-white/70 font-medium">📍 Jersey City, NJ</span>
                  </div>
                </div>

                {/* Text body */}
                <div className="p-7 sm:p-12">
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="text-xs font-bold text-white/35 tracking-widest uppercase">Built by Players</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-6">
                    Pickup soccer should be easy to find.<br />
                    <span className="g-text">So we built Jogo.</span>
                  </h2>

                  <div className="text-white/60 text-sm sm:text-base leading-relaxed max-w-2xl space-y-3">
                    <p>
                      Growing up in Jersey, we knew there were games happening everywhere — parks,
                      turf fields, school yards — but finding them was always random.
                    </p>
                    <p>
                      You had to know someone, be in the right group chat, or hope a friend texted you.
                    </p>
                    <p>
                      Jogo fixes that. Now you can open the app, see games near you, join in seconds,
                      and play with people who love the game too.
                    </p>
                    <p className="text-white/85 font-semibold">
                      Built in Jersey. Made for every player.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.07]">
                    <p className="text-white/30 text-xs mb-4 uppercase tracking-widest font-semibold">Built by Players</p>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { initials: 'CV', name: 'Christopher', note: null, grad: 'from-emerald-500 to-teal-500' },
                        { initials: 'IS', name: 'Israel',      note: null,           grad: 'from-blue-500 to-cyan-500' },
                        { initials: 'AD', name: 'Adriana',     note: null,           grad: 'from-purple-500 to-pink-500' },
                        { initials: 'JM', name: 'Jimmy',       note: null,           grad: 'from-orange-500 to-red-500' },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 bg-gradient-to-br ${p.grad}`}
                          >
                            {p.initials}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">{p.name}</div>
                            {p.note && <div className="text-white/35 text-xs">{p.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────── */}
        <section className="py-16 sm:py-28 px-4 sm:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Reveal>
              <div className="text-6xl mb-8">⚽</div>
              <h2 className="text-4xl sm:text-6xl font-black leading-tight mb-5">
                Your next game<br />
                <span className="g-text">is waiting.</span>
              </h2>
              <p className="text-white/45 text-xl mb-10">
                Download Jogo. Find a game. Play tonight.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <AppStoreBtn large />
                <AndroidBtn large />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] pt-10 pb-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-10">
            <div>
              <img src={jogoLogo} alt="Jogo" className="h-9 w-auto mb-3" />
              <p className="text-white/30 text-sm max-w-xs">
                Free pickup soccer finder. Built in New Jersey.
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-4">
              <AppStoreBtn />
              <div className="text-white/25 text-xs">Android coming soon</div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/35 mb-10">
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link to="/media" className="hover:text-white transition-colors">Media</Link>
            <Link to="/feedback" className="hover:text-white transition-colors">Feedback</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            <Link to="/policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/delete-account" className="hover:text-white transition-colors">Delete Account</Link>
            <a href="https://buymeacoffee.com/jogoapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Coffee size={13} /> Support Us
            </a>
          </nav>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/[0.06] text-xs text-white/25">
            <p>© {new Date().getFullYear()} Jogo. All rights reserved.</p>
            <p>Pioneered in New Jersey by players, for players.</p>
          </div>
        </div>
      </footer>

      {/* Bottom padding so sticky CTA doesn't overlap content on mobile */}
      <div className="h-24 md:hidden" />
    </div>
  );
}

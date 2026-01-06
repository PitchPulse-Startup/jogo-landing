// src/App.jsx

// --- IMPORTS ---
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Users,
  MapPin,
  TrendingUp,
  Sparkles,
  Play,
  Check,
  ArrowRight,
  Instagram,
  ChevronDown,
  ChevronUp,
  Globe,
  Smartphone,
  Target,
  BarChart3,
  MessageCircle,
  Clock,
  Shield,
  Award,
  Volume2,
  VolumeX,
  Coffee,
  Heart
} from 'lucide-react';

// --- ASSETS ---
import jogoLogo from './assets/jogo-logo2.png';
import howItWorksVideo from './assets/howitworks.mp4';
import liveScreenImage from './assets/Homejogo.png';
import gamesScreenImage from './assets/Gamesjogo.png';
import socialScreenImage from './assets/social.png';
import soccerFieldBg from './assets/soccer.jpeg';

// --- COMPONENTS ---
import AnimatedBackdrop from './components/AnimatedBackdrop';
import FloatingSparkles from './components/FloatingSparkles';

// --- Main App Component ---
export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // FAQ Data
  const faqData = [
    {
      question: "How does live field tracking work?",
      answer: "We use privacy-focused location technology to detect player activity at fields. When users arrive at a location, our system updates the field's activity status in real-time, so you always know where the action is."
    },
    {
      question: "Is Jogo really free?",
      answer: "Yes! Jogo is 100% free to use. No subscriptions, no hidden fees, no paywalls. We believe soccer should be accessible to everyone."
    },
    {
      question: "What if I'm new to pickup soccer?",
      answer: "Perfect! Filter games by skill level—from beginner-friendly kickabouts to competitive matches. You can also see who's attending and chat before you go."
    },
    {
      question: "How do I organize a game?",
      answer: "Creating a game takes seconds. Choose your field, set the time and skill level, and share with the community. Players can join, chat, and coordinate all within the app."
    },
    {
      question: "What cities is Jogo available in?",
      answer: "Jogo is expanding rapidly! We're currently live in select cities and adding new locations based on user demand. Check the app to see fields near you."
    },
    {
      question: "How do you protect user privacy?",
      answer: "Privacy is paramount. We only track location when you're actively using the app, and all data is anonymized. You control what information you share."
    }
  ];

  // Features Data
  const features = [
    {
      icon: MapPin,
      title: "Live Field Intelligence",
      description: "See real-time activity at every field in your area. Know exactly where games are happening before you leave.",
      color: "from-emerald-400 to-teal-400"
    },
    {
      icon: Users,
      title: "Smart Matchmaking",
      description: "Find games that match your skill level, location, and schedule. Our AI connects you with the perfect pickup game.",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: MessageCircle,
      title: "Built-In Chat",
      description: "Coordinate with players before, during, and after games. Build your soccer community effortlessly.",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Target,
      title: "Advanced Filters",
      description: "Filter by skill level, game type, distance, and more. Find exactly what you're looking for, every time.",
      color: "from-orange-400 to-red-400"
    }
  ];

  // Stats Data
  const stats = [
    { icon: Zap, value: "Real-Time", label: "Live Updates" },
    { icon: Users, value: "200+", label: "Active Players" },
    { icon: MapPin, value: "50+", label: "Fields Tracked" },
    { icon: TrendingUp, value: "24/7", label: "Game Discovery" }
  ];

  // How It Works Data
  const howItWorks = [
    {
      step: "01",
      title: "Open the App",
      description: "Launch Jogo and see live activity at nearby fields instantly",
      icon: Smartphone
    },
    {
      step: "02",
      title: "Find Your Game",
      description: "Browse pickup games or check which fields have active players",
      icon: Target
    },
    {
      step: "03",
      title: "Show Up & Play",
      description: "Head to the field and jump into the action. It's that simple.",
      icon: Play
    }
  ];

  // Menu handlers
  const closeMenu = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMenuClosing(false);
    }, 300);
  };

  const toggleMenu = () => {
    if (mobileMenuOpen) {
      closeMenu();
    } else {
      setMobileMenuOpen(true);
    }
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Feature rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCarouselIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.menu-container')) {
        closeMenu();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, mobileMenuOpen]);

  return (
    <div className="bg-black text-gray-200 font-sans antialiased overflow-x-hidden">
      {/* --- ENHANCED STYLES --- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { opacity: 0.8; box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes border-flow {
          0%, 100% { border-color: rgba(16, 185, 129, 0.5); }
          50% { border-color: rgba(59, 130, 246, 0.5); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-border-flow { animation: border-flow 3s ease infinite; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 8s ease infinite;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2);
        }

        .card-glow {
          position: relative;
          overflow: hidden;
        }

        .card-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .card-glow:hover::before {
          opacity: 1;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-10px) scale(0.95); }
        }

        .menu-enter { animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .menu-exit { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        .mobile-menu-item {
          opacity: 0;
          transform: translateY(10px);
          animation: slide-up 0.4s ease-out forwards;
        }

        .mobile-menu-item:nth-child(1) { animation-delay: 0.1s; }
        .mobile-menu-item:nth-child(2) { animation-delay: 0.15s; }
        .mobile-menu-item:nth-child(3) { animation-delay: 0.2s; }
        .mobile-menu-item:nth-child(4) { animation-delay: 0.25s; }
        .mobile-menu-item:nth-child(5) { animation-delay: 0.3s; }
        .mobile-menu-item:nth-child(6) { animation-delay: 0.35s; }
        .mobile-menu-item:nth-child(7) { animation-delay: 0.4s; }
        .mobile-menu-item:nth-child(8) { animation-delay: 0.45s; }

        /* 3D Carousel Styles */
        .carousel-container {
          perspective: 1200px;
          perspective-origin: 50% 50%;
        }

        .carousel-card {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .carousel-card-active {
          transform: translateX(0) translateZ(0) scale(1) rotateY(0deg);
          opacity: 1;
          z-index: 30;
        }

        .carousel-card-prev {
          transform: translateX(-40%) translateZ(-200px) scale(0.85) rotateY(25deg);
          opacity: 0.6;
          z-index: 20;
        }

        .carousel-card-next {
          transform: translateX(40%) translateZ(-200px) scale(0.85) rotateY(-25deg);
          opacity: 0.6;
          z-index: 20;
        }

        .carousel-card-hidden {
          transform: translateX(0) translateZ(-400px) scale(0.7);
          opacity: 0;
          pointer-events: none;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .carousel-card-prev {
            transform: translateX(-80%) translateZ(-150px) scale(0.75) rotateY(15deg);
            opacity: 0.3;
          }

          .carousel-card-next {
            transform: translateX(80%) translateZ(-150px) scale(0.75) rotateY(-15deg);
            opacity: 0.3;
          }
        }

        @keyframes indicator-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .indicator-active {
          animation: indicator-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* --- ANIMATED BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${soccerFieldBg})` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-emerald-950/30"></div>
        </div>

        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-float delay-200"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-float delay-400"></div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <a href="#" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={jogoLogo} alt="Jogo Logo" className="h-12 sm:h-14 w-auto" />
            </a>

            <div className="flex items-center gap-2 sm:gap-4 menu-container relative">
              <Link
                to="/blog"
                className="hidden md:flex items-center gap-2 glass-effect px-4 py-2 rounded-full border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 group"
              >
                <div className="relative">
                  <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-emerald-400 transition-colors">
                  New from the Team
                </span>
              </Link>

              <a
                href="https://JogoUs.app"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
              >
                <span className="hidden xs:inline">Launch App</span>
                <span className="xs:hidden">Launch</span>
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </a>

              <button
                onClick={toggleMenu}
                className="p-2.5 sm:p-3 text-gray-300 hover:text-emerald-400 transition-all duration-300 glass-effect rounded-full hover:scale-110"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {(mobileMenuOpen || menuClosing) && (
            <div className={`absolute top-full right-4 mt-2 w-56 bg-black/95 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden z-50 ${menuClosing ? 'menu-exit' : 'menu-enter'}`}>
              <div className="p-2 space-y-1">
                <Link to="/blog" onClick={closeMenu} className="md:hidden flex items-center justify-between text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">
                  <span>Blog / Updates</span>
                  <div className="relative">
                    <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  </div>
                </Link>
                <a href="#features" onClick={closeMenu} className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">Features</a>
                <a href="#how-it-works" onClick={closeMenu} className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">How It Works</a>
                <a href="#faq" onClick={closeMenu} className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">FAQ</a>
                <Link to="/blog" onClick={closeMenu} className="hidden md:block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">Blog</Link>
                <Link to="/media" onClick={closeMenu} className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">Media</Link>
                <Link to="/policy" onClick={closeMenu} className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">Policy</Link>
                <Link to="/terms" onClick={closeMenu} className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">Terms</Link>
                <Link to="/feedback" onClick={closeMenu} className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item">Feedback</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10">
        {/* --- HERO SECTION --- */}
        <section className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center max-w-5xl mx-auto">
              {/* Beta Badge */}
              <div className="inline-flex items-center gap-2 glass-effect px-5 py-2.5 rounded-full mb-8 animate-slide-up border border-emerald-500/30">
                <Sparkles size={18} className="text-emerald-400 animate-pulse-glow" />
                <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  NOW IN BETA • JOIN THE REVOLUTION
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 animate-slide-up delay-100">
                <span className="block text-white mb-2">The Future of</span>
                <span className="gradient-text">Pickup Soccer</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-400 mb-6 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-200">
                Real-time field intelligence. Instant connections. <br className="hidden sm:block" />
                <span className="text-emerald-400 font-semibold">Never play alone again.</span>
              </p>

              <p className="text-base sm:text-lg text-gray-500 mb-12 max-w-2xl mx-auto animate-slide-up delay-300">
                Jogo uses AI-powered technology to show you live field activity, match you with players, and build your local soccer community—all in real-time.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up delay-400">
                <a
                  href="https://JogoUs.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-10 py-5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 text-lg flex items-center justify-center gap-3"
                >
                  Launch App
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto glass-effect text-white font-semibold px-10 py-5 rounded-full transition-all duration-300 hover:bg-white/10 text-lg flex items-center justify-center gap-3 border border-white/20"
                >
                  <Play size={20} />
                  See How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 animate-slide-up delay-500">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-emerald-400" />
                  <span>100% Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-emerald-400" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-emerald-400" />
                  <span>Available on Web & Mobile</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-effect rounded-2xl p-6 text-center hover-lift card-glow animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <stat.icon size={32} className="mx-auto mb-4 text-emerald-400" />
                  <div className="text-3xl sm:text-4xl font-black gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                Powerful Features.<br />
                <span className="gradient-text">Effortless Experience.</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to find, join, and organize pickup soccer games in one intelligent platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-effect rounded-3xl p-8 hover-lift card-glow animate-slide-up cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- VIDEO SHOWCASE SECTION --- */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                See <span className="gradient-text">Jogo</span> In Action
              </h2>
              <p className="text-lg text-gray-400">
                Experience the future of pickup soccer
              </p>
            </div>

            <div className="flex justify-center">
              <div className="glass-effect rounded-3xl p-4 sm:p-6 hover-lift max-w-md w-full">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  >
                    <source src={howItWorksVideo} type="video/mp4" />
                  </video>

                  {/* Mute/Unmute Button */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 glass-effect p-3 rounded-full hover:bg-white/20 transition-all hover:scale-110 group z-10"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX size={24} className="text-white" />
                    ) : (
                      <Volume2 size={24} className="text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section id="how-it-works" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                Getting Started is <span className="gradient-text">Simple</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                From download to kickoff in under 60 seconds
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <div
                  key={index}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="glass-effect rounded-3xl p-8 h-full hover-lift card-glow">
                    {/* Step Number */}
                    <div className="text-6xl font-black gradient-text mb-4">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mb-6">
                      <step.icon size={28} className="text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>

                  {/* Connector Arrow */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight size={32} className="text-emerald-500/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 3D CAROUSEL SCREENSHOTS SECTION --- */}
        <section className="py-20 px-4 overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                Designed for <span className="gradient-text">Players</span>
              </h2>
              <p className="text-xl text-gray-400 mb-4">
                Beautiful, intuitive, and built for the beautiful game
              </p>
              <p className="text-sm text-gray-500">
                Swipe or click the arrows to explore
              </p>
            </div>

            {/* 3D Carousel Container */}
            <div className="carousel-container relative h-[600px] sm:h-[700px] md:h-[750px] mb-8">
              <div className="relative w-full h-full flex items-center justify-center">
                {[
                  {
                    img: liveScreenImage,
                    title: "Live Field Intelligence",
                    desc: "See real-time activity at every field",
                    gradient: "from-emerald-500 to-teal-500",
                    icon: MapPin
                  },
                  {
                    img: gamesScreenImage,
                    title: "Smart Game Discovery",
                    desc: "Find your perfect match instantly",
                    gradient: "from-blue-500 to-cyan-500",
                    icon: Target
                  },
                  {
                    img: socialScreenImage,
                    title: "Built-In Community",
                    desc: "Connect and coordinate with players",
                    gradient: "from-purple-500 to-pink-500",
                    icon: MessageCircle
                  }
                ].map((screen, index) => {
                  const position = (index - activeCarouselIndex + 3) % 3;
                  let positionClass = 'carousel-card-hidden';

                  if (position === 0) positionClass = 'carousel-card-active';
                  else if (position === 2) positionClass = 'carousel-card-prev';
                  else if (position === 1) positionClass = 'carousel-card-next';

                  return (
                    <div
                      key={index}
                      className={`carousel-card absolute ${positionClass} cursor-pointer`}
                      onClick={() => setActiveCarouselIndex(index)}
                      style={{
                        width: '320px',
                        maxWidth: '85vw'
                      }}
                    >
                      <div className="glass-effect rounded-3xl p-6 sm:p-8 card-glow h-full">
                        {/* Icon Badge */}
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${screen.gradient} flex items-center justify-center mb-4 mx-auto`}>
                          <screen.icon size={28} className="text-white" />
                        </div>

                        {/* Phone Mockup */}
                        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden mb-6 shadow-2xl border-2 border-white/10">
                          <img
                            src={screen.img}
                            alt={screen.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay gradient on inactive cards */}
                          {position !== 0 && (
                            <div className="absolute inset-0 bg-black/40"></div>
                          )}
                        </div>

                        {/* Title and Description */}
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-white mb-3">{screen.title}</h3>
                          <p className="text-gray-400 text-sm sm:text-base">{screen.desc}</p>
                        </div>

                        {/* Active Indicator */}
                        {position === 0 && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-glow"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 mt-20 sm:mt-0">
              {/* Previous Button */}
              <button
                onClick={() => setActiveCarouselIndex((prev) => (prev - 1 + 3) % 3)}
                className="glass-effect p-2 sm:p-4 rounded-full hover:bg-white/10 transition-all hover:scale-110 group"
                aria-label="Previous"
              >
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 group-hover:text-emerald-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2 sm:gap-3">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCarouselIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      activeCarouselIndex === index
                        ? 'w-8 sm:w-12 h-2 sm:h-3 bg-gradient-to-r from-emerald-500 to-teal-500 indicator-active'
                        : 'w-2 sm:w-3 h-2 sm:h-3 bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setActiveCarouselIndex((prev) => (prev + 1) % 3)}
                className="glass-effect p-2 sm:p-4 rounded-full hover:bg-white/10 transition-all hover:scale-110 group"
                aria-label="Next"
              >
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 group-hover:text-emerald-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Feature List */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              {[
                { icon: Zap, text: "Lightning Fast", color: "emerald" },
                { icon: Shield, text: "Privacy First", color: "blue" },
                { icon: Award, text: "Player Approved", color: "purple" }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glass-effect rounded-2xl p-6 text-center hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <feature.icon size={32} className={`mx-auto mb-3 text-${feature.color}-400`} />
                  <p className="text-white font-semibold">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS SECTION --- */}
        <section className="py-20 px-4 bg-gradient-to-b from-emerald-900/10 to-transparent">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                Players <span className="gradient-text">Love</span> Jogo
              </h2>
              <p className="text-xl text-gray-400">
                Join thousands of players already using Jogo
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "I love how easy it is! So much fun—I'll be back on the field playing ASAP. Jogo makes finding games effortless.",
                  author: "Jorge M.",
                  role: "Forward"
                },
                {
                  quote: "I've met so many cool people and can't wait to play and improve my skills. Perfect for beginners like me!",
                  author: "Jonathan",
                  role: "Defender"
                },
                {
                  quote: "It's so easy to just hop on, find a game, and play. Exactly what pickup soccer needed.",
                  author: "Steven",
                  role: "Midfielder"
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="glass-effect rounded-3xl p-8 hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} size={20} className="text-emerald-400 fill-emerald-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.author}</div>
                      <div className="text-gray-500 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section id="faq" className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                <span className="gradient-text">Questions?</span> Answered.
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to know about Jogo
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="glass-effect rounded-2xl overflow-hidden hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-all"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-white pr-4">
                      {faq.question}
                    </h3>
                    {openFAQ === index ? (
                      <ChevronUp className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {openFAQ === index && (
                    <div className="px-6 pb-6 border-t border-white/10">
                      <p className="text-gray-300 leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FINAL CTA SECTION --- */}
        <section className="py-32 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <div className="glass-effect rounded-3xl p-12 sm:p-16 border-2 border-emerald-500/30">
              <Sparkles size={48} className="mx-auto mb-6 text-emerald-400 animate-pulse-glow" />

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                Ready to Play?
              </h2>

              <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join the future of pickup soccer. <br className="hidden sm:block" />
                <span className="gradient-text font-semibold">Your next game is waiting.</span>
              </p>

              <a
                href="https://JogoUs.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-12 py-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 text-xl gap-3 mb-8"
              >
                Launch Jogo Now
                <ArrowRight size={24} className="animate-float" />
              </a>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-white/20">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Globe size={20} className="text-emerald-400" />
                  </div>
                  <span className="text-sm">Available on Web</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Smartphone size={20} className="text-blue-400" />
                  </div>
                  <span className="text-sm">Mobile Coming Soon</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-gray-400 mb-4">Stay connected with the community</p>
                <Link
                  to="/media"
                  className="inline-flex items-center justify-center gap-2 glass-effect text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-all text-sm border border-white/20"
                >
                  <Instagram size={18} />
                  Follow on Social Media
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- SUPPORT THE TEAM SECTION --- */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="glass-effect rounded-3xl p-8 sm:p-12 border border-emerald-500/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-6">
                <Coffee className="text-emerald-400" size={32} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Support the Team
              </h2>

              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                Jogo is built by a small team of <strong className="text-white">4 passionate soccer enthusiasts</strong> dedicated to making pickup soccer better for everyone. We keep Jogo <strong className="text-emerald-400">100% free</strong>—no subscriptions, no paywalls.
              </p>

              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                If you appreciate what we're building and want to help us keep the servers running and develop new features, consider buying us a coffee. Every contribution, big or small, helps us continue this journey.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://buymeacoffee.com/jogoapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/50 text-lg"
                >
                  <Coffee size={24} />
                  Buy Us a Coffee
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Heart size={16} className="text-red-400" />
                  <span>Thank you for supporting independent development</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <img src={jogoLogo} alt="Jogo" className="h-12 mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                The future of pickup soccer. Real-time field intelligence, smart matchmaking, and community-powered connections—all in one platform.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-emerald-400 transition-colors">How It Works</a></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">Blog</Link></li>
                <li><Link to="/feedback" className="text-gray-400 hover:text-emerald-400 transition-colors">Feedback</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://buymeacoffee.com/jogoapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors inline-flex items-center gap-1"
                  >
                    <Coffee size={14} />
                    Buy Us a Coffee
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/policy" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/media" className="text-gray-400 hover:text-emerald-400 transition-colors">Media Kit</Link></li>
                <li><Link to="/delete-account" className="text-gray-400 hover:text-emerald-400 transition-colors">Delete Account</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Jogo. All rights reserved. Built with ⚽ for players.</p>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <span className="text-emerald-400 animate-pulse-glow">❤️</span>
              <span>by the Jogo team</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

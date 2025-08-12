// src/App.jsx

// --- IMPORTS ---
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { db } from './firebase'; 
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"; 
import { Wifi, List, MessageSquare, CheckCircle, Instagram, LoaderCircle, Mail, ChevronDown, ChevronUp, Play, ArrowRight, Sparkles, FileText } from 'lucide-react';
import Text3D from './components/Text3D';
import FloatingSparkles from './components/FloatingSparkles';
import Blog from './Blog';

// --- ASSETS ---
import jogoLogo from './assets/jogo-logo2.png';
import jogoVideo from './assets/jogo-video.mp4';
import liveScreenImage from './assets/live.png';
import gamesScreenImage from './assets/games.png';
import socialScreenImage from './assets/social.png';
import soccerBackground from './assets/soccer.jpeg';

// --- Main App Component ---
export default function App() {
  // --- STATE MANAGEMENT ---
  const [activeFeature, setActiveFeature] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // --- NEW: State for the multi-step form ---
  const [email, setEmail] = useState('');
  const [submissionStep, setSubmissionStep] = useState('email'); // 'email', 'source', 'success'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // State for the second step
  const [source, setSource] = useState('');
  const [otherSource, setOtherSource] = useState('');
  const [firestoreId, setFirestoreId] = useState(null); // To store the ID for updating

  // --- NEW: FAQ State ---
  const [openFAQ, setOpenFAQ] = useState(null);


  // --- FAQ DATA ---
  const faqData = [
    {
      question: "How will Jogo know if the fields are packed?",
      answer: "We use location-based alerts to know when a player arrives at the field. This helps us keep an accurate count of how many people are currently there."
    },
    {
      question: "What if I'm new to soccer?",
      answer: "You can filter by skill level and game type — even choose between coed, women's, or men's games."
    },
    {
      question: "How will I know who is going?",
      answer: "Each game will have details showing who's going, the location, and a chat to talk with other players."
    },
    {
      question: "What if someone gets hurt?",
      answer: "Please note that participation in pickup games is voluntary and at your own risk. Jogo is not liable for any injuries or accidents that may occur during games."
    },
    {
      question: "Will there be goals, pennies, cones, or soccer balls provided?",
      answer: "Players can easily volunteer to bring optional items through the game detail screen. Once fulfilled, an icon will indicate the need has been met."
    },
    {
      question: "How do I know where the field is located?",
      answer: "Our directions feature lets you tap and get instant navigation using your preferred map app."
    }
  ];

  // --- FORM SUBMISSION HANDLER (Step 1: Email) ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const docRef = await addDoc(collection(db, "early-access-emails"), {
        email: email,
        submittedAt: serverTimestamp()
      });
      setFirestoreId(docRef.id); // Save the document ID
      setSubmissionStep('source'); // Move to the next step
    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: FORM SUBMISSION HANDLER (Step 2: Source) ---
  const handleSourceSubmit = async (e) => {
    e.preventDefault();
    if (source === 'Other' && !otherSource.trim()) {
      setErrorMessage('Please specify where you heard about us.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (firestoreId && source) {
        const docToUpdate = doc(db, 'early-access-emails', firestoreId);
        const finalSource = source === 'Other' ? otherSource.trim() : source;
        await updateDoc(docToUpdate, {
          source: finalSource,
        });
      }
      setSubmissionStep('success'); // All done, move to success!
    } catch (error) {
      console.error("Error updating document in Firestore: ", error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // --- FAQ TOGGLE HANDLER ---
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  
  // --- LAYOUT & SCROLLING EFFECTS ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    return () => {
       window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // --- CONTENT DATA & HELPERS ---
  const featureContent = {
      home: { icon: Wifi, title: "Live Field Activity", content: "Jogo uses real-time location data from users to detect activity at local fields. Know when games are happening and avoid empty or overcrowded parks—so you always show up at the right time.", screenImage: liveScreenImage },
      games: { icon: List, title: "Find & Join Games", content: "Discover pickup games organized by the community. Filter by skill, location, and time to find your perfect match.", screenImage: gamesScreenImage },
      community: { icon: MessageSquare, title: "Connect with Players", content: "Join the local soccer chat. Organize games, find new teammates, and talk about the beautiful game.", screenImage: socialScreenImage },
  };

  const renderFeatureContent = (key) => {
      const { icon: Icon, title, content } = featureContent[key];
      return (
          <>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 border transition-all duration-500 ${
                activeFeature === key 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-lg shadow-green-500/25' 
                  : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50'
              }`}>
                  <Icon className={`w-7 h-7 transition-colors duration-500 ${activeFeature === key ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">{title}</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto text-center">{content}</p>
          </>
      );
  };

  // Show blog page if selected
  if (currentPage === 'blog') {
    return <Blog onBackToMain={() => setCurrentPage('home')} />;
  }

  return (
    <div className="bg-black text-white font-sans antialiased overflow-x-hidden min-h-screen relative">
      {/* Modern CSS Styles */}
      <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeInLeft { 
          from { opacity: 0; transform: translateX(-30px); } 
          to { opacity: 1; transform: translateX(0); } 
        }
        @keyframes slideIn { 
          from { opacity: 0; transform: translateY(20px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes pulse { 
          0%, 100% { transform: scale(1); } 
          50% { transform: scale(1.05); } 
        }
        @keyframes glow { 
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); } 
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.8); } 
        }
        @keyframes soccerBallSpin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          25% { transform: rotateX(90deg) rotateY(180deg) rotateZ(45deg); }
          50% { transform: rotateX(180deg) rotateY(360deg) rotateZ(90deg); }
          75% { transform: rotateX(270deg) rotateY(540deg) rotateZ(135deg); }
          100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(180deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(5deg); }
          66% { transform: translateY(5px) rotate(-3deg); }
        }
        @keyframes heroGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-slide-in { animation: slideIn 0.6s ease-out forwards; }
        .animate-pulse-custom { animation: pulse 2s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-soccer-ball { animation: soccerBallSpin 8s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-hero-gradient { animation: heroGradient 8s ease infinite; background-size: 200% 200%; }
        
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
        
        .glass-card { 
          background: rgba(255, 255, 255, 0.03); 
          backdrop-filter: blur(20px); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .hover-lift { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .hover-lift:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); 
        }
      `}</style>
      
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Soccer Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" 
          style={{ backgroundImage: `url(${soccerBackground})` }}
        ></div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80"></div>
        
        {/* Floating Soccer Balls */}
        <div className="absolute top-[20%] left-[10%] w-6 h-6 bg-white/5 rounded-full animate-pulse-custom opacity-30"></div>
        <div className="absolute top-[60%] right-[15%] w-4 h-4 bg-white/5 rounded-full animate-pulse-custom animation-delay-400 opacity-20"></div>
        <div className="absolute bottom-[30%] left-[80%] w-5 h-5 bg-white/5 rounded-full animate-pulse-custom animation-delay-600 opacity-25"></div>
        
        {/* Enhanced Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse-custom"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-custom animation-delay-400"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-custom animation-delay-600"></div>
        <div className="absolute top-1/6 right-1/3 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl animate-pulse-custom animation-delay-200"></div>
      </div>

      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 group">
            <img src={jogoLogo} alt="Jogo Logo" className="h-12 sm:h-14 md:h-16 w-auto transition-transform duration-300 group-hover:scale-105" />
          </a>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentPage('blog')}
              className="flex items-center gap-1 sm:gap-2 glass-card border border-white/20 text-white font-semibold px-2 sm:px-4 py-2 rounded-full hover:border-green-400/50 hover:bg-white/5 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Blog</span>
            </button>
            <a href="#signup" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 text-xs sm:text-sm lg:text-base">
              Join Newsletter
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Revolutionary Hero Section */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-40 sm:pt-20 relative">
          {/* Subtle Floating Sparkles */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <FloatingSparkles />
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] mb-8 animate-fade-in-up animation-delay-200">
              <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-hero-gradient">
                Stop Searching.
              </span>
              <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent animate-hero-gradient">
                Start Playing.
              </span>
            </h1>
            
            {/* Enhanced Description */}
            <div className="max-w-4xl mx-auto mb-12 animate-fade-in-up animation-delay-400 text-center">
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-6 mx-auto">
                Your <span className="text-green-400 font-semibold">free</span> local soccer companion that connects you to pickup games in your neighborhood.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>100% Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Local Community Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Real-time Updates</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up animation-delay-600">
              <a href="#features" className="group relative bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30 text-base sm:text-lg w-full sm:w-auto text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">
                  Discover Features
                  <ArrowRight className="inline ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
              <a href="#signup" className="group relative glass-card border-2 border-white/20 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:border-green-400/50 hover:bg-white/5 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg w-full sm:w-auto text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">
                  Join Newsletter
                  <ArrowRight className="inline ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </div>
            
            {/* Stats Grid */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-600">
              <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 hover-lift">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">10K+</div>
                <div className="text-gray-400 text-xs sm:text-sm">Players Ready</div>
              </div>
              <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 hover-lift">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-gray-400 text-xs sm:text-sm">Fields Mapped</div>
              </div>
              <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 hover-lift">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-gray-400 text-xs sm:text-sm">Live Tracking</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-blue-400 mb-6 border border-blue-500/30">
                <Sparkles className="w-4 h-4" />
                Revolutionary Features
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Experience Soccer<br />Like Never Before
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto text-center">
                Connecting local soccer communities with zero fees and maximum fun
              </p>
            </div>

            {/* Mobile Layout - Stacked */}
            <div className="flex flex-col items-center lg:hidden">
              {/* Interactive Phone Mockup */}
              <div className="flex flex-col items-center mb-12">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] bg-gradient-to-b from-zinc-800 to-zinc-900 border-4 border-zinc-700 rounded-[45px] sm:rounded-[50px] shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-6 sm:h-7 bg-zinc-900 rounded-b-2xl"></div>
                    <div className="absolute inset-0 p-3 sm:p-4">
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black rounded-[35px] sm:rounded-[40px] overflow-hidden relative border border-zinc-700">
                        {Object.entries(featureContent).map(([key, { screenImage }]) => (
                          <img 
                            key={key} 
                            src={screenImage} 
                            alt={`${key} screen`} 
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                              activeFeature === key ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Tabs - Mobile */}
              <div className="w-full max-w-4xl">
                <div className="flex gap-3 justify-center mb-12 overflow-x-auto pb-2 pt-2 px-4">
                  {Object.entries(featureContent).map(([key, { icon: Icon, title }]) => (
                    <button 
                      key={key} 
                      onClick={() => setActiveFeature(key)} 
                      className={`flex flex-col items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-4 rounded-xl transition-all duration-300 hover-lift min-w-[80px] sm:min-w-[120px] ${
                        activeFeature === key 
                          ? 'glass-card border-green-400/40 bg-green-500/10' 
                          : 'glass-card border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${activeFeature === key ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className="text-xs sm:text-sm font-medium text-center">{title}</span>
                    </button>
                  ))}
                </div>
                
                {/* Feature Content - Mobile */}
                <div className="text-center px-4">
                  <div className={`transition-all duration-500 ${
                    activeFeature ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    {activeFeature && renderFeatureContent(activeFeature)}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Side by Side */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:max-w-7xl lg:mx-auto">
              {/* Left Side - Feature Tabs and Content */}
              <div className="space-y-8">
                {/* Feature Tabs - Desktop */}
                <div className="space-y-4">
                  {Object.entries(featureContent).map(([key, { icon: Icon, title }]) => (
                    <button 
                      key={key} 
                      onClick={() => setActiveFeature(key)} 
                      className={`w-full flex items-center gap-4 p-6 rounded-xl transition-all duration-300 hover-lift text-left ${
                        activeFeature === key 
                          ? 'glass-card border-green-400/40 bg-green-500/10' 
                          : 'glass-card border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        activeFeature === key 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-zinc-800/50'
                      }`}>
                        <Icon className={`w-6 h-6 ${activeFeature === key ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <span className="text-lg font-semibold text-white">{title}</span>
                    </button>
                  ))}
                </div>
                
                {/* Feature Content - Desktop */}
                <div className="text-left">
                  <div className={`transition-all duration-500 ${
                    activeFeature ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    {activeFeature && (
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-white">{featureContent[activeFeature]?.title}</h3>
                        <p className="text-gray-400 text-lg leading-relaxed">{featureContent[activeFeature]?.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Phone Mockup */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative w-[320px] h-[640px] bg-gradient-to-b from-zinc-800 to-zinc-900 border-4 border-zinc-700 rounded-[50px] shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-zinc-900 rounded-b-2xl"></div>
                    <div className="absolute inset-0 p-4">
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black rounded-[40px] overflow-hidden relative border border-zinc-700">
                        {Object.entries(featureContent).map(([key, { screenImage }]) => (
                          <img 
                            key={key} 
                            src={screenImage} 
                            alt={`${key} screen`} 
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                              activeFeature === key ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Video Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-purple-400 mb-6 border border-purple-500/30">
                <Play className="w-4 h-4" />
                See It In Action
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Built for the<br />Beautiful Game
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto text-center">
                No fees, no commitments — just pure passion for soccer
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto group">
              <div className="absolute -inset-8 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative glass-card rounded-3xl overflow-hidden border-2 border-white/20 group-hover:border-green-400/30 transition-all duration-500">
                <video 
                  className="w-full aspect-video object-cover" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src={jogoVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Community Highlights Section */}
        <section className="py-20 sm:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 via-transparent to-blue-900/10"></div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-green-400 mb-6 border border-green-500/30">
                <Sparkles className="w-4 h-4" />
                Join the Movement
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  What Beta Testers<br />Are Saying
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto text-center">
                Real feedback from players who tested Jogo and experienced the future of pickup soccer
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-2">
              <div className="glass-card p-6 rounded-2xl border border-white/10 hover-lift mt-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Miguel, 24</h4>
                    <p className="text-gray-400 text-sm">Beta Tester • Austin, TX</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "The app feels so smooth and intuitive. I love how I can see live field activity and jump into games instantly. This is exactly what pickup soccer needed!"
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/10 hover-lift mt-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Sofia, 28</h4>
                    <p className="text-gray-400 text-sm">Beta Tester • Miami, FL</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "I tested it for 2 weeks and the user experience is incredible. The real-time updates and community features make organizing games effortless. Can't wait for the full launch!"
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/10 hover-lift mt-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">J</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">James, 31</h4>
                    <p className="text-gray-400 text-sm">Beta Tester • Seattle, WA</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "During the beta, I was blown away by how polished everything felt. The interface is clean, fast, and actually makes finding games fun. This will change everything!"
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="glass-card p-8 rounded-2xl border-2 border-green-400/20 max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Be Part of Something Bigger
                  </span>
                </h3>
                <p className="text-gray-300 mb-6 text-lg">
                  Join thousands of players building the future of pickup soccer in their neighborhoods
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="#signup" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-8 py-4 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30">
                    Join Newsletter
                  </a>
                  <a href="https://www.instagram.com/jogo.us/" target="_blank" rel="noopener noreferrer" className="glass-card border-2 border-white/20 text-white font-semibold px-8 py-4 rounded-full hover:border-green-400/50 hover:bg-white/5 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                    <Instagram size={20} />
                    Follow Our Journey
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Signup Section */}
        <section id="signup" className="py-20 sm:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-emerald-900/20 to-teal-900/20"></div>
          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="max-w-2xl mx-auto">
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-green-400 mb-6 border border-green-500/30">
                  <Sparkles className="w-4 h-4" />
                  {submissionStep === 'email' ? 'Launching Soon' : submissionStep === 'source' ? 'Almost There!' : 'Welcome Aboard!'}
                </div>
                
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                    {submissionStep === 'source' ? "One Last Question" : submissionStep === 'success' ? "You're In!" : "Join the Revolution"}
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300">
                  {submissionStep === 'email' && "Get notified the moment Jogo launches and be first to download"}
                  {submissionStep === 'source' && "Help us understand our community better"}
                  {submissionStep === 'success' && "You'll be the first to know when we launch!"}
                </p>
              </div>

              <div className="flex flex-col items-center gap-8">
                <div className="w-full max-w-lg">
                  
                  {/* Success State */}
                  {submissionStep === 'success' && (
                    <div className="glass-card border-2 border-green-400/40 p-8 rounded-2xl animate-slide-in">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                        <CheckCircle size={32} className="text-white" />
                      </div>
                      <h3 className="font-bold text-2xl mb-4">You're on the list!</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Thanks for joining! We'll notify you the moment Jogo is available for download. Get ready to revolutionize your pickup soccer experience.
                      </p>
                    </div>
                  )}
                  
                  {/* Email Form */}
                  {submissionStep === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-6 animate-fade-in-up">
                      <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          disabled={loading}
                          className={`w-full glass-card border-2 text-white placeholder-gray-400 pl-16 pr-6 py-5 rounded-2xl focus:outline-none transition-all duration-300 text-lg ${
                            errorMessage 
                              ? 'border-red-400/50 focus:border-red-400' 
                              : 'border-white/20 focus:border-green-400/60'
                          }`}
                          required
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-8 py-5 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? <LoaderCircle size={24} className="animate-spin mx-auto" /> : 'Join Newsletter'}
                      </button>
                    </form>
                  )}

                  {/* Source Form */}
                  {submissionStep === 'source' && (
                    <form onSubmit={handleSourceSubmit} className="space-y-6 animate-fade-in-up">
                      <div className="space-y-3">
                        {['Instagram', 'TikTok', 'LinkedIn', 'Reddit', 'Other'].map(option => (
                          <label 
                            key={option} 
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
                              source === option 
                                ? 'glass-card border-green-400/40 bg-green-500/10' 
                                : 'glass-card border-white/20 hover:bg-white/5'
                            }`}
                          >
                            <input
                              type="radio"
                              name="source"
                              value={option}
                              checked={source === option}
                              onChange={() => setSource(option)}
                              className="w-5 h-5 text-green-500 border-2 border-gray-400"
                            />
                            <span className="ml-4 text-lg font-medium">{option}</span>
                          </label>
                        ))}
                        {source === 'Other' && (
                          <input
                            type="text"
                            value={otherSource}
                            onChange={(e) => setOtherSource(e.target.value)}
                            placeholder="Please specify..."
                            className="w-full glass-card border-2 border-white/20 text-white placeholder-gray-400 px-6 py-4 rounded-xl focus:border-green-400/60 focus:outline-none transition-all duration-300 text-lg"
                          />
                        )}
                      </div>
                      
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setSubmissionStep('success')}
                          className="w-1/2 glass-card border-2 border-white/20 text-white font-semibold px-6 py-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                        >
                          Skip
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !source}
                          className="w-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loading ? <LoaderCircle size={20} className="animate-spin mx-auto" /> : 'Complete'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
                
                {/* Error Message */}
                {errorMessage && (
                  <div className="glass-card border-2 border-red-400/40 text-red-300 p-4 rounded-xl max-w-md animate-slide-in">
                    <p className="font-medium">{errorMessage}</p>
                  </div>
                )}

                {/* Social Links */}
                {submissionStep !== 'success' && (
                  <div className="w-full max-w-md">
                    <div className="flex items-center gap-6 mb-6">
                      <hr className="flex-1 border-white/20" />
                      <span className="text-gray-400 font-medium">Stay Connected</span>
                      <hr className="flex-1 border-white/20" />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">Follow us for exclusive updates and behind-the-scenes content</p>
                      <a 
                        href="https://www.instagram.com/jogo.us/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 glass-card border-2 border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:border-purple-400/50 hover:bg-white/5 transition-all duration-300 transform hover:scale-105 hover-lift"
                      >
                        <Instagram size={20} />
                        <span>Follow on Instagram</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-blue-400 mb-6 border border-blue-500/30">
                  <MessageSquare className="w-4 h-4" />
                  Questions Answered
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Frequently Asked<br />Questions
                  </span>
                </h2>
                <p className="text-xl text-gray-400 text-center">
                  Everything you need to know about revolutionizing your soccer experience
                </p>
              </div>
              
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`glass-card border-2 rounded-2xl overflow-hidden transition-all duration-500 hover-lift ${
                      openFAQ === index 
                        ? 'border-green-400/40 bg-green-500/5' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 text-left flex justify-between items-start group"
                    >
                      <h3 className={`text-base sm:text-lg lg:text-xl font-bold pr-4 sm:pr-6 transition-colors duration-300 ${
                        openFAQ === index ? 'text-green-300' : 'text-white group-hover:text-green-200'
                      }`}>
                        {faq.question}
                      </h3>
                      <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 flex-shrink-0 ${
                        openFAQ === index ? 'rotate-180 text-green-400' : 'text-gray-400'
                      }`} />
                    </button>
                    
                    {openFAQ === index && (
                      <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 animate-slide-in">
                        <div className="pt-4 sm:pt-6 border-t border-green-400/20">
                          <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <div className="glass-card p-8 rounded-2xl border-2 border-white/20 hover-lift">
                  <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                  <p className="text-gray-400 mb-6 text-lg">We're here to help! Reach out for personalized support.</p>
                  <a 
                    href="https://www.instagram.com/jogo.us/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                  >
                    <Instagram size={20} />
                    <span>Message us on Instagram</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="relative z-10">
        <div className="glass-card border-t-2 border-white/20">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <img src={jogoLogo} alt="Jogo Logo" className="h-8 w-auto opacity-80" />
                <div>
                  <div className="font-bold text-white">Jogo</div>
                  <div className="text-xs text-gray-500">Revolutionizing pickup soccer</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.instagram.com/jogo.us/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-card border border-white/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/30 transition-all duration-300 hover:scale-110"
                >
                  <Instagram size={16} />
                </a>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Jogo. All Rights Reserved.
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Made with <span className="text-red-400">❤️</span> by the Jogo team
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
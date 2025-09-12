// src/App.jsx

// --- IMPORTS ---
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"; 
import { Wifi, List, MessageSquare, CheckCircle, Instagram, LoaderCircle, Mail, ChevronDown, ChevronUp } from 'lucide-react';

// --- ASSETS ---
import jogoLogo from './assets/jogo-logo2.png';
import jogoVideo from './assets/jogo-video.mp4';
import liveScreenImage from './assets/Homejogo.png';
import gamesScreenImage from './assets/Gamesjogo.png';
import socialScreenImage from './assets/social.png';
import soccerFieldBg from './assets/soccer.jpeg';

// --- COMPONENTS ---
import AnimatedBackdrop from './components/AnimatedBackdrop';

// --- Main App Component ---
export default function App() {
  // --- STATE MANAGEMENT ---
  const [activeFeature, setActiveFeature] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);

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

  const featureRefs = {
      home: useRef(null),
      games: useRef(null),
      community: useRef(null),
  };

  // --- FAQ DATA ---
  const faqData = [
    {
      question: "How will Jogo know if the fields are packed?",
      answer: "We use location-based alerts to know when a player arrives at the field. This helps us keep an accurate count of how many people are currently there."
    },
    {
      question: "What if I'm new to soccer?",
      answer: "You can filter by skill level and game type — even choose between coed, women’s, or men’s games."
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

  // --- MENU CLOSE HANDLER ---
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
  
  // --- LAYOUT & SCROLLING EFFECTS ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Click outside to close menu
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.menu-container')) {
        closeMenu();
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    let observer;
    if (!isMobile) {
      observer = new IntersectionObserver(
          (entries) => entries.forEach(entry => {
              if (entry.isIntersecting) setActiveFeature(entry.target.dataset.feature);
          }),
          { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );
      Object.values(featureRefs).forEach(ref => {
          if(ref.current) observer.observe(ref.current);
      });
    }
    
    return () => {
       window.removeEventListener('resize', checkMobile);
       document.removeEventListener('mousedown', handleClickOutside);
       if (observer) {
         Object.values(featureRefs).forEach(ref => {
             if (ref.current) observer.unobserve(ref.current);
         });
       }
    };
  }, [isMobile, mobileMenuOpen]);

  // --- CONTENT DATA & HELPERS (Unchanged) ---
  const featureContent = {
      home: { icon: Wifi, title: "Live Field Activity", content: "Jogo uses real-time location data from users to detect activity at local fields. Know when games are happening and avoid empty or overcrowded parks—so you always show up at the right time.", screenImage: liveScreenImage },
      games: { icon: List, title: "Find & Join Games", content: "Discover pickup games organized by the community. Filter by skill, location, and time to find your perfect match.", screenImage: gamesScreenImage },
      community: { icon: MessageSquare, title: "Connect with Players", content: "Join the local soccer chat. Organize games, find new teammates, and talk about the beautiful game.", screenImage: socialScreenImage },
  };

  const renderFeatureContent = (key) => {
      const { icon: Icon, title, content } = featureContent[key];
      return (
          <>
              <div className={`inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-white/5 rounded-xl mb-4 sm:mb-6 border border-white/10 transition-all duration-300 ${activeFeature === key ? 'bg-emerald-500/20 border-emerald-500/30 scale-110' : ''}`}>
                  <Icon className={`w-5 sm:w-6 h-5 sm:h-6 transition-colors duration-300 ${activeFeature === key ? 'text-emerald-400' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{title}</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">{content}</p>
          </>
      );
  };

  return (
    <div className="bg-black text-gray-200 font-sans antialiased">
      {/* --- STYLES (Unchanged) --- */}
      <style>{`
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
            .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
            .animation-delay-4000 { animation-delay: -4s; }
            
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            
            @keyframes slideUp {
              from {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
              to {
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
              }
            }
            
            .menu-enter {
              animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            .menu-exit {
              animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            .mobile-menu-item {
              opacity: 0;
              transform: translateY(10px);
              animation: fade-in-up 0.4s ease-out forwards;
            }
            
            .mobile-menu-item:nth-child(1) { animation-delay: 0.1s; }
            .mobile-menu-item:nth-child(2) { animation-delay: 0.15s; }
            .mobile-menu-item:nth-child(3) { animation-delay: 0.2s; }
            .mobile-menu-item:nth-child(4) { animation-delay: 0.25s; }
      `}</style>
      
      {/* --- ANIMATED BACKDROP --- */}
      <AnimatedBackdrop />
      
      {/* --- BACKGROUND & HEADER --- */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${soccerFieldBg})` }}>
          <div className="absolute inset-0 w-full h-full bg-black/70"></div>
          <div className="absolute top-[20%] left-[5%] sm:left-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-900/30 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-[40%] right-[5%] sm:right-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-slate-800/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-slate-900/80 to-transparent"></div>
      </div>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-emerald-500/20">
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <img src={jogoLogo} alt="Jogo Logo" className="h-14 sm:h-16 w-auto" />
          </a>
          
          <div className="flex items-center gap-3 menu-container relative">
            <button 
              onClick={toggleMenu}
              className="p-3 text-gray-300 hover:text-emerald-400 transition-all duration-300 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10"
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
            
            <a href="#signup" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 text-xs sm:text-sm">
              Get Early Access
            </a>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        {(mobileMenuOpen || menuClosing) && (
          <div className={`absolute top-full right-4 mt-2 w-48 bg-black/95 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50 ${menuClosing ? 'menu-exit' : 'menu-enter'}`}>
            <div className="p-2 space-y-1">
              <a 
                href="#features" 
                onClick={closeMenu}
                className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item"
              >
                Features
              </a>
              <a 
                href="#faq" 
                onClick={closeMenu}
                className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item"
              >
                FAQ
              </a>
              <Link 
                to="/blog" 
                onClick={closeMenu}
                className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item"
              >
                Blog
              </Link>
              <Link 
                to="/media" 
                onClick={closeMenu}
                className="block text-gray-300 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 text-sm font-medium py-3 px-4 rounded-lg mobile-menu-item"
              >
                Media
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* --- HERO & FEATURES SECTIONS (Unchanged) --- */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center pt-16 sm:pt-20 px-4 sm:px-0">
          <div className="container mx-auto px-4 sm:px-6">
             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 leading-tight mb-8 sm:mb-12 pb-2 animate-fade-in-up">
               Stop Searching. <br /> Start Playing.
             </h1>
             <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 px-4 sm:px-0 animate-fade-in-up animation-delay-200">
               Jogo is the first app to show you live field traffic, connect you to pickup games, and build your local soccer community.
             </p>
             <a href="#features" className="bg-emerald-500 text-black font-bold px-6 sm:px-8 py-3 rounded-full hover:bg-emerald-400 transition-transform transform hover:scale-105 shadow-2xl shadow-emerald-500/20 animate-fade-in-up animation-delay-400 text-sm sm:text-base">
               See How It Works
             </a>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-24 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-start">
                    <div className="md:sticky md:top-32 h-auto md:h-[calc(100vh-8rem)] flex flex-col items-center">
                        <div className="relative w-[240px] sm:w-[280px] md:w-[320px] lg:w-[340px] h-[480px] sm:h-[560px] md:h-[640px] lg:h-[680px] bg-zinc-800 border-3 md:border-4 border-zinc-900 rounded-[35px] sm:rounded-[40px] md:rounded-[50px] shadow-2xl shadow-black/60">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 md:w-36 h-4 sm:h-5 md:h-6 bg-zinc-900 rounded-b-xl z-20"></div>
                            <div className="absolute inset-0 p-2 md:p-3">
                                <div className="w-full h-full bg-black rounded-[28px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden relative">
                                    {Object.entries(featureContent).map(([key, { screenImage }]) => (
                                        <img key={key} src={screenImage} alt={`${key} screen mockup`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${activeFeature === key ? 'opacity-100' : 'opacity-0'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="md:hidden w-full mt-6 text-center">
                            <div className="flex gap-2 justify-center">
                                {Object.entries(featureContent).map(([key, { icon: Icon, title }]) => (
                                    <button key={key} onClick={() => setActiveFeature(key)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 w-20 ${ activeFeature === key ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}>
                                        <Icon className="w-4 h-4" />
                                        <span className="text-xs font-medium">{title.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-8 px-4">
                                {activeFeature && renderFeatureContent(activeFeature)}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block pt-24 space-y-80 pb-[50vh]">
                        {Object.entries(featureContent).map(([key]) => (
                             <div key={key} ref={featureRefs[key]} data-feature={key} className={`transition-opacity duration-500 ${activeFeature === key ? 'opacity-100' : 'opacity-30'}`}>
                                {renderFeatureContent(key)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-16 sm:py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 text-center">
                 <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4 sm:px-0">Built for the Beautiful Game.</h2>
                 <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">No fees. No commitments. Just football.</p>
                 <div className="relative aspect-video max-w-4xl mx-auto rounded-xl sm:rounded-2xl shadow-2xl shadow-black/30 overflow-hidden ring-1 ring-white/10">
                    <video className="w-full h-full object-cover" autoPlay loop muted playsInline poster="https://placehold.co/1920x1080/0A0A0A/10B981?text=JOGO">
                        <source src={jogoVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                  </div>
            </div>
        </section>

        {/* --- REFINED SIGNUP SECTION (NOW WITH MULTI-STEP) --- */}
        <section id="signup" className="py-16 sm:py-20 md:py-32 bg-gradient-to-t from-emerald-900/30 via-emerald-900/10 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-xl mx-auto px-4 sm:px-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
                {submissionStep === 'source' ? "One last question..." : "Get Early Access!"}
              </h2>
              <p className="text-gray-400 mt-4 sm:mt-5 mb-8 text-base sm:text-lg">
                {submissionStep === 'email' && "Enter your email and we’ll send you instructions soon on how to gain early access, along with additional insider details."}
                {submissionStep === 'source' && "We're curious, where did you hear about us? (This is optional!)"}
              </p>
              
              <div className="flex flex-col items-center gap-6">
                  {/* Container prevents layout shift when switching between form and success message */}
                  <div className="min-h-[10rem] flex flex-col justify-center items-center w-full">
                    
                    {/* STEP 3: SUCCESS MESSAGE */}
                    {submissionStep === 'success' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-lg text-center animate-fade-in-up w-full max-w-sm">
                        <h3 className="font-bold text-lg flex items-center justify-center gap-2"><CheckCircle size={22} /> You're on the list!</h3>
                        <p className="text-sm text-emerald-400/80 mt-1">We'll email you on launch day. Thanks for the support!</p>
                      </div>
                    )}
                    
                    {/* STEP 1: EMAIL FORM */}
                    {submissionStep === 'email' && (
                      <form onSubmit={handleEmailSubmit} className="w-full max-w-sm flex flex-col items-center gap-2 animate-fade-in-up">
                        <div className="relative w-full">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            disabled={loading}
                            className={`w-full bg-white/5 border text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-full focus:ring-2 focus:outline-none transition-all duration-300 ${errorMessage ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 focus:ring-emerald-500'}`}
                            required
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="mt-4 w-full inline-flex items-center justify-center bg-emerald-500 text-black font-bold px-6 py-3 rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 transform hover:scale-105 disabled:bg-emerald-800 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                          {loading ? <LoaderCircle size={24} className="animate-spin" /> : 'Get Notified'}
                        </button>
                      </form>
                    )}

                    {/* STEP 2: SOURCE FORM */}
                    {submissionStep === 'source' && (
                        <form onSubmit={handleSourceSubmit} className="w-full max-w-sm flex flex-col items-center gap-2 animate-fade-in-up">
                           <div className="w-full space-y-2 text-left">
                                {['Instagram', 'TikTok', 'LinkedIn', 'Reddit', 'Other'].map(option => (
                                    <label key={option} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${source === option ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}>
                                        <input
                                            type="radio"
                                            name="source"
                                            value={option}
                                            checked={source === option}
                                            onChange={() => setSource(option)}
                                            className="w-4 h-4 text-emerald-500 bg-transparent border-gray-500 focus:ring-emerald-500 focus:ring-2"
                                        />
                                        <span className="ml-3 text-white">{option}</span>
                                    </label>
                                ))}
                                {source === 'Other' && (
                                    <input
                                        type="text"
                                        value={otherSource}
                                        onChange={(e) => setOtherSource(e.target.value)}
                                        placeholder="Please specify..."
                                        className="w-full mt-2 bg-white/5 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300"
                                    />
                                )}
                           </div>
                           <div className="flex gap-2 w-full mt-4">
                               <button
                                 type="button"
                                 onClick={() => setSubmissionStep('success')}
                                 className="w-1/2 inline-flex items-center justify-center bg-white/10 text-white font-bold px-6 py-3 rounded-full hover:bg-white/20 transition-all"
                               >
                                 Skip
                               </button>
                               <button
                                 type="submit"
                                 disabled={loading || !source}
                                 className="w-1/2 inline-flex items-center justify-center bg-emerald-500 text-black font-bold px-6 py-3 rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 transform hover:scale-105 disabled:bg-emerald-800 disabled:text-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
                               >
                                 {loading ? <LoaderCircle size={24} className="animate-spin" /> : 'Submit'}
                               </button>
                           </div>
                        </form>
                    )}
                  </div>
                  
                  {/* We only show the error message if there is one, regardless of step */}
                  {errorMessage && (
                    <p className="text-red-400 text-sm mt-1">{errorMessage}</p>
                  )}
                
                {/* --- DIVIDER & MEDIA LINK (Only show if not on success step) --- */}
                {submissionStep !== 'success' && (
                    <>
                        <div className="flex items-center gap-4 w-full max-w-xs">
                        <hr className="w-full border-t border-white/10" />
                        <span className="text-gray-500 text-xs font-medium">OR</span>
                        <hr className="w-full border-t border-white/10" />
                        </div>
                        
                        <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-gray-400">For live updates & content:</p>
                        <Link 
                            to="/media"
                            className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition-all text-sm"
                        >
                            <Instagram size={16} />
                            Follow on Social Media
                        </Link>
                        </div>
                    </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- NEW: FAQ SECTION --- */}
        <section id="faq" className="py-16 sm:py-20 md:py-32 bg-gradient-to-t from-slate-900/50 to-transparent">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                  Got questions? We've got answers. Here's everything you need to know about Jogo.
                </p>
              </div>
              
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 py-4 sm:px-8 sm:py-6 text-left flex justify-between items-center hover:bg-white/5 transition-all duration-300"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-white pr-4">
                        {faq.question}
                      </h3>
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openFAQ === index && (
                      <div className="px-6 pb-4 sm:px-8 sm:pb-6">
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12 sm:mt-16">
                <p className="text-gray-400 mb-4">Still have questions?</p>
                <Link 
                  to="/media"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold px-6 py-3 rounded-full hover:bg-emerald-500/20 transition-all text-sm sm:text-base"
                >
                  <Instagram size={18} />
                  Connect with us on Social Media
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER (Unchanged) --- */}
      <footer className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} Jogo. All Rights Reserved. Made with ❤️ by the jogo team.</p>
        </div>
      </footer>
    </div>
  );
}
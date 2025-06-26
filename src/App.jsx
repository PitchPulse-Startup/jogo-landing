import React, { useState, useEffect, useRef } from 'react';
// Added Users icon for the counter
import { Wifi, List, MessageSquare, CheckCircle, Instagram, Users } from 'lucide-react';

// --- ASSETS ---
import jogoLogo from './assets/jogo-logo2.png';
import jogoVideo from './assets/jogo-video.mp4';
import liveScreenImage from './assets/live.png';
import gamesScreenImage from './assets/games.png';
import socialScreenImage from './assets/social.png';
import soccerFieldBg from './assets/soccer.jpeg'; // <-- ADDED THIS LINE

// --- Main App Component ---
export default function App() {
  // --- STATE MANAGEMENT ---
  const [hypeCount, setHypeCount] = useState(287); // Initial count for social proof
  const [isHypeClicked, setIsHypeClicked] = useState(false); // Tracks if user clicked the main CTA
  const [activeFeature, setActiveFeature] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  
  const featureRefs = {
      home: useRef(null),
      games: useRef(null),
      community: useRef(null),
  };

  // --- "LIVE" COUNTER EFFECT ---
  // This useEffect hook sets up an interval to slowly increase the counter
  useEffect(() => {
    const interval = setInterval(() => {
      setHypeCount(currentCount => currentCount + 1);
    }, 2500 + Math.random() * 2000); // Increments every 2.5 to 4.5 seconds

    // Cleanup function to stop the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- EVENT HANDLER ---
  // Handles the main "Hype" button click
  const handleJoinHypeClick = () => {
    if (!isHypeClicked) {
      setIsHypeClicked(true);
      setHypeCount(currentCount => currentCount + 1); // Give an immediate bump
    }
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
       if (observer) {
         Object.values(featureRefs).forEach(ref => {
             if (ref.current) observer.unobserve(ref.current);
         });
       }
    };
  }, [isMobile]); // Re-run if isMobile changes

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
      {/* Styles (unchanged) */}
      <style>{`
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
            .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
            .animation-delay-4000 { animation-delay: -4s; }
            
            @media (max-width: 768px) {
              .animate-blob { animation: blob 10s infinite; }
            }
      `}</style>
      
      {/* --- CORRECTED BACKGROUND SECTION --- */}
      <div 
        className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${soccerFieldBg})` }} // <-- THIS IS THE FIX
      >
          {/* This div acts as a dark overlay to ensure text is readable */}
          <div className="absolute inset-0 w-full h-full bg-black/60"></div>
          
          {/* The original blobs are placed on top of the overlay */}
          <div className="absolute top-[20%] left-[5%] sm:left-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-900/50 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-[40%] right-[5%] sm:right-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-slate-800/50 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
          
          {/* The top gradient remains to darken the header area */}
          <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-slate-900 to-transparent"></div>
      </div>

      {/* Header (unchanged) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-white/10">
          <a href="#" className="flex items-center gap-2 sm:gap-3">
            <img src={jogoLogo} alt="Jogo Logo" className="h-7 sm:h-9 w-auto" />
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">jogo</span>
          </a>
          <a href="#signup" className="bg-white text-black font-semibold px-3 sm:px-5 py-2 rounded-full hover:bg-gray-200 transition-all text-xs sm:text-sm">
            Get Early Access
          </a>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero and Features Sections (unchanged) */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center pt-16 sm:pt-20 px-4 sm:px-0">
          <div className="container mx-auto px-4 sm:px-6">
             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 leading-tight mb-4 sm:mb-6 animate-fade-in-up">
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

        {/* Signup Section (unchanged) */}
        <section id="signup" className="py-16 sm:py-20 md:py-32 bg-gradient-to-t from-emerald-900/30 via-emerald-900/10 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-xl mx-auto px-4 sm:px-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
                Launching Soon. Join the Hype.
              </h2>
              <p className="text-gray-400 mt-4 sm:mt-5 mb-8 text-base sm:text-lg">
                Be the first to know when we go live. Hit the button below and follow our journey on Instagram for exclusive updates.
              </p>
              
              <div className="flex flex-col items-center gap-6">
                {/* --- HYPE BUTTON AND COUNTER --- */}
                <div className="flex flex-col items-center gap-4 w-full">
                  {/* This container prevents layout shift when the button is clicked */}
                  <div className="h-20 flex flex-col justify-center items-center">
                    {isHypeClicked ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-lg text-center animate-fade-in-up">
                        <h3 className="font-bold text-lg flex items-center justify-center gap-2"><CheckCircle size={20} /> You're in! Thanks!</h3>
                      </div>
                    ) : (
                      <button 
                        onClick={handleJoinHypeClick} 
                        className="inline-flex items-center justify-center gap-3 bg-emerald-500 text-black font-bold px-8 py-4 rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 text-base sm:text-lg transform hover:scale-105"
                      >
                        I'm Ready! (Join the Hype)
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-emerald-400/80">
                     <Users size={16} />
                     <p className="font-semibold text-sm">
                       <span className="text-white font-bold">{hypeCount}</span> players are already hyped!
                     </p>
                  </div>
                </div>

                {/* --- DIVIDER --- */}
                <div className="flex items-center gap-4 w-full max-w-xs">
                  <hr className="w-full border-t border-white/10" />
                  <span className="text-gray-500 text-xs font-medium">OR</span>
                  <hr className="w-full border-t border-white/10" />
                </div>
                
                {/* --- INSTAGRAM BUTTON --- */}
                <div className="flex flex-col items-center gap-3">
                   <p className="text-sm text-gray-400">For live updates & content:</p>
                   <a 
                    href="https://www.instagram.com/jogo.us/" // IMPORTANT: Set your real URL here
                    target="_blank" // Opens in a new tab
                    rel="noopener noreferrer" // Security best practice for new tabs
                    className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition-all text-sm"
                   >
                     <Instagram size={16} />
                     Follow on Instagram
                   </a>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer (unchanged) */}
      <footer className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} Jogo. All Rights Reserved. Made with ❤️ by the jogo team.</p>
        </div>
      </footer>
    </div>
  );
}
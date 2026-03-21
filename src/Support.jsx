import React, { useEffect } from 'react';
import { ArrowLeft, Mail, HeadphonesIcon } from 'lucide-react';
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const Support = ({ onBackToMain }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <AnimatedBackdrop />

      <div className="fixed top-0 left-0 w-full min-h-screen z-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${soccerBackground})` }}>
        <div className="absolute inset-0 w-full h-full bg-black/80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900/80 to-transparent"></div>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-emerald-500/20">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToMain}
              className="flex items-center gap-2 text-white/80 hover:text-emerald-400 transition-all duration-300 group bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/30"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <div className="flex items-center gap-3">
              <img src={jogoLogo} alt="Jogo Logo" className="h-8 w-auto opacity-90" />
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Support
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <HeadphonesIcon className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent pb-2">
              Need Help?
            </h1>
            <p className="text-white/60 text-lg">
              We're here for you. Reach out and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-white/70 mb-6 text-base leading-relaxed">
              For any questions, issues, or feedback about the Jogo app, please contact us at the email below and our support team will be happy to help.
            </p>
            <a
              href="mailto:jogo.tech@outlook.com"
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/30 transform hover:scale-105 text-lg"
            >
              <Mail className="w-5 h-5" />
              jogo.tech@outlook.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;

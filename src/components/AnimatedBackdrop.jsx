import React from 'react';

const AnimatedBackdrop = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated geometric shapes */}
      <div className="absolute inset-0">
        {/* Large floating rectangles */}
        <div className="absolute top-20 left-10 w-32 h-20 bg-emerald-500/10 rounded-lg animate-float-slow rotate-12 blur-sm"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-400/15 rounded-lg animate-float-medium -rotate-6 blur-sm"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-16 bg-emerald-600/12 rounded-lg animate-float-fast rotate-45 blur-sm"></div>
        
        {/* Code brackets and symbols */}
        <div className="absolute top-60 right-1/3 text-6xl text-emerald-500/20 font-mono animate-pulse-slow">{'{'}</div>
        <div className="absolute bottom-40 right-10 text-4xl text-emerald-400/25 font-mono animate-bounce-slow">{'<>'}</div>
        <div className="absolute top-32 left-1/3 text-5xl text-emerald-600/15 font-mono animate-float-medium">{'}'}</div>
        
        {/* Small particles */}
        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-emerald-500/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-emerald-400/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-emerald-600/50 rounded-full animate-bounce"></div>
        
        {/* Diagonal lines */}
        <div className="absolute top-16 left-1/2 w-40 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent rotate-12 animate-fade-in-out"></div>
        <div className="absolute bottom-20 right-1/3 w-32 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent -rotate-12 animate-fade-in-out-delayed"></div>
        
        {/* Code-like rectangles */}
        <div className="absolute top-1/3 right-1/4 space-y-1 animate-code-flicker">
          <div className="w-16 h-1 bg-emerald-500/20 rounded-full"></div>
          <div className="w-12 h-1 bg-emerald-400/15 rounded-full"></div>
          <div className="w-20 h-1 bg-emerald-600/10 rounded-full"></div>
        </div>
        
        <div className="absolute bottom-1/4 left-1/3 space-y-1 animate-code-flicker-delayed">
          <div className="w-14 h-1 bg-emerald-500/15 rounded-full"></div>
          <div className="w-18 h-1 bg-emerald-400/20 rounded-full"></div>
          <div className="w-10 h-1 bg-emerald-600/12 rounded-full"></div>
        </div>
        
        {/* Terminal cursor */}
        <div className="absolute top-2/3 left-10 flex items-center space-x-1 animate-float-slow">
          <div className="w-4 h-1 bg-emerald-500/30 rounded-full"></div>
          <div className="w-1 h-3 bg-emerald-400/50 animate-pulse"></div>
        </div>
        
        {/* Hexagons */}
        <div className="absolute top-1/2 right-12 w-8 h-8 border border-emerald-500/20 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/2 left-20 w-6 h-6 border border-emerald-400/25 rotate-12 animate-spin-reverse"></div>
        
        {/* VS Code inspired elements */}
        <div className="absolute top-80 left-2/3 flex space-x-1 animate-fade-in-out">
          <div className="w-1 h-4 bg-emerald-500/30 rounded-full"></div>
          <div className="w-1 h-6 bg-emerald-400/25 rounded-full"></div>
          <div className="w-1 h-3 bg-emerald-600/20 rounded-full"></div>
          <div className="w-1 h-5 bg-emerald-500/35 rounded-full"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) rotate(12deg); }
          50% { transform: translate(-20px, -30px) rotate(12deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translate(0px, 0px) rotate(-6deg); }
          50% { transform: translate(15px, -20px) rotate(-6deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translate(0px, 0px) rotate(45deg); }
          50% { transform: translate(-10px, -15px) rotate(45deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.3; }
        }
        
        @keyframes fade-in-out-delayed {
          0%, 100% { opacity: 0; }
          25%, 75% { opacity: 0.25; }
        }
        
        @keyframes code-flicker {
          0%, 100% { opacity: 0.2; }
          25% { opacity: 0.4; }
          50% { opacity: 0.1; }
          75% { opacity: 0.3; }
        }
        
        @keyframes code-flicker-delayed {
          0%, 50%, 100% { opacity: 0.15; }
          25% { opacity: 0.3; }
          75% { opacity: 0.25; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(45deg); }
          to { transform: rotate(405deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(12deg); }
          to { transform: rotate(-348deg); }
        }
        
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-fade-in-out { animation: fade-in-out 5s ease-in-out infinite; }
        .animate-fade-in-out-delayed { animation: fade-in-out-delayed 7s ease-in-out infinite; }
        .animate-code-flicker { animation: code-flicker 3s ease-in-out infinite; }
        .animate-code-flicker-delayed { animation: code-flicker-delayed 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
      `}</style>
    </div>
  );
};

export default AnimatedBackdrop;
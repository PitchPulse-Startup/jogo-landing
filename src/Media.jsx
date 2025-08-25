import React, { useEffect } from 'react';
import { ArrowLeft, ExternalLink, Users, Sparkles, Play, MessageCircle } from 'lucide-react';
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const Media = ({ onBackToMain }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const socialPlatforms = [
    {
      name: 'TikTok',
      handle: '@jogo.us',
      url: 'https://www.tiktok.com/@jogo.us',
      description: 'Quick highlights, soccer tips, and behind-the-scenes content',
      color: 'from-pink-500 to-red-500',
      hoverColor: 'hover:from-pink-600 hover:to-red-600',
      icon: Play,
      followers: 'Growing Fast',
      content: 'Short-form videos, game highlights, soccer culture'
    },
    {
      name: 'Instagram',
      handle: '@jogo.us',
      url: 'https://www.instagram.com/jogo.us/',
      description: 'Live updates, community stories, and beautiful game moments',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      icon: Users,
      followers: '100+ Engaged',
      content: 'Stories, posts, reels, community highlights'
    },
    {
      name: 'X (Twitter)',
      handle: '@jogo.us',
      url: 'https://x.com/jogo.us',
      description: 'Real-time updates, news, and conversations about pickup soccer',
      color: 'from-slate-600 to-slate-800',
      hoverColor: 'hover:from-slate-700 hover:to-slate-900',
      icon: MessageCircle,
      followers: 'Join the Conversation',
      content: 'News, updates, community discussions'
    }
  ];

  const styles = `
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
    .animate-blob { animation: blob 7s infinite; }
    .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
    .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
    .animation-delay-4000 { animation-delay: -4s; }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .hover-lift {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hover-lift:hover {
      transform: translateY(-8px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    }
    .social-card:hover .social-icon {
      transform: scale(1.1) rotate(5deg);
    }
    .social-icon {
      transition: transform 0.3s ease;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
        {/* Animated Backdrop */}
        <AnimatedBackdrop />
        
        {/* Background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" 
            style={{ backgroundImage: `url(${soccerBackground})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-black/90"></div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-emerald-500/20">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={onBackToMain}
                className="flex items-center gap-3 text-white hover:text-emerald-400 transition-colors duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Back to Home</span>
              </button>
              <img src={jogoLogo} alt="Jogo Logo" className="h-12 w-auto" />
            </div>
          </div>
        </header>

        <main className="relative z-10 pt-8">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            {/* Media Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-emerald-400 mb-6 border border-emerald-500/30 animate-fade-in-up">
                <Sparkles className="w-4 h-4" />
                Follow Our Journey
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 animate-fade-in-up animation-delay-200">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  Connect with Jogo
                </span>
                <span className="text-emerald-400 ml-2">⚽</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 animate-fade-in-up animation-delay-400">
                Stay connected across all platforms for the latest updates, community highlights, and behind-the-scenes content as we build the future of pickup soccer.
              </p>
            </div>

            {/* Social Media Cards */}
            <div className="grid gap-8 lg:gap-12 max-w-5xl mx-auto mb-16">
              {socialPlatforms.map((platform, index) => (
                <div 
                  key={platform.name}
                  className={`glass-card p-6 sm:p-8 rounded-3xl border border-white/10 hover-lift social-card group cursor-pointer ${index % 2 === 1 ? 'lg:ml-12' : 'lg:mr-12'}`}
                  onClick={() => window.open(platform.url, '_blank')}
                >
                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                    {/* Platform Icon & Info */}
                    <div className="flex-shrink-0 text-center lg:text-left">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${platform.color} rounded-2xl mb-4 social-icon`}>
                        <platform.icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                        {platform.name}
                      </h2>
                      <p className="text-emerald-400 font-mono text-lg mb-1">
                        {platform.handle}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {platform.followers}
                      </p>
                    </div>

                    {/* Platform Details */}
                    <div className="flex-1 text-center lg:text-left">
                      <p className="text-gray-300 text-lg leading-relaxed mb-4">
                        {platform.description}
                      </p>
                      <p className="text-gray-400 text-sm mb-6">
                        {platform.content}
                      </p>
                      
                      {/* Visit Button */}
                      <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${platform.color} ${platform.hoverColor} text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-lg`}>
                        <span>Visit {platform.name}</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mb-16">
              <div className="glass-card p-8 sm:p-12 rounded-3xl border-2 border-emerald-400/20 max-w-3xl mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                      Join the Community
                    </span>
                  </h3>
                  <p className="text-gray-300 text-lg mb-8">
                    Follow us on all platforms to stay updated with the latest news, features, and be part of the growing Jogo community.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {socialPlatforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group inline-flex items-center gap-2 bg-gradient-to-r ${platform.color} ${platform.hoverColor} text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 text-sm`}
                    >
                      <platform.icon className="w-4 h-4" />
                      <span>{platform.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="text-center mb-16">
              <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-white mb-3">
                  Want More Direct Updates?
                </h4>
                <p className="text-gray-400 mb-6">
                  Join our newsletter for exclusive content and early access announcements.
                </p>
                <button
                  onClick={onBackToMain}
                  className="group bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold px-6 py-3 rounded-full hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-emerald-500/30"
                >
                  <span>Join Newsletter</span>
                  <ArrowLeft className="inline ml-2 w-4 h-4 transition-transform group-hover:-translate-x-1 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Media;
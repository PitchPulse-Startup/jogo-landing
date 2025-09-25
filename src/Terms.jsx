import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const Terms = ({ onBackToMain }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const styles = `
    .prose-custom {
      color: rgba(255, 255, 255, 0.8);
    }
    .prose-custom h2 {
      color: white;
      font-size: 1.875rem;
      line-height: 2.25rem;
      margin-top: 2.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }
    .prose-custom p {
      margin-bottom: 1.5rem;
      line-height: 1.75;
    }
    .prose-custom a {
      color: #34d399; /* emerald-400 */
      text-decoration: none;
    }
    .prose-custom a:hover {
      color: #60a5fa; /* blue-400 */
    }
  `;

  return (
    <>
      <style>{styles}</style>
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
                  Terms
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 pt-8 pb-16">
          <article className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <header className="mb-12 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent pb-4">
                Terms of Service (ToS) for Jogo
              </h1>
              <p className="text-white/60">Effective date: September 25, 2025</p>
            </header>

            <div className="prose-custom max-w-none">
              <p>Welcome to Jogo! These Terms of Service (“Terms”) govern your use of the Jogo mobile application (“App”). By using the App, you agree to these Terms.</p>

              <h2>1. Use of the App</h2>
              <p>Jogo is provided for informational purposes to help users see real-time soccer field traffic.</p>
              <p>You agree not to misuse the App, attempt to disrupt it, or use it for unlawful purposes.</p>

              <h2>2. Accounts</h2>
              <p>Some features may require an account. You are responsible for keeping your login details secure.</p>
              <p>You must provide accurate information when creating an account.</p>

              <h2>3. User Responsibilities</h2>
              <p>You are responsible for your own use of the App.</p>
              <p>Do not use Jogo while driving or in situations where distraction could cause harm.</p>

              <h2>4. Intellectual Property</h2>
              <p>Jogo and its content are owned by us and protected by copyright, trademark, and other laws.</p>
              <p>You may not copy, distribute, or reverse-engineer the App.</p>

              <h2>5. Disclaimer of Warranties</h2>
              <p>Jogo is provided “as is” without warranties of any kind.</p>
              <p>We do not guarantee that field traffic data will always be accurate, timely, or available.</p>

              <h2>6. Limitation of Liability</h2>
              <p>We are not liable for any damages arising from your use of Jogo.</p>
              <p>Your use of the App is at your own risk.</p>

              <h2>7. Termination</h2>
              <p>We may suspend or terminate access to the App if you violate these Terms.</p>

              <h2>8. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. Continued use of the App after changes means you accept the updated Terms.</p>

              <h2>9. Governing Law</h2>
              <p>These Terms are governed by the laws of the United States and the State of New Jersey.</p>

              <h2>10. Contact Us</h2>
              <p>If you have any questions about these Terms, contact us at: 📧 <a href="mailto:jogo.tech@outlook.com">jogo.tech@outlook.com</a></p>
            </div>
          </article>
        </main>
      </div>
    </>
  );
};

export default Terms;
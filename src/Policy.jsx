import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const Policy = ({ onBackToMain }) => {
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
    .prose-custom h3 {
      color: white;
      font-size: 1.5rem;
      line-height: 2rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    .prose-custom p, .prose-custom ul {
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
    .prose-custom ul {
      list-style-type: disc;
      padding-left: 1.5rem;
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
                  Policy
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 pt-8 pb-16">
          <article className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <header className="mb-12 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent pb-4">
                Privacy Policy for Jogo
              </h1>
              <p className="text-white/60">Effective date: September 25, 2025</p>
            </header>

            <div className="prose-custom max-w-none">
              <p>Jogo (“we,” “our,” or “us”) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application (“App”).</p>

              <h2>1. Information We Collect</h2>
              <p>When you use Jogo, we may collect:</p>
              <ul>
                <li><strong>Location Data:</strong> To show real-time traffic at nearby soccer fields.</li>
                <li><strong>Device Information:</strong> Such as device type, operating system, and app version, for performance and troubleshooting.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with the app (e.g., which features you use).</li>
              </ul>
              <p>We do not collect sensitive personal information such as contacts, photos, payment details, or biometrics.</p>

              <h2>2. How We Use Your Information</h2>
              <p>We use collected data to:</p>
              <ul>
                <li>Provide real-time field traffic heatmaps.</li>
                <li>Improve app performance and user experience.</li>
                <li>Detect and fix bugs or technical issues.</li>
              </ul>

              <h2>3. Data Sharing and Disclosure</h2>
              <p>We do not sell, rent, or trade your personal information. We may share limited data only in these cases:</p>
              <ul>
                <li>With service providers (e.g., analytics or hosting providers) who help us run the app.</li>
                <li>If required by law or legal process.</li>
              </ul>

              <h2>4. Data Retention</h2>
              <p>Location and usage data is stored only as long as necessary to provide the service.</p>
              <p>We delete or anonymize data when no longer needed.</p>

              <h2>5. Data Security</h2>
              <p>We use industry-standard measures (e.g., HTTPS encryption) to protect your data. However, no method of transmission or storage is 100% secure.</p>

              <h2>6. Your Choices</h2>
              <p>You can disable location permissions in your device settings, but this may limit the app’s functionality.</p>
              <p>You may request deletion of your account or data by contacting us at <a href="mailto:jogo.tech@outlook.com">jogo.tech@outlook.com</a>.</p>

              <h2>7. Children’s Privacy</h2>
              <p>Jogo is not intended for children under 13. We do not knowingly collect data from children. If we discover such collection, we will delete it promptly.</p>

              <h2>8. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the “Effective date” at the top.</p>

              <h2>9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, contact us at: 📧 <a href="mailto:jogo.tech@outlook.com">jogo.tech@outlook.com</a></p>
            </div>
          </article>
        </main>
      </div>
    </>
  );
};

export default Policy;
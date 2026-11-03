import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import jogoLogo from './assets/jogo-logo-2026-white.png';
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
                <img src={jogoLogo} alt="Jogo Logo" className="h-6 w-auto" />
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
                Terms of Service
              </h1>
              <p className="text-white/60">Effective date: November 2, 2026</p>
            </header>

            <div className="prose-custom max-w-none">
              <p>These Terms of Service (“Terms”) govern your use of the Jogo mobile app, website and related services (“Jogo”). By using Jogo, you agree to these Terms.</p>

              <h2>1. The Jogo Platform</h2>
              <p>Jogo helps players find fields, organize and join soccer games, form crews, and book and pay for games and events. Jogo does not own, operate or supervise any field or indoor facility, and does not organize or supervise games run by users, hosts, indoor facilities or event organizers. They are independent of Jogo and are solely responsible for their games, facilities and conduct.</p>
              <p>Field information, availability and game details may be inaccurate or change without notice. You are responsible for confirming that a location is open and may be used.</p>

              <h2>2. Eligibility and Accounts</h2>
              <p>You must be at least 13 years old to use Jogo. If you are under 18, you may use Jogo and take part in games only with the permission of a parent or guardian, who agrees to these Terms on your behalf.</p>
              <p>You must provide accurate information and keep your login secure. You are responsible for activity on your account.</p>

              <h2>3. Assumption of Risk and Release</h2>
              <p><strong>Soccer and other physical activity carry an inherent risk of serious injury, illness, disability or death. You take part in any game, event or activity found or arranged through Jogo, whether indoors or outdoors, voluntarily and at your own risk.</strong></p>
              <p>You are responsible for deciding whether you are fit to play and whether a field, facility, or the weather or other conditions are safe.</p>
              <p><strong>To the fullest extent permitted by law, you assume all such risks and release Jogo and its owners, employees and affiliates from all claims arising from injury, illness, death, or loss, theft or damage to property in connection with any game, event, field or facility, or travel to or from them.</strong> This release does not apply to liability that cannot be excluded by law.</p>

              <h2>4. Payments and Refunds</h2>
              <p>Payments are processed by Stripe. The price, including applicable fees, is shown before you pay. The refund rules for each paid game or event are shown on its page and apply to your purchase. If you cancel a field rental during its free cancellation period, your refund excludes card processing fees.</p>
              <p>All payments for a paid game or event must be made through the Jogo platform. Jogo is not responsible for payments made outside the platform.</p>
              <p>Hosts of paid games are also subject to the <Link to="/host-terms">Host Terms</Link>.</p>

              <h2>5. Community Standards and Your Content</h2>
              <p>Jogo has zero tolerance for objectionable content, harassment, hate speech, threats, violence or abusive behavior, in the app or at a game. You may report or block any user. We review reports within 24 hours and may remove content and ban users who violate these standards.</p>
              <p>You are responsible for the content you post and must have the right to post it. You grant Jogo a non-exclusive, royalty-free license to host, display and share that content to operate and promote Jogo.</p>

              <h2>6. Acceptable Use</h2>
              <p>You may not misuse Jogo, disrupt it, use it unlawfully, commit fraud, submit false information or manipulate stats or leaderboards. Do not use Jogo while driving or where distraction could cause harm.</p>

              <h2>7. Intellectual Property</h2>
              <p>Jogo and its content, excluding content posted by users, are owned by us and protected by law. You may not copy, distribute or reverse-engineer the app.</p>

              <h2>8. Disclaimer of Warranties</h2>
              <p>Jogo is provided “as is” and “as available”, without warranties of any kind, to the fullest extent permitted by law. We do not guarantee that any game will take place, that any field, facility or user is safe or suitable, or that information on Jogo is accurate or available.</p>

              <h2>9. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, Jogo is not liable for indirect, incidental, special or consequential damages, or for the acts or omissions of any user, host, facility or organizer. Our total liability for any claim will not exceed the greater of $100 or the amount you paid through Jogo in the 12 months before the claim arose.</p>

              <h2>10. Indemnification</h2>
              <p>You will indemnify Jogo against claims arising from your conduct, your content, or your breach of these Terms, to the extent permitted by law.</p>

              <h2>11. Suspension and Termination</h2>
              <p>We may suspend or terminate your access to Jogo if you violate these Terms or to protect Jogo or its users. You may delete your account at any time.</p>

              <h2>12. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. We will post updates on this page and may ask you to accept them in the app. Continued use of Jogo after an update means you accept it.</p>

              <h2>13. Governing Law</h2>
              <p>These Terms are governed by the laws of the State of New Jersey and applicable United States law. If any part of these Terms is unenforceable, the rest remains in effect.</p>

              <h2>14. Contact Us</h2>
              <p>Questions about these Terms? Contact us at <a href="mailto:jogo.tech@outlook.com">jogo.tech@outlook.com</a>.</p>
            </div>
          </article>
        </main>
      </div>
    </>
  );
};

export default Terms;

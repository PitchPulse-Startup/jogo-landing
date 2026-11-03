import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import jogoLogo from './assets/jogo-logo-2026-white.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const SECTIONS = [
  ['1. Eligibility', 'You must be at least 18 years old. The name, photo and other information you submit must be accurate and your own. You may not host on behalf of someone else, and you may not share your host account.'],
  ['2. Field Bookings', 'Before charging players for a game, you must hold a confirmed booking for the field at the date and time listed. You are solely responsible for that booking, for paying the facility, and for following its rules. You must attend each game you host, or arrange for it to be run as listed.'],
  ['3. Cancellations and Refunds', 'If you cancel a game or leave it, the game is cancelled and every player who paid receives a full refund. A player who leaves before kickoff also receives a full refund. You are responsible for all card processing and other fees resulting from refunds on a game you cancel. Jogo may deduct these amounts from your balance or future payouts.'],
  ['4. Fees and Payouts', 'Jogo retains a service fee on each payment. Payouts are processed through Stripe, and you must complete and maintain Stripe\'s verification requirements to receive them. Refunds and disputed charges may be recovered from your balance or future payouts.'],
  ['5. Removal', 'Jogo may suspend or remove you as a host, and may cancel and refund your games, at its discretion, including for player complaints, payment disputes, inaccurate information, or a violation of these Host Terms.'],
  ['6. Independent Status', 'You host as an independent party, not as an employee, agent or partner of Jogo. You are responsible for your own taxes, permits and insurance. To the fullest extent permitted by law, you will indemnify Jogo against claims arising from games you host or your breach of these Host Terms.'],
  ['7. Changes', 'Jogo may change its fees and these Host Terms at any time. Updates are posted on this page and apply to games created after they take effect. Hosting after an update means you accept it.'],
  ['8. General', 'These Host Terms supplement the Jogo Terms of Service and are governed by the laws of the State of New Jersey.'],
];

const HostTerms = ({ onBackToMain }) => {
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
            <img src={jogoLogo} alt="Jogo Logo" className="h-6 w-auto" />
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-8 pb-16">
        <article className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <header className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight text-white">Host Terms</h1>
            <p className="text-white/60">Effective date: November 2, 2026</p>
          </header>

          <p className="mb-8 leading-relaxed text-white/80">These Host Terms apply to anyone who hosts paid games on Jogo. By applying to host or hosting a game, you agree to them.</p>

          {SECTIONS.map(([title, body]) => (
            <section key={title} className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
              <p className="leading-relaxed text-white/80">{body}</p>
            </section>
          ))}

          <p className="leading-relaxed text-white/80">
            Questions? Contact <a className="text-emerald-400" href="mailto:jogo.tech@outlook.com">jogo.tech@outlook.com</a>. See also the <Link className="text-emerald-400" to="/terms">Terms of Service</Link>.
          </p>
        </article>
      </main>
    </div>
  );
};

export default HostTerms;

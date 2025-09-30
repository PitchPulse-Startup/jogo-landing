import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, LoaderCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const DeleteAccount = ({ onBackToMain }) => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, "account-deletion-requests"), {
        email: email,
        reason: reason,
        submittedAt: serverTimestamp(),
        status: 'pending'
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting deletion request: ", err);
      setError('Something went wrong. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    .prose-custom { color: rgba(255, 255, 255, 0.8); }
    .prose-custom a { color: #34d399; text-decoration: none; }
    .prose-custom a:hover { color: #60a5fa; }
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
                  Account Deletion
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 pt-8 pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <header className="mb-12 text-center">
              <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent pb-2">
                Delete Your Jogo Account
              </h1>
              <p className="text-white/60">We're sorry to see you go. Follow the steps below to request account deletion.</p>
            </header>

            {success ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-6 rounded-lg text-center animate-fade-in-up w-full">
                <h3 className="font-bold text-xl flex items-center justify-center gap-2"><CheckCircle size={24} /> Request Received</h3>
                <p className="text-emerald-400/80 mt-2">Your account deletion request has been submitted. We'll process it within 30 days and send a confirmation email to {email}.</p>
              </div>
            ) : (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-6 rounded-lg mb-8 animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Important Information</h3>
                      <p className="text-yellow-400/90 text-sm leading-relaxed">
                        Account deletion is permanent and cannot be undone. Once processed, you will lose access to all your data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-lg mb-8 animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-4 text-white">What Will Be Deleted</h2>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span><strong>Account Information:</strong> Your email, username, and profile details</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span><strong>Game History:</strong> Records of games you've joined or created</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span><strong>Messages:</strong> All chat messages and communications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span><strong>Location Data:</strong> Any location information associated with your account</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-lg mb-8 animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-4 text-white">What Will Be Retained</h2>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Aggregated Analytics:</strong> Anonymized data for app improvement (30 days)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Legal Records:</strong> Data required by law for compliance purposes (as required by applicable laws)</span>
                    </li>
                  </ul>
                  <p className="text-white/60 text-sm mt-4">
                    Most data will be deleted immediately upon processing your request. Any retained data will be anonymized and deleted within 30 days unless legally required otherwise.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-lg mb-8 animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-4 text-white">How to Request Account Deletion</h2>
                  <ol className="space-y-4 text-white/80">
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">1</span>
                      <div>
                        <p className="font-semibold text-white mb-1">Submit Your Request</p>
                        <p className="text-sm">Fill out the form below with the email address associated with your Jogo account.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">2</span>
                      <div>
                        <p className="font-semibold text-white mb-1">Verification Email</p>
                        <p className="text-sm">You'll receive an email to confirm your identity and request.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-emerald-500 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">3</span>
                      <div>
                        <p className="font-semibold text-white mb-1">Processing</p>
                        <p className="text-sm">We'll process your request within 30 days and send confirmation once complete.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-lg animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-4 text-white">Request Form</h2>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                      Account Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-white/80 mb-2">
                      Reason for Leaving (Optional)
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows="4"
                      placeholder="Help us improve by sharing why you're leaving..."
                      className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 bg-red-500 text-white font-bold px-6 py-4 rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 transform hover:scale-105 disabled:bg-red-800 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {loading ? <LoaderCircle size={22} className="animate-spin" /> : <><Trash2 size={18} /> Submit Deletion Request</>}
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
                  )}
                </form>

                <div className="mt-8 text-center text-white/60 text-sm">
                  <p>For questions about account deletion, contact us at <a href="mailto:jogo.tech@outlook.com" className="text-emerald-400 hover:text-emerald-300">jogo.tech@outlook.com</a></p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DeleteAccount;

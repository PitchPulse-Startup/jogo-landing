import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, LoaderCircle, CheckCircle } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const Feedback = ({ onBackToMain }) => {
  const [formData, setFormData] = useState({
    feeling: '',
    likes: '',
    dislikes: '',
    suggestions: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.feeling && !formData.likes && !formData.dislikes && !formData.suggestions) {
      setError('Please fill out at least one feedback field.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, "feedback"), {
        ...formData,
        submittedAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting feedback: ", err);
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
                  Feedback
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 pt-8 pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
            <header className="mb-12 text-center">
              <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent pb-2">
                Share Your Thoughts
              </h1>
              <p className="text-white/60">Your feedback is vital for making Jogo the best it can be.</p>
            </header>

            {success ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-6 rounded-lg text-center animate-fade-in-up w-full">
                <h3 className="font-bold text-xl flex items-center justify-center gap-2"><CheckCircle size={24} /> Thank You!</h3>
                <p className="text-emerald-400/80 mt-2">Your feedback has been submitted. We appreciate you helping us improve Jogo.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                {[
                  { name: 'feeling', label: 'How does the app feel to use?', placeholder: 'e.g., "Intuitive and fast", "A bit confusing at first"...' },
                  { name: 'likes', label: 'What do you like most about Jogo?', placeholder: 'Tell us what we should keep doing!' },
                  { name: 'dislikes', label: 'What do you dislike or find confusing?', placeholder: 'Don\'t hold back, we want to improve.' },
                  { name: 'suggestions', label: 'Any suggestions for new features or improvements?', placeholder: 'What would make Jogo a 10/10 for you?' },
                  { name: 'email', label: 'Your Email (Optional)', placeholder: 'If you\'d like us to follow up with you.' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label htmlFor={name} className="block text-sm font-medium text-white/80 mb-2">{label}</label>
                    {name === 'email' ? (
                      <input type="email" id={name} name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300" />
                    ) : (
                      <textarea id={name} name={name} value={formData[name]} onChange={handleChange} rows="3" placeholder={placeholder} className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300"></textarea>
                    )}
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 text-black font-bold px-6 py-4 rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 transform hover:scale-105 disabled:bg-emerald-800 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? <LoaderCircle size={22} className="animate-spin" /> : <><Send size={18} /> Submit Feedback</>}
                  </button>
                </div>

                {error && (
                  <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
                )}
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Feedback;
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, Sparkles, ArrowRight } from 'lucide-react';
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';
import AnimatedBackdrop from './components/AnimatedBackdrop';

const Blog = ({ onBackToMain }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  // Scroll to top when blog component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      id: 3,
      title: "Early Access is Back! Reopening Due to Popular Demand",
      date: "September 11, 2024",
      readTime: "2 min read",
      category: "Community Update",
      excerpt: "Due to overwhelming requests from our community, we're excited to announce that early access signups are open once again. Your feedback has been incredible, and we can't wait to build this amazing product together.",
      content: `
        <p>Hey soccer lovers! ⚽</p>
        
        <p>We have some amazing news to share with you today. Due to the <strong>incredible number of requests</strong> we've been receiving, we're thrilled to announce that <strong>early access is back!</strong></p>

        <h3>Why We're Reopening</h3>
        
        <p>Since closing our initial early access program, we've been overwhelmed by the response from the soccer community:</p>
        
        <ul>
          <li>Hundreds of messages asking when signups would reopen</li>
          <li>Amazing feedback from our current early access members</li>
          <li>Stories from players desperate to find pickup games in their cities</li>
          <li>Requests from soccer communities across the country</li>
        </ul>

        <h3>Your Feedback Has Been Incredible</h3>
        
        <p>We are absolutely <strong>thrilled</strong> with the feedback we've been receiving from our early access community. Your insights, suggestions, and enthusiasm have been invaluable in shaping Jogo into something truly special.</p>
        
        <p>Every message, every feature request, every story about your local soccer scene helps us build a platform that truly serves the pickup soccer community. We're not just building an app—we're creating something together.</p>

        <h3>Building Something Amazing Together</h3>
        
        <p>This reopening isn't just about getting more users. It's about expanding our community of passionate players who want to help us create the ultimate pickup soccer experience.</p>
        
        <p>When you join our early access, you become part of the development process. Your voice matters, your feedback shapes features, and your local soccer knowledge helps us understand what communities really need.</p>

        <h3>Ready to Join?</h3>
        
        <p>If you've been waiting for another chance to get early access to Jogo, this is it! We're looking for passionate players who want to help us revolutionize how pickup soccer works.</p>
        
        <p>Head back to our homepage and sign up for early access. Spots are limited, and we expect them to fill up quickly based on the demand we've seen.</p>
        
        <p>Let's build the future of pickup soccer together! 🚀</p>
        
        <p><strong>— The Jogo Team</strong></p>
      `,
      image: null
    },
    {
      id: 2,
      title: "The Home Stretch: 90% Complete and Big News Coming Soon",
      date: "August 8, 2024",
      readTime: "3 min read",
      category: "Development Update",
      excerpt: "We're in the final stretch! The Jogo team has reached a major milestone with 90% completion of our core features. Here's what we've been working on and what's coming next.",
      content: `
        <p>Hey Jogo community! 👋</p>
        
        <p>We're incredibly excited to share some major updates with you. We're sitting at an impressive <strong>90% completion</strong> of Jogo's core functionality!</p>

        <h3>What We've Been Building</h3>
        
        <p>Our team has been working around the clock to bring you the most intuitive pickup soccer platform ever created:</p>
        
        <ul>
          <li><strong>Real-Time Field Tracking:</strong> Live updates on field activity across your area</li>
          <li><strong>Game Discovery:</strong> Perfect game matching based on your preferences</li>
          <li><strong>Community Features:</strong> Chat, profiles, and social integration</li>
          <li><strong>Mobile Experience:</strong> Sleek iOS and Android apps</li>
        </ul>

        <h3>What's Coming Next</h3>
        
        <p>We can't reveal everything just yet, but <strong>big news is coming very soon</strong>:</p>
        
        <ul>
          <li>🚀 <strong>Launch timeline:</strong> Release within the next few weeks</li>
          <li>📱 <strong>App stores:</strong> Both iOS and Android simultaneously</li>
          <li>🌟 <strong>Special features:</strong> Exciting surprises for early supporters</li>
          <li>🎯 <strong>Gradual rollout:</strong> Select cities first, then nationwide</li>
        </ul>

        <h3>Thank You</h3>
        
        <p>Your enthusiasm drives everything we do. Knowing that over 100 of you signed up for early access gives us incredible motivation to deliver something truly special.</p>
        
        <p>Keep following us on <a href="https://www.instagram.com/jogo.us/" target="_blank" rel="noopener noreferrer">Instagram</a> and stay subscribed to our newsletter. You won't want to miss what's coming next!</p>
        
        <p>The beautiful game is about to get even more beautiful. ⚽</p>
        
        <p><strong>— The Jogo Team</strong></p>
      `,
      image: null
    },
    {
      id: 1,
      title: "Early Access Closed: Thank You to Our Amazing Community!",
      date: "August 1, 2024",
      readTime: "2 min read", 
      category: "Community Update",
      excerpt: "We've officially closed our early access program after receiving an overwhelming response from soccer enthusiasts across the country. Here's what this milestone means for Jogo.",
      content: `
        <p>What an incredible journey it has been! 🎉</p>
        
        <p>Today marks a significant milestone for Jogo as we officially close our early access program. We are blown away by the response—<strong>over 100 passionate players</strong> signed up!</p>

        <h3>Amazing Response</h3>
        
        <p>When we launched our early access signup, we hoped to connect with soccer enthusiasts who shared our vision. What we got exceeded our expectations:</p>
        
        <ul>
          <li><strong>100+ signups</strong> in record time</li>
          <li>Players from <strong>25+ cities</strong> across the US</li>
          <li>Incredible social media engagement</li>
          <li>Dozens of feature suggestions</li>
          <li>Inspiring stories from local soccer communities</li>
        </ul>

        <h3>What This Means</h3>
        
        <p>This response validates what we believed from the beginning: there's a real need for a platform that makes finding pickup soccer games effortless.</p>
        
        <p>Every signup represents someone who believes soccer brings communities together. Whether you're a weekend warrior or trying to break into the local scene, we heard you loud and clear.</p>

        <h3>Thank You</h3>
        
        <p>To everyone who signed up: <strong>THANK YOU.</strong> You're not just early users—you're founding members of what will become the largest pickup soccer community in the country.</p>
        
        <p>To those who shared our posts and spread the word: you've helped us reach players we never could have connected with on our own.</p>

        <h3>What's Next?</h3>
        
        <p>Our team is now laser-focused on development. We're working to ensure Jogo exceeds every expectation when it launches.</p>
        
        <p>If you missed early access, you can still:</p>
        
        <ul>
          <li>Join our newsletter for launch notifications</li>
          <li>Follow us on <a href="https://www.instagram.com/jogo.us/" target="_blank" rel="noopener noreferrer">Instagram</a> for updates</li>
          <li>Tell your soccer friends about Jogo!</li>
        </ul>
        
        <p>We're building more than an app—we're creating a movement that will transform pickup soccer in communities across America.</p>
        
        <p>The best is yet to come! ⚽</p>
        
        <p><strong>— The Jogo Team</strong></p>
      `,
      image: null
    }
  ];

  const BlogPost = ({ post, onBack }) => (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* --- ANIMATED BACKDROP --- */}
      <AnimatedBackdrop />
      
      {/* --- BACKGROUND & HEADER --- */}
      <div className="fixed top-0 left-0 w-full min-h-screen z-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${soccerBackground})` }}>
          <div className="absolute inset-0 w-full h-full bg-black/70"></div>
          <div className="absolute top-[20%] left-[5%] sm:left-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-900/30 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-[40%] right-[5%] sm:right-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-slate-800/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900/80 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-emerald-500/20">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-emerald-400 transition-all duration-300 group bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/30"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <img src={jogoLogo} alt="Jogo Logo" className="h-8 w-auto opacity-90" />
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Journal
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-8">
        <article className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Article Header */}
          <header className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium border border-emerald-400/20 mb-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                {post.title}
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent w-20"></div>
              <div className="flex items-center gap-4 text-white/50 text-sm">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent w-20"></div>
            </div>
          </header>

          {/* Article Content */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl border border-white/10 mb-16">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
            
            <div className="p-8 sm:p-12 lg:p-16">
              <div 
                className="prose prose-xl prose-invert max-w-none 
                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                prose-h3:text-3xl prose-h3:mb-8 prose-h3:mt-12 prose-h3:bg-gradient-to-r prose-h3:from-emerald-400 prose-h3:to-blue-400 prose-h3:bg-clip-text prose-h3:text-transparent
                prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-lg
                prose-ul:text-white/80 prose-ul:mb-8 prose-ul:space-y-3 prose-ul:text-lg
                prose-li:text-white/80 prose-li:leading-relaxed prose-li:mb-2
                prose-strong:text-white prose-strong:font-semibold prose-strong:bg-gradient-to-r prose-strong:from-emerald-400 prose-strong:to-blue-400 prose-strong:bg-clip-text prose-strong:text-transparent
                prose-a:text-emerald-400 prose-a:no-underline prose-a:font-medium hover:prose-a:text-blue-400 prose-a:transition-colors"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 opacity-50 pointer-events-none"></div>
          </div>

          {/* Back to Blog */}
          <div className="text-center pb-16">
            <button
              onClick={onBack}
              className="group relative bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold px-10 py-5 rounded-full hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-emerald-500/30"
            >
              <ArrowLeft className="inline mr-3 w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Stories</span>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-blue-400/50 rounded-full blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
            </button>
          </div>
        </article>
      </main>
    </div>
  );

  const BlogHome = () => (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* --- ANIMATED BACKDROP --- */}
      <AnimatedBackdrop />
      
      {/* --- BACKGROUND & HEADER --- */}
      <div className="fixed top-0 left-0 w-full min-h-screen z-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${soccerBackground})` }}>
          <div className="absolute inset-0 w-full h-full bg-black/70"></div>
          <div className="absolute top-[20%] left-[5%] sm:left-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-900/30 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-[40%] right-[5%] sm:right-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-slate-800/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900/80 to-transparent"></div>
      </div>

      {/* Header */}
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
                Journal
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Blog Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium border border-emerald-400/20 mb-8 animate-fade-in-up">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Latest Stories
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 animate-fade-in-up animation-delay-200">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                Updates
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in-up animation-delay-400">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent w-20"></div>
              <div className="text-2xl">⚽</div>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent w-20"></div>
            </div>
            
            <p className="text-lg text-white/60 max-w-2xl mx-auto animate-fade-in-up animation-delay-600">
              Behind the scenes with the Jogo team
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="space-y-8 max-w-4xl mx-auto">
            {blogPosts.map((post, index) => (
              <article 
                key={post.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02]"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl border border-white/10 hover:border-emerald-400/30 transition-all duration-500">
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                  
                  <div className="p-8 sm:p-10">
                    {/* Post Meta */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-400 text-sm font-medium rounded-full border border-emerald-400/20">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                        {post.category}
                      </div>
                      <div className="flex items-center gap-4 text-white/50 text-sm">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 leading-tight">
                      {post.title}
                    </h2>
                    
                    <p className="text-white/70 text-lg leading-relaxed mb-8">
                      {post.excerpt}
                    </p>

                    {/* Read More */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-emerald-400 font-medium group-hover:text-blue-400 transition-colors duration-300">
                        <span>Read Story</span>
                        <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                      </div>
                      
                      {/* Post number */}
                      <div className="text-6xl font-black text-white/5 group-hover:text-emerald-400/10 transition-colors duration-500">
                        0{blogPosts.length - index}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-20 mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 backdrop-blur-xl border border-emerald-400/20 text-center max-w-3xl mx-auto">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative p-8 sm:p-12">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Stay in the Loop
                    </span>
                  </h3>
                  <p className="text-white/70 text-lg leading-relaxed max-w-xl mx-auto">
                    Get the latest updates, behind-the-scenes content, and be first to know when we launch.
                  </p>
                </div>
                
                <button
                  onClick={onBackToMain}
                  className="group relative bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold px-8 py-4 rounded-full hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-emerald-500/30"
                >
                  <span>Join the Journey</span>
                  <ArrowRight className="inline ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-blue-400/50 rounded-full blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // CSS for prose styling
  const styles = `
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
    .animate-blob { animation: blob 7s infinite; }
    .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
    .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
    .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
    .animation-delay-2000 { animation-delay: -2s; }
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
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .prose p {
      margin-bottom: 1.5rem !important;
    }
    .prose h3 {
      margin-top: 2rem !important;
      margin-bottom: 1rem !important;
    }
    .prose ul {
      margin-bottom: 1.5rem !important;
    }
    .prose li {
      margin-bottom: 0.5rem !important;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      {selectedPost ? (
        <BlogPost post={selectedPost} onBack={() => setSelectedPost(null)} />
      ) : (
        <BlogHome />
      )}
    </>
  );
};

export default Blog;
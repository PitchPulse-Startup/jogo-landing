import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, Sparkles, ArrowRight } from 'lucide-react';
import jogoLogo from './assets/jogo-logo2.png';
import soccerBackground from './assets/soccer.jpeg';

const Blog = ({ onBackToMain }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  // Scroll to top when blog component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
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
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" 
          style={{ backgroundImage: `url(${soccerBackground})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-3 text-white hover:text-green-400 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Blog</span>
            </button>
            <img src={jogoLogo} alt="Jogo Logo" className="h-10 w-auto opacity-80" />
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-8">
        <article className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Article Header */}
          <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-green-400 mb-6 border border-green-500/30">
              <Sparkles className="w-4 h-4" />
              {post.category}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                {post.title}
              </span>
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="glass-card p-6 sm:p-8 lg:p-10 rounded-3xl border border-white/10 mb-12">
            <div className="space-y-6">
              <div 
                className="prose prose-lg prose-invert max-w-none 
                prose-headings:text-white prose-headings:font-bold 
                prose-h3:text-2xl prose-h3:mb-6 prose-h3:mt-8 prose-h3:text-green-300
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                prose-ul:text-gray-300 prose-ul:mb-6 prose-ul:space-y-2
                prose-li:text-gray-300 prose-li:leading-relaxed prose-li:mb-0
                prose-strong:text-white prose-strong:font-semibold
                prose-a:text-green-400 prose-a:no-underline prose-a:font-medium hover:prose-a:text-green-300 prose-a:transition-colors"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* Back to Blog */}
          <div className="text-center pb-16">
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-8 py-4 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Posts</span>
            </button>
          </div>
        </article>
      </main>
    </div>
  );

  const BlogHome = () => (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15" 
          style={{ backgroundImage: `url(${soccerBackground})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-black/85"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBackToMain}
              className="flex items-center gap-3 text-white hover:text-green-400 transition-colors duration-300 group"
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
          {/* Blog Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-blue-400 mb-6 border border-blue-500/30 animate-fade-in-up">
              <Sparkles className="w-4 h-4" />
              Latest Updates
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 animate-fade-in-up animation-delay-200">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                The Jogo Journal
              </span>
              <span className="text-yellow-400 ml-2">✏️</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Stay updated with the latest news, insights, and behind-the-scenes stories from the Jogo team as we revolutionize pickup soccer.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 lg:gap-12 max-w-4xl mx-auto">
            {blogPosts.map((post) => (
              <article 
                key={post.id}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 hover-lift cursor-pointer group"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex flex-col">
                  {/* Post Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 text-sm font-medium rounded-full border border-green-400/20">
                      <Sparkles className="w-3 h-3" />
                      {post.category}
                    </span>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-400 text-lg leading-relaxed mb-6">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <div className="flex items-center gap-2 text-green-400 font-medium group-hover:text-green-300 transition-colors duration-300">
                    <span>Read Full Post</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 mb-16">
            <div className="glass-card p-8 sm:p-12 rounded-3xl border-2 border-green-400/20 text-center max-w-3xl mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Never Miss an Update
                  </span>
                </h3>
                <p className="text-gray-300 text-lg mb-8">
                  Join our newsletter to get the latest news, feature updates, and be the first to know when Jogo launches in your city.
                </p>
              </div>
              
              <button
                onClick={onBackToMain}
                className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-8 py-4 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30"
              >
                <span>Join Newsletter</span>
                <ArrowRight className="inline ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
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
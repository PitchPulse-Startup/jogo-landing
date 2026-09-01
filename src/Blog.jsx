import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Calendar, Clock, Users, Sparkles, ArrowRight, Coffee, Heart, Search, X } from 'lucide-react';
import mapModel1 from './assets/mapmodel1.png';
import mapModel2 from './assets/mapmodel2.png';
import mapModel3 from './assets/mapmodel3.png';
import statusImg from './assets/status.png';
import qr1 from './assets/qr1.png';
import qr2 from './assets/qr2.png';
import qr3 from './assets/qr3.png';
import qr5 from './assets/qr5-web.gif';

const AnimatedBackdrop = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[8%] left-[10%] w-96 h-96 bg-emerald-300/25 rounded-full filter blur-[110px] animate-blob"></div>
    <div className="absolute top-[45%] right-[10%] w-96 h-96 bg-emerald-200/30 rounded-full filter blur-[110px] animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-[10%] left-[25%] w-96 h-96 bg-teal-200/20 rounded-full filter blur-[110px] animate-blob animation-delay-4000"></div>
  </div>
);

const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-black/5">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const Blog = ({ onBackToMain = () => {} }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedPost]);

  const blogPosts = [
    {
      id: 8,
      title: "What's New in Jogo: Arrival Status, Meetup Pins, QR Check-In & More",
      date: "September 2026",
      readTime: "2 min read",
      category: "Release Notes",
      author: "Team Jogo",
      excerpt: "A big batch of updates just landed — see who's actually arrived, pin the exact meetup spot, scan in for big games, and get a heads-up before kickoff.",
      image: null,
      content: `
        <p>A big update just shipped. Here's what's new, fast:</p>

        <h3>Know Who's Actually There</h3>

        <p>Mark yourself <strong>Arrived</strong>, <strong>On the Way</strong>, or <strong>Running Late</strong> — everyone in the game sees it live. No more guessing who's actually at the field.</p>

        <p>Shows up automatically <strong>45 minutes before kickoff</strong>, gone once the game ends. No clutter for games that are still days away.</p>

        <div class="not-prose my-10 flex justify-center">
          <figure class="m-0 max-w-xs w-full">
            <img src="${statusImg}" alt="Game screen showing the Arrived, OTW, and Running Late status buttons" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">Shows up 45 minutes before kickoff</figcaption>
          </figure>
        </div>

        <h3>Pin the Exact Meetup Spot</h3>

        <p>Big park, confusing entrance? Hosts drop a pin on a field diagram — <strong>exactly</strong> where to gather. Everyone sees it the moment they open the app. No more "where are you guys?" texts.</p>

        <div class="not-prose my-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <figure class="m-0">
            <img src="${mapModel1}" alt="Game screen with the 'Set a meetup point' option" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">1. Tap "Set a meetup point"</figcaption>
          </figure>
          <figure class="m-0">
            <img src="${mapModel2}" alt="Tapping the field diagram to drop a meetup pin" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">2. Drop a pin exactly where to gather</figcaption>
          </figure>
          <figure class="m-0">
            <img src="${mapModel3}" alt="Game screen now showing the meetup pin on the field" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">3. Everyone sees exactly where to meet</figcaption>
          </figure>
        </div>

        <h3>QR Check-In for Bigger Games</h3>

        <p>Big crowd? Turn on <strong>QR check-in</strong> when creating a game. Players scan your code and they're instantly marked arrived — verified, not just self-reported.</p>

        <div class="not-prose my-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <figure class="m-0">
            <img src="${qr1}" alt="Toggling on 'Expecting a lot of players?' when creating a game" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">1. Turn it on when creating your game</figcaption>
          </figure>
          <figure class="m-0">
            <img src="${qr2}" alt="Host's game screen showing the QR Code button" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">2. Open your check-in code at the field</figcaption>
          </figure>
          <figure class="m-0">
            <img src="${qr3}" alt="The check-in QR code the host shows to players" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">3. Players scan it and they're checked in</figcaption>
          </figure>
        </div>

        <p>Scanning even comes with a little celebration:</p>

        <div class="not-prose my-10 flex justify-center">
          <figure class="m-0 max-w-[220px] w-full">
            <img src="${qr5}" alt="Animation of a player scanning the QR code and getting checked in" class="w-full rounded-2xl border border-[#DDE1E5] shadow-sm" />
            <figcaption class="text-center text-sm text-[#6b7280] mt-2">What players see when they scan</figcaption>
          </figure>
        </div>

        <h3>We'll Text You Before Kickoff</h3>

        <p>A couple hours out, we'll send a notification: still coming? Tap <strong>Yes</strong> to lock your spot, <strong>No</strong> to free it up for the waitlist. No app-opening required.</p>

        <h3>Teams Balance Themselves</h3>

        <p>No more "pick a team" prompt nobody answers. You're auto-placed on whichever side needs players — balanced, no one left unassigned. Switch anytime if you want to play with a friend.</p>

        <h3>Plus the Small Stuff</h3>

        <p>Clearer buttons, less menu-digging, a handful of bugs squashed.</p>

        <p>All of this came from watching how you actually play. Keep the feedback coming — see you on the field. ⚽</p>

        <p><strong>— The Jogo Team</strong></p>
      `,
    },
    {
      id: 7,
      title: "We're Almost There – App Store & Play Store Launch Is Coming!",
      date: "March 2026",
      readTime: "2 min read",
      category: "Dev Update",
      author: "Team Jogo",
      excerpt: "We're 99% done and heading to the App Store and Play Store very soon. Thank you to our incredible community — plus exciting new features like Local Group Chats are on the way!",
      image: null,
      content: `
        <p>We have some huge news to share with the Jogo community — and we couldn't be more excited. 🎉</p>

        <p>After months of hard work, late nights, and a whole lot of passion, we are <strong>99% done</strong> and on the final stretch to launching Jogo on both the <strong>App Store</strong> and <strong>Google Play Store</strong>. The finish line is right in front of us, and we are sprinting toward it.</p>

        <h3>Thank You</h3>

        <p>Before anything else, we want to say something from the bottom of our hearts: <strong>thank you</strong>. The support from this community has been incredible, and it means everything to our small team. You are the reason we push through the hard moments and keep building.</p>

        <p>This app isn't ours — it's <strong>yours</strong>. You asked for it, you believed in it, and now we're about to put it in your hands.</p>

        <h3>What's Coming — New Features</h3>

        <p>We're not just shipping the app — we're shipping it <strong>packed with new features</strong> we know you're going to love:</p>

        <h4>Local Group Chats</h4>

        <p>One of the most requested features is finally here. <strong>Local Group Chats</strong> let you connect with players in your area, organize games on the fly, and stay in the loop with your local soccer community — all without leaving the app. Find your crew, plan your runs, and never miss a game again.</p>

        <h4>More Innovative Features</h4>

        <p>We've got even more exciting features in the pipeline that we can't wait to reveal. We've been listening closely to your feedback and building things that will genuinely change how you experience pickup soccer. <strong>Get ready</strong> — there's a lot more fun coming your way.</p>

        <h3>The Mission Stays the Same</h3>

        <p>From day one, our goal has been simple: make pickup soccer <strong>100% free and accessible for everyone</strong>. No subscriptions, no paywalls, no barriers. Just players, fields, and the beautiful game. And we're just getting started.</p>

        <h3>Stay Ready ⚽</h3>

        <p>The App Store and Google Play Store launch is right around the corner. Follow us on Instagram and keep an eye on this page — we'll announce the moment it goes live.</p>

        <p>Thank you for your patience, your support, and your love for the game. Let's keep pickup soccer free and fun for everyone. See you on the field.</p>

        <p><strong>— The Jogo Team</strong></p>
      `,
    },
    {
      id: 6,
      title: "Dev Update – January 2026",
      date: "January 2026",
      readTime: "2 min read",
      category: "Dev Update",
      author: "Team Jogo",
      excerpt: "Welcome to our first Dev Update! We're working hard to bring you cross-platform compatibility, Squad Chat, and exciting new features. Here's what's happening behind the scenes.",
      image: "/images/JOGOupdate01.png",
      content: `
        <p>Happy New Year, Jogo community! 🎉</p>

        <p>Welcome to our very first <strong>Dev Update</strong>—a new series where we'll share what's happening behind the scenes. Think of this as your catalog to stay connected with our development journey. You can always come back here to check what we've been working on.</p>

        <h3>What We're Building</h3>

        <p>Our small team of <strong>4 passionate soccer enthusiasts</strong> is working hard to bring you some major improvements:</p>

        <h4>Cross-Platform for iOS & Android</h4>

        <p>We're making Jogo <strong>100% compatible for both iOS and Android</strong>. Whether you're on iPhone, Android, tablet, or desktop, you'll get the same smooth experience. We're optimizing performance, fixing bugs, and making sure everything works flawlessly on every device.</p>

        <h4>Squad Chat</h4>

        <p>We're excited to introduce <strong>Squad Chat</strong>—your centralized hub for connecting with the soccer community:</p>

        <ul>
          <li>Chat with friends and teammates in real-time</li>
          <li>Organize pickup games easily</li>
          <li>Create squads within friend groups or communities</li>
          <li>Connect with players who share your passion</li>
        </ul>

        <p>Squad Chat makes it easier than ever to stay connected and organize games on the fly.</p>

        <h4>Plus More Features</h4>

        <p>We're also working on quality-of-life improvements, performance optimizations, and new features based on your feedback. Every update brings us closer to creating the best pickup soccer experience.</p>

        <h3>Small Team, Big Passion</h3>

        <p>Jogo is built by a <strong>small team of just 4 passionate soccer enthusiasts</strong>. We're not a big corporation—we're a small team that genuinely cares about building something special for this community.</p>

        <p>Your <strong>support, patience, and feedback</strong> mean everything to us. When you report bugs, suggest features, or share Jogo with friends, you're helping us build something that will serve soccer communities for years to come.</p>

        <h3>Thank You</h3>

        <p>We're committed to regular updates and transparency. These Dev Updates will be your window into what we're building. Bookmark this page and check back to see our progress!</p>

        <p>Let's build the future of pickup soccer together! ⚽🚀</p>

        <p><strong>— The Jogo Development Team</strong></p>
      `,
    },
    {
      id: 5,
      title: "Jogo Hosts Its First Ever Tournament – A Day to Remember!",
      date: "October 26, 2025",
      readTime: "2 min read",
      category: "Community Update",
      author: "Team Jogo",
      excerpt: "On October 26, 2025, Jogo made history by hosting its first-ever official tournament with 29 passionate players and 4 competitive teams in an epic Real Madrid vs. Barcelona themed showdown.",
      image: "/images/jogo-tournament.jpg",
      content: `
        <p>On October 26, 2025, Jogo made history by hosting its <strong>first-ever official tournament</strong>, marking a major milestone for our growing soccer community.</p>

        <p>With <strong>29 passionate players</strong> showing up and <strong>4 competitive teams</strong>, the energy was electric from the first whistle. The theme? A classic and unforgettable matchup — <strong>Real Madrid vs. Barcelona</strong>. Players wore the colors of their respective sides, bringing out friendly rivalry and plenty of skillful play.</p>

        <h3>A Day of Competition and Community</h3>

        <p>Each match showcased the passion and creativity that define Jogo's mission: connecting local players through the love of the game. The final match came down to the wire, filled with last-minute goals, cheers, and camaraderie — the perfect way to end an incredible day.</p>

        <p>This event wasn't just about competition — it was about <strong>community</strong>. We saw friendships form, players discover new teammates, and everyone leave with a smile.</p>

        <h3>What's Next?</h3>

        <p>Jogo will continue hosting more community tournaments and pick-up events as we grow. Thank you to everyone who showed up, played hard, and made our first tournament a success!</p>

        <p>⚽ Stay tuned for our next event announcement soon!</p>
      `,
    },
    {
      id: 4,
      title: "Beta Launch Success: 170+ Users in Just Days!",
      date: "October 7, 2025",
      readTime: "3 min read",
      category: "Launch Update",
      excerpt: "We've officially launched our beta on the web, and the response has been incredible! In just a few days, over 170 players have joined the Jogo community. Here's what this milestone means and what's coming next.",
      content: `
        <p>We're absolutely blown away! 🎉</p>

        <p>Just days ago, we opened up <strong>Jogo Beta</strong> to the public on the web, and the response has exceeded every expectation. We're thrilled to announce that <strong>over 170 users</strong> have already joined our platform and started finding pickup games!</p>

        <h3>The Numbers Tell a Story</h3>

        <p>When we hit the launch button, we hoped for a positive response. What we got was extraordinary:</p>

        <ul>
          <li><strong>170+ active users</strong> in just a few days</li>
          <li>Games created in <strong>dozens of cities</strong> across the country</li>
          <li>Real-time field activity tracking being used daily</li>
          <li>Countless connections made between local players</li>
          <li>Incredible feedback and feature requests pouring in</li>
        </ul>

        <h3>Thank You to Our Community</h3>

        <p>To every single one of you who signed up, created a profile, posted a game, or joined our community chat—<strong>THANK YOU</strong>. You're not just users; you're the founding members of what we believe will become the largest pickup soccer community in the country.</p>

        <p>Your trust in us during this beta phase means everything. Every bug report, every feature suggestion, every word of encouragement fuels our passion to make Jogo the best it can be.</p>

        <h3>What We're Hearing</h3>

        <p>The feedback has been amazing. Here's what players are saying:</p>

        <ul>
          <li>"Finally, an app that actually helps me find games near me!"</li>
          <li>"The live field tracking is genius—no more showing up to empty fields."</li>
          <li>"I've met more soccer players in 3 days than I did in 3 months."</li>
          <li>"This is exactly what the pickup soccer community needed."</li>
        </ul>

        <h3>We're Just Getting Started</h3>

        <p>While we're celebrating this incredible milestone, our team is <strong>working harder than ever</strong> to make Jogo even better. Here's what we're focused on:</p>

        <ul>
          <li><strong>Performance improvements:</strong> Making the app faster and smoother</li>
          <li><strong>New features:</strong> Based on your feedback, we're building exciting new tools</li>
          <li><strong>Mobile apps:</strong> iOS and Android versions are in active development</li>
          <li><strong>More cities:</strong> Expanding our field database nationwide</li>
          <li><strong>Enhanced matching:</strong> Smarter algorithms to connect you with the perfect games</li>
          <li><strong>Community tools:</strong> Better ways to organize, communicate, and play together</li>
        </ul>

        <h3>This is Your Platform</h3>

        <p>Jogo isn't just our app—it's <strong>yours</strong>. We built it for the pickup soccer community, and we're building it <em>with</em> the community. Your feedback shapes every feature, your stories inspire every improvement, and your passion drives us forward.</p>

        <p>We're in this together, and we're committed to making Jogo the platform you deserve.</p>

        <h3>What's Next?</h3>

        <p>Over the coming weeks and months, you'll see:</p>

        <ul>
          <li>Regular updates with new features and improvements</li>
          <li>More cities and fields added to the platform</li>
          <li>Enhanced social features to grow your soccer network</li>
          <li>Special events and community challenges</li>
          <li>Mobile apps launching for iOS and Android</li>
        </ul>

        <h3>Join Us!</h3>

        <p>If you haven't joined yet, what are you waiting for? Head over to <strong>JogoUs.app</strong> and become part of the revolution. Find games, meet players, and experience pickup soccer the way it was meant to be.</p>

        <p>To our 170+ beta users: you're legends. To everyone joining from here forward: welcome to the family. Together, we're building something special.</p>

        <p>Let's keep the momentum going! ⚽🚀</p>

        <p><strong>— The Jogo Team</strong></p>
      `,
      image: null
    },
    {
      id: 3,
      title: "Early Access is Back! Reopening Due to Popular Demand",
      date: "September 11, 2025",
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
      date: "August 8, 2025",
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
      date: "August 1, 2025",
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

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))],
    []
  );

  const featuredPost = blogPosts[0];
  const restPosts = blogPosts.slice(1);

  const filteredPosts = restPosts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const showFeatured =
    !search.trim() &&
    (activeCategory === 'All' || activeCategory === featuredPost.category);

  const BlogPost = ({ post, onBack }) => (
    <div className="min-h-screen bg-[#EDEEF1] text-[#111111] relative overflow-x-hidden">
      <ReadingProgressBar />
      <AnimatedBackdrop />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#EDEEF1]/80 border-b border-[#DDE1E5]">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#111111]/70 hover:text-emerald-600 transition-all duration-300 group bg-white px-4 py-2 rounded-full border border-[#DDE1E5] hover:border-emerald-400/50 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-lg font-bold text-[#111111]">Journal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-8">
        <article className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <header className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-[#F1F8F3] px-6 py-3 rounded-full text-sm font-medium border border-emerald-400/20 mb-8">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700">{post.category}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight text-[#111111]">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-4 mb-8 text-[#6b7280] text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </header>

          {post.image && (
            <div className="mb-12 rounded-2xl overflow-hidden border border-[#DDE1E5] shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="relative overflow-hidden rounded-2xl bg-white border border-[#DDE1E5] shadow-sm mb-16">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>

            <div className="p-8 sm:p-12 lg:p-16">
              <div
                className="prose prose-lg max-w-none
                prose-headings:text-[#111111] prose-headings:font-bold prose-headings:tracking-tight
                prose-h3:text-2xl prose-h3:mb-6 prose-h3:mt-12 prose-h3:pl-4 prose-h3:border-l-4 prose-h3:border-emerald-500
                prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-8 prose-h4:text-emerald-700
                prose-p:text-[#374151] prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                prose-ul:text-[#374151] prose-ul:mb-6 prose-ul:space-y-2 prose-ul:text-lg
                prose-li:text-[#374151] prose-li:leading-relaxed
                prose-strong:text-[#111111] prose-strong:font-semibold
                prose-a:text-emerald-600 prose-a:no-underline prose-a:font-medium hover:prose-a:text-emerald-500 prose-a:transition-colors"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-16 rounded-2xl overflow-hidden border border-[#DDE1E5] bg-white shadow-sm">
            <div className="p-8 sm:p-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-200 mb-6">
                <Coffee className="text-amber-500" size={28} />
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[#111111] mb-4">
                Support the Team
              </h3>

              <p className="text-[#6b7280] leading-relaxed mb-6 max-w-2xl mx-auto">
                Jogo is built by a <strong className="text-[#111111]">small team of 4 passionate soccer enthusiasts</strong> working hard to keep this platform <strong className="text-emerald-600">100% free</strong>. If you appreciate what we're building, consider buying us a coffee to help us continue this journey.
              </p>

              <a
                href="https://buymeacoffee.com/jogoapp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#111111] font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-md"
              >
                <Coffee size={20} />
                Buy Us a Coffee
              </a>

              <div className="mt-6 pt-6 border-t border-[#DDE1E5]">
                <div className="flex items-center justify-center gap-2 text-[#6b7280] text-sm">
                  <Heart size={14} className="text-red-400" />
                  <span>Every contribution helps us build better features</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pb-16">
            <button
              onClick={onBack}
              className="group relative bg-emerald-600 text-white font-bold px-10 py-5 rounded-full hover:bg-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-600/20"
            >
              <ArrowLeft className="inline mr-3 w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Stories</span>
            </button>
          </div>
        </article>
      </main>
    </div>
  );

  const PostCard = ({ post, index, large = false }) => (
    <article
      className={`group cursor-pointer transform transition-all duration-500 hover:-translate-y-1 ${
        large ? '' : ''
      }`}
      onClick={() => setSelectedPost(post)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#DDE1E5] hover:border-emerald-400/50 shadow-sm hover:shadow-lg transition-all duration-500">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>

        {post.image && (
          <div className={`w-full ${large ? 'h-72' : 'h-56'} overflow-hidden`}>
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className={large ? 'p-8 sm:p-10' : 'p-6 sm:p-8'}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F1F8F3] text-emerald-700 text-xs font-semibold uppercase tracking-wide rounded-full border border-emerald-400/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              {post.category}
            </div>
            <div className="flex items-center gap-3 text-[#9CA3AF] text-sm">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </div>

          <h2
            className={`${
              large ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl'
            } font-bold text-[#111111] mb-3 group-hover:text-emerald-700 transition-colors duration-300 leading-tight`}
          >
            {post.title}
          </h2>

          <p className="text-[#6b7280] leading-relaxed mb-6">{post.excerpt}</p>

          <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all duration-300">
            <span>Read Story</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </article>
  );

  const BlogHome = () => (
    <div className="min-h-screen bg-[#EDEEF1] text-[#111111] relative overflow-x-hidden">
      <AnimatedBackdrop />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#EDEEF1]/80 border-b border-[#DDE1E5]">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToMain}
              className="flex items-center gap-2 text-[#111111]/70 hover:text-emerald-600 transition-all duration-300 group bg-white px-4 py-2 rounded-full border border-[#DDE1E5] hover:border-emerald-400/50 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-lg font-bold text-[#111111]">Journal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#F1F8F3] px-6 py-3 rounded-full text-sm font-medium border border-emerald-400/20 mb-8 animate-fade-in-up">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700">Latest Stories</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 animate-fade-in-up animation-delay-200 text-[#111111] leading-tight">
              Updates
            </h1>

            <p className="text-lg text-[#6b7280] max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              Behind the scenes with the Jogo team — what's new, what's next, and everything in between.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="max-w-4xl mx-auto mb-12 animate-fade-in-up animation-delay-600">
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search updates..."
                className="w-full pl-11 pr-11 py-3 rounded-full bg-white border border-[#DDE1E5] text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111111] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white border-[#DDE1E5] text-[#6b7280] hover:border-emerald-400/50 hover:text-emerald-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured latest post */}
          {showFeatured && (
            <div className="max-w-4xl mx-auto mb-10">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                Latest
              </div>
              <PostCard post={featuredPost} index={0} large />
            </div>
          )}

          {/* Post grid */}
          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index + 1} />
            ))}
          </div>

          {filteredPosts.length === 0 && !showFeatured && (
            <div className="text-center py-16 text-[#9CA3AF]">
              No stories match "{search}" yet.
            </div>
          )}

          <div className="mt-20 mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-white border border-[#DDE1E5] shadow-sm text-center max-w-3xl mx-auto">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-200/40 to-transparent rounded-full blur-3xl"></div>

              <div className="relative p-8 sm:p-12">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-[#111111]">
                  Stay in the Loop
                </h3>
                <p className="text-[#6b7280] text-lg leading-relaxed max-w-xl mx-auto mb-8">
                  Get the latest updates, behind-the-scenes content, and be first to know when we launch something new.
                </p>

                <button
                  onClick={onBackToMain}
                  className="group relative bg-emerald-600 text-white font-bold px-8 py-4 rounded-full hover:bg-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-600/20"
                >
                  <span>Join the Journey</span>
                  <ArrowRight className="inline ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const styles = `
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
    .animate-blob { animation: blob 9s infinite; }
    .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
    .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
    .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
    .animation-delay-2000 { animation-delay: -3s; }
    .animation-delay-4000 { animation-delay: -6s; }

    .prose p { margin-bottom: 1.5rem !important; }
    .prose h3 { margin-top: 2rem !important; margin-bottom: 1rem !important; }
    .prose h4 { margin-top: 1.5rem !important; margin-bottom: 0.5rem !important; }
    .prose ul { margin-bottom: 1.5rem !important; }
    .prose li { margin-bottom: 0.5rem !important; }
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

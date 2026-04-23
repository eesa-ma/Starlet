import React, { useEffect, useState, useRef } from 'react';
import './App.css';

const sectionsData = [
  { 
    id: 1, 
    type: 'mission',
    title: "Who We Are", 
    content: "Starlet 5.0 is a fun and safe hackathon for girls and gender minorities. We want to show you that technology is just a tool for your amazing imagination!",
    image: "https://img.freepik.com/free-vector/hand-drawn-coding-concept-illustration_23-2148810394.jpg?t=st=1713876000~exp=1713879600~hmac=7a5"
  },
  { 
    id: 2, 
    type: 'tracks',
    title: "Pick Your Track", 
    content: "Doodle with Code, Build a Bot, or Save the Planet. Whatever you care about, there's a place for you to build it here.",
    image: "https://img.freepik.com/free-vector/programmers-concept-with-flat-design_23-2147854911.jpg"
  },
  { 
    id: 3, 
    type: 'timeline',
    title: "The Roadmap", 
    content: "Registration Starts: May 15th | Hacking Begins: June 15th | Final Demo Day: June 20th.",
    image: "https://img.freepik.com/free-vector/modern-business-timeline-concept_23-2147926129.jpg"
  },
  { 
    id: 4, 
    type: 'mentors',
    title: "Cool Mentors", 
    content: "Meet real-life tech stars who will help you every step of the way. No question is too silly!",
    image: "https://img.freepik.com/free-vector/flat-design-character-design-programmers_23-2147854910.jpg"
  },
  { 
    id: 5, 
    type: 'community',
    title: "Make New Friends", 
    content: "Join girls from all over the world. Learn together, laugh together, and build something together.",
    image: "https://img.freepik.com/free-vector/teamwork-concept-illustration_114360-1014.jpg"
  },
  {
    id: 6,
    type: 'rules',
    title: "The Danger Zone: Rules",
    content: "Read carefully! These rules keep our hackathon fair and fun for everyone.",
    image: "/rules.png"
  },
  {
    id: 7,
    type: 'sponsors',
    title: "Our Awesome Sponsors",
    content: "These amazing organizations help us make Starlet 5.0 a reality!",
    image: "/sponsors.png"
  },
  {
    id: 8,
    type: 'gallery',
    title: "The Impact Gallery",
    content: "A look back at the amazing projects and memories from our community.",
    image: "/gallery.png"
  },
  {
    id: 9,
    type: 'prizes',
    title: "Rewards & Prizes",
    content: "We celebrate every effort! Here are the rewards for our top performers.",
    image: "/prizes.png"
  },
  {
    id: 10,
    type: 'about',
    title: "About Mind Empowered",
    content: "Mind Empowered is a community-driven initiative dedicated to making technology accessible, inclusive, and fun for girls everywhere.",
    image: "/about.png"
  },
  {
    id: 11,
    type: 'faq',
    title: "Your Questions, Answered",
    content: "Everything you need to know about Starlet 5.0 in one place.",
    image: "/faq.png"
  },
  {
    id: 12,
    type: 'contact',
    title: "Get in Touch",
    content: "Have a question? Our team is here to support you 24/7.",
    image: "/contact.png"
  },
  {
    id: 13,
    type: 'newsletter',
    title: "Stay in the Loop",
    content: "Subscribe to our newsletter for updates, tips, and future hackathon announcements!",
    image: "/newsletter.png"
  }
];

function App() {
  const [smoothProgress, setSmoothProgress] = useState(0);
  const sectionRefs = useRef([]);
  const requestRef = useRef();

  const animate = () => {
    setSmoothProgress(prev => {
      const target = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const lerpFactor = 0.1;
      return prev + (target - prev) * lerpFactor;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cancelAnimationFrame(requestRef.current);
      observer.disconnect();
    };
  }, []);

  // Floating Sparkle Positions
  const sparkleTop = 20 + (smoothProgress * 60);
  const sparkleLeft = 50 + (Math.sin(smoothProgress * Math.PI * 4) * 10);

  return (
    <div className="App">
      {/* Floating Sparkles */}
      <div className="sparkle" style={{ top: `${sparkleTop}%`, left: `${sparkleLeft}%` }}>✦</div>
      <div className="sparkle" style={{ top: `${sparkleTop - 10}%`, left: `${sparkleLeft + 20}%`, animationDelay: '0.5s' }}>✧</div>
      <div className="sparkle" style={{ top: `${sparkleTop + 15}%`, left: `${sparkleLeft - 15}%`, animationDelay: '1s' }}>✦</div>

      <header>
        <div className="logo-circle">
          <img src="/public/brand/Logo.png" alt="Starlet Logo" onError={(e) => {e.target.src='/brand/Logo.png'}} />
        </div>

        <nav className="nav-links">
          <a href="#mission" className="nav-link">Mission</a>
          <a href="#tracks" className="nav-link">Tracks</a>
          <a href="#timeline" className="nav-link">Timeline</a>
          <a href="#rules" className="nav-link">Rules</a>
          <a href="#sponsors" className="nav-link">Sponsors</a>
        </nav>

        <div className="mobile-menu-btn">
          <img src="/icons/hamburger.svg" alt="menu" />
        </div>

        <div className="auth-btns">
          <a href="#" className="login-btn">LOGIN</a>
          <a href="#" className="join-btn">SIGN UP!</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="badge-main">MIND EMPOWERED PRESENTS</div>
          <h1 className="text-3d">STARLET 5.0</h1>
          <div className="subtitle-large">
            A HACKATHON FOR GIRLS AND OTHER GENDER MINORITIES
          </div>
          
          <div className="hero-ctas">
            <a href="#" className="join-btn">REGISTER NOW</a>
            <a href="#" className="btn-secondary">LEARN MORE</a>
          </div>

          <div className="illustration-box">
             <img src="/hero.png" alt="Starlet Hero" />
          </div>

          <div className="trust-bar">
            <div className="trust-item"><span>500+</span> HACKERS</div>
            <div className="trust-item"><span>15+</span> COUNTRIES</div>
            <div className="trust-item"><span>$10K</span> PRIZES</div>
          </div>
        </section>

        <div className="content-wrapper">
          {sectionsData.map((section, index) => (
            <div 
              key={section.id} 
              id={section.type}
              className={`section-block ${section.type}-section`} 
              ref={el => sectionRefs.current[index] = el}
            >
              {section.type === 'timeline' ? (
                <div className="whiteboard-container">
                  <div className="wall-clock">
                    <div className="clock-center">
                      <div className="clock-hand hand-hour"></div>
                      <div className="clock-hand hand-min"></div>
                    </div>
                  </div>
                  <div className="magnetic-paper handwritten">
                    <div className="magnet"></div>
                    <strong>Note:</strong><br/>
                    Don't forget your laptops! <img src="/icons/laptop.svg" className="inline-icon" alt="laptop" />
                  </div>
                  <h3 className="whiteboard-title handwritten">Starlet 5.0 Timeline</h3>
                  <div className="handwritten">
                    <div className="timeline-event">
                      <span className="timeline-date">May 15th</span>
                      <span className="timeline-desc">Registration Opens! <img src="/icons/rocket.svg" className="inline-icon" alt="rocket" /></span>
                    </div>
                    <div className="timeline-event">
                      <span className="timeline-date">June 1st</span>
                      <span className="timeline-desc">Team Formation Mixer <img src="/icons/users.svg" className="inline-icon" alt="users" /></span>
                    </div>
                    <div className="timeline-event">
                      <span className="timeline-date">June 10th</span>
                      <span className="timeline-desc">Workshops & Training <img src="/icons/calendar.svg" className="inline-icon" alt="calendar" /></span>
                    </div>
                    <div className="timeline-event">
                      <span className="timeline-date">June 15th</span>
                      <span className="timeline-desc">Hacking Begins! 🔥</span>
                    </div>
                    <div className="timeline-event">
                      <span className="timeline-date">June 20th</span>
                      <span className="timeline-desc">Grand Finale & Demo <img src="/icons/trophy.svg" className="inline-icon" alt="trophy" /></span>
                    </div>
                  </div>
                </div>
              ) : section.type === 'rules' ? (
                <div className="section-content">
                  <div className="hazard-stripes"></div>
                  <h2 className="text-3d warning-title" style={{ fontSize: '3rem' }}>
                    <img src="/icons/warning.svg" className="title-icon" alt="warning" /> RULES & REGS
                  </h2>
                  <div className="rules-grid">
                    <div className="warning-item" style={{"--r": -1}}>
                      <div className="warning-icon"><img src="/icons/warning.svg" className="card-icon" alt="warning" /></div>
                      <p><strong>NO PLAGIARISM:</strong> Code must be built during the hackathon.</p>
                    </div>
                    <div className="warning-item" style={{"--r": 1.5}}>
                      <div className="warning-icon"><img src="/icons/users.svg" className="card-icon" alt="users" /></div>
                      <p><strong>RESPECT ALL:</strong> Be kind to mentors and teammates.</p>
                    </div>
                    <div className="warning-item" style={{"--r": -0.8}}>
                      <div className="warning-icon"><img src="/icons/calendar.svg" className="card-icon" alt="calendar" /></div>
                      <p><strong>BE ON TIME:</strong> Submissions after the deadline won't be accepted.</p>
                    </div>
                    <div className="warning-item" style={{"--r": 1.2}}>
                      <div className="warning-icon"><img src="/icons/warning.svg" className="card-icon" alt="warning" /></div>
                      <p><strong>STAY SAFE:</strong> Follow our online safety guidelines.</p>
                    </div>
                  </div>
                </div>
              ) : section.type === 'sponsors' ? (
                <div className="section-content">
                  <h2 className="text-3d" style={{ fontSize: '2.5rem' }}>{section.title}</h2>
                  <div className="sponsor-grid">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="sponsor-placeholder">
                        YOUR LOGO HERE
                      </div>
                    ))}
                  </div>
                </div>
              ) : section.type === 'gallery' ? (
                <div className="section-content">
                  <h2 className="text-3d" style={{ fontSize: '2.5rem' }}>{section.title}</h2>
                  <div className="gallery-grid">
                    <div className="polaroid" style={{"--r": -2}}>
                      <div className="polaroid-img">📷<span>Coming Soon</span></div>
                      <div className="polaroid-caption">Opening Ceremony</div>
                    </div>
                    <div className="polaroid" style={{"--r": 3}}>
                      <div className="polaroid-img">👩‍💻<span>Coming Soon</span></div>
                      <div className="polaroid-caption">Hacking in Progress</div>
                    </div>
                    <div className="polaroid" style={{"--r": -1.5}}>
                      <div className="polaroid-img">🏆<span>Coming Soon</span></div>
                      <div className="polaroid-caption">Grand Finale</div>
                    </div>
                  </div>
                </div>
              ) : section.type === 'prizes' ? (
                <div className="section-content">
                  <h2 className="text-3d" style={{ fontSize: '2.5rem' }}>{section.title}</h2>
                  <div className="prize-grid">
                    <div className="prize-card">
                      <div className="prize-icon"><img src="/icons/trophy.svg" style={{width: '80px'}} alt="trophy" /></div>
                      <h3 className="text-3d" style={{fontSize: '1.5rem'}}>1st Place</h3>
                      <p>$5,000 + Tech Swag</p>
                    </div>
                    <div className="prize-card">
                      <div className="prize-icon"><img src="/icons/trophy.svg" style={{width: '70px', opacity: 0.7}} alt="trophy" /></div>
                      <h3 className="text-3d" style={{fontSize: '1.5rem'}}>2nd Place</h3>
                      <p>$3,000 + Swag</p>
                    </div>
                    <div className="prize-card">
                      <div className="prize-icon"><img src="/icons/trophy.svg" style={{width: '60px', opacity: 0.5}} alt="trophy" /></div>
                      <h3 className="text-3d" style={{fontSize: '1.5rem'}}>3rd Place</h3>
                      <p>$2,000 + Swag</p>
                    </div>
                  </div>
                </div>
              ) : section.type === 'faq' ? (
                <div className="section-content">
                  <h2 className="text-3d" style={{ fontSize: '2.5rem' }}>{section.title}</h2>
                  <div className="faq-grid">
                    <div className="faq-item">
                      <div className="faq-question">I'm a beginner, can I join?</div>
                      <div className="faq-answer">YES! Starlet is for everyone. We have mentors to help you from step one.</div>
                    </div>
                    <div className="faq-item">
                      <div className="faq-question">Is there a registration fee?</div>
                      <div className="faq-answer">Nope! Starlet 5.0 is completely FREE for everyone.</div>
                    </div>
                    <div className="faq-item">
                      <div className="faq-question">How many people in a team?</div>
                      <div className="faq-answer">Teams can be between 2 to 4 girls.</div>
                    </div>
                  </div>
                </div>
              ) : section.type === 'contact' ? (
                <div className="section-content">
                  <h2 className="text-3d" style={{ fontSize: '2.5rem' }}>{section.title}</h2>
                  <div className="contact-form">
                    <input type="text" placeholder="Your Name" />
                    <input type="email" placeholder="Your Email" />
                    <textarea placeholder="How can we help?"></textarea>
                    <button className="join-btn" style={{width: 'fit-content'}}>SEND MESSAGE</button>
                  </div>
                </div>
              ) : section.type === 'newsletter' ? (
                <div className="section-content" style={{textAlign: 'center'}}>
                  <h2 className="text-3d" style={{ fontSize: '2.5rem' }}>{section.title}</h2>
                  <p style={{color: '#fff'}}>{section.content}</p>
                  <div className="newsletter-input-group">
                    <input type="email" placeholder="Enter your email" />
                    <button className="btn">SUBSCRIBE</button>
                  </div>
                </div>
              ) : (
                <div className="section-content">
                  <h2 className="text-3d" style={{ fontSize: '2.5rem' }}>{section.title}</h2>
                  <div className="section-inner">
                    <p>{section.content}</p>
                    <div className="section-visual-small">
                        <img src={section.image} alt={section.title} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-circle">
              <img src="/public/brand/Logo.png" alt="Starlet Logo" onError={(e) => {e.target.src='/brand/Logo.png'}} />
            </div>
            <h3>STARLET 5.0</h3>
            <p>Empowering the next generation of women in technology through community, creativity, and code.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#mission">Our Mission</a></li>
              <li><a href="#tracks">Tracks</a></li>
              <li><a href="#timeline">Timeline</a></li>
              <li><a href="#rules">Rules</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a href="#">Discord Server</a></li>
              <li><a href="#">Code of Conduct</a></li>
              <li><a href="#">Mentorship</a></li>
              <li><a href="#">Past Events</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@mind-empowered.org">hello@mind-empowered.org</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="https://mind-empowered.org">Website</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Starlet 5.0 | Mind Empowered Initiative</p>
          <p>Made with ❤️ for Every Woman</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

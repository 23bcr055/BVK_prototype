// Simple animation function that works with or without GSAP
function initAnimations() {
  // Check if GSAP is available
  const hasGSAP = typeof gsap !== 'undefined';
  const hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
  
  // Register plugins if available
  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Animate hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    // Add a class to trigger CSS animations as fallback
    heroSection.classList.add('animate-in');
    
    // Use GSAP if available
    if (hasGSAP) {
      gsap.from(heroSection, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => heroSection.classList.add('animated')
      });

      // Animate hero content
      const heroContent = heroSection.querySelector('.overlay');
      if (heroContent) {
        gsap.from(heroContent.children, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.3,
          onComplete: () => heroContent.classList.add('animated')
        });
      }
    }
  }

  // Animate cards on scroll
  const animateCards = () => {
    const cards = document.querySelectorAll('.card, .school-card, .testimonial-card, .feature-card, .counter-box');
    
    // Add CSS class as fallback
    cards.forEach(card => card.classList.add('animate-on-scroll'));
    
    // Use GSAP if available
    if (hasGSAP) {
      cards.forEach((card, i) => {
        const animation = {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
          onComplete: () => card.classList.add('animated')
        };
        
        // Add scroll trigger if available
        if (hasScrollTrigger) {
          animation.scrollTrigger = {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true
          };
        }
        
        gsap.from(card, animation);
      });
    }
  };

  // Initialize card animations
  if (document.readyState === 'complete') {
    animateCards();
  } else {
    window.addEventListener('load', animateCards);
  }

  // Animate section headers
  const headers = document.querySelectorAll('.section-header, h2, h3, h4');
  headers.forEach(header => {
    // Add CSS class as fallback
    header.classList.add('animate-in');
    
    // Use GSAP if available
    if (hasGSAP) {
      const animation = {
        x: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => header.classList.add('animated')
      };
      
      // Add scroll trigger if available
      if (hasScrollTrigger) {
        animation.scrollTrigger = {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        };
      }
      
      gsap.from(header, animation);
    }

    // Animate the underline
    gsap.from(header + '::after', {
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.3
    });
  });

  // Parallax effect for hero section
  const heroVideo = document.querySelector('.hero-video video');
  if (heroVideo) {
    gsap.to(heroVideo, {
      y: 50,
      scrollTrigger: {
        trigger: '.school-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Hover animations for buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        y: -3,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // Animate counter numbers
  const counters = document.querySelectorAll('.count');
  if (counters.length > 0) {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // 2 seconds
      const step = target / (duration / 16); // 60fps
      let current = 0;

      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.ceil(current).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 80%',
        once: true,
        onEnter: () => updateCounter()
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#!') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        // Use GSAP if available
        if (hasGSAP && typeof gsap.to === 'function') {
          gsap.to(window, {
            duration: 0.8,
            scrollTo: { 
              y: target, 
              offsetY: 80,
              autoKill: true
            },
            ease: 'power2.inOut'
          });
        } else {
          // Fallback to native smooth scroll
          target.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Animate navigation on scroll
  const header = document.querySelector('.header');
  if (header) {
    // Add scroll event listener as fallback
    const handleScroll = () => {
      if (window.scrollY > 100) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    // Use GSAP ScrollTrigger if available
    if (hasGSAP && hasScrollTrigger) {
      gsap.to(header, {
        scrollTrigger: {
          trigger: 'body',
          start: '100px top',
          end: 'max',
          onEnter: () => header.classList.add('header-scrolled'),
          onLeaveBack: () => header.classList.remove('header-scrolled'),
          onUpdate: (self) => {
            if (self.direction === 1) {
              header.classList.add('header-scrolled');
            } else if (self.direction === -1 && window.scrollY < 50) {
              header.classList.remove('header-scrolled');
            }
          }
        }
      });
    }
  }
});

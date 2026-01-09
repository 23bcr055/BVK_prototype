// Site JS: GSAP animations, counters, nav toggle, and reduced-motion handling
// Startup debug: log load and show any runtime errors on-page to help debugging
(function () {
  console.log('js/script.js loaded');
  (function attachErrorReporter() {
    function ensureBanner() {
      let el = document.getElementById('js-error-banner');
      if (!el) {
        el = document.createElement('div');
        el.id = 'js-error-banner';
        el.style.cssText = 'position:fixed;left:12px;right:12px;bottom:18px;padding:12px;border-radius:8px;background:#fff1f0;color:#611a15;box-shadow:0 12px 30px rgba(12,15,20,0.12);z-index:99999;max-width:800px;margin:0 auto;display:none;font-size:13px';
        document.body && document.body.appendChild(el);
      }
      return el;
    }
    window.addEventListener('error', (e) => {
      try { const el = ensureBanner(); el.textContent = `Error: ${e.message} at ${e.filename}:${e.lineno}`; el.style.display = 'block'; }
      catch (err) { /* ignore */ }
      console.error('Runtime error', e);
    });
    window.addEventListener('unhandledrejection', (ev) => {
      try { const el = ensureBanner(); const msg = ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason); el.textContent = `Unhandled promise rejection: ${msg}`; el.style.display = 'block'; }
      catch (err) { }
      console.error('Unhandled promise rejection', ev);
    });
  })();

  const header = document.querySelector('.header');
  const toggle = document.querySelectorAll('.nav-toggle');
  const navLinks = document.querySelectorAll('.nav a');

  // mobile nav toggle (keeps previous behavior)
  if (header && toggle.length) {
    header.classList.remove('nav-open');
    toggle.forEach(btn => btn.setAttribute('aria-expanded', 'false'));

    toggle.forEach(btn => btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      header.classList.toggle('nav-open');

      // Staggered link reveal for mobile menu
      if (!expanded) {
        gsap.from('.nav a', {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }));

    navLinks.forEach(link => link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      toggle.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    }));

    document.addEventListener('click', (e) => { if (!header.classList.contains('nav-open')) return; const inside = e.target.closest('.header'); if (!inside) { header.classList.remove('nav-open'); toggle.forEach(btn => btn.setAttribute('aria-expanded', 'false')); } });
  }

  // respect user's reduced motion preference
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Counter animation function
  let _countersAnimated = false;

  function animateCounters(force) {
    console.log('animateCounters called');

    // Get all counter elements
    const counters = document.querySelectorAll('.count');
    console.log('Found counters:', counters.length);

    if (!counters.length) {
      console.log('No counters found');
      return;
    }

    // Check if element is in viewport (with some offset)
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      // Check if element is in viewport with some padding
      const vertInView = (rect.top <= windowHeight * 0.9) && (rect.bottom >= 0);
      const horzInView = (rect.left <= windowWidth) && (rect.right >= 0);

      return (vertInView && horzInView);
    }

    // Animate a single counter
    function animateCounter(counter) {
      console.log('Animating counter:', counter);
      const target = parseInt(counter.getAttribute('data-target'), 10);

      if (isNaN(target)) {
        console.error('Invalid target value for counter:', counter);
        return;
      }

      // Mark as animated
      counter.dataset.animated = 'true';
      window.dispatchEvent(new CustomEvent('counters-updated'));

      // If reduced motion is preferred, just set the final value
      if (reduceMotion) {
        counter.textContent = target.toLocaleString();
        return;
      }

      // Animation settings
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      // Animation function
      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out function for smoother animation
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        const currentValue = Math.floor(easeOut(progress) * target);

        // Update the counter
        counter.textContent = currentValue.toLocaleString();

        // Continue animation if not finished
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      // Start the animation
      requestAnimationFrame(updateCounter);
    }

    // Check which counters are in view and animate them
    function checkCounters() {
      console.log('Checking counters...');
      let allAnimated = true;
      let animatedCount = 0;

      counters.forEach((counter, index) => {
        if (counter.dataset.animated !== 'true') {
          if (force || isInViewport(counter)) {
            console.log(`Counter ${index} is in view, animating...`);
            animateCounter(counter);
            animatedCount++;
          } else {
            console.log(`Counter ${index} not in view yet`);
            allAnimated = false;
          }
        } else {
          animatedCount++;
        }
      });

      console.log(`Animated ${animatedCount} of ${counters.length} counters`);

      // If all counters are animated, remove event listeners
      if (allAnimated) {
        console.log('All counters animated, removing scroll listener');
        _countersAnimated = true;
        window.removeEventListener('scroll', checkCounters);
      }
    }

    // Initial check
    checkCounters();

    // Add scroll listener to check for counters coming into view
    if (!_countersAnimated) {
      console.log('Adding scroll listener for counters');
      window.addEventListener('scroll', checkCounters, { passive: true });

      // Also check again after a short delay to catch any missed animations
      setTimeout(checkCounters, 500);
    }

    // Force check on window resize in case layout changes
    window.addEventListener('resize', checkCounters);
  }


  // ensure counters animate when impact section enters view (IntersectionObserver fallback)
  function observeCounters() {
    const section = document.querySelector('.impact-section');
    if (!section) return;

    function tryAnimateIfVisible() {
      try {
        const rect = section.getBoundingClientRect();
        // if it's already mostly visible, animate immediately
        if (rect.top < window.innerHeight * 0.95) { animateCounters(true); return true; }
      } catch (e) { /* ignore */ }
      return false;
    }

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            try { animateCounters(true); } catch (e) { console.error('animateCounters error', e); }
            observer.disconnect();
          }
        });
      }, { threshold: 0.25 });
      obs.observe(section);

      // also do a one-time visibility check (handles cases where observer didn't fire on load)
      try { if (!tryAnimateIfVisible()) { setTimeout(() => { if (!_countersAnimated) tryAnimateIfVisible(); }, 1100); } } catch (e) { }
    } else {
      // fallback: run once after load
      window.addEventListener('load', () => setTimeout(animateCounters, 300));
    }
  }

  // setup scroll-triggered animations
  function setupAnimations() {
    if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // ensure visibility
      document.querySelectorAll('.section, .impact-section, .founder-section, .testimonial-card').forEach(el => { el.style.opacity = ''; el.style.transform = ''; });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Text Reveal & Cycling
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
      gsap.from(heroTitle, { y: 50, opacity: 0, duration: 1, ease: 'power3.out' });
    }

    // Hero Subtitle Cycling (like SSVM)
    const heroSubtitle = document.querySelector('.hero p');
    if (heroSubtitle && heroSubtitle.textContent.includes('since')) {
      const originalText = heroSubtitle.textContent;
      const parts = originalText.split('since');
      if (parts.length === 2) {
        const words = ['Inspire', 'Challenge', 'Transform', 'Nurture'];
        let wordIndex = 0;

        // Initial fade in
        gsap.from(heroSubtitle, { y: 30, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out' });

        // We could add cycling logic here if we wanted to replace a specific part, 
        // but let's keep it simple for now or implement a specific element for it.
      }
    }

    // 2. Uniform Section Reveals (Fade In Up for headers only now)
    gsap.utils.toArray('.section-header, .campus-content').forEach(el => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // 3. Split Reveal Animations (Image from Left, Text from Right)
    const splitElements = document.querySelectorAll('.about-image, .founder-photo, .welcome-left, .welcome-center, .about-content, .founder-text, .welcome-right, .principal-content, .principal-image');

    splitElements.forEach(el => {
      const container = el.parentElement;
      if (!container) return;

      const isReversed = container.classList.contains('reverse-layout') || getComputedStyle(container).flexDirection === 'row-reverse';
      const isFirstChild = el === container.firstElementChild;

      let xOffset = 0;
      if (!isReversed) {
        xOffset = isFirstChild ? -80 : 80;
      } else {
        xOffset = isFirstChild ? 80 : -80;
      }

      gsap.from(el, {
        x: xOffset,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        }
      });
    });


    // 4. Staggered Card Reveals (Grid elements)
    const cardGrids = ['.school-card', '.mission-card', '.stat-item', '.journey-item', '.event-card', '.testimonial-card'];
    cardGrids.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length) {
        gsap.from(elements, {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: elements[0].parentElement,
            start: 'top 85%'
          }
        });
      }
    });

    // 4. Image Zoom Reveal
    gsap.utils.toArray('.about-image img, .welcome-center img, .campus-image img').forEach(img => {
      gsap.from(img, {
        scale: 1.1,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: img, start: 'top 90%' }
      });
    });

    // 5. Principal Message / Blockquote
    gsap.from('blockquote', {
      x: -30,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: { trigger: 'blockquote', start: 'top 85%' }
    });

    // 6. Sticky Header Transition refinement
    ScrollTrigger.create({
      start: 'top -50',
      onEnter: () => header.classList.add('header-scrolled'),
      onLeaveBack: () => header.classList.remove('header-scrolled')
    });

    // 7. Alternating Floating Animation for Home Page School Cards
    if (document.body.classList.contains('home')) {
      gsap.fromTo('.school-card.bvk', { y: -20 }, {
        y: 20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      gsap.fromTo('.school-card.bks', { y: 20 }, {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    window.addEventListener('pageshow', () => { ScrollTrigger.refresh(); });
    window.addEventListener('load', () => { ScrollTrigger.refresh(); });
  }

  // hero video playback respecting reduced-motion
  function setupHeroVideos() {
    const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const videos = document.querySelectorAll('.school-hero .hero-video');
    videos.forEach(v => {
      // If user prefers reduced motion, ensure we do not autoplay video
      if (reduceMotionMQ.matches) {
        try { v.pause(); } catch (e) { }
        // keep poster visible
        return;
      }
      // try to play; browsers may block autoplay if not muted
      const p = v.play();
      if (p && typeof p.then === 'function') { p.catch(() => { /* autoplay blocked; poster stays */ }); }
    });

    // re-evaluate when preference changes
    if (typeof reduceMotionMQ.addEventListener === 'function') {
      reduceMotionMQ.addEventListener('change', () => setupHeroVideos());
    } else if (typeof reduceMotionMQ.addListener === 'function') {
      reduceMotionMQ.addListener(() => setupHeroVideos());
    }
  }

  // initial actions
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize counters
    animateCounters();

    // Re-check counters on scroll
    window.addEventListener('scroll', () => {
      if (!_countersAnimated) {
        animateCounters();
      }
    }, { passive: true });
    try {
      // mark JS is enabled (for CSS fallbacks)
      document.documentElement.classList.add('js-enabled');
      if (typeof gsap !== 'undefined') document.documentElement.classList.add('gsap-enabled');
      else document.documentElement.classList.add('no-gsap');

      // set counters immediately to 0; we'll animate when visible
      document.querySelectorAll('.count').forEach(c => { c.textContent = '0'; c.dataset.animated = '0'; });

      // run setup functions with defensive error reporting so one failure doesn't stop the rest
      try { observeCounters(); } catch (e) { console.error('observeCounters failed', e); }
      try { setupAnimations(); } catch (e) { console.error('setupAnimations failed', e); }
      try { setupHeroVideos(); } catch (e) { console.error('setupHeroVideos failed', e); }
      try { setupNotices(); } catch (e) { console.error('setupNotices failed', e); }
      try { setupGalleryInteractions(); } catch (e) { console.error('setupGalleryInteractions failed', e); }
      try { setupHomeHeaderBehavior(); } catch (e) { console.error('setupHomeHeaderBehavior failed', e); }

      // NEXT-GEN INITIALIZATION
      try { setupMagneticElements(); } catch (e) { console.error('setupMagneticElements failed', e); }
      try { setupParallaxParticles(); } catch (e) { console.error('setupParallaxParticles failed', e); }
    } catch (err) { console.error('DOMContentLoaded handler error', err); }
  });

  // notices rotator: cycles .notice-item elements by translating container
  function setupNotices() {
    const scroller = document.querySelector('.notice-scroller');
    if (!scroller) return;
    const items = Array.from(scroller.querySelectorAll('.notice-item'));
    if (!items.length) return;
    let idx = 0;
    function show(i) {
      scroller.style.transition = 'transform 520ms ease';
      scroller.style.transform = `translateX(-${i * (items[0].offsetWidth + 18)}px)`;
    }
    window.addEventListener('resize', () => { show(idx); });
    setInterval(() => { idx = (idx + 1) % items.length; try { show(idx); } catch (e) { } }, 3500);
  }

  // home page header behaviour: sticky + compacting on scroll (and smooth Home click)
  function setupHomeHeaderBehavior() {
    try {
      if (!document.body.classList.contains('home')) return;
      const onScroll = () => { if (window.scrollY > 24) header.classList.add('scrolled'); else header.classList.remove('scrolled'); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      // Smooth scroll to top when clicking Home while already on the homepage
      document.querySelectorAll('.nav a').forEach(a => {
        a.addEventListener('click', (e) => {
          try {
            const href = a.getAttribute('href') || '';
            const isHomeLink = href === '/' || href === './' || href === '' || href === 'index.html' || href === '../';
            if (isHomeLink && (location.pathname === '/' || location.pathname.endsWith('index.html') || location.pathname.endsWith('/'))) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              header.classList.remove('nav-open');
              toggle.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
            }
          } catch (err) { console.error('home link handler', err); }
        });
      });
    } catch (err) { console.error('setupHomeHeaderBehavior failed', err); const el = document.getElementById('js-error-banner'); if (el) { el.textContent = 'Warning: header behavior failed to initialize'; el.style.display = 'block'; } }
  }



  // notices rotator: cycles .notice-item elements by translating container
  function setupNotices() {
    const scroller = document.querySelector('.notice-scroller');
    if (!scroller) return;
    const items = Array.from(scroller.querySelectorAll('.notice-item'));
    if (!items.length) return;
    let idx = 0;
    function show(i) {
      scroller.style.transition = 'transform 520ms ease';
      scroller.style.transform = `translateX(-${i * (items[0].offsetWidth + 18)}px)`;
    }
    window.addEventListener('resize', () => { show(idx); });
    setInterval(() => { idx = (idx + 1) % items.length; try { show(idx); } catch (e) { } }, 3500);
  }

  // gallery lightbox + interactions
  function setupGalleryInteractions() {
    const galleries = document.querySelectorAll('.school-gallery');
    if (!galleries.length) return;

    // create lightbox container if missing
    let lb = document.getElementById('site-lightbox');
    if (!lb) {
      lb = document.createElement('div'); lb.id = 'site-lightbox'; lb.className = 'lightbox'; lb.hidden = true;
      lb.innerHTML = '<button class="lightbox-close" aria-label="Close">✕</button><button class="lightbox-prev" aria-label="Previous">‹</button><button class="lightbox-next" aria-label="Next">›</button><div class="lightbox-stage"><img class="lightbox-image" alt=""><div class="lightbox-caption"></div></div>';
      document.body.appendChild(lb);
    }

    const thumbs = Array.from(document.querySelectorAll('.school-gallery img, .gallery-thumb')).filter((el, i, arr) => arr.indexOf(el) === i);
    if (!thumbs.length) return;
    const items = thumbs;

    items.forEach((img, idx) => {
      img.classList.add('gallery-thumb');
      img.setAttribute('tabindex', '0');
      img.addEventListener('click', () => openAt(idx));
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(idx); } });
    });

    let current = 0;
    const stageImg = lb.querySelector('.lightbox-image');
    const caption = lb.querySelector('.lightbox-caption');

    function openAt(i) {
      current = i;
      const src = items[current].dataset.full || items[current].src;
      stageImg.src = src;
      stageImg.alt = items[current].alt || '';
      caption.textContent = items[current].alt || '';
      lb.hidden = false;
      document.documentElement.classList.add('lightbox-open');
      const focusable = lb.querySelector('.lightbox-close'); if (focusable && typeof focusable.focus === 'function') focusable.focus();
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(lb, { autoAlpha: 0, scale: 0.98 }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'power2.out' });
        gsap.fromTo(stageImg, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 });
      }
    }

    function closeLB() {
      if (typeof gsap !== 'undefined') { gsap.to(lb, { autoAlpha: 0, scale: 0.98, duration: 0.18, onComplete: () => { lb.hidden = true; } }); } else { lb.hidden = true; }
      document.documentElement.classList.remove('lightbox-open');
    }
    function prev() { openAt((current - 1 + items.length) % items.length); }
    function next() { openAt((current + 1) % items.length); }

    const btnClose = lb.querySelector('.lightbox-close');
    const btnPrev = lb.querySelector('.lightbox-prev');
    const btnNext = lb.querySelector('.lightbox-next');
    btnClose && btnClose.addEventListener('click', closeLB);
    btnPrev && btnPrev.addEventListener('click', prev);
    btnNext && btnNext.addEventListener('click', next);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    window.addEventListener('keydown', (e) => { if (!lb.hidden) { if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); } });

    // hover effects (GSAP or CSS fallback)
    if (typeof gsap !== 'undefined') {
      items.forEach(el => { el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.04, duration: 0.28 })); el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, duration: 0.28 })); });
    } else {
      items.forEach(el => el.style.cursor = 'pointer');
    }

    // animate thumbs on scroll (GSAP ScrollTrigger if available)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('.school-gallery img').forEach(img => {
        gsap.from(img, { y: 14, opacity: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: img, start: 'top 92%' } });
      });
    } else {
      document.querySelectorAll('.school-gallery img').forEach((img, i) => setTimeout(() => img.classList.add('visible'), 100 * i));
    }
  }

  // final safety: ensure sections visible after load (fix for back/refresh issues)
  window.addEventListener('load', () => { document.querySelectorAll('.section, .impact-section, .founder-section').forEach(el => { el.style.opacity = ''; el.style.transform = ''; }); });

  // keyboard: close overlay on Esc
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { header && header.classList.remove('nav-open'); toggle && toggle.forEach(btn => btn.setAttribute('aria-expanded', 'false')); } });

  // --- NEW INTERACTIVE FEATURES ---

  // 1. 3D Tilt Effect for cards
  function setupTiltEffect() {
    const cards = document.querySelectorAll('.mission-card, .info-card, .school-card, .feature-card, .testimonial-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate center relative position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Max rotation degrees
        const maxRotate = 6;

        // Calculate rotation values
        const rotateX = ((y - centerY) / centerY) * -maxRotate;
        const rotateY = ((x - centerX) / centerX) * maxRotate;

        // Apply transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        card.style.transition = 'transform 0.5s ease';
      });
    });
  }

  // 2. Back to Top Button
  function setupBackToTop() {
    // Create button
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Back to Top');
    document.body.appendChild(btn);

    // Style directly or via CSS (appending styles here for self-containment)
    btn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--accent, #0b4a6f);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    `;

    // Show/Hide logic
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
        btn.style.pointerEvents = 'auto';
      } else {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        btn.style.pointerEvents = 'none';
      }
    }, { passive: true });

    // Click logic
    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-5px)';
      btn.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
  }

  try { setupTiltEffect(); } catch (e) { console.error('Tilt effect failed', e); }
  try { setupBackToTop(); } catch (e) { console.error('Back to top failed', e); }

  // Chatbot widget (mock) — UI + integration hook
  (function setupChat() {
    const chatWidget = document.getElementById('chat-widget');
    if (!chatWidget) return;
    try {
      const toggleBtn = document.getElementById('chat-toggle');
      const panel = chatWidget.querySelector('.chat-panel');
      const closeBtn = document.getElementById('chat-close');
      const form = document.getElementById('chat-form');
      const input = document.getElementById('chat-input');
      const messages = document.getElementById('chat-messages');

      function appendMessage(text, who) {
        if (!messages) return;
        const el = document.createElement('div');
        el.className = 'chat-message ' + (who === 'user' ? 'user' : 'bot');
        el.textContent = text;
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
      }

      if (toggleBtn) toggleBtn.addEventListener('click', () => { if (panel) { panel.hidden = false; chatWidget.setAttribute('aria-hidden', 'false'); if (input) input.focus(); } });
      if (closeBtn) closeBtn.addEventListener('click', () => { if (panel) { panel.hidden = true; chatWidget.setAttribute('aria-hidden', 'true'); if (toggleBtn) toggleBtn.focus(); } });

      if (form && input && messages) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          try {
            const val = input.value.trim(); if (!val) return;
            appendMessage(val, 'user'); input.value = ''; appendMessage('Typing...', 'bot');
            const response = await window.sendToAI(val); // replace in production with real API call
            // remove typing placeholder
            messages.querySelectorAll('.chat-message').forEach(n => { if (n.textContent === 'Typing...') n.remove(); });
            appendMessage(response, 'bot');
          } catch (err) { console.error('chat submit failed', err); const el = document.getElementById('js-error-banner'); if (el) { el.textContent = 'Chat error: see console'; el.style.display = 'block'; } }
        });
      }
    } catch (e) { console.error('setupChat error', e); const el = document.getElementById('js-error-banner'); if (el) { el.textContent = 'Chat widget failed to initialize'; el.style.display = 'block'; } }

    // ensure there's at least a mock sendToAI function
    if (typeof window.sendToAI !== 'function') {
      window.sendToAI = async function (message) {
        // Mock behavior: echo + small canned logic
        await new Promise(r => setTimeout(r, 700));
        const low = (message || '').toLowerCase();
        if (low.includes('admission') || low.includes('admit')) return 'Admissions are open — visit our Contact page or email admissions@educationtrust.org for details.';
        if (low.includes('fee') || low.includes('fee structure')) return 'Fee details vary by grade; email admissions@educationtrust.org for the latest fee schedule.';
        if (low.includes('gallery') || low.includes('photos')) return 'You can find photos in the Gallery section for each school; which school do you want to see?';
        return 'Thanks — we received your question. For detailed answers we can connect this widget to an AI service (OpenAI/Azure).';
      };
    }

    // Example: how to replace sendToAI with a real API call (server-side proxy recommended)
    // window.sendToAI = async (message)=>{ const res = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message})}); const data = await res.json(); return data.reply; };
  }); // end of DOMContentLoaded

  // --- NEXT-GEN INTERACTIONS ---

  // 2. Magnetic Buttons
  function setupMagneticElements() {
    if (reduceMotion) return;
    const magnets = document.querySelectorAll('.btn, .school-card, .brand, .back-to-top, .logo');

    magnets.forEach(m => {
      m.addEventListener('mousemove', function (e) {
        const rect = m.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(m, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power2.out' });
      });
      m.addEventListener('mouseleave', function () {
        gsap.to(m, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      });
    });
  }

  // 4. Background Parallax Particles
  function setupParallaxParticles() {
    const icons = ['🎓', '📖', '🔬', '💡', '🌟', '🎨', '🧩'];
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
      if (Math.random() > 0.4) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.innerText = icons[Math.floor(Math.random() * icons.length)];
        particle.style.left = Math.random() * 90 + '%';
        particle.style.top = Math.random() * 80 + '%';
        section.appendChild(particle);

        gsap.to(particle, {
          y: -80,
          rotate: 15,
          scrollTrigger: {
            trigger: section,
            scrub: 1,
            start: 'top bottom',
            end: 'bottom top'
          }
        });
      }
    });
  }

})();
document.addEventListener("DOMContentLoaded", () => {
  const h2Elements = document.querySelectorAll("h2");

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const h2 = entry.target;

          h2.classList.add(
            "animate__animated",
            "animate__backInDown"
          );

          observer.unobserve(h2); // animate only once
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  h2Elements.forEach(h2 => observer.observe(h2));
});
document.addEventListener("DOMContentLoaded", () => {
  const h1Elements = document.querySelectorAll("h1");

  const h1Observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const h1 = entry.target;

          h1.classList.add(
            "animate__animated",
            "animate__flip"
          );

          observer.unobserve(h1); // animate once
        }
      });
    },
    {
      threshold: 0.25
    }
  );

  h1Elements.forEach(h1 => h1Observer.observe(h1));
});



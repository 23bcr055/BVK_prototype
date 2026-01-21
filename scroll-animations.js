document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal, .reveal-box, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.01 // Trigger as soon as 1% is visible
  });


  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
});


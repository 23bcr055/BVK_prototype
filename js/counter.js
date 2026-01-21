document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".stat-number");

    const observerOptions = {
        threshold: 0.5, // Trigger when 50% of the element is visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute("data-target");
                const suffix = counter.getAttribute("data-suffix") || "";
                const duration = 2000; // Animation duration in ms
                const increment = target / (duration / 16); // 60 FPS

                let current = 0;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current) + suffix;
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target + suffix;
                    }
                };

                updateCounter();
                observer.unobserve(counter); // Run only once
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
});

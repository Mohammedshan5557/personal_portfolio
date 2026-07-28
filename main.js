/* ==========================================================================
   Premium Futuristic Portfolio Javascript
   Logic: Vanilla IntersectionObserver, GPU Parallax, Interactive Forms
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element Caching
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");
    const heroGlow = document.getElementById("hero-glow");
    const bgVideo = document.getElementById("bg-video");
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");
    const submitSpinner = submitBtn ? submitBtn.querySelector(".submit-spinner") : null;
    const formFeedback = document.getElementById("form-feedback");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main > section");

    // ==========================================================================
    // 1. Dark/Light Theme Switching
    // ==========================================================================
    const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
    if (savedTheme === "light") {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
    } else {
        body.classList.add("dark-theme");
        body.classList.remove("light-theme");
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            if (body.classList.contains("dark-theme")) {
                body.classList.replace("dark-theme", "light-theme");
                localStorage.setItem("portfolio-theme", "light");
            } else {
                body.classList.replace("light-theme", "dark-theme");
                localStorage.setItem("portfolio-theme", "dark");
            }
        });
    }

    // ==========================================================================
    // 2. 60fps GPU-Accelerated Hero Parallax Glow Scroll Effect
    // ==========================================================================
    let scrollTicking = false;
    
    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                // Run only when hero is visible in viewport
                if (heroGlow && scrollTop < window.innerHeight) {
                    // Parallax factor of 35% scroll speed (translateY = scroll * 0.35)
                    heroGlow.style.transform = `translate3d(0, ${scrollTop * 0.35}px, 0)`;
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // ==========================================================================
    // 2b. Scroll-Driven Background Video Scrubbing (Lerp 60fps)
    // ==========================================================================
    let targetVideoTime = 0;
    let currentVideoTime = 0;
    const lerpEase = 0.08; // Smooth ease coefficient

    // Update target scrubbing position on scroll
    window.addEventListener("scroll", () => {
        if (bgVideo && bgVideo.duration) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;
            
            // Map scrollPercent (0 to 1) to video timeline
            targetVideoTime = scrollPercent * bgVideo.duration;
        }
    });

    // Run custom video playhead animation tick loop
    function animateVideoScrub() {
        if (bgVideo && bgVideo.duration) {
            // Apply linear interpolation
            currentVideoTime += (targetVideoTime - currentVideoTime) * lerpEase;
            
            // Only update playhead if difference is notice-worthy (performance optimization)
            if (Math.abs(targetVideoTime - currentVideoTime) > 0.005) {
                bgVideo.currentTime = currentVideoTime;
            }
        }
        requestAnimationFrame(animateVideoScrub);
    }
    
    // Start tick once video meta is ready, or trigger immediately as fallback
    if (bgVideo) {
        bgVideo.addEventListener("loadedmetadata", () => {
            requestAnimationFrame(animateVideoScrub);
        });
        
        // Fallback: If metadata is already cached / loaded
        if (bgVideo.readyState >= 1) {
            requestAnimationFrame(animateVideoScrub);
        }
    }

    // ==========================================================================
    // 3. IntersectionObserver for Scroll-Triggered Reveals (Once Trigger)
    // ==========================================================================
    
    // Reveal configuration
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it is a staggered card container
                if (entry.target.classList.contains("reveal-stagger")) {
                    const cards = entry.target.querySelectorAll(".reveal-card");
                    cards.forEach((card, index) => {
                        card.style.transitionDelay = `${index * 120}ms`;
                        card.classList.add("revealed");
                    });
                } else {
                    // Regular fade-up or slide-in elements
                    entry.target.classList.add("revealed");
                }
                
                // Unobserve so the animation triggers only once
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Track and observe reveal elements
    const elementsToReveal = document.querySelectorAll(
        ".reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-stagger"
    );
    elementsToReveal.forEach(el => revealObserver.observe(el));

    // ==========================================================================
    // 4. Scroll Active Navigation Link Highlighting
    // ==========================================================================
    const navOptions = {
        threshold: 0.25,
        rootMargin: "-25% 0px -55% 0px"
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    if (link.getAttribute("href") === `#${currentId}`) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                });
            }
        });
    }, navOptions);

    sections.forEach(section => navObserver.observe(section));

    // ==========================================================================
    // 5. Contact Form Simulation and Submissions
    // ==========================================================================
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nameVal = document.getElementById("form-name").value.trim();
            const emailVal = document.getElementById("form-email").value.trim();
            const messageVal = document.getElementById("form-message").value.trim();

            if (!nameVal || !emailVal || !messageVal) {
                showFeedback("Please complete all form fields.", "error");
                return;
            }

            // Submitting animation
            submitBtn.disabled = true;
            if (submitSpinner) submitSpinner.classList.remove("hidden");
            submitBtn.querySelector("span").textContent = "Delivering...";

            // Simulate server network delivery delay
            setTimeout(() => {
                if (submitSpinner) submitSpinner.classList.add("hidden");
                submitBtn.querySelector("span").textContent = "Send Message";
                submitBtn.disabled = false;

                showFeedback(`Thank you, ${nameVal}! Your message has been delivered successfully.`, "success");
                contactForm.reset();
            }, 1600);
        });
    }

    function showFeedback(message, type) {
        if (!formFeedback) return;
        formFeedback.textContent = message;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.classList.remove("hidden");

        // Premium fade out after 6 seconds
        setTimeout(() => {
            formFeedback.classList.add("hidden");
        }, 6000);
    }
});

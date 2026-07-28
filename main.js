/* ==========================================================================
   Premium Futuristic Portfolio Javascript
   Logic: Vanilla IntersectionObserver, GPU Parallax, Interactive Forms,
          Typing Animation, Tab Switches, Project Filtering, Name 3D Tilt
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
    
    // Interactive components caching
    const typingText = document.getElementById("typing-text");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");
    const interactiveName = document.getElementById("interactive-name");
    const interactiveNameContainer = document.getElementById("interactive-name-container");

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
    // 2. 60fps GPU-Accelerated Hero Parallax Glow & Name Scroll Effect
    // ==========================================================================
    let scrollTicking = false;
    
    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                // Run only when hero is visible in viewport
                if (scrollTop < window.innerHeight) {
                    if (heroGlow) {
                        // Parallax factor of 35% scroll speed (translateY = scroll * 0.35)
                        heroGlow.style.transform = `translate3d(0, ${scrollTop * 0.35}px, 0)`;
                    }
                    if (interactiveNameContainer) {
                        // Parallax factor of 15% scroll speed for name container
                        interactiveNameContainer.style.transform = `translate3d(0, ${scrollTop * 0.15}px, 0)`;
                    }
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
    // 2c. Hero Name 3D Mouse Tilt & Spring Physics
    // ==========================================================================
    if (interactiveName) {
        const nameText = interactiveName.textContent.trim();
        interactiveName.innerHTML = ""; // Clear plain text
        
        // Split into words, then characters
        const words = nameText.split(" ");
        words.forEach((wordText, wordIdx) => {
            const wordSpan = document.createElement("span");
            wordSpan.className = "name-word";
            
            for (let i = 0; i < wordText.length; i++) {
                const letterSpan = document.createElement("span");
                letterSpan.className = "interactive-letter";
                letterSpan.textContent = wordText[i];
                wordSpan.appendChild(letterSpan);
            }
            
            interactiveName.appendChild(wordSpan);
            
            if (wordIdx < words.length - 1) {
                const spaceSpan = document.createElement("span");
                spaceSpan.style.width = "1.5rem";
                interactiveName.appendChild(spaceSpan);
            }
        });
    }

    const letters = document.querySelectorAll(".interactive-letter");
    let letterData = [];
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    function cacheLetterPositions() {
        letterData = Array.from(letters).map(letter => {
            const rect = letter.getBoundingClientRect();
            return {
                el: letter,
                cx: rect.left + rect.width / 2 + window.scrollX,
                cy: rect.top + rect.height / 2 + window.scrollY
            };
        });
    }

    // Bind coordinate caching triggers
    window.addEventListener("load", cacheLetterPositions);
    window.addEventListener("resize", () => setTimeout(cacheLetterPositions, 100));
    window.addEventListener("scroll", cacheLetterPositions);
    document.fonts.ready.then(cacheLetterPositions);

    // Track mouse cursor and apply vector 3D transforms
    if (!isTouchDevice && letters.length > 0) {
        window.addEventListener("mousemove", (e) => {
            const mouseX = e.pageX;
            const mouseY = e.pageY;
            const radius = 300; // Radius of interaction influence

            letterData.forEach(data => {
                const dx = mouseX - data.cx;
                const dy = mouseY - data.cy;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const proximity = (radius - distance) / radius;
                    const maxRise = -20; // Upward height
                    const maxScale = 0.2; // Scale up
                    const maxShift = 10; // Directional shift
                    const maxTilt = 20; // 3D Tilt angle

                    const shiftX = (dx / distance) * proximity * maxShift;
                    const shiftY = (dy / distance) * proximity * maxShift;
                    const tiltX = -(dy / distance) * proximity * maxTilt;
                    const tiltY = (dx / distance) * proximity * maxTilt;
                    const rotateZ = (dx / distance) * proximity * 6; // Small twist
                    const rise = proximity * maxRise;
                    const scale = 1 + (proximity * maxScale);

                    data.el.style.transform = `translate3d(${shiftX}px, ${rise + shiftY}px, ${20 * proximity}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
                    data.el.style.textShadow = `0 10px ${15 * proximity}px rgba(46, 232, 158, ${0.5 * proximity}), 0 0 10px rgba(255, 255, 255, ${0.4 * proximity})`;
                } else {
                    data.el.style.transform = '';
                    data.el.style.textShadow = '';
                }
            });
        });

        document.addEventListener("mouseleave", () => {
            letters.forEach(letter => {
                letter.style.transform = '';
                letter.style.textShadow = '';
            });
        });
    }

    // ==========================================================================
    // 3. IntersectionObserver for Scroll-Triggered Reveals (Once Trigger)
    // ==========================================================================
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
    // 5. Hero Subtitle Typing Animation Loop
    // ==========================================================================
    const roles = ["Modern Web Experiences", "Premium Interfaces", "Interactive Solutions"];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeDelay = 120;

    function handleTyping() {
        if (!typingText) return;
        const currentRole = roles[roleIdx];
        
        if (isDeleting) {
            typingText.textContent = currentRole.substring(0, charIdx - 1);
            charIdx--;
            typeDelay = 60; // Deleting is faster
        } else {
            typingText.textContent = currentRole.substring(0, charIdx + 1);
            charIdx++;
            typeDelay = 120; // Typing speed
        }

        if (!isDeleting && charIdx === currentRole.length) {
            isDeleting = true;
            typeDelay = 2000; // Pause at end of word
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            typeDelay = 500; // Pause before next word
        }

        setTimeout(handleTyping, typeDelay);
    }
    
    // Start typing cycle
    if (typingText) setTimeout(handleTyping, 1000);

    // ==========================================================================
    // 6. Interactive About Tabs Trigger
    // ==========================================================================
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(pane => pane.classList.remove("active"));
            
            btn.classList.add("active");
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add("active");
        });
    });

    // ==========================================================================
    // 7. Projects Grid Filtering
    // ==========================================================================
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const filterValue = btn.getAttribute("data-filter");
            
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            projectCards.forEach(card => {
                const category = card.getAttribute("data-category");
                
                if (filterValue === "all" || category === filterValue) {
                    card.classList.remove("hide");
                    card.classList.add("show");
                } else {
                    card.classList.remove("show");
                    card.classList.add("hide");
                }
            });
        });
    });

    // ==========================================================================
    // 8. Contact Form Simulation and Submissions
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

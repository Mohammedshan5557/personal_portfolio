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
    // ==========================================================================
    // 1. Robust Dark/Light Theme Switching with System Preference & Storage
    // ==========================================================================
    const getPreferredTheme = () => {
        const saved = localStorage.getItem("portfolio-theme");
        if (saved) return saved;
        return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    };

    const applyTheme = (theme) => {
        const isDark = (theme === "dark");
        
        body.classList.toggle("dark-theme", isDark);
        body.classList.toggle("light-theme", !isDark);
        document.documentElement.classList.toggle("dark-theme", isDark);
        document.documentElement.classList.toggle("light-theme", !isDark);
        
        localStorage.setItem("portfolio-theme", theme);
    };

    // Initialize initial theme state
    applyTheme(getPreferredTheme());

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = body.classList.contains("dark-theme");
            applyTheme(isDark ? "light" : "dark");
        });
    }

    // ==========================================================================
    // 1b. Mobile Navigation Hamburger Menu
    // ==========================================================================
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const navLinksContainer = document.querySelector(".nav-links");
    const navbar = document.querySelector(".navbar");

    function closeMobileMenu() {
        if (mobileMenuToggle && navLinksContainer) {
            mobileMenuToggle.classList.remove("active");
            navLinksContainer.classList.remove("active");
            if (navbar) navbar.classList.remove("mobile-menu-open");
            mobileMenuToggle.setAttribute("aria-expanded", "false");
            body.style.overflow = "";
        }
    }

    function toggleMobileMenu() {
        if (!mobileMenuToggle || !navLinksContainer) return;
        const isOpen = navLinksContainer.classList.contains("active");
        if (isOpen) {
            closeMobileMenu();
        } else {
            mobileMenuToggle.classList.add("active");
            navLinksContainer.classList.add("active");
            if (navbar) navbar.classList.add("mobile-menu-open");
            mobileMenuToggle.setAttribute("aria-expanded", "true");
            body.style.overflow = "hidden";
        }
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Close menu when clicking any nav link
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            closeMobileMenu();
        });
    });

    // Close menu on ESC key press
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMobileMenu();
    });

    // Reset menu state on viewport resize above 768px
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

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
                    const isLightTheme = body.classList.contains("light-theme");
                    const shadowColor = isLightTheme ? `rgba(11, 159, 104, ${0.2 * proximity})` : `rgba(46, 232, 158, ${0.5 * proximity})`;
                    const secondaryShadow = isLightTheme ? `rgba(0, 0, 0, ${0.1 * proximity})` : `rgba(255, 255, 255, ${0.4 * proximity})`;
                    data.el.style.textShadow = `0 10px ${15 * proximity}px ${shadowColor}, 0 0 10px ${secondaryShadow}`;
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
    // 3. IntersectionObserver for Replaying Scroll-Triggered Reveals
    // ==========================================================================
    const revealOptions = {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it is a staggered card container
                if (entry.target.classList.contains("reveal-stagger")) {
                    const cards = entry.target.querySelectorAll(".reveal-card");
                    cards.forEach((card, index) => {
                        card.style.transitionDelay = `${index * 100}ms`;
                        card.classList.add("revealed");
                    });
                }
                
                // Add revealed class when element enters viewport
                entry.target.classList.add("revealed");
            } else {
                // Reset animation state when element leaves viewport
                if (entry.target.classList.contains("reveal-stagger")) {
                    const cards = entry.target.querySelectorAll(".reveal-card");
                    cards.forEach(card => {
                        card.classList.remove("revealed");
                    });
                }
                
                // Remove revealed class so animation replays upon next entry
                entry.target.classList.remove("revealed");
            }
        });
    }, revealOptions);

    // Track and observe all reveal elements
    const elementsToReveal = document.querySelectorAll(
        ".reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-stagger, .reveal-card"
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

    // ==========================================================================
    // 9. Interactive Showcase Track Engine (Recreating 517.mp4)
    // ==========================================================================
    const showcaseViewport = document.getElementById("showcase-viewport");
    const showcaseTrack = document.getElementById("showcase-track");
    const cardWrappers = document.querySelectorAll(".showcase-card-wrapper");

    if (showcaseViewport && showcaseTrack && cardWrappers.length > 0) {
        let currentX = 0;
        let targetX = 0;
        let isDragging = false;
        let startX = 0;
        let startTargetX = 0;
        let velocityX = 0;
        let lastDragX = 0;
        let lastDragTime = 0;

        function getMaxScroll() {
            const trackWidth = showcaseTrack.scrollWidth;
            const viewportWidth = showcaseViewport.clientWidth;
            return Math.max(0, trackWidth - viewportWidth);
        }

        // Mouse Drag Controls (Ultra Smooth Physics & Selection Suppression)
        showcaseViewport.addEventListener("mousedown", (e) => {
            // Allow interactive buttons to be clicked normally
            if (e.target.closest("button") || e.target.closest(".play-btn") || e.target.closest(".watch-play") || e.target.closest(".btn-main-play") || e.target.closest(".spot-play-btn")) {
                return;
            }
            isDragging = true;
            startX = e.clientX;
            startTargetX = targetX;
            lastDragX = e.clientX;
            lastDragTime = performance.now();
            velocityX = 0;
            showcaseViewport.style.cursor = "grabbing";
            document.body.style.userSelect = "none";
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            targetX = startTargetX - dx;
            targetX = Math.max(0, Math.min(targetX, getMaxScroll()));

            const now = performance.now();
            const dt = now - lastDragTime;
            if (dt > 0) {
                velocityX = (e.clientX - lastDragX) / dt;
            }
            lastDragX = e.clientX;
            lastDragTime = now;
        });

        window.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                showcaseViewport.style.cursor = "grab";
                document.body.style.userSelect = "";
                // Smooth momentum decay
                targetX -= velocityX * 160;
                targetX = Math.max(0, Math.min(targetX, getMaxScroll()));
            }
        });

        // Touch Drag Controls
        showcaseViewport.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startTargetX = targetX;
            }
        }, { passive: true });

        window.addEventListener("touchmove", (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - startX;
            targetX = startTargetX - dx;
            targetX = Math.max(0, Math.min(targetX, getMaxScroll()));
        }, { passive: true });

        window.addEventListener("touchend", () => {
            isDragging = false;
        });

        // Wheel horizontal scrubbing over track section
        showcaseViewport.addEventListener("wheel", (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (Math.abs(delta) > 5) {
                targetX += delta * 0.8;
                targetX = Math.max(0, Math.min(targetX, getMaxScroll()));
                e.preventDefault();
            }
        }, { passive: false });

        // Keyboard Arrow Key Navigation
        window.addEventListener("keydown", (e) => {
            if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
            const cardWidth = 416; // Card width + gap
            if (e.key === "ArrowRight") {
                targetX = Math.min(targetX + cardWidth, getMaxScroll());
            } else if (e.key === "ArrowLeft") {
                targetX = Math.max(targetX - cardWidth, 0);
            }
        });

        // Interactive Player Controls inside Mockups
        const playBtns = document.querySelectorAll(".play-btn, .watch-play, .btn-main-play, .spot-play-btn, .wheel-play");
        playBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (btn.textContent.trim() === "▶" || btn.textContent.trim() === "⏯") {
                    btn.textContent = "⏸";
                } else {
                    btn.textContent = "▶";
                }
            });
        });

        // 60 FPS Render Tick Loop with Lerp & Center Scaling Depth
        function renderShowcaseTrack() {
            // Apply Lerp (linear interpolation)
            currentX += (targetX - currentX) * 0.08;
            showcaseTrack.style.transform = `translate3d(${-currentX}px, 0, 0)`;

            // Compute depth & scale based on card proximity to viewport center
            const viewportCenter = window.innerWidth / 2;
            const maxDistance = window.innerWidth * 0.45;

            cardWrappers.forEach((wrapper) => {
                const rect = wrapper.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const distance = Math.abs(viewportCenter - cardCenter);

                // Calculate normalized distance factor (0 at center, 1 at edges)
                const factor = Math.min(1, distance / maxDistance);
                
                // Center card scales to ~1.06, outer cards scale down to ~0.92
                const scale = 1.06 - factor * 0.14;
                const opacity = 1.0 - factor * 0.35;

                wrapper.style.transform = `scale(${scale})`;
                wrapper.style.opacity = opacity.toFixed(3);
            });

            requestAnimationFrame(renderShowcaseTrack);
        }

        requestAnimationFrame(renderShowcaseTrack);
    }
});



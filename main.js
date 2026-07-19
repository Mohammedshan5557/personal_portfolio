// --- personal-portfolio main JavaScript file ---

document.addEventListener("DOMContentLoaded", () => {
    // Cache elements
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");
    const mouseGlow = document.getElementById("mouse-glow");
    const interactiveName = document.getElementById("interactive-name");
    const typingText = document.getElementById("typing-text");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");
    const submitSpinner = submitBtn.querySelector(".submit-spinner");
    const formFeedback = document.getElementById("form-feedback");

    // ----------------------------------------------------
    // 1. Dark/Light Theme Handler
    // ----------------------------------------------------
    const currentTheme = localStorage.getItem("portfolio-theme") || "dark";
    if (currentTheme === "light") {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
    } else {
        body.classList.add("dark-theme");
        body.classList.remove("light-theme");
    }

    themeToggle.addEventListener("click", () => {
        if (body.classList.contains("dark-theme")) {
            body.classList.replace("dark-theme", "light-theme");
            localStorage.setItem("portfolio-theme", "light");
        } else {
            body.classList.replace("light-theme", "dark-theme");
            localStorage.setItem("portfolio-theme", "dark");
        }
        // Re-cache letter positions as layout might shift slightly
        setTimeout(cacheLetterPositions, 300);
    });


    // ----------------------------------------------------
    // 2. Mouse Glow Follower
    // ----------------------------------------------------
    window.addEventListener("mousemove", (e) => {
        gsap.to(mouseGlow, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto"
        });
    });


    // ----------------------------------------------------
    // 3. Name Animation: 3D Mouse Tilt & Spring Physics
    // ----------------------------------------------------
    const nameText = interactiveName.textContent.trim();
    interactiveName.innerHTML = ""; // Clear existing layout
    
    // Split into words, then split words into characters
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
        
        // Add a space span between words
        if (wordIdx < words.length - 1) {
            const spaceSpan = document.createElement("span");
            spaceSpan.style.width = "1rem";
            interactiveName.appendChild(spaceSpan);
        }
    });

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

    // Initialize positions cache
    window.addEventListener("load", cacheLetterPositions);
    window.addEventListener("resize", () => {
        setTimeout(cacheLetterPositions, 100);
    });
    window.addEventListener("scroll", cacheLetterPositions);
    
    // Re-cache once fonts load fully
    document.fonts.ready.then(cacheLetterPositions);

    // Track mouse-movement relative to cached coordinates
    if (!isTouchDevice) {
        window.addEventListener("mousemove", (e) => {
            const mouseX = e.pageX;
            const mouseY = e.pageY;
            const radius = 350; // Radius of interaction influence
            
            letterData.forEach(data => {
                const dx = mouseX - data.cx;
                const dy = mouseY - data.cy;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    // Linear normalization (1 = cursor on top, 0 = outside radius)
                    const proximity = (radius - distance) / radius;
                    
                    // Spring physics math
                    const maxRise = -24; // Upward height
                    const maxScale = 0.35; // Scale up
                    const maxShift = 12; // Directional shift
                    const maxTilt = 22; // 3D Tilt angle

                    // Angle-based directional displacement
                    const shiftX = (dx / distance) * proximity * maxShift;
                    const shiftY = (dy / distance) * proximity * maxShift;
                    
                    // 3D Tilt (Rotation about X and Y axes)
                    const tiltX = -(dy / distance) * proximity * maxTilt;
                    const tiltY = (dx / distance) * proximity * maxTilt;
                    const rotateZ = (dx / distance) * proximity * 8; // Small twist
                    
                    const rise = proximity * maxRise;
                    const scale = 1 + (proximity * maxScale);
                    
                    // Style variables
                    const primaryColor = getComputedStyle(body).getPropertyValue('--color-primary').trim();
                    const secondaryColor = getComputedStyle(body).getPropertyValue('--color-secondary').trim();
                    
                    // Smooth elastic interpolation using GSAP
                    gsap.to(data.el, {
                        x: shiftX,
                        y: rise + shiftY,
                        z: 20 * proximity, // Bring closer to viewport
                        rotateX: tiltX,
                        rotateY: tiltY,
                        rotateZ: rotateZ,
                        scale: scale,
                        color: proximity > 0.5 ? secondaryColor : (proximity > 0.2 ? primaryColor : ""),
                        textShadow: `0 10px ${20 * proximity}px rgba(var(--color-primary-rgb), ${0.4 * proximity})`,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                } else {
                    // Reset smoothly to original position
                    gsap.to(data.el, {
                        x: 0,
                        y: 0,
                        z: 0,
                        rotateX: 0,
                        rotateY: 0,
                        rotateZ: 0,
                        scale: 1,
                        color: "",
                        textShadow: "none",
                        duration: 0.8,
                        ease: "elastic.out(1, 0.4)",
                        overwrite: "auto"
                    });
                }
            });
        });

        // Handle mouse leave screen
        document.addEventListener("mouseleave", () => {
            letterData.forEach(data => {
                gsap.to(data.el, {
                    x: 0,
                    y: 0,
                    z: 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 1,
                    color: "",
                    textShadow: "none",
                    duration: 0.8,
                    ease: "elastic.out(1, 0.45)",
                    overwrite: "auto"
                });
            });
        });
    }


    // ----------------------------------------------------
    // 4. Typing Text Effect
    // ----------------------------------------------------
    const roles = ["Modern Web Experiences", "Premium Interfaces", "Interactive Solutions"];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeDelay = 120;

    function handleTyping() {
        const currentRole = roles[roleIdx];
        
        if (isDeleting) {
            typingText.textContent = currentRole.substring(0, charIdx - 1);
            charIdx--;
            typeDelay = 60; // Backspace faster
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
            typeDelay = 500; // Pause before typing next word
        }

        setTimeout(handleTyping, typeDelay);
    }
    
    // Start typing cycle
    setTimeout(handleTyping, 1000);


    // ----------------------------------------------------
    // 5. Interactive About Tabs
    // ----------------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(pane => pane.classList.remove("active"));
            
            // Add active classes to targets
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
            
            // Re-cache bounds as layouts change size
            setTimeout(cacheLetterPositions, 150);
        });
    });


    // ----------------------------------------------------
    // 6. Projects Filtering Grid
    // ----------------------------------------------------
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const filterValue = btn.getAttribute("data-filter");
            
            // Active filter button styling
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
            
            // Re-cache name positions
            setTimeout(cacheLetterPositions, 200);
        });
    });


    // ----------------------------------------------------
    // 7. Contact Form Handling (Simulated with animations)
    // ----------------------------------------------------
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById("form-name").value;
            const emailInput = document.getElementById("form-email").value;
            const messageInput = document.getElementById("form-message").value;
            
            if (!nameInput || !emailInput || !messageInput) {
                showFeedback("Please fill out all fields.", "error");
                return;
            }

            // Animate submission start
            submitBtn.disabled = true;
            submitSpinner.classList.remove("hidden");
            submitBtn.querySelector("span").textContent = "Sending...";
            
            // Simulate API delivery
            setTimeout(() => {
                submitSpinner.classList.add("hidden");
                submitBtn.querySelector("span").textContent = "Send Message";
                submitBtn.disabled = false;
                
                showFeedback(`Thank you, ${nameInput}! Your message was sent successfully.`, "success");
                contactForm.reset();
            }, 1800);
        });
    }

    function showFeedback(message, type) {
        formFeedback.textContent = message;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.classList.remove("hidden");
        
        // Hide after 5 seconds
        setTimeout(() => {
            formFeedback.classList.add("hidden");
        }, 5000);
    }

    // ----------------------------------------------------
    // 8. 3D Parallax Tilt for Matte Cards & Containers
    // ----------------------------------------------------
    const tiltCards = document.querySelectorAll(".project-card, .about-card, .contact-section .section-container");
    if (!isTouchDevice) {
        tiltCards.forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = -((y - centerY) / centerY) * 8;
                const rotateY = ((x - centerX) / centerX) * 8;

                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1000,
                    scale: 1.02,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            card.addEventListener("mouseleave", () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        });
    }
});

/* ============================================================
   JAVASCRIPT — Interactivity layer
   ============================================================ */
const API_URL = 'http://localhost:5000/api';

(function () {
    'use strict';

    /* ---- 1. Navigation scroll state ---- */
    const nav = document.getElementById('nav');
    const scrollProgress = document.getElementById('scrollProgress');

    function onScroll() {
        // Nav background
        if (window.scrollY > 24) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        // Scroll progress bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        scrollProgress.style.width = pct + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- 2. Mobile menu ---- */
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function setMenu(open) {
        navToggle.classList.toggle('active', open);
        mobileMenu.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.style.overflow = open ? 'hidden' : '';
    }

    navToggle.addEventListener('click', () => {
        setMenu(!mobileMenu.classList.contains('open'));
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            setMenu(false);
        }
    });

    /* ---- 3. Scroll reveal animations ---- */
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ---- 4. Stats counter animation ---- */
    const statsContainer = document.querySelector('.hero-stats');
    const statNumbers = document.querySelectorAll('.hero-stat [data-target]');
    let statsAnimated = false;

    function animateNumber(el) {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        function step(now) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            const val = target * eased;
            el.textContent = val.toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = target.toFixed(decimals) + suffix;
        }
        requestAnimationFrame(step);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(animateNumber);
            }
        });
    }, { threshold: 0.4 });

    if (statsContainer) statsObserver.observe(statsContainer);

    /* ---- 5. Theme toggle ---- */
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light');
            themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
            themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        });
    }

    /* ---- 6. Work Slider ---- */

    let workProjects = [];
    const workSection = document.querySelector(".work");

    if (workSection) {
        let current = 0;
        let animating = false;
        /* Cache elements */
        const workMedia = workSection.querySelector(".work-media");
        const workImage = workSection.querySelector("#workImage");
        const workCategory = workSection.querySelector(".work-category");
        const workTitle = workSection.querySelector(".work-title");
        const workSubtitle = workSection.querySelector(".work-subtitle");
        const workDescription = workSection.querySelector(".work-description");
        const workTags = workSection.querySelector(".work-tags");
        const workIndex = workSection.querySelector(".work-index");
        const progressFill = workSection.querySelector(".work-progress-fill");
        const prevBtn = workSection.querySelector("#workPrev");
        const nextBtn = workSection.querySelector("#workNext");
        const leftHit = workSection.querySelector(".work-hit-left");
        const rightHit = workSection.querySelector(".work-hit-right");
        const dots = [...workSection.querySelectorAll(".work-dot")];
        const content = workSection.querySelector(".work-content");

        function renderWork(index) {
            if (!workProjects.length) return;
            const item = workProjects[index];
            workImage.src = item.image;
            workImage.alt = item.title;
            workCategory.textContent = item.category;
            workTitle.textContent = item.title;
            workSubtitle.textContent = item.subtitle;
            workDescription.textContent = item.description;
            workIndex.textContent = String(index + 1).padStart(2, "0");
            workTags.innerHTML = item.tags.map(tag => `<li>${tag}</li>`).join("");
            progressFill.style.width =
                `${((index + 1) / workProjects.length) * 100}%`;
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
        }

        async function loadProjects() {
            try {
                const response = await fetch("data/workProject.json");
                if (!response.ok) {
                    throw new Error("Failed to load projects");
                }
                workProjects = await response.json();
                renderWork(0);
            } catch (error) {
                console.error(error);
            }
        }

        function changeSlide(nextIndex) {
            if (!workProjects.length || animating) return;
            animating = true;
            content.animate(
                [
                    { opacity: 1, transform: "translateY(0)" },
                    { opacity: 0, transform: "translateY(24px)" }
                ],
                {
                    duration: 220,
                    easing: "ease",
                    fill: "forwards"
                }
            ).onfinish = () => {
                current = nextIndex;
                renderWork(current);
                content.animate(
                    [
                        { opacity: 0, transform: "translateY(-24px)" },
                        { opacity: 1, transform: "translateY(0)" }
                    ],
                    {
                        duration: 420,
                        easing: "cubic-bezier(.22,1,.36,1)",
                        fill: "forwards"
                    }
                ).onfinish = () => {
                    animating = false;
                };
            };
        }

        /* Buttons */
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                changeSlide((current + 1) % workProjects.length);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                changeSlide((current - 1 + workProjects.length) % workProjects.length);
            });
        }

        /* Dots */
        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                if (i !== current) {
                    changeSlide(i);
                }
            });
        });

        /* Keyboard Navigation with Input Protection */
        document.addEventListener("keydown", (e) => {
            // Prevent slider from changing while typing in forms
            const targetTag = e.target.tagName.toLowerCase();
            if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select' || e.target.isContentEditable) {
                return;
            }

            const rect = workSection.getBoundingClientRect();
            const visible = rect.top < window.innerHeight && rect.bottom > 0;

            if (!visible) return;
            if (e.key === "ArrowRight") {
                changeSlide((current + 1) % workProjects.length);
            }
            if (e.key === "ArrowLeft") {
                changeSlide((current - 1 + workProjects.length) % workProjects.length);
            }
        });

        /* Touch / Swipe Support */
        let touchStartX = 0;
        let touchEndX = 0;

        if (workMedia) {
            workMedia.addEventListener("touchstart", (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            workMedia.addEventListener("touchend", (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        function handleSwipe() {
            const swipeThreshold = 50; // Minimum distance to register a swipe
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swiped left
                changeSlide((current + 1) % workProjects.length);
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swiped right
                changeSlide((current - 1 + workProjects.length) % workProjects.length);
            }
        }

        /* Click Hit Areas */
        if (leftHit) {
            leftHit.addEventListener("click", () => {
                changeSlide((current - 1 + workProjects.length) % workProjects.length);
            });
        }
        if (rightHit) {
            rightHit.addEventListener("click", () => {
                changeSlide((current + 1) % workProjects.length);
            });
        }

        /* Initial Render */
        loadProjects();
    }

    /* ---- 7. FAQ accordion ---- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all (accordion behavior)
            faqItems.forEach(other => {
                other.classList.remove('open');
                const otherBtn = other.querySelector('.faq-question');
                if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            });
            // Open clicked if it was closed
            if (!isOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---- 8. Pricing toggle ---- */
    const pricingButtons = document.querySelectorAll('.pricing-toggle button');
    const priceValues = document.querySelectorAll('.price-amount .value[data-monthly]');

    pricingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.dataset.period;
            pricingButtons.forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
            });
            priceValues.forEach(el => {
                const newVal = period === 'monthly' ? el.dataset.monthly : el.dataset.annual;
                el.style.opacity = '0.4';
                setTimeout(() => {
                    el.textContent = newVal;
                    el.style.opacity = '1';
                }, 120);
            });
        });
    });

    /* ---- 9. Contact form (Backend Integration) ---- */
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = {
                name: form.querySelector('#name').value.trim(),
                email: form.querySelector('#email').value.trim(),
                company: form.querySelector('#company').value.trim(),
                projectType: form.querySelector('#type').value,
                budget: form.querySelector('#budget').value,
                message: form.querySelector('#message').value.trim()
            };

            try {
                const response = await fetch(`${API_URL}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to send');

                success.classList.add('show');
                setTimeout(() => {
                    form.reset();
                    success.classList.remove('show');
                    submitBtn.textContent = 'Send message';
                    submitBtn.disabled = false;
                }, 3000);
            } catch (error) {
                alert(error.message);
                submitBtn.textContent = 'Send message';
                submitBtn.disabled = false;
            }
        });
    }

    /* ---- 10. Newsletter form ---- */
    const newsletter = document.getElementById('newsletterForm');
    if (newsletter) {
        newsletter.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletter.querySelector('input');
            const btn = newsletter.querySelector('button');
            btn.textContent = 'Subscribed';
            btn.style.background = 'var(--accent-bright)';
            input.value = '';
            setTimeout(() => {
                btn.textContent = 'Subscribe';
                btn.style.background = '';
            }, 2500);
        });
    }

    /* ---- 11. Subtle parallax on hero ---- */
    const heroBg = document.querySelector('.hero-bg');
    const heroContent = document.querySelector('.hero-content');

    if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y < window.innerHeight) {
                heroBg.style.transform = `translateY(${y * 0.3}px)`;
                heroContent.style.transform = `translateY(${y * 0.12}px)`;
                heroContent.style.opacity = Math.max(0, 1 - y / 600);
            }
        }, { passive: true });
    }

    /* ---- 12. Authentication UI ---- */
    const navAuth = document.getElementById('navAuth');
    const authModal = document.getElementById('authModal');

    const checkAuthState = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
            if (res.ok) {
                navAuth.innerHTML = `<a href="dashboard.html" class="btn btn-ghost" style="margin-right:0.5rem;">Dashboard</a><button id="logoutBtn" class="btn btn-primary">Logout</button>`;
                document.getElementById('logoutBtn').addEventListener('click', async () => {
                    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
                    checkAuthState();
                });
            } else {
                navAuth.innerHTML = `<button id="openAuthBtn" class="btn btn-ghost">Login</button>`;
                document.getElementById('openAuthBtn').addEventListener('click', () => authModal.classList.add('open'));
            }
        } catch (err) {
            // offline / server down
        }
    };

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', () => authModal.classList.remove('open'));
    authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.remove('open'); });

    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('loginForm').style.display = tab.dataset.tab === 'login' ? 'flex' : 'none';
            document.getElementById('registerForm').style.display = tab.dataset.tab === 'register' ? 'flex' : 'none';
        });
    });

    // Login Handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const errEl = document.getElementById('loginError');
        btn.textContent = 'Logging in...';

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: document.getElementById('loginEmail').value,
                    password: document.getElementById('loginPassword').value
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            authModal.classList.remove('open');
            checkAuthState();
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.add('show');
            btn.textContent = 'Login';
        }
    });

    // Register Handler
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const errEl = document.getElementById('registerError');
        btn.textContent = 'Creating...';

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: document.getElementById('regName').value,
                    email: document.getElementById('regEmail').value,
                    password: document.getElementById('regPassword').value
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            authModal.classList.remove('open');
            checkAuthState();
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.add('show');
            btn.textContent = 'Register';
        }
    });

    // Init Auth State
    checkAuthState();

})();

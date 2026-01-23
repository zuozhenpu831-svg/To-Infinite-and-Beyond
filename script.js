// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initStarfield();
    initNavigation();
    initTabs();
    initScrollAnimations();
    initParallax();
});

// ============================================
// STARFIELD BACKGROUND
// ============================================
function initStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    starfield.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
    }

    function createStars() {
        stars = [];
        const numStars = Math.floor((canvas.width * canvas.height) / 3000);

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                opacity: Math.random(),
                speed: Math.random() * 0.5 + 0.1,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                color: getStarColor()
            });
        }
    }

    function getStarColor() {
        const colors = [
            'rgba(255, 255, 255, ',      // White
            'rgba(0, 217, 255, ',         // Aurora green/cyan
            'rgba(168, 85, 247, ',        // Purple
            'rgba(236, 72, 153, ',        // Pink
            'rgba(244, 208, 63, '         // Golden
        ];
        const weights = [0.7, 0.1, 0.1, 0.05, 0.05];
        const random = Math.random();
        let sum = 0;
        for (let i = 0; i < weights.length; i++) {
            sum += weights[i];
            if (random < sum) return colors[i];
        }
        return colors[0];
    }

    function createShootingStar() {
        if (Math.random() < 0.002) {
            shootingStars.push({
                x: Math.random() * canvas.width,
                y: 0,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 10 + 15,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
                opacity: 1
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
            const currentOpacity = star.opacity * (0.5 + twinkle * 0.5);

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color + currentOpacity + ')';
            ctx.fill();

            // Add glow for larger stars
            if (star.size > 1.5) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, star.size * 3
                );
                gradient.addColorStop(0, star.color + (currentOpacity * 0.3) + ')');
                gradient.addColorStop(1, star.color + '0)');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        });

        // Create and update shooting stars
        createShootingStar();

        shootingStars.forEach((star, index) => {
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.opacity -= 0.02;

            if (star.opacity > 0) {
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(
                    star.x - Math.cos(star.angle) * star.length,
                    star.y - Math.sin(star.angle) * star.length
                );
                const gradient = ctx.createLinearGradient(
                    star.x, star.y,
                    star.x - Math.cos(star.angle) * star.length,
                    star.y - Math.sin(star.angle) * star.length
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                shootingStars.splice(index, 1);
            }
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');

            const bars = hamburger.querySelectorAll('.bar');
            if (hamburger.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-6px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-6px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && link.parentElement.classList.contains('dropdown')) {
                e.preventDefault();
                link.parentElement.classList.toggle('active');
                return;
            }

            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');

                const bars = hamburger.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
                const sectionId = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });

        lastScroll = currentScroll;
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                dropdowns.forEach(d => d.classList.remove('active'));

                const bars = hamburger.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        }, 250);
    });
}

// ============================================
// TABS
// ============================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Update button states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update panel states
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab + '-panel') {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Observe principle cards
    document.querySelectorAll('.principle-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe symbol cards
    document.querySelectorAll('.symbol-card').forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(card);
    });

    // Observe section titles
    document.querySelectorAll('.section-title, .section-title-cn, .section-label').forEach(el => {
        el.setAttribute('data-aos', 'fade-up');
        observer.observe(el);
    });

    // Observe philosophy cards
    document.querySelectorAll('.philosophy-card').forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe stats
    document.querySelectorAll('.stat').forEach((stat, index) => {
        stat.setAttribute('data-aos', 'fade-up');
        stat.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(stat);
    });

    // Observe codebook steps
    document.querySelectorAll('.step').forEach((step, index) => {
        step.setAttribute('data-aos', 'fade-up');
        step.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(step);
    });
}

// ============================================
// PARALLAX EFFECTS
// ============================================
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    if (hero && heroContent) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - scrolled / 800;
            }
        });
    }

    // Planet system parallax
    const planetSystem = document.querySelector('.planet-system');
    if (planetSystem) {
        window.addEventListener('scroll', function() {
            const rect = planetSystem.getBoundingClientRect();
            const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            if (scrollPercent >= 0 && scrollPercent <= 1) {
                planetSystem.style.transform = `rotate(${scrollPercent * 30}deg)`;
            }
        });
    }
}

// ============================================
// BINARY STREAM ANIMATION
// ============================================
function initBinaryStream() {
    const binaryStream = document.querySelector('.binary-stream span');
    if (!binaryStream) return;

    const originalText = binaryStream.textContent;
    const sequences = [
        '1 0.5 0.11 0.5 1 0.5 0.18 0.5 10 0.5 0.9',
        '10 0.5 0.13 0.5 11 0.5 0.18 0.5 110 0.5 0.9',
        '0.2 0.5 0.21 0.5 1 0.5 0.22 0.5 1 0.5 0.23 0.5 0 0.5 0.9',
        '0.303 0.5 0.15 0.5 0.33 0.5 0.13 0.5 0.32 0.5 0.13 0.5 0.301 0.5 0.9'
    ];

    let currentIndex = 0;

    setInterval(() => {
        binaryStream.style.opacity = '0';
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % sequences.length;
            binaryStream.textContent = sequences[currentIndex];
            binaryStream.style.opacity = '0.6';
        }, 500);
    }, 5000);
}

// Initialize binary stream after DOM is loaded
document.addEventListener('DOMContentLoaded', initBinaryStream);

// ============================================
// SMOOTH REVEAL ON PAGE LOAD
// ============================================
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

window.addEventListener('load', function() {
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// CARD HOVER EFFECTS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.principle-card, .symbol-card, .constant-card, .philosophy-card, .stat');

    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 217, 255, 0.15) 0%, transparent 60%)`;
            }
        });

        card.addEventListener('mouseleave', function() {
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)';
            }
        });
    });
});

// ============================================
// TYPING EFFECT FOR QUOTES
// ============================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Apply typing effect to vision quote when it comes into view
document.addEventListener('DOMContentLoaded', function() {
    const visionQuote = document.querySelector('.vision-quote');
    if (!visionQuote) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const originalText = visionQuote.textContent;
                typeWriter(visionQuote, originalText, 30);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    // Don't apply typing effect by default - just reveal
    // observer.observe(visionQuote);
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle scroll events
window.addEventListener('scroll', throttle(function() {
    // Scroll-related optimizations can be added here
}, 16));

// ============================================
// ACCESSIBILITY
// ============================================
document.addEventListener('keydown', function(e) {
    // Allow keyboard navigation for tabs
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
});

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%c To Infinite and Beyond ', 'background: linear-gradient(135deg, #0a0a0f, #1a1a2e); color: #00d9ff; font-size: 24px; font-weight: bold; padding: 20px 40px; border-radius: 8px;');
console.log('%c A Universal Language for Interstellar Communication ', 'color: #a855f7; font-size: 14px;');
console.log('%c 致无限与永恒 - 一种用于星际交流的宇宙语言 ', 'color: #ec4899; font-size: 12px;');
console.log('');
console.log('%c 1 + 1 = 2 everywhere in the universe ', 'color: #00d9ff; font-style: italic;');

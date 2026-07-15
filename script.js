const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

const setMenuOpen = (isOpen) => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle('open', isOpen);
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navMenu.setAttribute('aria-hidden', String(!isOpen));
};

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetSelector = this.getAttribute('href');
        if (!targetSelector || targetSelector === '#') return;

        const target = document.querySelector(targetSelector);
        if (!target) return;

        e.preventDefault();

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });

        if (history.pushState) {
            history.pushState(null, '', targetSelector);
        } else {
            window.location.hash = targetSelector;
        }

        const hadTabIndex = target.hasAttribute('tabindex');
        if (!hadTabIndex) {
            target.setAttribute('tabindex', '-1');
        }

        target.focus({ preventScroll: true });

        if (!hadTabIndex) {
            target.addEventListener('blur', () => {
                target.removeAttribute('tabindex');
            }, { once: true });
        }

        if (navMenu && navMenu.classList.contains('open')) {
            setMenuOpen(false);
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (!navbar) return;
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    }
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const updateActiveNavLink = () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', updateActiveNavLink);
updateActiveNavLink();

// ========== Lightbox ==========
(function () {
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightbox-img');
    const lightboxCap   = document.getElementById('lightbox-caption');
    const lightboxCount = document.getElementById('lightbox-counter');
    const btnClose      = document.getElementById('lightbox-close');
    const btnPrev       = document.getElementById('lightbox-prev');
    const btnNext       = document.getElementById('lightbox-next');

    if (!lightbox) return;

    let images  = [];
    let current = 0;

    function getCaption(img) {
        const fig = img.closest('figure');
        if (fig) {
            const cap = fig.querySelector('.screenshot-caption');
            if (cap) return cap.textContent.trim();
        }
        return img.alt || '';
    }

    function buildImageList(clickedImg) {
        const card = clickedImg.closest('.project-card');
        if (card) {
            return Array.from(card.querySelectorAll('.screenshot-image'));
        }
        return [clickedImg];
    }

    function show(idx) {
        current = (idx + images.length) % images.length;
        const img = images[current];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCap.textContent = getCaption(img);
        lightboxCount.textContent = images.length > 1 ? `${current + 1} / ${images.length}` : '';
        btnPrev.style.display = images.length > 1 ? '' : 'none';
        btnNext.style.display = images.length > 1 ? '' : 'none';
    }

    function open(clickedImg) {
        images  = buildImageList(clickedImg);
        current = images.indexOf(clickedImg);
        if (current === -1) current = 0;
        show(current);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        btnClose.focus();
    }

    function close() {
        lightbox.hidden = true;
        document.body.style.overflow = '';
        images = [];
    }

    // Attach click/keyboard to all screenshot images
    document.querySelectorAll('.screenshot-image').forEach(img => {
        img.setAttribute('role', 'button');
        if (!img.hasAttribute('tabindex')) {
            img.setAttribute('tabindex', '0');
        }

        const captionText = getCaption(img);
        if (captionText) {
            img.setAttribute('aria-label', `${captionText} 이미지 확대 보기`);
        } else {
            img.setAttribute('aria-label', '이미지 확대 보기');
        }

        img.addEventListener('click', () => open(img));
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(img);
            }
        });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => show(current - 1));
    btnNext.addEventListener('click', () => show(current + 1));

    // Click backdrop to close
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) close();
    });

    // Keyboard: Esc / Arrow
    document.addEventListener('keydown', e => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape')      close();
        if (e.key === 'ArrowLeft')   show(current - 1);
        if (e.key === 'ArrowRight')  show(current + 1);
    });

    // Touch swipe
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) dx < 0 ? show(current + 1) : show(current - 1);
    }, { passive: true });
}());

// External links safety + image loading hints
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    const relSet = new Set(rel);
    relSet.add('noopener');
    relSet.add('noreferrer');
    link.setAttribute('rel', Array.from(relSet).join(' '));
});

document.querySelectorAll('img').forEach(img => {
    if (!img.classList.contains('about-photo') && !img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
    }

    if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
    }
});

if (navToggle && navMenu) {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');

    navToggle.addEventListener('click', () => {
        const isOpen = !navMenu.classList.contains('open');
        setMenuOpen(isOpen);
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            setMenuOpen(false);
        }
    });

    // Close menu by keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            setMenuOpen(false);
            navToggle.focus();
        }
    });
}

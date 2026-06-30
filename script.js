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

// Tech tag click effect (optional: can be used for filtering in the future)
const techTags = document.querySelectorAll('.tech-tag');
techTags.forEach(tag => {
    tag.addEventListener('click', function() {
        console.log('Tech clicked:', this.textContent);
        // Can add filtering functionality here in the future
    });
});

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

    // Attach click to all screenshot images
    document.querySelectorAll('.screenshot-image').forEach(img => {
        img.addEventListener('click', () => open(img));
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

// Console welcome message
console.log('%c안녕하세요! 👋', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%c포트폴리오를 봐주셔서 감사합니다.', 'color: #64748b; font-size: 14px;');
console.log('%c소스 코드가 궁금하신가요? GitHub에서 확인하실 수 있습니다!', 'color: #64748b; font-size: 14px;');

// Hamburger menu toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

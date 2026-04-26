/*
  Singgah Coffee & Book — Main Logic
  Clean, Optimized, and Mobile-First
*/

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ─────────────────────────────────────────────
  // 1. GLOBAL UTILITIES & THEME
  // ─────────────────────────────────────────────
  const config = {
    offset: 80,
    scrollThreshold: 60,
    revealThreshold: 0.1,
    counterDuration: 2000,
  };

  // ─────────────────────────────────────────────
  // 2. NAVBAR & MOBILE MENU
  // ─────────────────────────────────────────────
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = mobileMenu?.querySelector('[data-overlay]');
    const panel = mobileMenu?.querySelector('[data-panel]');
    const closeBtn = mobileMenu?.querySelector('[data-close]');
    
    if (!navbar) return;

    // A. Navbar Scroll
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // Scrolled state
      if (currentScrollY > config.scrollThreshold) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }

      // Hide/Show on scroll (only for desktop or when menu is closed)
      if (!mobileMenu?.classList.contains('open')) {
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          navbar.classList.add('navbar-hidden');
        } else {
          navbar.classList.remove('navbar-hidden');
        }
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });

    // B. Mobile Menu Logic
    if (!hamburgerBtn || !mobileMenu) return;

    const openMenu = () => {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      
      requestAnimationFrame(() => {
        panel?.classList.remove('translate-x-full');
        overlay?.classList.remove('opacity-0');
      });
    };

    const closeMenu = () => {
      panel?.classList.add('translate-x-full');
      overlay?.classList.add('opacity-0');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      
      setTimeout(() => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }, 300);
    };

    hamburgerBtn.addEventListener('click', openMenu);
    [overlay, closeBtn].forEach(el => el?.addEventListener('click', closeMenu));
    
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ─────────────────────────────────────────────
  // 3. SMOOTH SCROLL & ACTIVE LINK
  // ─────────────────────────────────────────────
  function initScrolling() {
    // A. Smooth Scroll
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - config.offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });

    // B. Active Link Highlight
    const navLinks = document.querySelectorAll('#navbar ul a[href^="#"]');
    const sections = Array.from(navLinks)
      .map(link => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('text-accent', link.getAttribute('href') === `#${entry.target.id}`);
            link.classList.toggle('text-text-inverse', link.getAttribute('href') !== `#${entry.target.id}`);
          });
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
  }

  // ─────────────────────────────────────────────
  // 4. MENU FILTERS
  // ─────────────────────────────────────────────
  function initMenuFilters() {
    const container = document.getElementById('menu-filters');
    if (!container) return;

    const buttons = container.querySelectorAll('button');
    const cards = document.querySelectorAll('[data-category]');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.textContent.trim().toLowerCase();
        
        // Update Buttons UI
        buttons.forEach(b => {
          b.classList.toggle('bg-primary', b === btn);
          b.classList.toggle('text-text-inverse', b === btn);
          b.classList.toggle('bg-background', b !== btn);
          b.classList.toggle('text-secondary', b !== btn);
        });

        // Filter Cards
        cards.forEach(card => {
          const match = category === 'all' || card.dataset.category === category;
          if (match) {
            card.style.display = '';
            requestAnimationFrame(() => card.style.opacity = '1');
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
          }
        });
      });
    });
  }

  // ─────────────────────────────────────────────
  // 5. ANIMATIONS (REVEAL & COUNTERS)
  // ─────────────────────────────────────────────
  function initAnimations() {
    // A. Scroll Reveal
    const revealTargets = document.querySelectorAll('section > div, .reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealTargets.forEach(el => {
      el.classList.add('reveal-init');
      revealObserver.observe(el);
    });

    // B. Counters
    const counters = document.querySelectorAll('[data-counter-target]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.counterTarget || '0');
      const suffix = el.dataset.counterSuffix || '';
      const decimals = parseInt(el.dataset.counterDecimals || '0');
      const startTime = performance.now();

      const update = (now) => {
        const progress = Math.min((now - startTime) / config.counterDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        
        el.textContent = current.toFixed(decimals) + suffix;
        
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(update);
    };

    counters.forEach(c => counterObserver.observe(c));
  }

  // ─────────────────────────────────────────────
  // 6. LIGHTBOX & GALLERY
  // ─────────────────────────────────────────────
  function initLightbox() {
    const gallery = document.getElementById('gallery-grid');
    if (!gallery) return;

    const links = Array.from(gallery.querySelectorAll('a'));
    if (!links.length) return;

    let currentIndex = 0;
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 z-[100] hidden flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-sm transition-opacity duration-300 opacity-0';
    lightbox.innerHTML = `
      <button class="absolute top-6 right-6 text-white hover:text-accent transition-colors p-2" data-close aria-label="Close">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <button class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4" data-prev aria-label="Previous">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button class="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4" data-next aria-label="Next">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
      <img src="" alt="" class="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 transform scale-95 opacity-0">
      <div class="mt-6 text-white/60 text-sm tracking-widest" data-counter>0 / 0</div>
    `;
    document.body.appendChild(lightbox);

    const img = lightbox.querySelector('img');
    const counter = lightbox.querySelector('[data-counter]');

    const showImg = (idx) => {
      currentIndex = (idx + links.length) % links.length;
      const targetImg = links[currentIndex].querySelector('img');
      
      img.classList.add('opacity-0', 'scale-95');
      setTimeout(() => {
        img.src = targetImg.src;
        img.alt = targetImg.alt;
        counter.textContent = `${currentIndex + 1} / ${links.length}`;
        img.classList.remove('opacity-0', 'scale-95');
      }, 200);
    };

    const open = (i) => {
      currentIndex = i;
      lightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        lightbox.classList.add('opacity-100');
        showImg(i);
      }, 10);
    };

    const close = () => {
      lightbox.classList.remove('opacity-100');
      setTimeout(() => {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    };

    links.forEach((link, i) => link.addEventListener('click', (e) => { e.preventDefault(); open(i); }));
    lightbox.querySelector('[data-close]').addEventListener('click', close);
    lightbox.querySelector('[data-prev]').addEventListener('click', (e) => { e.stopPropagation(); showImg(currentIndex - 1); });
    lightbox.querySelector('[data-next]').addEventListener('click', (e) => { e.stopPropagation(); showImg(currentIndex + 1); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    
    document.addEventListener('keydown', (e) => {
      if (lightbox.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showImg(currentIndex - 1);
      if (e.key === 'ArrowRight') showImg(currentIndex + 1);
    });
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  initNavigation();
  initScrolling();
  initMenuFilters();
  initAnimations();
  initLightbox();
});

/*
=== REQUIRED HTML HOOKS ===

IDs:
  navbar            — top-level <nav> element
  hamburger-btn     — mobile hamburger toggle <button>
  mobile-menu       — mobile nav menu container (ul or div)
  menu-filters      — container with filter tab buttons
  menu-grid         — wrapper around all menu cards
  marquee-track     — inner track element inside marquee wrapper
  gallery-grid      — container wrapping all gallery images
  hero-image        — hero background <img> or <div> for parallax

Classes:
  reveal            — any element to fade-in on scroll
                      optional: data-delay="0.2" (seconds)
  counter           — <span> elements for animated numbers
                      required: data-target="50"
                      optional: data-suffix="+", data-prefix="Rp"
  gallery-img       — each clickable gallery <img>
                      required: data-src="/full-quality.jpg"
  nav-link          — each anchor in desktop nav

Data Attributes:
  data-category     — on each menu card (e.g. "coffee", "food")
                      filter buttons need matching text content
  data-target       — counter final value (int or float)
  data-suffix       — counter suffix string
  data-prefix       — counter prefix string
  data-delay        — reveal delay in seconds
  data-src          — gallery full-resolution image URL

Section IDs for nav intersection:
  hero, about, menu, gallery, testimonials, visit

CSS the UI dev must add to the navbar:
  transition: all 0.4s ease;

CSS the UI dev must add for .nav-link.active:
  color: var(--color-caramel);
  border-bottom: 1px solid var(--color-caramel);

CSS the UI dev must add for #mobile-menu:
  max-height: 0; opacity: 0; overflow: hidden;
  transition: max-height 0.4s ease, opacity 0.3s ease;

CSS for #mobile-menu.open:
  max-height: 400px; opacity: 1;

CSS for .navbar.scrolled is injected by JS.
*/

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ─────────────────────────────────────────────
  // 1. NAVBAR SCROLL BEHAVIOR
  // ─────────────────────────────────────────────
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (window.scrollY > 60) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
    };

    // Inject scrolled-state styles
    const style = document.createElement('style');
    style.textContent = `
      .navbar.scrolled {
        background: var(--color-parchment) !important;
        border-bottom: 1px solid var(--color-mist);
        box-shadow: 0 2px 20px rgba(0,0,0,0.06);
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
  }


  // ─────────────────────────────────────────────
  // 2. HAMBURGER MENU
  // ─────────────────────────────────────────────
  function initHamburgerMenu() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    const open = () => {
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    };

    const toggle = () => {
      menu.classList.contains('open') ? close() : open();
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // Close on any link click inside menu
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', close);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        close();
      }
    });

    // Force close on desktop resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) close();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }


  // ─────────────────────────────────────────────
  // 3. SMOOTH SCROLL
  // ─────────────────────────────────────────────
  function initSmoothScroll() {
    const OFFSET = 80;

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close hamburger menu if open on mobile
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        const btn = document.getElementById('hamburger-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ─────────────────────────────────────────────
  // 4. MENU FILTER TABS
  // ─────────────────────────────────────────────
  function initMenuFilter() {
    const filtersContainer = document.getElementById('menu-filters');
    const grid = document.getElementById('menu-grid');
    if (!filtersContainer || !grid) return;

    const tabs = filtersContainer.querySelectorAll('button');
    const cards = grid.querySelectorAll('[data-category]');

    const filterCards = (category) => {
      cards.forEach(card => {
        const match = category === 'all' || card.dataset.category === category;

        if (match) {
          card.style.display = '';
          // Force reflow then fade in
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.opacity = '1';
            });
          });
        } else {
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    };

    // Inject card transition
    cards.forEach(card => {
      card.style.transition = 'opacity 300ms ease';
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Toggle active class
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.textContent.trim().toLowerCase();
        filterCards(category);
      });
    });
  }


  // ─────────────────────────────────────────────
  // 5. SCROLL REVEAL
  // ─────────────────────────────────────────────
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    // Respect reduced motion preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Set initial hidden state
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(36px)';
      el.style.transition = 'none'; // prevent flash on load
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = el.dataset.delay || '0';

        el.style.transition = `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';

        obs.unobserve(el);
      });
    }, { threshold: 0.12 });

    // Delay observer start to avoid triggering on initial paint
    requestAnimationFrame(() => {
      elements.forEach(el => observer.observe(el));
    });
  }


  // ─────────────────────────────────────────────
  // 6. NUMBER COUNTER ANIMATION
  // ─────────────────────────────────────────────
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animateCounter = (el) => {
      const rawTarget = el.dataset.target || '0';
      const isDecimal = rawTarget.includes('.');
      const target = parseFloat(rawTarget);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 2000;
      const startTime = performance.now();

      const format = (val) => {
        let display;
        if (isDecimal) {
          display = val.toFixed(1);
        } else {
          display = Math.round(val).toLocaleString('en-US');
        }
        return `${prefix}${display}${suffix}`;
      };

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = target * eased;

        el.textContent = format(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = format(target); // exact final value
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }


  // ─────────────────────────────────────────────
  // 7. MARQUEE ANIMATION
  // ─────────────────────────────────────────────
  function initMarquee() {
    const track = document.getElementById('marquee-track');
    if (!track) return;

    // Clone inner content for seamless loop
    const clone = track.innerHTML;
    track.innerHTML += clone;

    // Inject keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes marqueeScroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      #marquee-track {
        animation: marqueeScroll 35s linear infinite;
        will-change: transform;
      }
      #marquee-track:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);
  }


  // ─────────────────────────────────────────────
  // 8. GALLERY LIGHTBOX
  // ─────────────────────────────────────────────
  function initGalleryLightbox() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const images = Array.from(grid.querySelectorAll('.gallery-img'));
    if (!images.length) return;

    let currentIndex = 0;
    let overlay = null;
    let lightboxImg = null;

    const buildLightbox = () => {
      overlay = document.createElement('div');
      overlay.id = 'lightbox-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(15,13,10,0.95);
        opacity: 0; transition: opacity 300ms ease;
        cursor: pointer;
      `;

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.setAttribute('aria-label', 'Close lightbox');
      closeBtn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
      closeBtn.style.cssText = `
        position: absolute; top: 20px; right: 24px;
        background: none; border: none; color: #FAF7F2;
        cursor: pointer; z-index: 2; transition: color 200ms;
        padding: 8px;
      `;
      closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = 'var(--color-caramel, #D4A853)'; });
      closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = '#FAF7F2'; });
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

      // Prev button
      const prevBtn = document.createElement('button');
      prevBtn.setAttribute('aria-label', 'Previous image');
      prevBtn.innerHTML = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      prevBtn.style.cssText = `
        position: absolute; left: 16px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; color: #FAF7F2;
        cursor: pointer; z-index: 2; transition: color 200ms;
        padding: 12px;
      `;
      prevBtn.addEventListener('mouseenter', () => { prevBtn.style.color = 'var(--color-caramel, #D4A853)'; });
      prevBtn.addEventListener('mouseleave', () => { prevBtn.style.color = '#FAF7F2'; });
      prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });

      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.setAttribute('aria-label', 'Next image');
      nextBtn.innerHTML = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      nextBtn.style.cssText = `
        position: absolute; right: 16px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; color: #FAF7F2;
        cursor: pointer; z-index: 2; transition: color 200ms;
        padding: 12px;
      `;
      nextBtn.addEventListener('mouseenter', () => { nextBtn.style.color = 'var(--color-caramel, #D4A853)'; });
      nextBtn.addEventListener('mouseleave', () => { nextBtn.style.color = '#FAF7F2'; });
      nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

      // Counter
      const counter = document.createElement('span');
      counter.id = 'lightbox-counter';
      counter.style.cssText = `
        position: absolute; bottom: 24px; left: 50%;
        transform: translateX(-50%); color: #FAF7F2;
        font-size: 13px; letter-spacing: 0.1em; opacity: 0.7;
      `;

      // Image
      lightboxImg = document.createElement('img');
      lightboxImg.style.cssText = `
        max-height: 85vh; max-width: 90vw;
        object-fit: contain; cursor: default;
        border-radius: 6px;
        transition: opacity 250ms ease;
      `;
      lightboxImg.addEventListener('click', (e) => e.stopPropagation());

      overlay.append(closeBtn, prevBtn, nextBtn, lightboxImg, counter);
      document.body.appendChild(overlay);

      // Close on overlay background click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLightbox();
      });
    };

    const showImage = (index) => {
      currentIndex = ((index % images.length) + images.length) % images.length;
      const src = images[currentIndex].dataset.src || images[currentIndex].src;
      const alt = images[currentIndex].alt || '';
      const counter = document.getElementById('lightbox-counter');

      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightboxImg.style.opacity = '1';
        if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
      }, 180);
    };

    const navigate = (dir) => showImage(currentIndex + dir);

    const openLightbox = (index) => {
      if (!overlay) buildLightbox();
      document.body.style.overflow = 'hidden';
      overlay.style.display = 'flex';
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });
      showImage(index);
    };

    const closeLightbox = () => {
      if (!overlay) return;
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    };

    // Bind click on each gallery image
    images.forEach((img, i) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(i);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!overlay || overlay.style.display === 'none') return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }


  // ─────────────────────────────────────────────
  // 9. ACTIVE NAV HIGHLIGHT
  // ─────────────────────────────────────────────
  function initActiveNavHighlight() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length) return;

    const sectionIds = Array.from(navLinks)
      .map(a => a.getAttribute('href'))
      .filter(href => href && href.startsWith('#'))
      .map(href => href.slice(1));

    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const clearActive = () => {
      navLinks.forEach(link => link.classList.remove('active'));
    };

    const setActive = (id) => {
      clearActive();
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, { threshold: [0.3], rootMargin: '-80px 0px -40% 0px' });

    sections.forEach(section => observer.observe(section));
  }


  // ─────────────────────────────────────────────
  // 10. FLOATING WHATSAPP BUTTON
  // ─────────────────────────────────────────────
  function initWhatsAppButton() {
    // Inject styles and keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes waPulse {
        0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
        70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
        100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
      }
      #wa-float {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #25D366;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        cursor: pointer;
        text-decoration: none;
        box-shadow: 0 4px 20px rgba(37,211,102,0.4);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease, transform 0.3s ease;
        animation: waPulse 2s infinite;
      }
      #wa-float.visible {
        opacity: 1;
        pointer-events: auto;
      }
      #wa-float:hover {
        transform: scale(1.08);
        background: #1ebe57;
      }
    `;
    document.head.appendChild(style);

    // Create button
    const btn = document.createElement('a');
    btn.id = 'wa-float';
    btn.href = 'https://wa.me/6281234567890';
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Chat on WhatsApp');
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
    document.body.appendChild(btn);

    // Show/hide on scroll
    let ticking = false;
    const threshold = window.innerHeight * 0.8;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > threshold);
        ticking = false;
      });
    }, { passive: true });
  }


  // ─────────────────────────────────────────────
  // 11. HERO PARALLAX
  // ─────────────────────────────────────────────
  function initHeroParallax() {
    const heroImg = document.getElementById('hero-image');
    if (!heroImg) return;

    // Respect reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (window.scrollY < window.innerHeight) {
          heroImg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }


  // ─────────────────────────────────────────────
  // 12. SCROLL PROGRESS BAR
  // ─────────────────────────────────────────────
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10000;
      height: 2px;
      width: 0%;
      background: var(--color-caramel, #D4A853);
      transition: width 0.1s linear;
      pointer-events: none;
    `;
    document.body.appendChild(bar);

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollable = docHeight - winHeight;
        const pct = scrollable > 0
          ? (window.scrollY / scrollable) * 100
          : 0;
        bar.style.width = `${pct}%`;
        ticking = false;
      });
    }, { passive: true });
  }


  // ─────────────────────────────────────────────
  // INIT ALL FEATURES
  // ─────────────────────────────────────────────
  initNavbarScroll();
  initHamburgerMenu();
  initSmoothScroll();
  initMenuFilter();
  initScrollReveal();
  initCounters();
  initMarquee();
  initGalleryLightbox();
  initActiveNavHighlight();
  initWhatsAppButton();
  initHeroParallax();
  initScrollProgress();
});

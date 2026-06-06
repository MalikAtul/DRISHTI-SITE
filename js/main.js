document.addEventListener('DOMContentLoaded', () => {
  /* ── Register GSAP ───────────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ── Utility: debounce ───────────────────────────────────────── */
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ================================================================
     1. LOADING SCREEN
     ================================================================ */
  (function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const statusEl = loader.querySelector('.loader-status');
    const messages = [
      { text: 'INITIALIZING SYSTEMS...', time: 0 },
      { text: 'LOADING AI MODELS...', time: 800 },
      { text: 'CALIBRATING SENSORS...', time: 1600 },
      { text: 'READY', time: 2400 }
    ];

    if (statusEl) {
      messages.forEach(({ text, time }) => {
        setTimeout(() => {
          statusEl.textContent = text;
        }, time);
      });
    }

    setTimeout(() => {
      loader.style.clipPath = 'circle(150% at 50% 50%)';
      loader.style.transition = 'clip-path 0.6s ease-in-out';
      setTimeout(() => {
        loader.style.display = 'none';
        window.dispatchEvent(new CustomEvent('loaderComplete'));
      }, 600);
    }, 2700);
  })();

  /* ================================================================
     2. NAVIGATION
     ================================================================ */
  (function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuBtn = document.querySelector('.menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const lightSections = ['problem', 'gloves', 'how-it-works', 'isl-gallery', 'tech-stack', 'creator'];

    function updateNav() {
      if (!navbar) return;

      // Scrolled state
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Light-nav detection
      let isLight = false;
      for (const id of lightSections) {
        const section = document.getElementById(id);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom > 80) {
          isLight = true;
          break;
        }
      }
      navbar.classList.toggle('light-nav', isLight);
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    // Smooth scroll on nav links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          // Close mobile menu
          if (menuBtn) menuBtn.classList.remove('open');
          if (mobileMenu) mobileMenu.classList.remove('open');
        }
      });
    });

    // Hamburger toggle
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
      });
    }
  })();

  /* ================================================================
     3. SCROLL PROGRESS BAR
     ================================================================ */
  (function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function update() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.transform = 'scaleX(' + ratio + ')';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ================================================================
     4. REVEAL ANIMATIONS
     ================================================================ */
  (function initRevealAnimations() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay;
            if (delay) {
              entry.target.style.transitionDelay = delay + 'ms';
            }
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      observer.observe(el);
    });
  })();

  /* ================================================================
     5. WHITE CIRCLE WIPE TRANSITIONS
     ================================================================ */
  (function initCircleWipe() {
    const wipe = document.getElementById('circle-wipe');
    if (!wipe) return;

    const triggered = new Set();

    function triggerCircleWipe() {
      if (prefersReducedMotion) return;
      wipe.classList.add('expanding');
      setTimeout(() => {
        wipe.classList.remove('expanding');
      }, 1200);
    }

    // Expose globally so other scripts can use it
    window.triggerCircleWipe = triggerCircleWipe;

    const targets = document.querySelectorAll('#problem, #gloves, #kai');
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !triggered.has(entry.target.id)) {
            triggered.add(entry.target.id);
            triggerCircleWipe();
          }
        });
      },
      { threshold: 0.05 }
    );

    targets.forEach(el => observer.observe(el));
  })();

  /* ================================================================
     6. COUNTER ANIMATIONS
     ================================================================ */
  (function initCounters() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-count]').forEach(el => {
        el.textContent = el.dataset.count;
      });
      return;
    }

    function animateCounter(el) {
      const raw = el.dataset.count;
      let prefix = '';
      let suffix = '';
      let numStr = raw;

      // Extract prefix
      const prefixMatch = raw.match(/^([₹<])/);
      if (prefixMatch) {
        prefix = prefixMatch[1];
        numStr = numStr.slice(prefix.length);
      }

      // Extract suffix
      const suffixMatch = numStr.match(/([+ms%]+)$/);
      if (suffixMatch) {
        suffix = suffixMatch[1];
        numStr = numStr.slice(0, -suffix.length);
      }

      const target = parseFloat(numStr);
      if (isNaN(target)) return;

      const isFloat = numStr.includes('.');
      const decimals = isFloat ? (numStr.split('.')[1] || '').length : 0;
      const duration = 2000;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        el.textContent = prefix + (isFloat ? current.toFixed(decimals) : Math.round(current)) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  })();

  /* ================================================================
     7. SIDE SECTION NAVIGATOR
     ================================================================ */
  (function initSideNav() {
    const sideNav = document.getElementById('side-nav');
    if (!sideNav) return;

    const items = sideNav.querySelectorAll('.sn-item');
    const fillBar = sideNav.querySelector('.sn-fill');
    const trackedSections = ['gloves', 'kai'];
    const sectionEls = trackedSections.map(id => document.getElementById(id)).filter(Boolean);

    function updateSideNav() {
      if (sectionEls.length === 0) return;

      let anyVisible = false;
      let activeIdx = -1;

      sectionEls.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
          anyVisible = true;
          activeIdx = i;
        }
      });

      sideNav.classList.toggle('visible', anyVisible);

      items.forEach((item, i) => {
        item.classList.toggle('active', i === activeIdx);
      });

      // Fill bar progress within active section
      if (activeIdx >= 0 && fillBar) {
        const section = sectionEls[activeIdx];
        const rect = section.getBoundingClientRect();
        const sectionProgress = Math.min(
          Math.max(-rect.top / (rect.height - window.innerHeight), 0),
          1
        );
        fillBar.style.width = (sectionProgress * 100) + '%';
      }
    }

    window.addEventListener('scroll', updateSideNav, { passive: true });
    updateSideNav();

    // Click handlers
    items.forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.dataset.target;
        if (targetId) {
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  })();

  /* ================================================================
     8. HINDI / ENGLISH TOGGLE
     ================================================================ */
  (function initHindiToggle() {
    const btn = document.getElementById('hindi-toggle');
    if (!btn) return;

    let isHindi = false;

    btn.addEventListener('click', () => {
      isHindi = !isHindi;
      const elements = document.querySelectorAll('[data-en][data-hi]');

      elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.15s ease';

        setTimeout(() => {
          el.textContent = isHindi ? el.dataset.hi : el.dataset.en;
          el.style.opacity = '1';
        }, 150);
      });

      btn.textContent = isHindi ? 'EN' : 'हि';
    });
  })();

  /* ================================================================
     9. EXHIBITION MODE
     ================================================================ */
  (function initExhibitionMode() {
    const btn = document.getElementById('exhibition-btn');
    if (!btn) return;

    let isExhibition = false;
    let isPaused = false;
    let animFrameId = null;
    let overlay = null;

    function createOverlay() {
      overlay = document.createElement('div');
      overlay.id = 'exhibition-overlay';
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;' +
        'justify-content:center;background:rgba(0,0,0,0.85);color:#fff;' +
        'font-family:inherit;text-align:center;pointer-events:none;' +
        'transition:opacity 0.5s ease;opacity:1;';
      overlay.innerHTML =
        '<div style="font-size:1.4rem;line-height:2">' +
        'DRISHTI EXHIBITION MODE<br>' +
        '<span style="font-size:0.9rem;opacity:0.7">Touch to pause &middot; Double-tap corner to exit</span>' +
        '</div>';
      document.body.appendChild(overlay);

      setTimeout(() => {
        if (overlay) overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
          overlay = null;
        }, 500);
      }, 3000);
    }

    function autoScroll() {
      if (!isExhibition) return;
      if (!isPaused) {
        window.scrollBy(0, 0.5);
      }
      animFrameId = requestAnimationFrame(autoScroll);
    }

    function enterExhibition() {
      isExhibition = true;
      isPaused = false;
      document.documentElement.requestFullscreen().catch(() => {});
      document.body.style.cursor = 'none';
      createOverlay();
      autoScroll();
    }

    function exitExhibition() {
      isExhibition = false;
      isPaused = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      document.body.style.cursor = '';
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }

    btn.addEventListener('click', () => {
      if (!isExhibition) enterExhibition();
      else exitExhibition();
    });

    // Touch/click to pause
    document.addEventListener('click', (e) => {
      if (!isExhibition) return;
      if (e.target === btn) return;
      isPaused = !isPaused;
    });

    // Double-click in top-left corner or Escape to exit
    document.addEventListener('dblclick', (e) => {
      if (!isExhibition) return;
      if (e.clientX < 50 && e.clientY < 50) {
        exitExhibition();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isExhibition) {
        exitExhibition();
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && isExhibition) {
        exitExhibition();
      }
    });
  })();

  /* ================================================================
     10. SIGNAL JOURNEY ANIMATION
     ================================================================ */
  (function initSignalJourney() {
    const section = document.getElementById('signal-journey');
    if (!section) return;

    const nodes = section.querySelectorAll('.sj-node');
    const pulse = section.querySelector('.sj-pulse');
    const resultText = section.querySelector('.sj-result');
    if (nodes.length === 0) return;

    const HOP_DURATION = 800;
    let loopTimer = null;
    let isRunning = false;

    function runCycle() {
      // Reset all
      nodes.forEach(n => n.classList.remove('active'));
      if (resultText) {
        resultText.style.opacity = '0';
      }
      if (pulse) pulse.classList.remove('traveling');

      let step = 0;

      function activateNext() {
        if (!isRunning) return;
        if (step < nodes.length) {
          nodes[step].classList.add('active');
          if (pulse) {
            const nodeRect = nodes[step].getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            pulse.style.left = (nodeRect.left - sectionRect.left + nodeRect.width / 2) + 'px';
            pulse.style.top = (nodeRect.top - sectionRect.top + nodeRect.height / 2) + 'px';
            pulse.classList.add('traveling');
          }
          step++;
          setTimeout(activateNext, HOP_DURATION);
        } else {
          // Last node reached — show result
          if (resultText) {
            resultText.textContent = 'पानी';
            resultText.style.opacity = '1';
            resultText.style.transition = 'opacity 0.5s ease';
          }
          // Pause then loop
          loopTimer = setTimeout(() => {
            if (isRunning) runCycle();
          }, 2000);
        }
      }

      activateNext();
    }

    function startJourney() {
      if (isRunning) return;
      isRunning = true;
      runCycle();
    }

    function stopJourney() {
      isRunning = false;
      if (loopTimer) clearTimeout(loopTimer);
      nodes.forEach(n => n.classList.remove('active'));
    }

    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) startJourney();
          else stopJourney();
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
  })();

  /* ================================================================
     11. FEATURE CARDS SCROLL (GSAP ScrollTrigger)
     ================================================================ */
  (function initFeatureCards() {
    const containers = ['#gloves-features', '#kai-features'];

    containers.forEach(selector => {
      const section = document.querySelector(selector);
      if (!section) return;

      const cards = section.querySelectorAll('.feature-card');
      const descEl = section.querySelector('.feature-desc');
      const descriptions = [];
      const progressSegs = section.querySelectorAll('.progress-seg');

      cards.forEach(card => {
        descriptions.push(card.dataset.desc || '');
      });

      if (cards.length === 0) return;

      function setActiveCard(index) {
        cards.forEach((card, i) => {
          if (i === index) {
            card.classList.remove('inactive');
            card.classList.add('active');
          } else {
            card.classList.remove('active');
            card.classList.add('inactive');
          }
        });

        if (descEl && descriptions[index]) {
          descEl.textContent = descriptions[index];
        }

        progressSegs.forEach((seg, i) => {
          seg.classList.toggle('active', i <= index);
        });
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const total = cards.length;
          let idx = Math.min(Math.floor(p * total), total - 1);
          setActiveCard(idx);
        }
      });
    });
  })();

  /* ================================================================
     12. ISL GALLERY
     ================================================================ */
  (function initISLGallery() {
    const gallery = document.querySelector('#isl-gallery .gallery-track');
    if (!gallery) return;

    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;

    // Mouse drag
    gallery.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX;
      scrollStart = gallery.scrollLeft;
      gallery.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.pageX - startX;
      gallery.scrollLeft = scrollStart - dx;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        gallery.style.cursor = 'grab';
        snapToCard();
      }
    });

    // Touch drag
    gallery.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
      scrollStart = gallery.scrollLeft;
    }, { passive: true });

    gallery.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].pageX - startX;
      gallery.scrollLeft = scrollStart - dx;
    }, { passive: true });

    gallery.addEventListener('touchend', () => {
      snapToCard();
    }, { passive: true });

    function snapToCard() {
      const cards = gallery.querySelectorAll('.gallery-card');
      if (cards.length === 0) return;
      const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight || 0);
      const nearestIdx = Math.round(gallery.scrollLeft / cardWidth);
      gallery.scrollTo({ left: nearestIdx * cardWidth, behavior: 'smooth' });
      updateActiveCard(nearestIdx);
    }

    function updateActiveCard(idx) {
      const cards = gallery.querySelectorAll('.gallery-card');
      cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    }

    // Arrow buttons
    const prevBtn = document.querySelector('#isl-gallery .gallery-prev');
    const nextBtn = document.querySelector('#isl-gallery .gallery-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const cards = gallery.querySelectorAll('.gallery-card');
        if (cards.length === 0) return;
        const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight || 0);
        const currentIdx = Math.round(gallery.scrollLeft / cardWidth);
        const newIdx = Math.max(0, currentIdx - 1);
        gallery.scrollTo({ left: newIdx * cardWidth, behavior: 'smooth' });
        updateActiveCard(newIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const cards = gallery.querySelectorAll('.gallery-card');
        if (cards.length === 0) return;
        const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight || 0);
        const currentIdx = Math.round(gallery.scrollLeft / cardWidth);
        const newIdx = Math.min(cards.length - 1, currentIdx + 1);
        gallery.scrollTo({ left: newIdx * cardWidth, behavior: 'smooth' });
        updateActiveCard(newIdx);
      });
    }

    // Update active on scroll
    gallery.addEventListener('scroll', debounce(() => {
      const cards = gallery.querySelectorAll('.gallery-card');
      if (cards.length === 0) return;
      const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight || 0);
      const idx = Math.round(gallery.scrollLeft / cardWidth);
      updateActiveCard(idx);
    }, 100), { passive: true });
  })();

  /* ================================================================
     13. CREATOR TYPEWRITER
     ================================================================ */
  (function initCreatorTypewriter() {
    const section = document.getElementById('creator');
    if (!section) return;

    const nameEl = section.querySelector('.creator-name');
    if (!nameEl) return;

    if (prefersReducedMotion) return;

    const fullText = nameEl.textContent;
    nameEl.textContent = '';
    let hasPlayed = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasPlayed) {
            hasPlayed = true;
            let i = 0;
            function type() {
              if (i <= fullText.length) {
                nameEl.textContent = fullText.slice(0, i);
                i++;
                setTimeout(type, 80);
              }
            }
            type();
            observer.unobserve(section);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
  })();

  /* ================================================================
     RESIZE HANDLER (debounced)
     ================================================================ */
  window.addEventListener('resize', debounce(() => {
    ScrollTrigger.refresh();
  }, 150));
});

'use strict';

// ===== NAVIGATION =====
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const hamburger = nav.querySelector('.nav__hamburger');
  const navLinks = nav.querySelector('.nav__links');
  const isHeroNav = nav.classList.contains('hero-nav');

  function updateNav() {
    if (isHeroNav) {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  if (hamburger && navLinks) {
    const origParent = navLinks.parentElement;
    const origNextSibling = navLinks.nextElementSibling;

    function closeMenu() {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      // Remet navLinks dans le nav (annule le fix Android)
      if (navLinks.parentElement === document.body) {
        origParent.insertBefore(navLinks, origNextSibling);
      }
    }

    hamburger.addEventListener('click', function () {
      const open = hamburger.classList.toggle('open');
      if (open) {
        // Déplace vers <body> seulement à l'ouverture (fix stacking context Android)
        document.body.appendChild(navLinks);
        navLinks.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      } else {
        closeMenu();
      }
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }
})();

// ===== ACTIVE NAV LINK =====
(function () {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ===== FAQ ACCORDION =====
(function () {
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var answer = item.querySelector('.faq-answer');
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-answer').classList.remove('open');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        answer.classList.add('open');
      }
    });
  });
})();

// ===== SCROLL FADE IN =====
(function () {
  if (!('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
})();

// ===== INTRANET MUSICIENS =====
(function () {
  var overlay = document.getElementById('intranet-overlay');
  var input = document.getElementById('intranet-pwd');
  var errorEl = document.getElementById('intranet-error');
  if (!overlay) return;

  window.openIntranet = function () {
    overlay.classList.add('open');
    setTimeout(function () { if (input) input.focus(); }, 50);
    if (errorEl) errorEl.textContent = '';
    if (input) input.value = '';
  };

  window.closeIntranet = function () {
    overlay.classList.remove('open');
  };

  window.submitIntranet = function () {
    if (input && input.value === 'paysperdu2020') {
      window.open('https://lehahiah-book-5lik.glide.page/dl/a400f7', '_blank', 'noopener');
      closeIntranet();
    } else {
      if (errorEl) errorEl.textContent = 'Mot de passe incorrect.';
      if (input) { input.value = ''; input.focus(); }
    }
  };

  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitIntranet();
      if (e.key === 'Escape') closeIntranet();
    });
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeIntranet();
  });
})();

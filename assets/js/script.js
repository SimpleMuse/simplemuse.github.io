// script.js
// Consolidated site JS: menu toggle, smooth scroll, gallery filter, lightbox, form validation, and theme toggle

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------- Theme toggle -------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;
  
  // Initialize theme from localStorage or system preference
  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      htmlEl.classList.toggle('dark-theme', saved === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      htmlEl.classList.add('dark-theme');
    }
  }
  
  function toggleTheme() {
    htmlEl.classList.toggle('dark-theme');
    const isDark = htmlEl.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  
  initTheme();
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  /* -------------------- Smooth scrolling -------------------- */
  const mainNav = document.getElementById('mainNav');
  if (mainNav) {
    const navLinks = mainNav.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { targetEl.setAttribute('tabindex', '-1'); targetEl.focus({ preventScroll: true }); }, 300);
    }));
  }

  if (location.hash) {
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }

  /* -------------------- Gallery and filter -------------------- */
  const gallery = document.querySelector('.gallery');
  const galleryItems = gallery ? Array.from(gallery.querySelectorAll('.gallery-item')) : [];
  const projectCards = gallery ? Array.from(gallery.querySelectorAll('.project-card')) : [];
  const filterButtons = document.querySelectorAll('.filter-btn');

  function filterProjects(category) {
    const cards = projectCards;
    if (!cards.length) return;
    if (category === 'all') {
      cards.forEach(card => card.classList.remove('is-hidden'));
    } else {
      cards.forEach(card => {
        const link = card.querySelector('.gallery-item');
        const cats = (link ? link.getAttribute('data-category') || '' : '').split(/\s+/).filter(Boolean);
        const matches = cats.includes(category);
        card.classList.toggle('is-hidden', !matches);
      });
    }
    filterButtons.forEach(btn => {
      const isActive = btn.dataset.filter === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  window.filterProjects = filterProjects;
  filterButtons.forEach(btn => btn.addEventListener('click', () => filterProjects(btn.dataset.filter || 'all')));

  /* -------------------- Lightbox -------------------- */
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <div class="lightbox-content" role="dialog" aria-modal="true">
        <button class="lightbox-close" aria-label="Close">✕</button>
        <button class="lightbox-prev" aria-label="Previous">◀</button>
        <img class="lightbox-img" src="" alt="">
        <button class="lightbox-next" aria-label="Next">▶</button>
        <div class="lightbox-caption"></div>
      </div>`;
    document.body.appendChild(lightbox);
  }

  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');
  const lbPrev = lightbox.querySelector('.lightbox-prev');
  const lbNext = lightbox.querySelector('.lightbox-next');
  let currentIndex = -1;

  function openLightbox(index) {
    const item = galleryItems[index];
    if (!item) return;
    const href = item.getAttribute('href');
    const img = item.querySelector('img');
    const alt = img ? img.alt || '' : '';
    lbImg.src = href;
    lbImg.alt = alt;
    lbCaption.textContent = alt;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    currentIndex = index;
    lbClose.focus();
    document.addEventListener('keydown', onLightboxKey);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    currentIndex = -1;
    document.removeEventListener('keydown', onLightboxKey);
  }

  function showPrev() { if (currentIndex > 0) openLightbox(currentIndex - 1); }
  function showNext() { if (currentIndex < galleryItems.length - 1) openLightbox(currentIndex + 1); }

  function onLightboxKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  }

  galleryItems.forEach((a, i) => a.addEventListener('click', (ev) => { ev.preventDefault(); openLightbox(i); }));
  lightbox.addEventListener('click', (ev) => { if (ev.target === lightbox) closeLightbox(); });
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  /* -------------------- Contact form validation -------------------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const nameInput = contactForm.querySelector('#name');
    const emailInput = contactForm.querySelector('#email');
    const messageInput = contactForm.querySelector('#message');
    const formFeedback = document.getElementById('formFeedback');

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showFieldError(input, message) {
      const err = document.getElementById(input.id + 'Error');
      if (err) err.textContent = message || '';
      input.classList.toggle('input-error', Boolean(message));
    }

    function validateName() {
      const val = nameInput.value.trim();
      if (!val) { showFieldError(nameInput, 'Please enter your name.'); return false; }
      if (val.length < 2) { showFieldError(nameInput, 'Please enter a longer name.'); return false; }
      showFieldError(nameInput, ''); return true;
    }

    function validateEmail() {
      const val = emailInput.value.trim();
      if (!val) { showFieldError(emailInput, 'Please enter your email.'); return false; }
      if (!emailRe.test(val)) { showFieldError(emailInput, 'Please enter a valid email address.'); return false; }
      showFieldError(emailInput, ''); return true;
    }

    function validateMessage() {
      const val = messageInput.value.trim();
      if (!val) { showFieldError(messageInput, 'Please enter a message.'); return false; }
      if (val.length < 6) { showFieldError(messageInput, 'Message is too short.'); return false; }
      showFieldError(messageInput, ''); return true;
    }

    // real-time feedback
    nameInput && nameInput.addEventListener('input', validateName);
    emailInput && emailInput.addEventListener('input', validateEmail);
    messageInput && messageInput.addEventListener('input', validateMessage);

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const okName = validateName();
      const okEmail = validateEmail();
      const okMsg = validateMessage();
      if (okName && okEmail && okMsg) {
        // Simulate success (replace with actual submission logic)
        if (formFeedback) { formFeedback.textContent = 'Message sent — thank you!'; }
        contactForm.reset();
        // clear errors
        [nameInput, emailInput, messageInput].forEach(i => i && showFieldError(i, ''));
      } else {
        // focus first invalid field
        const firstInvalid = [nameInput, emailInput, messageInput].find(i => i && i.classList.contains('input-error'));
        if (firstInvalid) firstInvalid.focus();
        if (formFeedback) { formFeedback.textContent = ''; }
      }
    });
  }

});
// script.js
// Implements an accessible hamburger toggle for the nav.

document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (!navToggle || !mainNav) return;

  // Ensure initial ARIA state
  navToggle.setAttribute('aria-expanded', 'false');
  mainNav.setAttribute('aria-hidden', 'true');

  function onKeyDown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      toggleMenu(false);
    }
  }

  function onClickOutside(e) {
    if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
      toggleMenu(false);
    }
  }

  // Toggle menu open/closed. If `force` is boolean, set to that state.
  window.toggleMenu = function toggleMenu(force) {
    const isForced = typeof force === 'boolean';
    const willOpen = isForced ? force : !(mainNav.classList.contains('is-open'));

    mainNav.classList.toggle('is-open', willOpen);
    navToggle.setAttribute('aria-expanded', String(willOpen));
    mainNav.setAttribute('aria-hidden', String(!willOpen));

    if (willOpen) {
      document.addEventListener('keydown', onKeyDown);
      // small delay so that the click that opened the menu doesn't immediately
      // count as an outside click
      setTimeout(() => document.addEventListener('click', onClickOutside), 0);
    } else {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClickOutside);
    }
  };

  navToggle.addEventListener('click', function () {
    toggleMenu();
  });

  // Optional: close menu on focusout if tabbing away
  mainNav.addEventListener('focusout', function (e) {
    // if focus moves outside the nav and toggle, close
    const next = e.relatedTarget;
    if (next && !mainNav.contains(next) && !navToggle.contains(next)) {
      toggleMenu(false);
    }
  });

  /* Smooth scrolling for nav links */
  const navLinks = mainNav.querySelectorAll('a[href^="#"]');
  function handleNavLinkClick(e) {
    const href = this.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    const targetId = href.slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return; // nothing to do

    e.preventDefault();
    // Close the menu (if open) so the scroll target is visible on small screens
    toggleMenu(false);

    // Use smooth scrolling; if the browser supports scrollIntoView with behavior, use it.
    // After scrolling, move focus for accessibility.
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Focus after a short delay to allow scroll to start (works well in practice)
    setTimeout(() => {
      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });
    }, 300);
  }

  navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));

  // If page loaded with a hash, smoothly scroll to it (deferred until DOM ready)
  if (location.hash) {
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      // small timeout so styles/layout settle
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }

  /* Filter projects function and wiring */
  const filterButtons = document.querySelectorAll('.filter-btn');
  function filterProjects(category) {
    const items = gallery ? Array.from(gallery.querySelectorAll('.gallery-item')) : [];
    if (category === 'all') {
      items.forEach(it => it.classList.remove('is-hidden'));
    } else {
      items.forEach(it => {
        const cat = it.getAttribute('data-category') || '';
        if (cat === category) it.classList.remove('is-hidden'); else it.classList.add('is-hidden');
      });
    }
    // update buttons active state
    filterButtons.forEach(btn => {
      const isActive = btn.dataset.filter === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  // expose globally for debugging or programmatic control
  window.filterProjects = filterProjects;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const cat = this.dataset.filter || 'all';
      filterProjects(cat);
    });
  });

  /* Lightbox modal for gallery images */

    /* Lightbox modal for gallery images */
    const gallery = document.querySelector('.gallery');
    const galleryItems = gallery ? Array.from(gallery.querySelectorAll('.gallery-item')) : [];

    // Create lightbox element if not present
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'lightbox';
      lightbox.className = 'lightbox';
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.innerHTML = `
        <div class="lightbox-content" role="dialog" aria-modal="true">
          <button class="lightbox-close" aria-label="Close">✕</button>
          <button class="lightbox-prev" aria-label="Previous">◀</button>
          <img class="lightbox-img" src="" alt="">
          <button class="lightbox-next" aria-label="Next">▶</button>
          <div class="lightbox-caption"></div>
        </div>`;
      document.body.appendChild(lightbox);
    }

    const lbImg = lightbox.querySelector('.lightbox-img');
    const lbCaption = lightbox.querySelector('.lightbox-caption');
    const lbClose = lightbox.querySelector('.lightbox-close');
    const lbPrev = lightbox.querySelector('.lightbox-prev');
    const lbNext = lightbox.querySelector('.lightbox-next');

    let currentIndex = -1;

    function openLightbox(index) {
      const item = galleryItems[index];
      if (!item) return;
      const href = item.getAttribute('href');
      const img = item.querySelector('img');
      const alt = img ? img.alt || '' : '';

      lbImg.src = href;
      lbImg.alt = alt;
      lbCaption.textContent = alt;

      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      currentIndex = index;

      // focus close button
      lbClose.focus();
      document.addEventListener('keydown', onLightboxKey);
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lbImg.src = '';
      currentIndex = -1;
      document.removeEventListener('keydown', onLightboxKey);
    }

    function showPrev() { if (currentIndex > 0) openLightbox(currentIndex - 1); }
    function showNext() { if (currentIndex < galleryItems.length - 1) openLightbox(currentIndex + 1); }

    function onLightboxKey(e) {
      if (e.key === 'Escape' || e.key === 'Esc') { closeLightbox(); }
      if (e.key === 'ArrowLeft') { showPrev(); }
      if (e.key === 'ArrowRight') { showNext(); }
    }

    // click handlers for gallery items
    galleryItems.forEach((a, i) => {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        openLightbox(i);
      });
    });

    // close on overlay click (but not when clicking controls or image)
    lightbox.addEventListener('click', function (ev) {
      if (ev.target === lightbox) closeLightbox();
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', showPrev);
    lbNext.addEventListener('click', showNext);

  });

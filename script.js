/* ============================================================
   ENGLISH PLUS — Main Script
   Works on all pages: index, team, faq, contact
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- DARK / LIGHT THEME TOGGLE --------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const iconSun     = document.getElementById('iconSun');
  const iconMoon    = document.getElementById('iconMoon');
  const html        = document.documentElement;

  const saved       = localStorage.getItem('ep-theme'); 
  const initDark    = saved === 'dark';

  function applyTheme(dark) {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (iconSun)  iconSun.style.display  = dark ? 'none' : '';
    if (iconMoon) iconMoon.style.display = dark ? ''     : 'none';
    if (themeToggle) themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem('ep-theme', dark ? 'dark' : 'light');
  }

  applyTheme(initDark);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(html.getAttribute('data-theme') !== 'dark');
    });
  }

  /* ---- STICKY NAVBAR SHADOW -------------------------------- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ---- MOBILE HAMBURGER ------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- SMOOTH SCROLL OFFSET -------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target || !navbar) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- TEACHER TABS ---------------------------------------- */
  const tabBtns      = document.querySelectorAll('.tab-btn');
  const teacherCards = document.querySelectorAll('.teacher-card');

  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabBtns.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });
        teacherCards.forEach(card => {
          const match = card.dataset.type === tab;
          card.classList.toggle('hidden', !match);
          if (match) {
            card.classList.remove('visible');
            requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('visible')));
          }
        });
      });
    });
  }

  /* ---- FAQ ACCORDION --------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      faqItems.forEach(other => {
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer')?.classList.remove('open');
      });
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.classList.toggle('open', !isOpen);
    });
  });

  /* ---- SCROLL REVEAL --------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---- FORM VALIDATION HELPERS ----------------------------- */
  function validateField(field) {
    const errorEl = field.parentElement.querySelector('.field-error');
    let msg = '';
    if (field.required && !field.value.trim()) {
      msg = 'This field is required.';
    } else if (field.type === 'email' && field.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) msg = 'Please enter a valid email address.';
    } else if (field.tagName === 'SELECT' && field.required && !field.value) {
      msg = 'Please select an option.';
    }
    if (errorEl) errorEl.textContent = msg;
    field.classList.toggle('error', !!msg);
    return !msg;
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => { if (!validateField(f)) valid = false; });
    return valid;
  }

  function wireForm(formId, successId, submitLabel) {
    const form    = document.getElementById(formId);
    const success = document.getElementById(successId);
    if (!form || !success) return;

    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => { if (field.classList.contains('error')) validateField(field); });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const btn = form.querySelector('[type="submit"]');
      btn.textContent = 'Sending\u2026';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        btn.textContent = submitLabel;
        btn.disabled = false;
        success.textContent = '\u2713 ' + (formId === 'careerForm'
          ? 'Application received! We\u2019ll review your details and be in touch soon.'
          : 'Thank you! Your inquiry has been submitted. Our team will contact you within 1 business day.');
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 8000);
      }, 1200);
    });
  }

  wireForm('contactForm', 'contactSuccess', 'Send Inquiry');
  wireForm('careerForm',  'careerSuccess',  'Submit Application');

  /* ---- ACTIVE NAV LINK (home page sections only) ----------- */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.navbar__links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`));
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(s => sectionObserver.observe(s));
  }

});

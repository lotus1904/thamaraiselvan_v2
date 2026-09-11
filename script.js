/* Progressive enhancement: all content remains available without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Wait only for the hero asset; lazy project banners never block entry.
  const loader = document.getElementById('page-loader');
  const introStarted = performance.now();
  let introFinished = false;
  let closeTimer;
  let introMaximum;
  const background = [...document.body.children].filter(el => el !== loader && el.tagName !== 'SCRIPT');
  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    clearTimeout(closeTimer);
    clearTimeout(introMaximum);
    clearTimeout(window.portfolioBootSafety);
    const hadFocus = loader.contains(document.activeElement);
    root.classList.remove('booting');
    background.forEach(el => { el.inert = false; el.removeAttribute('data-boot-inert'); });
    loader.hidden = true;
    if (hadFocus) {
      const main = document.getElementById('main');
      main.setAttribute('tabindex', '-1');
      main.focus({preventScroll: true});
    }
  }
  if (root.classList.contains('booting')) {
    background.forEach(el => { el.inert = true; el.setAttribute('data-boot-inert', ''); });
    document.getElementById('skip-loader').focus({preventScroll: true});
    document.getElementById('skip-loader').addEventListener('click', finishIntro);
    loader.addEventListener('keydown', event => {
      if (event.key === 'Escape') finishIntro();
      if (event.key === 'Tab') { event.preventDefault(); document.getElementById('skip-loader').focus(); }
    });
    const hero = document.querySelector('.portrait-wrap > img');
    function heroReady() {
      const minimum = reducedMotion.matches ? 0 : 1200;
      closeTimer = setTimeout(finishIntro, Math.max(0, minimum - (performance.now() - introStarted)));
    }
    introMaximum = setTimeout(finishIntro, 4500);
    if (!hero || hero.complete) heroReady();
    else { hero.addEventListener('load', heroReady, {once:true}); hero.addEventListener('error', heroReady, {once:true}); }
  } else loader.hidden = true;
  window.addEventListener('pageshow', event => { if (event.persisted) finishIntro(); });
  let paused = reducedMotion.matches;
  const motionButton = document.getElementById('motion-toggle');
  function setMotion(value) {
    paused = value;
    root.classList.toggle('motion-off', paused);
    motionButton.textContent = paused ? 'Enable motion' : 'Pause motion';
    motionButton.setAttribute('aria-pressed', String(paused));
  }
  setMotion(paused);
  motionButton.addEventListener('click', () => setMotion(!paused));
  reducedMotion.addEventListener('change', event => setMotion(event.matches));
  document.getElementById('year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    root.classList.add('js-motion');
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        reveal.unobserve(entry.target);
      }
    }), {threshold: 0.06});
    document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    let count = 0;
    projects.forEach(project => {
      project.hidden = category !== 'all' && project.dataset.category !== category;
      if (!project.hidden) { count++; project.classList.add('visible'); }
    });
    document.getElementById('filter-status').textContent = `${count} projects shown.`;
  }));

  const responses = {
    whoami: 'Thamaraiselvan M\nSoftware Engineer · 4+ years\nPython / Node.js / AI & ML\nCoimbatore, Tamil Nadu, India',
    impact: '₹11 crore+ in real fintech transactions.\nIndependent backend ownership.\nFrom payment webhooks to production support.',
    contact: 'Let’s build something useful.\nsanthoshtamil1918@gmail.com\n+91 6369600176'
  };
  const output = document.getElementById('terminal-output');
  let typingTimer;
  document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => {
    clearTimeout(typingTimer);
    const result = responses[button.dataset.command];
    // Announce a complete response once; animate an aria-hidden copy visually.
    output.replaceChildren();
    const accessible = document.createElement('span');
    accessible.className = 'sr-only'; accessible.textContent = result;
    const visual = document.createElement('span'); visual.setAttribute('aria-hidden', 'true');
    output.append(accessible, visual);
    if (paused) { visual.textContent = result; return; }
    let index = 0;
    function type() {
      visual.textContent = result.slice(0, ++index);
      if (index < result.length) typingTimer = setTimeout(type, 12);
    }
    type();
  }));

  const progress = document.querySelector('.scroll-progress');
  let scrollQueued = false;
  function updateProgress() {
    const range = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? window.scrollY / range : 0})`;
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, {passive:true});
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const cursor = document.querySelector('.cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let pointerX = 0, pointerY = 0, cursorQueued = false;
    window.addEventListener('pointermove', event => {
      if (paused) return;
      pointerX = event.clientX; pointerY = event.clientY;
      if (!cursorQueued) {
        cursorQueued = true;
        requestAnimationFrame(() => {
          cursor.style.transform = `translate(${pointerX}px, ${pointerY}px) translate(-50%, -50%)`;
          cursor.style.opacity = '1'; cursorQueued = false;
        });
      }
    }, {passive:true});
    document.addEventListener('pointerover', event => cursor.classList.toggle('engaged', !!event.target.closest('a, button, summary')));
    document.documentElement.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
  }
})();

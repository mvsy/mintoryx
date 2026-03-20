// ── Parallax Scroll Hero ───────────────────────
    (function initScrollHero() {
      const track  = document.getElementById('scroll-hero-track');
      const bg     = document.getElementById('scroll-hero-bg');
      const text   = document.getElementById('scroll-hero-text');
      if (!track || !bg) return;

      const SECTION_HEIGHT = 1500;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bg.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
        bg.style.backgroundSize = '100%';
        return;
      }

      // Parallax images
      const paxImgs = document.querySelectorAll('.pax-img');

      let trackTop = track.getBoundingClientRect().top + window.scrollY;

      function updateHero() {
        const scrollY = window.scrollY;
        const relY = scrollY - trackTop;

        // ── Clip-path: inset() is GPU-composited (faster than polygon) ──
        const clipP = Math.max(0, Math.min(1, relY / SECTION_HEIGHT));
        const inset = 25 * (1 - clipP);
        bg.style.clipPath = `inset(${inset}%)`;

        // ── Background size: 170% → 100% ──
        const bgP = Math.max(0, Math.min(1, relY / (SECTION_HEIGHT + 500)));
        bg.style.backgroundSize = `${170 - 70 * bgP}%`;

        // ── Opacity: fade out near end of section ──
        const fadeP = Math.max(0, Math.min(1, (relY - SECTION_HEIGHT) / 500));
        bg.style.opacity = 1 - fadeP;

        // ── Hero text: fade out as clip expands ──
        if (text) text.style.opacity = Math.max(0, 1 - clipP * 2.2);
      }

      function updateParallax() {
        const vh = window.innerHeight;
        paxImgs.forEach(img => {
          const start = parseFloat(img.dataset.start || 0);
          const end   = parseFloat(img.dataset.end   || 0);
          const rect  = img.getBoundingClientRect();
          const t = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
          const y = start + (end - start) * t;
          const fade = t > 0.75 ? (t - 0.75) / 0.25 : 0;
          img.style.transform = `translateY(${y}px) scale(${1 - 0.15 * fade})`;
          img.style.opacity   = 1 - fade;
        });
      }

      // rAF throttle: only run once per frame regardless of scroll frequency
      let rafPending = false;
      function onScroll() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          updateHero();
          updateParallax();
          rafPending = false;
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => {
        trackTop = track.getBoundingClientRect().top + window.scrollY;
        onScroll();
      }, { passive: true });
      onScroll();
    })();

    // ── Nav scroll + hero-mode ─────────────────────
    const nav = document.getElementById('nav');
    const onScroll = () => {
      const scrolled = window.scrollY > 20;
      nav.classList.toggle('scrolled', scrolled);
      nav.classList.toggle('hero-mode', !scrolled);
    };
    onScroll(); // set initial state
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Interactive Menu (imenu) ───────────────────
    (function initImenu() {
      const imenu = document.getElementById('imenu');
      if (!imenu) return;

      const items = Array.from(imenu.querySelectorAll('.imenu__item'));

      function setActive(el) {
        items.forEach(i => i.classList.remove('imenu__item--active'));
        if (el) el.classList.add('imenu__item--active');
      }

      // Click: set active immediately
      items.forEach(item => {
        item.addEventListener('click', () => setActive(item));
      });

      // Scroll: highlight item whose section is in view
      // "hero" item maps to scrollY ≈ 0 (handled via scroll event below)
      const sectionIds = items.map(i => i.dataset.section).filter(s => s && s !== 'hero');
      const sections   = sectionIds.map(id => document.getElementById(id));
      const homeItem   = items.find(i => i.dataset.section === 'hero');

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target);
            if (idx !== -1) setActive(items.find(i => i.dataset.section === sectionIds[idx]));
          }
        });
      }, { threshold: 0.3 });

      sections.forEach(s => { if (s) io.observe(s); });

      // Activate Home when near top
      window.addEventListener('scroll', () => {
        if (window.scrollY < 100 && homeItem) setActive(homeItem);
      }, { passive: true });
    })();

    // ── Projekt-Anfrage Modal ──────────────────────
    (function initModal() {
      const backdrop = document.getElementById('pmodal-backdrop');
      const openBtn  = document.getElementById('cta-btn');
      const closeBtn = document.getElementById('pmodal-close');
      const form     = document.getElementById('pmodal-form');
      if (!backdrop || !openBtn || !form) return;

      function openModal() {
        backdrop.hidden = false;
        document.body.style.overflow = 'hidden';
        backdrop.querySelector('input, textarea, button:not(.pmodal__close)').focus();
      }
      function closeModal() {
        backdrop.hidden = true;
        document.body.style.overflow = '';
      }

      openBtn.addEventListener('click', openModal);
      closeBtn.addEventListener('click', closeModal);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name     = document.getElementById('pf-name').value.trim() || '(nicht angegeben)';
        const email    = document.getElementById('pf-email').value.trim() || '(nicht angegeben)';
        const goal     = document.getElementById('pf-goal').value.trim() || '(nicht angegeben)';
        const existing = form.querySelector('input[name="existing"]:checked')?.value || '(nicht angegeben)';
        const timeline = form.querySelector('input[name="timeline"]:checked')?.value || '(nicht angegeben)';

        const body = [
          `Hallo Nick,`,
          ``,
          `hier ist meine Projektanfrage:`,
          ``,
          `Name:            ${name}`,
          `E-Mail:          ${email}`,
          `Bestehende Website: ${existing}`,
          `Ziel der Website: ${goal}`,
          `Zeitraum:        ${timeline}`,
          ``,
          `Ich freue mich auf deine Rückmeldung!`,
          ``,
          `Viele Grüsse`,
          name,
        ].join('\r\n');

        window.location.href =
          'mailto:nick.ramon.huber@gmail.com' +
          '?subject=' + encodeURIComponent('Projektanfrage von ' + name) +
          '&body='    + encodeURIComponent(body);

        closeModal();
      });
    })();

    // ── Arrow canvas (CTA section) ─────────────────
    (function initArrow() {
      const canvas  = document.getElementById('arrow-canvas');
      const target  = document.getElementById('cta-btn');
      const section = document.getElementById('kontakt');
      if (!canvas || !target || !section) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const ctx = canvas.getContext('2d');
      let mouse = { x: null, y: null };
      let sectionVisible = false;

      // Resize canvas to full viewport
      function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize, { passive: true });
      resize();

      // Track mouse globally
      window.addEventListener('mousemove', (e) => {
        mouse = { x: e.clientX, y: e.clientY };
      }, { passive: true });

      // Show/hide when CTA section enters viewport
      const io = new IntersectionObserver((entries) => {
        sectionVisible = entries[0].isIntersecting;
        canvas.classList.toggle('visible', sectionVisible);
      }, { threshold: 0.2 });
      io.observe(section);

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!sectionVisible || mouse.x === null) {
          requestAnimationFrame(draw);
          return;
        }

        const rect = target.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;

        // Angle from mouse → button center, stop at button edge
        const angle = Math.atan2(cy - mouse.y, cx - mouse.x);
        const ex = cx - Math.cos(angle) * (rect.width  / 2 + 14);
        const ey = cy - Math.sin(angle) * (rect.height / 2 + 14);

        // Curved control point
        const midX = (mouse.x + ex) / 2;
        const midY = (mouse.y + ey) / 2;
        const dist = Math.hypot(ex - mouse.x, ey - mouse.y);
        const t = Math.max(-1, Math.min(1, (mouse.y - ey) / 200));
        const cpX = midX;
        const cpY = midY + Math.min(180, dist * 0.45) * t;

        // Fade in as distance grows
        const minDist = Math.max(rect.width, rect.height) / 2;
        const opacity = Math.min(0.85, Math.max(0, (dist - minDist) / 300));

        ctx.strokeStyle = `rgba(255, 172, 0, ${opacity})`;
        ctx.lineWidth   = 1.8;

        // Dashed curve
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.quadraticCurveTo(cpX, cpY, ex, ey);
        ctx.setLineDash([8, 5]);
        ctx.stroke();
        ctx.restore();

        // Arrowhead
        const headAngle = Math.atan2(ey - cpY, ex - cpX);
        const hl = 11;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hl * Math.cos(headAngle - Math.PI / 6), ey - hl * Math.sin(headAngle - Math.PI / 6));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hl * Math.cos(headAngle + Math.PI / 6), ey - hl * Math.sin(headAngle + Math.PI / 6));
        ctx.setLineDash([]);
        ctx.stroke();

        requestAnimationFrame(draw);
      }
      draw();
    })();

    // ── Intersection Observer (reveal on scroll) ──
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));

    // ── Stats pull-up + count-up ──────────────────
    (function initStats() {
      const statItems = document.querySelectorAll('.stat-item');
      if (!statItems.length) return;

      function countUp(el) {
        const target  = parseInt(el.dataset.target, 10);
        const suffix  = el.dataset.suffix || '';
        const dur     = 900; // ms
        const start   = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / dur);
          const ease = 1 - Math.pow(1 - t, 3); // ease-out-cubic
          el.textContent = Math.round(ease * target) + suffix;
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const item = entry.target;
          item.classList.add('is-visible');
          item.querySelectorAll('.pullup-num').forEach(countUp);
          io.unobserve(item);
        });
      }, { threshold: 0.5, rootMargin: '0px 0px -80px 0px' });

      statItems.forEach(el => io.observe(el));
    })();

    // ── Reduce motion ─────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveals.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'none';
        el.classList.add('visible');
      });
    }

    // ── Skills Orbit Animation ─────────────────────
    (function initOrbit() {
      const stage     = document.getElementById('orbit-stage');
      const pauseZone = document.getElementById('orbit-pause-zone');
      if (!stage || !pauseZone) return;

      // Inner radius: 120px, Outer radius: 220px (in a 520×520 stage)
      const TWO_PI = Math.PI * 2;
      const skills = [
        { id: 'sk-html',     r: 120, phase: 0,                 speed:  0.45 },
        { id: 'sk-css',      r: 120, phase: TWO_PI / 3,       speed:  0.45 },
        { id: 'sk-js',       r: 120, phase: TWO_PI * 2 / 3,   speed:  0.45 },
        { id: 'sk-react',    r: 220, phase: 0,                 speed: -0.28 },
        { id: 'sk-node',     r: 220, phase: TWO_PI / 7,       speed: -0.28 },
        { id: 'sk-tailwind', r: 220, phase: TWO_PI * 2 / 7,   speed: -0.28 },
        { id: 'sk-docker',   r: 220, phase: TWO_PI * 3 / 7,   speed: -0.28 },
        { id: 'sk-shell',    r: 220, phase: TWO_PI * 4 / 7,   speed: -0.28 },
        { id: 'sk-apache',   r: 220, phase: TWO_PI * 5 / 7,   speed: -0.28 },
        { id: 'sk-python',   r: 220, phase: TWO_PI * 6 / 7,   speed: -0.28 },
      ].map(s => ({ ...s, el: document.getElementById(s.id) }))
       .filter(s => s.el !== null);

      let time      = 0;
      let lastTs    = performance.now();
      let hovered   = false;
      let speedMult = 1; // 1 = full speed, 0 = stopped
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // If reduced motion: place skills at initial positions and stop
      if (reduced) {
        skills.forEach(({ el, r, phase }) => {
          const x = Math.cos(phase) * r;
          const y = Math.sin(phase) * r;
          el.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
        });
        return;
      }

      pauseZone.addEventListener('mouseenter', () => { hovered = true; });
      pauseZone.addEventListener('mouseleave', () => { hovered = false; });

      function tick(now) {
        const dt = (now - lastTs) / 1000;
        lastTs = now;

        // Smoothly ease speedMult toward target (0 when hovered, 1 otherwise)
        const target = hovered ? 0 : 1;
        speedMult += (target - speedMult) * Math.min(1, dt * 2);

        time += dt * speedMult;

        skills.forEach(({ el, r, phase, speed }) => {
          const angle = time * speed + phase;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          el.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
        });

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    })();

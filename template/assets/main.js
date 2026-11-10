/* Portfolio CNS&AI — interactions */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1. Fade-in khi vào trang + fade-out khi chuyển trang nội bộ */
  requestAnimationFrame(() => document.body.classList.add('loaded'));
  window.addEventListener('pageshow', () => document.body.classList.remove('leaving'));
  $$('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || a.target === '_blank' || /^https?:/.test(href)) return;
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduce) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(() => { window.location.href = a.href; }, 230);
    });
  });

  /* 2. Progress bar, nav đổi style, nút back-to-top */
  const prog = $('#progress'), nav = $('#nav'), btt = $('#btt');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = scrollY;
    if (prog) prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    nav && nav.classList.toggle('scrolled', y > 20);
    btt && btt.classList.toggle('show', y > 400);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btt && btt.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* 3. Hamburger menu */
  const ham = $('#hamburger'), links = $('#navLinks');
  ham && ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    links.classList.toggle('open');
  });

  /* 4. Counter */
  const runCounter = el => {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    el.textContent = (0).toFixed(dec);
    const dur = 1600, t0 = performance.now();
    const tick = t => {
      const k = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - k, 4);
      el.textContent = (target * eased).toFixed(dec);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* 5. Scroll reveal (IntersectionObserver) */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      $$('[data-count]', el).forEach(runCounter);
      if (el.matches('[data-count]')) runCounter(el);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .ring, [data-count]').forEach(el => io.observe(el));

  /* 6. Typing effect cho bio */
  const typed = $('.typed');
  if (typed && !reduce) {
    const text = typed.dataset.text;
    typed.textContent = '';
    let i = 0;
    const type = () => {
      typed.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(type, 28 + Math.random() * 40);
    };
    setTimeout(type, 700);
  }

  if (reduce || !finePointer) return;

  /* 7. Spotlight theo chuột */
  const root = document.documentElement;
  addEventListener('pointermove', e => {
    root.style.setProperty('--sx', e.clientX + 'px');
    root.style.setProperty('--sy', e.clientY + 'px');
  }, { passive: true });

  /* 8. Viền sáng + nghiêng 3D cho thẻ */
  $$('.glass').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  $$('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* 9. Nút "nam châm" */
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });

  /* 10. Parallax nhẹ cho orb ở hero */
  const orb = $('.hero-visual');
  orb && addEventListener('pointermove', e => {
    const x = (e.clientX / innerWidth - 0.5) * 24;
    const y = (e.clientY / innerHeight - 0.5) * 24;
    orb.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });
})();

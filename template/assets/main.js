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

  /* 11. Nốt nhạc bay lên ở nền */
  const NOTES = ['♪', '♫', '♬', '♩', '𝄞'];
  const COLORS = ['#db5375', '#ec9192', '#729ea1', '#b5bd89', '#d9a66f'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const layer = $('.notes-layer');
  const spawnNote = () => {
    if (!layer || document.hidden) return;
    const n = document.createElement('span');
    n.className = 'fnote';
    n.textContent = pick(NOTES);
    const size = 16 + Math.random() * 30;
    n.style.left = (Math.random() * 100) + 'vw';
    n.style.fontSize = size + 'px';
    n.style.setProperty('--c', pick(COLORS));
    n.style.setProperty('--dur', (11 + Math.random() * 9) + 's');
    n.style.setProperty('--dx', ((Math.random() - 0.5) * 160) + 'px');
    n.style.setProperty('--rot', ((Math.random() - 0.5) * 60) + 'deg');
    n.style.setProperty('--op', (0.25 + Math.random() * 0.35).toFixed(2));
    layer.appendChild(n);
    n.addEventListener('animationend', () => n.remove());
  };
  if (!reduce) {
    for (let i = 0; i < 6; i++) setTimeout(spawnNote, i * 600);
    setInterval(spawnNote, innerWidth < 760 ? 1800 : 1100);
  }

  /* 12. Click / chạm → bung nốt nhạc */
  if (!reduce) {
    addEventListener('pointerdown', e => {
      for (let i = 0; i < 6; i++) {
        const b = document.createElement('span');
        b.className = 'burst';
        b.textContent = pick(NOTES.slice(0, 4));
        const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.6;
        const dist = 40 + Math.random() * 40;
        b.style.left = e.clientX + 'px';
        b.style.top = e.clientY + 'px';
        b.style.fontSize = (14 + Math.random() * 12) + 'px';
        b.style.setProperty('--c', pick(COLORS));
        b.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
        b.style.setProperty('--by', Math.sin(ang) * dist - 20 + 'px');
        b.style.setProperty('--br', ((Math.random() - 0.5) * 90) + 'deg');
        document.body.appendChild(b);
        b.addEventListener('animationend', () => b.remove());
      }
    }, { passive: true });
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

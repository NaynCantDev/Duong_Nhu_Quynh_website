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
      setTimeout(() => { window.location.href = a.href; }, a.dataset.chord && window.__soundOn && window.__soundOn() ? 520 : 230);
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

  /* 13. Lightbox cho ảnh minh họa */
  const lb = $('#lightbox');
  if (lb) {
    const btns = $$('.shot-img');
    const img = $('img', lb), cap = $('figcaption', lb);
    let cur = 0;
    const show = i => {
      cur = (i + btns.length) % btns.length;
      img.src = btns[cur].dataset.full;
      cap.textContent = btns[cur].dataset.cap;
    };
    const open = i => { show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
    const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
    btns.forEach((b, i) => b.addEventListener('click', () => open(i)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
    $('.lb-next', lb).addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
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

  /* 14. ÂM THANH (Web Audio API) — mặc định tắt, chỉ phát khi người xem tương tác */
  const SK = 'qsound';
  let soundOn = false;
  try { soundOn = localStorage.getItem(SK) === '1'; } catch (_) {}
  window.__soundOn = () => soundOn;
  let ctx = null, master = null;
  const audio = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.32;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  // Mở khóa AudioContext ở lần tương tác đầu tiên (trình duyệt bắt buộc)
  const unlock = () => { if (soundOn) audio(); };
  addEventListener('pointerdown', unlock, { once: true, passive: true });
  addEventListener('keydown', unlock, { once: true });

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);          // MIDI → tần số
  // Tiếng "hộp nhạc": sóng sine + bội âm, tắt dần
  const tone = (midi, when = 0, dur = 0.9, vol = 0.5, dest) => {
    const c = audio(); if (!c) return;
    const t = c.currentTime + when;
    [[1, 1], [2, 0.28], [4, 0.08]].forEach(([mul, amp]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = mul === 1 ? 'triangle' : 'sine';
      o.frequency.value = hz(midi) * mul;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol * amp, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / mul);
      o.connect(g); g.connect(dest || master);
      o.start(t); o.stop(t + dur + 0.05);
    });
  };

  const sndBtn = $('#snd'), toastEl = $('#toast');
  let toastT;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };
  const setSound = (on, quiet) => {
    soundOn = on;
    try { localStorage.setItem(SK, on ? '1' : '0'); } catch (_) {}
    if (sndBtn) { sndBtn.classList.toggle('on', on); sndBtn.setAttribute('aria-pressed', on); }
    if (on) audio();
    if (!on) stopTune();
    if (!quiet) toast(on ? '🔊 Đã bật âm thanh' : '🔇 Đã tắt âm thanh');
  };
  sndBtn && sndBtn.addEventListener('click', () => { setSound(!soundOn); if (soundOn) tone(72, 0, 0.6); });

  /* 15. Đĩa than phát nhạc: bấm → cần đĩa hạ xuống, đĩa quay nhanh, phát giai điệu */
  // Giai điệu public domain: [midi, phách]; 0 = lặng
  const TUNES = [
    { name: 'Ode to Joy — Beethoven', bpm: 150, n: [[64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[64,1.5],[62,.5],[62,2],
      [64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[62,1.5],[60,.5],[60,2]] },
    { name: 'Twinkle Twinkle Little Star', bpm: 132, n: [[60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2],[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2],
      [67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2],[67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2]] },
    { name: 'Canon in D — Pachelbel', bpm: 96, n: [[78,1],[76,1],[74,1],[73,1],[71,1],[69,1],[71,1],[73,1],[74,1],[73,1],[71,1],[69,1],[67,1],[66,1],[67,1],[64,1],[66,2],[0,1],[62,1],[66,2]] }
  ];
  const BASS = { 60: 48, 62: 43, 64: 45, 65: 41, 67: 43, 69: 45, 71: 43, 73: 45, 74: 50, 76: 45, 78: 50, 66: 50 };
  const player = $('#player'), hint = $('#playHint'), heroVis = $('.hero-visual');
  let tuneIdx = 0, tuneTimers = [], playing = false, bus = null;
  function stopTune() {
    tuneTimers.forEach(clearTimeout); tuneTimers = [];
    if (bus && ctx) { const b = bus; b.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05); setTimeout(() => b.disconnect(), 300); bus = null; }
    playing = false;
    heroVis && heroVis.classList.remove('playing');
    if (hint) hint.textContent = '▶ Bấm đĩa để nghe';
  }
  const playTune = () => {
    if (!soundOn) setSound(true, true);
    const c = audio(); if (!c) return;
    const tune = TUNES[tuneIdx % TUNES.length]; tuneIdx++;
    bus = c.createGain(); bus.connect(master);
    playing = true; heroVis && heroVis.classList.add('playing');
    if (hint) hint.textContent = '⏸ ' + tune.name;
    const beat = 60 / tune.bpm; let t = 0.35;               // chờ cần đĩa hạ xuống
    tune.n.forEach(([m, b], i) => {
      if (m) {
        tone(m, t, Math.max(0.5, b * beat * 1.6), 0.5, bus);
        if (i % 2 === 0 && BASS[m]) tone(BASS[m], t, b * beat * 2, 0.22, bus);
        tuneTimers.push(setTimeout(() => player && burstAt(player, 1), t * 1000));
      }
      t += b * beat;
    });
    tuneTimers.push(setTimeout(stopTune, (t + 0.6) * 1000));
  };
  if (player) {
    const toggle = () => playing ? stopTune() : playTune();
    player.addEventListener('click', toggle);
    player.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }
  // Nốt nhạc bay ra từ một phần tử
  function burstAt(el, count = 5, big) {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const b = document.createElement('span');
      b.className = 'burst';
      b.textContent = pick(NOTES);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const dist = (big ? 120 : 60) + Math.random() * 60;
      b.style.left = (r.left + r.width * (0.3 + Math.random() * 0.4)) + 'px';
      b.style.top = (r.top + r.height * 0.3) + 'px';
      b.style.fontSize = (16 + Math.random() * (big ? 24 : 12)) + 'px';
      b.style.setProperty('--c', pick(COLORS));
      b.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
      b.style.setProperty('--by', Math.sin(ang) * dist + 'px');
      b.style.setProperty('--br', ((Math.random() - 0.5) * 90) + 'deg');
      document.body.appendChild(b);
      b.addEventListener('animationend', () => b.remove());
    }
  }

  /* 16. Menu như phím đàn: rê chuột qua từng mục → Đô Rê Mi Fa Son La Si Đô */
  const SCALE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
  const navItems = $$('.nav-links > li > a');
  const subItems = $$('.sub-menu a');
  const keyNote = (el, m) => el.addEventListener('pointerenter', e => {
    if (!soundOn || !ctx || e.pointerType === 'touch') return;
    tone(m, 0, 0.7, 0.35);
    el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping');
  });
  navItems.forEach((a, i) => keyNote(a, SCALE[i * 2]));          // Đô – Mi – Son
  subItems.forEach((a, i) => keyNote(a, SCALE[i % SCALE.length] + 12));

  /* 17. Mỗi bài một hợp âm: C – Am – F – G – Em – C, kết bằng hợp âm C lớn */
  const CHORDS = { C: [60, 64, 67, 72], Am: [57, 60, 64, 69], F: [53, 57, 60, 65], G: [55, 59, 62, 67], Em: [52, 55, 59, 64],
    END: [48, 55, 60, 64, 67, 72, 76] };
  const strum = (name, vol = 0.4) => {
    const ns = CHORDS[name]; if (!ns || !audio()) return;
    ns.forEach((m, i) => tone(m, i * 0.055, 1.6, vol));
  };
  $$('[data-chord]').forEach(el => {
    const name = el.dataset.chord;
    if (el.tagName === 'BUTTON') {                              // chip hợp âm: bấm để nghe
      el.addEventListener('click', () => { if (!soundOn) setSound(true, true); strum(name, 0.45); burstAt(el, 4); });
    } else {                                                    // nút chuyển bài: rê để nghe thử, bấm để nghe trọn
      el.addEventListener('pointerenter', e => { if (soundOn && ctx && e.pointerType !== 'touch') strum(name, 0.22); });
      el.addEventListener('click', () => { if (soundOn) strum(name, 0.42); });
    }
  });

  /* 18. Easter egg: gõ d-o-r-e-m-i (hoặc chạm 𝄞 ở chân trang 3 lần) */
  const SECRET = ['KeyD', 'KeyO', 'KeyR', 'KeyE', 'KeyM', 'KeyI'];
  let buf = [];
  const celebrate = () => {
    if (!soundOn) setSound(true, true);
    [60, 62, 64, 65, 67, 69, 71, 72].forEach((m, i) => tone(m, i * 0.09, 0.6, 0.42));
    setTimeout(() => strum('END', 0.42), 800);
    toast('🎉 Đồ Rê Mí! Bạn đã tìm ra bí mật của ' + (document.querySelector('.nav-brand span:last-child') || {}).textContent);
    if (reduce) return;
    document.body.classList.add('party');
    setTimeout(() => document.body.classList.remove('party'), 2600);
    for (let i = 0; i < 46; i++) setTimeout(() => {
      const n = document.createElement('span');
      n.className = 'rain-note';
      n.textContent = pick(NOTES);
      n.style.left = Math.random() * 100 + 'vw';
      n.style.fontSize = (20 + Math.random() * 30) + 'px';
      n.style.color = pick(COLORS);
      n.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      document.body.appendChild(n);
      n.addEventListener('animationend', () => n.remove());
    }, i * 40);
  };
  addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
    if (!/^Key[A-Z]$/.test(e.code)) return;                     // bỏ qua phím do bộ gõ tiếng Việt chèn vào
    buf.push(e.code); buf = buf.slice(-SECRET.length);
    if (buf.join() === SECRET.join()) { buf = []; celebrate(); }
  });
  const clef = $('.staff-divider span');
  if (clef) {
    let taps = 0, tapT;
    clef.style.cursor = 'pointer';
    clef.addEventListener('click', () => {
      taps++; clearTimeout(tapT); tapT = setTimeout(() => taps = 0, 900);
      if (soundOn && ctx) tone([67, 71, 74][Math.min(taps, 3) - 1] || 74, 0, 0.5, 0.35);
      if (taps >= 3) { taps = 0; celebrate(); }
    });
  }
  setSound(soundOn, true);
})();

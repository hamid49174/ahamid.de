/* ahamid.de – Interaktion & Effekte. Kein Framework, keine externen Requests. */
(function () {
  'use strict';

  /* Signal fuer CSS: JS laeuft, Reveal-Elemente duerfen zunaechst versteckt sein */
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Navigation: Scroll-Zustand, Burger, aktive Sektion ---------- */
  var nav = $('.nav');
  var burger = $('#burger');
  var menu = $('#menu');

  function onScrollNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var sections = $$('main section[id]');
  var menuLinks = $$('.menu a[href^="#"]');
  if (sections.length && menuLinks.length && 'IntersectionObserver' in window) {
    var active = null;
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) active = e.target.id;
      });
      menuLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + active);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- Scroll-Fortschritt ---------- */
  var bar = $('.progress span');
  function onProgress() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
  }
  window.addEventListener('scroll', onProgress, { passive: true });
  window.addEventListener('resize', onProgress);
  onProgress();

  /* ---------- Reveal beim Scrollen ---------- */
  var reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- Typewriter im Hero ---------- */
  var typeEl = $('#type');
  if (typeEl) {
    var words = (typeEl.getAttribute('data-words') || '').split('|').filter(Boolean);
    if (reduceMotion || words.length < 2) {
      typeEl.textContent = words[0] || typeEl.textContent;
    } else {
      var wi = 0, ci = words[0].length, deleting = false, hold = 1400;
      var tick = function () {
        var w = words[wi];
        if (!deleting) {
          ci++;
          typeEl.textContent = w.slice(0, ci);
          if (ci >= w.length) { deleting = true; setTimeout(tick, hold); return; }
          setTimeout(tick, 70 + Math.random() * 50);
        } else {
          ci--;
          typeEl.textContent = w.slice(0, ci);
          if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 350); return; }
          setTimeout(tick, 32);
        }
      };
      setTimeout(function () { deleting = true; tick(); }, hold + 600);
    }
  }

  /* ---------- Zähler ---------- */
  var nums = $$('.num[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target.toLocaleString('de-DE') + suffix; return; }
    var start = null, dur = 1600;
    var step = function (ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString('de-DE') + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (nums.length) {
    if ('IntersectionObserver' in window) {
      var numObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounter(e.target); numObs.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      nums.forEach(function (n) { numObs.observe(n); });
    } else {
      nums.forEach(runCounter);
    }
  }

  /* ---------- Timeline-Linie wächst mit dem Scrollen ---------- */
  var timeline = $('#timeline');
  function onTimeline() {
    if (!timeline || reduceMotion) return;
    var r = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    var progress = (vh * 0.75 - r.top) / r.height;
    timeline.style.setProperty('--tl', (Math.min(1, Math.max(0, progress)) * 100).toFixed(1) + '%');
  }
  window.addEventListener('scroll', onTimeline, { passive: true });
  window.addEventListener('resize', onTimeline);
  onTimeline();

  /* ---------- 3D-Tilt + Spotlight auf Karten ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach(function (card) {
      var strength = card.classList.contains('portrait') ? 10 : 6;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * strength).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * strength).toFixed(2) + 'deg) translateY(-4px)';
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });

    /* Magnetische Buttons */
    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Custom Cursor ---------- */
  var cursor = $('.cursor');
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add('no-cursor');
    var cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    var hoverTargets = 'a, button, [data-tilt], .tags li';
    document.addEventListener('pointerover', function (e) {
      cursor.classList.toggle('is-hover', !!(e.target.closest && e.target.closest(hoverTargets)));
    });
    document.addEventListener('pointerleave', function () { cursor.style.opacity = '0'; });
    document.addEventListener('pointerenter', function () { cursor.style.opacity = '1'; });
    (function loop() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cursor.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Partikelnetz im Hintergrund ---------- */
  var canvas = $('#net');
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W, H, pts = [], mouse = { x: -9999, y: -9999 }, dpr = Math.min(2, window.devicePixelRatio || 1);
    var COUNT = window.innerWidth < 700 ? 38 : 80;
    var LINK = 140;

    function resize() {
      W = canvas.width = Math.floor(window.innerWidth * dpr);
      H = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    function seed() {
      pts = [];
      for (var i = 0; i < COUNT; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
          r: (0.8 + Math.random() * 1.6) * dpr
        });
      }
    }
    resize(); seed();
    window.addEventListener('resize', function () { resize(); seed(); });
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });

    var hidden = false;
    document.addEventListener('visibilitychange', function () { hidden = document.hidden; });

    function frame() {
      requestAnimationFrame(frame);
      if (hidden) return;
      ctx.clearRect(0, 0, W, H);
      var link = LINK * dpr;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        /* sanfte Anziehung zur Maus */
        var dxm = mouse.x - p.x, dym = mouse.y - p.y, dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 220 * dpr && dm > 0) { p.x += dxm / dm * 0.35 * dpr; p.y += dym / dm * 0.35 * dpr; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 180, 255, 0.75)';
        ctx.fill();

        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < link * link) {
            var a = 1 - Math.sqrt(d2) / link;
            ctx.strokeStyle = 'rgba(77, 159, 255,' + (a * 0.35).toFixed(3) + ')';
            ctx.lineWidth = dpr * 0.8;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
    }
    frame();
  }

  /* ---------- E-Mail kopieren + Toast ---------- */
  var toast = $('#toast'), toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }
  var copyBtn = $('#copyMail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var mail = copyBtn.getAttribute('data-mail') || '';
      var done = function () { showToast('E-Mail-Adresse kopiert: ' + mail); };
      var fail = function () { showToast(mail); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail).then(done, fail);
      } else {
        fail();
      }
    });
  }

  /* ---------- Parallax auf Hero-Chips ---------- */
  if (finePointer && !reduceMotion) {
    var floats = $$('.hero .float');
    var hero = $('.hero');
    if (hero && floats.length) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        floats.forEach(function (f, i) {
          var depth = 10 + (i % 3) * 8;
          f.style.translate = (nx * depth).toFixed(1) + 'px ' + (ny * depth).toFixed(1) + 'px';
        });
      });
      hero.addEventListener('pointerleave', function () { floats.forEach(function (f) { f.style.translate = ''; }); });
    }
  }
})();

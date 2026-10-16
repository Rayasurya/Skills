/* =============================================================================
   swipe-story · story.js: the page controller.

   Runs on top of stage.js. It owns:
   - stops: one wheel gesture moves to the next stop; stops are screenfuls of
     content, centred under the bar, plus every stop a scene declares;
   - scenes: per-section code that reads its act's progress and plays changes
     on a clock (Story.tl), never scrubbed by scroll;
   - rails: card rows that move sideways one card per swipe;
   - the chapter bar and index sheet, the lightbox, "+" tiles, looping
     recordings, arrival diagrams, the "keep scrolling" nudge;
   - reduced motion: no pinning, every scene shows its final state.

   Load order: lenis.min.js, stage.js, story.js, then your scenes file, which
   registers scenes and stops and ends with Story.start().
   ========================================================================== */
(function () {
  'use strict';

  var S = window.Story = {};
  var docEl = document.documentElement;
  var BAR = 52; // height of the chapter bar on a desktop

  S.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  S.fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  S.small = function () { return innerWidth <= 860; };
  S.robot = !!navigator.webdriver;

  // ---------------------------------------------------------------- maths --
  S.clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
  S.seg = function (p, a, b) { return S.clamp((p - a) / Math.max(b - a, 1e-6)); };
  S.eio = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  S.eout = function (t) { return 1 - Math.pow(1 - t, 3); };
  S.lerp = function (a, b, t) { return a + (b - a) * t; };

  // Timed stages: scroll picks the stage, the change plays on a clock.
  // st.v moves toward the whole-number stage `target` at one stage per
  // secs (or secs[k]) seconds; going back runs at `back` times that.
  // Start a scene with st = { v: 0 }. Returns st.v; keep animating while
  // it differs from the target.
  S.tl = function (st, target, time, secs, back) {
    if (st.v === undefined || S.reduce) { st.v = target; st.t = time; return target; }
    var dt = st.t ? Math.min(0.05, Math.max(0, (time - st.t) / 1000)) : 0; st.t = time;
    var v = st.v; if (v === target) return v;
    var dir = target > v ? 1 : -1, k = dir > 0 ? Math.floor(v + 1e-6) : Math.ceil(v - 1e-6) - 1;
    var d = typeof secs === 'number' ? secs : secs[Math.max(0, Math.min(secs.length - 1, k))];
    v += dir * dt / (d * (dir < 0 ? (back || 0.4) : 1));
    if (dir > 0 ? v > target : v < target) v = target;
    return (st.v = v);
  };
  // The stage a pinned act's progress points at, for n evenly spaced stops.
  S.stageOf = function (p, n) { return Math.round(S.clamp(p) * (n - 1)); };
  // Show the [data-st="k"] child of a .swap box.
  S.swapTo = function (box, k) { if (!box) return; [].forEach.call(box.children, function (e) { if (e.hasAttribute('data-st')) e.classList.toggle('on', +e.getAttribute('data-st') === k); }); };
  // True once an element's top is above fraction f of the screen.
  S.arrived = function (el, f) { return el.getBoundingClientRect().top < innerHeight * (f === undefined ? 0.3 : f); };
  // Named timeouts that replace each other, for sequences on a clock.
  var T = {};
  S.after = function (k, fn, ms) { clearTimeout(T[k]); T[k] = setTimeout(fn, ms); };
  S.cancel = function (k) { clearTimeout(T[k]); };

  // ------------------------------------------------------------- registry --
  var builders = [], scenes = [], stopProviders = [];
  S.build = function (fn) { builders.push(fn); };
  S.scene = function (id, def) { scenes.push({ id: id, def: def }); };
  S.stops = function (fn) { stopProviders.push(fn); };
  S.actOf = function (el) { for (var i = 0; i < S.engine.acts.length; i++) if (S.engine.acts[i].el === el) return S.engine.acts[i]; return null; };
  // Scroll positions for fractions of a pinned act's travel.
  S.actY = function (el, fs) { var a = S.actOf(el); if (!a) return []; var tr = Math.max(a.height - innerHeight, 0); return fs.map(function (f) { return a.top + tr * f; }); };
  S.scrollToY = function (y, dur) { if (S.lenis) S.lenis.scrollTo(y, { duration: dur || 1.1, force: true }); else scrollTo({ top: y, behavior: S.reduce ? 'auto' : 'smooth' }); };
  S.scrollToAct = function (el, f) { var y = S.actY(el, [f])[0]; if (y !== undefined) S.scrollToY(y + 2); };

  // ---------------------------------------------------------------- start --
  S.start = function () {
    builders.forEach(function (fn) { try { fn(); } catch (e) { console.error('[story] build', e); } });

    if (S.reduce) {
      // No pinning under reduced motion: every act becomes a plain section.
      docEl.classList.add('rm');
      document.querySelectorAll('[data-act]').forEach(function (el) { el.setAttribute('data-act', 'flow'); el.removeAttribute('data-span'); });
    }
    S.engine = Stage.mount(document.body);

    // Smooth, stepped scrolling for a mouse or trackpad. Touch keeps native
    // momentum; automation keeps native scroll so screenshots land exactly.
    if (window.Lenis && S.fine && !S.reduce && !S.robot) {
      S.lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1, virtualScroll: stepWheel });
      var raf = function (t) { S.lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    S.markDirty = function (id) { scenes.forEach(function (s) { if (s.id === id) s.dirty = true; }); };
    scenes.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (!el) { console.warn('[story] no element #' + s.id); return; }
      s.el = el; s.act = S.actOf(el);
      try { s.def.init && s.def.init(el, s.act); } catch (e) { console.error('[story] init ' + s.id, e); s.dead = true; }
    });

    initIndex(); initLightbox(); initAnchors(); initNudge(); initMore(); initRecordings(); initArrive();
    buildStops(); initStepKeys();

    var lastY = -1;
    function loop(t) {
      S.engine.update();
      var y = scrollY, moved = y !== lastY; lastY = y;
      for (var i = 0; i < scenes.length; i++) {
        var s = scenes[i];
        if (s.dead || !s.el || S.reduce) continue;
        var live = s.act ? s.act.live : near(s.el);
        if (!live) { s.wasLive = false; continue; }
        var p = s.act ? s.act.p : 0;
        if ((s.act ? p !== s.lastP : moved) || s.anim || !s.wasLive || s.dirty) {
          s.dirty = false; s.lastP = p;
          try { s.anim = !!s.def.update(p, t, s); } catch (e) { console.error('[story] update ' + s.id, e); s.dead = true; }
        }
        s.wasLive = true;
      }
      if (moved) trackIndex();
      if (darkCheck > 0) { darkCheck--; checkDark(); }
      requestAnimationFrame(loop);
    }
    if (S.reduce) scenes.forEach(function (s) { if (!s.dead && s.el && s.def.still) { try { s.def.still(s.el, s); } catch (e) { console.error('[story] still ' + s.id, e); } } });
    requestAnimationFrame(loop);

    // Anything that changes the page height re-measures acts, smooth scroll
    // and stops: a resize, fonts arriving, a "+" tile opening, a late image.
    var rt = 0;
    S.relayout = function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        S.engine.layout(); if (S.lenis) S.lenis.resize();
        setTimeout(buildStops, 60);
        scenes.forEach(function (s) { if (s.def.resize && !s.dead && s.el) { try { s.def.resize(s.el, s); } catch (e) { console.error(e); } } s.dirty = true; });
      }, 120);
    };
    addEventListener('resize', S.relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(S.relayout);
    document.addEventListener('load', function (e) { if (e.target && e.target.tagName === 'IMG') S.relayout(); }, true);
  };
  function near(el) { var r = el.getBoundingClientRect(); return r.bottom > -innerHeight * 0.6 && r.top < innerHeight * 1.6; }

  // ------------------------------------------------- chapter bar and index --
  // Chapters are elements with data-chapter="01" and data-chapter-title.
  var entries = [], readSet = {}, current = -1;
  function initIndex() {
    var list = document.getElementById('sheetList');
    document.querySelectorAll('[data-chapter]').forEach(function (el) { entries.push({ el: el, n: el.getAttribute('data-chapter'), t: el.getAttribute('data-chapter-title') }); });
    if (!entries.length || !list) return;
    list.innerHTML = entries.map(function (e, i) { return '<li><a href="#' + e.el.id + '" data-i="' + i + '"><span class="n">' + e.n + '</span><span>' + e.t + '</span><span class="st" aria-hidden="true"></span></a></li>'; }).join('');
    var btn = document.getElementById('folioBtn'), sheet = document.getElementById('sheet');
    function setSheet(open) {
      sheet.classList.toggle('open', open); sheet.setAttribute('aria-hidden', open ? 'false' : 'true'); sheet.inert = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (S.lenis) open ? S.lenis.stop() : S.lenis.start();
      if (open) { var a = list.querySelector('a.on') || list.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
    }
    btn.addEventListener('click', function () { setSheet(!sheet.classList.contains('open')); });
    sheet.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close') || e.target.closest('a')) setSheet(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('open')) { setSheet(false); btn.focus(); } });
    trackIndex();
  }
  function trackIndex() {
    if (!entries.length) return;
    var vh = innerHeight, cur = 0;
    for (var i = 0; i < entries.length; i++) {
      var r = entries[i].el.getBoundingClientRect();
      if (r.top <= vh * 0.45) cur = i;
      if (r.bottom < vh * 0.5) readSet[i] = true;
    }
    if (entries[entries.length - 1].el.getBoundingClientRect().top <= vh * 0.3) readSet[entries.length - 1] = true;
    var read = Object.keys(readSet).length;
    var links = document.querySelectorAll('#sheetList a');
    if (cur !== current) {
      current = cur;
      links.forEach(function (a) { var on = +a.getAttribute('data-i') === cur; a.classList.toggle('on', on); a.toggleAttribute('aria-current', on); });
      var now = document.getElementById('folioNow'); if (now) now.innerHTML = '<b>' + entries[cur].n + '</b>' + entries[cur].t;
    }
    links.forEach(function (a) { a.classList.toggle('read', !!readSet[+a.getAttribute('data-i')]); });
    var meter = document.getElementById('sheetMeter'); if (meter) meter.style.transform = 'scaleX(' + (read / entries.length).toFixed(3) + ')';
    var cnt = document.getElementById('sheetCount'); if (cnt) cnt.textContent = read === 0 ? entries.length + ' chapters' : read + ' of ' + entries.length + ' read';
    var rc = document.getElementById('readCount'); if (rc) rc.textContent = read + ' of ' + entries.length + ' read';
    var max = docEl.scrollHeight - vh, bar = document.getElementById('folioBar');
    if (bar) bar.style.transform = 'scaleX(' + S.clamp(scrollY / Math.max(max, 1)).toFixed(4) + ')';
    darkCheck = 3;
  }
  // The bar turns dark over a [data-dark] section. A section that turns light
  // on its own clock sets el._light = true and calls Story.recheckDark().
  var darkCheck = 0, folioDark = false;
  function checkDark() {
    var dark = false, hits = document.elementsFromPoint(innerWidth / 2, 64);
    for (var h = 0; h < hits.length; h++) {
      if (hits[h].closest('#folio, #sheet, .nudge')) continue;
      var st = hits[h].closest('[data-dark]'); if (st) dark = !st._light;
      break;
    }
    var f = document.getElementById('folio');
    if (f && dark !== folioDark) { folioDark = dark; f.classList.toggle('dark', dark); }
  }
  S.recheckDark = function () { darkCheck = 3; };

  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
      e.preventDefault();
      S.scrollToY(t.getBoundingClientRect().top + scrollY, 1.4);
      history.replaceState(null, '', a.getAttribute('href'));
    });
  }

  // ------------------------------------------------------------- the stops --
  // One wheel gesture moves one stop, however far the wheel turned; a long,
  // hard swing may pass several. Stops come from two places: scenes declare
  // theirs (Story.stops), and flow content gets one stop per screenful,
  // centred under the bar, so text never rests hanging halfway up.
  var stops = [], gest = null;
  var SWING = [0, 800, 1700, 2700, 3900, 5300];
  function buildStops() {
    var declared = [];
    stopProviders.forEach(function (fn) { try { var z = fn(); if (z && z.stops) declared.push(z.stops.map(Math.round)); } catch (e) { console.error('[story] stops', e); } });
    var vh = innerHeight, bar = S.small() ? 48 : BAR, max = docEl.scrollHeight - vh;
    var avail = vh - bar, pad = Math.max(40, Math.round(avail * 0.1)), fit = avail - 2 * pad;
    var spans = declared.map(function (st) { return [Math.min.apply(null, st), Math.max.apply(null, st)]; });
    var inDeclared = function (y) { return spans.some(function (s) { return y > s[0] + 8 && y < s[1] - 8; }); };
    var pinned = [].slice.call(document.querySelectorAll('[data-act="pin"]'));
    // Blocks: headings, revealed elements and [data-block] units outside pins.
    // A [data-block] is one unit: its marked children are not separate stops.
    var blocks = [];
    document.querySelectorAll('main .head, main [data-in], main [data-block], main .more').forEach(function (el) {
      if (pinned.some(function (p) { return p.contains(el); })) return;
      if (el.parentElement && el.parentElement.closest('[data-in], [data-block], .more:not(.open)')) return;
      var r = el.getBoundingClientRect(); if (!r.height) return;
      var nx = el.nextElementSibling;
      blocks.push({ t: r.top + scrollY, b: r.bottom + scrollY, sec: el.closest('.ch, section'), head: el.classList.contains('head'), lead: !!(nx && nx.matches('[data-act], .gallery')) });
    });
    // A section's last block stands for everything after it, up to the next pin.
    blocks.forEach(function (bk, i) {
      if (!bk.sec || (blocks[i + 1] && blocks[i + 1].sec === bk.sec)) return;
      var end = bk.b, lim = Infinity;
      pinned.forEach(function (p) { if (bk.sec.contains(p)) { var pt = p.getBoundingClientRect().top + scrollY; if (pt > bk.b - 2 && pt < lim) lim = pt; } });
      [].forEach.call(bk.sec.querySelectorAll(':scope > *, :scope > .wrap > *'), function (k) { var kr = k.getBoundingClientRect(); if (!kr.height || kr.top + scrollY < bk.b - 8) return; var kb = kr.bottom + scrollY; if (kb > end && kb <= lim) end = kb; });
      bk.b = end;
    });
    var flow = [0];
    for (var i = 0; i < blocks.length;) {
      var b0 = blocks[i], g0 = b0.t, g1 = b0.b, j = i + 1;
      while (j < blocks.length && blocks[j].sec === b0.sec && Math.max(g1, blocks[j].b) - g0 <= fit) { g1 = Math.max(g1, blocks[j].b); j++; }
      var h = g1 - g0, lone = j === i + 1 && b0.head && (b0.lead || (j < blocks.length && blocks[j].sec === b0.sec));
      var y = h <= fit && !lone ? g0 - bar - (avail - h) / 2 : g0 - bar - pad;
      // A section shorter than the screen is centred whole. In a longer one,
      // never go past its last screen, and never above its own top.
      var sr = b0.sec && b0.sec.getBoundingClientRect();
      if (sr) {
        if (sr.height <= avail) y = sr.top + scrollY - bar - (avail - sr.height) / 2;
        else { y = Math.min(y, sr.bottom + scrollY - vh); y = Math.max(y, sr.top + scrollY - bar); }
      }
      y = Math.round(y);
      if (y > 0 && y < max && !inDeclared(y)) flow.push(y);
      i = j;
    }
    flow.push(max);
    var all = [];
    declared.forEach(function (st, zi) { st.forEach(function (y) { all.push({ y: y, z: zi }); }); });
    flow.forEach(function (y) { all.push({ y: y, z: -1 }); });
    all.sort(function (a, b) { return a.y - b.y; });
    // Merge stops that are too close to feel like a move; a declared stop wins.
    var merged = [];
    all.forEach(function (st) {
      var last = merged[merged.length - 1];
      if (last && st.y - last.y < vh * (last.z === -1 && st.z === -1 ? 0.18 : 0.22) && (last.z === -1 || st.z === -1)) { if (last.z === -1 && st.z !== -1) merged[merged.length - 1] = st; return; }
      merged.push(st);
    });
    // Fill long plain stretches so no gap is much longer than a screen.
    var out = [];
    merged.forEach(function (st, k) {
      var prev = merged[k - 1];
      if (prev && !(prev.z !== -1 && prev.z === st.z)) {
        var gap = st.y - prev.y, n = Math.floor(gap / (vh * (prev.z === -1 && st.z === -1 ? 1.3 : 1.6)));
        for (var m = 1; m <= n; m++) out.push(Math.round(prev.y + gap * m / (n + 1)));
      }
      out.push(Math.max(0, Math.min(max, st.y)));
    });
    stops = out.filter(function (v, k, a) { return k === 0 || v - a[k - 1] > 24; });
    // For review scripts: the final stop list, and a way to jump to a stop.
    window.__scrollStops = stops.slice();
    window.__scrollTo = function (yy) { if (S.lenis) S.lenis.scrollTo(yy, { immediate: true, force: true }); else scrollTo(0, yy); };
  }
  S.rebuildStops = function () { setTimeout(buildStops, 30); };
  S.getStops = function () { return stops.slice(); };

  function next(y, dir) {
    if (dir > 0) { for (var i = 0; i < stops.length; i++) if (stops[i] > y + 3) return stops[i]; }
    else { for (var j = stops.length - 1; j >= 0; j--) if (stops[j] < y - 3) return stops[j]; }
    return null;
  }
  function ahead(y, dir, k) { var out = null; while (k-- > 0) { var n = next(y, dir); if (n === null) break; out = y = n; } return out; }
  function earned(acc) { var n = 1; while (n < SWING.length && acc > SWING[n]) n++; return n; }
  function glide(y) {
    gest.to = y;
    var d = Math.abs(y - S.lenis.animatedScroll);
    // Ease-out: the page answers the wheel on the next frame and settles softly.
    S.lenis.scrollTo(y, { duration: Math.min(1.05, 0.62 + d / innerHeight * 0.25), easing: function (t) { return 1 - Math.pow(1 - t, 3.2); }, force: true });
  }
  function stepWheel(data) {
    var ev = data.event;
    if (!ev || ev.type !== 'wheel' || ev.ctrlKey || !stops.length) return true;
    if (ev.target && ev.target.closest && ev.target.closest('[data-lenis-prevent]')) return true;
    var lb = document.getElementById('lb'); if (lb && lb.classList.contains('open')) return true;
    var dy = data.deltaY, dx = data.deltaX;
    if (Math.abs(dx) > Math.abs(dy)) {
      // A sideways swipe over a rail steps the rail, the same as scrolling down.
      if (ev.target && ev.target.closest && ev.target.closest('.rail')) dy = dx; else return false;
    }
    if (!dy) return true;
    var dir = dy > 0 ? 1 : -1, now = performance.now(), y = S.lenis.targetScroll;
    if (gest && gest.dir === dir && now - gest.t < 220) {
      gest.t = now; gest.acc += Math.abs(dy);
      if (!gest.stepping) return true;
      if (ev.cancelable) ev.preventDefault();
      var want = earned(gest.acc);
      if (want > gest.n) { var nx = ahead(gest.to, dir, want - gest.n); if (nx !== null) { gest.n = want; glide(nx); } }
      return false;
    }
    gest = { dir: dir, t: now, acc: Math.abs(dy), n: earned(Math.abs(dy)), stepping: false, to: y };
    var n2 = ahead(y, dir, gest.n);
    if (n2 === null) return true;
    if (ev.cancelable) ev.preventDefault();
    gest.stepping = true; glide(n2);
    return false;
  }
  function initStepKeys() {
    if (!S.lenis) return;
    addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      var dir = (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) ? 1 : (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) ? -1 : 0;
      if (!dir) return;
      var nx = next(S.lenis.targetScroll, dir); if (nx === null) return;
      e.preventDefault(); gest = { dir: dir, t: performance.now(), acc: 0, n: 1, stepping: true, to: S.lenis.targetScroll }; glide(nx);
    });
  }

  // ------------------------------------------------------------ "+" tiles --
  function initMore() {
    document.querySelectorAll('[data-more]').forEach(function (m) {
      var btn = m.querySelector('.more__btn'), panel = m.querySelector('.more__panel');
      btn.addEventListener('click', function () {
        var open = !m.classList.contains('open');
        m.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); panel.inert = !open;
        setTimeout(S.relayout, S.reduce ? 0 : 560);
      });
    });
  }
  // ------------------------------------------------------------ the nudge --
  // If the reader stops inside a pinned act that still has more to show, say
  // so. Hidden the moment they scroll. data-no-nudge turns it off for an act.
  function initNudge() {
    var el = document.getElementById('nudge'), t = 0;
    if (!el || S.reduce) return;
    function check() {
      var show = S.engine.acts.some(function (a) {
        if (!a.pinned || !a.live || a.p <= 0.004 || a.p >= 0.96 || a.el.hasAttribute('data-no-nudge')) return false;
        var r = a.el.getBoundingClientRect(); return r.top <= 2 && r.bottom >= innerHeight - 2;
      });
      var lb = document.getElementById('lb'), sh = document.getElementById('sheet');
      if ((lb && lb.classList.contains('open')) || (sh && sh.classList.contains('open'))) show = false;
      el.classList.toggle('on', show);
    }
    addEventListener('scroll', function () { el.classList.remove('on'); clearTimeout(t); t = setTimeout(check, 3000); }, { passive: true });
  }
  // ------------------------------------------------------------- lightbox --
  // Any element with data-full="src" (and data-cap) opens full size.
  var lb, lbFig, lbCap, lbLast;
  function initLightbox() {
    lb = document.getElementById('lb'); if (!lb) return;
    lbFig = document.getElementById('lbFig'); lbCap = document.getElementById('lbCap');
    document.addEventListener('click', function (e) {
      var z = e.target.closest('[data-full]'); if (!z) return;
      e.preventDefault(); lbLast = document.activeElement;
      var old = lbFig.querySelector('img'); if (old) old.remove();
      var img = document.createElement('img'); img.src = z.getAttribute('data-full'); img.alt = z.getAttribute('data-cap') || '';
      lbFig.insertBefore(img, lbFig.firstChild); lbCap.textContent = z.getAttribute('data-cap') || '';
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lb.inert = false;
      if (S.lenis) S.lenis.stop();
      document.getElementById('lbClose').focus({ preventScroll: true });
    });
    function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lb.inert = true; if (S.lenis) S.lenis.start(); if (lbLast) lbLast.focus({ preventScroll: true }); }
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.id === 'lbClose') close(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }
  // ------------------------------------------------------------ recordings --
  // A .rec plate holds <video data-src> and a .rec__pp button. It loops,
  // muted, while at least half on screen, and the button pauses it (WCAG
  // 2.2.2). Never scrubbed by scroll.
  function initRecordings() {
    document.querySelectorAll('.rec[data-autoplay]').forEach(function (pl) {
      var v = pl.querySelector('video'), b = pl.querySelector('.rec__pp'), paused = false;
      if (!v) return;
      function sync() { if (!b) return; b.setAttribute('aria-pressed', paused ? 'true' : 'false'); b.setAttribute('aria-label', paused ? 'Play the recording' : 'Pause the recording'); pl.classList.toggle('paused', paused); }
      function on() { if (!v.src) v.src = v.getAttribute('data-src'); if (!paused) v.play().catch(function () {}); }
      if (S.reduce) { v.controls = true; v.preload = 'metadata'; v.src = v.getAttribute('data-src'); if (b) b.hidden = true; return; }
      if (b) b.addEventListener('click', function () { paused = !paused; sync(); if (paused) v.pause(); else on(); });
      if (!('IntersectionObserver' in window)) { on(); return; }
      new IntersectionObserver(function (es) { if (es[0].intersectionRatio >= 0.5) on(); else if (!v.paused) v.pause(); }, { threshold: [0, 0.5] }).observe(pl);
    });
  }
  // ------------------------------------------------------ arrival diagrams --
  // [data-arrive] gets .on once, when that fraction of it is on screen (0.55
  // by default): diagrams that play on a clock with CSS transition delays.
  // A scene may set el._onArrive = fn to run code at the same moment.
  function initArrive() {
    document.querySelectorAll('[data-arrive]').forEach(function (m) {
      if (S.reduce || !('IntersectionObserver' in window)) { m.classList.add('on'); if (m._onArrive) m._onArrive(); return; }
      var r = parseFloat(m.getAttribute('data-arrive')) || 0.55;
      var io = new IntersectionObserver(function (es) { if (es[0].intersectionRatio >= r) { m.classList.add('on'); io.disconnect(); if (m._onArrive) m._onArrive(); } }, { threshold: [0, r] });
      io.observe(m);
    });
  }

  // ------------------------------------------------------------- rails --
  // Story.rail('id'): a pinned act whose .rail__track moves sideways one card
  // per swipe, on a clock (0.7 s), then the page carries on. Buttons with
  // data-dir="-1" / "1" scroll the page to the matching stop.
  function railXs(el) {
    var stage = el.querySelector('[data-stage]'), track = el.querySelector('.rail__track'), kids = [].slice.call(track.children);
    var over = Math.max(0, track.scrollWidth - stage.clientWidth), pad = kids[0] ? kids[0].offsetLeft : 0, xs = [0];
    for (var j = 1; j < kids.length; j++) { var x = -Math.min(over, Math.max(0, kids[j].offsetLeft - pad)); if (x < xs[xs.length - 1] - 4) xs.push(x); }
    return xs;
  }
  function fracs(n) { var f = []; for (var k = 0; k < n; k++) f.push(n < 2 ? 0 : k / (n - 1)); return f; }
  S.rail = function (id) {
    S.build(function () {
      var el = document.getElementById(id); if (!el || S.reduce) return;
      el.setAttribute('data-span', (1 + Math.max(1, railXs(el).length - 1) * 0.7).toFixed(2));
    });
    S.scene(id, (function () {
      var el, track, prev, nextB, xs = [0], tl = { v: 0 };
      function go(k) { var ys = S.actY(el, fracs(xs.length)); k = S.clamp(k, 0, xs.length - 1); S.scrollToY(ys[k] + 1, 0.9); }
      function place(v) {
        var k = Math.min(xs.length - 2, Math.floor(v)), x = xs.length < 2 ? 0 : S.lerp(xs[k], xs[k + 1], S.eio(S.clamp(v - k)));
        track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        var i = Math.round(v); if (prev) { prev.disabled = i <= 0; nextB.disabled = i >= xs.length - 1; }
      }
      return {
        init: function (e) {
          el = e; track = el.querySelector('.rail__track'); prev = el.querySelector('[data-dir="-1"]'); nextB = el.querySelector('[data-dir="1"]');
          xs = railXs(el);
          if (prev) { prev.addEventListener('click', function () { go(Math.round(tl.v) - 1); }); nextB.addEventListener('click', function () { go(Math.round(tl.v) + 1); }); }
          place(0);
        },
        resize: function () { xs = railXs(el); S.markDirty(id); },
        update: function (p, time) { var target = S.stageOf(p, xs.length), v = S.tl(tl, target, time, 0.7, 0.8); place(v); return v !== target; },
        still: function (e) {
          // Reduced motion: the row scrolls sideways natively, buttons scroll it.
          el = e; track = el.querySelector('.rail__track'); prev = el.querySelector('[data-dir="-1"]'); nextB = el.querySelector('[data-dir="1"]');
          var by = function (d) { var k = track.children[0]; track.scrollBy({ left: d * (k ? k.getBoundingClientRect().width + 16 : 300) }); };
          if (prev) { prev.addEventListener('click', function () { by(-1); }); nextB.addEventListener('click', function () { by(1); }); }
        }
      };
    })());
    S.stops(function () { var el = document.getElementById(id); return { stops: S.actY(el, fracs(railXs(el).length)) }; });
  };
})();

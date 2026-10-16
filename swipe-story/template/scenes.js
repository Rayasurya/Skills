/* =============================================================================
   scenes.js: the page's own scenes. One block per pinned section.
   Pattern: scroll picks a stage (Story.stageOf), the change plays on a clock
   (CSS transitions, Story.after, or Story.tl), and every scene has a still()
   for reduced motion that shows its final state.
   ========================================================================== */
(function () {
  'use strict';
  var S = window.Story, $ = function (id) { return document.getElementById(id); };

  /* 01 · HERO: two stops. */
  S.scene('ch-01', (function () {
    var el, stage = -1;
    function apply(k) { if (k === stage) return; stage = k; el.dataset.stage = k; S.swapTo($('heroSwap'), k); }
    return {
      init: function (e) { el = e; apply(0); },
      update: function (p) { apply(S.stageOf(p, 2)); return false; },
      still: function (e) { el = e; apply(1); }
    };
  })());
  S.stops(function () { return { stops: S.actY($('ch-01'), [0, 1]) }; });

  /* 02 · SIGNATURE: three stops; each stage lights its step on a clock. */
  S.scene('ch-02', (function () {
    var el, steps, stage = -2;
    function apply(k) {
      if (k === stage) return; stage = k; el.dataset.stage = k;
      S.swapTo($('sigSwap'), Math.max(0, k));
      steps.forEach(function (s, i) { S.cancel('st' + i); if (i > k) s.classList.remove('lit'); });
      // The newly reached step lights after the glide settles (0.35 s).
      steps.forEach(function (s, i) { if (i <= k) S.after('st' + i, function () { s.classList.add('lit'); }, i === k ? 350 : 0); });
    }
    return {
      init: function (e) { el = e; steps = [].slice.call(el.querySelectorAll('.step')); apply(-1); },
      update: function (p) { if (!S.arrived(el)) { apply(-1); return true; } apply(S.stageOf(p, 3)); return false; },
      still: function (e) { el = e; if (!steps) steps = [].slice.call(el.querySelectorAll('.step')); steps.forEach(function (s) { s.classList.add('lit'); }); }
    };
  })());
  S.stops(function () { return { stops: S.actY($('ch-02'), [0, 0.5, 1]) }; });

  /* 03 · RAIL */
  S.rail('ch-03');

  /* 05 · SCREENS: one per stop; the camera eases to a focus box (fractions
     of the capture: x0, y0, x1, y1) after the screen has faded in. */
  var SCREENS = [
    { src: '', label: 'Screen 1', line: '[What this screen shows, in one line.]' },
    { src: '', label: 'Screen 2', line: '[What this screen shows, in one line.]', f: [0.55, 0.05, 1, 0.7] },
    { src: '', label: 'Screen 3', line: '[What this screen shows, in one line.]' }
  ];
  function zoomFor(f) {
    if (!f || S.small()) return 'none';
    var sc = Math.min(1.8, 1 / ((f[2] - f[0]) * 1.06), 1 / ((f[3] - f[1]) * 1.06));
    var tx = S.clamp(0.5 - (f[0] + f[2]) / 2 * sc, 1 - sc, 0), ty = S.clamp(0.5 - (f[1] + f[3]) / 2 * sc, 1 - sc, 0);
    return 'translate(' + (tx * 100).toFixed(2) + '%,' + (ty * 100).toFixed(2) + '%) scale(' + sc.toFixed(3) + ')';
  }
  S.scene('ch-05', (function () {
    var el, shots, stage = -1, bubble;
    function apply(k) {
      if (k === stage) return; stage = k;
      shots.forEach(function (sh, i) {
        var pic = sh.firstElementChild;
        pic.style.transition = 'none'; pic.style.transform = 'none'; pic.getBoundingClientRect(); pic.style.transition = '';
        sh.classList.toggle('on', i === k);
        if (i === k) S.after('zoom', function () { pic.style.transform = zoomFor(SCREENS[k].f); }, 700);
      });
      bubble.classList.add('fade');
      S.after('bub', function () { $('benchKicker').textContent = SCREENS[k].label; $('benchLine').textContent = SCREENS[k].line; bubble.classList.remove('fade'); }, 380);
    }
    return {
      init: function (e) {
        el = e; bubble = el.querySelector('.bench__bubble');
        $('benchView').innerHTML = SCREENS.map(function (s) {
          return '<div class="shot">' + (s.src ? '<img src="' + s.src + '" alt="' + s.label + '">' : '<div class="demo-screen">' + s.label + '</div>') + '</div>';
        }).join('');
        shots = [].slice.call($('benchView').children);
        apply(0);
      },
      update: function (p) { apply(S.stageOf(p, SCREENS.length)); return false; },
      still: function (e) { el = e; if (!shots) this.init(e); shots.forEach(function (sh) { sh.classList.add('on'); }); }
    };
  })());
  S.stops(function () { return { stops: S.actY($('ch-05'), SCREENS.map(function (s, i) { return i / (SCREENS.length - 1); })) }; });

  S.start();
})();

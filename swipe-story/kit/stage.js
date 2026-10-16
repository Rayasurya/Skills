/* =============================================================================
   swipe-story · stage.js: the scroll engine.

   Two jobs, nothing else:
   1. Acts. Every [data-act] element is an act. A pinned act
      (data-act="pin") gets a height of data-span screens; its [data-stage]
      child sticks to the top while the act scrolls past, and the act reports
      its progress p (0 at its top, 1 when its last screen is reached).
      A flow act (data-act="flow") only reports whether it is near the screen.
   2. Reveals. [data-in] elements rise into place once, the first time they
      reach the screen. [data-stagger="ms"] delays each child by that much.

   Stage.mount(root) returns { acts, layout, update }. The page controller
   (story.js) calls update() at the start of every frame it draws, so the
   progress it reads is never a frame old.
   ========================================================================== */
(function () {
  'use strict';

  function mount(root) {
    root = root || document.body;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var vh = innerHeight;
    var acts = [].map.call(root.querySelectorAll('[data-act]'), function (el) {
      var kind = el.getAttribute('data-act');
      return { el: el, kind: kind, pinned: kind === 'pin', stage: el.querySelector('[data-stage]'), top: 0, height: 0, p: 0, live: false };
    });

    function layout() {
      vh = innerHeight;
      acts.forEach(function (a) {
        if (!a.pinned) { a.el.style.height = ''; return; }
        var span = parseFloat(a.el.getAttribute('data-span')) || 2;
        a.el.style.height = Math.round(Math.max(1, span) * vh) + 'px';
      });
      // Measure after every height is set: a pin above moves everything below.
      acts.forEach(function (a) {
        var r = a.el.getBoundingClientRect();
        a.top = r.top + scrollY;
        a.height = a.el.offsetHeight;
      });
      update();
    }

    function update() {
      var y = scrollY;
      for (var i = 0; i < acts.length; i++) {
        var a = acts[i], travel = Math.max(a.height - vh, 1);
        a.p = Math.min(1, Math.max(0, (y - a.top) / travel));
        a.live = y > a.top - vh * 1.25 && y < a.top + a.height + vh * 0.25;
      }
    }

    // ----------------------------------------------------------- reveals --
    root.querySelectorAll('[data-stagger]').forEach(function (box) {
      var ms = parseFloat(box.getAttribute('data-stagger')) || 70;
      [].forEach.call(box.children, function (c, i) { c.style.transitionDelay = (i * ms) + 'ms'; });
    });
    var shown = function (el) { el.classList.add('is-in'); };
    var reveals = root.querySelectorAll('[data-in]');
    if (reduce || !('IntersectionObserver' in window)) reveals.forEach(shown);
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { shown(e.target); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    }

    document.documentElement.classList.add('stage-ready');
    layout();
    addEventListener('scroll', update, { passive: true });
    return { acts: acts, layout: layout, update: update };
  }

  window.Stage = { mount: mount };
})();

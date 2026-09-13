(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sequence = document.querySelector('[data-build-sequence]');
  const sequenceSteps = Array.from(document.querySelectorAll('[data-scene-step]'));
  const sequenceLine = document.querySelector('[data-sequence-progress]');
  const sceneViewport = document.querySelector('[data-scene-viewport]');

  function setSequenceProgress(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    const activeIndex = Math.min(
      sequenceSteps.length - 1,
      Math.floor(clamped * sequenceSteps.length)
    );
    sequenceSteps.forEach(function (step, index) {
      step.classList.toggle('is-active', index === activeIndex);
    });
    if (sequenceLine) sequenceLine.style.transform = 'scaleX(' + clamped + ')';
    window.dispatchEvent(new CustomEvent('cw:scene-progress', { detail: { progress: clamped } }));
  }

  function initNativeFallback() {
    document.querySelectorAll('[data-reveal]').forEach(function (element) {
      element.classList.add('is-revealed');
    });
    document.querySelectorAll('[data-counter]').forEach(function (counter) {
      const valueNode = counter.childNodes[0];
      if (valueNode) valueNode.nodeValue = String(Number(counter.dataset.counter || 0));
    });
    if (!sequence) return;
    function update() {
      const rect = sequence.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      setSequenceProgress(Math.max(0, Math.min(1, -rect.top / distance)));
      if (sceneViewport)
        sceneViewport.classList.toggle('is-hidden', rect.bottom < window.innerHeight * 0.15);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initMotion() {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
      initNativeFallback();
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis) {
      const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    gsap.set('[data-reveal]', { y: 38, opacity: 0 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: function (items) {
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: true
        });
      }
    });

    document.querySelectorAll('[data-counter]').forEach(function (counter) {
      const target = Number(counter.dataset.counter || 0);
      const valueNode = counter.childNodes[0];
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 86%',
        once: true,
        onEnter: function () {
          const state = { value: 0 };
          gsap.to(state, {
            value: target,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: function () {
              valueNode.nodeValue = Math.round(state.value);
            }
          });
        }
      });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
      gsap.to('.hero-copy', {
        yPercent: 18,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-telemetry', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    if (sequence) {
      ScrollTrigger.create({
        trigger: sequence,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          setSequenceProgress(self.progress);
        },
        onEnter: function () {
          if (sceneViewport) sceneViewport.classList.remove('is-hidden');
        },
        onEnterBack: function () {
          if (sceneViewport) sceneViewport.classList.remove('is-hidden');
        },
        onLeave: function () {
          if (sceneViewport) sceneViewport.classList.add('is-hidden');
        }
      });
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener(
        'pointermove',
        function (event) {
          const nx = (event.clientX / window.innerWidth - 0.5) * 2;
          const ny = (event.clientY / window.innerHeight - 0.5) * 2;
          window.dispatchEvent(new CustomEvent('cw:scene-pointer', { detail: { x: nx, y: ny } }));
        },
        { passive: true }
      );
    }

    window.addEventListener(
      'load',
      function () {
        ScrollTrigger.refresh();
      },
      { once: true }
    );
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initMotion, { once: true });
  else initMotion();
})();

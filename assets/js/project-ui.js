(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finishLoading() {
    window.setTimeout(
      function () {
        body.classList.add('is-ready');
        body.classList.remove('is-loading');
        const loader = document.querySelector('[data-page-loader]');
        if (loader) loader.setAttribute('aria-hidden', 'true');
      },
      reducedMotion ? 0 : 260
    );
  }

  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    let lastCompact = false;
    function update() {
      const compact = window.scrollY > 36;
      if (compact !== lastCompact) {
        header.classList.toggle('is-compact', compact);
        lastCompact = compact;
      }
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initActivityFilters() {
    const buttons = Array.from(document.querySelectorAll('[data-filter]'));
    const rows = Array.from(document.querySelectorAll('[data-activity-state]'));
    if (!buttons.length || !rows.length) return;

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const filter = button.dataset.filter || 'all';
        buttons.forEach(function (item) {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        rows.forEach(function (row) {
          row.hidden = filter !== 'all' && row.dataset.activityState !== filter;
        });
      });
    });
  }

  function initLightbox() {
    const dialog = document.querySelector('[data-lightbox]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('p');
    const close = dialog.querySelector('[data-lightbox-close]');
    let trigger = null;

    document.querySelectorAll('[data-lightbox-src]').forEach(function (button) {
      button.addEventListener('click', function () {
        trigger = button;
        image.src = button.dataset.lightboxSrc || '';
        image.alt = button.dataset.lightboxAlt || 'Evidencia fotográfica de obra';
        caption.textContent = image.alt;
        dialog.showModal();
        body.classList.add('is-lightbox-open');
        if (close) close.focus();
      });
    });

    function closeDialog() {
      if (dialog.open) dialog.close();
      body.classList.remove('is-lightbox-open');
      image.src = '';
      if (trigger) trigger.focus();
    }
    if (close) close.addEventListener('click', closeDialog);
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener('close', function () {
      body.classList.remove('is-lightbox-open');
    });
  }

  function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches || reducedMotion) return;
    const cursor = document.querySelector('[data-cursor]');
    if (!cursor) return;
    let x = -100;
    let y = -100;
    let currentX = x;
    let currentY = y;

    window.addEventListener(
      'pointermove',
      function (event) {
        x = event.clientX;
        y = event.clientY;
        cursor.classList.add('is-visible');
      },
      { passive: true }
    );
    document.documentElement.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-visible');
    });

    document
      .querySelectorAll('a, button, summary, [data-cursor-label]')
      .forEach(function (element) {
        element.addEventListener('pointerenter', function () {
          cursor.classList.add('is-active');
        });
        element.addEventListener('pointerleave', function () {
          cursor.classList.remove('is-active');
        });
      });

    function render() {
      currentX += (x - currentX) * 0.22;
      currentY += (y - currentY) * 0.22;
      cursor.style.left = currentX + 'px';
      cursor.style.top = currentY + 'px';
      window.requestAnimationFrame(render);
    }
    render();
  }

  function initImageFallbacks() {
    document.querySelectorAll('.journal-photo img').forEach(function (image) {
      image.addEventListener(
        'error',
        function () {
          const figure = image.closest('.journal-photo');
          if (figure) figure.classList.add('has-image-error');
          image.alt = 'La evidencia fotográfica no pudo cargarse';
        },
        { once: true }
      );
    });
  }

  function initPageTransitions() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        const href = link.getAttribute('href') || '';
        if (
          event.defaultPrevented ||
          link.target === '_blank' ||
          href.charAt(0) === '#' ||
          href.startsWith('mailto:')
        )
          return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        body.classList.add('is-leaving');
      });
    });
  }

  body.classList.add('is-loading');
  initHeader();
  initActivityFilters();
  initLightbox();
  initCursor();
  initImageFallbacks();
  initPageTransitions();
  root.classList.add('ui-ready');

  if (document.readyState === 'complete') finishLoading();
  else window.addEventListener('load', finishLoading, { once: true });
  window.setTimeout(finishLoading, 1800);

  window.CivilWorkUI = { reducedMotion: reducedMotion };
})();

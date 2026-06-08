(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initCovers() {
    qsa('[data-cover]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var list = qs('[data-card-list]');
    if (!panel || !list) {
      return;
    }
    var input = qs('[data-live-search]', panel);
    var empty = qs('[data-empty-state]');
    var cards = qsa('[data-card]', list);
    var state = {
      text: '',
      type: '',
      category: ''
    };
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var okText = !state.text || haystack.indexOf(normalize(state.text)) !== -1;
        var okType = !state.type || cardType === state.type;
        var okCategory = !state.category || cardCategory === state.category;
        var ok = okText && okType && okCategory;
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (q) {
        input.value = q;
        state.text = q;
      }
      input.addEventListener('input', function () {
        state.text = input.value;
        apply();
      });
    }
    qsa('[data-filter-type]', panel).forEach(function (button) {
      button.addEventListener('click', function () {
        state.type = button.getAttribute('data-filter-type') || '';
        state.category = '';
        qsa('.filter-chips button', panel).forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        apply();
      });
    });
    qsa('[data-filter-category]', panel).forEach(function (button) {
      button.addEventListener('click', function () {
        state.category = button.getAttribute('data-filter-category') || '';
        state.type = '';
        qsa('.filter-chips button', panel).forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        apply();
      });
    });
    var reset = qs('[data-filter-reset]', panel);
    if (reset) {
      reset.addEventListener('click', function () {
        state.text = '';
        state.type = '';
        state.category = '';
        if (input) {
          input.value = '';
        }
        qsa('.filter-chips button', panel).forEach(function (item) {
          item.classList.remove('active');
        });
        apply();
      });
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCovers();
    initFilters();
  });
}());

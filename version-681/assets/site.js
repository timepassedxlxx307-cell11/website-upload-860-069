(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function resetTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(nextSlide, 5200);
    }

    hero.querySelectorAll('[data-hero-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        nextSlide();
        resetTimer();
      });
    });

    hero.querySelectorAll('[data-hero-prev]').forEach(function (button) {
      button.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        resetTimer();
      });
    });

    showSlide(0);
    resetTimer();
  }

  document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.querySelector(button.getAttribute('data-scroll-target'));
      var direction = button.getAttribute('data-scroll-direction') === 'left' ? -1 : 1;

      if (target) {
        target.scrollBy({
          left: direction * 420,
          behavior: 'smooth'
        });
      }
    });
  });

  document.querySelectorAll('[data-home-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = './search.html';

      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }

      window.location.href = target;
    });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    function filterCards() {
      var query = normalize(filterInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }

        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    filterInput.addEventListener('input', filterCards);

    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', filterCards);
    }

    filterCards();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.querySelector('[data-player-overlay]');
    var hls = null;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
        video.load();
      }
    }

    function play() {
      prepare();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalized(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filters]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector("[data-filter-search]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    function apply() {
      var q = normalized(input && input.value);
      var r = normalized(region && region.value);
      var t = normalized(type && type.value);
      var y = normalized(year && year.value);
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalized(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title"));
        var cardRegion = normalized(card.getAttribute("data-region"));
        var cardType = normalized(card.getAttribute("data-type"));
        var cardYear = normalized(card.getAttribute("data-year"));
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (r && cardRegion !== r) {
          matched = false;
        }
        if (t && cardType.indexOf(t) === -1) {
          matched = false;
        }
        if (y && cardYear !== y) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function attachPlayer(video) {
    var stream = video.getAttribute("data-stream");
    if (!stream || video.dataset.ready === "yes") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = stream;
    }
    video.dataset.ready = "yes";
  }

  function setupPlayers() {
    var stages = Array.prototype.slice.call(document.querySelectorAll(".player-stage"));
    stages.forEach(function (stage) {
      var video = stage.querySelector("video[data-stream]");
      var button = stage.querySelector(".player-overlay");
      if (!video) {
        return;
      }
      function play() {
        attachPlayer(video);
        stage.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        stage.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          stage.classList.remove("is-playing");
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();

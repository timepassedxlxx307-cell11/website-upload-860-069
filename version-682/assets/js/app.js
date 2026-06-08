(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMobileMenu() {
    var toggle = qs(".mobile-toggle");
    var menu = qs(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSearchForms() {
    qsa(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initHero() {
    var hero = qs(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var prev = qs(".hero-prev", hero);
    var next = qs(".hero-next", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initCardFilter() {
    qsa("[data-card-search]").forEach(function (input) {
      var section = input.closest(".list-section") || document;
      var cards = qsa(".movie-card", section);
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function initCardSort() {
    qsa("[data-sort]").forEach(function (button) {
      button.addEventListener("click", function () {
        var section = button.closest(".list-section") || document;
        var list = qs("[data-card-list]", section);
        if (!list) {
          return;
        }
        var key = button.getAttribute("data-sort");
        var cards = qsa(".movie-card", list);
        cards.sort(function (a, b) {
          return Number(b.dataset[key] || 0) - Number(a.dataset[key] || 0);
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      });
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<a class=\"movie-card\" href=\"" + escapeHtml(item.url) + "\">" +
      "<span class=\"poster-wrap\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-glow\"></span>" +
      "<span class=\"card-play\">▶</span>" +
      "<span class=\"card-category\">" + escapeHtml(item.category) + "</span>" +
      "</span>" +
      "<span class=\"card-body\">" +
      "<strong>" + escapeHtml(item.title) + "</strong>" +
      "<span class=\"card-line\">" + escapeHtml(item.one_line) + "</span>" +
      "<span class=\"card-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</span>" +
      "<span class=\"card-tags\">" + tags + "</span>" +
      "</span>" +
      "</a>";
  }

  function initSearchPage() {
    if (!window.SEARCH_DATA) {
      return;
    }
    var input = qs("#search-input");
    var regionSelect = qs("#filter-region");
    var yearSelect = qs("#filter-year");
    var typeSelect = qs("#filter-type");
    var results = qs("#search-results");
    if (!input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var startQuery = params.get("q") || "";
    input.value = startQuery;

    fillSelect(regionSelect, Array.from(new Set(window.SEARCH_DATA.map(function (item) { return item.region; }))).filter(Boolean).sort());
    fillSelect(yearSelect, Array.from(new Set(window.SEARCH_DATA.map(function (item) { return item.year; }))).filter(Boolean).sort().reverse());
    fillSelect(typeSelect, Array.from(new Set(window.SEARCH_DATA.map(function (item) { return item.type; }))).filter(Boolean).sort());

    function render() {
      var query = input.value.trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var list = window.SEARCH_DATA.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.one_line, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return (!query || haystack.indexOf(query) !== -1) && (!region || item.region === region) && (!year || item.year === year) && (!type || item.type === type);
      }).slice(0, 160);
      results.innerHTML = list.map(cardTemplate).join("");
    }

    input.addEventListener("input", render);
    if (regionSelect) {
      regionSelect.addEventListener("change", render);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", render);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", render);
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initCardFilter();
    initCardSort();
    initSearchPage();
  });
})();

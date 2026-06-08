(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  var video = document.getElementById("movie-player");
  var playButton = document.getElementById("movie-play-button");
  if (video && playButton) {
    var source = video.getAttribute("data-video");
    var loaded = false;
    var start = function () {
      if (!source) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      playButton.classList.add("hidden");
      var playing = video.play();
      if (playing && typeof playing.catch === "function") {
        playing.catch(function () {});
      }
    };
    playButton.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      playButton.classList.add("hidden");
    });
  }

  var searchInput = document.getElementById("movie-search-input");
  var results = document.getElementById("movie-search-results");
  if (searchInput && results && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    var render = function (items) {
      if (!items.length) {
        results.innerHTML = '<p class="search-empty">没有找到匹配内容</p>';
        return;
      }
      results.innerHTML = items.slice(0, 80).map(function (item) {
        return [
          '<article class="movie-card compact">',
          '<a class="poster-link" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
          '<span class="card-badge">' + item.year + '</span>',
          '</a>',
          '<div class="card-body">',
          '<a class="card-title" href="' + item.url + '">' + item.title + '</a>',
          '<p class="card-desc">' + item.desc + '</p>',
          '<div class="card-meta"><span>' + item.category + '</span><span>' + item.type + '</span></div>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");
    };
    render(window.MOVIE_SEARCH_INDEX.slice(0, 24));
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) {
        render(window.MOVIE_SEARCH_INDEX.slice(0, 24));
        return;
      }
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.text.indexOf(q) !== -1;
      });
      render(matched);
    });
  }
})();

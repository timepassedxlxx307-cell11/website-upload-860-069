(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    function normalText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupGlobalSearch(input) {
        var suggest = input.parentElement.querySelector('[data-search-suggest]');

        if (!suggest || !Array.isArray(window.SEARCH_MOVIES)) {
            return;
        }

        input.addEventListener('input', function () {
            var keyword = normalText(input.value);

            if (!keyword) {
                suggest.classList.remove('is-open');
                suggest.innerHTML = '';
                return;
            }

            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return normalText(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre).indexOf(keyword) !== -1;
            }).slice(0, 6);

            suggest.innerHTML = matched.map(function (movie) {
                return '<a href="' + movie.url + '"><img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '"><span><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</span></span></a>';
            }).join('');

            suggest.classList.toggle('is-open', matched.length > 0);
        });

        document.addEventListener('click', function (event) {
            if (!input.parentElement.contains(event.target)) {
                suggest.classList.remove('is-open');
            }
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-global-search]'), setupGlobalSearch);

    Array.prototype.forEach.call(document.querySelectorAll('[data-filter-panel]'), function (panel) {
        var searchInput = panel.querySelector('[data-card-search]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var grid = panel.parentElement.querySelector('[data-card-grid]');

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        function applyFilter() {
            var keyword = normalText(searchInput ? searchInput.value : '');
            var type = normalText(typeSelect ? typeSelect.value : '');
            var region = normalText(regionSelect ? regionSelect.value : '');
            var year = normalText(yearSelect ? yearSelect.value : '');

            cards.forEach(function (card) {
                var haystack = normalText([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));

                var ok = true;
                ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
                ok = ok && (!type || normalText(card.getAttribute('data-type')) === type);
                ok = ok && (!region || normalText(card.getAttribute('data-region')) === region);
                ok = ok && (!year || normalText(card.getAttribute('data-year')) === year);

                card.classList.toggle('is-hidden', !ok);
            });
        }

        [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && searchInput) {
            searchInput.value = query;
            applyFilter();
        }
    });
})();

function setupMoviePlayer(sourceUrl) {
    var video = document.getElementById('movie-player');
    var shell = document.querySelector('.player-shell');
    var playButton = document.querySelector('[data-play-button]');
    var attached = false;
    var hlsInstance = null;

    if (!video || !shell || !playButton || !sourceUrl) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        attached = true;
    }

    function startPlay() {
        attachSource();
        shell.classList.add('is-playing');
        video.controls = true;

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    playButton.addEventListener('click', startPlay);
    video.addEventListener('click', function () {
        if (!attached) {
            startPlay();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
}

(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var startTimer = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        var resetTimer = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        };

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                resetTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                resetTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                resetTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    filterForms.forEach(function (scope) {
        var keywordInput = scope.querySelector('[data-filter-keyword]');
        var categorySelect = scope.querySelector('[data-filter-category]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var empty = scope.querySelector('[data-filter-empty]');

        var applyFilter = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedCategory = !category || card.getAttribute('data-category') === category;
                var matchedYear = !year || card.getAttribute('data-year') === year;
                var matched = matchedKeyword && matchedCategory && matchedYear;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        };

        [keywordInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    var searchMount = document.querySelector('[data-search-results]');

    if (searchMount && window.MOVIE_SEARCH_DATA) {
        var searchInput = document.querySelector('[data-search-page-input]');
        var searchForm = document.querySelector('[data-search-page-form]');
        var resultNote = document.querySelector('[data-search-result-note]');
        var emptySearch = document.querySelector('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';

        if (searchInput) {
            searchInput.value = queryFromUrl;
        }

        var renderResults = function (query) {
            var normalized = (query || '').trim().toLowerCase();
            var data = window.MOVIE_SEARCH_DATA;
            var results = data.filter(function (movie) {
                if (!normalized) {
                    return true;
                }

                return [movie.title, movie.category, movie.year, movie.region, movie.genre, movie.tags, movie.oneLine]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(normalized) !== -1;
            }).slice(0, 160);

            searchMount.innerHTML = results.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="movie-cover" href="' + movie.link + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<span class="cover-shade"></span>',
                    '<span class="play-mark"></span>',
                    '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
                    '</a>',
                    '<div class="movie-info">',
                    '<a href="' + movie.link + '" class="movie-title">' + escapeHtml(movie.title) + '</a>',
                    '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="movie-meta">',
                    '<span>' + escapeHtml(movie.category) + '</span>',
                    '<span>' + escapeHtml(movie.region) + '</span>',
                    '</div>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');

            if (resultNote) {
                resultNote.textContent = normalized ? '搜索结果' : '全部影片推荐';
            }

            if (emptySearch) {
                emptySearch.style.display = results.length ? 'none' : 'block';
            }
        };

        var submitSearch = function (event) {
            if (event) {
                event.preventDefault();
            }

            var query = searchInput ? searchInput.value : '';
            var url = new URL(window.location.href);

            if (query.trim()) {
                url.searchParams.set('q', query.trim());
            } else {
                url.searchParams.delete('q');
            }

            window.history.replaceState({}, '', url.toString());
            renderResults(query);
        };

        if (searchForm) {
            searchForm.addEventListener('submit', submitSearch);
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                renderResults(searchInput.value);
            });
        }

        renderResults(queryFromUrl);
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('[data-player-video]');
        var overlay = player.querySelector('[data-player-overlay]');
        var source = video ? video.getAttribute('data-source') : '';

        var initializeVideo = function () {
            if (!video || !source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                window.currentHlsPlayer = hls;
            } else {
                video.src = source;
            }
        };

        var togglePlayback = function () {
            if (!video) {
                return;
            }

            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        };

        initializeVideo();

        if (overlay) {
            overlay.addEventListener('click', togglePlayback);
        }

        if (video) {
            video.addEventListener('click', togglePlayback);
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();

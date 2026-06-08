(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    qsa('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = './search.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var slider = qs('[data-hero-slider]');
    if (slider) {
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (slides.length) {
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(parseInt(dot.getAttribute('data-hero-dot'), 10));
                    play();
                });
            });
            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    play();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    play();
                });
            }
            play();
        }
    }

    qsa('[data-filter-panel]').forEach(function (panelNode) {
        var keyword = qs('[data-filter-keyword]', panelNode);
        var year = qs('[data-filter-year]', panelNode);
        var type = qs('[data-filter-type]', panelNode);
        var list = qs('[data-filter-list]');
        var empty = qs('[data-empty-state]');
        if (!list) {
            return;
        }
        var cards = qsa('.movie-card', list);

        function applyFilter() {
            var word = keyword ? keyword.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var selectedType = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                var matchWord = !word || haystack.indexOf(word) !== -1;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
                var showCard = matchWord && matchYear && matchType;
                card.style.display = showCard ? '' : 'none';
                if (showCard) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function searchCard(entry) {
        return [
            '<article class="movie-card">',
            '<a class="poster-wrap" href="' + escapeHtml(entry.url) + '" aria-label="' + escapeHtml(entry.title) + '">',
            '<img src="' + escapeHtml(entry.image) + '" alt="' + escapeHtml(entry.title) + '" loading="lazy">',
            '<span class="poster-type">' + escapeHtml(entry.type) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + escapeHtml(entry.url) + '">' + escapeHtml(entry.title) + '</a></h3>',
            '<p>' + escapeHtml(entry.description) + '</p>',
            '<div class="movie-meta">',
            '<span>' + escapeHtml(entry.year) + '</span>',
            '<span>' + escapeHtml(entry.region) + '</span>',
            '<span>' + escapeHtml(entry.genre) + '</span>',
            '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    var searchForm = qs('[data-search-page-form]');
    var searchInput = qs('#searchInput');
    var searchResults = qs('#searchResults');
    var searchStatus = qs('#searchStatus');
    if (searchForm && searchInput && searchResults && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        function renderSearch(query) {
            var value = query.trim().toLowerCase();
            var matches = window.SEARCH_MOVIES.filter(function (entry) {
                if (!value) {
                    return true;
                }
                return entry.search.indexOf(value) !== -1;
            }).slice(0, 120);
            searchResults.innerHTML = matches.map(searchCard).join('');
            if (searchStatus) {
                searchStatus.textContent = value ? '已找到相关影片' : '热门影片推荐';
            }
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearch(searchInput.value);
        });
        searchInput.addEventListener('input', function () {
            renderSearch(searchInput.value);
        });
        renderSearch(initialQuery);
    }
})();

(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function() {
                showSlide(current + 1);
            }, 5000);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var selectFilters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    if (filterInput && cards.length) {
        var initialQuery = getQuery('q');
        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        function applyFilters() {
            var keyword = normalize(filterInput.value);
            var selected = {};
            selectFilters.forEach(function(select) {
                selected[select.getAttribute('data-filter-select')] = normalize(select.value);
            });

            cards.forEach(function(card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var visible = !keyword || text.indexOf(keyword) !== -1;

                Object.keys(selected).forEach(function(key) {
                    var value = selected[key];
                    if (!value) {
                        return;
                    }
                    var attr = normalize(card.getAttribute('data-' + key));
                    if (key === 'type') {
                        visible = visible && attr.indexOf(value) !== -1;
                    } else if (key === 'year') {
                        visible = visible && attr === value;
                    } else {
                        visible = visible && attr === value;
                    }
                });

                card.classList.toggle('is-hidden', !visible);
            });
        }

        filterInput.addEventListener('input', applyFilters);
        selectFilters.forEach(function(select) {
            select.addEventListener('change', applyFilters);
        });
        applyFilters();
    }

    function preparePlayer(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var url = player.getAttribute('data-hls');
        var ready = false;

        function attach() {
            if (ready || !video || !url) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                player.hlsInstance = hls;
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function() {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function() {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(preparePlayer);
})();

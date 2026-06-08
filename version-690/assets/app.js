(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            slides[index].classList.remove('is-active');
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add('is-active');
        }

        function play() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function reset() {
            window.clearInterval(timer);
            play();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                reset();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                reset();
            });
        }

        play();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-search-list]');
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var activeCategory = 'all';

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
        if (!list) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : '');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-category')
            ].join(' ').toLowerCase();

            var category = card.getAttribute('data-category') || '';
            var matchText = !query || text.indexOf(query) !== -1;
            var matchCategory = activeCategory === 'all' || category === activeCategory;
            card.style.display = matchText && matchCategory ? '' : 'none';
        });
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        filterInput.addEventListener('input', applyFilter);
    }

    categoryButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            categoryButtons.forEach(function (item) {
                item.classList.remove('is-active');
            });

            button.classList.add('is-active');
            activeCategory = button.getAttribute('data-filter-category') || 'all';
            applyFilter();
        });
    });

    applyFilter();

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('.play-button');
        var streamUrl = video ? video.getAttribute('data-stream-url') : '';
        var hlsInstance;
        var attached = false;

        function attachStream() {
            if (!video || !streamUrl || attached) {
                return;
            }

            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    maxBufferLength: 30
                });

                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            attachStream();
            player.classList.add('is-playing');

            if (video) {
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    player.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }
}());

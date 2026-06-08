(function () {
    window.setupStreamPlayer = function (stream, videoSelector, buttonSelector) {
        var video = document.querySelector(videoSelector);
        var button = document.querySelector(buttonSelector);
        if (!video || !button || !stream) {
            return;
        }
        var ready = false;
        var hls = null;

        function start() {
            button.classList.add('is-hidden');
            video.controls = true;
            if (ready) {
                video.play().catch(function () {});
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = stream;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!ready) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('emptied', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();

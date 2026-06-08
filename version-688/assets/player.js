(function () {
  function initPlayer() {
    var video = document.getElementById('moviePlayer');
    if (!video) {
      return;
    }
    var src = video.getAttribute('src');
    var cover = document.querySelector('[data-play-button]');
    var hlsInstance = null;

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function playVideo() {
      hideCover();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (src && window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    } else if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', hideCover);
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initPlayer);
}());

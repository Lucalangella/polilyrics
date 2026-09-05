/**
 * YouTube IFrame Player API Controller
 * Configures playsinline: 1, modestbranding: 1
 * Implements 250ms polling interval during playback for synchronized lyrics.
 */

class YouTubePlayerController {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.pollIntervalId = null;
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    this.currentVideoId = 'f-r2L0qO7yM';

    // Callbacks
    this.onTimeUpdateCallbacks = new Set();
    this.onStateChangeCallbacks = new Set();
    this.onReadyCallbacks = new Set();
    this.onErrorCallbacks = new Set();

    // Fallback simulation timer for testing/sandboxed environments
    this.isSimulationMode = false;
    this.simulationIntervalId = null;
  }

  /**
   * Initializes the YouTube IFrame API and creates the player
   * @param {string} containerId - DOM ID of the element to replace with the iframe
   * @param {string} videoId - Default YouTube video ID ("f-r2L0qO7yM")
   */
  init(containerId = 'youtube-player', videoId = 'f-r2L0qO7yM') {
    this.currentVideoId = videoId;

    return new Promise((resolve) => {
      const onApiLoaded = () => {
        this.createPlayer(containerId, videoId)
          .then(() => resolve(this.player))
          .catch(() => {
            console.warn('YouTube Player initialization failed, falling back to simulated playback.');
            this.enableSimulationMode();
            resolve(null);
          });
      };

      if (window.YT && window.YT.Player) {
        onApiLoaded();
      } else {
        const existingScript = document.getElementById('yt-iframe-api-script');
        if (!existingScript) {
          const tag = document.createElement('script');
          tag.id = 'yt-iframe-api-script';
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const prevReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (typeof prevReady === 'function') prevReady();
          onApiLoaded();
        };

        // Safety timeout: if YouTube API cannot load in 5 seconds (e.g. offline/sandboxed), enable fallback
        setTimeout(() => {
          if (!this.isReady && !this.player) {
            console.info('YouTube API load timeout. Providing interactive playback mode.');
            this.enableSimulationMode();
            resolve(null);
          }
        }, 5000);
      }
    });
  }

  /**
   * Instantiates YT.Player with playsinline: 1, modestbranding: 1
   */
  createPlayer(containerId, videoId) {
    return new Promise((resolve, reject) => {
      try {
        this.player = new window.YT.Player(containerId, {
          videoId: videoId,
          playerVars: {
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            fs: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              this.isReady = true;
              try {
                this.duration = this.player.getDuration() || 180;
              } catch {
                this.duration = 180;
              }
              this.triggerReady(event);
              resolve(this.player);
            },
            onStateChange: (event) => {
              this.handleStateChange(event.data);
            },
            onError: (event) => {
              console.warn('YouTube Player reported error:', event.data);
              this.triggerError(event.data);
              // Video may be geo-restricted or unavailable, enable simulation
              this.enableSimulationMode();
            }
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  handleStateChange(state) {
    // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
    if (state === 1) {
      this.isPlaying = true;
      this.startPolling();
    } else {
      this.isPlaying = false;
      this.stopPolling();
    }

    for (const cb of this.onStateChangeCallbacks) {
      try {
        cb(state, this.isPlaying);
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Real-Time Synchronization Polling:
   * Polls the video timestamp every 250ms while playing to detect current line.
   */
  startPolling() {
    this.stopPolling();
    this.pollIntervalId = setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        try {
          const time = this.player.getCurrentTime();
          this.currentTime = time;

          if (typeof this.player.getDuration === 'function') {
            const dur = this.player.getDuration();
            if (dur > 0 && dur !== this.duration) {
              this.duration = dur;
            }
          }

          this.triggerTimeUpdate(time);
        } catch (e) {
          // ignore transient iframe read errors
        }
      }
    }, 50);
  }

  stopPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  /**
   * Interactive Seeking:
   * Commands YouTube player to seekTo(line.start, true)
   * @param {number} seconds - Target timestamp
   * @param {boolean} allowSeekAhead - True to allow buffering ahead
   */
  seekTo(seconds, allowSeekAhead = true) {
    const target = Math.max(0, seconds);
    this.currentTime = target;

    if (this.player && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(target, allowSeekAhead);
      } catch (err) {
        console.warn('seekTo error:', err);
      }
    }

    if (this.isSimulationMode) {
      this.currentTime = target;
    }

    // Immediately trigger time update for rapid UI response
    this.triggerTimeUpdate(target);
  }

  play() {
    if (this.isSimulationMode) {
      this.startSimulationPlay();
      return;
    }
    if (this.player && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  pause() {
    if (this.isSimulationMode) {
      this.pauseSimulation();
      return;
    }
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setPlaybackRate(rate) {
    if (this.player && typeof this.player.setPlaybackRate === 'function') {
      try {
        this.player.setPlaybackRate(rate);
      } catch (err) {
        console.warn(err);
      }
    }
  }

  setVolume(volume) {
    const vol = Math.max(0, Math.min(100, Math.round(volume)));
    if (this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(vol);
      } catch (err) {
        console.warn('setVolume error:', err);
      }
    }
  }

  getVolume() {
    if (this.player && typeof this.player.getVolume === 'function') {
      try {
        return this.player.getVolume();
      } catch {
        return 100;
      }
    }
    return 100;
  }

  mute() {
    if (this.player && typeof this.player.mute === 'function') {
      try {
        this.player.mute();
      } catch (err) {
        console.warn('mute error:', err);
      }
    }
  }

  unMute() {
    if (this.player && typeof this.player.unMute === 'function') {
      try {
        this.player.unMute();
      } catch (err) {
        console.warn('unMute error:', err);
      }
    }
  }

  isMuted() {
    if (this.player && typeof this.player.isMuted === 'function') {
      try {
        return this.player.isMuted();
      } catch {
        return false;
      }
    }
    return false;
  }

  loadVideo(videoId) {
    this.currentVideoId = videoId;
    this.stopPolling();
    this.pauseSimulation();

    if (this.player && typeof this.player.loadVideoById === 'function') {
      try {
        this.player.loadVideoById(videoId);
      } catch (err) {
        console.warn(err);
      }
    }
  }

  getCurrentTime() {
    if (this.player && typeof this.player.getCurrentTime === 'function') {
      try {
        return this.player.getCurrentTime();
      } catch {
        return this.currentTime;
      }
    }
    return this.currentTime;
  }

  getDuration() {
    if (this.player && typeof this.player.getDuration === 'function') {
      try {
        const d = this.player.getDuration();
        if (d > 0) return d;
      } catch {
        return this.duration;
      }
    }
    return this.duration || 180;
  }

  /**
   * Interactive fallback mode if YouTube video is unavailable or restricted
   */
  enableSimulationMode() {
    if (this.isSimulationMode) return;
    this.isSimulationMode = true;
    this.isReady = true;
    this.duration = 180;
    this.triggerReady();
  }

  startSimulationPlay() {
    this.isPlaying = true;
    this.handleStateChange(1);
    if (this.simulationIntervalId) clearInterval(this.simulationIntervalId);
    this.simulationIntervalId = setInterval(() => {
      this.currentTime += 0.25;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0;
        this.pause();
      }
      this.triggerTimeUpdate(this.currentTime);
    }, 250);
  }

  pauseSimulation() {
    this.isPlaying = false;
    this.handleStateChange(2);
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }
  }

  // Event Subscription
  onTimeUpdate(cb) {
    this.onTimeUpdateCallbacks.add(cb);
    return () => this.onTimeUpdateCallbacks.delete(cb);
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  onReady(cb) {
    this.onReadyCallbacks.add(cb);
    if (this.isReady) cb();
    return () => this.onReadyCallbacks.delete(cb);
  }

  onError(cb) {
    this.onErrorCallbacks.add(cb);
    return () => this.onErrorCallbacks.delete(cb);
  }

  triggerTimeUpdate(time) {
    for (const cb of this.onTimeUpdateCallbacks) {
      try {
        cb(time);
      } catch (e) {
        console.error(e);
      }
    }
  }

  triggerReady(event) {
    for (const cb of this.onReadyCallbacks) {
      try {
        cb(event);
      } catch (e) {
        console.error(e);
      }
    }
  }

  triggerError(code) {
    for (const cb of this.onErrorCallbacks) {
      try {
        cb(code);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export const playerController = new YouTubePlayerController();

/**
 * Lyricist - Main Application Logic
 * Integrates YouTube IFrame Player API, real-time 250ms lyrics polling,
 * interactive seeking, auto language routing, universal song search via LRCLIB,
 * dynamic translation, and PWA registration.
 */

import { registerSW } from 'virtual:pwa-register';
import { languageRouter, SUPPORTED_LANGUAGES } from './language-router.js';
import {
  getAllTracks,
  registerDynamicTrack,
  getSynchronizedLyrics,
  getTrackMeta,
  updateTrackTranslations
} from './lyrics-data.js';
import {
  searchLrclib,
  getLrclibExact,
  parseArtistAndTitle,
  pickBestLrcResult,
  parseLrc,
  parsePlainTextToCadence,
  extractYouTubeId,
  fetchYouTubeSuggestions,
  fetchYouTubeTitle,
  searchYouTubeVideoId,
  searchYouTubeVideos
} from './lyrics-service.js';
import { translationService } from './translation-service.js';
import { playerController } from './player.js';
import { FAMOUS_SONGS } from './famous-songs.js';

// Expose language router utility reading navigator.language with in-memory / localStorage overrides
export { languageRouter };

// Curated dictionary for instantaneous YouTube ID matching for iconic popular songs
const POPULAR_VIDEO_IDS = {
  'yellow': 'yKNxeF4KMsY',
  'coldplay yellow': 'yKNxeF4KMsY',
  'coldplay - yellow': 'yKNxeF4KMsY',
  'fix you': 'k4V3Mo61fJM',
  'coldplay fix you': 'k4V3Mo61fJM',
  'coldplay - fix you': 'k4V3Mo61fJM',
  'the scientist': 'RB-RcX5DS5A',
  'coldplay the scientist': 'RB-RcX5DS5A',
  'coldplay - the scientist': 'RB-RcX5DS5A',
  'viva la vida': 'dvgZkm1xWPE',
  'coldplay viva la vida': 'dvgZkm1xWPE',
  'coldplay - viva la vida': 'dvgZkm1xWPE',
  'a sky full of stars': 'VPRjCeoBqrI',
  'coldplay a sky full of stars': 'VPRjCeoBqrI',
  'hello': 'YQHsXMglC9A',
  'adele hello': 'YQHsXMglC9A',
  'adele - hello': 'YQHsXMglC9A',
  'rolling in the deep': 'rYEDA3JcQqw',
  'adele rolling in the deep': 'rYEDA3JcQqw',
  'someone like you': 'hLQl3WQQoQ0',
  'adele someone like you': 'hLQl3WQQoQ0',
  'easy on me': 'U3ASj1L6_sY',
  'adele easy on me': 'U3ASj1L6_sY',
  'despacito': 'kJQP7kiw5Fk',
  'luis fonsi despacito': 'kJQP7kiw5Fk',
  'luis fonsi - despacito': 'kJQP7kiw5Fk',
  'papaoutai': 'oiKj0Z_Xnjc',
  'stromae papaoutai': 'oiKj0Z_Xnjc',
  'stromae - papaoutai': 'oiKj0Z_Xnjc',
  'tous les memes': 'CAMWdvo71ls',
  'tous les mêmes': 'CAMWdvo71ls',
  'stromae tous les memes': 'CAMWdvo71ls',
  'formidable': 'S_xH7noaqTA',
  'stromae formidable': 'S_xH7noaqTA',
  'never gonna give you up': 'dQw4w9WgXcQ',
  'rick astley never gonna give you up': 'dQw4w9WgXcQ',
  'rick astley - never gonna give you up': 'dQw4w9WgXcQ',
  'con te partiro': '4L_yCwFD6Jo',
  'con te partirò': '4L_yCwFD6Jo',
  'andrea bocelli con te partiro': '4L_yCwFD6Jo',
  'andrea bocelli - con te partirò': '4L_yCwFD6Jo',
  'derniere danse': 'K5KAc5CoCuk',
  'dernière danse': 'K5KAc5CoCuk',
  'indila derniere danse': 'K5KAc5CoCuk',
  'indila - dernière danse': 'K5KAc5CoCuk',
  'sofia': 'qaZ0oAh4evU',
  'alvaro soler sofia': 'qaZ0oAh4evU',
  'alvaro soler - sofia': 'qaZ0oAh4evU',
  'el mismo sol': 'aNHwNreDp3A',
  'alvaro soler el mismo sol': 'aNHwNreDp3A',
  'bohemian rhapsody': 'fJ9rUzIMcZQ',
  'queen bohemian rhapsody': 'fJ9rUzIMcZQ',
  'queen - bohemian rhapsody': 'fJ9rUzIMcZQ',
  'shape of you': 'JGwWNGJdvx8',
  'ed sheeran shape of you': 'JGwWNGJdvx8',
  'ed sheeran - shape of you': 'JGwWNGJdvx8',
  'perfect': '2Vv-BfVoq4g',
  'ed sheeran perfect': '2Vv-BfVoq4g',
  'blinding lights': '4NRXx6U8ABQ',
  'the weeknd blinding lights': '4NRXx6U8ABQ',
  'levitating': 'TUVcZfQe-Kw',
  'dua lipa levitating': 'TUVcZfQe-Kw',
  'dont start now': 'oygrmJFKYZY',
  'bad guy': 'DyDfgMOUjCI',
  'billie eilish bad guy': 'DyDfgMOUjCI',
  'believer': '7wtfhZwyrcc',
  'imagine dragons believer': '7wtfhZwyrcc',
  'billie jean': 'Zi_XLORVoHY',
  'michael jackson billie jean': 'Zi_XLORVoHY',
  'get lucky': '5NV6Rdv1a3w',
  'daft punk get lucky': '5NV6Rdv1a3w',
  'beggin': 'yOb9Xaug35M',
  'maneskin veggin': 'yOb9Xaug35M',
  'zitti e buoni': 'QN1odfjtMoo',
  'maneskin zitti e buoni': 'QN1odfjtMoo'
};

// Application State
let currentTrackId = null; // No preloaded default video; starts on search landing view
let isPlayerInitialized = false;
let currentLyrics = [];
let currentActiveIndex = -1;
let autoScrollEnabled = true;
let playbackSpeeds = [0.75, 0.85, 1.0, 1.25];
let currentSpeedIndex = 2; // 1.0x
let currentScale = 1.0;
let userScrollTimeout = null;

// Layout & View Containers
const appLayout = document.getElementById('app');
const heroSearchLanding = document.getElementById('hero-search-landing');
const mainContainer = document.getElementById('main-container');

// Hero Search Landing Elements
const heroSearchForm = document.getElementById('hero-search-form');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchClear = document.getElementById('hero-search-clear');
const heroSearchSubmit = document.querySelector('.hero-search-submit');
const heroSuggestionsDropdown = document.getElementById('hero-suggestions-dropdown');

// DOM Elements
const languageSelect = document.getElementById('language-select');
const detectedBadge = document.getElementById('detected-badge');
const lyricsContainer = document.getElementById('lyrics-scroll-container');
const lyricsList = document.getElementById('lyrics-list');
const lineCounter = document.getElementById('line-counter');
const lyricsSearch = document.getElementById('lyrics-search');
const searchClearBtn = document.getElementById('search-clear');
const btnPlayPause = document.getElementById('btn-play-pause');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const btnPrevLine = document.getElementById('btn-prev-line');
const btnNextLine = document.getElementById('btn-next-line');
const btnRepeatLine = document.getElementById('btn-repeat-line');
const btnSpeed = document.getElementById('btn-speed');
const btnAutoScroll = document.getElementById('btn-autoscroll');
const btnFontDec = document.getElementById('btn-font-dec');
const btnFontInc = document.getElementById('btn-font-inc');
const currentTimeTxt = document.getElementById('current-time-txt');
const durationTimeTxt = document.getElementById('duration-time-txt');
const songTitleEl = document.getElementById('song-title');
const songArtistEl = document.getElementById('song-artist');
const activeLinePill = document.getElementById('active-line-pill');
const pillOriginal = document.getElementById('pill-original-text');
const pillTranslated = document.getElementById('pill-translated-text');
const playerOverlay = document.getElementById('player-overlay');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

// YouTube-Style Prominent Search Bar Elements
const ytSearchContainer = document.getElementById('yt-search-container');
const ytSearchForm = document.getElementById('yt-search-form');
const ytSearchInput = document.getElementById('yt-search-input');
const ytSearchClear = document.getElementById('yt-search-clear');
const ytSearchSubmit = document.getElementById('yt-search-submit');
const ytSuggestionsDropdown = document.getElementById('yt-suggestions-dropdown');

// YouTube Video Results Modal Elements
const ytResultsModal = document.getElementById('yt-results-modal');
const ytResultsTitle = document.getElementById('yt-results-title');
const ytResultsSubtitle = document.getElementById('yt-results-subtitle');
const ytResultsClose = document.getElementById('yt-results-close');
const ytResultsLoading = document.getElementById('yt-results-loading');
const ytResultsList = document.getElementById('yt-results-list');

// Word details modal elements
const wordModal = document.getElementById('word-modal');
const modalWordTitle = document.getElementById('modal-word-title');
const modalWordMeaning = document.getElementById('modal-word-meaning');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalPronounceBtn = document.getElementById('modal-pronounce-btn');

// Sync Offset Calibration State (Option 1 + Option 2)
let currentSyncOffset = 0.0; // Seconds offset (positive = video intro/delay, negative = video ahead)
let activeSyncStep = 0.1; // Default step resolution: 0.1s (0.1s | 1.0s | 5.0s)
const syncOffsetVal = document.getElementById('sync-offset-val');
const btnSyncSub = document.getElementById('btn-sync-sub');
const btnSyncAdd = document.getElementById('btn-sync-add');
const btnSyncReset = document.getElementById('btn-sync-reset');
const btnToggleSyncSlider = document.getElementById('btn-toggle-sync-slider');

// Inline Scrubber Slider Drawer Elements (Option 2)
const syncScrubberDrawer = document.getElementById('sync-scrubber-drawer');
const syncScrubberSlider = document.getElementById('sync-scrubber-slider');
const syncScrubberReadout = document.getElementById('sync-scrubber-readout');
const btnScrubberClose = document.getElementById('btn-scrubber-close');
const btnScrubberReset = document.getElementById('btn-scrubber-reset');
const btnScrubberHeaderReset = document.getElementById('btn-scrubber-header-reset');
const syncSliderBadge = document.getElementById('sync-slider-badge');

/**
 * View Management: Landing View vs Player View
 */
function showLandingSearch() {
  if (appLayout) appLayout.classList.add('landing-mode');
  if (heroSearchLanding) heroSearchLanding.classList.remove('hidden');
  if (mainContainer) mainContainer.classList.add('hidden');
  if (playerController) playerController.pause();
  if (heroSearchInput) {
    setTimeout(() => {
      heroSearchInput.focus();
    }, 50);
  }
}

function returnToLandingSearch() {
  showLandingSearch();
  try {
    localStorage.removeItem('polilyrics_last_track');
    const url = new URL(window.location.href);
    url.searchParams.delete('v');
    url.searchParams.delete('track');
    window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
  } catch {}
}

// Full Screen Lyrics State
let isLyricsFullscreen = false;

export function toggleLyricsFullscreen(force) {
  if (!mainContainer) return;
  isLyricsFullscreen = typeof force === 'boolean' ? force : !isLyricsFullscreen;
  mainContainer.classList.toggle('lyrics-fullscreen', isLyricsFullscreen);

  const btn = document.getElementById('btn-expand-lyrics');
  if (btn) {
    btn.classList.toggle('active', isLyricsFullscreen);
    const iconExpand = btn.querySelector('.icon-expand');
    const iconCollapse = btn.querySelector('.icon-collapse');
    const btnText = btn.querySelector('.expand-btn-text');

    if (iconExpand) iconExpand.classList.toggle('hidden', isLyricsFullscreen);
    if (iconCollapse) iconCollapse.classList.toggle('hidden', !isLyricsFullscreen);
    if (btnText) btnText.textContent = isLyricsFullscreen ? 'Exit Full Screen' : 'Full Screen';
    btn.title = isLyricsFullscreen ? 'Exit full screen (return to split view) [F]' : 'Expand lyrics to full screen [F]';
  }

  // Scroll active lyric smoothly into view
  if (currentActiveIndex >= 0) {
    scrollToActiveLine(currentActiveIndex, 'smooth');
  }
}

function initBottomScrubber() {
  const track = document.getElementById('bottom-progress-track');
  if (!track) return;

  track.addEventListener('click', (e) => {
    const dur = playerController ? playerController.getDuration() : 0;
    if (!dur || dur <= 0) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = ratio * dur;
    playerController.seekTo(targetTime, true);
  });
}

function initViewModeSelector() {
  const btnExpand = document.getElementById('btn-expand-lyrics');
  if (btnExpand) {
    btnExpand.addEventListener('click', () => toggleLyricsFullscreen());
  }

  initBottomScrubber();
}

function showPlayerView() {
  if (appLayout) appLayout.classList.remove('landing-mode');
  if (heroSearchLanding) heroSearchLanding.classList.add('hidden');
  if (mainContainer) {
    mainContainer.classList.remove('hidden');
  }
}

let toastTimeout = null;
function showToast(msg) {
  let toast = document.getElementById('sync-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sync-toast';
    toast.className = 'sync-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2500);
}

function loadSyncOffsetForTrack(trackId) {
  try {
    const saved = localStorage.getItem(`lingobeats_offset_${trackId}`);
    if (saved !== null) {
      const val = parseFloat(saved);
      if (!isNaN(val)) {
        setSyncOffset(val, false);
        return;
      }
    }
  } catch {
    // ignore
  }
  setSyncOffset(0.0, false);
}

function updateSyncDrawerUI() {
  const sign = currentSyncOffset > 0 ? '+' : '';
  const formatted = `${sign}${currentSyncOffset.toFixed(1)}s`;
  if (syncScrubberReadout) {
    syncScrubberReadout.textContent = formatted;
  }
  if (syncSliderBadge) {
    syncSliderBadge.textContent = formatted;
  }
  if (syncScrubberSlider) {
    syncScrubberSlider.value = Math.max(-30, Math.min(30, currentSyncOffset));
  }
}

function setSyncOffset(val, persist = true) {
  currentSyncOffset = Math.round(val * 10) / 10;
  const sign = currentSyncOffset > 0 ? '+' : '';
  const formatted = `${sign}${currentSyncOffset.toFixed(1)}s`;
  if (syncOffsetVal) {
    syncOffsetVal.textContent = formatted;
    syncOffsetVal.classList.remove('positive', 'negative');
    if (currentSyncOffset > 0) syncOffsetVal.classList.add('positive');
    else if (currentSyncOffset < 0) syncOffsetVal.classList.add('negative');
  }
  if (syncSliderBadge) {
    syncSliderBadge.textContent = formatted;
    syncSliderBadge.classList.remove('positive', 'negative');
    if (currentSyncOffset > 0) syncSliderBadge.classList.add('positive');
    else if (currentSyncOffset < 0) syncSliderBadge.classList.add('negative');
  }

  updateSyncDrawerUI();

  if (persist && currentTrackId) {
    try {
      localStorage.setItem(`lingobeats_offset_${currentTrackId}`, currentSyncOffset.toString());
    } catch {
      // ignore
    }
  }

  // Immediately re-evaluate active lyric
  if (playerController) {
    const time = playerController.getCurrentTime();
    onPlayerTimeUpdate(time);
  }
}

function calibrateSyncToLine(lineStart) {
  const videoTime = playerController ? playerController.getCurrentTime() : 0;
  const newOffset = Math.round((videoTime - lineStart) * 10) / 10;
  setSyncOffset(newOffset, true);
  const sign = newOffset >= 0 ? '+' : '';
  showToast(`🎯 Line anchored! Sync set to ${sign}${newOffset.toFixed(1)}s`);
}

function parseDurationText(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return 0;
}


/**
 * Format seconds to mm:ss
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Initialize Language Selector and Routing
 */
function initLanguageRouting() {
  const currentLang = languageRouter.getCurrentLanguage();

  languageSelect.innerHTML = SUPPORTED_LANGUAGES.map((lang) => {
    return `<option value="${lang.code}">${lang.flag} ${lang.name}</option>`;
  }).join('');

  languageSelect.value = currentLang;
  updateDetectedBadge();

  languageSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    languageRouter.setLanguage(selected, true);
    updateDetectedBadge();
  });

  languageRouter.subscribe((newLang) => {
    languageSelect.value = newLang;
    updateDetectedBadge();
    reloadLyrics();
  });
}

function updateDetectedBadge() {
  if (!detectedBadge) return;
  if (languageRouter.isAutoDetected()) {
    detectedBadge.classList.remove('hidden');
    detectedBadge.title = `Auto-detected from browser: ${languageRouter.getCurrentLanguage().toUpperCase()}`;
  } else {
    detectedBadge.classList.add('hidden');
  }
}

/**
 * Initialize Track Selection
 */
function initTrackSelection() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const trackParam = urlParams.get('v') || urlParams.get('track');
    const savedTrack = localStorage.getItem('polilyrics_last_track');
    const targetId = trackParam || savedTrack;

    if (targetId) {
      const meta = getTrackMeta(targetId);
      if (meta && meta.id === targetId) {
        currentTrackId = targetId;
        // Keep URL synchronized
        const url = new URL(window.location.href);
        if (url.searchParams.get('v') !== targetId) {
          url.searchParams.set('v', targetId);
          window.history.replaceState({ trackId: targetId }, '', url.toString());
        }
      }
    }
  } catch {}

  if (currentTrackId) {
    updateTrackInfo();
  }
}

function updateTrackInfo() {
  if (!currentTrackId) return;
  const meta = getTrackMeta(currentTrackId);
  songTitleEl.textContent = meta.title;
  songArtistEl.textContent = meta.artist;
}

let currentLyricsLoadId = 0;

/**
 * Immediately clears old track lyrics and displays a clean loading state in the lyrics panel
 * so users never see the previous song's lyrics while waiting for a new track.
 */
function showLyricsLoading(trackTitle = '', subtitle = '') {
  currentLyrics = [];
  currentActiveIndex = -1;
  if (activeLinePill) activeLinePill.classList.add('hidden');
  if (lineCounter) lineCounter.textContent = '- / -';
  const progressFill = document.getElementById('bottom-progress-fill');
  if (progressFill) progressFill.style.width = '0%';

  if (lyricsList) {
    const escapedTitle = trackTitle ? escapeHtml(trackTitle) : '';
    lyricsList.innerHTML = `
      <div class="lyrics-loading-state" role="status" aria-live="polite">
        <div class="spinner"></div>
        <p class="lyrics-loading-title">Loading lyrics${escapedTitle ? ` for <span class="lyrics-loading-title-song">"${escapedTitle}"</span>` : ''}...</p>
        <p class="lyrics-loading-sub">${subtitle ? escapeHtml(subtitle) : 'Fetching synchronized lines & translation...'}</p>
      </div>
    `;
  }
  if (lyricsContainer) {
    lyricsContainer.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function updateLyricsLoadingProgress(message) {
  if (!lyricsList) return;
  const sub = lyricsList.querySelector('.lyrics-loading-sub');
  if (sub) {
    sub.textContent = message;
  }
}

let currentTranslationRequestId = 0;

/**
 * Load and Render Synchronized Lyrics
 * Dynamically switches translation language without interrupting ongoing playback.
 * If translations for the chosen language are already cached, rows update immediately in place.
 * If not yet translated, fetches neural translations in background and updates visible text in place.
 */
async function reloadLyrics() {
  if (!currentTrackId) return;
  const targetLang = languageRouter.getCurrentLanguage();
  const track = getAllTracks().find((t) => t.id === currentTrackId);
  if (!track || !Array.isArray(track.lyrics) || track.lyrics.length === 0) return;

  const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
  const targetLangName = targetLangObj ? targetLangObj.name : targetLang.toUpperCase();

  // 1. Check if all lines already have the target translation
  const isTargetSameAsSource = track.sourceLanguage && track.sourceLanguage === targetLang;
  const hasCachedTranslation = track.lyrics.every(
    (l) => (l.translations && l.translations[targetLang]) || isTargetSameAsSource
  );

  if (hasCachedTranslation) {
    currentLyrics = getSynchronizedLyrics(currentTrackId, targetLang);

    // If DOM already contains rows matching length, update translated text in place
    // This guarantees video playback is uninterrupted, active line stays active, and no scroll jumps!
    const rows = lyricsList ? lyricsList.querySelectorAll('.lyric-row') : [];
    if (rows.length === currentLyrics.length) {
      currentLyrics.forEach((line, idx) => {
        const transEl = rows[idx]?.querySelector('.lyric-translated');
        if (transEl) transEl.textContent = line.translated;
      });
      if (currentActiveIndex >= 0 && currentLyrics[currentActiveIndex] && pillTranslated) {
        pillTranslated.textContent = currentLyrics[currentActiveIndex].translated;
      }
      return;
    }

    // Otherwise initial render
    currentActiveIndex = -1;
    renderLyrics(currentLyrics);
    updateCounter();
    return;
  }

  // 2. Not yet translated into targetLang!
  // Fallback to currently available text while translating in background so user can still see lines
  currentLyrics = getSynchronizedLyrics(currentTrackId, targetLang);
  const existingRows = lyricsList ? lyricsList.querySelectorAll('.lyric-row') : [];
  if (existingRows.length !== currentLyrics.length) {
    currentActiveIndex = -1;
    renderLyrics(currentLyrics);
    updateCounter();
  }

  const reqId = ++currentTranslationRequestId;
  showToast(`Translating lyrics to ${targetLangName}...`);

  const rawLines = track.lyrics.map((l) => ({
    start: l.start,
    end: l.end,
    original: l.original
  }));

  try {
    const translated = await translationService.translateLines(rawLines, targetLang);
    if (reqId !== currentTranslationRequestId || currentTrackId !== track.id) return;

    updateTrackTranslations(track.id, targetLang, translated);

    // Refresh currentLyrics array with new translation
    currentLyrics = getSynchronizedLyrics(currentTrackId, targetLang);

    // Update in-place in the DOM
    const currentRows = lyricsList ? lyricsList.querySelectorAll('.lyric-row') : [];
    currentLyrics.forEach((line, idx) => {
      const transEl = currentRows[idx]?.querySelector('.lyric-translated');
      if (transEl) transEl.textContent = line.translated;
    });

    if (currentActiveIndex >= 0 && currentLyrics[currentActiveIndex] && pillTranslated) {
      pillTranslated.textContent = currentLyrics[currentActiveIndex].translated;
    }

    showToast(`Lyrics translated to ${targetLangName}!`);
  } catch (err) {
    console.error('Failed to translate lyrics on language switch:', err);
  }
}

/**
 * Renders the lyrics list into the DOM
 */
function renderLyrics(lyrics) {
  lyricsList.innerHTML = '';

  if (!lyrics || lyrics.length === 0) {
    lyricsList.innerHTML = `
      <div class="lyrics-empty-state">
        <p class="lyrics-empty-title">No synchronized lyrics available for this track.</p>
        <p class="lyrics-empty-sub">Audio playback continues. Try searching another version with synchronized LRC lines.</p>
      </div>
    `;
    return;
  }

  lyrics.forEach((line, index) => {
    const row = document.createElement('div');
    row.className = 'lyric-row';
    row.id = `lyric-row-${index}`;
    row.dataset.index = index;
    row.dataset.start = line.start;
    row.dataset.end = line.end;
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `Play line: ${line.original}`);

    // Time tag
    const timeEl = document.createElement('span');
    timeEl.className = 'lyric-time';
    timeEl.textContent = formatTime(line.start);

    // Content container
    const contentEl = document.createElement('div');
    contentEl.className = 'lyric-content';

    // Original lyric line
    const originalEl = document.createElement('div');
    originalEl.className = 'lyric-original';
    originalEl.textContent = line.original;

    // Translated lyric line
    const translatedEl = document.createElement('div');
    translatedEl.className = 'lyric-translated';
    translatedEl.textContent = line.translated;

    contentEl.appendChild(originalEl);
    contentEl.appendChild(translatedEl);

    // Action play indicator icon
    const actionEl = document.createElement('div');
    actionEl.className = 'lyric-action';
    actionEl.innerHTML = `
      <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    `;

    row.appendChild(timeEl);
    row.appendChild(contentEl);
    row.appendChild(actionEl);

    /**
     * Interactive Seeking: Clicking any lyric row must command
     * the YouTube player to seekTo(line.start, true).
     */
    row.addEventListener('click', () => {
      handleSeekToLine(index, line.start);
    });

    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSeekToLine(index, line.start);
      }
    });

    lyricsList.appendChild(row);
  });
}

/**
 * Commands the YouTube Player to seekTo(line.start, true) accounting for sync offset
 */
function handleSeekToLine(index, startTime) {
  const targetTime = Math.max(0, startTime + currentSyncOffset);
  playerController.seekTo(targetTime, true);
  playerController.play();
  setActiveLyric(index, true);
}

/**
 * Real-Time Synchronization Callback:
 * Receives current timestamp and activates corresponding lyric row accounting for sync offset.
 */
function onPlayerTimeUpdate(currentTime) {
  if (currentTimeTxt) currentTimeTxt.textContent = formatTime(currentTime);
  const dur = playerController ? playerController.getDuration() : 0;
  if (dur > 0) {
    if (durationTimeTxt) durationTimeTxt.textContent = formatTime(dur);
    const progressFill = document.getElementById('bottom-progress-fill');
    if (progressFill) {
      const pct = Math.min(100, Math.max(0, (currentTime / dur) * 100));
      progressFill.style.width = `${pct.toFixed(2)}%`;
    }
  }

  if (!currentLyrics || currentLyrics.length === 0) return;

  // Calculate effective timestamp taking sync offset into account
  const effectiveTime = Math.max(0, currentTime - currentSyncOffset);

  // Find active line matching start and end range
  let activeIdx = -1;

  for (let i = 0; i < currentLyrics.length; i++) {
    const line = currentLyrics[i];
    if (effectiveTime >= line.start && effectiveTime < line.end) {
      activeIdx = i;
      break;
    }
  }

  // Fallback: If between lines, find closest previous line
  if (activeIdx === -1 && effectiveTime >= currentLyrics[0].start) {
    for (let i = currentLyrics.length - 1; i >= 0; i--) {
      if (effectiveTime >= currentLyrics[i].start) {
        activeIdx = i;
        break;
      }
    }
  }

  if (activeIdx !== -1 && activeIdx !== currentActiveIndex) {
    setActiveLyric(activeIdx, false);
  }
}

/**
 * Smoothly scrolls active lyric row into center of lyricsContainer without scrolling ancestor containers
 */
function scrollToActiveLine(indexOrRow, behavior = 'smooth') {
  const row = typeof indexOrRow === 'number' ? document.getElementById(`lyric-row-${indexOrRow}`) : indexOrRow;
  if (!row || !lyricsContainer) return;
  const containerRect = lyricsContainer.getBoundingClientRect();
  if (containerRect.height <= 0) return;
  const rowRect = row.getBoundingClientRect();
  const relativeTop = (rowRect.top - containerRect.top) + lyricsContainer.scrollTop;
  const targetScroll = relativeTop - (containerRect.height / 2) + (rowRect.height / 2);
  lyricsContainer.scrollTo({
    top: Math.max(0, targetScroll),
    behavior
  });
}

/**
 * Applies active highlight class and smoothly auto-scrolls into view
 */
function setActiveLyric(index, forcedByUser = false) {
  if (index === currentActiveIndex) return;

  // Remove active highlight from previous row
  if (currentActiveIndex >= 0) {
    const prevRow = document.getElementById(`lyric-row-${currentActiveIndex}`);
    if (prevRow) prevRow.classList.remove('active');
  }

  currentActiveIndex = index;

  if (index >= 0 && index < currentLyrics.length) {
    const activeRow = document.getElementById(`lyric-row-${index}`);
    if (activeRow) {
      // Apply active highlight class
      activeRow.classList.add('active');

      // Smoothly auto-scroll into view if enabled
      if (autoScrollEnabled || forcedByUser) {
        scrollToActiveLine(activeRow, 'smooth');
      }
    }

    // Update floating pill preview
    const activeLine = currentLyrics[index];
    if (activeLine) {
      if (pillOriginal) pillOriginal.textContent = activeLine.original;
      if (pillTranslated) pillTranslated.textContent = activeLine.translated;
      if (activeLinePill) activeLinePill.classList.remove('hidden');
    }

    updateCounter();
  } else {
    if (activeLinePill) activeLinePill.classList.add('hidden');
  }
}

function updateCounter() {
  if (!lineCounter) return;
  const total = currentLyrics ? currentLyrics.length : 0;
  if (total === 0) {
    lineCounter.textContent = '- / -';
    return;
  }
  const current = currentActiveIndex >= 0 ? currentActiveIndex + 1 : 0;
  lineCounter.textContent = `${current} / ${total}`;
}

/**
 * Switch Track
 */
function switchTrack(trackId, pushHistory = true) {
  currentTrackId = trackId;

  try {
    localStorage.setItem('polilyrics_last_track', trackId);
    const url = new URL(window.location.href);
    if (url.searchParams.get('v') !== trackId) {
      url.searchParams.set('v', trackId);
      if (pushHistory) {
        window.history.pushState({ trackId }, '', url.toString());
      } else {
        window.history.replaceState({ trackId }, '', url.toString());
      }
    }
  } catch {}

  showPlayerView();
  loadSyncOffsetForTrack(trackId);
  updateTrackInfo();
  reloadLyrics();
  if (!isPlayerInitialized) {
    initPlayer(trackId, true);
  } else {
    playerController.loadVideo(trackId);
  }
}

/**
 * Add a dynamic track and select it
 */
function addAndSelectTrack(trackData) {
  registerDynamicTrack(trackData);
  switchTrack(trackData.id);
}

/**
 * Universal Song Search Implementation
 */
async function executeUniversalSearch(query) {
  if (!query || !query.trim()) return;

  const trimmed = query.trim();

  // Check if user entered a YouTube link/ID
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    directYtUrl.value = trimmed;
    searchStatusBar.innerHTML = `<span>Detected YouTube ID <code>${ytId}</code>. Enter title or click "Load".</span>`;
    return;
  }

  searchStatusBar.innerHTML = `<span>⏳ Searching LRCLIB for "<strong>${escapeHtml(trimmed)}</strong>"...</span>`;
  searchResultsContainer.innerHTML = '';

  const results = await searchLrclib(trimmed);

  if (!results || results.length === 0) {
    searchStatusBar.innerHTML = `<span>No synced lyrics found for "${escapeHtml(trimmed)}". Try different keywords or paste a YouTube URL below.</span>`;
    return;
  }

  searchStatusBar.innerHTML = `<span>Found ${results.length} songs. Click any track to load:</span>`;

  results.slice(0, 15).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'search-result-item';

    const hasSynced = !!item.syncedLyrics;
    const badgeHtml = hasSynced
      ? `<span class="synced-badge">SYNCED</span>`
      : `<span class="plain-badge">PLAIN</span>`;

    row.innerHTML = `
      <div class="result-info">
        <span class="result-title">${escapeHtml(item.trackName || item.name)}</span>
        <span class="result-artist">${escapeHtml(item.artistName)} ${item.albumName ? `• ${escapeHtml(item.albumName)}` : ''}</span>
      </div>
      <div class="result-badges">
        ${badgeHtml}
        <button class="btn btn-primary btn-xs">Load</button>
      </div>
    `;

    row.addEventListener('click', async () => {
      await loadSongFromSearchResult(item);
    });

    searchResultsContainer.appendChild(row);
  });
}

/**
 * Loads a song selected from LRCLIB search results
 */
async function loadSongFromSearchResult(item) {
  const loadId = ++currentLyricsLoadId;
  const trackName = item.trackName || item.name || 'Unknown Track';
  const artistName = item.artistName || 'Unknown Artist';
  const targetLang = languageRouter.getCurrentLanguage();

  if (playerController) playerController.pause();
  showPlayerView();
  showLyricsLoading(trackName, `Resolving video & lyrics for "${artistName} - ${trackName}"...`);
  if (songTitleEl) songTitleEl.textContent = trackName;
  if (songArtistEl) songArtistEl.textContent = artistName;
  if (searchModal) searchModal.classList.add('hidden');

  searchStatusBar.innerHTML = `<span>⏳ Parsing lyrics & resolving video for "${escapeHtml(trackName)}"...</span>`;

  // 1. Resolve YouTube ID
  let resolvedYtId = null;
  const lookupKey1 = `${artistName} - ${trackName}`.toLowerCase();
  const lookupKey2 = trackName.toLowerCase();

  for (const [k, vid] of Object.entries(POPULAR_VIDEO_IDS)) {
    if (lookupKey1.includes(k) || lookupKey2.includes(k) || k.includes(lookupKey2)) {
      resolvedYtId = vid;
      break;
    }
  }

  // If not found in popular table, automatically resolve video ID
  if (!resolvedYtId) {
    if (directYtUrl && directYtUrl.value) {
      resolvedYtId = extractYouTubeId(directYtUrl.value);
    }
  }

  if (!resolvedYtId) {
    resolvedYtId = await searchYouTubeVideoId(`${artistName} ${trackName}`);
  }

  if (loadId !== currentLyricsLoadId) return;

  if (!resolvedYtId) {
    resolvedYtId = currentTrackId;
  }

  // 2. Parse lyrics
  let rawLines = [];
  if (item.syncedLyrics) {
    rawLines = parseLrc(item.syncedLyrics, item.duration || 210);
  } else if (item.plainLyrics) {
    rawLines = parsePlainTextToCadence(item.plainLyrics, item.duration || 210);
  }

  if (rawLines.length === 0) {
    rawLines = [
      { start: 0, end: 5, original: `${trackName} - ${artistName}` },
      { start: 5, end: 120, original: 'Instrumental / No synced lyrics available.' }
    ];
  }

  // 3. Dynamic Translation
  const transIntro = `Translating ${rawLines.length} lines into ${targetLang.toUpperCase()}...`;
  searchStatusBar.innerHTML = `<span>⏳ ${transIntro}</span>`;
  updateLyricsLoadingProgress(transIntro);

  const translatedLines = await translationService.translateLines(
    rawLines,
    targetLang,
    (done, total) => {
      if (loadId !== currentLyricsLoadId) return;
      const progressMsg = `Translating lyrics: ${done} / ${total} lines...`;
      searchStatusBar.innerHTML = `<span>⏳ ${progressMsg}</span>`;
      updateLyricsLoadingProgress(progressMsg);
    }
  );

  if (loadId !== currentLyricsLoadId) return;

  // Format into track structure
  const formattedLyrics = translatedLines.map((l) => ({
    start: l.start,
    end: l.end,
    original: l.original,
    translations: {
      [targetLang]: l.translated,
      en: l.original
    },
    glossary: {}
  }));

  const dynamicTrack = {
    id: resolvedYtId,
    title: trackName,
    artist: artistName,
    sourceLanguage: 'auto',
    sourceLanguageName: 'Auto',
    duration: item.duration || 210,
    badge: 'Searched via LRCLIB',
    lyrics: formattedLyrics
  };

  addAndSelectTrack(dynamicTrack);
  playerController.play();
}

/**
 * Loads a direct YouTube URL with optional title
 */
async function handleDirectYouTubeLoad() {
  const url = directYtUrl.value.trim();
  const ytId = extractYouTubeId(url);

  if (!ytId) {
    alert('Please enter a valid YouTube link or 11-character video ID.');
    return;
  }

  const titleQuery = directYtTitle.value.trim();
  const targetLang = languageRouter.getCurrentLanguage();
  const loadId = ++currentLyricsLoadId;

  if (playerController) playerController.pause();
  showPlayerView();
  showLyricsLoading(titleQuery || `YouTube Video [${ytId}]`, 'Loading video & synchronizing lyrics...');
  if (searchModal) searchModal.classList.add('hidden');

  if (titleQuery) {
    searchStatusBar.innerHTML = `<span>⏳ Fetching lyrics for "${escapeHtml(titleQuery)}"...</span>`;
    const results = await searchLrclib(titleQuery);
    if (loadId !== currentLyricsLoadId) return;
    if (results && results.length > 0) {
      const bestMatch = results[0];
      let rawLines = bestMatch.syncedLyrics
        ? parseLrc(bestMatch.syncedLyrics, bestMatch.duration || 210)
        : parsePlainTextToCadence(bestMatch.plainLyrics, bestMatch.duration || 210);

      updateLyricsLoadingProgress(`Translating lyrics into ${targetLang.toUpperCase()}...`);
      const translatedLines = await translationService.translateLines(
        rawLines,
        targetLang,
        (done, total) => {
          if (loadId !== currentLyricsLoadId) return;
          const progressMsg = `Translating lyrics: ${done} / ${total} lines...`;
          updateLyricsLoadingProgress(progressMsg);
        }
      );
      if (loadId !== currentLyricsLoadId) return;

      const formattedLyrics = translatedLines.map((l) => ({
        start: l.start,
        end: l.end,
        original: l.original,
        translations: {
          [targetLang]: l.translated,
          en: l.original
        },
        glossary: {}
      }));

      const dynamicTrack = {
        id: ytId,
        title: bestMatch.trackName || titleQuery,
        artist: bestMatch.artistName || 'YouTube Track',
        duration: bestMatch.duration || 210,
        badge: 'YouTube + Synced LRCLIB',
        lyrics: formattedLyrics
      };

      addAndSelectTrack(dynamicTrack);
      playerController.play();
      return;
    }
  }

  // Fallback direct load
  if (loadId !== currentLyricsLoadId) return;
  const directTrack = {
    id: ytId,
    title: titleQuery || `YouTube Video [${ytId}]`,
    artist: 'Custom Video',
    duration: 240,
    badge: 'Custom URL',
    lyrics: [
      {
        start: 0.0,
        end: 10.0,
        original: `Playing custom YouTube video: ${ytId}`,
        translations: {
          [targetLang]: `Riproduzione video YouTube: ${ytId}`,
          en: `Playing custom YouTube video: ${ytId}`
        },
        glossary: {}
      }
    ]
  };

  addAndSelectTrack(directTrack);
  playerController.play();
}

/**
 * Word Details Modal
 */
function showWordDetails(word, definition) {
  modalWordTitle.textContent = word;
  modalWordMeaning.textContent =
    definition ||
    `Vocabulary inspection: "${word}". Practice pronunciation with the button below!`;
  wordModal.classList.remove('hidden');

  modalPronounceBtn.onclick = () => {
    if ('speechSynthesis' in window) {
      const meta = getTrackMeta(currentTrackId);
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = meta.sourceLanguage || 'en';
      window.speechSynthesis.speak(utter);
    }
  };
}

function closeWordDetails() {
  wordModal.classList.add('hidden');
}

/**
 * Highlights the query match within the suggestion text (YouTube-style bolding)
 */
function highlightQueryMatch(text, query) {
  if (!query) return escapeHtml(text);
  const qLower = query.toLowerCase();
  const tLower = text.toLowerCase();

  // If suggestion starts with query (standard YouTube autocomplete style)
  if (tLower.startsWith(qLower)) {
    const matchPart = text.slice(0, query.length);
    const restPart = text.slice(query.length);
    return `${escapeHtml(matchPart)}<b>${escapeHtml(restPart)}</b>`;
  }

  // If query is elsewhere inside
  const idx = tLower.indexOf(qLower);
  if (idx !== -1) {
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return `${escapeHtml(before)}<b>${escapeHtml(match)}</b>${escapeHtml(after)}`;
  }

  return escapeHtml(text);
}

/**
 * Checks if a suggestion corresponds to a known popular track with verified synced lyrics
 */
function hasKnownSyncedLyrics(suggestion) {
  if (!suggestion) return false;
  const s = suggestion.toLowerCase();
  for (const key of Object.keys(POPULAR_VIDEO_IDS)) {
    if (s.includes(key) || key.includes(s)) return true;
  }
  return false;
}

/**
 * Hide all floating search suggestions dropdowns
 */
function hideAllSuggestions() {
  if (ytSuggestionsDropdown) {
    ytSuggestionsDropdown.classList.add('hidden');
    ytSuggestionsDropdown.innerHTML = '';
  }
  if (heroSuggestionsDropdown) {
    heroSuggestionsDropdown.classList.add('hidden');
    heroSuggestionsDropdown.innerHTML = '';
  }
}

/**
 * Attaches YouTube-style autocomplete & suggestion handling to any search bar
 */
function setupAutocomplete({
  inputEl,
  dropdownEl,
  clearBtnEl,
  formEl,
  submitBtnEl
}) {
  if (!inputEl || !dropdownEl) return;

  let activeIdx = -1;
  let suggestions = [];
  let userQuery = '';
  let debounceTimer = null;

  function hideDropdown() {
    dropdownEl.classList.add('hidden');
    dropdownEl.innerHTML = '';
    dropdownEl.style.maxHeight = '';
    activeIdx = -1;
    suggestions = [];
  }

  function setHighlighted(index, updateInput = true) {
    const items = dropdownEl.querySelectorAll('.yt-suggestion-item, .yt-sugg-video-item');
    items.forEach((item) => item.classList.remove('active'));

    activeIdx = index;

    if (index >= 0 && index < suggestions.length) {
      const activeEl = items[index];
      if (activeEl) {
        activeEl.classList.add('active');
        activeEl.scrollIntoView({ block: 'nearest' });
      }
      const itemData = suggestions[index];
      if (updateInput && inputEl && itemData) {
        inputEl.value = typeof itemData === 'string' ? itemData : itemData.title;
      }
    } else if (updateInput && inputEl) {
      inputEl.value = userQuery;
    }
  }

  function onSelect(item) {
    if (!item) return;
    hideAllSuggestions();
    inputEl.blur();

    if (typeof item === 'object' && item.videoId) {
      playSelectedVideoWithLyrics(item);
    } else {
      const q = typeof item === 'string' ? item : inputEl.value.trim();
      inputEl.value = q;
      if (clearBtnEl) clearBtnEl.classList.remove('hidden');
      showYouTubeSearchResultsModal(q);
    }
  }

  function renderSuggestions(query, textList, videoList = []) {
    activeIdx = -1;
    suggestions = [];
    dropdownEl.innerHTML = '';

    const hasVideos = Array.isArray(videoList) && videoList.length > 0;
    const hasTexts = Array.isArray(textList) && textList.length > 0;

    if (!hasVideos && !hasTexts) {
      hideDropdown();
      return;
    }

    let runningIdx = 0;

    // 1. Top video matches
    if (hasVideos) {
      const sectionHeader = document.createElement('div');
      sectionHeader.className = 'yt-sugg-section-title';
      sectionHeader.textContent = 'Videos (Click to play)';
      dropdownEl.appendChild(sectionHeader);

      videoList.slice(0, 3).forEach((video) => {
        const idx = runningIdx++;
        suggestions.push(video);

        const row = document.createElement('div');
        row.className = 'yt-sugg-video-item';
        row.setAttribute('role', 'option');
        row.setAttribute('data-index', idx);

        row.innerHTML = `
          <img class="yt-sugg-thumb" src="${escapeHtml(video.thumbnail)}" alt="" loading="lazy" />
          <div class="yt-sugg-video-meta">
            <span class="yt-sugg-video-title">${escapeHtml(video.title)}</span>
            <div class="yt-sugg-video-subline">
              <span class="yt-sugg-video-channel">${escapeHtml(video.channel)} ${video.duration ? `• ${escapeHtml(video.duration)}` : ''}</span>
            </div>
          </div>
        `;

        row.addEventListener('mouseenter', () => setHighlighted(idx, false));
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelect(video);
        });

        dropdownEl.appendChild(row);
      });
    }

    // 2. Text suggestions
    if (hasTexts) {
      const textHeader = document.createElement('div');
      textHeader.className = 'yt-sugg-section-title';
      textHeader.textContent = 'Search suggestions';
      dropdownEl.appendChild(textHeader);

      textList.slice(0, 7).forEach((text) => {
        const idx = runningIdx++;
        suggestions.push(text);

        const row = document.createElement('div');
        row.className = 'yt-suggestion-item';
        row.setAttribute('role', 'option');
        row.setAttribute('data-index', idx);

        row.innerHTML = `
          <div class="yt-suggestion-left">
            <svg class="yt-suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span class="yt-suggestion-text">${highlightQueryMatch(text, query)}</span>
          </div>
        `;

        row.addEventListener('mouseenter', () => setHighlighted(idx, false));
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelect(text);
        });

        dropdownEl.appendChild(row);
      });
    }

    const inputRect = inputEl.getBoundingClientRect();
    const availableHeight = window.innerHeight - inputRect.bottom - 24;
    if (availableHeight > 100) {
      dropdownEl.style.maxHeight = `${Math.min(340, availableHeight)}px`;
    }

    dropdownEl.classList.remove('hidden');
  }

  // Real-time input listener with 150ms debounce
  inputEl.addEventListener('input', (e) => {
    const val = e.target.value;
    userQuery = val;
    if (clearBtnEl) clearBtnEl.classList.toggle('hidden', val.trim().length === 0);

    if (!val.trim()) {
      hideDropdown();
      clearTimeout(debounceTimer);
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const trimmed = val.trim();
      if (!trimmed) {
        hideDropdown();
        return;
      }

      try {
        const [textSuggs, videoSuggs] = await Promise.all([
          fetchYouTubeSuggestions(trimmed),
          searchYouTubeVideos(trimmed)
        ]);

        if (inputEl.value.trim() === trimmed) {
          renderSuggestions(trimmed, textSuggs, videoSuggs ? videoSuggs.slice(0, 3) : []);
        }
      } catch (err) {
        console.warn('Autocomplete fetch error:', err);
      }
    }, 150);
  });

  // Keyboard navigation
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      if (dropdownEl.classList.contains('hidden') && suggestions.length > 0) {
        dropdownEl.classList.remove('hidden');
      }
      e.preventDefault();
      const nextIdx = activeIdx + 1;
      if (nextIdx >= suggestions.length) {
        setHighlighted(-1, true);
      } else {
        setHighlighted(nextIdx, true);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = activeIdx - 1;
      if (prevIdx < -1) {
        setHighlighted(suggestions.length - 1, true);
      } else {
        setHighlighted(prevIdx, true);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        onSelect(suggestions[activeIdx]);
      } else {
        const q = inputEl.value.trim();
        if (q) {
          hideAllSuggestions();
          showYouTubeSearchResultsModal(q);
        }
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  // Re-open suggestions on focus if query exists and select all text for easy replacement
  inputEl.addEventListener('focus', () => {
    setTimeout(() => {
      try { inputEl.select(); } catch {}
    }, 0);
    const val = inputEl.value.trim();
    if (val.length > 0 && suggestions.length > 0) {
      dropdownEl.classList.remove('hidden');
    }
  });

  inputEl.addEventListener('click', () => {
    try { inputEl.select(); } catch {}
  });

  // Clear button
  if (clearBtnEl) {
    clearBtnEl.addEventListener('click', () => {
      inputEl.value = '';
      clearBtnEl.classList.add('hidden');
      hideDropdown();
      inputEl.focus();
    });
  }

  // Form submit / Search button
  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputEl.value.trim();
    if (q) {
      hideAllSuggestions();
      showYouTubeSearchResultsModal(q);
    }
  };

  if (formEl) formEl.addEventListener('submit', handleSubmit);
  if (submitBtnEl) submitBtnEl.addEventListener('click', handleSubmit);

  // Click outside to dismiss
  document.addEventListener('click', (e) => {
    if (formEl && !formEl.contains(e.target) && !dropdownEl.contains(e.target)) {
      hideDropdown();
    }
  });

  window.addEventListener('resize', () => {
    if (!dropdownEl.classList.contains('hidden')) {
      const inputRect = inputEl.getBoundingClientRect();
      const availableHeight = window.innerHeight - inputRect.bottom - 24;
      if (availableHeight > 100) {
        dropdownEl.style.maxHeight = `${Math.min(340, availableHeight)}px`;
      }
    }
  });
}

/**
 * Hero Billboard Experiment & Supported Language Song Pills Ticker
 * Renders 3 rotating rows of album art in the background (fetched from iTunes API with supported language keywords)
 * and 2 infinite ticker rows of iconic songs strictly from the 5 supported languages (EN, ES, IT, FR, DE).
 */

// Curated, verified album artwork from legendary artists strictly across the 5 supported languages (EN, ES, FR, IT, DE)
const CURATED_BILLBOARD_COVERS = [
  // English
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/600x600bb.jpg", // Coldplay
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/0e/c1/57/0ec1575f-5153-ac4b-d578-c5fa3a90bfe1/5021732511676.jpg/600x600bb.jpg", // Dua Lipa
  "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4d/08/2a/4d082a9e-7898-1aa1-a02f-339810058d9e/14DMGIM05632.rgb.jpg/600x600bb.jpg", // Queen
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg", // Adele
  "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/fa/5b/89/fa5b898d-bad6-e053-4195-260e5c74f2bb/00602567725466.rgb.jpg/600x600bb.jpg", // The Beatles
  // Spanish
  "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2c/55/e1/2c55e13f-15d8-1c7c-1826-c5fa55deaa8f/886447217139.jpg/600x600bb.jpg", // Rosalía
  "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/77/20/38/77203815-7c88-906d-a4d2-578474f244b6/886447379585.jpg/600x600bb.jpg", // C. Tangana
  "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/77/32/74/7732746d-25e5-baae-b921-bad4a07d87b1/19UMGIM55524.rgb.jpg/600x600bb.jpg", // Bad Bunny
  "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/05/d7/e1/05d7e189-c4d5-331f-0327-da3add4bae06/16UMGIM14728.rgb.jpg/600x600bb.jpg", // Álvaro Soler
  // French
  "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/19/d7/7f/19d77fb9-4e13-3a77-c84d-8399a4213316/13UMGIM59162.rgb.jpg/600x600bb.jpg", // Stromae
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/4a/77/fd4a77db-0ebc-d043-41a2-f32fa1bb0fb4/dj.qrikkdwj.jpg/600x600bb.jpg", // Daft Punk
  "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/49/58/30/49583018-308b-431d-c691-4a28e78be8cd/14UMGIM01109.rgb.jpg/600x600bb.jpg", // Indila
  "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/c5/e6/66/c5e66687-e756-a870-a6c2-c2f87fd89f80/886448932147.jpg/600x600bb.jpg", // Videoclub
  "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/96/a2/a4/96a2a4e8-53b8-05d3-d0e2-fb1e41817f1d/190295127718.jpg/600x600bb.jpg", // Angèle
  // Italian
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/aa/6b/bfaa6b30-3bc9-af12-c776-510e3f21b475/18UMGIM74788.rgb.jpg/600x600bb.jpg", // Andrea Bocelli
  "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/02/9e/06/029e0667-367e-f60c-fee3-05588ae95834/196589461865.jpg/600x600bb.jpg", // Måneskin
  "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d9/03/e4/d903e480-91e7-28cf-7fa7-f2758c716888/035627131424.jpg/600x600bb.jpg", // Lucio Dalla
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7a/fb/ab/7afbab27-17b4-ee23-0c71-9bd0e63f2832/1200214893668.jpg/600x600bb.jpg", // Laura Pausini
  // German
  "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1d/35/21/1d352129-b0a3-4a02-5cb4-e7836e9c00ea/840054901287.png/600x600bb.jpg", // Nena
  "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/78/af/45/78af45f6-e4e6-5681-c1f6-a20e3949ab8c/18UMGIM31237.rgb.jpg/600x600bb.jpg", // Rammstein
  "https://is1-ssl.mzstatic.com/image/thumb/Music1/v4/ac/34/2d/ac342dcf-8349-676f-9510-c1bd27e932d2/dj.ajlyslln.jpg/600x600bb.jpg", // Kraftwerk
  "https://is1-ssl.mzstatic.com/image/thumb/Music3/v4/12/4a/24/124a242a-940d-1bd7-8324-87aea91560b3/886445096033.jpg/600x600bb.jpg"  // Cro
];

// Curated songs strictly from the 5 supported languages (Italian, French, Spanish, German, English)
const SONGS_BATCH_1 = [
  { flag: '🇮🇹', artist: 'Andrea Bocelli', title: 'Con te partirò' },
  { flag: '🇮🇹', artist: 'Domenico Modugno', title: 'Nel blu dipinto di blu' },
  { flag: '🇮🇹', artist: 'Lucio Dalla', title: 'Caruso' },
  { flag: '🇮🇹', artist: 'Mahmood', title: 'Tuta Gold' },
  { flag: '🇮🇹', artist: 'Eros Ramazzotti', title: 'Più bella cosa' },
  { flag: '🇫🇷', artist: 'Videoclub', title: 'Amour plastique' },
  { flag: '🇫🇷', artist: 'Aya Nakamura', title: 'Djadja' },
  { flag: '🇩🇪', artist: 'Kraftwerk', title: 'Das Model' }
];

const SONGS_BATCH_2 = [
  { flag: '🇪🇸', artist: 'Rosalía', title: 'DESPECHÁ' },
  { flag: '🇫🇷', artist: 'Stromae', title: 'Papaoutai' },
  { flag: '🇮🇹', artist: 'Ricchi e Poveri', title: 'Sarà perché ti amo' },
  { flag: '🇪🇸', artist: 'C. Tangana', title: 'Tú Me Dejaste De Querer' },
  { flag: '🇫🇷', artist: 'Indila', title: 'Dernière Danse' },
  { flag: '🇩🇪', artist: 'Nena', title: '99 Luftballons' },
  { flag: '🇮🇹', artist: 'Måneskin', title: 'Zitti e buoni' },
  { flag: '🇬🇧', artist: 'Coldplay', title: 'Yellow' }
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderBillboardRow(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el || !items || items.length === 0) return;

  let baseList = [...items];
  while (baseList.length < 12) {
    baseList = baseList.concat(items);
  }
  const duplicated = [...baseList, ...baseList];

  el.innerHTML = duplicated.map(src => `
    <div class="cover-card">
      <img 
        src="${escapeHtml(src)}" 
        alt="Album Artwork" 
        loading="eager"
        decoding="async"
      />
    </div>
  `).join('');
}

function renderSongPillsRow(containerId, songs) {
  const el = document.getElementById(containerId);
  if (!el || !songs || songs.length === 0) return;

  // Duplicate array once for seamless loop exactly like the reference file
  const duplicated = [...songs, ...songs];

  el.innerHTML = duplicated.map(song => {
    const q = `${song.artist} ${song.title}`;
    return `
      <div class="song-pill" data-query="${escapeHtml(q)}" title="Practice with ${escapeHtml(song.artist)} - ${escapeHtml(song.title)}">
        <span class="song-pill-flag">${song.flag}</span>
        <span class="song-pill-artist">${escapeHtml(song.artist)}</span>
        <span class="song-pill-divider">·</span>
        <span class="song-pill-title">${escapeHtml(song.title)}</span>
      </div>
    `;
  }).join('');
}

function initHeroBillboard() {
  const songRow1 = document.getElementById('song-row-1');
  const songRow2 = document.getElementById('song-row-2');
  if (!songRow1 || !songRow2) return;

  // 1. Render Polilyrics songs pill carousels immediately with supported languages
  renderSongPillsRow('song-row-1', SONGS_BATCH_1);
  renderSongPillsRow('song-row-2', SONGS_BATCH_2);

  // 2. Render curated verified album covers across the 3 marquee rows
  const shuffled = shuffleArray(CURATED_BILLBOARD_COVERS);
  const chunkSize = Math.ceil(shuffled.length / 3);
  renderBillboardRow('row-1', shuffled.slice(0, chunkSize));
  renderBillboardRow('row-2', shuffled.slice(chunkSize, chunkSize * 2));
  renderBillboardRow('row-3', shuffled.slice(chunkSize * 2));

  // 3. Click delegation on hero songs footer to trigger Polilyrics search
  const heroSongsFooter = document.getElementById('hero-songs-footer');
  if (heroSongsFooter) {
    heroSongsFooter.addEventListener('click', (e) => {
      const pill = e.target.closest('.song-pill');
      if (!pill) return;
      const q = pill.getAttribute('data-query');
      if (q) {
        if (heroSearchInput) {
          heroSearchInput.value = q;
          if (heroSearchClear) heroSearchClear.classList.remove('hidden');
        }
        if (ytSearchInput) {
          ytSearchInput.value = q;
          if (ytSearchClear) ytSearchClear.classList.remove('hidden');
        }
        showYouTubeSearchResultsModal(q);
      }
    });
  }
}

/**
 * Initializes the YouTube Search Bar and Hero Landing Autocomplete Engines
 */
function initYouTubeSearchAutocomplete() {
  // 1. Header Search Bar
  setupAutocomplete({
    inputEl: ytSearchInput,
    dropdownEl: ytSuggestionsDropdown,
    clearBtnEl: ytSearchClear,
    formEl: ytSearchForm,
    submitBtnEl: ytSearchSubmit
  });

  // 2. Hero Search Landing Bar
  setupAutocomplete({
    inputEl: heroSearchInput,
    dropdownEl: heroSuggestionsDropdown,
    clearBtnEl: heroSearchClear,
    formEl: heroSearchForm,
    submitBtnEl: heroSearchSubmit
  });

  // 3. Hero Billboard & Supported Language Song Pills Ticker
  initHeroBillboard();

  // 4. Header Brand Click -> Return to Landing Search
  const headerBrand = document.querySelector('.header-brand');
  if (headerBrand) {
    headerBrand.addEventListener('click', () => {
      returnToLandingSearch();
    });
  }
}

/**
 * Finds the best matching LRCLIB lyric entry for a video using parsed artist/title and duration
 */
function findBestMatchingLrc(video, lrclibResults) {
  if (!lrclibResults || lrclibResults.length === 0) return null;
  const parsed = parseArtistAndTitle(video.title, video.channel);
  const videoSec = parseDurationText(video.duration);
  return pickBestLrcResult(lrclibResults, videoSec, parsed.title, parsed.artist);
}

/**
 * Displays YouTube Video Search Results in a modal dialog so the user can choose the video
 */
async function showYouTubeSearchResultsModal(query) {
  if (!query || !query.trim()) return;
  const trimmed = query.trim();

  // If user entered direct YouTube URL or ID, load immediately
  const directId = extractYouTubeId(trimmed);
  if (directId) {
    let title = await fetchYouTubeTitle(directId);
    playSelectedVideoWithLyrics({
      videoId: directId,
      title: title || `YouTube Video [${directId}]`,
      channel: 'YouTube Video',
      duration: '',
      thumbnail: `https://i.ytimg.com/vi/${directId}/mqdefault.jpg`
    });
    return;
  }

  hideAllSuggestions();
  if (ytSearchInput) ytSearchInput.blur();
  if (heroSearchInput) heroSearchInput.blur();

  ytResultsModal.classList.remove('hidden');
  ytResultsTitle.textContent = `YouTube Videos for "${trimmed}"`;
  ytResultsSubtitle.textContent = 'Choose the exact video you want to play with synchronized dual subtitles';
  ytResultsLoading.classList.remove('hidden');
  ytResultsList.innerHTML = '';

  // Fetch YouTube video search results and LRCLIB lyrics in parallel
  const [videos, lrclibResults] = await Promise.all([
    searchYouTubeVideos(trimmed),
    searchLrclib(trimmed)
  ]);

  ytResultsLoading.classList.add('hidden');

  if (!videos || videos.length === 0) {
    ytResultsList.innerHTML = `
      <div class="yt-results-loading">
        <span>No YouTube videos found for "${escapeHtml(trimmed)}". Try different keywords.</span>
      </div>
    `;
    return;
  }

  videos.forEach((video) => {
    const card = document.createElement('div');
    card.className = 'yt-video-card';

    const matchingLrc = findBestMatchingLrc(video, lrclibResults);

    card.innerHTML = `
      <div class="yt-card-thumb-wrapper">
        <img class="yt-card-thumb-img" src="${escapeHtml(video.thumbnail)}" alt="${escapeHtml(video.title)}" loading="lazy" />
        ${video.duration ? `<span class="yt-card-duration">${escapeHtml(video.duration)}</span>` : ''}
        <div class="yt-card-play-overlay">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>
      <div class="yt-card-info">
        <h4 class="yt-card-title">${escapeHtml(video.title)}</h4>
        <div class="yt-card-channel">
          <span>${escapeHtml(video.channel)}</span>
        </div>
      </div>
      <div class="yt-card-action">
        <button class="yt-card-play-btn">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Play</span>
        </button>
      </div>
    `;

    card.addEventListener('click', () => {
      ytResultsModal.classList.add('hidden');
      playSelectedVideoWithLyrics(video, matchingLrc);
    });

    ytResultsList.appendChild(card);
  });
}

/**
 * Loads a selected YouTube video into player and syncs bilingual lyrics
 */
async function playSelectedVideoWithLyrics(video, prefetchedLrc = null) {
  const loadId = ++currentLyricsLoadId;
  if (playerController) playerController.pause();
  showPlayerView();
  showLyricsLoading(video.title, 'Fetching synchronized lines & translation...');
  if (songTitleEl) songTitleEl.textContent = video.title;
  if (songArtistEl) songArtistEl.textContent = video.channel;
  if (ytResultsModal) ytResultsModal.classList.add('hidden');
  playerOverlay.classList.remove('hidden');
  const overlayText = playerOverlay.querySelector('.overlay-text');
  if (overlayText) {
    overlayText.textContent = `Loading lyrics & video for "${video.title}"...`;
  }

  const targetLang = languageRouter.getCurrentLanguage();
  let lrcItem = prefetchedLrc;
  const videoSec = parseDurationText(video.duration);

  // Validate prefetchedLrc duration: discard if duration diff > 35s
  if (lrcItem && videoSec > 0 && lrcItem.duration > 0) {
    if (Math.abs(lrcItem.duration - videoSec) > 35) {
      console.warn('Discarding mismatched prefetched lyrics due to duration difference:', lrcItem.duration, 'vs video', videoSec);
      lrcItem = null;
    }
  }

  const parsed = parseArtistAndTitle(video.title, video.channel);

  if (!lrcItem) {
    // 1. Try exact match by track_name & artist_name from LRCLIB
    if (parsed.title) {
      lrcItem = await getLrclibExact(parsed.title, parsed.artist);
    }

    if (loadId !== currentLyricsLoadId) return;

    // 2. Try search with parsed artist & title
    if (!lrcItem && parsed.title) {
      const searchTerms = parsed.artist ? `${parsed.artist} ${parsed.title}` : parsed.title;
      const results = await searchLrclib(searchTerms);
      if (loadId !== currentLyricsLoadId) return;
      if (results && results.length > 0) {
        lrcItem = pickBestLrcResult(results, videoSec, parsed.title, parsed.artist);
      }
    }

    // 3. Fallback to raw video title clean search
    if (!lrcItem) {
      const cleanTitle = video.title.replace(/\(.*?\)|\[.*?\]/g, '').replace(/official\s*(music)?\s*(video|audio)/gi, '').trim();
      const results = await searchLrclib(`${video.channel} ${cleanTitle}`);
      if (loadId !== currentLyricsLoadId) return;
      if (results && results.length > 0) {
        lrcItem = pickBestLrcResult(results, videoSec, parsed.title, parsed.artist);
      } else {
        const fallbackResults = await searchLrclib(cleanTitle);
        if (loadId !== currentLyricsLoadId) return;
        if (fallbackResults && fallbackResults.length > 0) {
          lrcItem = pickBestLrcResult(fallbackResults, videoSec, parsed.title, parsed.artist);
        }
      }
    }
  }

  if (loadId !== currentLyricsLoadId) return;

  let rawLines = [];
  if (lrcItem && lrcItem.syncedLyrics) {
    rawLines = parseLrc(lrcItem.syncedLyrics, lrcItem.duration || 210);
  } else if (lrcItem && lrcItem.plainLyrics) {
    rawLines = parsePlainTextToCadence(lrcItem.plainLyrics, lrcItem.duration || 210);
  } else {
    rawLines = [
      { start: 0, end: 6, original: video.title },
      { start: 6, end: 200, original: `${video.channel} - Playing on Lyricist` }
    ];
  }

  const transStartMsg = `Translating lyrics to ${targetLang.toUpperCase()}...`;
  if (overlayText) overlayText.textContent = transStartMsg;
  updateLyricsLoadingProgress(transStartMsg);

  const translated = await translationService.translateLines(
    rawLines,
    targetLang,
    (done, total) => {
      if (loadId !== currentLyricsLoadId) return;
      const progressMsg = `Translating lyrics: ${done} / ${total} lines...`;
      if (overlayText) overlayText.textContent = progressMsg;
      updateLyricsLoadingProgress(progressMsg);
    }
  );

  if (loadId !== currentLyricsLoadId) return;

  const formattedLyrics = translated.map((l) => ({
    start: l.start,
    end: l.end,
    original: l.original,
    translations: {
      [targetLang]: l.translated,
      en: l.original
    },
    glossary: {}
  }));

  const cleanTrackTitle = lrcItem ? (lrcItem.trackName || lrcItem.name) : (parsed.title || video.title);
  const cleanArtist = lrcItem ? lrcItem.artistName : (parsed.artist || video.channel);

  // Update search input to reflect current playing track and enable clear button
  const displaySearchText = cleanArtist ? `${cleanArtist} - ${cleanTrackTitle}` : cleanTrackTitle;
  if (ytSearchInput) {
    ytSearchInput.value = displaySearchText;
    if (ytSearchClear) ytSearchClear.classList.remove('hidden');
  }
  if (heroSearchInput) {
    heroSearchInput.value = displaySearchText;
  }

  const dynamicTrack = {
    id: video.videoId,
    title: cleanTrackTitle,
    artist: cleanArtist,
    sourceLanguage: 'auto',
    duration: lrcItem?.duration || videoSec || 210,
    badge: lrcItem?.syncedLyrics ? 'Verified Synced' : 'YouTube Video',
    lyrics: formattedLyrics
  };

  addAndSelectTrack(dynamicTrack);

  // Auto-detect intro offset if music video is longer than studio audio track
  let detectedIntroOffset = 0.0;
  if (videoSec > 0 && lrcItem?.duration > 0) {
    const diff = videoSec - lrcItem.duration;
    if (diff >= 2 && diff <= 45) {
      detectedIntroOffset = Math.round(diff * 10) / 10;
    }
  }

  let savedOffset = null;
  try {
    savedOffset = localStorage.getItem(`lingobeats_offset_${video.videoId}`);
  } catch {
    // ignore
  }

  if (savedOffset !== null) {
    const val = parseFloat(savedOffset);
    if (!isNaN(val)) setSyncOffset(val, false);
  } else if (detectedIntroOffset > 0) {
    setSyncOffset(detectedIntroOffset, true);
    showToast(`⏱️ Video intro detected: sync set to +${detectedIntroOffset}s (adjust anytime)`);
  } else {
    setSyncOffset(0.0, false);
  }
  playerOverlay.classList.add('hidden');
  playerController.play();
}

/**
 * Setup Event Listeners
 */
function initEvents() {
  // Initialize YouTube Autocomplete
  initYouTubeSearchAutocomplete();

  // Play/Pause Button
  btnPlayPause.addEventListener('click', () => {
    playerController.togglePlay();
  });

  // Previous Line Button
  btnPrevLine.addEventListener('click', () => {
    const prevIndex = Math.max(0, currentActiveIndex > 0 ? currentActiveIndex - 1 : 0);
    if (currentLyrics[prevIndex]) {
      handleSeekToLine(prevIndex, currentLyrics[prevIndex].start);
    }
  });

  // Next Line Button
  btnNextLine.addEventListener('click', () => {
    const nextIndex = Math.min(currentLyrics.length - 1, currentActiveIndex + 1);
    if (currentLyrics[nextIndex]) {
      handleSeekToLine(nextIndex, currentLyrics[nextIndex].start);
    }
  });

  // Repeat Current Line (A-B loop)
  if (btnRepeatLine) {
    btnRepeatLine.addEventListener('click', () => {
      if (currentActiveIndex >= 0 && currentLyrics[currentActiveIndex]) {
        handleSeekToLine(currentActiveIndex, currentLyrics[currentActiveIndex].start);
      } else if (currentLyrics[0]) {
        handleSeekToLine(0, currentLyrics[0].start);
      }
    });
  }

  // Playback Speed Toggle
  if (btnSpeed) {
    btnSpeed.addEventListener('click', () => {
      currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
      const speed = playbackSpeeds[currentSpeedIndex];
      btnSpeed.textContent = `${speed.toFixed(speed === 1 ? 1 : 2)}x`;
      playerController.setPlaybackRate(speed);
    });
  }

  // Auto-scroll Toggle
  btnAutoScroll.addEventListener('click', () => {
    autoScrollEnabled = !autoScrollEnabled;
    btnAutoScroll.classList.toggle('active', autoScrollEnabled);
  });

  // Font Size Adjusters
  btnFontDec.addEventListener('click', () => {
    currentScale = Math.max(0.8, currentScale - 0.1);
    document.documentElement.style.setProperty('--lyric-scale', currentScale);
  });

  btnFontInc.addEventListener('click', () => {
    currentScale = Math.min(1.4, currentScale + 0.1);
    document.documentElement.style.setProperty('--lyric-scale', currentScale);
  });

  // Manual Scroll Detection
  lyricsContainer.addEventListener(
    'wheel',
    () => {
      if (!autoScrollEnabled) return;
      clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => {}, 3000);
    },
    { passive: true }
  );

  // Lyrics In-Page Search Filter
  lyricsSearch.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    searchClearBtn.classList.toggle('hidden', term.length === 0);

    const rows = lyricsList.querySelectorAll('.lyric-row');
    rows.forEach((row, idx) => {
      const line = currentLyrics[idx];
      if (!term) {
        row.classList.remove('hidden');
      } else {
        const matches =
          line.original.toLowerCase().includes(term) ||
          line.translated.toLowerCase().includes(term);
        row.classList.toggle('hidden', !matches);
      }
    });
  });

  searchClearBtn.addEventListener('click', () => {
    lyricsSearch.value = '';
    lyricsSearch.dispatchEvent(new Event('input'));
  });

  // YouTube Video Results Modal Events
  if (ytResultsClose) {
    ytResultsClose.addEventListener('click', () => {
      ytResultsModal.classList.add('hidden');
    });
  }

  if (ytResultsModal) {
    ytResultsModal.addEventListener('click', (e) => {
      if (e.target === ytResultsModal) {
        ytResultsModal.classList.add('hidden');
      }
    });
  }

  // Word Modal Close
  modalCloseBtn.addEventListener('click', closeWordDetails);
  wordModal.addEventListener('click', (e) => {
    if (e.target === wordModal) closeWordDetails();
  });

  // Helper for hold-to-repeat with acceleration (prevents mobile zoom & allows fast scrubbing)
  function setupHoldToRepeat(button, getDelta) {
    if (!button) return;
    let timer = null;
    let interval = null;
    let count = 0;

    function getBaseDelta() {
      return typeof getDelta === 'function' ? getDelta() : getDelta;
    }

    function executeStep() {
      count++;
      const base = getBaseDelta();
      let step = base;
      if (count > 8) {
        step = base * 2;
      }
      if (count > 20) {
        step = base * 5;
      }
      setSyncOffset(currentSyncOffset + step);
    }

    let hasMousedownHandled = false;

    function start(e) {
      if (e.button !== undefined && e.button !== 0) return;
      hasMousedownHandled = true;
      const base = getBaseDelta();
      setSyncOffset(currentSyncOffset + base);
      count = 0;
      timer = setTimeout(() => {
        interval = setInterval(executeStep, 90);
      }, 260);
    }

    function stop() {
      clearTimeout(timer);
      clearInterval(interval);
      timer = null;
      interval = null;
      setTimeout(() => {
        hasMousedownHandled = false;
      }, 100);
    }

    button.addEventListener('mousedown', start);
    button.addEventListener('mouseup', stop);
    button.addEventListener('mouseleave', stop);
    button.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Stop iOS double-tap zoom
      start(e);
    }, { passive: false });
    button.addEventListener('touchend', stop);
    button.addEventListener('touchcancel', stop);

    // Support keyboard activation (Enter/Space) and synthetic click
    button.addEventListener('click', (e) => {
      if (!hasMousedownHandled) {
        const base = getBaseDelta();
        setSyncOffset(currentSyncOffset + base);
      }
    });
  }

  // Option 1: Dynamic Step Resolution (0.1s | 1s | 5s) Nudge Buttons
  setupHoldToRepeat(btnSyncSub, () => -activeSyncStep);
  setupHoldToRepeat(btnSyncAdd, () => activeSyncStep);
  if (btnSyncReset) btnSyncReset.addEventListener('click', () => setSyncOffset(0.0));

  // Option 1: Step Resolution Multiplier Pills (0.1s, 1s, 5s)
  const syncStepPills = document.querySelectorAll('.sync-step-pill');
  syncStepPills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const stepVal = parseFloat(pill.dataset.step);
      if (!isNaN(stepVal)) {
        activeSyncStep = stepVal;
        syncStepPills.forEach((p) => p.classList.toggle('active', p === pill));
        showToast(`Sync step set to ±${stepVal}s`);
      }
    });
  });

  // Option 2: Inline Scrubber Slider Drawer (-30s to +30s)
  function toggleSyncDrawer(e) {
    if (e) e.stopPropagation();
    if (!syncScrubberDrawer) return;
    const isHidden = syncScrubberDrawer.classList.toggle('hidden');
    if (btnToggleSyncSlider) {
      btnToggleSyncSlider.classList.toggle('active', !isHidden);
    }
    if (!isHidden) {
      updateSyncDrawerUI();
    }
  }

  function closeSyncDrawer() {
    if (syncScrubberDrawer && !syncScrubberDrawer.classList.contains('hidden')) {
      syncScrubberDrawer.classList.add('hidden');
      if (btnToggleSyncSlider) btnToggleSyncSlider.classList.remove('active');
    }
  }

  if (btnToggleSyncSlider) btnToggleSyncSlider.addEventListener('click', toggleSyncDrawer);
  if (syncOffsetVal) syncOffsetVal.addEventListener('click', toggleSyncDrawer);
  if (syncScrubberDrawer) syncScrubberDrawer.addEventListener('click', (e) => e.stopPropagation());
  if (btnScrubberClose) btnScrubberClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSyncDrawer();
  });
  if (btnScrubberReset) btnScrubberReset.addEventListener('click', (e) => {
    e.stopPropagation();
    setSyncOffset(0.0);
  });
  if (btnScrubberHeaderReset) btnScrubberHeaderReset.addEventListener('click', (e) => {
    e.stopPropagation();
    setSyncOffset(0.0);
  });

  // Close scrubber drawer on clicks outside or Escape key
  document.addEventListener('click', (e) => {
    if (syncScrubberDrawer && !syncScrubberDrawer.classList.contains('hidden')) {
      if (!syncScrubberDrawer.contains(e.target) &&
          !btnToggleSyncSlider?.contains(e.target) &&
          !syncOffsetVal?.contains(e.target)) {
        closeSyncDrawer();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSyncDrawer();
    }
  });

  // Scrubber Slider Drag Input
  if (syncScrubberSlider) {
    syncScrubberSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        setSyncOffset(val);
      }
    });
  }

  // Scrubber Quick Preset Chips (-5s, -1s, +1s, +5s)
  document.querySelectorAll('.sync-preset-chip').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const step = btn.dataset.step;
      if (step) {
        const num = parseFloat(step);
        if (!isNaN(num)) {
          setSyncOffset(currentSyncOffset + num);
        }
      }
    });
  });

  // Browser Back / Forward History Navigation
  window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get('v') || urlParams.get('track');
    if (trackId && getTrackMeta(trackId)) {
      switchTrack(trackId, false);
    } else {
      showLandingSearch();
    }
  });

  // Volume Controls
  const btnVolume = document.getElementById('btn-volume');
  const volumeSlider = document.getElementById('volume-slider');
  const iconVolHigh = document.getElementById('icon-vol-high');
  const iconVolLow = document.getElementById('icon-vol-low');
  const iconVolMuted = document.getElementById('icon-vol-muted');

  let currentVolume = 100;
  let previousVolume = 100;
  let isMutedState = false;

  try {
    const saved = localStorage.getItem('lyricist_volume');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        currentVolume = parsed;
      }
    }
  } catch {}

  function updateVolumeUI(vol, muted) {
    if (volumeSlider) {
      volumeSlider.value = muted ? 0 : vol;
      const pct = muted ? 0 : vol;
      volumeSlider.style.background = `linear-gradient(to right, var(--accent-gold) 0%, var(--accent-gold) ${pct}%, rgba(255,255,255,0.18) ${pct}%, rgba(255,255,255,0.18) 100%)`;
    }

    if (iconVolHigh && iconVolLow && iconVolMuted) {
      iconVolHigh.classList.add('hidden');
      iconVolLow.classList.add('hidden');
      iconVolMuted.classList.add('hidden');

      if (muted || vol === 0) {
        iconVolMuted.classList.remove('hidden');
        if (btnVolume) btnVolume.title = 'Unmute (M)';
      } else if (vol <= 50) {
        iconVolLow.classList.remove('hidden');
        if (btnVolume) btnVolume.title = `Mute (M) • ${vol}%`;
      } else {
        iconVolHigh.classList.remove('hidden');
        if (btnVolume) btnVolume.title = `Mute (M) • ${vol}%`;
      }
    }
  }

  function applyVolume(vol, persist = true) {
    currentVolume = Math.max(0, Math.min(100, Math.round(vol)));
    if (currentVolume > 0) {
      isMutedState = false;
      playerController.unMute();
      playerController.setVolume(currentVolume);
    } else {
      isMutedState = true;
      playerController.mute();
    }
    updateVolumeUI(currentVolume, isMutedState);
    if (persist) {
      try {
        localStorage.setItem('lyricist_volume', currentVolume.toString());
      } catch {}
    }
  }

  function toggleMute() {
    if (isMutedState || currentVolume === 0) {
      isMutedState = false;
      const targetVol = previousVolume > 0 ? previousVolume : 80;
      applyVolume(targetVol);
      showToast(`🔊 Volume: ${targetVol}%`);
    } else {
      previousVolume = currentVolume;
      isMutedState = true;
      playerController.mute();
      updateVolumeUI(currentVolume, true);
      showToast('🔇 Muted');
    }
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      applyVolume(val, true);
    });
  }

  if (btnVolume) {
    btnVolume.addEventListener('click', toggleMute);
  }

  playerController.onReady(() => {
    applyVolume(currentVolume, false);
  });

  updateVolumeUI(currentVolume, isMutedState);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      playerController.togglePlay();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      btnPrevLine.click();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      btnNextLine.click();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      if (currentActiveIndex >= 0 && currentLyrics[currentActiveIndex]) {
        handleSeekToLine(currentActiveIndex, currentLyrics[currentActiveIndex].start);
      } else if (currentLyrics[0]) {
        handleSeekToLine(0, currentLyrics[0].start);
      }
    } else if ((e.key === '[' || e.key === '-') && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const step = e.shiftKey ? 5.0 : 0.5;
      setSyncOffset(currentSyncOffset - step);
      showToast(`⏱️ Sync: ${currentSyncOffset >= 0 ? '+' : ''}${currentSyncOffset.toFixed(1)}s`);
    } else if ((e.key === ']' || e.key === '+' || e.key === '=') && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const step = e.shiftKey ? 5.0 : 0.5;
      setSyncOffset(currentSyncOffset + step);
      showToast(`⏱️ Sync: ${currentSyncOffset >= 0 ? '+' : ''}${currentSyncOffset.toFixed(1)}s`);
    } else if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      const targetInput = (!currentTrackId || !heroSearchLanding || !heroSearchLanding.classList.contains('hidden'))
        ? heroSearchInput
        : ytSearchInput;
      if (targetInput) {
        targetInput.focus();
        targetInput.select();
      }
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleLyricsFullscreen();
    } else if (e.key === 'Escape') {
      if (isLyricsFullscreen) {
        toggleLyricsFullscreen(false);
      }
      closeWordDetails();
      closeSyncDrawer();
      if (ytResultsModal) ytResultsModal.classList.add('hidden');
      hideAllSuggestions();
    }
  });

  // PWA Install Prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaInstallBtn.classList.remove('hidden');
  });

  pwaInstallBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        pwaInstallBtn.classList.add('hidden');
      }
      deferredPrompt = null;
    }
  });
}

/**
 * Connect to YouTube Player Events
 */
function initPlayer(videoId, autoPlay = false) {
  if (!videoId) return;
  isPlayerInitialized = true;

  playerController.onReady(() => {
    playerOverlay.classList.add('hidden');
    const dur = playerController.getDuration();
    durationTimeTxt.textContent = formatTime(dur);
    if (autoPlay) {
      playerController.play();
    }
  });

  playerController.onStateChange((state, isPlaying) => {
    iconPlay.classList.toggle('hidden', isPlaying);
    iconPause.classList.toggle('hidden', !isPlaying);
  });

  // Connect 250ms timestamp polling to lyrics synchronizer
  playerController.onTimeUpdate(onPlayerTimeUpdate);

  playerController.init('youtube-player', videoId);
}

/**
 * PWA Service Worker Registration
 */
function initPWA() {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.info('A new version of Lyricist is available.');
      },
      onOfflineReady() {
        console.info('Lyricist is ready for offline use.');
      }
    });
  } catch (err) {
    console.warn('Service Worker registration skipped or not supported in this context:', err);
  }
}

/**
 * Theme Management: Light & Dark Mode
 */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  function getActiveTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function updateThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'light' ? '#f8fafc' : '#020617');
    }
    if (themeToggleBtn) {
      const iconSun = themeToggleBtn.querySelector('.icon-sun');
      const iconMoon = themeToggleBtn.querySelector('.icon-moon');
      if (iconSun && iconMoon) {
        // In dark mode: show sun icon (click to make light)
        // In light mode: show moon icon (click to make dark)
        iconSun.classList.toggle('hidden', theme === 'light');
        iconMoon.classList.toggle('hidden', theme !== 'light');
      }
      const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
      themeToggleBtn.setAttribute('title', label);
      themeToggleBtn.setAttribute('aria-label', label);
    }
  }

  // Sync icons with initial theme
  updateThemeUI(getActiveTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = getActiveTheme();
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('polilyrics_theme', next);
      updateThemeUI(next);
    });
  }

  // Auto-respond to system preference changes if user has not set an explicit override
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('polilyrics_theme')) {
        updateThemeUI(e.matches ? 'light' : 'dark');
      }
    });
  } catch {}
}

/**
 * Application Bootstrap
 */
function initApp() {
  initTheme();
  initLanguageRouting();
  initTrackSelection();
  initEvents();
  initViewModeSelector();
  initPWA();

  if (!currentTrackId) {
    showLandingSearch();
  } else {
    showPlayerView();
    loadSyncOffsetForTrack(currentTrackId);
    updateTrackInfo();
    reloadLyrics();
    initPlayer(currentTrackId, false);
  }
}

// Start app on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

if (typeof window !== 'undefined') {
  window.playSelectedVideoWithLyrics = playSelectedVideoWithLyrics;
  window.showLyricsLoading = showLyricsLoading;
}

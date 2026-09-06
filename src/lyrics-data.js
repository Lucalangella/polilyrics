/**
 * Synchronized Bilingual Lyrics Dataset Store
 * Holds dynamically searched and user-loaded tracks from YouTube and LRCLIB.
 * Persists recent dynamic tracks in localStorage.
 * Backed by an O(1) Map for constant-time lookups.
 */

export const TRACKS = [];
const tracksMap = new Map();

function syncMap() {
  tracksMap.clear();
  for (const t of TRACKS) {
    if (t && t.id) {
      tracksMap.set(t.id, t);
    }
  }
}

/**
 * Returns an array of synchronized lyrics objects containing { start, end, original, translated }
 * strictly conforming to the project requirements.
 *
 * @param {string} trackId - The YouTube track ID
 * @param {string} targetLang - The target translation language code (e.g. 'en', 'es', 'it', 'fr', 'de')
 * @returns {Array<{ start: number, end: number, original: string, translated: string, glossary: Object }>}
 */
export function getSynchronizedLyrics(trackId, targetLang = 'en') {
  const track = tracksMap.get(trackId);
  if (!track || !Array.isArray(track.lyrics)) return [];

  return track.lyrics.map((item) => {
    let translated = item.translations ? item.translations[targetLang] : null;
    if (!translated) {
      if (track.sourceLanguage && targetLang === track.sourceLanguage) {
        translated = item.original;
      } else {
        translated = (item.translations && item.translations.en) || item.original;
      }
    }

    return {
      start: item.start,
      end: item.end,
      original: item.original,
      translated: translated,
      glossary: item.glossary || {}
    };
  });
}

/**
 * Attaches or updates translations for a specific track and persists if dynamic
 */
export function updateTrackTranslations(trackId, targetLang, translatedLines) {
  const track = tracksMap.get(trackId);
  if (!track || !Array.isArray(track.lyrics)) return;

  track.lyrics.forEach((item, idx) => {
    if (!item.translations) item.translations = {};
    const trans = translatedLines[idx]?.translated || translatedLines[idx];
    if (trans) {
      const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(item.original);
      const isIdentical = hasLetters && trans.trim().toLowerCase() === item.original.trim().toLowerCase();
      if (!isIdentical || targetLang === 'en') {
        item.translations[targetLang] = trans;
      }
    }
  });

  registerDynamicTrack(track, true);
}

/**
 * Dynamic Tracks Persistence Key
 */
const DYNAMIC_TRACKS_KEY = 'polilyrics_dynamic_tracks';

function loadPersistedDynamicTracks() {
  try {
    const raw = localStorage.getItem(DYNAMIC_TRACKS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((t) => {
          if (t && t.id) {
            // Strip out any stale identical translations for non-English target languages
            if (Array.isArray(t.lyrics)) {
              t.lyrics.forEach((l) => {
                if (l && l.translations && typeof l.original === 'string') {
                  const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(l.original);
                  for (const [lang, val] of Object.entries(l.translations)) {
                    if (
                      lang !== 'en' &&
                      hasLetters &&
                      typeof val === 'string' &&
                      val.trim().toLowerCase() === l.original.trim().toLowerCase()
                    ) {
                      delete l.translations[lang];
                    }
                  }
                }
              });
            }
            const existing = tracksMap.get(t.id);
            if (existing) {
              const idx = TRACKS.indexOf(existing);
              if (idx >= 0) {
                TRACKS[idx] = { ...existing, ...t };
              }
            } else {
              TRACKS.push(t);
            }
            syncMap();
          }
        });
      }
    }
  } catch {}
  syncMap();
}

// Hydrate saved dynamic tracks on startup
loadPersistedDynamicTracks();

/**
 * Checks if a track exists in dataset (O(1))
 * @param {string} trackId
 */
export function hasTrack(trackId) {
  return tracksMap.has(trackId);
}

/**
 * Gets track metadata (O(1))
 * @param {string} trackId
 */
export function getTrackMeta(trackId) {
  return tracksMap.get(trackId) || null;
}

/**
 * Registers a dynamically searched or custom imported track
 * @param {Object} track
 * @param {boolean} persist
 */
export function registerDynamicTrack(track, persist = true) {
  if (!track || !track.id) return;
  const existing = tracksMap.get(track.id);
  if (existing) {
    const existingIdx = TRACKS.indexOf(existing);
    if (existingIdx >= 0) {
      TRACKS[existingIdx] = { ...existing, ...track };
    }
  } else {
    TRACKS.unshift(track); // Put newly added song at top
  }
  syncMap();

  if (persist) {
    try {
      // Store up to 30 most recent dynamically added songs
      const dynamicList = TRACKS.filter((t) => t.badge && (
        t.badge.includes('LRCLIB') ||
        t.badge.includes('YouTube') ||
        t.badge.includes('Custom') ||
        t.badge.includes('Verified')
      ));
      localStorage.setItem(DYNAMIC_TRACKS_KEY, JSON.stringify(dynamicList.slice(0, 30)));
    } catch {}
  }
}

/**
 * Returns all available tracks
 */
export function getAllTracks() {
  return TRACKS;
}

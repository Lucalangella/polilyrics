/**
 * Dynamic Translation Service
 * Translates arbitrary lyric lines into target languages (it, es, en, fr, de)
 * with robust multi-tiered endpoints and local caching.
 */

const CACHE_PREFIX = 'polilyrics_trans_v3_';
const MAX_STORAGE_KEYS = 1200;

/**
 * Fast zero-dependency language detector for song lyrics
 * Recognizes en, fr, es, it, de
 * @param {string} text
 * @returns {string} 2-letter ISO code
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  const lower = ` ${text.toLowerCase()} `;

  const patterns = {
    fr: [' le ', ' la ', ' les ', ' des ', ' dans ', ' est ', ' mon ', ' ton ', ' son ', ' vous ', ' nous ', ' pour ', ' avec ', ' qui ', ' que ', ' une ', ' un ', " c'est ", ' pas ', ' amour ', ' divague '],
    es: [' el ', ' la ', ' los ', ' las ', ' en ', ' de ', ' que ', ' por ', ' para ', ' con ', ' una ', ' un ', ' es ', ' del ', ' yo ', ' tú ', ' más ', ' corazón '],
    it: [' il ', ' la ', ' lo ', ' i ', ' gli ', ' le ', ' di ', ' che ', ' per ', ' con ', ' un ', ' una ', ' uno ', ' sono ', ' della ', ' nel ', ' amore ', ' tutto '],
    de: [' der ', ' die ', ' das ', ' und ', ' in ', ' den ', ' von ', ' zu ', ' mit ', ' sich ', ' des ', ' auf ', ' ist ', ' nicht ', ' ich '],
    en: [' the ', ' and ', ' to ', ' of ', ' a ', ' in ', ' that ', ' is ', ' was ', ' for ', ' on ', ' are ', ' with ', ' as ', ' it ', ' you ', ' me ', ' my ']
  };

  let topLang = 'en';
  let topScore = 0;

  for (const [lang, words] of Object.entries(patterns)) {
    let score = 0;
    for (const w of words) {
      if (lower.includes(w)) score++;
    }
    if (score > topScore) {
      topScore = score;
      topLang = lang;
    }
  }

  return topLang;
}

class TranslationService {
  constructor() {
    this.memoryCache = new Map();
    this.cleanCorruptedCache();
    this.enforceStorageLimit();
  }

  /**
   * Enforces an LRU storage limit on translation keys to prevent QuotaExceededError
   * @param {boolean} forcePrune - Whether to force eviction regardless of length
   */
  enforceStorageLimit(forcePrune = false) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keys.push(k);
        }
      }
      if (forcePrune || keys.length > MAX_STORAGE_KEYS) {
        const countToEvict = Math.max(10, Math.floor(keys.length * 0.25));
        const toEvict = keys.slice(0, countToEvict);
        for (const k of toEvict) {
          localStorage.removeItem(k);
          this.memoryCache.delete(k);
        }
      }
    } catch {
      // ignore
    }
  }

  /**
   * Purges corrupted or obsolete translations from localStorage
   */
  cleanCorruptedCache() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith('lingo_trans_') ||
           k.startsWith('lyricist_trans_') ||
           k.startsWith(CACHE_PREFIX))
        ) {
          // Immediately prune legacy namespaces
          if (k.startsWith('lingo_trans_') || k.startsWith('lyricist_trans_')) {
            keysToRemove.push(k);
            continue;
          }

          const val = localStorage.getItem(k);
          if (
            !val ||
            val.includes('INVALID LANGUAGE PAIR') ||
            val.includes('MYMEMORY WARNING') ||
            val.includes('chiamma Giro')
          ) {
            keysToRemove.push(k);
            continue;
          }

          // If cached value is identical to the key for non-English, it was an unfulfilled fallback
          const targetLang = k.slice(CACHE_PREFIX.length, CACHE_PREFIX.length + 2);
          const origText = k.slice(CACHE_PREFIX.length + 3);
          const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(origText);
          if (targetLang !== 'en' && hasLetters && val.trim().toLowerCase() === origText.trim().toLowerCase()) {
            keysToRemove.push(k);
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }

  /**
   * Generates a cache key
   */
  getCacheKey(text, targetLang) {
    return `${CACHE_PREFIX}${targetLang}_${text.toLowerCase().trim()}`;
  }

  /**
   * Gets cached translation if available and valid
   */
  getFromCache(text, targetLang) {
    if (!text) return null;
    const clean = text.trim();
    const key = this.getCacheKey(clean, targetLang);

    let val = this.memoryCache.get(key);
    if (!val) {
      try {
        val = localStorage.getItem(key);
        if (val) {
          this.memoryCache.set(key, val);
        }
      } catch {
        // ignore
      }
    }

    if (!val) return null;

    // Invalidate garbage or identical strings when expecting a foreign language
    const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(clean);
    if (
      val.includes('INVALID') ||
      val.includes('MYMEMORY WARNING') ||
      val.includes('chiamma Giro') ||
      (targetLang !== 'en' && hasLetters && val.trim().toLowerCase() === clean.toLowerCase())
    ) {
      this.memoryCache.delete(key);
      try {
        localStorage.removeItem(key);
      } catch {}
      return null;
    }

    return val;
  }

  /**
   * Saves translation to cache
   */
  saveToCache(text, targetLang, translated) {
    if (!text || !translated) return;
    const cleanText = text.trim();
    const cleanTrans = translated.trim();

    if (
      !cleanTrans ||
      cleanTrans.includes('INVALID LANGUAGE PAIR') ||
      cleanTrans.includes('MYMEMORY WARNING') ||
      cleanTrans.includes('chiamma Giro')
    ) {
      return;
    }

    // Never cache identical text as a translation for another language if it contains words
    const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(cleanText);
    if (targetLang !== 'en' && hasLetters && cleanTrans.toLowerCase() === cleanText.toLowerCase()) {
      return;
    }

    const key = this.getCacheKey(cleanText, targetLang);
    this.memoryCache.set(key, cleanTrans);
    try {
      localStorage.setItem(key, cleanTrans);
    } catch {
      // Quota exceeded safeguard: evict oldest keys and retry
      this.enforceStorageLimit(true);
      try {
        localStorage.setItem(key, cleanTrans);
      } catch {}
    }
  }

  /**
   * Translates a single phrase via Google Chrome Extension Neural API with MyMemory fallback
   * @param {string} text
   * @param {string} targetLang
   * @param {AbortSignal} [signal]
   * @returns {Promise<string>}
   */
  async translatePhrase(text, targetLang = 'it', signal = null) {
    if (signal?.aborted) return text;
    const clean = text.trim();
    if (!clean) return '';

    // Check cache first
    const cached = this.getFromCache(clean, targetLang);
    if (cached) return cached;

    // 1. Google Translate Neural API (High quality, no rate-limit blocking)
    const googleUrls = [
      `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}&q=${encodeURIComponent(clean)}`,
      `https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}&q=${encodeURIComponent(clean)}`
    ];

    for (const url of googleUrls) {
      if (signal?.aborted) return clean;
      try {
        const res = await fetch(url, { signal });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const first = data[0];
            const trans = (Array.isArray(first) ? first[0] : first)?.trim();
            if (trans) {
              this.saveToCache(clean, targetLang, trans);
              return trans;
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return clean;
      }
    }

    if (signal?.aborted) return clean;

    // 2. MyMemory fallback
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=autodetect|${targetLang}`;
      const res = await fetch(url, { signal });
      if (res.ok) {
        const data = await res.json();
        const translated = data?.responseData?.translatedText?.trim();
        if (
          translated &&
          !translated.startsWith('MYMEMORY WARNING') &&
          !translated.includes('INVALID') &&
          !translated.includes('chiamma Giro')
        ) {
          this.saveToCache(clean, targetLang, translated);
          return translated;
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('MyMemory fallback error:', err);
      }
    }

    // Fallback if translation fails
    return clean;
  }

  /**
   * Translates multiple lines in a single batch request via Google Translate
   * @param {string[]} linesArray
   * @param {string} targetLang
   * @param {AbortSignal} [signal]
   * @returns {Promise<string[]|null>}
   */
  async translateBatchGoogle(linesArray, targetLang, signal = null) {
    if (!linesArray || linesArray.length === 0 || signal?.aborted) return [];
    const body = linesArray.map((l) => `q=${encodeURIComponent(l)}`).join('&');

    const googleEndpoints = [
      `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}`,
      `https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}`
    ];

    for (const url of googleEndpoints) {
      if (signal?.aborted) return null;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
          signal
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length === linesArray.length) {
            return data.map((item) => {
              if (Array.isArray(item)) return (item[0] || '').trim();
              return typeof item === 'string' ? item.trim() : '';
            });
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return null;
      }
    }
    return null;
  }

  /**
   * Translates an array of lyric lines { start, end, original } into { start, end, original, translated }
   * Uses batch Google Translate for instant high-accuracy neural translation.
   * @param {Array<{ start: number, end: number, original: string }>} lines
   * @param {string} targetLang - Target language code (e.g. 'it', 'es', 'en', 'fr', 'de')
   * @param {Function} [onProgress] - (completedCount, totalCount)
   * @param {AbortSignal} [signal]
   * @returns {Promise<Array<{ start: number, end: number, original: string, translated: string }>>}
   */
  async translateLines(lines, targetLang = 'it', onProgress = null, signal = null) {
    if (!Array.isArray(lines) || lines.length === 0) return [];

    const total = lines.length;
    let completed = 0;

    const results = lines.map((item) => ({
      start: item.start,
      end: item.end,
      original: item.original,
      translated: this.getFromCache(item.original, targetLang) || item.original
    }));

    // Identify indices that need fetching
    const pendingIndices = [];
    results.forEach((item, idx) => {
      const cached = this.getFromCache(item.original, targetLang);
      if (!cached) {
        pendingIndices.push(idx);
      } else {
        results[idx].translated = cached;
        completed++;
      }
    });

    if (onProgress) onProgress(completed, total);
    if (pendingIndices.length === 0 || signal?.aborted) return results;

    // Process pending lines in batches of 20
    const CHUNK_SIZE = 20;
    for (let i = 0; i < pendingIndices.length; i += CHUNK_SIZE) {
      if (signal?.aborted) return results;

      const chunkIndices = pendingIndices.slice(i, i + CHUNK_SIZE);
      const chunkOriginals = chunkIndices.map((idx) => lines[idx].original);

      // Attempt fast neural batch translation
      const batchResult = await this.translateBatchGoogle(chunkOriginals, targetLang, signal);

      if (batchResult && batchResult.length === chunkOriginals.length) {
        chunkIndices.forEach((origIdx, cIdx) => {
          const trans = batchResult[cIdx] || lines[origIdx].original;
          results[origIdx].translated = trans;
          this.saveToCache(lines[origIdx].original, targetLang, trans);
          completed++;
        });
      } else {
        if (signal?.aborted) return results;
        // Fallback to per-phrase translation for this chunk
        await Promise.all(
          chunkIndices.map(async (origIdx) => {
            if (signal?.aborted) return;
            const originalText = lines[origIdx].original;
            const translated = await this.translatePhrase(originalText, targetLang, signal);
            results[origIdx].translated = translated;
            completed++;
          })
        );
      }

      if (onProgress) onProgress(completed, total);
    }

    return results;
  }
}

export const translationService = new TranslationService();

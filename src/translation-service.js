/**
 * Dynamic Translation Service
 * Translates arbitrary lyric lines into target languages (it, es, en, fr, de)
 * with robust local caching.
 */

const CACHE_PREFIX = 'lyricist_trans_v2_';

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
  }

  /**
   * Purges corrupted or obsolete translations from localStorage
   */
  cleanCorruptedCache() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('lingo_trans_') || k.startsWith(CACHE_PREFIX))) {
          const val = localStorage.getItem(k);
          if (
            !val ||
            val.includes('INVALID LANGUAGE PAIR') ||
            val.includes('MYMEMORY WARNING') ||
            val.includes('chiamma Giro') ||
            k.startsWith('lingo_trans_')
          ) {
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
   * Gets cached translation if available
   */
  getFromCache(text, targetLang) {
    const key = this.getCacheKey(text, targetLang);
    if (this.memoryCache.has(key)) {
      const val = this.memoryCache.get(key);
      if (val && !val.includes('INVALID') && !val.includes('chiamma Giro')) return val;
    }
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        if (stored.includes('INVALID') || stored.includes('MYMEMORY WARNING') || stored.includes('chiamma Giro')) {
          localStorage.removeItem(key);
          return null;
        }
        this.memoryCache.set(key, stored);
        return stored;
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Saves translation to cache
   */
  saveToCache(text, targetLang, translated) {
    if (
      !translated ||
      translated.includes('INVALID LANGUAGE PAIR') ||
      translated.includes('MYMEMORY WARNING') ||
      translated.includes('chiamma Giro')
    ) {
      return;
    }
    const key = this.getCacheKey(text, targetLang);
    this.memoryCache.set(key, translated);
    try {
      localStorage.setItem(key, translated);
    } catch {
      // ignore quota errors
    }
  }

  /**
   * Translates a single phrase via Google Translate Neural API with MyMemory fallback
   * @param {string} text
   * @param {string} targetLang
   * @param {string} sourceLang
   * @returns {Promise<string>}
   */
  async translatePhrase(text, targetLang = 'it', sourceLang = 'auto') {
    const clean = text.trim();
    if (!clean) return '';

    // Check cache first
    const cached = this.getFromCache(clean, targetLang);
    if (cached) return cached;

    // Detect source language if set to auto
    let src = sourceLang;
    if (!src || src === 'auto') {
      src = detectLanguage(clean);
    }

    // If source and target are identical, no translation needed
    if (src.toLowerCase() === targetLang.toLowerCase()) {
      this.saveToCache(clean, targetLang, clean);
      return clean;
    }

    // 1. Google Translate Neural API (High quality, zero crowdsourced jokes)
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${targetLang}&dt=t&q=${encodeURIComponent(clean)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map((item) => item[0]).join('').trim();
          if (translated) {
            this.saveToCache(clean, targetLang, translated);
            return translated;
          }
        }
      }
    } catch (err) {
      console.warn('Google Translate phrase error:', err);
    }

    // 2. MyMemory fallback
    const langPair = `${src}|${targetLang}`;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${langPair}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const translated = data?.responseData?.translatedText;
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
      console.warn('MyMemory fallback error:', err);
    }

    // Fallback if translation fails
    return clean;
  }

  /**
   * Translates multiple lines in a single batch request via Google Translate
   * @param {string[]} linesArray
   * @param {string} targetLang
   * @param {string} sourceLang
   * @returns {Promise<string[]|null>}
   */
  async translateBatchGoogle(linesArray, targetLang, sourceLang = 'auto') {
    if (!linesArray || linesArray.length === 0) return [];
    const q = linesArray.join('\n');
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const rawJoined = data[0].map((item) => item[0]).join('');
          const splitted = rawJoined.split('\n').map((l) => l.trim());
          if (splitted.length === linesArray.length) {
            return splitted;
          }
        }
      }
    } catch (err) {
      console.warn('Google Translate batch error:', err);
    }
    return null;
  }

  /**
   * Translates an array of lyric lines { start, end, original } into { start, end, original, translated }
   * Uses batch Google Translate for instant high-accuracy neural translation.
   * @param {Array<{ start: number, end: number, original: string }>} lines
   * @param {string} targetLang - Target language code (e.g. 'it', 'es', 'en', 'fr', 'de')
   * @param {Function} onProgress - (completedCount, totalCount)
   * @returns {Promise<Array<{ start: number, end: number, original: string, translated: string }>>}
   */
  async translateLines(lines, targetLang = 'it', onProgress = null) {
    if (!Array.isArray(lines) || lines.length === 0) return [];

    const total = lines.length;
    let completed = 0;

    // Detect overall dominant language across all lyrics lines
    const sampleText = lines.slice(0, 10).map((l) => l.original).join(' ');
    const dominantSourceLang = detectLanguage(sampleText);

    const results = lines.map((item) => ({
      start: item.start,
      end: item.end,
      original: item.original,
      translated: this.getFromCache(item.original, targetLang) || item.original
    }));

    // Identify indices that need fetching
    const pendingIndices = [];
    results.forEach((item, idx) => {
      if (!this.getFromCache(item.original, targetLang)) {
        pendingIndices.push(idx);
      } else {
        completed++;
      }
    });

    if (onProgress) onProgress(completed, total);
    if (pendingIndices.length === 0) return results;

    // Process pending lines in batches of 20
    const CHUNK_SIZE = 20;
    for (let i = 0; i < pendingIndices.length; i += CHUNK_SIZE) {
      const chunkIndices = pendingIndices.slice(i, i + CHUNK_SIZE);
      const chunkOriginals = chunkIndices.map((idx) => lines[idx].original);

      // Attempt fast neural batch translation
      const batchResult = await this.translateBatchGoogle(chunkOriginals, targetLang, dominantSourceLang);

      if (batchResult && batchResult.length === chunkOriginals.length) {
        chunkIndices.forEach((origIdx, cIdx) => {
          const trans = batchResult[cIdx] || lines[origIdx].original;
          results[origIdx].translated = trans;
          this.saveToCache(lines[origIdx].original, targetLang, trans);
          completed++;
        });
      } else {
        // Fallback to per-phrase translation for this chunk
        await Promise.all(
          chunkIndices.map(async (origIdx) => {
            const originalText = lines[origIdx].original;
            const translated = await this.translatePhrase(originalText, targetLang, dominantSourceLang);
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

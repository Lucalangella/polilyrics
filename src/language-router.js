/**
 * Auto Language Routing Utility
 * Detects browser language (navigator.language) as the default translation target,
 * with support for in-memory and localStorage overrides.
 */

const STORAGE_KEY = 'lingobeats_target_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

class LanguageRouter {
  constructor() {
    this.inMemoryOverride = null;
    this.listeners = new Set();
    this.detectedLanguage = this.detectSystemLanguage();
  }

  /**
   * Detects the browser language from navigator.language
   * @returns {string} 2-letter ISO code
   */
  detectSystemLanguage() {
    try {
      const browserLang = (
        (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en'
      ).toLowerCase();
      
      const primaryCode = browserLang.split('-')[0];
      const match = SUPPORTED_LANGUAGES.find((l) => l.code === primaryCode);
      return match ? match.code : 'en';
    } catch {
      return 'en';
    }
  }

  /**
   * Gets the active target translation language
   * Hierarchy: In-memory override -> localStorage override -> navigator.language -> 'en'
   * @returns {string} 2-letter language code
   */
  getCurrentLanguage() {
    if (this.inMemoryOverride) {
      return this.inMemoryOverride;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        return stored;
      }
    } catch {
      // LocalStorage access may be denied in certain sandboxes
    }

    return this.detectedLanguage;
  }

  /**
   * Checks if current language is the auto-detected system language (no manual override)
   * @returns {boolean}
   */
  isAutoDetected() {
    if (this.inMemoryOverride) return false;
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  }

  /**
   * Sets the target translation language with optional persistence
   * @param {string} langCode - The 2-letter code
   * @param {boolean} persist - Whether to save to localStorage
   */
  setLanguage(langCode, persist = true) {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      console.warn(`Language ${langCode} is not supported. Keeping ${this.getCurrentLanguage()}`);
      return;
    }

    this.inMemoryOverride = langCode;

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, langCode);
      } catch (err) {
        console.warn('Unable to persist target language to localStorage:', err);
      }
    }

    this.notifyListeners(langCode);
  }

  /**
   * Resets language back to auto-detected system language
   */
  resetToAuto() {
    this.inMemoryOverride = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    const detected = this.detectSystemLanguage();
    this.detectedLanguage = detected;
    this.notifyListeners(detected);
  }

  /**
   * Subscribes a callback to language change events
   * @param {Function} callback - Called with (newLangCode)
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(langCode) {
    for (const listener of this.listeners) {
      try {
        listener(langCode);
      } catch (err) {
        console.error('Error in language change listener:', err);
      }
    }
  }

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
}

export const languageRouter = new LanguageRouter();

/**
 * Universal Synchronized Lyrics Service
 * Integrates LRCLIB open synchronized lyrics API and provides robust LRC parsing.
 */

const LRCLIB_BASE_URL = 'https://lrclib.net/api';

/**
 * Parses LRC formatted timestamped lyrics into array of { start, end, original }
 * Example: [00:15.20] Dites-moi d'où il vient -> { start: 15.2, end: 18.0, original: "..." }
 * @param {string} lrcString
 * @param {number} totalDuration - Estimated duration in seconds
 * @returns {Array<{ start: number, end: number, original: string }>}
 */
export function parseLrc(lrcString, totalDuration = 240) {
  if (!lrcString || typeof lrcString !== 'string') return [];

  const lines = lrcString.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line has timestamp tags
    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length === 0) continue;

    // Extract text after all timestamp tags
    const cleanText = trimmed.replace(timeRegex, '').trim();
    if (!cleanText) continue; // Skip empty instrumental tags

    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;
      const startTime = minutes * 60 + seconds + fraction;

      result.push({
        start: parseFloat(startTime.toFixed(2)),
        original: cleanText
      });
    }
  }

  // Sort by start time
  result.sort((a, b) => a.start - b.start);

  // Calculate end times based on consecutive lines
  for (let i = 0; i < result.length; i++) {
    if (i < result.length - 1) {
      const nextStart = result[i + 1].start;
      // Line end is when next line starts (or max 7.0s if long pause)
      result[i].end = parseFloat(Math.min(nextStart, result[i].start + 7.0).toFixed(2));
      if (result[i].end <= result[i].start) {
        result[i].end = parseFloat((result[i].start + 0.5).toFixed(2));
      }
    } else {
      result[i].end = parseFloat((result[i].start + 5.0).toFixed(2));
    }
  }

  return result;
}

/**
 * Parses plain text lyrics without timestamps into cadenced synchronized lines
 * @param {string} plainText
 * @param {number} duration
 */
export function parsePlainTextToCadence(plainText, duration = 180) {
  if (!plainText) return [];
  const rawLines = plainText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  const introOffset = 10; // Start lyrics after 10s intro
  const usableDuration = Math.max(20, duration - introOffset - 10);
  const timePerLine = usableDuration / rawLines.length;

  return rawLines.map((line, idx) => {
    const start = parseFloat((introOffset + idx * timePerLine).toFixed(2));
    const end = parseFloat((start + Math.min(timePerLine, 6)).toFixed(2));
    return {
      start,
      end,
      original: line
    };
  });
}

/**
 * Searches LRCLIB for song lyrics
 * @param {string} query - Track name, artist, or combined query
 * @returns {Promise<Array<Object>>}
 */
export async function searchLrclib(query) {
  if (!query || !query.trim()) return [];

  try {
    const res = await fetch(`${LRCLIB_BASE_URL}/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) {
      console.warn('LRCLIB search response status:', res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Failed to fetch from LRCLIB:', err);
    return [];
  }
}

/**
 * Fetches exact matched lyrics from LRCLIB by track name and artist name
 * @param {string} trackName
 * @param {string} artistName
 * @returns {Promise<Object|null>}
 */
export async function getLrclibExact(trackName, artistName) {
  if (!trackName || !trackName.trim()) return null;
  const t = trackName.trim();
  const a = (artistName || '').trim();

  let url = `${LRCLIB_BASE_URL}/get?track_name=${encodeURIComponent(t)}`;
  if (a) {
    url += `&artist_name=${encodeURIComponent(a)}`;
  }

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.syncedLyrics || data.plainLyrics)) {
        return data;
      }
    }
  } catch (err) {
    // ignore
  }

  return null;
}

/**
 * Parses artist and title from messy YouTube video titles and channels
 * @param {string} videoTitle
 * @param {string} channelName
 * @returns {{ artist: string, title: string }}
 */
export function parseArtistAndTitle(videoTitle, channelName = '') {
  if (!videoTitle) return { artist: '', title: '' };

  let clean = videoTitle
    .replace(/\[.*?\]/g, ' ')
    .replace(/\((official|music|video|audio|lyrics?|hd|hq|4k|remaster\w*|du film|from the movie|soundtrack|version|clip officiel).*?\)/gi, ' ')
    .replace(/official\s*(music\s*)?video/gi, ' ')
    .replace(/official\s*audio/gi, ' ')
    .trim();

  const parts = clean.split(/\s*[-–—:|]\s*/).map((p) => p.trim()).filter(Boolean);

  let artist = '';
  let title = '';

  const cleanChannel = (channelName || '')
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/VEVO$/i, '')
    .replace(/Official$/i, '')
    .replace(/Records$/i, '')
    .trim();

  if (parts.length >= 3) {
    // Check if parts[0] is film/album prefix (e.g. "LA BOUM - Reality - Richard Sanderson")
    if (cleanChannel && parts[2].toLowerCase().includes(cleanChannel.toLowerCase())) {
      artist = parts[2];
      title = parts[1];
    } else if (cleanChannel && parts[0].toLowerCase().includes(cleanChannel.toLowerCase())) {
      artist = parts[0];
      title = parts[1];
    } else {
      // Default for 3-part: Movie/Show - Song - Artist
      title = parts[1];
      artist = parts[2] || parts[0];
    }
  } else if (parts.length === 2) {
    if (cleanChannel && parts[1].toLowerCase().includes(cleanChannel.toLowerCase())) {
      title = parts[0];
      artist = parts[1];
    } else {
      artist = parts[0];
      title = parts[1];
    }
  } else {
    title = clean;
    artist = cleanChannel;
  }

  return {
    artist: artist.trim(),
    title: title.trim()
  };
}

/**
 * Selects the best LRCLIB lyric candidate using duration proximity,
 * title similarity, and synced lyric priority.
 * Discards candidates differing by > 30 seconds from video duration.
 * @param {Array<Object>} results
 * @param {number} videoDurationSec
 * @param {string} parsedTitle
 * @param {string} parsedArtist
 * @returns {Object|null}
 */
export function pickBestLrcResult(results, videoDurationSec = 0, parsedTitle = '', parsedArtist = '') {
  if (!results || results.length === 0) return null;

  const titleLower = parsedTitle.toLowerCase().trim();
  const artistLower = parsedArtist.toLowerCase().trim();

  // Filter candidates within 30s of video duration if video length is known
  let candidates = results.slice();
  if (videoDurationSec > 0) {
    const validDur = candidates.filter((item) => {
      if (!item.duration) return true;
      const diff = Math.abs(item.duration - videoDurationSec);
      return diff <= 30;
    });
    if (validDur.length > 0) {
      candidates = validDur;
    } else {
      // Allow up to 45s diff for music video intros/outros
      const extendedDur = candidates.filter((item) => {
        if (!item.duration) return true;
        return Math.abs(item.duration - videoDurationSec) <= 45;
      });
      if (extendedDur.length > 0) {
        candidates = extendedDur;
      }
    }
  }

  const scored = candidates.map((item) => {
    let score = 0;
    const itemTrack = (item.trackName || item.name || '').toLowerCase();
    const itemArtist = (item.artistName || '').toLowerCase();

    // High priority for synced lyrics
    if (item.syncedLyrics) score += 50;

    // Title match
    if (titleLower) {
      if (itemTrack === titleLower) score += 45;
      else if (itemTrack.includes(titleLower) || titleLower.includes(itemTrack)) score += 30;
    }

    // Artist match
    if (artistLower) {
      if (itemArtist === artistLower) score += 45;
      else if (itemArtist.includes(artistLower) || artistLower.includes(itemArtist)) score += 30;
    }

    // Duration proximity
    if (videoDurationSec > 0 && item.duration > 0) {
      const diff = Math.abs(item.duration - videoDurationSec);
      if (diff <= 3) score += 30;
      else if (diff <= 10) score += 20;
      else if (diff <= 25) score += 10;
      else score -= 25;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item || candidates[0];
}

/**
 * Extracts a YouTube Video ID from any URL format or bare ID
 * Formats supported:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - VIDEO_ID (11 chars)
 * @param {string} input
 * @returns {string|null}
 */
export function extractYouTubeId(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // Bare 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

let jsonpCounter = 0;

/**
 * Fetches real-time search suggestions directly from YouTube's complete API via JSONP.
 * Bypasses browser CORS completely with sub-100ms response time.
 * @param {string} query
 * @returns {Promise<string[]>}
 */
export function fetchYouTubeSuggestions(query) {
  if (!query || !query.trim()) return Promise.resolve([]);

  const trimmed = query.trim();

  return new Promise((resolve) => {
    const callbackName = `__yt_suggest_${Date.now()}_${++jsonpCounter}`;
    const script = document.createElement('script');
    let isSettled = false;

    const cleanup = () => {
      if (window[callbackName]) {
        try {
          delete window[callbackName];
        } catch {
          window[callbackName] = undefined;
        }
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timeoutId = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        cleanup();
        resolve([]);
      }
    }, 2500);

    window[callbackName] = (data) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutId);
      cleanup();

      if (Array.isArray(data) && Array.isArray(data[1])) {
        const suggestions = data[1]
          .map((item) => {
            if (typeof item === 'string') return item;
            if (Array.isArray(item) && typeof item[0] === 'string') return item[0];
            return null;
          })
          .filter(Boolean);
        resolve(suggestions);
      } else {
        resolve([]);
      }
    };

    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&hl=en&gl=us&q=${encodeURIComponent(trimmed)}&jsonp=${callbackName}`;
    script.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve([]);
      }
    };

    document.head.appendChild(script);
  });
}

/**
 * Fetches video metadata/title via noembed oEmbed (no API key required)
 * @param {string} videoId
 * @returns {Promise<string|null>}
 */
export async function fetchYouTubeTitle(videoId) {
  if (!videoId) return null;
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (res.ok) {
      const data = await res.json();
      return data.title || null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Automatically searches and resolves a YouTube video ID for any song query.
 * Calls the local search middleware with sub-200ms response time and zero user prompts.
 * @param {string} query
 * @returns {Promise<string|null>}
 */
export async function searchYouTubeVideoId(query) {
  if (!query || !query.trim()) return null;
  const trimmed = query.trim();

  try {
    const res = await fetch(`/api/yt-search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.videoId) {
        return data.videoId;
      }
    }
  } catch (err) {
    console.warn('Failed to resolve video ID via search endpoint:', err);
  }

  return null;
}

/**
 * Searches and returns a full list of matching YouTube videos with metadata,
 * including thumbnails, titles, artist channels, and durations.
 * @param {string} query
 * @returns {Promise<Array<{ videoId: string, title: string, channel: string, duration: string, thumbnail: string }>>}
 */
export async function searchYouTubeVideos(query) {
  if (!query || !query.trim()) return [];
  const trimmed = query.trim();

  try {
    const res = await fetch(`/api/yt-search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.videos) && data.videos.length > 0) {
        return data.videos;
      }
      if (data && data.videoId) {
        return [{
          videoId: data.videoId,
          title: trimmed,
          channel: 'YouTube Video',
          duration: '',
          thumbnail: `https://i.ytimg.com/vi/${data.videoId}/mqdefault.jpg`
        }];
      }
    }
  } catch (err) {
    console.warn('Failed to search YouTube videos:', err);
  }

  return [];
}

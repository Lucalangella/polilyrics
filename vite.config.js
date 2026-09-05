import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function classifyOfficial(title, channel, badges = []) {
  const isVerifiedArtist = badges.some((b) => /artist/i.test(b));
  const isVerifiedChannel = badges.some((b) => /verified/i.test(b));
  const isTopic = /-\s*Topic$/i.test(channel) || /-\s*Topic\b/i.test(channel);
  const isVevo = /vevo/i.test(channel);
  const isRecordLabel = /(records|recordings|music|entertainment|sound)/i.test(channel) && (isVerifiedChannel || isVerifiedArtist);

  const titleLower = title.toLowerCase();
  const hasOfficialVideoMarker = /official\s*(music\s*)?video/i.test(title) || /clip\s*officiel/i.test(title) || /vid[eé]o\s*officielle/i.test(title) || /video\s*oficial/i.test(title);
  const hasOfficialAudioMarker = /official\s*(audio|track)/i.test(title) || /\[official audio\]/i.test(title) || /\(official audio\)/i.test(title) || /audio\s*oficial/i.test(title);
  const hasLyricVideoMarker = /(official\s*)?lyric\s*video/i.test(title);
  const hasVisualizerMarker = /visualizer/i.test(title);

  const isDisqualified = /(reaction\b|cover\b|parody|interview|trailer|teaser|scene\b|clip\b(?!.*officiel)|sped up|slowed|nightcore|karaoke\b|instrumental\b|mashup)/i.test(titleLower);

  let isOfficial = false;
  let officialType = '';

  if (isTopic) {
    isOfficial = true;
    officialType = 'Official Audio';
  } else if ((isVerifiedArtist || isVevo) && !isDisqualified) {
    isOfficial = true;
    officialType = hasOfficialAudioMarker ? 'Official Audio' : 'Official Video';
  } else if ((hasOfficialVideoMarker || hasOfficialAudioMarker) && !isDisqualified) {
    isOfficial = true;
    officialType = hasOfficialAudioMarker ? 'Official Audio' : 'Official Video';
  } else if (isRecordLabel && !isDisqualified) {
    isOfficial = true;
    officialType = 'Official Release';
  } else if (hasLyricVideoMarker && !isDisqualified) {
    isOfficial = true;
    officialType = 'Official Lyric Video';
  } else if (hasVisualizerMarker && !isDisqualified) {
    isOfficial = true;
    officialType = 'Official Visualizer';
  }

  return { isOfficial, officialType, isDisqualified };
}

function youtubeSearchPlugin() {
  const handler = async (req, res, next) => {
    if (req.url && req.url.startsWith('/api/yt-search')) {
      const urlObj = new URL(req.url, 'http://localhost');
      const q = urlObj.searchParams.get('q');
      const officialOnly = urlObj.searchParams.get('official') !== '0'; // default true
      if (!q) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Query parameter q is required' }));
        return;
      }
      try {
        const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });
        const html = await response.text();

        const allVideos = [];
        const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s) || html.match(/var ytInitialData\s*=\s*({.+?});/s);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
            for (const sec of sections) {
              const items = sec?.itemSectionRenderer?.contents || [];
              for (const it of items) {
                if (it.videoRenderer) {
                  const vr = it.videoRenderer;
                  const videoId = vr.videoId;
                  const title = vr.title?.runs?.map((r) => r.text).join('') || '';
                  const channel = vr.ownerText?.runs?.map((r) => r.text).join('') || vr.shortBylineText?.runs?.map((r) => r.text).join('') || 'YouTube Artist';
                  const duration = vr.lengthText?.simpleText || '';
                  const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                  const badges = vr.ownerBadges?.map((b) => b.metadataBadgeRenderer?.style || b.metadataBadgeRenderer?.tooltip || '').filter(Boolean) || [];

                  const { isOfficial, officialType, isDisqualified } = classifyOfficial(title, channel, badges);

                  if (videoId && title && !isDisqualified) {
                    allVideos.push({ videoId, title, channel, duration, thumbnail, isOfficial, officialType });
                  }
                }
              }
            }
          } catch {
            // ignore
          }
        }

        // Regex fallback
        if (allVideos.length === 0) {
          const regex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})","thumbnail":\{"thumbnails":\[.+?\]\},"title":\{"runs":\[\{"text":"(.*?)"\}/g;
          let m;
          while ((m = regex.exec(html)) !== null) {
            allVideos.push({
              videoId: m[1],
              title: m[2].replace(/\\"/g, '"'),
              channel: 'YouTube Artist',
              duration: '',
              thumbnail: `https://i.ytimg.com/vi/${m[1]}/mqdefault.jpg`,
              isOfficial: false,
              officialType: ''
            });
            if (allVideos.length >= 10) break;
          }
        }

        // Filter for official releases
        const officialVideos = allVideos.filter((v) => v.isOfficial);
        // If official releases are found, return them (and prioritize them at top)
        const videos = (officialOnly && officialVideos.length > 0)
          ? officialVideos
          : (officialVideos.length > 0 ? [...officialVideos, ...allVideos.filter((v) => !v.isOfficial)] : allVideos);

        const videoId = videos.length > 0 ? videos[0].videoId : null;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ videoId, videos }));
        return;
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: String(err) }));
        return;
      }
    }
    next();
  };

  return {
    name: 'youtube-search-middleware',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      ignored: [
        '**/Library/**',
        '**/Dropbox/**',
        '**/Downloads/**',
        '**/Movies/**',
        '**/Music/**',
        '**/Pictures/**',
        '**/.git/**',
        '**/dist/**',
        '**/node_modules/**'
      ]
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  },
  plugins: [
    youtubeSearchPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Lyricist - Dual-Subtitle Music Player',
        short_name: 'Lyricist',
        description: 'Interactive dual-subtitle player syncing timestamped bilingual lyrics with YouTube',
        theme_color: '#0f172a',
        background_color: '#0b0f19',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});

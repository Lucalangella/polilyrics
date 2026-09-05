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
    isOfficial = true; officialType = 'Official Audio';
  } else if ((isVerifiedArtist || isVevo) && !isDisqualified) {
    isOfficial = true; officialType = hasOfficialAudioMarker ? 'Official Audio' : 'Official Video';
  } else if ((hasOfficialVideoMarker || hasOfficialAudioMarker) && !isDisqualified) {
    isOfficial = true; officialType = hasOfficialAudioMarker ? 'Official Audio' : 'Official Video';
  } else if (isRecordLabel && !isDisqualified) {
    isOfficial = true; officialType = 'Official Release';
  } else if (hasLyricVideoMarker && !isDisqualified) {
    isOfficial = true; officialType = 'Official Lyric Video';
  } else if (hasVisualizerMarker && !isDisqualified) {
    isOfficial = true; officialType = 'Official Visualizer';
  }

  return { isOfficial, officialType, isDisqualified };
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const officialOnly = url.searchParams.get('official') !== '0';

  if (!q) {
    return new Response(JSON.stringify({ error: 'Query parameter q is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
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
      } catch { /* ignore */ }
    }

    const officialVideos = allVideos.filter((v) => v.isOfficial);
    const videos = (officialOnly && officialVideos.length > 0)
      ? officialVideos
      : (officialVideos.length > 0 ? [...officialVideos, ...allVideos.filter((v) => !v.isOfficial)] : allVideos);

    const videoId = videos.length > 0 ? videos[0].videoId : null;
    return new Response(JSON.stringify({ videoId, videos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

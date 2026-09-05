const FALLBACK_TRACKS = [
  { artist: 'Billie Eilish', name: 'Birds of a Feather' },
  { artist: 'Sabrina Carpenter', name: 'Espresso' },
  { artist: 'Chappell Roan', name: 'Good Luck, Babe!' },
  { artist: 'Lady Gaga & Bruno Mars', name: 'Die With A Smile' },
  { artist: 'Kendrick Lamar', name: 'Not Like Us' },
  { artist: 'Post Malone & Morgan Wallen', name: 'I Had Some Help' },
  { artist: 'Coldplay', name: 'Yellow' },
  { artist: 'Tame Impala', name: 'The Less I Know The Better' },
  { artist: 'Stromae', name: 'Papaoutai' },
  { artist: 'Videoclub', name: 'Amour Plastique' },
  { artist: 'Indila', name: 'Dernière Danse' },
  { artist: 'Rosé & Bruno Mars', name: 'APT.' },
  { artist: 'Charli xcx', name: 'Apple' },
  { artist: 'Benson Boone', name: 'Beautiful Things' },
  { artist: 'Hozier', name: 'Too Sweet' },
  { artist: 'The Weeknd', name: 'Timeless' },
  { artist: 'Dua Lipa', name: 'Houdini' },
  { artist: 'Taylor Swift', name: 'Cruel Summer' },
  { artist: 'Tommy Richman', name: 'MILLION DOLLAR BABY' },
  { artist: 'Shakira', name: 'Bzrp Music Sessions, Vol. 53' },
  { artist: 'Bad Bunny', name: 'Monaco' },
  { artist: 'Måneskin', name: 'Beggin\'' },
  { artist: 'Daft Punk', name: 'Get Lucky' },
  { artist: 'Gazo', name: 'DIE' },
  { artist: 'Sfera Ebbasta', name: 'Calcolatrici' },
  { artist: 'Mahmood', name: 'Tuta Gold' },
  { artist: 'Annalisa', name: 'Sinceramente' },
  { artist: 'Geolier', name: 'I p\' me, tu p\' te' },
  { artist: 'Peso Pluma', name: 'Ella Baila Sola' },
  { artist: 'Karol G', name: 'Si Antes Te Hubiera Conocido' },
  { artist: 'Rauw Alejandro', name: 'Santa' },
  { artist: 'Aitana', name: 'Las Babys' },
  { artist: 'Zaho de Sagazan', name: 'La symphonie des éclairs' },
  { artist: 'Aya Nakamura', name: 'Djadja' },
  { artist: 'Angèle', name: 'Bruxelles je t\'aime' },
  { artist: 'BTS', name: 'Dynamite' },
  { artist: 'NewJeans', name: 'Super Shy' },
  { artist: 'YOASOBI', name: 'Idol' },
  { artist: 'Fujii Kaze', name: 'Shinunoga E-Wa' },
  { artist: 'Rema', name: 'Calm Down' }
].map(t => ({
  artist: t.artist,
  name: t.name,
  label: `${t.artist} — ${t.name}`,
  query: `${t.artist} ${t.name}`
}));

function decodeHtmlEntities(str) {
  return (str || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

function parseLastFmCharts(html) {
  const regex = /data-track-name="([^"]+)"\s+data-track-url="\/music\/([^/"]+)\/_\/([^"]+)"/g;
  let m;
  const tracks = [];
  const seen = new Set();
  while ((m = regex.exec(html)) !== null) {
    const rawTrack = decodeHtmlEntities(m[1]);
    let rawArtist = decodeURIComponent(m[2].replace(/\+/g, ' '));
    rawArtist = decodeHtmlEntities(rawArtist);
    const key = `${rawArtist} - ${rawTrack}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tracks.push({
        artist: rawArtist,
        name: rawTrack,
        label: `${rawArtist} — ${rawTrack}`,
        query: `${rawArtist} ${rawTrack}`
      });
    }
  }
  return tracks;
}

export async function onRequestGet({ env }) {
  const apiKey = env && env.LASTFM_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=chart.getTopTracks&api_key=${apiKey}&format=json&limit=100`
      );
      const data = await res.json();
      const tracks = (data?.tracks?.track || []).map(t => ({
        artist: t.artist.name,
        name: t.name,
        label: `${t.artist.name} — ${t.name}`,
        query: `${t.artist.name} ${t.name}`
      }));
      if (tracks.length > 0) {
        return new Response(JSON.stringify({ tracks, source: 'lastfm-api' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    } catch (err) {
      // Fall through to scraping
    }
  }

  // Attempt live scrape from Last.fm charts
  try {
    const res = await fetch('https://www.last.fm/charts', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const scraped = parseLastFmCharts(html);
      if (scraped.length >= 10) {
        return new Response(JSON.stringify({ tracks: scraped, source: 'lastfm-charts' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=1800'
          }
        });
      }
    }
  } catch (err) {
    // Fall through to fallback list
  }

  // Fallback
  return new Response(JSON.stringify({ tracks: FALLBACK_TRACKS, source: 'curated-fallback' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}

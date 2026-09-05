const FAMOUS_SONGS = [
  // 🇮🇹 ITALIAN
  { flag: '🇮🇹', language: 'Italian', artist: 'Andrea Bocelli', name: 'Con te partirò', query: 'Andrea Bocelli Con te partiro' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Ricchi e Poveri', name: 'Sarà perché ti amo', query: 'Ricchi e Poveri Sara perche ti amo' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Måneskin', name: 'Zitti e buoni', query: 'Maneskin Zitti e buoni' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Laura Pausini', name: 'La solitudine', query: 'Laura Pausini La solitudine' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Domenico Modugno', name: 'Nel blu dipinto di blu', query: 'Domenico Modugno Nel blu dipinto di blu' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Mahmood', name: 'Tuta Gold', query: 'Mahmood Tuta Gold' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Toto Cutugno', name: "L'Italiano", query: 'Toto Cutugno L Italiano' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Annalisa', name: 'Sinceramente', query: 'Annalisa Sinceramente' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Lucio Dalla', name: 'Caruso', query: 'Lucio Dalla Caruso' },
  { flag: '🇮🇹', language: 'Italian', artist: 'Eros Ramazzotti', name: 'Più bella cosa', query: 'Eros Ramazzotti Piu bella cosa' },

  // 🇫🇷 FRENCH
  { flag: '🇫🇷', language: 'French', artist: 'Stromae', name: 'Papaoutai', query: 'Stromae Papaoutai' },
  { flag: '🇫🇷', language: 'French', artist: 'Édith Piaf', name: 'La vie en rose', query: 'Edith Piaf La vie en rose' },
  { flag: '🇫🇷', language: 'French', artist: 'Indila', name: 'Dernière danse', query: 'Indila Derniere danse' },
  { flag: '🇫🇷', language: 'French', artist: 'Videoclub', name: 'Amour plastique', query: 'Videoclub Amour plastique' },
  { flag: '🇫🇷', language: 'French', artist: 'Stromae', name: 'Alors on danse', query: 'Stromae Alors on danse' },
  { flag: '🇫🇷', language: 'French', artist: 'Angèle', name: "Bruxelles je t'aime", query: 'Angele Bruxelles je t aime' },
  { flag: '🇫🇷', language: 'French', artist: 'Zaho de Sagazan', name: 'La symphonie des éclairs', query: 'Zaho de Sagazan La symphonie des eclairs' },
  { flag: '🇫🇷', language: 'French', artist: 'Aya Nakamura', name: 'Djadja', query: 'Aya Nakamura Djadja' },
  { flag: '🇫🇷', language: 'French', artist: 'Carla Bruni', name: "Quelqu'un m'a dit", query: 'Carla Bruni Quelqu un m a dit' },
  { flag: '🇫🇷', language: 'French', artist: 'Céline Dion', name: "Pour que tu m'aimes encore", query: 'Celine Dion Pour que tu m aimes encore' },

  // 🇪🇸 SPANISH
  { flag: '🇪🇸', language: 'Spanish', artist: 'Luis Fonsi & Daddy Yankee', name: 'Despacito', query: 'Luis Fonsi Despacito' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Rosalía', name: 'Despechá', query: 'Rosalia Despecha' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Shakira', name: 'Antología', query: 'Shakira Antologia' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Manu Chao', name: 'Me Gustas Tú', query: 'Manu Chao Me Gustas Tu' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Bad Bunny', name: 'Tití Me Preguntó', query: 'Bad Bunny Titi Me Pregunto' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Enrique Iglesias', name: 'Bailando', query: 'Enrique Iglesias Bailando' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Karol G', name: 'Si Antes Te Hubiera Conocido', query: 'Karol G Si Antes Te Hubiera Conocido' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Gipsy Kings', name: 'Bamboléo', query: 'Gipsy Kings Bamboleo' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Álvaro Soler', name: 'Sofia', query: 'Alvaro Soler Sofia' },
  { flag: '🇪🇸', language: 'Spanish', artist: 'Peso Pluma', name: 'Ella Baila Sola', query: 'Peso Pluma Ella Baila Sola' },

  // 🇬🇧 / 🇺🇸 ENGLISH
  { flag: '🇬🇧', language: 'English', artist: 'Coldplay', name: 'Yellow', query: 'Coldplay Yellow' },
  { flag: '🇬🇧', language: 'English', artist: 'Queen', name: 'Bohemian Rhapsody', query: 'Queen Bohemian Rhapsody' },
  { flag: '🇬🇧', language: 'English', artist: 'The Beatles', name: 'Let It Be', query: 'The Beatles Let It Be' },
  { flag: '🇺🇸', language: 'English', artist: 'Billie Eilish', name: 'Birds of a Feather', query: 'Billie Eilish Birds of a Feather' },
  { flag: '🇬🇧', language: 'English', artist: 'Adele', name: 'Rolling in the Deep', query: 'Adele Rolling in the Deep' },
  { flag: '🇺🇸', language: 'English', artist: 'Sabrina Carpenter', name: 'Espresso', query: 'Sabrina Carpenter Espresso' },
  { flag: '🇬🇧', language: 'English', artist: 'Ed Sheeran', name: 'Shape of You', query: 'Ed Sheeran Shape of You' },
  { flag: '🇺🇸', language: 'English', artist: 'Taylor Swift', name: 'Cruel Summer', query: 'Taylor Swift Cruel Summer' },
  { flag: '🇬🇧', language: 'English', artist: 'Harry Styles', name: 'As It Was', query: 'Harry Styles As It Was' },
  { flag: '🇬🇧', language: 'English', artist: 'Dua Lipa', name: 'Levitating', query: 'Dua Lipa Levitating' },

  // 🇩🇪 GERMAN
  { flag: '🇩🇪', language: 'German', artist: 'Nena', name: '99 Luftballons', query: 'Nena 99 Luftballons' },
  { flag: '🇩🇪', language: 'German', artist: 'Rammstein', name: 'Du Hast', query: 'Rammstein Du Hast' },
  { flag: '🇩🇪', language: 'German', artist: 'Peter Fox', name: 'Haus am See', query: 'Peter Fox Haus am See' },
  { flag: '🇩🇪', language: 'German', artist: 'Falco', name: 'Rock Me Amadeus', query: 'Falco Rock Me Amadeus' },
  { flag: '🇩🇪', language: 'German', artist: 'Namika', name: 'Lieblingsmensch', query: 'Namika Lieblingsmensch' },
  { flag: '🇩🇪', language: 'German', artist: 'CRO', name: 'Traum', query: 'CRO Traum' },
  { flag: '🇩🇪', language: 'German', artist: 'Herbert Grönemeyer', name: 'Mensch', query: 'Herbert Gronemeyer Mensch' },
  { flag: '🇩🇪', language: 'German', artist: 'Tokio Hotel', name: 'Durch den Monsun', query: 'Tokio Hotel Durch den Monsun' },
  { flag: '🇩🇪', language: 'German', artist: 'Kraftwerk', name: 'Das Model', query: 'Kraftwerk Das Model' }
];

export async function onRequestGet() {
  return new Response(JSON.stringify({ tracks: FAMOUS_SONGS, source: 'curated-languages' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}

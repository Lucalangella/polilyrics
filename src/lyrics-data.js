/**
 * Synchronized Bilingual Lyrics Dataset
 * Each line contains { start, end, original, translated }
 * Multi-language translation mappings are provided for English (en), Spanish (es),
 * Italian (it), French (fr), and German (de).
 */

export const TRACKS = [
  {
    id: 'oiKj0Z_Xnjc',
    title: 'Papaoutai',
    artist: 'Stromae',
    sourceLanguage: 'fr',
    sourceLanguageName: 'Français',
    duration: 232,
    badge: '100% Playable',
    lyrics: [
      {
        start: 15.2,
        end: 20.0,
        original: "Dites-moi d'où il vient",
        translations: {
          en: "Tell me where he comes from",
          es: "Dime de dónde viene",
          it: "Dimmi da dove viene",
          fr: "Dites-moi d'où il vient",
          de: "Sag mir, woher er kommt"
        },
        glossary: {
          "dites-moi": "tell me (polite/plural)",
          "d'où": "from where",
          "vient": "comes (from venir)"
        }
      },
      {
        start: 20.0,
        end: 24.8,
        original: "Enfin je saurai où je vais",
        translations: {
          en: "Finally I will know where I am going",
          es: "Por fin sabré a dónde voy",
          it: "Così finalmente saprò dove vado",
          fr: "Enfin je saurai où je vais",
          de: "Endlich werde ich wissen, wohin ich gehe"
        },
        glossary: {
          "enfin": "finally / at last",
          "saurai": "will know (future of savoir)",
          "vais": "am going (from aller)"
        }
      },
      {
        start: 24.8,
        end: 29.5,
        original: "Maman dit que lorsqu'on cherche bien",
        translations: {
          en: "Mom says that when you search well",
          es: "Mamá dice que cuando se busca bien",
          it: "Mamma dice che quando si cerca bene",
          fr: "Maman dit que lorsqu'on cherche bien",
          de: "Mama sagt, dass wenn man gut sucht"
        },
        glossary: {
          "maman": "mom / mother",
          "dit": "says (from dire)",
          "lorsqu'on": "when one / when you",
          "cherche": "looks for / searches",
          "bien": "well"
        }
      },
      {
        start: 29.5,
        end: 34.0,
        original: "On finit toujours par trouver",
        translations: {
          en: "One always ends up finding",
          es: "Uno siempre termina por encontrar",
          it: "Si finisce sempre per trovare",
          fr: "On finit toujours par trouver",
          de: "Man findet am Ende immer"
        },
        glossary: {
          "finit": "ends / finishes (from finir)",
          "toujours": "always",
          "trouver": "to find"
        }
      },
      {
        start: 34.0,
        end: 38.6,
        original: "Elle dit qu'il n'est jamais très loin",
        translations: {
          en: "She says he is never very far",
          es: "Ella dice que nunca está muy lejos",
          it: "Dice che non è mai molto lontano",
          fr: "Elle dit qu'il n'est jamais très loin",
          de: "Sie sagt, er ist nie sehr weit weg"
        },
        glossary: {
          "elle": "she",
          "jamais": "never",
          "loin": "far"
        }
      },
      {
        start: 38.6,
        end: 43.2,
        original: "Qu'il part très souvent travailler",
        translations: {
          en: "That he very often leaves for work",
          es: "Que se va muy a menudo a trabajar",
          it: "Che parte molto spesso per lavorare",
          fr: "Qu'il part très souvent travailler",
          de: "Dass er sehr oft zur Arbeit geht"
        },
        glossary: {
          "part": "leaves / goes (from partir)",
          "souvent": "often",
          "travailler": "to work"
        }
      },
      {
        start: 43.2,
        end: 47.8,
        original: "Elle dit: 'Travailler, c'est bien'",
        translations: {
          en: "She says: 'Working is good'",
          es: "Ella dice: 'Trabajar está bien'",
          it: "Dice: 'Lavorare fa bene'",
          fr: "Elle dit: 'Travailler, c'est bien'",
          de: "Sie sagt: 'Arbeiten ist gut'"
        },
        glossary: {
          "travailler": "working / to work",
          "c'est bien": "that is good"
        }
      },
      {
        start: 47.8,
        end: 52.8,
        original: "Bien mieux qu'être mal accompagné, pas vrai?",
        translations: {
          en: "Much better than being in bad company, right?",
          es: "Mucho mejor que estar mal acompañado, ¿verdad?",
          it: "Molto meglio che essere mal accompagnati, vero?",
          fr: "Bien mieux qu'être mal accompagné, pas vrai?",
          de: "Viel besser als in schlechter Gesellschaft zu sein, oder?"
        },
        glossary: {
          "mieux": "better",
          "être": "to be",
          "accompagné": "accompanied",
          "pas vrai": "isn't that true? / right?"
        }
      },
      {
        start: 52.8,
        end: 57.5,
        original: "Où est ton papa? Dis-moi, où est ton papa?",
        translations: {
          en: "Where is your dad? Tell me, where is your dad?",
          es: "¿Dónde está tu papá? Dime, ¿dónde está tu papá?",
          it: "Dov'è tuo papà? Dimmi, dov'è tuo papà?",
          fr: "Où est ton papa? Dis-moi, où est ton papa?",
          de: "Wo ist dein Papa? Sag mir, wo ist dein Papa?"
        },
        glossary: {
          "où": "where",
          "ton": "your",
          "papa": "dad / father"
        }
      },
      {
        start: 57.5,
        end: 62.0,
        original: "Sans même devoir lui parler, il sait ce qui ne va pas",
        translations: {
          en: "Without even having to talk to him, he knows what's wrong",
          es: "Sin siquiera tener que hablarle, él sabe lo que está mal",
          it: "Senza nemmeno dovergli parlare, sa cosa non va",
          fr: "Sans même devoir lui parler, il sait ce qui ne va pas",
          de: "Ohne auch nur mit ihm sprechen zu müssen, weiß er, was nicht stimmt"
        },
        glossary: {
          "sans": "without",
          "même": "even",
          "devoir": "to have to",
          "parler": "to speak",
          "sait": "knows (from savoir)"
        }
      },
      {
        start: 62.0,
        end: 66.8,
        original: "Ah sacré papa, dis-moi, où es-tu caché?",
        translations: {
          en: "Oh dear dad, tell me, where are you hidden?",
          es: "Ay querido papá, dime, ¿dónde estás escondido?",
          it: "Ah caro papà, dimmi, dove ti sei nascosto?",
          fr: "Ah sacré papa, dis-moi, où es-tu caché?",
          de: "Ach verflixter Papa, sag mir, wo hast du dich versteckt?"
        },
        glossary: {
          "sacré": "sacred / dear / darn",
          "caché": "hidden"
        }
      },
      {
        start: 66.8,
        end: 71.8,
        original: "Ça doit faire au moins mille fois qu'j'ai compté mes doigts",
        translations: {
          en: "It must be at least a thousand times that I've counted my fingers",
          es: "Debe hacer al menos mil veces que he contado mis dedos",
          it: "Devono essere almeno mille volte che ho contato le mie dita",
          fr: "Ça doit faire au moins mille fois qu'j'ai compté mes doigts",
          de: "Ich muss mindestens tausendmal meine Finger gezählt haben"
        },
        glossary: {
          "doit": "must",
          "au moins": "at least",
          "mille": "thousand",
          "doigts": "fingers"
        }
      },
      {
        start: 71.8,
        end: 76.5,
        original: "Où t'es, papaoutai? Où t'es, papaoutai?",
        translations: {
          en: "Where are you, dad where are you? Where are you, dad where are you?",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, papá dónde estás?",
          it: "Dove sei, papà dove sei? Dove sei, papà dove sei?",
          fr: "Où t'es, papaoutai? Où t'es, papaoutai?",
          de: "Wo bist du, Papa wo bist du? Wo bist du, Papa wo bist du?"
        },
        glossary: {
          "papaoutai": "papa, où t'es? (dad, where are you?)"
        }
      },
      {
        start: 76.5,
        end: 81.5,
        original: "Où t'es, papaoutai? Où t'es, où t'es, où, papaoutai?",
        translations: {
          en: "Where are you, dad where are you? Where are you, where are you, where, dad where are you?",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, dónde estás, dónde, papá dónde estás?",
          it: "Dove sei, papà dove sei? Dove sei, dove sei, dove, papà dove sei?",
          fr: "Où t'es, papaoutai? Où t'es, où t'es, où, papaoutai?",
          de: "Wo bist du, Papa wo bist du? Wo bist du, wo bist du, wo, Papa wo bist du?"
        },
        glossary: {
          "où": "where",
          "t'es": "you are (tu es)"
        }
      },
      {
        start: 81.5,
        end: 90.0,
        original: "(Où t'es, papaoutai? Où t'es, papaoutai? - Refrain)",
        translations: {
          en: "(Where are you, dad where are you? Where are you, dad where are you? - Chorus)",
          es: "(¿Dónde estás, papá dónde estás? ¿Dónde estás, papá dónde estás? - Estribillo)",
          it: "(Dove sei, papà dove sei? Dove sei, papà dove sei? - Ritornello)",
          fr: "(Où t'es, papaoutai? Où t'es, papaoutai? - Refrain)",
          de: "(Wo bist du, Papa wo bist du? Wo bist du, Papa wo bist du? - Refrain)"
        },
        glossary: {
          "refrain": "chorus / refrain"
        }
      },
      {
        start: 90.0,
        end: 95.0,
        original: "Où est ton papa? Dis-moi, où est ton papa?",
        translations: {
          en: "Where is your dad? Tell me, where is your dad?",
          es: "¿Dónde está tu papá? Dime, ¿dónde está tu papá?",
          it: "Dov'è tuo papà? Dimmi, dov'è tuo papà?",
          fr: "Où est ton papa? Dis-moi, où est ton papa?",
          de: "Wo ist dein Papa? Sag mir, wo ist dein Papa?"
        },
        glossary: {
          "ton": "your",
          "dis-moi": "tell me"
        }
      },
      {
        start: 95.0,
        end: 99.5,
        original: "Sans même devoir lui parler, il sait ce qui ne va pas",
        translations: {
          en: "Without even having to speak to him, he knows what's wrong",
          es: "Sin siquiera tener que hablarle, él sabe lo que está mal",
          it: "Senza nemmeno dovergli parlare, sa cosa non va",
          fr: "Sans même devoir lui parler, il sait ce qui ne va pas",
          de: "Ohne auch nur mit ihm sprechen zu müssen, weiß er, was nicht stimmt"
        },
        glossary: {
          "sans": "without",
          "parler": "to speak",
          "sait": "knows"
        }
      },
      {
        start: 99.5,
        end: 104.0,
        original: "Ah sacré papa, dis-moi, où es-tu caché?",
        translations: {
          en: "Oh dear dad, tell me, where are you hiding?",
          es: "Ay querido papá, dime, ¿dónde estás escondido?",
          it: "Ah caro papà, dimmi, dove ti sei nascosto?",
          fr: "Ah sacré papa, dis-moi, où es-tu caché?",
          de: "Ach lieber Papa, sag mir, wo hast du dich versteckt?"
        },
        glossary: {
          "sacré": "dear / sacred",
          "caché": "hidden"
        }
      },
      {
        start: 104.0,
        end: 109.0,
        original: "Ça doit faire au moins mille fois qu'j'ai compté mes doigts",
        translations: {
          en: "It must be at least a thousand times that I've counted my fingers",
          es: "Debe hacer al menos mil veces que he contado mis dedos",
          it: "Devono essere almeno mille volte che ho contato le mie dita",
          fr: "Ça doit faire au moins mille fois qu'j'ai compté mes doigts",
          de: "Ich muss mindestens tausendmal meine Finger gezählt haben"
        },
        glossary: {
          "doit": "must",
          "mille": "thousand",
          "doigts": "fingers"
        }
      },
      {
        start: 109.0,
        end: 114.0,
        original: "Où t'es, papaoutai? Où t'es, papaoutai?",
        translations: {
          en: "Where are you, dad where are you? Where are you, dad where are you?",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, papá dónde estás?",
          it: "Dove sei, papà dove sei? Dove sei, papà dove sei?",
          fr: "Où t'es, papaoutai? Où t'es, papaoutai?",
          de: "Wo bist du, Papa wo bist du? Wo bist du, Papa wo bist du?"
        },
        glossary: {
          "papaoutai": "where are you dad"
        }
      },
      {
        start: 114.0,
        end: 121.0,
        original: "Où t'es, papaoutai? Où t'es, où t'es, où, papaoutai?",
        translations: {
          en: "Where are you, dad where are you? Where are you, where are you, where, dad where are you?",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, dónde estás, dónde, papá dónde estás?",
          it: "Dove sei, papà dove sei? Dove sei, dove sei, dove, papà dove sei?",
          fr: "Où t'es, papaoutai? Où t'es, où t'es, où, papaoutai?",
          de: "Wo bist du, Papa wo bist du? Wo bist du, wo bist du, wo, Papa wo bist du?"
        },
        glossary: {
          "papa": "father / dad"
        }
      },
      {
        start: 121.0,
        end: 126.0,
        original: "Quoi, qu'on y croie ou pas, y aura bien un jour où on n'y croira plus",
        translations: {
          en: "Whether we believe it or not, there will come a day when we believe no more",
          es: "Se crea o no, llegará un día en que ya no lo creamos",
          it: "Che ci si creda o no, ci sarà pure un giorno in cui non ci crederemo più",
          fr: "Quoi, qu'on y croie ou pas, y aura bien un jour où on n'y croira plus",
          de: "Ob man es glaubt oder nicht, es wird ein Tag kommen, an dem man es nicht mehr glaubt"
        },
        glossary: {
          "croie": "believe (subjunctive of croire)",
          "jour": "day",
          "plus": "no longer / no more"
        }
      },
      {
        start: 126.0,
        end: 131.0,
        original: "Un jour ou l'autre on sera tous papa, et d'un jour à l'autre on aura tous disparu",
        translations: {
          en: "One day or another we'll all be dads, and from one day to the next we'll all have disappeared",
          es: "Un día u otro todos seremos papás, y de un día para otro todos habremos desaparecido",
          it: "Un giorno o l'altro saremo tutti papà, e da un giorno all'altro saremo tutti spariti",
          fr: "Un jour ou l'autre on sera tous papa, et d'un jour à l'autre on aura tous disparu",
          de: "Eines Tages werden wir alle Väter sein, und von einem Tag auf den anderen sind wir alle verschwunden"
        },
        glossary: {
          "disparu": "disappeared / vanished",
          "tous": "all / all of us"
        }
      },
      {
        start: 131.0,
        end: 135.5,
        original: "Serons-nous détestables? Serons-nous admirables?",
        translations: {
          en: "Will we be hateful? Will we be admirable?",
          es: "¿Seremos detestables? ¿Seremos admirables?",
          it: "Saremo detestabili? Saremo ammirevoli?",
          fr: "Serons-nous détestables? Serons-nous admirables?",
          de: "Werden wir abscheulich sein? Werden wir bewundernswert sein?"
        },
        glossary: {
          "serons-nous": "will we be (future of être)",
          "détestables": "hateful / detestable",
          "admirables": "admirable"
        }
      },
      {
        start: 135.5,
        end: 140.0,
        original: "Des géniteurs ou des génies?",
        translations: {
          en: "Begetters or geniuses?",
          es: "¿Engendradores o genios?",
          it: "Dei genitori biologici o dei geni?",
          fr: "Des géniteurs ou des génies?",
          de: "Erzeuger oder Genies?"
        },
        glossary: {
          "géniteurs": "begetters / biological fathers",
          "génies": "geniuses"
        }
      },
      {
        start: 140.0,
        end: 145.0,
        original: "Dites-nous qui donne naissance aux irresponsables?",
        translations: {
          en: "Tell us who gives birth to irresponsible ones?",
          es: "Dígannos quién da a luz a los irresponsables?",
          it: "Diteci chi dà vita agli irresponsabili?",
          fr: "Dites-nous qui donne naissance aux irresponsables?",
          de: "Sagt uns, wer die Unverantwortlichen zur Welt bringt?"
        },
        glossary: {
          "donne naissance": "gives birth",
          "irresponsables": "irresponsible people"
        }
      },
      {
        start: 145.0,
        end: 150.0,
        original: "Ah dites-nous qui, tiens! Tout l'monde sait faire des bébés",
        translations: {
          en: "Ah tell us who, then! Everyone knows how to make babies",
          es: "¡Ah, díganos quién! Todo el mundo sabe hacer bebés",
          it: "Ah diteci chi! Tutti sanno come fare i bambini",
          fr: "Ah dites-nous qui, tiens! Tout l'monde sait faire des bébés",
          de: "Ach sagt uns wer! Jeder weiß, wie man Babys macht"
        },
        glossary: {
          "tout l'monde": "everyone",
          "bébés": "babies"
        }
      },
      {
        start: 150.0,
        end: 154.5,
        original: "Mais personne sait comment faire des papas",
        translations: {
          en: "But nobody knows how to make fathers",
          es: "Pero nadie sabe cómo hacer papás",
          it: "Ma nessuno sa come fare i papà",
          fr: "Mais personne sait comment faire des papas",
          de: "Aber niemand weiß, wie man Väter macht"
        },
        glossary: {
          "personne": "nobody / no one",
          "comment": "how"
        }
      },
      {
        start: 154.5,
        end: 159.0,
        original: "Monsieur 'Je-sais-tout' en aurait hérité, c'est ça?",
        translations: {
          en: "Mr. 'Know-it-all' would have inherited it, is that it?",
          es: "¿El señor 'Sabelotodo' lo habría heredado, es eso?",
          it: "Il signor 'So-tutto-io' l'avrebbe ereditato, è così?",
          fr: "Monsieur 'Je-sais-tout' en aurait hérité, c'est ça?",
          de: "Herr 'Besserwisser' hätte es geerbt, stimmt's?"
        },
        glossary: {
          "je-sais-tout": "know-it-all",
          "hérité": "inherited"
        }
      },
      {
        start: 159.0,
        end: 163.5,
        original: "Faut l'sucer d'son pouce ou quoi?",
        translations: {
          en: "Do we have to suck it out of our thumb or what?",
          es: "¿Hay que chupárselo del pulgar o qué?",
          it: "Bisogna succhiarselo dal pollice o cosa?",
          fr: "Faut l'sucer d'son pouce ou quoi?",
          de: "Muss man es sich aus dem Daumen saugen oder was?"
        },
        glossary: {
          "sucer": "to suck",
          "pouce": "thumb"
        }
      },
      {
        start: 163.5,
        end: 168.0,
        original: "Dites-nous où c'est caché, ça doit faire au moins mille fois qu'on a bouffé nos doigts",
        translations: {
          en: "Tell us where it's hidden, it must be a thousand times that we've chewed our fingers",
          es: "Dígannos dónde está escondido, debe hacer mil veces que nos comimos los dedos",
          it: "Diteci dov'è nascosto, dev'essere almeno mille volte che ci siamo mangiati le dita",
          fr: "Dites-nous où c'est caché, ça doit faire au moins mille fois qu'on a bouffé nos doigts",
          de: "Sagt uns, wo es versteckt ist, wir müssen schon tausendmal an den Fingern gekaut haben"
        },
        glossary: {
          "bouffé": "eaten / chewed (slang)"
        }
      },
      {
        start: 168.0,
        end: 173.0,
        original: "Où est ton papa? Dis-moi, où est ton papa?",
        translations: {
          en: "Where is your dad? Tell me, where is your dad?",
          es: "¿Dónde está tu papá? Dime, ¿dónde está tu papá?",
          it: "Dov'è tuo papà? Dimmi, dov'è tuo papà?",
          fr: "Où est ton papa? Dis-moi, où est ton papa?",
          de: "Wo ist dein Papa? Sag mir, wo ist dein Papa?"
        },
        glossary: {
          "où": "where",
          "papa": "dad"
        }
      },
      {
        start: 173.0,
        end: 178.0,
        original: "Sans même devoir lui parler, il sait ce qui ne va pas",
        translations: {
          en: "Without even having to speak to him, he knows what's wrong",
          es: "Sin siquiera tener que hablarle, él sabe lo que está mal",
          it: "Senza nemmeno dovergli parlare, sa cosa non va",
          fr: "Sans même devoir lui parler, il sait ce qui ne va pas",
          de: "Ohne auch nur mit ihm sprechen zu müssen, weiß er, was nicht stimmt"
        },
        glossary: {
          "sans": "without",
          "sait": "knows"
        }
      },
      {
        start: 178.0,
        end: 182.5,
        original: "Ah sacré papa, dis-moi, où es-tu caché?",
        translations: {
          en: "Oh dear dad, tell me, where are you hiding?",
          es: "Ay querido papá, dime, ¿dónde estás escondido?",
          it: "Ah caro papà, dimmi, dove ti sei nascosto?",
          fr: "Ah sacré papa, dis-moi, où es-tu caché?",
          de: "Ach lieber Papa, sag mir, wo hast du dich versteckt?"
        },
        glossary: {
          "caché": "hidden"
        }
      },
      {
        start: 182.5,
        end: 187.0,
        original: "Ça doit faire au moins mille fois qu'j'ai compté mes doigts",
        translations: {
          en: "It must be at least a thousand times that I've counted my fingers",
          es: "Debe hacer al menos mil veces que he contado mis dedos",
          it: "Devono essere almeno mille volte che ho contato le mie dita",
          fr: "Ça doit faire au moins mille fois qu'j'ai compté mes doigts",
          de: "Ich muss mindestens tausendmal meine Finger gezählt haben"
        },
        glossary: {
          "doigts": "fingers"
        }
      },
      {
        start: 187.0,
        end: 192.0,
        original: "Où t'es, papaoutai? Où t'es, papaoutai?",
        translations: {
          en: "Where are you, dad where are you? Where are you, dad where are you?",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, papá dónde estás?",
          it: "Dove sei, papà dove sei? Dove sei, papà dove sei?",
          fr: "Où t'es, papaoutai? Où t'es, papaoutai?",
          de: "Wo bist du, Papa wo bist du? Wo bist du, Papa wo bist du?"
        },
        glossary: {
          "papaoutai": "where are you dad"
        }
      },
      {
        start: 192.0,
        end: 197.0,
        original: "Où t'es, papaoutai? Où t'es, où t'es, où, papaoutai?",
        translations: {
          en: "Where are you, dad where are you? Where are you, where are you, where, dad where are you?",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, dónde estás, dónde, papá dónde estás?",
          it: "Dove sei, papà dove sei? Dove sei, dove sei, dove, papà dove sei?",
          fr: "Où t'es, papaoutai? Où t'es, où t'es, où, papaoutai?",
          de: "Wo bist du, Papa wo bist du? Wo bist du, wo bist du, wo, Papa wo bist du?"
        },
        glossary: {
          "papaoutai": "where are you dad"
        }
      },
      {
        start: 197.0,
        end: 207.0,
        original: "Où t'es, papaoutai? Où t'es, papaoutai? (Breakdown)",
        translations: {
          en: "Where are you, dad where are you? Where are you, dad where are you? (Dance break)",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, papá dónde estás? (Pausa de baile)",
          it: "Dove sei, papà dove sei? Dove sei, papà dove sei? (Pausa ritmica)",
          fr: "Où t'es, papaoutai? Où t'es, papaoutai? (Breakdown)",
          de: "Wo bist du, Papa wo bist du? Wo bist du, Papa wo bist du? (Tanzpause)"
        },
        glossary: {
          "breakdown": "instrumental dance break"
        }
      },
      {
        start: 207.0,
        end: 216.0,
        original: "Un jour ou l'autre on sera tous papa, et d'un jour à l'autre on aura tous disparu",
        translations: {
          en: "One day or another we'll all be dads, and from one day to the next we'll all have disappeared",
          es: "Un día u otro todos seremos papás, y de un día para otro todos habremos desaparecido",
          it: "Un giorno o l'altro saremo tutti papà, e da un giorno all'altro saremo tutti spariti",
          fr: "Un jour ou l'autre on sera tous papa, et d'un jour à l'autre on aura tous disparu",
          de: "Eines Tages werden wir alle Väter sein, und von einem Tag auf den anderen sind wir alle verschwunden"
        },
        glossary: {
          "disparu": "disappeared"
        }
      },
      {
        start: 216.0,
        end: 224.0,
        original: "Où t'es, papaoutai? Où t'es, papaoutai?",
        translations: {
          en: "Where are you, dad where are you? Where are you, dad where are you?",
          es: "¿Dónde estás, papá dónde estás? ¿Dónde estás, papá dónde estás?",
          it: "Dove sei, papà dove sei? Dove sei, papà dove sei?",
          fr: "Où t'es, papaoutai? Où t'es, papaoutai?",
          de: "Wo bist du, Papa wo bist du? Wo bist du, Papa wo bist du?"
        },
        glossary: {
          "papaoutai": "where are you dad"
        }
      },
      {
        start: 224.0,
        end: 232.0,
        original: "(Où t'es, où t'es, où, papaoutai? - Outro)",
        translations: {
          en: "(Where are you, where are you, where, dad where are you? - Outro)",
          es: "(¿Dónde estás, dónde estás, dónde, papá dónde estás? - Fin)",
          it: "(Dove sei, dove sei, dove, papà dove sei? - Fine)",
          fr: "(Où t'es, où t'es, où, papaoutai? - Outro)",
          de: "(Wo bist du, wo bist du, wo, Papa wo bist du? - Ende)"
        },
        glossary: {
          "outro": "ending / final segment"
        }
      }
    ]
  },
  {
    id: '4L_yCwFD6Jo',
    title: 'Con te partirò',
    artist: 'Andrea Bocelli',
    sourceLanguage: 'it',
    sourceLanguageName: 'Italiano',
    duration: 251,
    badge: '100% Playable',
    lyrics: [
      {
        start: 22.0,
        end: 27.5,
        original: "Quando sono solo, sogno all'orizzonte",
        translations: {
          en: "When I am alone, I dream on the horizon",
          it: "Quando sono solo, sogno all'orizzonte",
          es: "Cuando estoy solo, sueño en el horizonte",
          fr: "Quand je suis seul, je rêve à l'horizon",
          de: "Wenn ich allein bin, träume ich am Horizont"
        },
        glossary: {
          "quando": "when",
          "solo": "alone",
          "sogno": "I dream (from sognare)",
          "orizzonte": "horizon"
        }
      },
      {
        start: 27.5,
        end: 33.0,
        original: "E mancan le parole, sì lo so che non c'è luce",
        translations: {
          en: "And words fail me, yes I know there is no light",
          it: "E mancan le parole, sì lo so che non c'è luce",
          es: "Y faltan las palabras, sí sé que no hay luz",
          fr: "Et les mots me manquent, oui je sais qu'il n'y a pas de lumière",
          de: "Und die Worte fehlen mir, ja ich weiß, es gibt kein Licht"
        },
        glossary: {
          "parole": "words",
          "luce": "light"
        }
      },
      {
        start: 33.0,
        end: 39.5,
        original: "In una stanza quando manca il sole",
        translations: {
          en: "In a room when the sun is missing",
          it: "In una stanza quando manca il sole",
          es: "En una habitación cuando falta el sol",
          fr: "Dans une pièce quand le soleil manque",
          de: "In einem Zimmer, wenn die Sonne fehlt"
        },
        glossary: {
          "stanza": "room",
          "sole": "sun"
        }
      },
      {
        start: 39.5,
        end: 46.0,
        original: "Se non ci sei tu con me, con me",
        translations: {
          en: "If you are not here with me, with me",
          it: "Se non ci sei tu con me, con me",
          es: "Si no estás tú conmigo, conmigo",
          fr: "Si tu n'es pas là avec moi, avec moi",
          de: "Wenn du nicht hier bei mir bist, bei mir"
        },
        glossary: {
          "con me": "with me"
        }
      },
      {
        start: 46.0,
        end: 54.0,
        original: "Su le finestre mostra a tutti il mio cuore",
        translations: {
          en: "On the windows show my heart to everyone",
          it: "Su le finestre mostra a tutti il mio cuore",
          es: "En las ventanas muestra a todos mi corazón",
          fr: "Aux fenêtres montre à tous mon cœur",
          de: "An den Fenstern zeige allen mein Herz"
        },
        glossary: {
          "finestre": "windows",
          "cuore": "heart"
        }
      },
      {
        start: 54.0,
        end: 62.0,
        original: "Che hai acceso, chiudi dentro me",
        translations: {
          en: "That you have lit, lock inside me",
          it: "Che hai acceso, chiudi dentro me",
          es: "Que has encendido, encierra dentro de mí",
          fr: "Que tu as allumé, enferme en moi",
          de: "Das du entzündet hast, schließe in mir ein"
        },
        glossary: {
          "acceso": "lit / turned on",
          "dentro": "inside"
        }
      },
      {
        start: 62.0,
        end: 72.0,
        original: "La luce che hai incontrato per strada",
        translations: {
          en: "The light that you met on the street",
          it: "La luce che hai incontrato per strada",
          es: "La luz que encontraste en la calle",
          fr: "La lumière que tu as rencontrée dans la rue",
          de: "Das Licht, das du auf der Straße getroffen hast"
        },
        glossary: {
          "strada": "street / road"
        }
      },
      {
        start: 72.0,
        end: 80.0,
        original: "Con te partirò, paesi che non ho mai",
        translations: {
          en: "With you I will leave, countries that I have never",
          it: "Con te partirò, paesi che non ho mai",
          es: "Contigo partiré, países que nunca he",
          fr: "Avec toi je partirai, des pays que je n'ai jamais",
          de: "Mit dir werde ich fortgehen, Länder die ich nie"
        },
        glossary: {
          "partirò": "I will leave (future of partire)",
          "paesi": "countries / villages"
        }
      },
      {
        start: 80.0,
        end: 88.0,
        original: "Veduto e vissuto con te, adesso sì li vivrò",
        translations: {
          en: "Seen and lived with you, now yes I will live them",
          it: "Veduto e vissuto con te, adesso sì li vivrò",
          es: "Visto y vivido contigo, ahora sí los viviré",
          fr: "Vus et vécus avec toi, maintenant oui je les vivrai",
          de: "Gesehen und mit dir gelebt habe, jetzt ja werde ich sie leben"
        },
        glossary: {
          "adesso": "now",
          "vivrò": "I will live"
        }
      },
      {
        start: 88.0,
        end: 98.0,
        original: "Con te partirò su navi per mari",
        translations: {
          en: "With you I will leave on ships across seas",
          it: "Con te partirò su navi per mari",
          es: "Contigo partiré en barcos por mares",
          fr: "Avec toi je partirai sur des navires par des mers",
          de: "Mit dir werde ich auf Schiffen über Meere fahren"
        },
        glossary: {
          "navi": "ships",
          "mari": "seas"
        }
      },
      {
        start: 98.0,
        end: 110.0,
        original: "Che io lo so, no, no, non esistono più, con te io li vivrò",
        translations: {
          en: "That I know, no, no, exist no more, with you I will live them",
          it: "Che io lo so, no, no, non esistono più, con te io li vivrò",
          es: "Que yo sé, no, no, ya no existen, contigo los viviré",
          fr: "Que je sais, non, non, n'existent plus, avec toi je les vivrai",
          de: "Von denen ich weiß, nein, sie existieren nicht mehr, mit dir werde ich sie leben"
        },
        glossary: {
          "esistono": "exist"
        }
      }
    ]
  },
  {
    id: 'K5KAc5CoCuk',
    title: 'Dernière danse',
    artist: 'Indila',
    sourceLanguage: 'fr',
    sourceLanguageName: 'Français',
    duration: 214,
    badge: '100% Playable',
    lyrics: [
      {
        start: 13.0,
        end: 18.0,
        original: "Oh ma douce souffrance",
        translations: {
          en: "Oh my sweet suffering",
          it: "Oh mia dolce sofferenza",
          es: "Oh mi dulce sufrimiento",
          fr: "Oh ma douce souffrance",
          de: "Oh mein süßes Leiden"
        },
        glossary: {
          "douce": "sweet / soft",
          "souffrance": "suffering"
        }
      },
      {
        start: 18.0,
        end: 23.5,
        original: "Pourquoi s'acharner? Tu r'commences",
        translations: {
          en: "Why persist? You start again",
          it: "Perché accanirsi? Tu ricominci",
          es: "¿Por qué ensañarse? Vuelves a empezar",
          fr: "Pourquoi s'acharner? Tu r'commences",
          de: "Warum sich verbeißen? Du fängst wieder an"
        },
        glossary: {
          "pourquoi": "why",
          "acharner": "to persist fiercely"
        }
      },
      {
        start: 23.5,
        end: 28.5,
        original: "Je ne suis qu'un être sans importance",
        translations: {
          en: "I am only a being of no importance",
          it: "Non sono che un essere senza importanza",
          es: "No soy más que un ser sin importancia",
          fr: "Je ne suis qu'un être sans importance",
          de: "Ich bin nur ein Wesen ohne Bedeutung"
        },
        glossary: {
          "sans": "without",
          "importance": "importance"
        }
      },
      {
        start: 28.5,
        end: 34.0,
        original: "Sans lui, je suis un peu paro",
        translations: {
          en: "Without him, I am a bit paranoid",
          it: "Senza di lui, sono un po' paranoica",
          es: "Sin él, estoy un poco paranoica",
          fr: "Sans lui, je suis un peu paro",
          de: "Ohne ihn bin ich ein bisschen paranoid"
        },
        glossary: {
          "paro": "paranoid (slang)"
        }
      },
      {
        start: 34.0,
        end: 42.0,
        original: "Je déambule seule dans le métro",
        translations: {
          en: "I wander alone in the subway",
          it: "Vago da sola nella metropolitana",
          es: "Deambulo sola en el metro",
          fr: "Je déambule seule dans le métro",
          de: "Ich wandere allein in der U-Bahn"
        },
        glossary: {
          "déambule": "wander / stroll",
          "métro": "subway / metro"
        }
      },
      {
        start: 42.0,
        end: 51.0,
        original: "Une dernière danse pour oublier ma peine immense",
        translations: {
          en: "One last dance to forget my immense pain",
          it: "Un ultimo ballo per dimenticare il mio immenso dolore",
          es: "Un último baile para olvidar mi inmensa pena",
          fr: "Une dernière danse pour oublier ma peine immense",
          de: "Ein letzter Tanz, um meinen immensen Schmerz zu vergessen"
        },
        glossary: {
          "dernière": "last / final",
          "danse": "dance",
          "peine": "pain / grief"
        }
      },
      {
        start: 51.0,
        end: 60.0,
        original: "Je veux m'enfuir que tout recommence",
        translations: {
          en: "I want to flee, for everything to start anew",
          it: "Voglio fuggire affinché tutto ricominci",
          es: "Quiero huir para que todo vuelva a empezar",
          fr: "Je veux m'enfuir que tout recommence",
          de: "Ich will fliehen, damit alles von vorn beginnt"
        },
        glossary: {
          "m'enfuir": "to escape / flee"
        }
      }
    ]
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    sourceLanguage: 'en',
    sourceLanguageName: 'English',
    duration: 213,
    badge: '100% Playable',
    lyrics: [
      {
        start: 18.5,
        end: 22.8,
        original: "We're no strangers to love",
        translations: {
          en: "We're no strangers to love",
          es: "No somos extraños al amor",
          it: "Non siamo estranei all'amore",
          fr: "Nous ne sommes pas étrangers à l'amour",
          de: "Wir sind keine Fremden in Sachen Liebe"
        },
        glossary: {
          "strangers": "unknown people / estranei",
          "love": "amore / amour / amor"
        }
      },
      {
        start: 22.8,
        end: 27.0,
        original: "You know the rules and so do I",
        translations: {
          en: "You know the rules and so do I",
          es: "Conoces las reglas y yo también",
          it: "Conosci le regole e anch'io",
          fr: "Tu connais les règles et moi aussi",
          de: "Du kennst die Regeln und ich auch"
        },
        glossary: {
          "rules": "regole / normas / règles",
          "so do I": "anch'io / yo también"
        }
      },
      {
        start: 27.0,
        end: 31.4,
        original: "A full commitment's what I'm thinking of",
        translations: {
          en: "A full commitment's what I'm thinking of",
          es: "Un compromiso total es en lo que pienso",
          it: "Un impegno totale è ciò a cui sto pensando",
          fr: "Un engagement total est ce à quoi je pense",
          de: "Eine feste Bindung ist das, woran ich denke"
        },
        glossary: {
          "commitment": "impegno / compromiso / engagement",
          "thinking": "pensare / pensando"
        }
      },
      {
        start: 31.4,
        end: 35.8,
        original: "You wouldn't get this from any other guy",
        translations: {
          en: "You wouldn't get this from any other guy",
          es: "No obtendrías esto de ningún otro chico",
          it: "Non riceveresti questo da nessun altro ragazzo",
          fr: "Tu n'obtiendrais pas cela d'un autre gars",
          de: "Das würdest du von keinem anderen Kerl bekommen"
        },
        glossary: {
          "wouldn't": "non faresti / non otterresti",
          "other": "altro / otro / autre"
        }
      },
      {
        start: 35.8,
        end: 43.2,
        original: "I just wanna tell you how I'm feeling",
        translations: {
          en: "I just wanna tell you how I'm feeling",
          es: "Solo quiero decirte cómo me siento",
          it: "Voglio solo dirti come mi sento",
          fr: "Je veux juste te dire ce que je ressens",
          de: "Ich möchte dir nur sagen, wie ich mich fühle"
        },
        glossary: {
          "wanna": "want to (voglio)",
          "feeling": "sentimento / sentire"
        }
      },
      {
        start: 43.2,
        end: 47.5,
        original: "Never gonna give you up",
        translations: {
          en: "Never gonna give you up",
          es: "Nunca te voy a dejar",
          it: "Non ti arrenderò mai / Non ti lascerò mai",
          fr: "Je ne t'abandonnerai jamais",
          de: "Ich werde dich niemals aufgeben"
        },
        glossary: {
          "never": "mai / nunca / jamais",
          "give up": "arrendersi / lasciare"
        }
      },
      {
        start: 47.5,
        end: 51.8,
        original: "Never gonna let you down",
        translations: {
          en: "Never gonna let you down",
          es: "Nunca te decepcionaré",
          it: "Non ti deluderò mai",
          fr: "Je ne te décevrai jamais",
          de: "Ich werde dich niemals im Stich lassen"
        },
        glossary: {
          "let down": "deludere / decepcionar"
        }
      },
      {
        start: 51.8,
        end: 56.5,
        original: "Never gonna run around and desert you",
        translations: {
          en: "Never gonna run around and desert you",
          es: "Nunca voy a dar vueltas y abandonarte",
          it: "Non me ne andrò mai in giro ad abbandonarti",
          fr: "Je ne courrai jamais partout pour t'abandonner",
          de: "Ich werde niemals herumlaufen und dich verlassen"
        },
        glossary: {
          "desert": "abbandonare / verlassen"
        }
      }
    ]
  }
];

/**
 * Returns an array of synchronized lyrics objects containing { start, end, original, translated }
 * strictly conforming to the project requirements.
 *
 * @param {string} trackId - The YouTube track ID
 * @param {string} targetLang - The target translation language code (e.g. 'en', 'es', 'it', 'fr', 'de')
 * @returns {Array<{ start: number, end: number, original: string, translated: string, glossary: Object }>}
 */
export function getSynchronizedLyrics(trackId, targetLang = 'en') {
  const track = TRACKS.find((t) => t.id === trackId) || TRACKS[0];

  return track.lyrics.map((item) => {
    let translated = item.translations[targetLang];
    if (!translated || (targetLang === track.sourceLanguage && item.translations.en)) {
      translated = item.translations.en || item.original;
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
            const idx = TRACKS.findIndex((existing) => existing.id === t.id);
            if (idx >= 0) {
              TRACKS[idx] = { ...TRACKS[idx], ...t };
            } else {
              TRACKS.push(t);
            }
          }
        });
      }
    }
  } catch {}
}

// Hydrate saved dynamic tracks on startup
loadPersistedDynamicTracks();

/**
 * Checks if a track exists in dataset
 * @param {string} trackId
 */
export function hasTrack(trackId) {
  return TRACKS.some((t) => t.id === trackId);
}

/**
 * Gets track metadata
 * @param {string} trackId
 */
export function getTrackMeta(trackId) {
  return TRACKS.find((t) => t.id === trackId) || TRACKS[0];
}

/**
 * Registers a dynamically searched or custom imported track
 * @param {Object} track
 * @param {boolean} persist
 */
export function registerDynamicTrack(track, persist = true) {
  if (!track || !track.id) return;
  const existingIdx = TRACKS.findIndex((t) => t.id === track.id);
  if (existingIdx >= 0) {
    TRACKS[existingIdx] = { ...TRACKS[existingIdx], ...track };
  } else {
    TRACKS.unshift(track); // Put newly added song at top
  }

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


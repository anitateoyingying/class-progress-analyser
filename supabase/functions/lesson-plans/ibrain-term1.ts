// iBrain Term 1 design scaffold ("What can we find?"), authored from the AGAPE iBrain
// Development Discussion deck + Y2027 template. The AI only elaborates individual lessons
// from this map, so all 24 lessons per level stay coherent and the 2-week tuff tray set-ups
// stay identical across both weeks (Week 2 only adds on).
// Tray/scene item coordinates are normalised: tray centre (0,0), tray rim radius 1;
// |x| > 1 means "on the table beside the tray". Scene coords are 0..1 of the card.

export interface Item { k: string; x: number; y: number; s?: number; c?: string; r?: number; t?: string }
export interface TrayMaterial { label: string; addOn?: boolean; items: Item[] }
export interface TuffBlock {
  id: string;
  weeks: [number, number];
  title: string;
  wondering: string;
  focus: string;
  outcomes: string[];
  domainCode: string;
  setup: string;
  addOn: string;
  safety: string;
  base: string;
  materials: TrayMaterial[];
}
export interface Scene { title: string; bg: string; items: Item[]; prompts: string[] }
export interface WordCard { word: string; icon: string }
export interface WeekPlan {
  week: number;
  title: string;
  storyBite: string;
  keyLanguage: string[];
  song: string;
  secValue: string;
  secCode: string;
  llCode: string;
  ef: [string, string, string];
  rolePlay: string;
  artCraft: { title: string; description: string };
  scene: Scene;
  words: WordCard[];
}
export interface TermPlan {
  level: "pg" | "pn";
  term: number;
  levelLabel: string;
  shortLabel: string;
  story: string;
  author: string;
  wondering: string;
  connection: string;
  cdpValues: string[];
  focus: string;
  languageExposure: string;
  developmental: string[];
  blocks: TuffBlock[];
  weeks: WeekPlan[];
}

const WM = "Working Memory", IC = "Inhibitory Control", CF = "Cognitive Flexibility";

// ---------------------------------------------------------------------------
// Pre-Nursery (3 year olds) -- The Rainbow Fish
// ---------------------------------------------------------------------------
const PN: TermPlan = {
  level: "pn",
  term: 1,
  levelLabel: "Pre-Nursery (3 Year Olds)",
  shortLabel: "Pre-Nursery",
  story: "The Rainbow Fish",
  author: "Marcus Pfister",
  wondering: "What can we find?",
  connection: "Children discover places, creatures, colours, feelings and friendship through The Rainbow Fish.",
  cdpValues: ["Curiosity", "Responsibility", "Resilience", "Courage"],
  focus: "Developing Communication & Language and character values",
  languageExposure:
    "Descriptive words (shiny, glittery, sparkly, glossy, bright, dull), colour words, comparing words (big/small, smooth/rough/bumpy/prickly), basic emotion words (happy, sad, lonely, angry, scared), giving and sharing phrases.",
  developmental: [
    "Attention for one focused segment is about 5-8 minutes; change the mode (talk, move, sing, touch) every few minutes.",
    "Speaks in 4-5 word phrases; asks 'what' and 'why' questions; can follow simple 2-step directions with prepositions.",
    "Moving from parallel to simple cooperative play; can take turns and share with adult support and visual cues.",
    "Beginning to name own feelings in simple phrases and notice peers' feelings.",
    "Can sort and classify by ONE attribute (colour OR size OR texture) and name primary colours.",
    "Still mouths objects at times: no loose parts smaller than 4.5 cm, no water beads, no sequins or beads.",
  ],
  blocks: [
    {
      id: "PN-B1",
      weeks: [1, 2],
      title: "Ocean Life Exploration",
      wondering: "What can we find in the ocean?",
      focus: "Explore the world of Rainbow Fish: the ocean setting, its creatures and things that shine.",
      outcomes: ["EY.PN.NE.2.1", "EY.PN.LL.1.3", "EY.PN.SED.3.1"],
      domainCode: "EY.PN.NE.2.1",
      setup:
        "Teachers create the base of an ocean (blue fabric with a shallow tray of blue-tinted water in the centre and a sand 'seabed' corner). Provide corals, large shells, seaweed, reef rocks and sea-creature figurines. Children explore and build ocean life with teacher facilitation.",
      addOn:
        "Week 2 add-on: large foil 'shiny scale' discs and unbreakable mirror tiles hidden among the reef, sea-creature name/picture cards, and a torch to make things shimmer like Rainbow Fish.",
      safety: "Wipe spills immediately; keep water to 2 cm depth; all shells and discs larger than 4.5 cm.",
      base: "ocean",
      materials: [
        { label: "Blue fabric 'ocean' + shallow blue-tinted water", items: [{ k: "water", x: 0.05, y: -0.05, s: 1.15 }] },
        { label: "Sand 'seabed' corner", items: [{ k: "sand", x: -0.42, y: 0.52, s: 1 }] },
        { label: "Corals & reef rocks", items: [{ k: "coral", x: -0.55, y: -0.32, c: "#E2707C" }, { k: "coral", x: 0.58, y: 0.38, c: "#F4A259" }, { k: "rock", x: -0.15, y: 0.66 }, { k: "rock", x: 0.7, y: -0.12 }] },
        { label: "Seaweed (green ribbon & fabric strips)", items: [{ k: "seaweed", x: -0.75, y: 0.12 }, { k: "seaweed", x: 0.3, y: -0.7 }, { k: "seaweed", x: 0.8, y: 0.3 }] },
        { label: "Large shells", items: [{ k: "shell", x: -0.3, y: 0.42 }, { k: "shell", x: 0.12, y: 0.74 }, { k: "shell", x: -0.62, y: 0.6 }] },
        { label: "Sea-creature figurines", items: [{ k: "e:🐠", x: 0.12, y: -0.25 }, { k: "e:🦀", x: -0.18, y: 0.3 }, { k: "e:🐙", x: 0.42, y: 0.08 }, { k: "e:🐢", x: -0.38, y: -0.58 }, { k: "star", x: 0.25, y: 0.48, c: "#F4A259" }] },
        { label: "Chunky magnifying glasses", items: [{ k: "magnifier", x: 1.2, y: 0.55 }, { k: "magnifier", x: -1.2, y: -0.5 }] },
        { label: "Foil 'shiny scales' & mirror tiles", addOn: true, items: [{ k: "disc", x: -0.02, y: 0.18 }, { k: "disc", x: 0.3, y: -0.4 }, { k: "disc", x: -0.12, y: -0.12 }, { k: "mirror", x: -0.6, y: -0.02 }] },
        { label: "Sea-creature name & picture cards", addOn: true, items: [{ k: "card", x: 1.22, y: -0.45, t: "crab" }, { k: "card", x: 1.22, y: -0.05, t: "fish" }] },
        { label: "Torch to make things shimmer", addOn: true, items: [{ k: "torch", x: -1.22, y: 0.35 }] },
      ],
    },
    {
      id: "PN-B2",
      weeks: [3, 4],
      title: "What Makes Me Special?",
      wondering: "How would you like your fish to look?",
      focus: "Identity and uniqueness: observe, compare and choose textures to create a fish that is 'just like me'.",
      outcomes: ["EY.PN.ACE.2.2", "EY.PN.LL.1.4", "EY.PN.SED.1.3"],
      domainCode: "EY.PN.ACE.2.2",
      setup:
        "Light-blue 'ocean' base with fish cutouts in different shapes and sizes. Loose materials of different textures (bubble wrap, felt, corrugated card, foil, tissue, sponge) sit in the 'ocean' for children to observe, compare and arrange onto their own fish. A teacher-made Rainbow Fish sits in the centre as the provocation.",
      addOn:
        "Week 4 add-on: unbreakable hand mirrors and each child's photo on a fish-shaped frame ('My special fish'), plus 'I like...' choice cards so children can talk about what makes them special.",
      safety: "Pre-cut all textures to at least 5 cm; no glue at the tray (loose-parts arranging only).",
      base: "ocean-light",
      materials: [
        { label: "Fish cutouts in different shapes & sizes", items: [{ k: "fish", x: -0.5, y: -0.35, s: 1.2, c: "#FFFFFF" }, { k: "fish", x: 0.5, y: -0.4, s: 0.8, c: "#FFFFFF" }, { k: "fish", x: -0.45, y: 0.45, s: 0.9, c: "#FFFFFF", r: 180 }, { k: "fish", x: 0.45, y: 0.45, s: 1.3, c: "#FFFFFF" }] },
        { label: "Texture pieces: bubble wrap, felt, corrugated card, foil, tissue, sponge", items: [{ k: "texture", x: -0.05, y: -0.62, t: "bubble" }, { k: "texture", x: 0.15, y: 0.7, t: "felt", c: "#E2707C" }, { k: "texture", x: -0.8, y: 0.05, t: "ridges" }, { k: "texture", x: 0.82, y: 0.05, t: "foil" }, { k: "texture", x: -0.2, y: 0.72, t: "felt", c: "#7CB56B" }, { k: "texture", x: 0.35, y: -0.72, t: "sponge" }] },
        { label: "Teacher-made Rainbow Fish provocation", items: [{ k: "rainbowfish", x: 0, y: 0, s: 1.1 }] },
        { label: "Unbreakable hand mirrors", addOn: true, items: [{ k: "mirror", x: 1.22, y: -0.4 }, { k: "mirror", x: -1.22, y: -0.4 }] },
        { label: "'My special fish' photo frames", addOn: true, items: [{ k: "photofish", x: 1.22, y: 0.4 }, { k: "photofish", x: -1.22, y: 0.4 }] },
      ],
    },
    {
      id: "PN-B3",
      weeks: [5, 6],
      title: "Rainbow Colours Exploration",
      wondering: "What colours can you find?",
      focus: "Treasure hunt for sea creatures in rainbow colours; name, sort and compare colours.",
      outcomes: ["EY.PN.NUM.1.2", "EY.PN.NUM.1.1", "EY.PN.SED.3.1", "EY.PN.LL.1.1"],
      domainCode: "EY.PN.NUM.1.1",
      setup:
        "Shredded blue and green paper 'waves' fill the tray. Sea creatures in the seven rainbow colours (red, orange, yellow, green, blue, indigo, violet) are hidden inside. Coloured 'coral home' hoops sit around the rim for sorting; treasure baskets and chunky tongs support the hunt.",
      addOn:
        "Week 6 add-on: colour paddles to look through, and a colour-mixing corner with pipettes and an ice-cube tray of red, yellow and blue water so children can discover new colours (red + yellow = orange).",
      safety: "Coloured water uses food colouring only; pipettes stay at the mixing corner; mop mat under the tray.",
      base: "shred",
      materials: [
        { label: "Shredded blue & green paper 'waves'", items: [] },
        { label: "Rainbow-coloured sea creatures (hidden)", items: [{ k: "fish", x: -0.4, y: -0.3, c: "#E53935" }, { k: "fish", x: 0.1, y: -0.5, c: "#FB8C00" }, { k: "fish", x: 0.45, y: -0.15, c: "#FDD835" }, { k: "fish", x: -0.1, y: 0.05, c: "#43A047" }, { k: "fish", x: 0.35, y: 0.35, c: "#1E88E5" }, { k: "fish", x: -0.45, y: 0.3, c: "#3949AB" }, { k: "fish", x: 0.0, y: 0.55, c: "#8E24AA" }] },
        { label: "Coloured 'coral home' sorting hoops", items: [{ k: "hoop", x: -0.78, y: -0.45, c: "#E53935" }, { k: "hoop", x: -0.3, y: -0.84, c: "#FB8C00" }, { k: "hoop", x: 0.3, y: -0.84, c: "#FDD835" }, { k: "hoop", x: 0.78, y: -0.45, c: "#43A047" }, { k: "hoop", x: 0.85, y: 0.25, c: "#1E88E5" }, { k: "hoop", x: 0.5, y: 0.75, c: "#3949AB" }, { k: "hoop", x: -0.5, y: 0.75, c: "#8E24AA" }] },
        { label: "Treasure baskets & chunky tongs", items: [{ k: "basket", x: -1.22, y: 0.1 }, { k: "tongs", x: -1.22, y: -0.45 }] },
        { label: "Colour paddles", addOn: true, items: [{ k: "paddle", x: 1.22, y: -0.5, c: "#E53935" }, { k: "paddle", x: 1.3, y: -0.3, c: "#FDD835" }, { k: "paddle", x: 1.22, y: -0.1, c: "#1E88E5" }] },
        { label: "Colour-mixing corner: pipettes & ice-cube tray", addOn: true, items: [{ k: "cubetray", x: 1.22, y: 0.45 }, { k: "pipette", x: 1.25, y: 0.8 }] },
      ],
    },
    {
      id: "PN-B4",
      weeks: [7, 8],
      title: "Feelings in the Ocean",
      wondering: "How can we use colours to show how we feel?",
      focus: "Emotions scooping: match coloured pompoms to feeling sea-creature containers and talk about feelings.",
      outcomes: ["EY.PN.SED.2.1", "EY.PN.LL.1.4", "EY.PN.PD.4.3"],
      domainCode: "EY.PN.PD.4.3",
      setup:
        "Four 'feelings' sea-creature containers (happy - yellow, sad - blue, angry - red, scared - purple) sit in a calm ocean. Large coloured pompoms fill the middle; children use tablespoons and scoops to move pompoms into the container that matches a feeling, naming it as they go.",
      addOn:
        "Week 8 add-on: each child has an individual bottle with their name, kept in a side basket. Children find their own bottle and add a pompom for how they feel today; the filling bottles are used for feelings discussions. A large shiny 'sharing scale' is passed around to practise giving.",
      safety: "Pompoms at least 4.5 cm; scoop by the tray only; name bottles have tight lids.",
      base: "ocean",
      materials: [
        { label: "Feelings sea-creature containers (happy, sad, angry, scared)", items: [{ k: "container", x: -0.45, y: -0.42, c: "#FDD835", t: "happy" }, { k: "container", x: 0.45, y: -0.42, c: "#1E88E5", t: "sad" }, { k: "container", x: -0.45, y: 0.45, c: "#E53935", t: "angry" }, { k: "container", x: 0.45, y: 0.45, c: "#8E24AA", t: "scared" }] },
        { label: "Large coloured pompoms", items: [{ k: "pompom", x: 0, y: 0, s: 1.3 }] },
        { label: "Tablespoons & scoops", items: [{ k: "scoop", x: 0.02, y: -0.62 }, { k: "scoop", x: 0.02, y: 0.66, r: 180 }] },
        { label: "Feelings fish picture cards", items: [{ k: "face", x: -1.22, y: -0.45, c: "#FDD835", t: "happy" }, { k: "face", x: -1.22, y: -0.05, c: "#1E88E5", t: "sad" }, { k: "face", x: -1.22, y: 0.35, c: "#E53935", t: "angry" }] },
        { label: "Personal name bottles in a side basket", addOn: true, items: [{ k: "namebottle", x: 1.18, y: -0.35 }, { k: "namebottle", x: 1.32, y: -0.1 }, { k: "namebottle", x: 1.18, y: 0.15 }] },
        { label: "Big shiny 'sharing scale'", addOn: true, items: [{ k: "disc", x: 1.22, y: 0.6, s: 1.3 }] },
      ],
    },
  ],
  weeks: [
    {
      week: 1,
      title: "The Most Beautiful Fish",
      storyBite: "Opening pages only: meet Rainbow Fish in the deep blue sea; his shimmering scales of every colour; the other fish admire him.",
      keyLanguage: ["ocean", "fish", "shiny", "scales", "glittery", "What can you find?"],
      song: "'Rainbow Fish, Rainbow Fish' (to the tune of 'Twinkle, Twinkle, Little Star') with swimming hand actions.",
      secValue: "Curiosity",
      secCode: "EY.PN.SED.6.1",
      llCode: "EY.PN.LL.1.3",
      ef: [WM, IC, CF],
      rolePlay: "Ocean movement role play: children become ocean creatures (gliding fish, sideways crab, wiggly octopus) and 'freeze' as a shell when the teacher shows the shiny scale card.",
      artCraft: { title: "Our Shimmering Ocean", description: "Collaborative ocean mural: sponge-print blue and green waves on a long sheet, then press on tissue seaweed. This becomes the class ocean where every fish made this term will live." },
      scene: {
        title: "The most beautiful fish in the ocean",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.5, y: 0.45, s: 2.2 }, { k: "fish", x: 0.16, y: 0.3, s: 0.9, c: "#7CB5E8" }, { k: "fish", x: 0.2, y: 0.62, s: 0.8, c: "#9CCC65" }, { k: "fish", x: 0.84, y: 0.25, s: 0.8, c: "#FFD54F", r: 180 }, { k: "bubbles", x: 0.7, y: 0.18 }],
        prompts: ["What can you see in the ocean?", "How do Rainbow Fish's scales look?", "Which colours can you find on him?"],
      },
      words: [{ word: "ocean", icon: "e:🌊" }, { word: "fish", icon: "e:🐟" }, { word: "shiny", icon: "e:✨" }, { word: "scales", icon: "disc" }, { word: "swim", icon: "e:🐠" }],
    },
    {
      week: 2,
      title: "Come and Play With Us!",
      storyBite: "The other fish call 'Rainbow Fish, come and play with us!' He glides past proudly. Little Blue Fish asks for one shiny scale and Rainbow Fish says no.",
      keyLanguage: ["play with us", "please", "may I have one?", "no", "proud", "turn"],
      song: "'Five Little Fishes' counting rhyme with fingers swimming away one by one.",
      secValue: "Responsibility (taking turns)",
      secCode: "EY.PN.SED.5.1",
      llCode: "EY.PN.LL.1.2",
      ef: [IC, WM, CF],
      rolePlay: "Puppet role play with teacher-in-role: Little Blue Fish puppet asks 'May I have one?'. Children take turns being Little Blue Fish asking politely, waiting for the 'shiny scale' turn-taker to come to them.",
      artCraft: { title: "Little Blue Fish", description: "Paper-plate Little Blue Fish: dab blue paint with a chunky sponge, then add ONE big foil scale. Children talk about why Little Blue Fish wanted a shiny scale." },
      scene: {
        title: "May I have one of your shiny scales?",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.65, y: 0.47, s: 2, r: 180 }, { k: "fish", x: 0.24, y: 0.5, s: 1.3, c: "#4FA3E3" }, { k: "speech", x: 0.24, y: 0.2, t: "May I have one?" }, { k: "bubbles", x: 0.45, y: 0.2 }],
        prompts: ["What is Little Blue Fish asking for?", "What did Rainbow Fish say?", "How do you think Little Blue Fish feels?"],
      },
      words: [{ word: "play", icon: "e:🤹" }, { word: "please", icon: "e:🙏" }, { word: "share", icon: "e:🤝" }, { word: "turn", icon: "e:🔄" }, { word: "little blue fish", icon: "e:🐟" }],
    },
    {
      week: 3,
      title: "Every Fish is Special",
      storyBite: "Revisit Rainbow Fish's special scales. Look at the many different fish in the ocean: big, small, stripy, spotty. Bridge to 'What makes ME special?'.",
      keyLanguage: ["special", "different", "same", "big / small", "smooth / rough / bumpy", "I like..."],
      song: "'If You're Happy and You Know It' adapted: 'If you have black hair and you know it, swim around!'",
      secValue: "Self-awareness",
      secCode: "EY.PN.SED.1.3",
      llCode: "EY.PN.LL.1.4",
      ef: [CF, WM, CF],
      rolePlay: "'Fish mirror' role play: in pairs, one child is the fish and the partner copies the movement, then they swap roles. Children say one thing that is special about their fish.",
      artCraft: { title: "My Special Fish", description: "Children choose their own fish shape and two or three textures (felt, bubble wrap, corrugated card, foil) to glue on, explaining their choices: 'I like bumpy!'." },
      scene: {
        title: "Every fish is special",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.5, y: 0.42, s: 1.6 }, { k: "fish", x: 0.17, y: 0.3, s: 1.4, c: "#FFB74D", t: "stripes" }, { k: "fish", x: 0.83, y: 0.32, s: 0.7, c: "#81C784", t: "spots", r: 180 }, { k: "fish", x: 0.25, y: 0.72, s: 0.8, c: "#BA68C8" }, { k: "fish", x: 0.78, y: 0.72, s: 1.1, c: "#4DD0E1", r: 180 }],
        prompts: ["Which fish is big? Which is small?", "How are these fish different?", "What makes YOU special?"],
      },
      words: [{ word: "special", icon: "e:⭐" }, { word: "big", icon: "e:🐋" }, { word: "small", icon: "e:🐟" }, { word: "bumpy", icon: "texture:bubble" }, { word: "smooth", icon: "mirror" }],
    },
    {
      week: 4,
      title: "All Alone",
      storyBite: "The other fish turn away when Rainbow Fish swims by. He is the most beautiful fish, but now he is the loneliest fish in the ocean.",
      keyLanguage: ["alone", "lonely", "sad", "happy", "friends", "I feel..."],
      song: "'When I'm Feeling Happy' feelings song with faces and actions (happy - clap, sad - rub eyes, lonely - hug self).",
      secValue: "Feelings (self-awareness)",
      secCode: "EY.PN.SED.2.1",
      llCode: "EY.PN.LL.2.3",
      ef: [IC, CF, WM],
      rolePlay: "'Together and alone' swim game: children swim as a school of fish; on the signal 'Rainbow Fish is coming!' they swim away, leaving the teacher-in-role alone. Children show and name how Rainbow Fish feels.",
      artCraft: { title: "Feelings Fish Puppet", description: "Two-sided fish stick puppet: a happy face on one side and a sad face on the other, drawn with chunky crayons. Used to show feelings during Wrap Up." },
      scene: {
        title: "The loneliest fish in the ocean",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.75, y: 0.55, s: 1.7, r: 180, t: "sad" }, { k: "fish", x: 0.12, y: 0.25, s: 0.7, c: "#7CB5E8", r: 180 }, { k: "fish", x: 0.22, y: 0.36, s: 0.7, c: "#FFD54F", r: 180 }, { k: "fish", x: 0.1, y: 0.47, s: 0.7, c: "#9CCC65", r: 180 }],
        prompts: ["Where are the other fish going?", "How does Rainbow Fish feel now?", "What can Rainbow Fish do?"],
      },
      words: [{ word: "alone", icon: "e:🐟" }, { word: "lonely", icon: "e:😔" }, { word: "sad", icon: "e:😢" }, { word: "happy", icon: "e:😊" }, { word: "friends", icon: "e:👫" }],
    },
    {
      week: 5,
      title: "The Wise Octopus",
      storyBite: "Starfish tells Rainbow Fish to visit the wise Octopus in a dark cave. Octopus says: give a glittering scale to each of the other fish.",
      keyLanguage: ["cave", "dark", "wise", "octopus", "advice", "help"],
      song: "'Octopus, Octopus, Wiggle Your Legs' action chant, counting eight wiggly arms.",
      secValue: "Courage (asking for help)",
      secCode: "EY.PN.SED.2.2",
      llCode: "EY.PN.LL.1.1",
      ef: [WM, IC, CF],
      rolePlay: "Visit to the wise Octopus: children 'swim' through a fabric cave tunnel (under / through / out) to the teacher-in-role Octopus and practise asking for help with a 4-5 word sentence: 'Octopus, please help me!'",
      artCraft: { title: "Wise Octopus", description: "Paper-bowl octopus: children paint the bowl, then attach eight crepe-paper arms one at a time, counting with a friend." },
      scene: {
        title: "Visiting the wise Octopus",
        bg: "seacave",
        items: [{ k: "e:🐙", x: 0.68, y: 0.48, s: 2.4 }, { k: "rainbowfish", x: 0.25, y: 0.55, s: 1.4 }, { k: "star", x: 0.42, y: 0.82, s: 1.1, c: "#FB8C00" }],
        prompts: ["Where is Rainbow Fish going?", "Who lives in the dark cave?", "What advice does Octopus give?"],
      },
      words: [{ word: "cave", icon: "cave" }, { word: "dark", icon: "e:🌑" }, { word: "octopus", icon: "e:🐙" }, { word: "help", icon: "e:🙋" }, { word: "starfish", icon: "star" }],
    },
    {
      week: 6,
      title: "One Small Shiny Scale",
      storyBite: "Little Blue Fish asks again. Rainbow Fish gives away one small shiny scale, and a peculiar feeling comes over him.",
      keyLanguage: ["give", "one", "shiny", "thank you", "feel", "new colour"],
      song: "'Sharing Song' to the tune of 'Row, Row, Row Your Boat': 'Share, share, share a scale, give one to a friend...'",
      secValue: "Resilience (trying again)",
      secCode: "EY.PN.SED.6.2",
      llCode: "EY.PN.LL.1.3",
      ef: [CF, IC, WM],
      rolePlay: "Pass the shiny scale: in a circle, children pass a big foil scale while the song plays; when it stops, the child holding it gives it to a friend and says 'This is for you!' and the friend replies 'Thank you!'",
      artCraft: { title: "Colour-mix Scales", description: "Coffee-filter scales: children drip red, yellow and blue water with pipettes and watch colours mix into new colours. Dried scales are later shared onto fish on the class ocean." },
      scene: {
        title: "One small shiny scale",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.65, y: 0.5, s: 1.9, r: 180 }, { k: "fish", x: 0.25, y: 0.52, s: 1.2, c: "#4FA3E3", t: "shiny" }, { k: "disc", x: 0.44, y: 0.47, s: 0.8 }, { k: "bubbles", x: 0.4, y: 0.2 }],
        prompts: ["What is Rainbow Fish giving?", "How does Little Blue Fish feel?", "What would you say?"],
      },
      words: [{ word: "give", icon: "e:🎁" }, { word: "one", icon: "e:☝️" }, { word: "thank you", icon: "e:💖" }, { word: "shiny", icon: "disc" }, { word: "mix", icon: "pipette" }],
    },
    {
      week: 7,
      title: "Sharing Makes Us Happy",
      storyBite: "All the fish crowd around; Rainbow Fish shares his scales until he has just one left, and he feels very happy.",
      keyLanguage: ["share", "everyone", "happy", "kind", "together", "How do you feel?"],
      song: "'The More We Share Together' (to the tune of 'The More We Get Together').",
      secValue: "Social awareness (sharing)",
      secCode: "EY.PN.SED.3.1",
      llCode: "EY.PN.LL.1.4",
      ef: [IC, WM, CF],
      rolePlay: "School of fish: children swim together holding one shared fabric 'ocean'. One child is Rainbow Fish and gives a shiny scale sticker to each friend; friends say how they feel.",
      artCraft: { title: "A Scale for a Friend", description: "Children make one shiny foil scale and choose a friend's fish on the class ocean to give it to, saying 'This is for you'." },
      scene: {
        title: "A shiny scale for everyone",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.5, y: 0.5, s: 1.6 }, { k: "fish", x: 0.18, y: 0.28, s: 0.8, c: "#7CB5E8", t: "shiny" }, { k: "fish", x: 0.82, y: 0.28, s: 0.8, c: "#FFD54F", t: "shiny", r: 180 }, { k: "fish", x: 0.16, y: 0.72, s: 0.8, c: "#9CCC65", t: "shiny" }, { k: "fish", x: 0.84, y: 0.72, s: 0.8, c: "#F48FB1", t: "shiny", r: 180 }],
        prompts: ["What does every fish have now?", "How does everyone feel?", "What can you share with a friend?"],
      },
      words: [{ word: "share", icon: "e:🤝" }, { word: "everyone", icon: "e:👨‍👩‍👧‍👦" }, { word: "happy", icon: "e:😄" }, { word: "kind", icon: "e:💛" }, { word: "together", icon: "e:🫶" }],
    },
    {
      week: 8,
      title: "Rainbow Fish and Friends",
      storyBite: "'Come on, Rainbow Fish, come and play with us!' He joins his friends, happy at last. Retell the whole story through the scene cards in order.",
      keyLanguage: ["first", "next", "last", "friends", "celebrate", "I can..."],
      song: "Revisit the term's 'Rainbow Fish' song and sing it as a celebration with scarves.",
      secValue: "Relationships (friendship)",
      secCode: "EY.PN.SED.4.1",
      llCode: "EY.PN.LL.2.4",
      ef: [WM, CF, IC],
      rolePlay: "Rainbow Fish show: children choose a role (Rainbow Fish, Little Blue Fish, Starfish, Octopus, other fish) and act out the story in order using simple props, with teacher narration.",
      artCraft: { title: "Rainbow Fish Friends Mural", description: "Each child's fish joins the class ocean mural, with the shared shiny scales; children tell a friend which part of the story they liked best." },
      scene: {
        title: "Come and play with us!",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.5, y: 0.45, s: 1.5 }, { k: "fish", x: 0.22, y: 0.4, s: 0.9, c: "#4FA3E3", t: "shiny" }, { k: "fish", x: 0.78, y: 0.4, s: 0.9, c: "#FFD54F", t: "shiny", r: 180 }, { k: "fish", x: 0.35, y: 0.75, s: 0.9, c: "#9CCC65", t: "shiny" }, { k: "fish", x: 0.65, y: 0.75, s: 0.9, c: "#F48FB1", t: "shiny", r: 180 }, { k: "bubbles", x: 0.5, y: 0.15 }],
        prompts: ["What happened first? Next? Last?", "How is Rainbow Fish feeling now?", "Which part did you like best?"],
      },
      words: [{ word: "first", icon: "e:1️⃣" }, { word: "next", icon: "e:2️⃣" }, { word: "last", icon: "e:3️⃣" }, { word: "friends", icon: "e:👫" }, { word: "celebrate", icon: "e:🎉" }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Playgroup (2 year olds) -- We're Going on a Bear Hunt
// ---------------------------------------------------------------------------
const PG: TermPlan = {
  level: "pg",
  term: 1,
  levelLabel: "Playgroup (2 Year Olds)",
  shortLabel: "Playgroup",
  story: "We're Going on a Bear Hunt",
  author: "Michael Rosen",
  wondering: "What can we find?",
  connection: "Children discover places, creatures, textures and feelings on the family's bear hunt journey.",
  cdpValues: ["Curiosity", "Responsibility", "Resilience", "Courage"],
  focus: "Developing Communication & Language through repetitive chant, sound words and sensory exploration",
  languageExposure:
    "Repetitive chant ('We're going on a bear hunt...'), sound words (swishy swashy, splash splosh, squelch squerch, stumble trip, hoooo wooo, tiptoe), position words (over, under, through), texture words (wet, cold, sticky, soft), feeling words (happy, scared).",
  developmental: [
    "Attention for one focused segment is about 3-5 minutes; repeat, move and sing often.",
    "Uses single words and 2-3 word phrases; understands far more than they can say; relies on gestures, sounds and modelling.",
    "Mostly parallel play beside peers; turn-taking needs strong adult support, visual cues and very short waits.",
    "Learns through the senses and whole-body movement; loves repetition and predictable chants.",
    "Follows one-step instructions with gestures; transitions are smoother with a song or sound cue.",
    "Still mouths objects: taste-safe materials only, no loose parts smaller than 4.5 cm, close supervision with water and ice.",
  ],
  blocks: [
    {
      id: "PG-B1",
      weeks: [1, 2],
      title: "Swishy Swashy Grass & Splash Splosh River",
      wondering: "What can we find in the long grass?",
      focus: "Hunt through long wavy grass and a cool river using hands, eyes and sound words.",
      outcomes: ["EY.PG.NE.2.1", "EY.PG.LL.1.1", "EY.PG.SED.6.1"],
      domainCode: "EY.PG.NE.2.1",
      setup:
        "Artificial grass mat topped with long strips of shredded green crepe paper ('long wavy grass'). The bear-hunt family figurines and dog walk through it; large animal figurines hide in the grass for children to find with toilet-roll binoculars.",
      addOn:
        "Week 2 add-on: a long shallow 'river' tub of cool water across one side of the tray with floating boats, sponges to squeeze and big flat 'stepping stones' for the family to cross.",
      safety: "Water no deeper than 2 cm; towels ready; all figurines larger than 4.5 cm; adult stays at the river.",
      base: "grass",
      materials: [
        { label: "Artificial grass mat + long green crepe-paper 'grass'", items: [{ k: "grass", x: -0.5, y: -0.4 }, { k: "grass", x: 0.1, y: -0.62 }, { k: "grass", x: 0.55, y: -0.3 }, { k: "grass", x: -0.6, y: 0.25 }, { k: "grass", x: -0.1, y: 0.1 }] },
        { label: "Bear-hunt family figurines & dog", items: [{ k: "e:👨", x: -0.3, y: -0.12 }, { k: "e:👧", x: -0.12, y: -0.25 }, { k: "e:👦", x: 0.05, y: -0.1 }, { k: "e:👶", x: -0.25, y: 0.15 }, { k: "e:🐕", x: 0.2, y: 0.1 }] },
        { label: "Animal figurines hiding in the grass", items: [{ k: "e:🐻", x: 0.45, y: -0.55 }, { k: "e:🐰", x: -0.65, y: -0.1 }, { k: "e:🐞", x: -0.4, y: 0.5 }] },
        { label: "Toilet-roll binoculars", items: [{ k: "binoculars", x: -1.22, y: -0.3 }, { k: "binoculars", x: -1.22, y: 0.2 }] },
        { label: "Cool-water 'river' tub", addOn: true, items: [{ k: "river", x: 0.38, y: 0.42, s: 1 }] },
        { label: "Floating boats & sponges", addOn: true, items: [{ k: "e:⛵", x: 0.3, y: 0.42 }, { k: "sponge", x: 0.62, y: 0.3 }] },
        { label: "Big flat stepping stones", addOn: true, items: [{ k: "rock", x: 0.08, y: 0.55, s: 0.8 }, { k: "rock", x: 0.5, y: 0.66, s: 0.8 }] },
      ],
    },
    {
      id: "PG-B2",
      weeks: [3, 4],
      title: "Squelch Squerch Mud & Stumble Trip Forest",
      wondering: "What does the mud feel like?",
      focus: "Squish, stamp and scoop taste-safe mud, then add a forest to stumble through.",
      outcomes: ["EY.PG.PD.4.1", "EY.PG.LL.1.4", "EY.PG.SED.6.2"],
      domainCode: "EY.PG.PD.4.1",
      setup:
        "Taste-safe 'mud' (cornflour, cocoa powder and water) fills the tray. Chunky toy boots and the family figurines make squelchy footprints; big scoops and spoons let children dig, pour and squish. A wipe-and-towel station sits beside the tray.",
      addOn:
        "Week 4 add-on: a 'forest' along one side - chunky branches and big pinecones standing up in playdough bases, plus large felt leaves - for the family to stumble and trip through.",
      safety: "Cocoa-based mud is taste-safe; check allergies first; sleeves rolled up and aprons on; branches sanded, no sharp twigs.",
      base: "mud",
      materials: [
        { label: "Taste-safe cornflour & cocoa 'mud'", items: [] },
        { label: "Chunky toy boots for squelchy footprints", items: [{ k: "e:🥾", x: -0.3, y: -0.35 }, { k: "e:🥾", x: 0.15, y: 0.2, r: 30 }, { k: "footprints", x: 0.0, y: -0.05 }] },
        { label: "Family figurines", items: [{ k: "e:👩", x: -0.55, y: 0.15 }, { k: "e:👦", x: -0.4, y: 0.35 }, { k: "e:🐕", x: 0.35, y: -0.35 }] },
        { label: "Big scoops & spoons", items: [{ k: "scoop", x: 0.45, y: 0.45 }, { k: "scoop", x: -0.15, y: 0.6, r: 140 }] },
        { label: "Wipe & towel station", items: [{ k: "towel", x: -1.22, y: 0 }] },
        { label: "'Forest': branches & big pinecones in playdough", addOn: true, items: [{ k: "tree", x: 0.62, y: -0.3 }, { k: "tree", x: 0.75, y: 0.1 }, { k: "pinecone", x: 0.5, y: 0.0 }, { k: "stick", x: 0.62, y: 0.5, r: 30 }] },
        { label: "Large felt leaves", addOn: true, items: [{ k: "e:🍂", x: 0.35, y: -0.6 }, { k: "e:🍃", x: 0.85, y: -0.3 }] },
      ],
    },
    {
      id: "PG-B3",
      weeks: [5, 6],
      title: "Hoooo Wooo Snowstorm & the Gloomy Cave",
      wondering: "What happens to the ice?",
      focus: "Feel cold ice and soft 'snow', rescue frozen animals, then tiptoe into a gloomy cave.",
      outcomes: ["EY.PG.NE.2.3", "EY.PG.LL.1.3", "EY.PG.SED.2.1"],
      domainCode: "EY.PG.NE.2.3",
      setup:
        "Ice blocks with large animal toys frozen inside sit on soft cotton-wool 'snow' and big white pompoms. Squeeze bottles of warm water and child-size mittens help children free the animals and notice ice melting in our warm Singapore classroom.",
      addOn:
        "Week 6 add-on: a gloomy 'cave' (an upturned black basket) at one side with the bear hiding inside, a torch to peek with, and tiptoe footprints leading in.",
      safety: "Ice handled with mittens or after a short touch; warm water lukewarm only; cotton wool supervised (no mouthing).",
      base: "snow",
      materials: [
        { label: "Cotton-wool 'snow' & big white pompoms", items: [{ k: "cotton", x: -0.55, y: -0.3 }, { k: "cotton", x: 0.0, y: 0.55 }, { k: "cotton", x: -0.6, y: 0.45 }] },
        { label: "Ice blocks with animals frozen inside", items: [{ k: "ice", x: -0.12, y: -0.4, s: 1.5, t: "🐻" }, { k: "ice", x: 0.22, y: 0.08, s: 1.5, t: "🐰" }, { k: "ice", x: -0.3, y: 0.2, s: 1.5, t: "🐟" }] },
        { label: "Squeeze bottles of warm water", items: [{ k: "bottle", x: -1.22, y: -0.35 }, { k: "bottle", x: -1.22, y: 0.1 }] },
        { label: "Child-size mittens", items: [{ k: "e:🧤", x: -1.22, y: 0.55 }] },
        { label: "Gloomy 'cave' (upturned black basket) with bear inside", addOn: true, items: [{ k: "cave", x: 0.55, y: -0.2, s: 1.1 }, { k: "e:🐻", x: 0.55, y: -0.15, s: 0.8 }] },
        { label: "Torch to peek into the cave", addOn: true, items: [{ k: "torch", x: 1.22, y: 0.1 }] },
        { label: "Tiptoe footprints into the cave", addOn: true, items: [{ k: "footprints", x: 0.42, y: 0.42, r: -60 }] },
      ],
    },
    {
      id: "PG-B4",
      weeks: [7, 8],
      title: "The Whole Bear Hunt Journey",
      wondering: "Where did we go on our bear hunt?",
      focus: "Retrace the whole journey in order through six mini-zones, then hurry home and hide under the covers.",
      outcomes: ["EY.PG.LL.2.4", "EY.PG.NUM.3.3", "EY.PG.SED.3.1"],
      domainCode: "EY.PG.NUM.3.3",
      setup:
        "The tray is divided into six mini-zones in story order: grass, river, mud (brown playdough), forest, snowstorm and cave, joined by a footprint path. Children move the family along the path, saying each sound word, and find the bear in the cave.",
      addOn:
        "Week 8 add-on: a 'home' corner with a box bed and a fabric blanket for the family to hide 'under the covers', plus feeling picture cards (happy, scared, sad bear) to talk about how the family and the bear feel.",
      safety: "Reuse materials from earlier weeks; keep water zone shallow; playdough mud is taste-safe homemade.",
      base: "journey",
      materials: [
        { label: "Six story mini-zones: grass, river, mud, forest, snow, cave", items: [] },
        { label: "Footprint path joining the zones", items: [{ k: "footprints", x: -0.05, y: 0.05, r: 20 }] },
        { label: "Family figurines & dog", items: [{ k: "e:👨", x: -0.42, y: -0.2 }, { k: "e:👧", x: -0.25, y: -0.35 }, { k: "e:🐕", x: -0.05, y: -0.45 }] },
        { label: "Bear waiting in the cave", items: [{ k: "e:🐻", x: -0.48, y: 0.42, s: 0.9 }] },
        { label: "Home corner: box bed with blanket", addOn: true, items: [{ k: "bed", x: 1.22, y: -0.3 }] },
        { label: "Feeling picture cards (happy, scared, sad bear)", addOn: true, items: [{ k: "face", x: 1.22, y: 0.25, c: "#FDD835", t: "happy" }, { k: "face", x: 1.22, y: 0.6, c: "#8E24AA", t: "scared" }] },
      ],
    },
  ],
  weeks: [
    {
      week: 1,
      title: "We're Going on a Bear Hunt!",
      storyBite: "Opening only: the family sets off - 'We're going on a bear hunt. We're going to catch a big one.' First obstacle: long wavy grass - 'Swishy swashy!'",
      keyLanguage: ["bear", "hunt", "grass", "swishy swashy", "not scared", "find"],
      song: "The bear hunt chant with a steady knee-pat beat and a big 'Uh-uh! Grass!'",
      secValue: "Curiosity",
      secCode: "EY.PG.SED.6.1",
      llCode: "EY.PG.LL.1.1",
      ef: [WM, IC, CF],
      rolePlay: "Swishy swashy walk: children follow the teacher-in-role 'Dad' through paper-strip grass, brushing it with their arms and saying 'swishy swashy', and freeze when the teacher holds up the bear picture.",
      artCraft: { title: "Swishy Swashy Grass", description: "Teacher pre-cuts green paper strips; children press them onto sticky contact paper (no glue) and swish the 'grass' with their hands." },
      scene: {
        title: "We're going on a bear hunt!",
        bg: "grass",
        items: [{ k: "e:👨", x: 0.18, y: 0.6, s: 1.4 }, { k: "e:👧", x: 0.33, y: 0.62, s: 1.2 }, { k: "e:👦", x: 0.47, y: 0.63, s: 1.2 }, { k: "e:👶", x: 0.6, y: 0.65, s: 1 }, { k: "e:🐕", x: 0.74, y: 0.68, s: 1 }, { k: "sun", x: 0.86, y: 0.16 }],
        prompts: ["Who is going on the bear hunt?", "What can you see?", "Can you say 'swishy swashy'?"],
      },
      words: [{ word: "bear", icon: "e:🐻" }, { word: "grass", icon: "e:🌾" }, { word: "swishy swashy", icon: "e:🌿" }, { word: "find", icon: "e:🔍" }, { word: "family", icon: "e:👨‍👩‍👧‍👦" }],
    },
    {
      week: 2,
      title: "Splash Splosh River",
      storyBite: "'Uh-uh! A river! A deep cold river. We can't go over it. We can't go under it. Oh no! We've got to go through it! Splash splosh!'",
      keyLanguage: ["river", "water", "cold", "splash splosh", "over / under / through", "wet"],
      song: "Bear hunt chant adding the river verse; 'Row, Row, Row Your Boat' with partner rocking.",
      secValue: "Courage",
      secCode: "EY.PG.SED.2.2",
      llCode: "EY.PG.LL.1.2",
      ef: [IC, WM, CF],
      rolePlay: "Splash splosh across the river: a blue fabric river on the floor with flat cushion 'stepping stones'; children step through one at a time, saying 'splash splosh', with a teacher holding hands for anyone unsure.",
      artCraft: { title: "Splash Splosh River", description: "Bubble-wrap printing with blue paint on a long 'river' strip; children pat and press to make watery splashes." },
      scene: {
        title: "Uh-uh! A river!",
        bg: "river",
        items: [{ k: "e:👨", x: 0.2, y: 0.4, s: 1.3 }, { k: "e:👧", x: 0.32, y: 0.42, s: 1.1 }, { k: "e:👶", x: 0.43, y: 0.44, s: 0.9 }, { k: "e:🐕", x: 0.54, y: 0.46, s: 0.9 }, { k: "e:💦", x: 0.7, y: 0.7, s: 1 }],
        prompts: ["What is this? (river)", "Is the water hot or cold?", "How do we go? Over, under... or through?"],
      },
      words: [{ word: "river", icon: "e:🌊" }, { word: "water", icon: "e:💧" }, { word: "cold", icon: "e:🥶" }, { word: "splash", icon: "e:💦" }, { word: "through", icon: "e:➡️" }],
    },
    {
      week: 3,
      title: "Squelch Squerch Mud",
      storyBite: "'Uh-uh! Mud! Thick oozy mud. We can't go over it... We've got to go through it! Squelch squerch!'",
      keyLanguage: ["mud", "squelch squerch", "sticky", "squish", "stuck", "try again"],
      song: "Bear hunt chant adding the mud verse with big slow stomping steps.",
      secValue: "Resilience",
      secCode: "EY.PG.SED.6.2",
      llCode: "EY.PG.LL.1.4",
      ef: [IC, CF, WM],
      rolePlay: "Stuck in the mud: children walk slowly across brown mats pretending their feet are stuck ('Squelch squerch! Pull! Try again!'), then speed up when the mud ends.",
      artCraft: { title: "Squelchy Mud Footprints", description: "Toy boots and toy feet dipped in brown paint stamp squelchy footprints along a long paper path." },
      scene: {
        title: "Uh-uh! Mud!",
        bg: "mud",
        items: [{ k: "e:👨", x: 0.22, y: 0.45, s: 1.3 }, { k: "e:👦", x: 0.37, y: 0.47, s: 1.1 }, { k: "e:👶", x: 0.5, y: 0.5, s: 0.9 }, { k: "e:🐕", x: 0.63, y: 0.5, s: 0.9 }, { k: "footprints", x: 0.8, y: 0.75 }],
        prompts: ["What is this? (mud)", "How does mud feel?", "What sound do our feet make?"],
      },
      words: [{ word: "mud", icon: "e:🟫" }, { word: "squelch", icon: "e:🥾" }, { word: "sticky", icon: "e:🍯" }, { word: "stuck", icon: "e:😣" }, { word: "pull", icon: "e:💪" }],
    },
    {
      week: 4,
      title: "Stumble Trip Forest",
      storyBite: "'Uh-uh! A forest! A big dark forest. We can't go over it... We've got to go through it! Stumble trip!'",
      keyLanguage: ["forest", "tree", "stumble trip", "big", "dark", "my turn"],
      song: "Bear hunt chant with the forest verse; 'Here We Go Round the Mulberry Bush' as 'Round the forest tree'.",
      secValue: "Responsibility (taking turns)",
      secCode: "EY.PG.SED.5.1",
      llCode: "EY.PG.LL.1.3",
      ef: [IC, WM, CF],
      rolePlay: "Stumble trip forest: children take turns stepping over pool-noodle 'branches' and ducking under a fabric 'tree' tunnel, waiting at the 'my turn' footprint mat.",
      artCraft: { title: "Stumble Trip Forest", description: "Leaf and twig collage pressed onto sticky contact paper tree trunks to make the class forest." },
      scene: {
        title: "Uh-uh! A forest!",
        bg: "forest",
        items: [{ k: "e:👩", x: 0.2, y: 0.62, s: 1.3 }, { k: "e:👧", x: 0.34, y: 0.64, s: 1.1 }, { k: "e:👶", x: 0.46, y: 0.66, s: 0.9 }, { k: "e:🐕", x: 0.58, y: 0.68, s: 0.9 }],
        prompts: ["What can you see in the forest?", "Is the forest big or small?", "What do we say? Stumble trip!"],
      },
      words: [{ word: "forest", icon: "e:🌲" }, { word: "tree", icon: "e:🌳" }, { word: "stumble trip", icon: "e:🪵" }, { word: "big", icon: "e:🐘" }, { word: "my turn", icon: "e:🙋" }],
    },
    {
      week: 5,
      title: "Hoooo Wooo Snowstorm",
      storyBite: "'Uh-uh! A snowstorm! A swirling whirling snowstorm. We've got to go through it! Hoooo wooo!'",
      keyLanguage: ["snow", "cold", "ice", "hoooo wooo", "soft", "my jacket"],
      song: "Bear hunt chant with the snowstorm verse, swirling scarves to 'hoooo wooo'.",
      secValue: "Self-awareness (my things)",
      secCode: "EY.PG.SED.1.1",
      llCode: "EY.PG.LL.1.1",
      ef: [WM, IC, CF],
      rolePlay: "Snowstorm dress-up: children find their own named scarf from the basket ('This is mine!'), wrap up warm and swirl through the 'snowstorm' of white scarves, freezing like a snowman when the music stops.",
      artCraft: { title: "Hoooo Wooo Snowstorm", description: "Cotton-wool and white pompom-peg painting on dark-blue paper to make a swirling snowstorm." },
      scene: {
        title: "Uh-uh! A snowstorm!",
        bg: "snow",
        items: [{ k: "e:👨", x: 0.22, y: 0.62, s: 1.3 }, { k: "e:👧", x: 0.37, y: 0.64, s: 1.1 }, { k: "e:👶", x: 0.5, y: 0.66, s: 0.9 }, { k: "e:🐕", x: 0.63, y: 0.68, s: 0.9 }, { k: "e:❄️", x: 0.8, y: 0.3, s: 1.2 }],
        prompts: ["What is falling from the sky?", "How does snow feel?", "Show me how the wind blows!"],
      },
      words: [{ word: "snow", icon: "e:❄️" }, { word: "cold", icon: "e:🥶" }, { word: "ice", icon: "e:🧊" }, { word: "wind", icon: "e:🌬️" }, { word: "mine", icon: "e:🧣" }],
    },
    {
      week: 6,
      title: "Tiptoe! A Gloomy Cave",
      storyBite: "'Uh-uh! A cave! A narrow gloomy cave. Tiptoe, tiptoe... WHAT'S THAT? One shiny wet nose, two big furry ears, two big goggly eyes... IT'S A BEAR!'",
      keyLanguage: ["cave", "dark", "tiptoe", "quiet", "scared", "nose / ears / eyes"],
      song: "Bear hunt chant with the cave verse in a whisper voice, then 'Head, Shoulders, Knees and Toes' as 'Nose, ears, eyes'.",
      secValue: "Feelings (scared and safe)",
      secCode: "EY.PG.SED.2.1",
      llCode: "EY.PG.LL.2.3",
      ef: [IC, WM, CF],
      rolePlay: "Tiptoe into the cave: under a table draped with a dark blanket, children tiptoe in pairs with a torch, whisper 'tiptoe', and find the bear's shiny nose, furry ears and goggly eyes on a picture.",
      artCraft: { title: "Peek-a-boo Bear Cave", description: "Brown paper-bag bear face with a shiny foil nose behind a 'cave' flap; children lift the flap: 'It's a bear!'." },
      scene: {
        title: "Tiptoe... It's a bear!",
        bg: "cave",
        items: [{ k: "e:🐻", x: 0.68, y: 0.52, s: 2.4 }, { k: "e:👦", x: 0.2, y: 0.7, s: 1.1 }, { k: "e:👶", x: 0.32, y: 0.72, s: 0.9 }, { k: "torch", x: 0.12, y: 0.75, s: 1 }],
        prompts: ["Where are we now? (cave)", "Who is in the cave?", "How do the children feel?"],
      },
      words: [{ word: "cave", icon: "cave" }, { word: "dark", icon: "e:🌑" }, { word: "tiptoe", icon: "e:🦶" }, { word: "quiet", icon: "e:🤫" }, { word: "scared", icon: "e:😨" }],
    },
    {
      week: 7,
      title: "Quick! Back Home!",
      storyBite: "The family runs back through everything in reverse: cave, snowstorm, forest, mud, river, grass - fast! - to the front door.",
      keyLanguage: ["run", "quick", "back", "home", "first / next", "where?"],
      song: "Bear hunt chant at double speed in reverse order with picture cards held up in turn.",
      secValue: "Social awareness",
      secCode: "EY.PG.SED.3.1",
      llCode: "EY.PG.LL.2.4",
      ef: [WM, CF, IC],
      rolePlay: "Run back home: picture-card stations around the room in reverse order; children 'run' (fast walk) from station to station holding a friend's hand, saying the sound word at each one.",
      artCraft: { title: "Our Bear Hunt Map", description: "Group map: each small group adds one texture to a long journey map (grass strips, blue paint, mud prints, leaves, cotton wool, black cave)." },
      scene: {
        title: "Quick! Back home!",
        bg: "journey",
        items: [{ k: "e:👨", x: 0.25, y: 0.62, s: 1.2 }, { k: "e:👧", x: 0.37, y: 0.64, s: 1 }, { k: "e:🐕", x: 0.48, y: 0.66, s: 0.9 }, { k: "e:🐻", x: 0.82, y: 0.55, s: 1.5 }, { k: "e:🏠", x: 0.08, y: 0.55, s: 1.3 }],
        prompts: ["Where is the family running?", "Who is chasing them?", "What did they go through first?"],
      },
      words: [{ word: "run", icon: "e:🏃" }, { word: "quick", icon: "e:⚡" }, { word: "back", icon: "e:⬅️" }, { word: "home", icon: "e:🏠" }, { word: "door", icon: "e:🚪" }],
    },
    {
      week: 8,
      title: "Under the Covers",
      storyBite: "Home! Shut the door, up the stairs, into bed, under the covers: 'We're not going on a bear hunt again!' Last page: the bear walks alone and sad on the beach.",
      keyLanguage: ["bed", "covers", "safe", "sad", "happy", "family"],
      song: "Whole bear hunt chant as a celebration, ending with a whispered 'under the covers'.",
      secValue: "Relationships (family and friends)",
      secCode: "EY.PG.SED.4.1",
      llCode: "EY.PG.LL.1.3",
      ef: [WM, IC, CF],
      rolePlay: "Under the covers: a large parachute or blanket becomes the bed; children hide underneath when the teacher says 'bear!' and peek out to say goodnight to a friend.",
      artCraft: { title: "Under the Covers Collage", description: "Fabric-scrap blanket collage over a picture of each child in bed, pressed onto contact paper: 'This is me, safe in bed.'" },
      scene: {
        title: "Under the covers!",
        bg: "home",
        items: [{ k: "bed", x: 0.36, y: 0.6, s: 4.2 }, { k: "e:🐻", x: 0.82, y: 0.32, s: 0.9 }],
        prompts: ["Where is the family hiding?", "How does the family feel now?", "How does the bear feel?"],
      },
      words: [{ word: "bed", icon: "e:🛏️" }, { word: "safe", icon: "e:🏠" }, { word: "sad", icon: "e:😢" }, { word: "happy", icon: "e:😊" }, { word: "family", icon: "e:👨‍👩‍👧‍👦" }],
    },
  ],
};

export const IBRAIN_TERM1: Record<"pg" | "pn", TermPlan> = { pg: PG, pn: PN };

export const blockForWeek = (plan: TermPlan, week: number): TuffBlock =>
  plan.blocks.find((b) => week >= b.weeks[0] && week <= b.weeks[1])!;

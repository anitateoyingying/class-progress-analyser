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
  sourcing: string;
  wondering2?: string;
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
  topicBrainstorm: string;
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
  topicBrainstorm:
    "Colours, identity (what do I look like, likes/dislikes), similarities and differences, friendship (actions we do), feelings (happy, sad, lonely). Ideas: emotions exploration with the tuff tray, creative colour exploration, sea creatures exploration, creative movement as sea creatures, observe and compare textures (smooth, rough, bumpy, prickly), sizes (big/small) and appearance (dull/glossy/shiny).",
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
      focus: "Explore the world of Rainbow Fish: the ocean setting, its creatures and things that shine; in week 2, sort ocean finds by one attribute (shiny / not shiny).",
      outcomes: ["EY.PN.NE.1.1", "EY.PN.NE.2.1", "EY.PN.LL.1.3", "EY.PN.SED.3.1"],
      domainCode: "EY.PN.NE.1.1",
      setup:
        "Teachers create the base of an ocean (blue fabric with a shimmery blue organza 'water' layer in the centre and a beige felt 'seabed' corner). Provide plastic aquarium corals, smooth plastic 'reef rocks', large smooth-edged shells (larger than 4.5 cm, or plastic toy shells), seaweed (green ribbon and fabric strips) and sea-creature figurines. Children explore and build ocean life with teacher facilitation.",
      addOn:
        "Week 2 add-on: laminated holographic-card 'shiny scale' discs (larger than 4.5 cm) and acrylic (shatterproof) mirror tiles hidden among the reef, two sorting baskets with 'shiny' and 'not shiny' picture labels so children sort their finds by one attribute, sea-creature name and picture cards, and a chunky screw-cover torch to make things shimmer like Rainbow Fish.",
      safety: "Mess-free: fabric and felt only, no sand or water. Every loose item larger than 4.5 cm (check with a toilet-roll tube); plastic or smooth-edged shells only, plastic rocks (no real stones), acrylic mirrors (no glass), laminated scale discs that cannot tear; torch is AA/AAA with a screw-fastened battery cover (no button cells) and stays at the tray.",
      sourcing: "Daiso (organza fabric, felt, holographic card, acrylic mirror sheets, magnifiers, baskets, AA torch), Daiso aquarium section or a pet shop (plastic corals and aquarium rocks), Popular or Toys'R'Us (sea-creature figurines and plastic toy shells); laminate the scale discs and picture cards at school.",
      base: "ocean",
      materials: [
        { label: "Blue fabric 'ocean' + shimmery organza 'water'", items: [{ k: "water", x: 0.05, y: -0.05, s: 1.15 }] },
        { label: "Beige felt 'seabed' corner", items: [{ k: "feltmat", x: -0.42, y: 0.52, s: 1 }] },
        { label: "Plastic aquarium corals & plastic reef rocks", items: [{ k: "coral", x: -0.55, y: -0.32, c: "#E2707C" }, { k: "coral", x: 0.58, y: 0.38, c: "#F4A259" }, { k: "rock", x: -0.15, y: 0.66 }, { k: "rock", x: 0.7, y: -0.12 }] },
        { label: "Seaweed (green ribbon & fabric strips)", items: [{ k: "seaweed", x: -0.75, y: 0.12 }, { k: "seaweed", x: 0.3, y: -0.7 }, { k: "seaweed", x: 0.8, y: 0.3 }] },
        { label: "Large smooth shells (or plastic toy shells)", items: [{ k: "shell", x: -0.3, y: 0.42 }, { k: "shell", x: 0.12, y: 0.74 }, { k: "shell", x: -0.62, y: 0.6 }] },
        { label: "Sea-creature figurines", items: [{ k: "e:🐠", x: 0.12, y: -0.25 }, { k: "e:🦀", x: -0.18, y: 0.3 }, { k: "e:🐙", x: 0.42, y: 0.08 }, { k: "e:🐢", x: -0.38, y: -0.58 }, { k: "star", x: 0.25, y: 0.48, c: "#F4A259" }] },
        { label: "Chunky magnifying glasses", items: [{ k: "magnifier", x: 1.2, y: 0.55 }, { k: "magnifier", x: -1.2, y: -0.5 }] },
        { label: "Laminated holographic 'shiny scales' & acrylic mirror tiles", addOn: true, items: [{ k: "disc", x: -0.02, y: 0.18 }, { k: "disc", x: 0.3, y: -0.4 }, { k: "disc", x: -0.12, y: -0.12 }, { k: "mirror", x: -0.6, y: -0.02 }] },
        { label: "'Shiny / not shiny' sorting baskets", addOn: true, items: [{ k: "basket", x: 1.22, y: -0.45 }, { k: "basket", x: 1.22, y: -0.05 }] },
        { label: "Sea-creature name & picture cards", addOn: true, items: [{ k: "card", x: -1.22, y: 0.15, t: "crab" }] },
        { label: "Chunky screw-cover torch", addOn: true, items: [{ k: "torch", x: -1.22, y: 0.5 }] },
      ],
    },
    {
      id: "PN-B2",
      weeks: [3, 4],
      title: "What Makes Me Special?",
      wondering: "How would you like your fish to look?",
      focus: "Identity and uniqueness: observe, compare and choose textures to create a fish that is 'just like me'. (Code note: the deck lists 'Follow requests from teachers' as EY.PN.SED.3.1, but the official SED.3.1 wording is about peer interaction, so this block uses EY.PN.SED.1.3 'Demonstrate preferences and choices'.)",
      outcomes: ["EY.PN.ACE.2.2", "EY.PN.LL.1.4", "EY.PN.SED.1.3"],
      domainCode: "EY.PN.ACE.2.2",
      setup:
        "Light-blue 'ocean' base with fish cutouts in different shapes and sizes. Loose materials of different textures (bubble wrap, felt, corrugated card, foil, tissue, sponge) sit in the 'ocean' for children to observe, compare and arrange onto their own fish. A teacher-made Rainbow Fish sits in the centre as the provocation.",
      addOn:
        "Week 4 add-on: unbreakable hand mirrors and each child's photo on a fish-shaped frame ('My special fish'), plus 'I like...' choice cards so children can talk about what makes them special.",
      safety: "Pre-cut all textures larger than 4.5 cm; no glue at the tray (loose-parts arranging only).",
      sourcing: "Daiso (felt sheets, bubble wrap, corrugated card, foil, sponges, unbreakable hand mirrors), Popular (card for fish cut-outs), class photos printed in school.",
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
      focus: "Treasure hunt for sea creatures in rainbow colours: name and sort colours, follow simple preposition directions (in, on, under, next to) and answer 'where' questions.",
      outcomes: ["EY.PN.NUM.1.2", "EY.PN.NUM.1.1", "EY.PN.SED.3.1", "EY.PN.LL.1.1"],
      domainCode: "EY.PN.NUM.1.1",
      setup:
        "Blue and green organza scarves make soft 'waves' across the tray. Week 5: red, yellow and blue sea creatures (rainbow ocean-animal counters plus laminated card fish cut-outs) hide under the waves, inside shells and behind rocks. Three coloured plastic 'coral home' bowls (red, yellow, blue) sit beside the tray for sorting; treasure baskets and chunky tongs support the hunt. The teacher gives one-step preposition directions ('Find the red crab UNDER the blue wave and put it IN the red coral home') and asks 'Where did you find it?'.",
      addOn:
        "Week 6 add-on: orange, green, indigo and violet sea creatures and their matching coral-home bowls join the hunt, so all seven rainbow colours are in play; colour paddles to look through (overlap red and yellow to see orange), and light-to-dark shade cards for two-part directions ('Put the light blue fish ON the card, then the dark blue fish UNDER it').",
      safety: "Mess-free: scarves and loose parts only; all sea creatures larger than 4.5 cm; tongs used at the tray only.",
      sourcing: "Daiso (organza scarves, large coloured plastic bowls, baskets, chunky tongs, colour paddles), Shopee (rainbow ocean-animal counter sets), laminated 10 cm card or felt fish cut-outs printed at school for any colour not in the set, and shade cards from paint-chip cards (Nippon or Home-Fix).",
      base: "ocean",
      materials: [
        { label: "Blue & green organza scarf 'waves'", items: [] },
        { label: "Red, yellow & blue sea creatures (hidden)", items: [{ k: "fish", x: -0.4, y: -0.3, c: "#E53935" }, { k: "fish", x: 0.45, y: -0.15, c: "#FDD835" }, { k: "fish", x: 0.35, y: 0.35, c: "#1E88E5" }, { k: "fish", x: -0.3, y: 0.38, c: "#E53935", r: 180 }, { k: "fish", x: 0.05, y: -0.55, c: "#1E88E5", r: 180 }] },
        { label: "Red, yellow & blue 'coral home' sorting bowls", items: [{ k: "bowl", x: -1.22, y: -0.45, c: "#E53935" }, { k: "bowl", x: -1.22, y: -0.05, c: "#FDD835" }, { k: "bowl", x: -1.22, y: 0.35, c: "#1E88E5" }] },
        { label: "Treasure baskets & chunky tongs", items: [{ k: "basket", x: 0.05, y: 0.72, s: 0.8 }, { k: "tongs", x: -0.62, y: 0.05 }] },
        { label: "Orange, green, indigo & violet creatures and bowls", addOn: true, items: [{ k: "fish", x: 0.1, y: 0.1, c: "#FB8C00" }, { k: "fish", x: -0.15, y: -0.2, c: "#43A047" }, { k: "fish", x: 0.62, y: 0.18, c: "#3949AB" }, { k: "fish", x: -0.62, y: 0.42, c: "#8E24AA" }, { k: "bowl", x: 1.22, y: 0.62, c: "#8E24AA" }] },
        { label: "Colour paddles", addOn: true, items: [{ k: "paddle", x: 1.22, y: -0.5, c: "#E53935" }, { k: "paddle", x: 1.3, y: -0.3, c: "#FDD835" }] },
        { label: "Light-to-dark shade cards", addOn: true, items: [{ k: "card", x: 1.22, y: 0.1, t: "light" }, { k: "card", x: 1.22, y: 0.36, t: "dark" }] },
      ],
    },
    {
      id: "PN-B4",
      weeks: [7, 8],
      title: "Feelings in the Ocean",
      wondering: "How can we use colours to show how we feel?",
      focus: "Emotions scooping: match coloured pompoms to feeling sea-creature containers, talk about feelings, and fill a personal feelings jar over two weeks.",
      outcomes: ["EY.PN.SED.2.1", "EY.PN.LL.1.4", "EY.PN.PD.4.3"],
      domainCode: "EY.PN.PD.4.3",
      setup:
        "Four 'feelings' sea-creature containers (happy - yellow, sad - blue, angry - red, scared - purple) sit in a calm ocean. Large coloured pompoms fill the middle; children use tablespoons (small ladles available as support) to move pompoms into the container that matches a feeling, naming it as they go. Each child also has a personal name jar (clear wide-mouth screw-lid jar with name and photo label) in a side basket: each session they find their own jar and post one pompom for 'How do I feel today?', so the jars fill up over the two weeks for feelings discussions.",
      addOn:
        "Week 8 add-on: children compare their name jars ('Whose jar has more happy yellow? Fewer sad blue?') using more and less, and a large shiny 'sharing scale' is passed around the tray so each child practises giving a pompom to a friend.",
      safety: "Pompoms at least 4.5 cm; scoop at the tray only; name jars are wide-mouth (wide enough to post a large pompom) with screw lids that the teacher closes after each turn; jars stored on a low shelf away from the tray.",
      sourcing: "Daiso (clear containers, large pompoms, tablespoons and small ladles, wide-mouth clear plastic screw-lid jars), feelings cards and name labels printed at school.",
      base: "ocean",
      materials: [
        { label: "Feelings sea-creature containers (happy, sad, angry, scared)", items: [{ k: "container", x: -0.45, y: -0.42, c: "#FDD835", t: "happy" }, { k: "container", x: 0.45, y: -0.42, c: "#1E88E5", t: "sad" }, { k: "container", x: -0.45, y: 0.45, c: "#E53935", t: "angry" }, { k: "container", x: 0.45, y: 0.45, c: "#8E24AA", t: "scared" }] },
        { label: "Large coloured pompoms (4.5 cm+)", items: [{ k: "pompom", x: 0, y: 0, s: 1.3 }] },
        { label: "Tablespoons (plus small ladles for support)", items: [{ k: "scoop", x: 0.02, y: -0.62 }, { k: "scoop", x: 0.02, y: 0.66, r: 180 }] },
        { label: "Feelings fish picture cards", items: [{ k: "face", x: -1.22, y: -0.45, c: "#FDD835", t: "happy" }, { k: "face", x: -1.22, y: -0.05, c: "#1E88E5", t: "sad" }, { k: "face", x: -1.22, y: 0.35, c: "#E53935", t: "angry" }] },
        { label: "Personal wide-mouth name jars in a side basket", items: [{ k: "jar", x: 1.18, y: -0.35 }, { k: "jar", x: 1.32, y: -0.05 }, { k: "jar", x: 1.18, y: 0.25 }] },
        { label: "Big shiny 'sharing scale'", addOn: true, items: [{ k: "disc", x: 1.22, y: 0.62, s: 1.3 }] },
      ],
    },
  ],
  weeks: [
    {
      week: 1,
      title: "The Most Beautiful Fish",
      storyBite: "Opening pages only: meet Rainbow Fish in the deep blue sea; his shimmering scales of every colour; the other fish admire him.",
      keyLanguage: ["ocean", "fish", "shiny", "bright", "glossy", "What can you find?"],
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
        prompts: ["What can you see in the ocean?", "How do Rainbow Fish's scales look? Are they shiny and bright?", "Which colours can you find on him?"],
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
      keyLanguage: ["special", "different", "same", "big / small", "smooth / rough / bumpy", "I want the ... one, please"],
      song: "'If You're Happy and You Know It' adapted: 'If you have black hair and you know it, swim around!'",
      secValue: "Curiosity (noticing what makes each fish, and me, special)",
      secCode: "EY.PN.SED.1.3",
      llCode: "EY.PN.LL.1.4",
      ef: [CF, WM, IC],
      rolePlay: "'Fish mirror' role play: in pairs, one child is the fish and the partner copies the movement, then they swap roles. Children say one thing that is special about their fish.",
      artCraft: { title: "My Special Fish", description: "Children choose their own card fish shape and two or three pre-cut texture squares (felt, bubble wrap, corrugated card, foil) that the teacher has backed with double-sided tape beforehand (or self-adhesive felt and foam sheets from Daiso). They wait for their turn at the shared texture basket, peel and press each square onto their fish, and explain their choices in 4-5 word phrases: 'I want the bumpy one, please'. No wet glue is needed." },
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
      secValue: "Courage (telling others how I feel)",
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
      storyBite: "Little Blue Fish does not give up: he asks again in a kind way, and Rainbow Fish gives away one small shiny scale. A peculiar feeling comes over him.",
      keyLanguage: ["give", "one", "try again", "shiny / dull", "thank you", "help me, please"],
      song: "'Try Again Song' to the tune of 'Row, Row, Row Your Boat': 'Try, try, try again, Little Blue Fish asks again; if at first it's no, take a breath and go, try, try, try again!'",
      secValue: "Resilience (trying again, trying a new way)",
      secCode: "EY.PN.SED.6.2",
      llCode: "EY.PN.LL.1.3",
      ef: [CF, IC, WM],
      rolePlay: "Ask again, kindly: the teacher models with the Rainbow Fish puppet saying 'Not now!' the first time, and children help Little Blue Fish take a calm 'fish breath' and try a new way (a kinder voice, 'please', a wave). Then in pairs, one child is Little Blue Fish and asks 'May I have a shiny scale, please?'; the Rainbow Fish child first shakes their head, Little Blue Fish tries again a new way, and the scale is given ('This is for you!' / 'Thank you!'). Swap roles so every child asks and gives.",
      artCraft: { title: "Colour-mix Scales", description: "Coffee-filter scales: children drip red, yellow and blue water with pipettes to make a NEW colour shown on a target card (green, orange or purple). If the new colour does not appear, the teacher prompts 'Try again: what different colour drop could you add?' and children try at least one new way or ask a friend for help. Dried scales are later shared onto fish on the class ocean." },
      scene: {
        title: "One small shiny scale",
        bg: "sea",
        items: [{ k: "rainbowfish", x: 0.65, y: 0.5, s: 1.9, r: 180 }, { k: "fish", x: 0.25, y: 0.52, s: 1.2, c: "#4FA3E3", t: "shiny" }, { k: "disc", x: 0.44, y: 0.47, s: 0.8 }, { k: "bubbles", x: 0.4, y: 0.2 }],
        prompts: ["What did Little Blue Fish do when Rainbow Fish said no?", "How did he try again?", "What can you do when something does not work the first time?"],
      },
      words: [{ word: "give", icon: "e:🎁" }, { word: "try again", icon: "e:🔁" }, { word: "thank you", icon: "e:💖" }, { word: "shiny", icon: "disc" }, { word: "dull", icon: "rock" }],
    },
    {
      week: 7,
      title: "Sharing Makes Us Happy",
      storyBite: "All the fish crowd around; Rainbow Fish shares his scales until he has just one left, and he feels very happy.",
      keyLanguage: ["share", "everyone", "happy", "kind", "together", "How do you feel?"],
      song: "'The More We Share Together' (to the tune of 'The More We Get Together').",
      secValue: "Responsibility (sharing and taking turns)",
      secCode: "EY.PN.SED.5.1",
      llCode: "EY.PN.LL.1.4",
      ef: [IC, WM, CF],
      rolePlay: "Sharing pairs: the teacher-in-role as Rainbow Fish models giving a shiny scale sticker to a child ('This is for you!'), and the child replies 'Thank you! I feel happy.' Children then sit in pairs around the big blue cloth 'ocean'. Every child holds one shiny scale sticker; on the teacher's signal all pairs share at the same time: one partner gives ('This is for you!'), the other sticks it on and says 'Thank you! I feel ___.', then they swap so each child gives one and receives one. All swim back together singing 'The More We Share Together'.",

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
      storyBite: "'Come on, Rainbow Fish, come and play with us!' He joins his friends, happy at last. Retell the story with 3 key scene cards (first - next - last), with children sequencing the cards on the board.",
      keyLanguage: ["first", "next", "last", "friends", "celebrate", "I can..."],
      song: "Revisit the term's 'Rainbow Fish' song and sing it as a celebration with scarves.",
      secValue: "Courage (joining in and performing our part with friends)",
      secCode: "EY.PN.SED.4.1",
      llCode: "EY.PN.LL.2.4",
      ef: [WM, CF, IC],
      rolePlay: "Rainbow Fish mini-show in 3 key scenes (about 1.5 minutes each) with teacher narration and the scene cards as cues: (1) 'All alone' - Rainbow Fish swims alone while the school of fish swims away; (2) 'Ask the wise Octopus' - Rainbow Fish visits the Octopus in the fabric cave; (3) 'Share and play together' - Rainbow Fish gives a shiny scale to each friend and everyone says 'Come and play with us!'. The teacher hands out the 4 lead roles before starting (headbands: Rainbow Fish, Little Blue Fish, Octopus, Starfish); everyone else is the 'school of fish' chorus who swim, freeze on cue and say the repeated lines. Lead roles rotate in short replays during Wrap Up in IB02 and IB03.",
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
  connection: "Children discover places, creatures, colours, sounds, feelings and friendship on the family's bear hunt journey.",
  cdpValues: ["Curiosity", "Responsibility", "Resilience", "Courage"],
  focus: "Developing Communication & Language and character values through natural landscapes, movement and the senses",
  languageExposure:
    "Repetitive chant ('We're going on a bear hunt...'), sound words (swishy swashy, splash splosh, squelch squerch, stumble trip, hoooo wooo, tiptoe), opposites (big/small, fast/slow, loud/quiet), positional words (over, under, through, in), action words (walk, stomp, splash, tiptoe, run), sensorial words (soft, rough, sticky, crinkly, cold) and feelings (happy, sad, angry, scared).",
  topicBrainstorm:
    "Natural landscapes, movement and the senses. Natural habitats: where does a bear live, what animals can we find? Sounds in nature (wind, rain). Animal movements and animal prints. How we move (actions, hand actions). Textures (grass, mud, water). Emotions (happy, sad, angry, scared).",
  developmental: [
    "Attention for one focused segment is about 3-5 minutes; repeat, move and sing often.",
    "Uses single words and 2-3 word phrases; understands far more than they can say; relies on gestures, sounds and modelling.",
    "Mostly parallel play beside peers; turn-taking needs strong adult support, visual cues and very short waits.",
    "Learns through the senses and whole-body movement; loves repetition and predictable chants.",
    "Follows one-step instructions with gestures; transitions are smoother with a song or sound cue.",
    "Still mouths objects: taste-safe materials only, no loose parts smaller than 4.5 cm, close supervision with loose parts.",
  ],
  blocks: [
    {
      id: "PG-B1",
      weeks: [1, 2],
      title: "Bears",
      wondering: "What does a bear look like?",
      focus: "Linking from the story's bear description (shiny wet nose, big furry ears, goggly eyes): explore textured loose parts to create their own impression of a bear.",
      outcomes: ["EY.PG.NE.2.1", "EY.PG.ACE.3.3", "EY.PG.LL.1.2"],
      domainCode: "EY.PG.NE.2.1",
      setup:
        "Cork boards, wooden boards and paper plates (some wrapped in bubble wrap) sit in the tray as 'canvases'. Baskets of textured loose parts (brown felt squares, cotton wool sealed in taped zip bags, twigs, wooden blocks, big wooden rings, wood slices, cork coasters and large pebbles) let children build their own bear face and body. A teacher-made model bear, toy bears and photos of real bears are the provocation.",
      addOn:
        "Week 2 add-on: a bear family in three sizes (big, middle, small) with matching big and small bear-paw cards, so children compare sizes (opposites) and build a bear for each family member.",
      safety: "Mess-free: no sand or water; every loose part bigger than 4.5 cm (no wine corks, small rings, small pebbles or loose cotton balls; cotton wool only sealed in taped zip bags); twigs sanded.",
      sourcing: "Daiso (cork boards, cork coasters, wooden rings, wood slices, paper plates, bubble wrap, brown felt sheets, zip bags, baskets), wooden blocks from the classroom block corner, cotton wool from NTUC or Watsons (sealed into zip bags by teachers), large decorative pebbles from Daiso or IKEA, bear photos printed in school, toy bears from Toys'R'Us or Shopee.",
      base: "woodboard",
      materials: [
        { label: "Cork boards, wooden boards & paper plates as bear 'canvases'", items: [{ k: "corkboard", x: 0.45, y: -0.4, s: 1.0 }, { k: "plate", x: 0.42, y: 0.42, s: 1.1 }] },
        { label: "Teacher model: a bear made from loose parts", items: [{ k: "bearbuild", x: -0.3, y: -0.28, s: 1.15 }] },
        { label: "Loose parts: brown felt squares, sealed cotton-wool bags, twigs, wooden blocks, big rings, wood slices, cork coasters, large pebbles", items: [{ k: "feltpiece", x: 0.05, y: 0.2, c: "#8D6E63" }, { k: "stick", x: -0.55, y: 0.42 }, { k: "ring", x: 0.12, y: -0.7 }, { k: "woodslice", x: 0.78, y: 0.02 }, { k: "coaster", x: -0.8, y: 0.05 }, { k: "rock", x: -0.15, y: 0.68, s: 0.8 }, { k: "block", x: -0.45, y: 0.12, s: 0.7 }] },
        { label: "Toy bears", items: [{ k: "e:🧸", x: 0.18, y: 0.5, s: 1.3 }] },
        { label: "Photos of real bears", items: [{ k: "piccard", x: 1.22, y: -0.42, t: "🐻" }, { k: "piccard", x: 1.22, y: 0.05, t: "🐾" }] },
        { label: "Bear family in three sizes", addOn: true, items: [{ k: "e:🐻", x: -1.22, y: -0.45, s: 1.2 }, { k: "e:🐻", x: -1.22, y: -0.05, s: 0.9 }, { k: "e:🐻", x: -1.22, y: 0.3, s: 0.65 }] },
        { label: "Big & small bear-paw cards", addOn: true, items: [{ k: "piccard", x: 1.22, y: 0.55, t: "🐾" }] },
      ],
    },
    {
      id: "PG-B2",
      weeks: [3, 4],
      title: "Natural Habitats Exploration",
      wondering: "What do we see in nature?",
      wondering2: "Where is bear hiding today?",
      focus: "Explore loose parts to build their own habitats from the story (grass, mud, river, cave, tunnel) on a teacher-made grass and mud base, trying again when a cave or tunnel falls down.",
      outcomes: ["EY.PG.NE.2.1", "EY.PG.SED.6.2", "EY.PG.LL.1.1"],
      domainCode: "EY.PG.NE.2.1",
      setup:
        "Teachers make the base from art materials: green crepe paper and felt 'grass' on one half, brown felt 'mud' on the other. Loose parts (twigs, artificial grass squares and green crepe-paper or raffia 'grass' bundles, large laminated and felt leaves, blocks, blue cellophane, felt, crepe paper, cloth, small boxes and kitchen-towel rolls) let children create their own cave, grass, mud, river and tunnel for the bear family.",
      addOn:
        "Week 4 add-on: 'Where is bear hiding today?' Each day the teacher hides the toy bear in a different habitat, with a chunky screw-cover torch and simple picture clue cards (cave, grass, river, tunnel) so children search and say where they found it; large woodland animal figures (rabbit, owl, deer, larger than 4.5 cm) are added for the bear to meet along the way.",
      safety: "Mess-free: art-material base only, no real mud, sand or water; leaves laminated or felt (no crumbly dried leaves); no loose cotton balls; boxes with no staples; every loose part bigger than 4.5 cm; torch is AA/AAA with a screw-fastened battery cover and stays at the tray.",
      sourcing: "Daiso (felt sheets, crepe paper, green raffia, artificial grass tiles, blue cellophane, wooden blocks, small boxes, AA torch), recycled kitchen-towel rolls and boxes, twigs and large leaves from the school garden (leaves laminated in school), large animal figures from Toys'R'Us or Shopee.",
      base: "grassmud",
      materials: [
        { label: "Teacher-made base: green crepe & felt 'grass' and brown felt 'mud'", items: [] },
        { label: "Loose parts: twigs, laminated & felt leaves, blocks, felt, cloth", items: [{ k: "stick", x: -0.5, y: -0.3 }, { k: "e:🍂", x: -0.25, y: 0.5 }, { k: "block", x: 0.45, y: 0.45 }, { k: "feltpiece", x: 0.62, y: -0.05, s: 0.8, c: "#8D6E63" }, { k: "feltpiece", x: -0.62, y: 0.25 }] },
        { label: "Grass pieces to place: artificial grass squares & crepe/raffia bundles", items: [{ k: "grass", x: -0.3, y: -0.22 }, { k: "grass", x: 0.25, y: 0.2 }] },
        { label: "Blue cellophane & cloth to make a 'river'", items: [{ k: "cellophane", x: 0.0, y: 0.62 }] },
        { label: "Small boxes & kitchen-towel rolls for caves and tunnels", items: [{ k: "cave", x: 0.45, y: -0.42, s: 0.8 }, { k: "tube", x: -0.15, y: -0.55 }] },
        { label: "Toy bear family", items: [{ k: "e:🧸", x: 0.05, y: 0.05 }] },
        { label: "Screw-cover torch & 'Where is bear?' picture clue cards", addOn: true, items: [{ k: "torch", x: 1.22, y: -0.35 }, { k: "piccard", x: 1.22, y: 0.15, t: "❓" }] },
        { label: "Large woodland animal figures (rabbit, owl, deer)", addOn: true, items: [{ k: "e:🐰", x: -0.42, y: 0.0 }, { k: "e:🦉", x: 0.25, y: -0.2 }] },
      ],
    },
    {
      id: "PG-B3",
      weeks: [5, 6],
      title: "Creatures Hiding in Habitats",
      wondering: "What can we find under it?",
      wondering2: "What if we go under it? What if we go through the forest?",
      focus: "Dig through the grass, river and forest of a three-habitat tray to search for and pick up hidden insects and animals, using hands and fingers with control.",
      outcomes: ["EY.PG.PD.4.1", "EY.PG.LL.1.4", "EY.PG.SED.1.3"],
      domainCode: "EY.PG.PD.4.1",
      setup:
        "The tray base is split into three habitats, each filled with a dry layer to dig through: green crinkle-paper grass, a blue crinkle-paper and cellophane-strip river over blue fabric, and a forest floor of brown crinkle paper and large felt leaves under twig and felt trees. Large insect and animal figures are buried in the filler, so children dig through the grass, river and forest with their hands, chunky scoops and toy tongs, then peek at their finds with chunky magnifiers.",
      addOn:
        "Week 6 add-on: a pool-noodle arch 'tunnel' over the forest so children make the animals go under, over and through, plus creature picture cards to match each animal to the habitat where it was found.",
      safety: "Mess-free: dry crinkle-paper filler and fabric river, no water or sand; no small loose fillers such as pompoms or beads; every figure larger than 4.5 cm (throw out any that fits through a toilet-roll tube); tongs and scoops used at the tray only; a dustpan by the tray for stray crinkle paper at clean-up.",
      sourcing: "Daiso (green, blue and brown crinkle-paper filler, felt, blue fabric, cellophane, chunky tongs and scoops, magnifiers, pool noodle), large insect and animal figures (larger than 4.5 cm) from Toys'R'Us, Popular or Shopee (avoid small figurine tubes), twigs from the school garden.",
      base: "habitats3",
      materials: [
        { label: "Three-habitat base: green crinkle grass, blue crinkle & cellophane river, brown crinkle & felt-leaf forest floor", items: [{ k: "tree", x: -0.62, y: -0.45, s: 0.9 }, { k: "tree", x: -0.35, y: -0.7, s: 0.8 }] },
        { label: "Large insect & animal figures buried in the filler", items: [{ k: "e:🐞", x: -0.22, y: -0.42 }, { k: "e:🐛", x: -0.6, y: 0.1 }, { k: "e:🐸", x: 0.05, y: -0.1 }, { k: "e:🐟", x: 0.1, y: 0.45 }, { k: "e:🦋", x: 0.55, y: -0.4 }, { k: "e:🐌", x: 0.6, y: 0.35 }] },
        { label: "Chunky scoops for digging; felt leaves to look under", items: [{ k: "scoop", x: -0.35, y: 0.5 }, { k: "e:🍃", x: 0.45, y: 0.05 }] },
        { label: "Chunky magnifiers & toy tongs", items: [{ k: "magnifier", x: -1.22, y: -0.3 }, { k: "tongs", x: -1.22, y: 0.2 }] },
        { label: "Pool-noodle tunnel over the forest", addOn: true, items: [{ k: "tunnel", x: -0.3, y: -0.12 }] },
        { label: "Creature-to-habitat picture cards", addOn: true, items: [{ k: "piccard", x: 1.22, y: -0.35, t: "🐞" }, { k: "piccard", x: 1.22, y: 0.15, t: "🐟" }] },
      ],
    },
    {
      id: "PG-B4",
      weeks: [7, 8],
      title: "Sounds That We Hear",
      wondering: "What sounds can you hear?",
      focus: "Extend the story's sound words and sounds in nature (wind, rain): explore everyday materials and the sounds they make (tap, shake, crinkle, tip, squish), then match sounds to the story places.",
      outcomes: ["EY.PG.LL.1.1", "EY.PG.PD.4.1", "EY.PG.ACE.3.2"],
      domainCode: "EY.PG.ACE.3.2",
      setup:
        "A felt base is split into two zones. Tapping zone: paper rolls, empty plastic bottles, short sanded sticks and bamboo sticks, metal spoons, crinkly cellophane, sealed shaker bottles (dried beans inside, lids hot-glued and taped) and teacher-made rain sticks (a kitchen-towel roll with a loosely twisted foil spiral and a spoonful of dried rice inside, ends capped and fully taped). Squish corner, at the far end on its own felt mat: sealed gel and paint bags taped down on all four edges, explored with hands only (no sticks or spoons there). Children tap, shake, crinkle, tip and squish to discover loud, quiet, fast and slow sounds, including a gentle 'pitter-patter' rain and a 'whoosh' wind.",
      addOn:
        "Week 8 add-on: story sound cards (swishy grass, splash splosh river, squelch mud, stumble trip forest, hoooo wooo snowstorm, tiptoe cave, plus pitter-patter rain and whoosh wind) so children choose a material to make each sound as the teacher chants the story, plus a small drum for the 'IT'S A BEAR!' moment.",
      safety: "Mess-free: no slime or water bottles. Gel and paint bags double-bagged, taped flat on all four edges and kept in the hands-only squish corner away from tapping tools. Shaker lids hot-glued and wrapped with tape; rain sticks use a foil spiral (no toothpicks or skewers) with capped, fully taped ends. Sticks short and sanded. Teacher checks every lid and bag before each session.",
      sourcing: "Daiso (bamboo sticks, metal spoons, cellophane, zip bags, felt, aluminium foil, packing tape, electrical tape, hot glue gun), recycled paper rolls and plastic bottles, hair gel from Watsons, dried beans and rice from NTUC FairPrice, small drum from Popular or Shopee.",
      base: "sound",
      materials: [
        { label: "Paper rolls & plastic bottles", items: [{ k: "tube", x: -0.5, y: -0.35 }, { k: "bottle", x: -0.05, y: -0.55 }] },
        { label: "Short sticks, bamboo sticks & metal spoons to tap", items: [{ k: "stick", x: 0.45, y: -0.4 }, { k: "bamboo", x: 0.6, y: 0.05 }, { k: "spoon", x: -0.62, y: 0.15 }] },
        { label: "Sealed gel & paint bags (hands-only squish corner)", items: [{ k: "gelbag", x: -0.2, y: 0.55 }, { k: "gelbag", x: 0.25, y: 0.62, c: "#4FA3E3" }] },
        { label: "Crinkly cellophane", items: [{ k: "cellophane", x: 0.05, y: 0.02 }] },
        { label: "Sealed shaker bottles (dried beans, lids hot-glued + taped)", items: [{ k: "shaker", x: -1.22, y: -0.3 }, { k: "shaker", x: -1.22, y: 0.15 }] },
        { label: "Sealed rain sticks (towel roll, foil spiral, rice; ends taped)", items: [{ k: "tube", x: -1.22, y: 0.55, r: 70 }] },
        { label: "Story & nature sound cards", addOn: true, items: [{ k: "piccard", x: 1.22, y: -0.4, t: "🌾" }, { k: "piccard", x: 1.22, y: 0.05, t: "🌧️" }] },
        { label: "Small drum", addOn: true, items: [{ k: "e:🥁", x: 1.22, y: 0.55 }] },
      ],
    },
  ],
  weeks: [
    {
      week: 1,
      title: "We're Going on a Bear Hunt!",
      storyBite: "Opening only: the family sets off - 'We're going on a bear hunt. We're going to catch a big one. What a beautiful day! We're not scared.' Then the bear description from the cave page: one shiny wet nose, two big furry ears, two big goggly eyes.",
      keyLanguage: ["bear", "big", "nose", "ears", "eyes", "not scared"],
      song: "The bear hunt chant with a steady knee-pat beat, then 'Nose, ears, eyes' to the tune of 'Head, Shoulders, Knees and Toes'.",
      secValue: "Curiosity",
      secCode: "EY.PG.SED.6.1",
      llCode: "EY.PG.LL.1.2",
      ef: [WM, IC, CF],
      rolePlay: "Bear hunt march: children march around the room with toilet-roll binoculars chanting with the teacher, stop when the drum taps, and find a big hidden teddy bear; each child points to its nose, ears or eyes on request.",
      artCraft: { title: "Furry Bear Faces", description: "Paper-plate bear face: children press brown tissue and cotton 'fur' onto a glue-covered plate, then add big paper ears, eyes and a shiny foil nose (pre-cut, larger than 4.5 cm)." },
      scene: {
        title: "We're going on a bear hunt!",
        bg: "grass",
        items: [{ k: "dad", x: 0.13, y: 0.60, s: 1.15 }, { k: "girl", x: 0.25, y: 0.60, s: 1.15 }, { k: "boy", x: 0.37, y: 0.60, s: 1.15 }, { k: "baby", x: 0.47, y: 0.60, s: 1.15 }, { k: "dog", x: 0.61, y: 0.67, s: 0.63 }, { k: "speech", x: 0.42, y: 0.16, t: "We're going to catch a big one!" }, { k: "sun", x: 0.9, y: 0.14 }],
        prompts: ["Who is going on the bear hunt?", "What does a bear look like?", "Can you show me a big bear? A small bear?"],
      },
      words: [{ word: "bear", icon: "e:🐻" }, { word: "big", icon: "e:🐘" }, { word: "nose", icon: "e:👃" }, { word: "ears", icon: "e:👂" }, { word: "eyes", icon: "e:👀" }],
    },
    {
      week: 2,
      title: "Swishy Swashy, Splash Splosh",
      storyBite: "'Uh-uh! Grass! Long wavy grass. We can't go over it. We can't go under it. Oh no! We've got to go through it! Swishy swashy!' Then the river: 'Splash splosh!'",
      keyLanguage: ["grass", "river", "swishy swashy", "splash splosh", "over / under / through", "green / blue"],
      song: "Bear hunt chant adding the grass and river verses with arm-swishing and splashing actions.",
      secValue: "Courage",
      secCode: "EY.PG.SED.4.1",
      llCode: "EY.PG.LL.2.3",
      ef: [IC, WM, CF],
      rolePlay: "Swishy swashy and splash splosh walk: children brush through paper-strip 'grass' saying 'swishy swashy', then cross a blue fabric 'river' on cushion stepping stones saying 'splash splosh', holding a teacher's hand if unsure.",
      artCraft: { title: "Swishy Swashy Grass", description: "Teacher pre-cuts green paper strips; children press them onto sticky contact paper (no glue) and swish the 'grass' with their hands." },
      scene: {
        title: "Swishy swashy! Splash splosh!",
        bg: "river",
        items: [{ k: "dad", x: 0.12, y: 0.46, s: 1.15 }, { k: "girl", x: 0.24, y: 0.46, s: 1.15 }, { k: "boy", x: 0.36, y: 0.46, s: 1.15 }, { k: "baby", x: 0.46, y: 0.46, s: 1.15 }, { k: "dog", x: 0.60, y: 0.53, s: 0.63 }, { k: "e:💦", x: 0.75, y: 0.75, s: 1 }],
        prompts: ["What is this? (grass / river)", "What sound does the grass make?", "How do we go? Over, under... or through?"],
      },
      words: [{ word: "grass", icon: "e:🌾" }, { word: "river", icon: "e:🌊" }, { word: "swishy swashy", icon: "e:🌿" }, { word: "splash", icon: "e:💦" }, { word: "through", icon: "e:➡️" }],
    },
    {
      week: 3,
      title: "Squelch Squerch Mud",
      storyBite: "'Uh-uh! Mud! Thick oozy mud. We can't go over it... We've got to go through it! Squelch squerch!'",
      keyLanguage: ["mud", "squelch squerch", "sticky", "stuck", "help", "brown"],
      song: "Bear hunt chant adding the mud verse with big slow stomping steps.",
      secValue: "Resilience (asking for help)",
      secCode: "EY.PG.SED.6.2",
      llCode: "EY.PG.LL.1.1",
      ef: [IC, CF, WM],
      rolePlay: "Stuck in the mud: children walk slowly across brown mats pretending their feet are stuck ('Squelch squerch! Pull!'); when stuck they show the 'help' sign and a friend or teacher pulls them free.",
      artCraft: { title: "Prints from Nature", description: "Nature printing: wearing aprons, children press large leaves and sturdy twigs from the school garden onto two sponge paint pads (brown 'mud' and green 'grass' paint soaked into kitchen sponges on paper plates), then stamp them onto paper to make 'mud and grass' prints for the class bear hunt map. One leaf per child at a time; wet wipes and a drying rack ready at the table." },
      scene: {
        title: "Uh-uh! Mud!",
        bg: "mud",
        items: [{ k: "dad", x: 0.15, y: 0.56, s: 1.15 }, { k: "girl", x: 0.27, y: 0.56, s: 1.15 }, { k: "boy", x: 0.39, y: 0.56, s: 1.15 }, { k: "baby", x: 0.49, y: 0.56, s: 1.15 }, { k: "dog", x: 0.63, y: 0.63, s: 0.63 }, { k: "footprints", x: 0.82, y: 0.82 }],
        prompts: ["What is this? (mud)", "How does mud feel?", "What can you do when you are stuck?"],
      },
      words: [{ word: "mud", icon: "e:🟫" }, { word: "squelch", icon: "e:🥾" }, { word: "sticky", icon: "e:🍯" }, { word: "stuck", icon: "e:😣" }, { word: "help", icon: "e:🙋" }],
    },
    {
      week: 4,
      title: "Stumble Trip Forest",
      storyBite: "'Uh-uh! A forest! A big dark forest. We can't go over it... We've got to go through it! Stumble trip!'",
      keyLanguage: ["forest", "tree", "stumble trip", "hiding", "where?", "my turn / your turn"],
      song: "Bear hunt chant with the forest verse; 'Where is Bear?' to the tune of 'Where is Thumbkin?'.",
      secValue: "Responsibility (taking turns)",
      secCode: "EY.PG.SED.5.1",
      llCode: "EY.PG.LL.1.3",
      ef: [IC, WM, CF],
      rolePlay: "Stumble trip forest train (whole group, no queue): pool-noodle 'branches' and chair-and-fabric 'trees' are spread around a big circle. All the children walk the circle together like a train behind the teacher (each child walks on their own, no holding on to friends), stepping over branches and ducking under fabric while chanting 'stumble trip!'. Each lap a different child is the 'train driver' beside the teacher at the front ('My turn!') while the others follow ('Your turn next!'). Before the last lap the teacher secretly drops the bear picture behind a 'tree', and everyone points and says 'Where is Bear? There!'.",

      artCraft: { title: "Stumble Trip Forest", description: "Leaf and twig collage pressed onto sticky contact paper tree trunks to make the class forest." },
      scene: {
        title: "Uh-uh! A forest!",
        bg: "forest",
        items: [{ k: "dad", x: 0.14, y: 0.64, s: 1.15 }, { k: "girl", x: 0.26, y: 0.64, s: 1.15 }, { k: "boy", x: 0.38, y: 0.64, s: 1.15 }, { k: "baby", x: 0.48, y: 0.64, s: 1.15 }, { k: "dog", x: 0.62, y: 0.71, s: 0.63 }],
        prompts: ["What can you see in the forest?", "Where could a bear hide?", "What do we say? Stumble trip!"],
      },
      words: [{ word: "forest", icon: "e:🌲" }, { word: "tree", icon: "e:🌳" }, { word: "stumble trip", icon: "e:🪵" }, { word: "hiding", icon: "e:🙈" }, { word: "my turn", icon: "e:🙋" }],
    },
    {
      week: 5,
      title: "Hoooo Wooo Snowstorm",
      storyBite: "'Uh-uh! A snowstorm! A swirling whirling snowstorm. We've got to go through it! Hoooo wooo!'",
      keyLanguage: ["snow", "cold", "wind", "hoooo wooo", "under", "I like...", "white"],
      song: "Bear hunt chant with the snowstorm verse, swirling scarves to 'hoooo wooo'.",
      secValue: "Self-awareness (showing what I like)",
      secCode: "EY.PG.SED.1.3",
      llCode: "EY.PG.LL.1.4",
      ef: [WM, IC, CF],
      rolePlay: "Snowstorm dance: children choose a scarf colour they like ('I like blue!'), swirl through the 'snowstorm' while the teacher blows 'hoooo wooo', and freeze like a snowman when the music stops.",
      artCraft: { title: "Hoooo Wooo Snowstorm", description: "Cotton-wool and white pompom-peg painting on dark-blue paper to make a swirling snowstorm." },
      scene: {
        title: "Uh-uh! A snowstorm!",
        bg: "snow",
        items: [{ k: "dad", x: 0.14, y: 0.62, s: 1.15 }, { k: "girl", x: 0.26, y: 0.62, s: 1.15 }, { k: "boy", x: 0.38, y: 0.62, s: 1.15 }, { k: "baby", x: 0.48, y: 0.62, s: 1.15 }, { k: "dog", x: 0.62, y: 0.69, s: 0.63 }, { k: "e:❄️", x: 0.82, y: 0.25, s: 1.2 }],
        prompts: ["What is falling from the sky?", "Who could be hiding under the snow?", "Show me how the wind blows!"],
      },
      words: [{ word: "snow", icon: "e:❄️" }, { word: "cold", icon: "e:🥶" }, { word: "wind", icon: "e:🌬️" }, { word: "under", icon: "e:⬇️" }, { word: "I like", icon: "e:💙" }],
    },
    {
      week: 6,
      title: "Tiptoe! A Gloomy Cave",
      storyBite: "'Uh-uh! A cave! A narrow gloomy cave. Tiptoe, tiptoe... WHAT'S THAT? One shiny wet nose, two big furry ears, two big goggly eyes... IT'S A BEAR!'",
      keyLanguage: ["cave", "dark", "tiptoe", "quiet", "scared", "through"],
      song: "Bear hunt chant with the cave verse in a whisper voice, then a loud 'IT'S A BEAR!'.",
      secValue: "Feelings (scared and safe)",
      secCode: "EY.PG.SED.2.1",
      llCode: "EY.PG.LL.2.4",
      ef: [IC, WM, CF],
      rolePlay: "Tiptoe into the cave (whole group): a half-open cave made from a light blanket over two chairs, one side fully open, with a battery fairy light inside and a friendly bear picture at the back. The teacher leads the whole class in a slow line past the open side, everyone whispering 'tiptoe, tiptoe' with fingers on lips; each child chooses to peek in or not (no one has to go inside), and the teacher stays at the open side to reassure. When the teacher shows the bear picture ('It's a bear!'), everyone makes a 'scared' face and walks quickly together (no running) back to the 'safe' mat, where the teacher models 'I felt scared... now I feel safe' with a self-hug and children copy the hug.",

      artCraft: { title: "Peek-a-boo Bear Cave", description: "Brown paper-bag bear face with a shiny foil nose behind a 'cave' flap; children lift the flap: 'It's a bear!'." },
      scene: {
        title: "Tiptoe... It's a bear!",
        bg: "cave",
        items: [{ k: "dad", x: 0.1, y: 0.66, s: 1 }, { k: "girl", x: 0.2, y: 0.66, s: 1 }, { k: "boy", x: 0.3, y: 0.66, s: 1 }, { k: "baby", x: 0.38, y: 0.66, s: 1 }, { k: "dog", x: 0.46, y: 0.72, s: 0.55 }, { k: "torch", x: 0.36, y: 0.6, s: 0.8 }, { k: "bearfull", x: 0.74, y: 0.62, s: 1.4 }],
        prompts: ["Where are we now? (cave)", "Who is in the cave?", "How do the children feel?"],
      },
      words: [{ word: "cave", icon: "cave" }, { word: "dark", icon: "e:🌑" }, { word: "tiptoe", icon: "e:🦶" }, { word: "quiet", icon: "e:🤫" }, { word: "scared", icon: "e:😨" }],
    },
    {
      week: 7,
      title: "Quick! Back Home!",
      storyBite: "The family runs back through everything in reverse, fast: cave, snowstorm, forest, mud, river, grass, to the front door. Listen for each sound on the way home.",
      keyLanguage: ["run", "quick", "back", "home", "loud / quiet", "friend"],
      song: "Bear hunt chant at double speed going home, with the teacher holding up each picture card in reverse order as the cue; loud and quiet sound words, a scared voice ('Quick! Back home!'), a happy voice ('We're home!'), and a quick nature-sound warm-up: finger-tap 'pitter-patter' rain and blow a 'whoosh' wind.",
      secValue: "Social awareness",
      secCode: "EY.PG.SED.3.1",
      llCode: "EY.PG.LL.1.1",
      ef: [WM, CF, IC],
      rolePlay: "Run back home: picture-card stations around the room in reverse order (cave, snowstorm, forest, mud, river, grass, front door). At each station the teacher points to the next card ('Where next? Look - the forest!') so children follow the pictures. Children 'run' (fast walk) holding a friend's hand ('My friend!'), making each place's sound with their bodies. At each card the teacher pauses: 'Look at your friend's face - happy or scared?' and children copy their friend's face and voice. At the front door everyone hugs their teddy and shows a 'safe and happy' face to their friend.",
      artCraft: { title: "Sound Shakers", description: "Children decorate a teacher-filled, lid-taped shaker bottle with stickers and tissue paper, then shake it loud and quiet for the story sounds." },
      scene: {
        title: "Quick! Back home!",
        bg: "journey",
        items: [{ k: "e:🏠", x: 0.07, y: 0.5, s: 1.4 }, { k: "dad", x: 0.20, y: 0.60, s: 1.0 }, { k: "girl", x: 0.30, y: 0.60, s: 1.0 }, { k: "boy", x: 0.40, y: 0.60, s: 1.0 }, { k: "baby", x: 0.48, y: 0.60, s: 1.0 }, { k: "dog", x: 0.60, y: 0.67, s: 0.55 }, { k: "bearfull", x: 0.83, y: 0.62, s: 1.05 }],
        prompts: ["Where is the family running?", "Look at their faces - happy or scared?", "What sounds do they hear? Loud or quiet?"],
      },
      words: [{ word: "listen", icon: "e:👂" }, { word: "loud", icon: "e:📢" }, { word: "quiet", icon: "e:🤫" }, { word: "run", icon: "e:🏃" }, { word: "home", icon: "e:🏠" }],
    },
    {
      week: 8,
      title: "Under the Covers",
      storyBite: "Home! Shut the door, up the stairs, into bed, under the covers: 'We're not going on a bear hunt again!' Last page: the bear walks alone and sad on the beach. Retell the whole journey with sounds.",
      keyLanguage: ["bed", "covers", "safe", "sad", "first / next", "try again"],
      song: "Whole bear hunt chant as a celebration, using shakers and the drum for each sound, ending with a whispered 'under the covers'.",
      secValue: "Resilience (try again - putting the journey in order)",
      secCode: "EY.PG.SED.6.2",
      llCode: "EY.PG.LL.2.4",
      ef: [WM, IC, CF],
      rolePlay: "Bear hunt journey line-up: in groups of 3, children each hold one big picture card (grass, mud, cave) and stand in story order on footprint mats while the class chants 'first... next...'. If the order is wrong, the teacher says 'Oops! Let's try again' and children swap places until it matches the chant. Then everyone hides under the parachute 'covers' when the teacher says 'bear!' and peeks out to show the sad bear's face and give the class teddy a hug.",
      artCraft: { title: "Under the Covers Collage", description: "Each child's face photo (taken in class earlier in the term) is stuck onto a printed A4 bed outline; children press fabric-scrap 'blankets' onto sticky contact paper over the bed to tuck themselves in: 'This is me, safe in bed.'" },
      scene: {
        title: "Under the covers!",
        bg: "home",
        items: [{ k: "bed", x: 0.36, y: 0.6, s: 4.2 }, { k: "bearfull", x: 0.81, y: 0.3, s: 0.45 }],
        prompts: ["Where is the family hiding?", "What came first? What came next?", "How does the bear feel?"],
      },
      words: [{ word: "bed", icon: "e:🛏️" }, { word: "safe", icon: "e:🏠" }, { word: "sad", icon: "e:😢" }, { word: "first / next", icon: "e:🔢" }, { word: "try again", icon: "e:🔁" }],
    },
  ],
};

export const IBRAIN_TERM1: Record<"pg" | "pn", TermPlan> = { pg: PG, pn: PN };

export const blockForWeek = (plan: TermPlan, week: number): TuffBlock =>
  plan.blocks.find((b) => week >= b.weeks[0] && week <= b.weeks[1])!;

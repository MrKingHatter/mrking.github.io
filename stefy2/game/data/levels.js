/**
 * levels.js – Level data for Flowers for Stefy 2: Bloom Again
 * Level 1: Tokyo Night Garden (Stealth)
 *
 * Map: 50 cols × 30 rows
 * Legend: g=grass, t=tree, p=path, w=water, W=wall, h=house, d=door,
 *         f=flowers, s=sand, b=bridge, r=rock, B=bush
 */

// ───── LEVEL 1: TOKYO NIGHT GARDEN ─────
const L1_MAP = [
  'tttttttttttttttttttttttttttttttttttttttttttttttttt', // 50
  'tggggggggtttggggggggggtttggggggBBBBggggggggggggggt', // 50
  'tggBBggggtggfffffffgggtttgghhhhhhhhhgggggggggggfgt', // 50
  'tgBBBBgggggggffffffgggtttgghhhhhhhhhggggggfffffgtt', // 50
  'tggBBgggggggfffffgggggtgggghddddddddhgggggggfffggt', // 50
  'tgggggggggggggggggggggttgggggggggggggggggggggggfgt', // 50
  'tgggggppppppppppppppppppppppppppppppppppgggggggggt', // 50
  'tgggggpggggggggggggggggggggggggggggggggpgggggggggt', // 50
  'tghhhhpggBBBBBggggggggBBBBBgggggggggggppgggggggggt', // 50
  'tghhhhhggBBBBBggggggggBBBBBggggggggggpggggggggggtt', // 50
  'tgddddhpgggBBBgggggggggggBBBggggggggggpgggggggggtt', // 50
  'tgggggpppppppppppppppppppppppppppppppppppggggggggt', // 50
  'tggggpggggggggwwwwwwwwwwgggggggggggggggpggggggggtt', // 50
  'tghhhhpgggggggwwwwwwwwwwwwgggggggggggggpggrrggggtt', // 50
  'tghhhhhpgggggwwwwbbbbwwwwggggggggggggpgggrrrggggtt', // 50
  'tgddddhpgggggwwwwbbbbwwwwgggggggggggpggggrrggggggt', // 50
  'tggggggpgggggwwwwwwwwwwwwgggggggggggpggggggggggggt', // 50
  'tggggggppppppppppppppppppppppppppppppppggggggggggt', // 50
  'tgggggpgggggggggggggggggggggggggggggggpgghhhhhhhgt', // 50
  'tggggpgggBBBgggfffffgggBBBggggggggggppggghhhhhhhtt', // 50
  'tgggpggggBBBBggfffffgggBBBBggggggggppgggghddddhggt', // 50
  'tgggpggggBBBgggfffffgggBBBgggggggggpgggggggggggggt', // 50
  'tgggpgggggggggggfgggggggggggggggggpggggggggggggggt', // 50
  'tgggppppppppppppppppppppppppppppppppppppgggggggggt', // 50
  'tgggpgggggggggggggggggggggggggggggggggpggggggggggt', // 50
  'tgggpgggggBBBBBBgggggggBBBBBBggggggppgggrrrgggggtt', // 50
  'tgggpgggggBBBBBBgggggggBBBBBBggggggpgggrrrrrggggtt', // 50
  'tgggpppppppppppppppppppppppppppppppppppggrrrrrgggg', // 50
  'tgggggggggggggggggggggggggggggggggggggggggrrrggggg', // 50
  'tttttttttttttttttttttttttttttttttttttttttttttttttt', // 50
].join('\n');

const L1_START = { col: 3, row: 27 };
const L1_GOAL = { col: 46, row: 3 }; // wind chime in top-right garden

const L1_GUARDS = [
  // Fox 1 -- horizontal patrol along top path
  { id: 'fox1', col: 12, row: 6, route: [{col:12,row:6},{col:28,row:6},{col:12,row:6}], speed: 2.5, visionRange: 4, visionArc: 70 },
  // Fox 2 -- vertical patrol along pond edge
  { id: 'fox2', col: 12, row: 12, route: [{col:12,row:12},{col:12,row:16},{col:12,row:12}], speed: 2, visionRange: 5, visionArc: 60 },
  // Fox 3 -- patrol along bottom path
  { id: 'fox3', col: 30, row: 23, route: [{col:30,row:23},{col:10,row:23},{col:30,row:23}], speed: 3, visionRange: 4, visionArc: 60 },
  // Fox 4 -- guard near the goal
  { id: 'fox4', col: 42, row: 6, route: [{col:42,row:6},{col:46,row:6},{col:46,row:3},{col:42,row:3},{col:42,row:6}], speed: 1.5, visionRange: 5, visionArc: 80 },
  // Fox 5 -- roaming middle
  { id: 'fox5', col: 35, row: 11, route: [{col:35,row:11},{col:35,row:17},{col:40,row:17},{col:40,row:11},{col:35,row:11}], speed: 2, visionRange: 4, visionArc: 65 },
];

const L1_CHECKPOINTS = [
  { col: 6, row: 11 },  // near first house
  { col: 20, row: 17 }, // past the pond
  { col: 40, row: 23 }, // right side lower
];

const L1_NPCS = [
  { id: 'night_cat', col: 8, row: 8, sprite: 'cat', dialog: [
    { speaker: 'Night Cat', text: '*judges silently*' },
    { speaker: 'Mikkel', text: '(The cat knows I\'m sneaking around at midnight. Very judgmental energy.)' },
  ]},
  { id: 'gardener', col: 9, row: 13, sprite: 'gardener', dialog: [
    { speaker: 'Sleeping Gardener', text: '...zzz... foxes turn before they move... zzz...' },
    { speaker: 'Mikkel', text: '(Even unconscious people are more helpful than me at directions.)' },
  ]},
  { id: 'tanuki', col: 38, row: 14, sprite: 'tanuki', dialog: [
    { speaker: 'Tanuki Statue', text: '...' },
    { speaker: 'Mikkel', text: '(Did that statue just blink? I\'m losing it.)' },
    { speaker: 'Tanuki Statue', text: 'East. The last fox looks east first. You\'re welcome.' },
  ]},
  { id: 'firefly', col: 25, row: 19, sprite: 'firefly', dialog: [
    { speaker: 'Firefly Swarm', text: '*blinks in unison*' },
    { speaker: 'Mikkel', text: '(She\'d try to catch one. Then apologize to it. Then name it.)' },
  ]},
];

const L1_ENV_INTERACTIONS = [
  { col: 20, row: 14, id: 'pond', text: '(Moon in the pond. Very aesthetic. She\'d make me take twelve photos.)' },
  { col: 46, row: 3, id: 'cherry_tree', text: '(Cherry blossoms. Pink like the emoji she spams me with.)' },
  { col: 6, row: 3, id: 'bamboo', text: '(Bamboo rustling. Sounds like her whispering vocab to herself on camera.)' },
  { col: 38, row: 2, id: 'stone_lantern', text: '(Stone lantern, still warm. Spooky. Cool. Spoopy.)' },
  { col: 14, row: 20, id: 'flower_bush', text: '(Night jasmine. Aggressively fragrant. Like her cooking. Don\'t tell her I said that.)' },
  { col: 30, row: 14, id: 'koi_shadow', text: '(Koi fish. Swimming in circles. I relate, honestly.)' },
  { col: 44, row: 26, id: 'old_bench', text: '(Bench. Someone definitely had a dramatic anime moment here.)' },
  { col: 10, row: 25, id: 'moss_rock', text: '(Very soft moss. Would rate 8/10 for napping. Focus, Mikkel.)' },
  { col: 28, row: 8, id: 'prayer_flags', text: '(Prayer strips. Should I write one? "Please let me not say something dumb." Too late for that.)' },
  { col: 48, row: 15, id: 'garden_gate', text: '(A gate to nowhere. Very on-brand for my love life. Wait, what?)' },
  { col: 35, row: 20, id: 'wind_chime', text: '(I can hear it! The chime! Almost there, Mikkel, don\'t trip.)' },
  { col: 15, row: 5, id: 'stepping_stones', text: '(Stepping stones. She\'d hop across these and I\'d pretend not to be impressed.)' },
];

const L1_SELF_TALK = [
  { trigger: 'start', text: '(OK. Midnight garden. Don\'t get caught by foxes. Normal Tuesday.)' },
  { trigger: 'first_seen', text: '(They freeze when they spot me. I freeze too. We have so much in common.)' },
  { trigger: 'checkpoint1', text: '(Halfway. I\'m basically a ninja. A very tall Nordic ninja.)' },
  { trigger: 'near_goal', text: '(I can hear the chime! Don\'t mess it up now, Mikkel.)' },
  { trigger: 'caught', text: '(Spotted. Again. Stefy would be laughing so hard right now.)' },
];

// ───── LEVEL 2 PLACEHOLDER (Lisbon Puzzle) ─────
// const L2_MAP = ...

// ───── EXPORTS ─────
export const LEVELS = [
  {
    id: 1,
    name: 'Tokyo Night Garden',
    type: 'stealth',
    map: L1_MAP,
    start: L1_START,
    goal: L1_GOAL,
    guards: L1_GUARDS,
    checkpoints: L1_CHECKPOINTS,
    npcs: L1_NPCS,
    envInteractions: L1_ENV_INTERACTIONS,
    selfTalk: L1_SELF_TALK,
    memoryItem: { id:'cherry_blossom', name:'Cherry Blossom', flavor:'The first one. She taught me constellations. I taught her... nothing useful, probably.' },
    music: { tempo: 100, key: 'minor', mood: 'tense' },
    ambience: 'night_crickets',
    intro: [
      { speaker: 'Mikkel', text: 'The garden looks the same. Still crawling with spirit foxes. Great.' },
      { speaker: 'Mikkel', text: 'Last time I stole a flower from here. This time I need to remember why.' },
      { speaker: 'Mikkel', text: 'The wind chime. I heard it and the whole memory came flooding back. Let\'s do that again.' },
      { speaker: 'Mikkel', text: '(Sneak past the foxes. Stay out of their vision cones. Very Metal Gear.)' },
    ],
  },
];

// ───── LEVEL 3: PROVENCE LAVENDER CHASE ─────
// Tile legend: g=grass, w=water, p=path, t=tree, W=wall, f=flowers(lavender),
//              s=sand(wheat field), h=house, b=bridge, r=rock, B=bush, d=door
const L3_MAP = [
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
  'tffffffggggggggggggggggggggggggggfffffffffffffffgt',
  'tffffffggppppppppggggggggggggggggfffffffffffffffgt',
  'tfffgggggpggggggpgggggggggggggggggfffggggggffffggt',
  'tgggggggppggBBggpppppppppggggggggggggggggggggggggt',
  'tgppppppppggBBgggggggggBpggggggggggggggggggggffggt',
  'tgpgggggggggggggggggggggpppppppppppppggggggggggggt',
  'tgpgghhhhhggggggggggggggggggggggggggpggggggggffggt',
  'tgpgghhhhhgggggggsssssgggggggggggggppgghhhhhhggggt',
  'tgpggdddddggggggsssssssggggggggggppgggghhhhhhffggt',
  'tgpppppppppppppppssssssspppppppppppggggddddddggggt',
  'tggggggggggggggggsssssssgggggggggpgggggggggggffggt',
  'tgffffffgggggggggssssssgggggggggpppggggggggggggggt',
  'tgffffffggggggggggssssgggggggggpggggffffffgggffggt',
  'tgfffgggggggggggggggggggggggggppggggffffffgggffggt',
  'tggggggpppppppppppppppppppppppppgggggfffgggggffggt',
  'tggggggpggggggggggggggggggggggpggggggggggggggggggt',
  'tgggggppgghhhhhgggggggggggBBggpppppppggggggggggggt',
  'tggffppggghhhhhgggggffffggBBBgggggggppgggggggggggt',
  'tggffpggggdddddggggffffggggBgggggggggppggBBBgggggt',
  'tggggppppppppppppppppppppppppppppppppppppBBBBggggt',
  'tgggggggggggggggggggggggggggggggggggggpggBBBgggggt',
  'tgfffffggggwwwwwwwwwwgggggggggggggffffpggggggffggt',
  'tgfffffgggwwwwwwwwwwwggggggggggggfffffpggggggffggt',
  'tgfffggggwwwwwbbbbwwwwgggggggggggffffppggggggggggt',
  'tggggggggwwwwwbbbbwwwwgggggggggggggppggggggffffggt',
  'tgggggpppppppppppppppppppppppppppppppgggggfffffggt',
  'tgggggpggggggggggggggggggggggggggggggggggffffffggt',
  'tgggggpgggggggffffffffffffffgggggggggggggffffffggt',
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
].join('\n');

const L3_START = { col: 2, row: 5 };

const L3_WISP_LOCATIONS = [
  { col: 6, row: 4 },
  { col: 16, row: 10 },
  { col: 35, row: 8 },
  { col: 6, row: 15 },
  { col: 31, row: 17 },
  { col: 15, row: 26 },
  { col: 6, row: 28 },
];

const L3_MEMORY_LINES = [
  'Lavender. That\'s what it was.',
  'She was running ahead through the field, arms out.',
  'He tried to keep up but couldn\'t stop laughing.',
  'She tripped on nothing. He caught her. Barely.',
  'For three seconds they were close enough to share a breath.',
  '"You\'re slow," she said. "You\'re fast," he said.',
  'Neither of them moved for a while after that.',
];

const L3_NPCS = [
  { id: 'painter', col: 8, row: 8, sprite: 'gardener', dialog: [
    { speaker: 'Painter', text: 'You see the purple lights? Walk close and press Space.' },
    { speaker: 'Painter', text: 'They come one at a time. Very dramatic. Very Provence.' },
  ]},
  { id: 'cat', col: 32, row: 9, sprite: 'cat', dialog: [
    { speaker: 'Provençal Cat', text: '*stretches luxuriously*' },
    { speaker: 'Mikkel', text: '(She\'d name it "Monsieur Croissant." I\'d pretend that\'s not adorable.)' },
  ]},
  { id: 'baker', col: 8, row: 19, sprite: 'tanuki', dialog: [
    { speaker: 'Baker', text: 'Saw a glow near the bridge. Also want a croissant? No? Your loss.' },
  ]},
  { id:'beekeeper', col:20, row:14, sprite:'gardener', dialog:[
    { speaker: 'Beekeeper', text: 'No rush! The orbs wait. Unlike my bees. Don\'t run.' },
  ]},
];

const L3_ENV_INTERACTIONS = [
  { col: 3, row: 1, id: 'lavender1', text: '(Lavender everywhere. She\'d already be planning what to cook with it. Overachiever.)' },
  { col: 15, row: 9, id: 'wheat', text: '(Golden wheat. I took seventeen photos here last time. All of her. Very subtle, Mikkel.)' },
  { col: 10, row: 22, id: 'stream', text: '(We skipped rocks here until mine hit a duck. She laughed until she couldn\'t breathe.)' },
  { col: 25, row: 28, id: 'lavender_deep', text: '(The deep lavender is almost purple. I compared it to her eyes once. Out loud. Horrifying.)' },
  { col: 32, row: 8, id: 'farmhouse', text: '(Stone farmhouse. She said she\'d cook in one someday. I volunteered to taste-test. Smooth.)' },
  { col: 20, row: 15, id: 'beehive', text: '(A beehive. The honey here probably costs 40 euros. Worth it though.)' },
  { col: 38, row: 20, id: 'old_well', text: '(Stone well with a purple ribbon. Someone\'s either romantic or lost their hair tie.)' },
  { col: 5, row: 12, id: 'stone_wall', text: '(A low wall. Perfect sitting height. Not that I\'m imagining sitting here with anyone specific.)' },
  { col: 28, row: 5, id: 'sundial', text: '(Sundial reads "time passes, love doesn\'t." The French really commit to the vibe.)' },
  { col: 12, row: 28, id: 'bicycle', text: '(Rusted bicycle. Someone pedaled off into the sunset. Good for them.)' },
];

const L3_SELF_TALK = [
  { trigger: 'first_found', text: '(Got one! The memory is... oh. Oh that\'s a good one.)' },
  { trigger: 'halfway', text: '(Halfway. My face is doing something weird. Am I smiling? Stop it.)' },
  { trigger: 'near_wisp', text: '(Another one close by. The lavender gets brighter near them.)' },
];

export const LEVELS_L3 = {
  id: 3,
  name: 'Lavender Fields',
  type: 'seek',
  map: L3_MAP,
  start: L3_START,
  wispLocations: L3_WISP_LOCATIONS,
  memoryLines: L3_MEMORY_LINES,
  npcs: L3_NPCS,
  envInteractions: L3_ENV_INTERACTIONS,
  selfTalk: L3_SELF_TALK,
  memoryItem: { id:'silver_lavender', name:'Silver Lavender', flavor:'She ran ahead. I chased. Neither of us was actually trying to win.' },
  music: { tempo: 120, key: 'major', mood: 'warm_urgent' },
  ambience: 'cicadas',
  intro: [
    { speaker: 'Mikkel', text: 'Provence. The lavender hits you like a wall. A nice wall. A purple wall.' },
    { speaker: 'Mikkel', text: 'Wait... something\'s glowing in the field. Faint purple lights.' },
    { speaker: 'Mikkel', text: 'Memory fragments. Of course they\'re scattered across a field. Dramatic as always.' },
    { speaker: 'Mikkel', text: '(Walk close, press Space. Collect the glowing memories. Try not to be emotional about it.)' },
  ],
};

// ───── LEVEL 2: DUTCH COUNTRYSIDE ─────
const L2_MAP = (() => {
  const R = 30, C = 50;
  const g = Array.from({length: R}, () => Array(C).fill('g'));
  const set = (r, c, ch) => { g[r][c] = ch; };
  const hl = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const vl = (c, r1, r2, ch) => { for (let r = r1; r <= r2; r++) set(r, c, ch); };
  const bx = (r1, c1, r2, c2, ch) => { for (let r = r1; r <= r2; r++) hl(r, c1, c2, ch); };
  hl(0,0,49,'t'); hl(29,0,49,'t'); vl(0,0,29,'t'); vl(49,0,29,'t');
  bx(1,4,3,9,'f'); bx(25,4,27,9,'f'); bx(25,14,27,18,'f');
  bx(13,10,14,12,'m');
  hl(5,2,21,'p'); hl(11,2,21,'p'); hl(16,2,12,'p'); hl(22,2,21,'p');
  vl(2,5,22,'p'); vl(21,5,11,'p');
  bx(7,5,8,9,'h'); bx(7,14,8,18,'h'); hl(9,5,9,'d'); hl(9,14,18,'d');
  bx(18,5,19,9,'h'); bx(18,14,19,18,'h'); hl(20,5,9,'d'); hl(20,14,18,'d');
  hl(24,34,38,'F'); hl(28,34,38,'F'); vl(34,25,27,'F'); vl(38,25,27,'F');
  set(26,35,'f'); set(26,37,'f'); set(27,35,'f'); set(27,37,'f');
  bx(1,23,2,33,'w');
  // Canal system (last so it overrides fence at crossings)
  vl(28,3,22,'c');
  hl(8,29,35,'c'); vl(35,9,11,'c');
  hl(15,21,27,'c'); vl(21,16,18,'c');
  hl(22,22,27,'c'); vl(22,23,25,'c');
  hl(22,29,36,'c'); vl(36,23,27,'c');
  return g.map(row => row.join('')).join('\n');
})();

const L2_START = { col: 2, row: 5 };
const L2_GOAL  = { col: 36, row: 27 };
const L2_GATES = [
  { id: 'gate_a', col: 28, row: 4,  open: false },
  { id: 'gate_b', col: 29, row: 8,  open: true  },
  { id: 'gate_c', col: 28, row: 12, open: false },
  { id: 'gate_d', col: 27, row: 15, open: true  },
  { id: 'gate_e', col: 27, row: 22, open: true  },
  { id: 'gate_f', col: 29, row: 22, open: false },
];
const L2_CORRECT_PATH = (() => {
  const s = new Set();
  for (let r = 3; r <= 22; r++) s.add(`28,${r}`);
  for (let c = 29; c <= 36; c++) s.add(`${c},22`);
  for (let r = 23; r <= 27; r++) s.add(`36,${r}`);
  return s;
})();
const L2_NPCS = [
  { id: 'canal_keeper', col: 22, row: 6, sprite: 'gardener', dialog: [
    { speaker: 'Canal Keeper', text: 'Sluice gates control the flow. Space to toggle. Don\'t flood my garden.' },
    { speaker: 'Canal Keeper', text: 'Close the wrong ones or the water just... goes everywhere. Like tourists.' },
  ]},
  { id: 'duck', col: 25, row: 2, sprite: 'cat', dialog: [
    { speaker: 'Duck', text: '*quack*' },
    { speaker: 'Mikkel', text: '(She named the last one "Professor Quackington." In Italian. Even funnier.)' },
  ]},
  { id: 'mill_keeper', col: 11, row: 12, sprite: 'tanuki', dialog: [
    { speaker: 'Miller', text: 'Too many open gates means no pressure. Pick wisely, friend.' },
  ]},
  { id: 'cheese_man', col: 11, row: 20, sprite: 'merchant', dialog: [
    { speaker: 'Old Cheese Seller', text: 'You again! Still lost? Still happy about it?' },
    { speaker: 'Mikkel', text: '(The cheese man! Still here. Still gives free Gouda. Legend.)' },
  ]},
];
const L2_ENV = [
  { col:6,row:2,id:'tulips',text:'(Tulips. She took a hundred photos. I was in zero of them. Rude.)' },
  { col:11,row:13,id:'windmill',text:'(Windmill\'s stuck. Same energy as me trying to text her back casually.)' },
  { col:24,row:1,id:'reservoir',text:'(Full reservoir. Just needs the right path. Very metaphorical. Shut up, brain.)' },
  { col:34,row:26,id:'garden',text:'(Dry tulip garden. The golden one is in there somewhere.)' },
  { col:7,row:7,id:'house1',text:'(Canal house with a lean. She said they lean to greet you. I think it\'s just sinking.)' },
  { col:16,row:7,id:'house2',text:'(Curtains wide open. Dutch people have no secrets. I respect it.)' },
  { col:40,row:4,id:'boat',text:'(Empty canal boat. Could nap here. Tempting. No. Flowers first.)' },
  { col:30,row:14,id:'bridge',text:'(Brick bridge. Took a selfie here last time. Deleted it. Took another one.)' },
  { col:20,row:22,id:'dike',text:'(A dike. The Dutch have been solving water puzzles for centuries. I have five minutes.)' },
];
const L2_SELF_TALK = [
  { trigger:'start',text:'(Netherlands. Flat as a pancake. Pretty as a postcard. The tulip garden is bone dry though.)' },
  { trigger:'first_gate',text:'(Sluice gate! Space to toggle. Now I\'m a water engineer. My CV is wild.)' },
  { trigger:'leak',text:'(Water\'s splitting. Neither side gets enough. Close something, Mikkel.)' },
  { trigger:'progress',text:'(Flowing further! I\'m basically Dutch now. Someone get me clogs.)' },
];

export const LEVELS_L2 = {
  id: 2, name: 'Dutch Countryside', type: 'puzzle',
  map: L2_MAP, start: L2_START, goal: L2_GOAL,
  gates: L2_GATES, correctPath: L2_CORRECT_PATH,
  npcs: L2_NPCS, envInteractions: L2_ENV, selfTalk: L2_SELF_TALK,
  memoryItem: { id:'golden_tulip', name:'Golden Tulip', flavor:'We got lost. Found a cheese man. Got unsolicited life advice. Perfect day.' },
  music: { tempo:90, key:'major', mood:'gentle' }, ambience: 'morning_birds',
  intro: [
    { speaker:'Mikkel', text:'The Dutch countryside. Canals, flat everything, unreasonably good cheese.' },
    { speaker:'Mikkel', text:'We got lost here once. Followed the water until we found trouble. Good trouble.' },
    { speaker:'Mikkel', text:'The tulip garden is dry. Sluice gates are jammed. Time to play plumber.' },
    { speaker:'Mikkel', text:'(Find the gates, toggle with Space. Route water to the garden. Don\'t overthink it.)' },
  ],
};


// ───── LEVEL 4: AMAZON JUNGLE EXPLORATION ─────
const L4_MAP = (() => {
  const R = 30, C = 50;
  const g = Array.from({length: R}, () => Array(C).fill('t'));
  const set = (r, c, ch) => { if(r>=0&&r<R&&c>=0&&c<C) g[r][c] = ch; };
  const hl = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const vl = (c, r1, r2, ch) => { for (let r = r1; r <= r2; r++) set(r, c, ch); };
  const bx = (r1, c1, r2, c2, ch) => { for (let r = r1; r <= r2; r++) hl(r, c1, c2, ch); };
  // River running vertically
  vl(24,0,29,'w'); vl(25,0,29,'w');
  // Bridges over river
  hl(8,24,25,'b'); hl(15,24,25,'b'); hl(22,24,25,'b');
  // Clearings (grass patches in jungle)
  bx(2,2,5,6,'g'); bx(4,10,6,14,'g'); bx(2,30,5,35,'g');
  bx(10,3,13,8,'g'); bx(10,28,13,33,'g');
  bx(17,5,20,10,'g'); bx(17,30,20,36,'g');
  bx(24,3,27,8,'g'); bx(24,38,27,44,'g');
  // Paths through jungle
  hl(3,6,10,'p'); hl(5,14,24,'p'); hl(3,25,30,'p');
  vl(6,3,10,'p'); vl(14,5,10,'p'); vl(30,3,10,'p');
  hl(12,8,24,'p'); hl(12,25,28,'p');
  vl(8,10,17,'p'); vl(28,10,17,'p');
  hl(18,10,24,'p'); hl(18,25,30,'p');
  vl(10,17,24,'p'); vl(33,17,24,'p');
  hl(25,8,24,'p'); hl(25,25,38,'p');
  vl(38,25,27,'p');
  // Goal clearing deep in jungle
  bx(26,40,28,44,'f'); set(27,42,'f');
  // Rocks and bushes for obstacles
  set(6,8,'r'); set(9,20,'r'); set(14,5,'r'); set(20,40,'r');
  set(7,18,'B'); set(11,35,'B'); set(16,12,'B'); set(23,30,'B');
  return g.map(row => row.join('')).join('\n');
})();

const L4_START = { col: 3, row: 3 };
const L4_GOAL = { col: 42, row: 27 };

const L4_LANDMARKS = [
  { id: 'waterfall', col: 24, row: 5, text: '(Hidden waterfall! She\'d Shazam it. "What song is this waterfall?" That\'s not how it works, Stefy.)' },
  { id: 'ancient_tree', col: 14, row: 12, text: '(Thousand-year-old tree. Survived everything. I can barely survive a group chat.)' },
  { id: 'bird_nest', col: 33, row: 20, text: '(Blue eggs in a nest. Protected, high up, unbothered. Living the dream.)' },
  { id: 'cave_mouth', col: 8, row: 22, text: '(Dark cave. Nope. Not going in. I\'ve seen movies.)' },
];

const L4_NPCS = [
  { id: 'parrot', col: 5, row: 4, sprite: 'firefly', dialog: [
    { speaker: 'Scarlet Macaw', text: '*mimics* "KEEP GOING! KEEP GOING!"' },
    { speaker: 'Mikkel', text: '(Thanks. Very encouraging. Wrong language but I appreciate the energy.)' },
  ]},
  { id: 'river_guide', col: 24, row: 14, sprite: 'gardener', dialog: [
    { speaker: 'River Guide', text: 'Can\'t see the path? Walk it anyway. The jungle shows the way to those who move.' },
  ]},
  { id: 'monkey', col: 30, row: 10, sprite: 'cat', dialog: [
    { speaker: 'Capuchin', text: '*chitters and points southeast*' },
    { speaker: 'Mikkel', text: '(The monkey has better navigation than me. Story of my life.)' },
  ]},
  { id: 'frog', col: 18, row: 20, sprite: 'firefly', dialog: [
    { speaker: 'Tree Frog', text: '*ribbit*' },
    { speaker: 'Mikkel', text: '(Just keep walking. Fog clears where you go. Don\'t overthink it.)' },
  ]},
];

const L4_ENV = [
  { col:12,row:5,id:'vines',text:'(Vines thick as my arm. She\'d try to swing on one. I\'d have to catch her. Again.)' },
  { col:20,row:18,id:'river_bank',text:'(Muddy river bank. My shoes are destroyed. She\'d say "they have character now.")' },
  { col:35,row:25,id:'orchid_trail',text:'(Petals on the ground. Getting warmer. Like a very wet treasure hunt.)' },
  { col:6,row:15,id:'fallen_log',text:'(Massive fallen log. Good bench. My fitbit thinks I\'m dead.)' },
  { col:15,row:22,id:'waterfall',text:'(Small waterfall. She\'d stick her hand in and shriek. I\'d laugh. She\'d splash me.)' },
  { col:28,row:8,id:'mushroom_ring',text:'(Glowing mushrooms in a circle. Either magical or toxic. Both, probably.)' },
  { col:40,row:20,id:'broken_bridge',text:'(Rope bridge, half rotten. The footprints only go forward. That\'s a sign.)' },
  { col:18,row:28,id:'carved_tree',text:'(Initials carved in a trunk. Not ours. But... noted. For later. Maybe.)' },
];

const L4_SELF_TALK = [
  { trigger:'start',text:'(Dense jungle. Can\'t see two meters ahead. The orchid better be worth it.)' },
  { trigger:'river',text:'(River. No swimming. My coordination is bad enough on land.)' },
  { trigger:'deep',text:'(Getting deep now. Following the sound of water. Or is that my heartbeat?)' },
];

export const LEVELS_L4 = {
  id: 4, name: 'Jungle River', type: 'explore',
  map: L4_MAP, start: L4_START, goal: L4_GOAL,
  landmarks: L4_LANDMARKS,
  npcs: L4_NPCS, envInteractions: L4_ENV, selfTalk: L4_SELF_TALK,
  memoryItem: { id:'rainbow_orchid', name:'Rainbow Orchid', flavor:'Thunderstorm. Shared an awning. Both scared. Both pretending not to be. Very cool of us.' },
  music: { tempo:80, key:'minor', mood:'mysterious' }, ambience: 'jungle_rain',
  intro: [
    { speaker:'Mikkel', text:'The Amazon. Air thick as soup. Humidity at 300%. My hair is already ruined.' },
    { speaker:'Mikkel', text:'The orchid is deep in there. Can\'t see the path. Obviously.' },
    { speaker:'Mikkel', text:'Just walk. The fog lifts wherever I go. Like a very sweaty adventure game.' },
  ],
};

// ───── LEVEL 5: MOROCCO TRADING ─────
const L5_MAP = (() => {
  const R = 30, C = 50;
  const g = Array.from({length: R}, () => Array(C).fill('s'));
  const set = (r, c, ch) => { if(r>=0&&r<R&&c>=0&&c<C) g[r][c] = ch; };
  const hl = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const vl = (c, r1, r2, ch) => { for (let r = r1; r <= r2; r++) set(r, c, ch); };
  const bx = (r1, c1, r2, c2, ch) => { for (let r = r1; r <= r2; r++) hl(r, c1, c2, ch); };
  // Border walls
  hl(0,0,49,'W'); hl(29,0,49,'W'); vl(0,0,29,'W'); vl(49,0,29,'W');
  // Medina buildings (houses)
  bx(2,2,5,8,'h'); bx(2,12,5,18,'h'); bx(2,22,5,28,'h'); bx(2,32,5,38,'h');
  bx(8,2,11,8,'h'); bx(8,12,11,18,'h'); bx(8,22,11,28,'h'); bx(8,32,11,38,'h');
  bx(14,2,17,8,'h'); bx(14,12,17,18,'h'); bx(14,22,17,28,'h');
  bx(20,2,23,8,'h'); bx(20,12,23,18,'h'); bx(20,22,23,28,'h');
  // Doors on buildings
  set(5,5,'d'); set(5,15,'d'); set(5,25,'d'); set(5,35,'d');
  set(11,5,'d'); set(11,15,'d'); set(11,25,'d'); set(11,35,'d');
  set(17,5,'d'); set(17,15,'d'); set(17,25,'d');
  set(23,5,'d'); set(23,15,'d'); set(23,25,'d');
  // Streets (paths)
  hl(6,1,49,'p'); hl(12,1,49,'p'); hl(18,1,49,'p'); hl(24,1,49,'p');
  vl(9,1,29,'p'); vl(19,1,29,'p'); vl(29,1,29,'p'); vl(39,1,29,'p');
  // Market square
  bx(25,30,28,48,'p');
  // Enclosed flower garden (locked until key obtained)
  bx(1,42,4,48,'f'); vl(41,1,5,'W'); hl(5,42,48,'W');
  set(5,45,'p');
  return g.map(row => row.join('')).join('\n');
})();

const L5_START = { col: 9, row: 28 };
const L5_GOAL = { col: 45, row: 2 };

const L5_TRADERS = [
  { id:'spice_seller', name:'Spice Seller', col:9, row:6, sprite:'gardener',
    wants: null, gives:'Saffron',
    giveDialog:[{speaker:'Spice Seller',text:'Welcome! Here, take this saffron. Free! First one is always free.'},{speaker:'Spice Seller',text:'The carpet weaver next street over? Obsessed with saffron tea. Maybe she can help you.'}],
    needDialog:[{speaker:'Spice Seller',text:'I have plenty! Take, take.'}],
    doneText:'Go! Be fragrant!' },
  { id:'carpet_weaver', name:'Carpet Weaver', col:19, row:12, sprite:'tanuki',
    wants:'Saffron', gives:'Silk Thread',
    giveDialog:[{speaker:'Carpet Weaver',text:'Saffron! You angel. Here, silk thread. Fair trade.'},{speaker:'Carpet Weaver',text:'The lantern maker south of here needs thread for his frames. Tell him I said hi.'}],
    needDialog:[{speaker:'Carpet Weaver',text:'I\'d kill for some saffron tea... the spice seller up north has some.'}],
    doneText:'Beautiful. Come back and I\'ll make you a rug.' },
  { id:'lantern_maker', name:'Lantern Maker', col:29, row:18, sprite:'merchant',
    wants:'Silk Thread', gives:'Bronze Key',
    giveDialog:[{speaker:'Lantern Maker',text:'Perfect thread! Tonight\'s lanterns will be magnificent.'},{speaker:'Lantern Maker',text:'Here, a bronze key. The garden keeper dropped it last week. He\'s been sulking.'}],
    needDialog:[{speaker:'Lantern Maker',text:'I need silk thread for my frames. The carpet weaver has some. I think.'}],
    doneText:'May my lanterns light your questionable life choices.' },
  { id:'riad_keeper', name:'Garden Keeper', col:39, row:24, sprite:'cat',
    wants:'Bronze Key', gives: null,
    giveDialog:[{speaker:'Garden Keeper',text:'MY KEY! Where did you... never mind! Go in! The garden is yours tonight.'},{speaker:'Garden Keeper',text:'The roses at sunset change people. Or so they tell me. I\'m already changed.'}],
    needDialog:[{speaker:'Garden Keeper',text:'Lost my key somewhere in the market. Again. I\'m a disaster.'}],
    doneText:'Still in there? Take your time. The flowers don\'t mind.' },
];

const L5_NPCS = [
  { id:'spice_seller', col:9, row:6, sprite:'gardener', dialog:[] },
  { id:'carpet_weaver', col:19, row:12, sprite:'tanuki', dialog:[] },
  { id:'lantern_maker', col:29, row:18, sprite:'merchant', dialog:[] },
  { id:'riad_keeper', col:39, row:24, sprite:'cat', dialog:[] },
  { id:'tea_man', col:25, row:24, sprite:'merchant', dialog:[
    { speaker: 'Tea Seller', text: 'Sit! Tea first. Then business. The spice seller north gives freebies. Start there.' },
    { speaker: 'Tea Seller', text: 'Everyone here wants something. Give one thing, get another. Easy.' },
  ]},
  { id:'medina_cat', col:35, row:6, sprite:'cat', dialog:[
    { speaker: 'Medina Cat', text: '*headbutts your ankle*' },
    { speaker: 'Mikkel', text: '(She\'d adopt you immediately. "Signor Cannoli, you come home with mama.")' },
  ]},
];

const L5_ENV = [
  { col:15,row:6,id:'market_stall',text:'(Dried fruit and spices. She\'d buy everything. "It\'s for cooking, Mikkel!" Sure it is.)' },
  { col:25,row:18,id:'fountain',text:'(A tiled fountain. She\'d make a wish. I\'d pretend not to make one too.)' },
  { col:35,row:12,id:'cats',text:'(Cats everywhere. They own this city and they know it.)' },
  { col:42,row:28,id:'sunset_wall',text:'(Warm wall. I\'m leaning on history. Very dramatic of me.)' },
  { col:5,row:12,id:'door_carved',text:'(Carved door. Every one is different. She\'d photograph all of them.)' },
  { col:20,row:6,id:'spice_pile',text:'(Saffron, cumin, paprika. My nose is having the time of its life.)' },
  { col:30,row:24,id:'mosaic',text:'(Floor mosaic in blue and gold. I\'d trip on it. She\'d frame it.)' },
  { col:45,row:12,id:'rooftop_view',text:'(Rooftop view of the whole medina. Worth the climb. My legs disagree.)' },
];

const L5_SELF_TALK = [
  { trigger:'start',text:'(Morocco. Noise, color, cats. Someone here has what I need. Probably.)' },
  { trigger:'first_trade',text:'(Trading! Give a thing, get a thing. I\'m basically a merchant now. Where\'s my turban?)' },
  { trigger:'key_obtained',text:'(A key! The garden keeper lost his. Time to be a hero. A very sweaty hero.)' },
];

export const LEVELS_L5 = {
  id: 5, name: 'Desert Riad', type: 'trade',
  map: L5_MAP, start: L5_START, goal: L5_GOAL,
  traders: L5_TRADERS,
  npcs: L5_NPCS, envInteractions: L5_ENV, selfTalk: L5_SELF_TALK,
  memoryItem: { id:'desert_rose', name:'Desert Rose', flavor:'Sat in a garden saying nothing for an hour. Best conversation we ever had.' },
  music: { tempo:95, key:'minor', mood:'warm' }, ambience: 'market_chatter',
  intro: [
    { speaker:'Mikkel', text:'Morocco. The medina is a maze. A loud, colorful, confusing maze.' },
    { speaker:'Mikkel', text:'There\'s a flower garden behind a locked gate. Because of course there is.' },
    { speaker:'Mikkel', text:'The locals trade favors. If I\'m helpful enough, maybe someone has a key.' },
    { speaker:'Mikkel', text:'(Talk to people with Space. Trade your way to the garden. Charm offensive.)' },
  ],
};

// ───── LEVEL 6: DENMARK WHITE CLIFFS ─────
const L6_MAP = (() => {
  const R = 30, C = 50;
  const g = Array.from({length: R}, () => Array(C).fill('w'));
  const set = (r, c, ch) => { if(r>=0&&r<R&&c>=0&&c<C) g[r][c] = ch; };
  const hl = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const vl = (c, r1, r2, ch) => { for (let r = r1; r <= r2; r++) set(r, c, ch); };
  const bx = (r1, c1, r2, c2, ch) => { for (let r = r1; r <= r2; r++) hl(r, c1, c2, ch); };
  // Start platform
  bx(13,1,16,4,'g');
  // Narrow cliff path (path tiles = safe, water/sand = fall)
  // Section 1: rightward
  hl(14,4,8,'p'); vl(8,12,14,'p'); hl(12,8,12,'p');
  // Section 2: upward and right
  vl(12,8,12,'p'); hl(8,12,16,'p'); vl(16,5,8,'p'); hl(5,16,22,'p');
  // Section 3: winding right
  vl(22,5,9,'p'); hl(9,22,26,'p'); vl(26,9,13,'p'); hl(13,26,32,'p');
  // Section 4: up and across
  vl(32,10,13,'p'); hl(10,32,36,'p'); vl(36,7,10,'p'); hl(7,36,42,'p');
  // Section 5: final approach
  vl(42,7,14,'p'); hl(14,42,46,'p'); vl(46,14,18,'p');
  // Goal platform
  bx(18,44,21,48,'g'); set(19,46,'f');
  // Checkpoints (wider safe platforms)
  bx(11,11,13,13,'g'); bx(4,15,6,17,'g');
  bx(8,21,10,23,'g'); bx(12,25,14,27,'g');
  bx(9,31,11,33,'g'); bx(6,35,8,37,'g');
  bx(6,41,8,43,'g'); bx(13,41,15,43,'g');
  // Sand = loose gravel (also fall)
  set(14,6,'s'); set(8,14,'s'); set(5,20,'s');
  set(9,24,'s'); set(13,30,'s'); set(10,35,'s'); set(7,40,'s');
  // Rocks for atmosphere
  set(3,3,'r'); set(20,10,'r'); set(25,30,'r'); set(22,45,'r');
  return g.map(row => row.join('')).join('\n');
})();

const L6_START = { col: 2, row: 14 };
const L6_GOAL = { col: 46, row: 19 };

const L6_CHECKPOINTS = [
  { col:12, row:12 }, { col:16, row:5 }, { col:22, row:9 },
  { col:32, row:12 }, { col:36, row:7 }, { col:42, row:7 }, { col:42, row:14 },
];

const L6_NPCS = [
  { id:'seabird', col:3, row:13, sprite:'firefly', dialog:[
    { speaker:'Seabird', text:'*screams into the void*' },
    { speaker:'Mikkel', text:'(Same, bird. Same.)' },
  ]},
  { id:'lighthouse_keeper', col:12, row:11, sprite:'gardener', dialog:[
    { speaker:'Cliff Walker', text:'One step at a time. Sand tiles crumble behind you. No going back.' },
    { speaker:'Cliff Walker', text:'Fall? You restart from the last wide platform.' },
    { speaker:'Mikkel', text:'(One step at a time. I\'m Danish. We literally invented hygge. I can be patient.)' },
  ]},
  { id:'climber', col:22, row:9, sprite:'merchant', dialog:[
    { speaker:'Climber', text:'Still alive? Checkpoints are on the wide bits. Step on one and you\'re safe.' },
  ]},
];

const L6_ENV = [
  { col:16,row:6,id:'cliff_edge',text:'(Don\'t look down. I looked down. Mistake.)' },
  { col:32,row:11,id:'wind',text:'(The wind is trying to kill me personally. Very Danish.)' },
  { col:44,row:18,id:'near_goal',text:'(Almost there. Don\'t celebrate early, Mikkel. Famous last words.)' },
  { col:8,row:14,id:'fossils',text:'(Fossils in the chalk. Millions of years old. Puts my problems in perspective.)' },
  { col:22,row:5,id:'nest',text:'(Bird\'s nest on the cliff face. Brave. Stupid. Brave.)' },
  { col:36,row:8,id:'view',text:'(Can see Sweden from here. Or maybe that\'s just fog. 50/50.)' },
  { col:42,row:14,id:'wildflowers',text:'(Wildflowers growing from chalk. Stubborn little things. I respect that.)' },
];

const L6_SELF_TALK = [
  { trigger:'start',text:'(White Cliffs. Home turf. One wrong step and I\'m swimming. Tap carefully.)' },
  { trigger:'fall',text:'(Aaaand I fell. Of course. Try again, idiot.)' },
  { trigger:'midpoint',text:'(Halfway! The view is insane. She\'d say "bellissimo" about fourteen times.)' },
];

export const LEVELS_L6 = {
  id: 6, name: 'White Cliffs', type: 'precision',
  map: L6_MAP, start: L6_START, goal: L6_GOAL,
  checkpoints: L6_CHECKPOINTS,
  npcs: L6_NPCS, envInteractions: L6_ENV, selfTalk: L6_SELF_TALK,
  memoryItem: { id:'danish_bluebell', name:'Danish Bluebell', flavor:'Walked her home. Rehearsed one sentence the whole way. Said "goodnight" instead. Smooth.' },
  music: { tempo:70, key:'major', mood:'contemplative' }, ambience: 'wind_sea',
  intro: [
    { speaker:'Mikkel', text:'Denmark. Home! The White Cliffs of M\u00f8n. Wind, chalk, and the sea trying to eat everything.' },
    { speaker:'Mikkel', text:'The path is narrow. One wrong step and I\'m falling. Into the sea. Very dramatic.' },
    { speaker:'Mikkel', text:'The bluebell is at the end. Some things are worth not dying for. Wait. Worth. Ugh.' },
    { speaker:'Mikkel', text:'(Each key press = one step. Tap, don\'t hold. Avoid sand and water. Don\'t panic.)' },
  ],
};

// ───── LEVEL 7: ITALY FINALE ─────
const L7_MAP = (() => {
  const R = 60, C = 50;
  const g = Array.from({length: R}, () => Array(C).fill('g'));
  const set = (r, c, ch) => { if(r>=0&&r<R&&c>=0&&c<C) g[r][c] = ch; };
  const hl = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const vl = (c, r1, r2, ch) => { for (let r = r1; r <= r2; r++) set(r, c, ch); };
  const bx = (r1, c1, r2, c2, ch) => { for (let r = r1; r <= r2; r++) hl(r, c1, c2, ch); };
  // Border
  hl(0,0,49,'t'); hl(59,0,49,'t'); vl(0,0,59,'t'); vl(49,0,59,'t');
  // ── Phase 0 (rows 1-9): Stealth ──
  bx(1,1,9,48,'g');
  hl(5,1,48,'p'); vl(25,1,9,'p');
  bx(2,10,4,14,'B'); bx(6,20,8,24,'B'); bx(2,35,4,39,'B');
  // ── Phase 1 (rows 10-19): Water Puzzle ──
  bx(10,1,19,48,'g');
  hl(10,1,48,'W'); set(10,25,'d'); // wall with door
  hl(15,5,45,'p');
  bx(12,20,14,30,'w'); // water channel
  hl(14,20,30,'p'); // bridge over channel
  set(15,40,'r'); // sluice switch
  // Water blocks the exit (rows 17-19 around the passage)
  bx(17,20,19,30,'w'); set(18,25,'w'); set(19,25,'w');
  hl(19,1,48,'W'); set(19,25,'w'); // wall with water gap (water drains to open)
  // ── Phase 2 (rows 20-29): Chase (catch the wisp to open exit) ──
  bx(20,1,29,48,'g');
  hl(20,1,48,'p'); set(20,25,'p');
  bx(22,5,24,10,'f'); bx(26,35,28,40,'f');
  hl(25,1,48,'p'); vl(10,20,29,'p'); vl(40,20,29,'p');
  hl(29,1,48,'W'); set(29,25,'W'); // exit blocked until wisp caught
  // ── Phase 3 (rows 30-39): Explore (winding route through fog) ──
  bx(30,1,39,48,'t');
  bx(31,3,33,8,'g'); bx(34,20,36,28,'g'); bx(37,38,39,45,'g');
  vl(25,30,32,'p'); // entry corridor
  hl(32,3,25,'p'); // row 32 connects entry to left side
  vl(3,32,37,'p'); // left corridor down
  hl(37,3,20,'p'); // row 37 across to center
  vl(20,34,37,'p'); // connects row 37 up into Room B
  hl(36,28,38,'p'); // row 36 connects Room B to Room C
  vl(38,36,39,'p'); // down into Room C
  hl(39,25,38,'p'); // row 39 connects Room C to exit
  vl(25,38,39,'p'); // exit corridor
  // ── Phase 4 (rows 40-49): Trade ──
  bx(40,1,49,48,'s');
  hl(40,1,48,'p'); hl(45,1,48,'p');
  vl(10,40,49,'p'); vl(25,40,49,'p'); vl(40,40,49,'p');
  bx(41,5,43,8,'h'); bx(41,35,43,38,'h');
  set(43,6,'d'); set(43,36,'d');
  hl(49,1,48,'W'); set(49,25,'W'); // exit blocked until trade complete
  // ── Phase 5 (rows 50-58): Precision ──
  bx(50,1,58,48,'w');
  bx(50,24,51,26,'g'); // entry platform from Phase 4
  hl(51,4,26,'p'); // bridge from entry to start platform
  bx(50,1,52,4,'g'); // start platform
  vl(10,51,53,'p'); hl(53,10,18,'p');
  vl(18,53,55,'p'); hl(55,18,30,'p'); vl(30,53,55,'p');
  hl(53,30,38,'p'); vl(38,53,56,'p'); hl(56,38,45,'p');
  bx(55,43,58,48,'g'); set(57,46,'f');
  // Checkpoints for precision
  bx(50,9,52,11,'g'); bx(52,17,54,19,'g'); bx(52,29,54,31,'g'); bx(52,37,54,39,'g');
  return g.map(row => row.join('')).join('\n');
})();

const L7_START = { col: 5, row: 5 };
const L7_GOAL = { col: 46, row: 57 };

const L7_PHASES = [
  { // Phase 0: Stealth
    zone: { startRow:1, endRow:10, startCol:1, endCol:48 },
    guards: [
      { path:[{col:10,row:3},{col:10,row:7},{col:20,row:7},{col:20,row:3},{col:10,row:3}] },
      { path:[{col:30,row:4},{col:40,row:4},{col:40,row:8},{col:30,row:8},{col:30,row:4}] },
    ],
  },
  { // Phase 1: Water Puzzle (drain water to open path)
    zone: { startRow:10, endRow:20, startCol:1, endCol:48 },
    switch: { col:40, row:15 },
    // Water tiles that drain when switch is hit (the exit blocker)
    drainTiles: [
      // Row 17: cols 20-30 (furthest from exit, drain first)
      {col:20,row:17},{col:30,row:17},{col:21,row:17},{col:29,row:17},
      {col:22,row:17},{col:28,row:17},{col:23,row:17},{col:27,row:17},
      {col:24,row:17},{col:26,row:17},{col:25,row:17},
      // Row 18: cols 20-30
      {col:20,row:18},{col:30,row:18},{col:21,row:18},{col:29,row:18},
      {col:22,row:18},{col:28,row:18},{col:23,row:18},{col:27,row:18},
      {col:24,row:18},{col:26,row:18},{col:25,row:18},
      // Row 19: only col 25 is water (rest is wall)
      {col:25,row:19},
    ],
  },
  { // Phase 2: Memory Orbs (collect 3 orbs to unlock exit gate)
    zone: { startRow:20, endRow:30, startCol:1, endCol:48 },
    start: { col:25, row:20 },
    exitTile: { col:25, row:29 },
    memoryOrbs: [
      { col:10, row:25 },
      { col:35, row:23 },
      { col:25, row:27 },
    ],
  },
  { // Phase 3: Explore (fog of war)
    zone: { startRow:30, endRow:40, startCol:1, endCol:48 },
  },
  { // Phase 4: Trade
    zone: { startRow:40, endRow:50, startCol:1, endCol:48 },
    npcs: [
      { id:'baker', col:10, row:42, sprite:'gardener' },
      { id:'florist', col:40, row:42, sprite:'merchant' },
    ],
    traders: [
      { id:'baker', name:'Baker', wants:null, gives:'Fresh Bread',
        giveDialog:[{speaker:'Baker',text:'Bread! Take it! The florist up the hill is starving. Help her out.'}],
        needDialog:[{speaker:'Baker',text:'Want bread? Take it! I made too much. Again.'}],
        doneText:'Mangia bene!' },
      { id:'florist', name:'Florist', wants:'Fresh Bread', gives:null,
        giveDialog:[{speaker:'Florist',text:'BREAD! You angel! Go, go, the path is clear. The sunflower is waiting.'}],
        needDialog:[{speaker:'Florist',text:'Ugh, so hungry. If only someone had bread. I can smell the bakery from here.'}],
        doneText:'Go get that flower! I believe in you!' },
    ],
  },
  { // Phase 5: Precision
    zone: { startRow:50, endRow:59, startCol:1, endCol:48 },
    checkpoints: [{col:10,row:51},{col:18,row:53},{col:30,row:53},{col:38,row:53}],
  },
];

export const LEVELS_L7 = {
  id: 7, name: 'Piedmont Hills', type: 'finale',
  map: L7_MAP, start: L7_START, goal: L7_GOAL,
  phases: L7_PHASES,
  npcs: [
    { id:'old_woman', col:5, row:5, sprite:'gardener', dialog:[
      { speaker:'Nonna', text:'The sunflower field is far below. You\'ll need everything you\'ve learned.' },
      { speaker:'Nonna', text:'Foxes, water, memories, trading, cliffs. All of it. Coraggio, ragazzo.' },
    ]},
    { id:'stray_cat', col:40, row:8, sprite:'cat', dialog:[
      { speaker:'Cat', text:'*stares with terrifying wisdom*' },
      { speaker:'Mikkel', text:'(This cat has seen things. Probably judges everyone who comes through.)' },
    ]},
    { id:'bird', col:25, row:22, sprite:'firefly', dialog:[
      { speaker:'Songbird', text:'*unnecessarily beautiful melody*' },
      { speaker:'Mikkel', text:'(Even the birds here are dramatic. It\'s Italy, I guess.)' },
    ]},
    { id:'farmer', col:10, row:42, sprite:'merchant', dialog:[
      { speaker:'Farmer', text:'The florist wants bread. The baker has too much. You see where this is going.' },
    ]},
  ],
  envInteractions: [
    { col:15,row:3,id:'olive_tree',text:'(Olive tree older than my entire country. Respect.)' },
    { col:35,row:5,id:'bell_tower',text:'(Bell tower. She\'d count the chimes. I\'d count her freckles. Wait, what?)' },
    { col:8,row:12,id:'canal_wall',text:'(Water blocks the path. There\'s always a switch. There\'s always a switch.)' },
    { col:40,row:15,id:'lever_hint',text:'(A mechanism! Pull it? Push it? I love puzzles. (I hate puzzles.))' },
    { col:15,row:23,id:'orb_glow',text:'(Purple glow between the trees. Memory fragments. Drama queen memories.)' },
    { col:35,row:28,id:'stone_arch',text:'(Stone arch. Gate sealed. Three orbs should do it. Probably.)' },
    { col:5,row:35,id:'fog_edge',text:'(Thick fog. Clears when I walk. Very cinematic. Very humid.)' },
    { col:38,row:38,id:'mosaic_floor',text:'(Sunflower mosaic on the floor. I\'m going the right way! For once!)' },
    { col:25,row:45,id:'market_smell',text:'(Bread and basil. My stomach just filed a formal complaint.)' },
    { col:44,row:52,id:'cliff_path',text:'(Narrow path. Again with the cliffs. Denmark 2: Italian Edition.)' },
    { col:25,row:55,id:'almost',text:'(There it is. The sunflower. Don\'t trip. DON\'T trip, Mikkel.)' },
  ],
  memoryItem: { id:'italian_sunflower', name:'Italian Sunflower', flavor:'Seven flowers. Seven cities. Seven times I proved I\'d do something ridiculous for her.' },
  music: { tempo:110, key:'major', mood:'triumphant' }, ambience: 'evening_bells',
  intro: [
    { speaker:'Mikkel', text:'Italy. Her Italy. Piedmont hills at golden hour. Offensively pretty.' },
    { speaker:'Mikkel', text:'Everything I\'ve done so far... sneaking, swimming, trading... it all ends here.' },
    { speaker:'Mikkel', text:'The sunflower is at the bottom. Then the bouquet is complete. Then I have to talk to her. Oh no.' },
    { speaker:'Mikkel', text:'(This level has everything. Stealth, puzzles, orbs, fog, trading, cliffs. The full Mikkel Experience.)' },
  ],
};

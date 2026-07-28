/**
 * sprites.js - Sprite pixel definitions
 */

// Player sprite (16×16)
export const SPR_PLAYER = [
  '....222222......',
  '...2222222.....',
  '...22222222....',
  '...1111111.....',
  '...1v11v11.....',
  '...1111111.....',
  '...11111.......',
  '....33333......',
  '...3333333.....',
  '...3333333.....',
  '...33.6.33.....',
  '...333633......',
  '....44444......',
  '...4444444.....',
  '...44..44......',
  '...55..55......',
];

// Girl sprite (16×16) - Stefy
export const SPR_GIRL = [
  '...8888888......',
  '..888888888.....',
  '..888888888.....',
  '..8111111188....',
  '..81v11v1188....',
  '..81111111.8....',
  '..81111118.8....',
  '..8.77777..8....',
  '..8.99999..8....',
  '..8.99999..8....',
  '...999999998....',
  '...9999999......',
  '...9999999......',
  '...99..99.......',
  '...11..11.......',
  '...55..55.......',
];

// NPC base (parameterized: H=hair, S=shirt, P=pants)
export const SPR_NPC = [
  '....HHHHHH.....',
  '...HHHHHHHH....',
  '...HHHHHHHH....',
  '...1111111.....',
  '...1v11v11.....',
  '...1111111.....',
  '...1111111.....',
  '....SSSSSS.....',
  '...SSSSSSSS....',
  '...SSSSSSSS....',
  '...SS....SS....',
  '...SSSSSSSS....',
  '....PPPPPP.....',
  '...PPPPPPPP....',
  '...PP....PP....',
  '...55....55....',
];

// Flower sprite (16×16, parameterized: b=petals, u=center, c=stem)
// Generic fallback shape
export const SPR_FLOWER = [
  '................',
  '....bb..bb......',
  '...bbbbbbbb.....',
  '...bbbbbbbb.....',
  '...bbbuubbb.....',
  '...bbbuubbb.....',
  '...bbbbbbbb.....',
  '....bb..bb......',
  '.......cc.......',
  '.......cc.......',
  '......cccc......',
  '.......cc.......',
  '.......cc.......',
  '.......cc.......',
  '......ccc.......',
  '................',
];

// 7 unique flower shapes - cute pixel art with big blooms, tiny stems
// Mostly bloom (rows 0-11), tiny stem/leaf (rows 12-15)
// Letters: b=petal, u=center/highlight, c=stem

// 0: Cherry Blossom - 5 round overlapping petals, gold center
export const SPR_CHERRY_BLOSSOM = [
  '......bbb.......',
  '.....bbbbb......',
  '....bbbbbbb.....',
  '..bbbbbbbbbbb...',
  '.bbbbb.u.bbbbb..',
  '.bbbbb.u.bbbbb..',
  '.bbbbbuuubbbb...',
  '.bbbbb.u.bbbbb..',
  '.bbbbb.u.bbbbb..',
  '..bbbbbbbbbbb...',
  '....bbbbbbb.....',
  '.....bbbbb......',
  '......ccc.......',
  '......ccc.......',
  '.....ccccc......',
  '................',
];

// 1: Golden Tulip - smooth cup shape, warm gradient
export const SPR_TULIP = [
  '................',
  '......ubb.......',
  '.....uubbb......',
  '....uuubbbb.....',
  '...uuuubbbbb....',
  '...buuubbbbb....',
  '...bbbbbbbbb....',
  '...bbbbbbbbb....',
  '....bbbbbbb.....',
  '.....bbbbb......',
  '......bbb.......',
  '......ccc.......',
  '......ccc.......',
  '.....ccccc......',
  '................',
  '................',
];

// 2: Silver Lavender - cluster of tiny buds on spike
export const SPR_LAVENDER = [
  '.......b........',
  '......bub.......',
  '.....bbbbb......',
  '....bbubbbb.....',
  '...bbbbbbbbb....',
  '...bbubbbubb....',
  '...bbbbbbbbb....',
  '....bbubbbb.....',
  '.....bbbbb......',
  '......bub.......',
  '.......b........',
  '......ccc.......',
  '......ccc.......',
  '.....ccccc......',
  '................',
  '................',
];

// 3: Rainbow Orchid - butterfly-wing petals, spotted center
export const SPR_ORCHID = [
  '................',
  '..bbb....bbb....',
  '.bbbbb..bbbbb...',
  '.bbbbb..bbbbb...',
  '..bbbbbbbbb.....',
  '...bbuuubb......',
  '..bbuububbb.....',
  '...bbuuubb......',
  '..bbbbbbbbb.....',
  '.bbb......bbb...',
  '.bb........bb...',
  '......ccc.......',
  '......ccc.......',
  '.....ccccc......',
  '................',
  '................',
];

// 4: Desert Rose - concentric layered petals, warm red
export const SPR_DESERT_ROSE = [
  '................',
  '....bbbbbbb.....',
  '...bbbbbbbbb....',
  '..bbbb.b.bbbb...',
  '..bbb.uuu.bbb...',
  '.bbbb.uuu.bbbb..',
  '.bbbb.uuu.bbbb..',
  '..bbb.uuu.bbb...',
  '..bbbb.b.bbbb...',
  '...bbbbbbbbb....',
  '....bbbbbbb.....',
  '......ccc.......',
  '......ccc.......',
  '.....ccccc......',
  '................',
  '................',
];

// 5: Arctic Poppy - big round bloom, dark ring around center
export const SPR_POPPY = [
  '................',
  '....bbbbbbb.....',
  '...bbbbbbbbb....',
  '..bbbbbbbbbbb...',
  '..bbbbbbbbbbb...',
  '..bbbbuuubbbb...',
  '..bbbbuuubbbb...',
  '..bbbbuuubbbb...',
  '..bbbbbbbbbbb...',
  '...bbbbbbbbb....',
  '....bbbbbbb.....',
  '......ccc.......',
  '......ccc.......',
  '.....ccccc......',
  '................',
  '................',
];

// 6: Italian Sunflower - big dark center, pointed ray petals
export const SPR_SUNFLOWER = [
  '.b..b..b..b..b..',
  '..bb.bb.bb.bb...',
  '..bbbbbbbbbbb...',
  '.bbbbuuuuubbbb..',
  '.bbbbuuuuubbbb..',
  '.bbbbuuuuubbbb..',
  '.bbbbuuuuubbbb..',
  '.bbbbuuuuubbbb..',
  '..bbbbbbbbbbb...',
  '..bb.bb.bb.bb...',
  '.b..b..b..b..b..',
  '......ccc.......',
  '......ccc.......',
  '.....ccccc......',
  '................',
  '................',
];

// All flower sprites indexed by flower number
export const FLOWER_SPRITES = [
  SPR_CHERRY_BLOSSOM,
  SPR_TULIP,
  SPR_LAVENDER,
  SPR_ORCHID,
  SPR_DESERT_ROSE,
  SPR_POPPY,
  SPR_SUNFLOWER,
];

// NPC style configs: [hairPalIdx, shirtPalIdx, pantsPalIdx]
export const NPC_STYLES = [
  [36, 37, 38],  // Japanese gardener
  [23, 24, 19],  // Dutch farmer / Icelandic hiker
  [9, 25, 5],    // French painter
  [5, 11, 26],   // Brazilian guide
];

// Flower color configs: [petalPalIdx, centerPalIdx, stemPalIdx]
export const FLOWER_COLORS = [
  [39, 30, 12],  // Cherry Blossom (pink petals, golden center, dark green stem)
  [33, 28, 12],  // Golden Tulip (yellow petals, orange center, dark green stem)
  [20, 7, 12],   // Silver Lavender (purple petals, white center, dark green stem)
  [29, 27, 12],  // Rainbow Orchid (cyan petals, purple center, dark green stem)
  [9, 33, 12],   // Desert Rose (red petals, yellow center, dark green stem)
  [33, 5, 12],   // Arctic Poppy (yellow petals, black center, dark green stem)
  [28, 6, 12],   // Italian Sunflower (orange petals, brown center, dark green stem)
];

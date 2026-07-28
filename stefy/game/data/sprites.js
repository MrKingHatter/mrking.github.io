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
  '..88888888......',
  '.8888888888.....',
  '.8888888888.....',
  '.881111118......',
  '.881v11v188.....',
  '.8811111188.....',
  '.8811111188.....',
  '.888777788......',
  '.889999988......',
  '..89999988......',
  '..89999988......',
  '..88999888......',
  '...999999.......',
  '...99..99.......',
  '...11..11.......',
  '...55..55.......',
];

// NPC base (parameterized: H=hair, S=shirt, P=pants)
export const SPR_NPC = [
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '...HHHHHHHH.....',
  '...1111111......',
  '...1v11v11......',
  '...1111111......',
  '...1111111......',
  '....SSSSSS......',
  '...SSSSSSSS.....',
  '...SSSSSSSS.....',
  '...SS....SS.....',
  '...SSSSSSSS.....',
  '....PPPPPP......',
  '...PPPPPPPP.....',
  '...PP....PP.....',
  '...55....55.....',
];

// Robed/elderly NPC (long robe, no visible pants)
export const SPR_NPC_ROBED = [
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '...HHHHHHHH.....',
  '...1111111......',
  '...1v11v11......',
  '...1111111......',
  '...1111111......',
  '....SSSSSS......',
  '...SSSSSSSS.....',
  '...SSSSSSSS.....',
  '...SSSSSSSS.....',
  '...SSSSSSSS.....',
  '...SSSSSSSS.....',
  '...SS.SS.SS.....',
  '...SS.SS.SS.....',
  '...55....55.....',
];

// Small animal (cat, seagull shape — H=body, S=highlight, P=tail/feet)
export const SPR_ANIMAL_SMALL = [
  '................',
  '................',
  '................',
  '................',
  '...HH...HH......',
  '...HHHHHH.......',
  '..HHHHHHHH......',
  '..HHSHSHSHH.....',
  '..HHvHHvHH......',
  '..HHHHHHHH......',
  '..HHHHHHHHPP....',
  '..HHHHHHHH.P....',
  '..HHHHHHHH......',
  '...HHHHHH.......',
  '...PP..PP.......',
  '................',
];

// Large animal (camel shape — H=body, S=hump/mane, P=legs)
export const SPR_ANIMAL_LARGE = [
  '................',
  '................',
  '.....SSS........',
  '..HHHSSSHHH.....',
  '..HHHHHHHHH.....',
  '.HHHHHHHHHH.....',
  '.HHvHHHHHHH.....',
  '.HHHHHHHHHHH....',
  '.HHHHHHHHHHH....',
  '.HHHHHHHHHHH....',
  '..HHHHHHHHHH....',
  '..PP..PP..PP....',
  '..PP..PP..PP....',
  '..PP..PP..PP....',
  '................',
  '................',
];

// Bird (parrot/macaw — H=body, S=wing, P=beak/feet)
export const SPR_ANIMAL_BIRD = [
  '................',
  '................',
  '................',
  '....HHHH........',
  '...HHHHHH.......',
  '...HHvvHH.......',
  '..PPHHHH........',
  '..P.HHHH........',
  '....SSSSSS......',
  '...SSHHHSS......',
  '...SSHHHHSS.....',
  '...SSHHHHSS.....',
  '....HHHHHH......',
  '.....HHHH.......',
  '....PP.PP.......',
  '................',
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
// NPC style configs: [hairPalIdx, shirtPalIdx, pantsPalIdx, spriteType]
// spriteType: 0=normal, 1=robed, 2=small animal, 3=large animal, 4=bird
export const NPC_STYLES = [
  [36, 37, 38, 0],    // 0: Old Gardener (white hair, blue-grey outfit)
  [23, 11, 4, 0],     // 1: Farmer Hans (blonde, green shirt, dark pants)
  [9, 25, 19, 0],     // 2: Painter Marie (red hair, purple shirt, grey pants)
  [5, 11, 26, 0],     // 3: Guide Carlos (black hair, green shirt, jungle pants)
  [5, 7, 21, 1],      // 4: Merchant Youssef (black hair, white robe)
  [23, 3, 4, 0],      // 5: Fisherman Lars (blonde, blue shirt, dark pants)
  [36, 37, 38, 1],    // 6: Monk (white hair, grey robe)
  [28, 28, 5, 2],     // 7: Cat (orange body, orange highlight, black feet)
  [7, 6, 11, 0],      // 8: Baker Pierre (white hat, brown apron, green pants)
  [9, 3, 33, 4],      // 9: Macaw/Parrot (red body, blue wing, yellow beak)
  [21, 6, 5, 3],      // 10: Camel (sand body, brown hump, black legs)
  [7, 34, 28, 2],     // 11: Seagull (white body, grey wing, orange feet)
  [36, 20, 19, 1],    // 12: Old Lady Inge (white hair, lavender dress)
  [36, 9, 5, 1],      // 13: Nonna Rosa (white hair, red dress)
];

// Flower color configs: [petalPalIdx, centerPalIdx, stemPalIdx]
export const FLOWER_COLORS = [
  [39, 30, 12],  // Cherry Blossom (pink petals, golden center, dark green stem)
  [33, 28, 12],  // Golden Tulip (yellow petals, orange center, dark green stem)
  [20, 7, 12],   // Silver Lavender (purple petals, white center, dark green stem)
  [29, 27, 12],  // Rainbow Orchid (cyan petals, purple center, dark green stem)
  [9, 33, 12],   // Desert Rose (red petals, yellow center, dark green stem)
  [14, 3, 12],   // Danish Bluebell (blue petals, dark blue center, dark green stem)
  [28, 6, 12],   // Italian Sunflower (orange petals, brown center, dark green stem)
];

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
  '...8888888.....',
  '..888888888....',
  '..888888888....',
  '..8111111188...',
  '...1v11v11.....',
  '...1111111.....',
  '..81111118.....',
  '....77777......',
  '...9999999.....',
  '...9999999.....',
  '...9999999.....',
  '...9999999.....',
  '...9999999.....',
  '...99..99......',
  '...11..11......',
  '...55..55......',
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

// NPC style configs: [hairPalIdx, shirtPalIdx, pantsPalIdx]
export const NPC_STYLES = [
  [36, 37, 38],  // Japanese gardener
  [23, 24, 19],  // Dutch farmer / Icelandic hiker
  [9, 25, 5],    // French painter
  [5, 11, 26],   // Brazilian guide
];

// Flower color configs: [petalPalIdx, centerPalIdx, stemPalIdx]
export const FLOWER_COLORS = [
  [39, 30, 11],  // Cherry Blossom (pink)
  [33, 30, 11],  // Golden Tulip
  [27, 30, 11],  // Silver Lavender
  [29, 30, 11],  // Rainbow Orchid
  [9, 30, 11],   // Desert Rose (red)
  [33, 7, 11],   // Arctic Poppy (yellow/white)
  [28, 30, 11],  // Italian Sunflower (orange)
];

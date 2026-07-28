# Flowers for Stefy -- Level Design Document

## Overview

**Flowers for Stefy** is a pixel art adventure game where the protagonist Mikkel travels through 7 real-world locations collecting rare flowers for Stefy. Each level features:

- A **50x30 tile map** (1600x960px world) with camera scrolling
- An **NPC with an English riddle** presented as multiple-choice (except the final level)
- A **quest item** to find and return to the NPC
- A **hidden flower** revealed only after completing the quest
- **Self-talk hints** guiding the player at key moments

The game teaches English vocabulary and wordplay through interactive riddles with 3 answer options. Stefy is learning English, so each riddle is designed to be fun and educational.

---

## Game Mechanics

### Riddle System

After the NPC delivers their dialog, a **multiple-choice riddle** appears:
- 3 options displayed in the dialog box
- Navigate with **Up/Down arrows**, confirm with **Space**
- Wrong answers show a helpful hint and let you try again
- Correct answer unlocks the fetch quest

### Self-Talk & Hint System

Mikkel provides inner monologue at key moments:
- **After intro:** hints where to go first
- **After NPC riddle (auto):** tells player *what* to find
- **On-demand (Press H):** tells player *where* to look
- **After picking up quest item:** reminds to return it

The "where" hint is never shown automatically -- a pulsing **"Press H for hint"** indicator appears in the HUD after the auto-hint.

### Flower Sprites

Each flower has a **unique pixel art shape** for visual variety and a satisfying final bouquet:

| # | Flower | Shape | Colors |
|---|--------|-------|--------|
| 1 | Cherry Blossom | 5 delicate round petals | Pink + gold center |
| 2 | Golden Tulip | Cup/U shape | Yellow + orange center |
| 3 | Silver Lavender | Tall spike of tiny buds | Purple + white |
| 4 | Rainbow Orchid | Exotic asymmetric petals | Cyan + purple center |
| 5 | Desert Rose | Layered circular petals | Red + yellow center |
| 6 | Danish Bluebell | Bell-shaped drooping bloom | Blue + dark blue center |
| 7 | Italian Sunflower | Large center + ray petals | Orange + brown center |

---

## Chapter 1: Tokyo Garden, Japan

**Flower:** Cherry Blossom (pink, 5-petal shape)
**Quest Item:** Old Garden Clock
**NPC:** Old Gardener (at 8, 7)

### Riddle

> "I have hands but cannot clap. I have a face but cannot smile. What am I?"

| Option | Correct? |
|--------|----------|
| A clock | Yes |
| A snowman | No |
| A puppet | No |

*Wrong answer hint:* "Think about what tells you the time..."

### Flow

1. Spawns at (5, 13). Intro: "I should talk to the gardener over there."
2. Talks to Old Gardener at (8, 7) who poses the riddle
3. Answers correctly --> Gardener asks for the old clock
4. Finds **Old Garden Clock** at (44, 28) in the south-eastern corner
5. Returns it --> Cherry Blossom revealed at (8, 17)

### Design Notes

- **Setting:** Traditional Japanese zen garden with pagoda walls.
- **Riddle:** "Clock" - polysemy of "hands" and "face". Gentle opener.
- **Difficulty:** Easy.

---

## Chapter 2: Dutch Countryside, Netherlands

**Flower:** Golden Tulip (cup-shaped)
**Quest Item:** Toy Windmill
**NPC:** Farmer Hans (at 6, 3)

### Riddle

> "What has wings but cannot fly, and spins but is not alive?"

| Option | Correct? |
|--------|----------|
| A windmill | Yes |
| A helicopter | No |
| A pinwheel toy | No |

*Wrong answer hint:* "Look around - what is Holland famous for?"

### Flow

1. Spawns at (5, 22). Navigates north across bridges over canals.
2. Finds Farmer Hans at (6, 3)
3. Answers riddle --> Hans asks for his daughter's lost toy windmill
4. Finds **Toy Windmill** at (35, 21) far to the east near canals
5. Returns it --> Golden Tulip revealed at (45, 1) north-east

### Design Notes

- **Setting:** Flat Dutch polders with horizontal canal bands and bridges.
- **Riddle:** Environmental -- windmills are visible everywhere in Netherlands.
- **Difficulty:** Medium. Bridge-finding adds navigation complexity.

---

## Chapter 3: Provence, France

**Flower:** Silver Lavender (tall spike shape)
**Quest Item:** Smooth Brook Stone
**NPC:** Painter Marie (at 5, 3)

### Riddle

> "What gets wetter the more it dries?"

| Option | Correct? |
|--------|----------|
| A sponge | No |
| A towel | Yes |
| The rain | No |

*Wrong answer hint:* "Think - what do you use AFTER a bath?"

### Flow

1. Spawns at (8, 10). Self-talk: "I can see someone painting to the north."
2. Finds Painter Marie at (5, 3)
3. Answers riddle --> Marie asks for a smooth stone from the brook
4. Finds **Smooth Brook Stone** at (42, 15) far to the east
5. Returns it --> Silver Lavender revealed at (46, 9)

### Design Notes

- **Setting:** French lavender countryside. Stone walls divide zones.
- **Riddle:** Dual meaning of "dries" -- towel dries you but becomes wet.
- **Difficulty:** Medium.

---

## Chapter 4: Amazon Jungle, Brazil

**Flower:** Rainbow Orchid (exotic asymmetric shape)
**Quest Item:** Sturdy Vine Rope
**NPC:** Guide Carlos (at 4, 8)

### Riddle

> "What has a head and a tail but no body?"

| Option | Correct? |
|--------|----------|
| A snake | No |
| A coin | Yes |
| A river | No |

*Wrong answer hint:* "Think smaller - something in your pocket!"

### Flow

1. Spawns at (3, 3). Self-talk: "I can see someone on the path below."
2. Talks to Guide Carlos at (4, 8) who needs rope to fix a vine bridge
3. Answers riddle --> Carlos says rope is to the south
4. Finds **Sturdy Vine Rope** at (4, 20) straight south on the path
5. Returns it --> Rainbow Orchid revealed at (47, 28) far south-east

### Design Notes

- **Setting:** Dense Amazon rainforest with winding river and narrow corridors.
- **Riddle:** Teaches "heads" and "tails" for coin sides.
- **Difficulty:** Hard. Dense canopy, narrow paths.

---

## Chapter 5: Sahara Edge, Morocco

**Flower:** Desert Rose (layered petal shape)
**Quest Item:** Brass Spyglass
**NPC:** Merchant Youssef (at 10, 6)

### Riddle

> "The more you take away from me, the bigger I get. What am I?"

| Option | Correct? |
|--------|----------|
| The sky | No |
| A shadow | No |
| A hole | Yes |

*Wrong answer hint:* "When you dig in the sand, what happens?"

### Flow

1. Spawns at (4, 8). Self-talk: "I see someone by the path ahead."
2. Finds Merchant Youssef at (10, 6)
3. Answers riddle --> Youssef asks for a brass spyglass from the oasis
4. Finds **Brass Spyglass** at (28, 25) near the oasis
5. Returns it --> Desert Rose revealed at (48, 1) far north

### Design Notes

- **Setting:** Moroccan Sahara -- sand dunes, rocky outcrops, palm oasis.
- **Riddle:** "A hole" -- simple, physical, hint makes it obvious.
- **Difficulty:** Medium-Hard. Open desert with less wall-guidance.

---

## Chapter 6: White Cliffs, Denmark

**Flower:** Danish Bluebell (bell-shaped, blue)
**Quest Item:** Lost Compass
**NPC:** Fisherman Lars (at 6, 7)

### Riddle

> "I can be cracked, made, told, and played. What am I?"

| Option | Correct? |
|--------|----------|
| A joke | Yes |
| A secret | No |
| An egg | No |

*Wrong answer hint:* "What makes people laugh?"

### Flow

1. Spawns at (3, 4). Self-talk: "There's a fisherman resting near the rocks."
2. Finds Fisherman Lars at (6, 7) who lost his compass in a storm
3. Answers riddle --> Lars tells a flower pun, asks for the compass
4. Finds **Lost Compass** at (38, 10) in the eastern rocks
5. Returns it --> Danish Bluebell revealed at (47, 28) south-eastern cliffs

### Design Notes

- **Setting:** Danish white cliffs, grey sea (coastal lake), chalk rocks.
- **Riddle:** "A joke" -- teaches collocations (crack/make/tell/play a joke). Lars rewards with actual jokes.
- **Difficulty:** Medium-Hard. Rocky terrain blends visually.

---

## Chapter 7: Piedmont, Italy (Finale)

**Flower:** Italian Sunflower (large sunflower shape)
**Quest Item:** None
**NPC:** Nonna Rosa (at 7, 7) -- optional flavor dialog

### What the Player Does

1. Spawns at (8, 12). Self-talk: "I can see a bright sunflower in the fields to the north! And there... Stefy near the villa!"
2. Optionally talks to Nonna Rosa who encourages Mikkel
3. Picks up the **Italian Sunflower** at (20, 5) -- visible, NOT hidden
4. Walks to Stefy at (12, 10)
5. Ending dialog: Mikkel gives Stefy all 7 flowers and they go for gelato

### Design Notes

- **Setting:** Piedmont camping village with boutiques, sunflower fields, winding paths.
- **No riddle:** This is the emotional payoff. No barriers after 6 levels of challenges.
- **Flower is visible:** Signals "you've earned this -- take it freely."
- **The ending dialog** recounts every flower and every country, turning the journey into a heartfelt moment.

---

## Design Philosophy

### Riddle Design Principles

All riddles are designed to be:
1. **Solvable** -- the correct answer should feel obvious in hindsight
2. **Educational** -- each teaches a specific English language concept
3. **Hinted** -- wrong answers give a clear nudge toward the right one
4. **Fun** -- not frustrating, just engaging

| Level | Riddle Answer | English Concept |
|-------|--------------|-----------------|
| 1 | A clock | Polysemy ("hands" and "face" have multiple meanings) |
| 2 | A windmill | Vocabulary (wings, spins, alive) |
| 3 | A towel | Wordplay (dual meaning of "dries") |
| 4 | A coin | Idiom ("heads or tails") |
| 5 | A hole | Logical paradox in English |
| 6 | A joke | Collocations (cracked, made, told, played) |

### Progressive Difficulty

| Level | Navigation | Quest Complexity | Map Openness |
|-------|-----------|-----------------|--------------|
| 1 | Linear paths | Simple fetch | Semi-enclosed |
| 2 | Bridge crossings | Fetch + distance | Canal corridors |
| 3 | Wall barriers | Fetch + direction | Split zones |
| 4 | Dense corridors | Fetch + max distance | Labyrinthine |
| 5 | Open desert | Fetch + exploration | Wide open |
| 6 | Rocky blending | Fetch + callback humor | Semi-open |
| 7 | Free movement | None | Fully open |

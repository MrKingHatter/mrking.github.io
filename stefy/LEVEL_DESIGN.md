# Flowers for Stefy -- Level Design Document

## Overview

**Flowers for Stefy** is a pixel art adventure game where the protagonist Mikkel travels through 7 real-world locations collecting rare flowers for Stefy (who is learning English). Each level features:

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
- **After intro:** hints where to go first ("I should talk to the gardener")
- **After NPC riddle (auto):** tells player *what* to find ("I need to find rope to fix the bridge")
- **On-demand (Press H):** tells player *where* to look ("He left it to the south, along the river path")
- **After picking up quest item:** reminds to return it

The "where" hint is never shown automatically -- a pulsing **"Press H for hint"** indicator appears in the HUD after the auto-hint. This avoids hand-holding players who want to explore, while keeping help accessible.

### Flower Sprites

Each flower has a **unique pixel art shape** for visual variety and a satisfying final bouquet:

| # | Flower | Shape | Colors |
|---|--------|-------|--------|
| 1 | Cherry Blossom | 5 delicate round petals | Pink + gold center |
| 2 | Golden Tulip | Cup/U shape | Yellow + orange center |
| 3 | Silver Lavender | Tall spike of tiny buds | Purple + white |
| 4 | Rainbow Orchid | Exotic asymmetric petals | Cyan + purple center |
| 5 | Desert Rose | Layered circular petals | Red + yellow center |
| 6 | Arctic Poppy | Large simple round bloom | Yellow + black center |
| 7 | Italian Sunflower | Large center + ray petals | Orange + brown center |

---

## Chapter 1: Tokyo Zen Garden, Japan

**Flower:** Cherry Blossom (pink, 5-petal shape)
**Quest Item:** Old Garden Clock
**NPC:** Old Gardener

### Riddle

> "I have hands but cannot clap. I have a face but cannot smile. What am I?"

| Option | Correct? |
|--------|----------|
| A clock | Yes |
| A snowman | No |
| A puppet | No |

*Wrong answer hint:* "Think about what tells you the time..."

### What the Player Does

1. Spawns at (5, 13). Self-talk: "I should talk to the gardener over there."
2. Talks to the Old Gardener at (8, 7) who poses the riddle
3. Answers correctly --> Gardener says to find the old clock in the eastern garden
4. Self-talk (auto): "A clock... I need to find one and bring it back."
5. *Press H*: "I should search the eastern garden paths."
6. Finds the **Old Garden Clock** at (44, 28) in the far east
7. Returns it --> Cherry Blossom revealed at (8, 17) inside the walled garden

### Design Reasoning

- **Setting:** Traditional Japanese zen garden with pagoda walls creating a physical barrier around the flower.
- **Riddle:** "Clock" is simple and visual. The double meaning of "hands" and "face" introduces English wordplay gently. Good opening puzzle.
- **Difficulty:** Easy. Clear paths, introduces the core loop (talk -> riddle -> find -> return -> collect).

---

## Chapter 2: Dutch Countryside, Netherlands

**Flower:** Golden Tulip (cup-shaped)
**Quest Item:** Toy Windmill
**NPC:** Farmer Hans

### Riddle

> "What has wings but cannot fly, and spins but is not alive?"

| Option | Correct? |
|--------|----------|
| A windmill | Yes |
| A helicopter | No |
| A pinwheel toy | No |

*Wrong answer hint:* "Look around - what is Holland famous for?"

### What the Player Does

1. Spawns at (5, 22) in the southern canal area. Self-talk: "I need to cross the bridges north."
2. Navigates north across bridges over canals to find Farmer Hans at (6, 3)
3. Answers the riddle --> Hans asks for his daughter's lost toy windmill
4. Self-talk (auto): "I need to find a toy windmill and bring it back."
5. *Press H*: "He said it's near the southern canals."
6. Searches for the **Toy Windmill** at (35, 21) along the middle canal paths
7. Returns it --> Golden Tulip revealed at (45, 1) in the far north-east

### Design Reasoning

- **Setting:** Flat Dutch polders with horizontal canal bands and bridges forcing specific crossing points.
- **Riddle:** Environmental -- the answer is literally visible all around the Netherlands. Teaches English vocabulary for mechanical parts (wings, spins).
- **Difficulty:** Medium. Bridge-finding adds navigation complexity.

---

## Chapter 3: Provence, France

**Flower:** Silver Lavender (tall spike shape)
**Quest Item:** Smooth Brook Stone
**NPC:** Painter Marie

### Riddle

> "What gets wetter the more it dries?"

| Option | Correct? |
|--------|----------|
| A sponge | No |
| A towel | Yes |
| The rain | No |

*Wrong answer hint:* "Think - what do you use AFTER a bath?"

### What the Player Does

1. Spawns at (8, 10). Self-talk: "I can see someone painting to the north."
2. Finds Painter Marie at (5, 3) who needs help with an English word
3. Answers the riddle --> Marie asks for a smooth stone from the brook to the east
4. Self-talk (auto): "She needs a smooth stone from the brook. I should find one."
5. *Press H*: "The brook is to the east. I'll follow the path and look for water."
6. Travels east to find the **Smooth Brook Stone** at (42, 15) near the water
7. Returns it --> Silver Lavender revealed at (46, 9) past the stone wall

### Design Reasoning

- **Setting:** French lavender countryside. Stone walls divide the map into zones.
- **Riddle:** Classic and well-known. Plays on the dual meaning of "dries" -- the towel dries you but becomes wet itself. Easy to understand with the hint.
- **Difficulty:** Medium. The stone wall forces path-finding.

---

## Chapter 4: Amazon Jungle, Brazil

**Flower:** Rainbow Orchid (exotic asymmetric shape)
**Quest Item:** Sturdy Vine Rope
**NPC:** Guide Carlos

### Riddle

> "What has a head and a tail but no body?"

| Option | Correct? |
|--------|----------|
| A snake | No |
| A coin | Yes |
| A river | No |

*Wrong answer hint:* "Think smaller - something in your pocket!"

### What the Player Does

1. Spawns at (3, 3). Self-talk: "I can see someone on the path below."
2. Talks to Guide Carlos at (4, 8) who needs rope to fix a vine bridge
3. Answers the riddle --> Carlos says the rope is to the south along the river
4. Self-talk (auto): "I need to find rope to fix the bridge."
5. *Press H*: "He left it to the south, along the river path."
6. Follows the path south to find **Sturdy Vine Rope** at (4, 20)
7. Returns it --> Rainbow Orchid revealed at (47, 28) far south-east

### Design Reasoning

- **Setting:** Dense Amazon rainforest with a winding river and narrow corridors.
- **Riddle:** "Coin" -- teaches the English terms "heads" and "tails" for coin sides. The wrong answers are good distractors (snakes and rivers both have "heads" in some sense).
- **Difficulty:** Hard. Dense canopy, narrow paths, maximum traversal distance.

---

## Chapter 5: Sahara Edge, Morocco

**Flower:** Desert Rose (layered petal shape)
**Quest Item:** Old Compass
**NPC:** Merchant Youssef

### Riddle

> "The more you take away from me, the bigger I get. What am I?"

| Option | Correct? |
|--------|----------|
| The sky | No |
| A shadow | No |
| A hole | Yes |

*Wrong answer hint:* "When you dig in the sand, what happens?"

### What the Player Does

1. Spawns at (4, 8). Self-talk: "I see someone by the path ahead."
2. Finds Merchant Youssef at (10, 6) who wants a trade
3. Answers the riddle --> Youssef asks for an old compass from the oasis
4. Self-talk (auto): "He wants an old compass in exchange. I need to find it."
5. *Press H*: "The oasis is to the south-east. It has water and bushes."
6. Travels south-east to find the **Old Compass** at (28, 25) near the oasis
7. Returns it --> Desert Rose revealed at (48, 1) at the far northern path

### Design Reasoning

- **Setting:** Moroccan Sahara -- sand dunes, rocky outcrops, and a palm oasis.
- **Riddle:** "A hole" -- simple, physical, and the hint makes it obvious (digging in sand). The wrong answers both seem plausible at first.
- **Difficulty:** Medium-Hard. Open desert with less wall-guidance.

---

## Chapter 6: Volcanic Fields, Iceland

**Flower:** Arctic Poppy (large round shape)
**Quest Item:** Lost Compass
**NPC:** Hiker Sigrid

### Riddle

> "I can be cracked, made, told, and played. What am I?"

| Option | Correct? |
|--------|----------|
| A joke | Yes |
| A secret | No |
| An egg | No |

*Wrong answer hint:* "What makes people laugh?"

### What the Player Does

1. Spawns at (3, 4). Self-talk: "There's a hiker resting near the rocks."
2. Finds Hiker Sigrid at (6, 7) who lost her compass
3. Answers the riddle --> Sigrid tells a flower pun as reward, then asks for the compass
4. Self-talk (auto): "She lost her compass. I need to find it for her."
5. *Press H*: "It fell somewhere in the eastern rocks."
6. Explores east to find the **Lost Compass** at (38, 10)
7. Returns it --> Sigrid tells another joke, Arctic Poppy revealed at (47, 28)

### Design Reasoning

- **Setting:** Iceland's volcanic landscape -- black rock, moss patches, hot springs.
- **Riddle:** "A joke" -- teaches English collocations (crack a joke, make a joke, tell a joke, play a joke). Sigrid's personality rewards the answer with actual jokes.
- **Difficulty:** Medium-Hard. Rocky terrain blends together visually.

---

## Chapter 7: Piedmont, Italy (Finale)

**Flower:** Italian Sunflower (sunflower shape with large center)
**Quest Item:** None
**NPC:** None (Stefy is here!)

### What the Player Does

1. Spawns at (8, 12). Self-talk: "I can see a bright sunflower in the fields to the north! And there... Stefy near the villa!"
2. Picks up the **Italian Sunflower** at (20, 5) -- visible, NOT hidden
3. Walks to Stefy at (12, 10)
4. Ending dialog: Mikkel gives Stefy all 7 flowers and they reunite

### Design Reasoning

- **No riddle:** This is the emotional payoff. No barriers after 6 levels of challenges.
- **Flower is visible:** Signals "you've earned this -- take it freely."
- **The ending dialog** recounts every flower and every country, turning the journey into a declaration of love.

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

### World Journey Arc

The locations trace a deliberate geographic/emotional arc:
- **Japan** -> Wonder and discovery (far east, exotic)
- **Netherlands** -> Charm and warmth (northern Europe)
- **France** -> Art and beauty (Mediterranean)
- **Brazil** -> Adventure and danger (tropical)
- **Morocco** -> Mystery and trade (desert)
- **Iceland** -> Resilience and humor (sub-arctic)
- **Italy** -> Home and love (Stefy's homeland)

The journey moves from exotic/distant toward familiar/home, mirroring Mikkel's emotional journey from longing to reunion.

### The Bouquet

The 7 distinct flower shapes combine into a visually varied bouquet:
- Vertical variety: tall lavender spike, short round poppy, medium tulip cup
- Color spread: pink, yellow, purple, cyan, red, yellow, orange
- Shape contrast: symmetrical (rose, poppy) vs asymmetrical (orchid) vs radial (sunflower)

This ensures the ending moment feels like a real, diverse collection -- not just 7 recolors of the same sprite.

import React, { useState, useEffect, useCallback } from 'react';
import Scene from './Scene';
import Inventory from './Inventory';
import PlayerStats from './PlayerStats';

// Enemy data
const enemies = {
  shadowFiend: {
    name: "Shadow Fiend",
    description: "A writhing mass of darkness that seems to absorb all light around it. Its form shifts constantly, occasionally revealing glimpses of faces frozen in terror.",
    damage: 15,
    sanityCost: 20,
    weakness: "light",
    requiredItem: "flashlight",
    escapeChance: 40,
    escapeDamage: 5,
    escapeSanityCost: 10
  },
  crawlingHorror: {
    name: "Crawling Horror",
    description: "A pale, emaciated figure that moves on all fours, its limbs bent at impossible angles. Its face is featureless except for a gaping maw lined with needle-like teeth.",
    damage: 25,
    sanityCost: 10,
    weakness: "fire",
    requiredItem: "matches",
    escapeChance: 30,
    escapeDamage: 10,
    escapeSanityCost: 5
  },
  whisperer: {
    name: "The Whisperer",
    description: "An entity that appears as a tall, gaunt figure in tattered robes. Its face is hidden in shadow, but countless voices emanate from within, speaking in overlapping whispers.",
    damage: 10,
    sanityCost: 30,
    weakness: "silence",
    requiredItem: null, // No item required for silence
    escapeChance: 50,
    escapeDamage: 5,
    escapeSanityCost: 15
  },
  mirrorWalker: {
    name: "Mirror Walker",
    description: "A perfect doppelgänger of yourself, except for its eyes—black, empty voids that seem to pull at your very essence. It mimics your movements with a slight delay.",
    damage: 20,
    sanityCost: 25,
    weakness: "reflection",
    requiredItem: null, // No specific item required
    escapeChance: 35,
    escapeDamage: 8,
    escapeSanityCost: 12
  },
  fleshHound: {
    name: "Flesh Hound",
    description: "A canine-like creature with raw, skinless flesh that pulses with each labored breath. Its muzzle drips with a viscous black fluid that sizzles when it touches the ground.",
    damage: 30,
    sanityCost: 15,
    weakness: "stealth",
    requiredItem: null, // No specific item required
    escapeChance: 25,
    escapeDamage: 15,
    escapeSanityCost: 8
  }
};

// Game data - scenes, items, etc.
const gameData = {
  scenes: {
    start: {
      text: "You awaken with a splitting headache in a cold, damp room. The air is thick with the scent of mold and decay. Shadows dance across the peeling wallpaper as moonlight filters through a grimy window to the east. A heavy wooden door stands to the north, its hinges rusted with age.",
      options: [
        { text: "Approach the door (north)", nextScene: "hallway" },
        { text: "Examine the window (east)", nextScene: "window" },
        { text: "Search the room", nextScene: "search_room" }
      ]
    },
    hallway: {
      text: "The door creaks open to reveal a long, narrow hallway. Flickering lights cast grotesque shadows on the walls, and the floorboards groan beneath your feet. Doors line both sides, and at the far end, a staircase descends into darkness. The air feels colder here, and you can't shake the feeling of being watched.",
      options: [
        { text: "Try the first door on the left", nextScene: "left_door" },
        { text: "Try the first door on the right", nextScene: "right_door" },
        { text: "Approach the staircase", nextScene: "hallway_shadow_encounter" },
        { text: "Return to the room", nextScene: "start" }
      ]
    },
    window: {
      text: "You approach the window, wiping away years of grime with your sleeve. Outside, a dense forest surrounds the building, its twisted trees reaching toward the night sky like gnarled fingers. You're on the second floor, and the ground below is shrouded in mist. Something moves between the trees—something large. The window is sealed shut with rusted locks.",
      options: [
        { text: "Try to break the window", nextScene: "break_window" },
        { text: "Back away from the window", nextScene: "start" }
      ]
    },
    search_room: {
      text: "You cautiously search the room, your hands trembling. Under the bed, you find a rusty key covered in a substance you hope is rust. In a drawer, there's an old flashlight, its metal casing cold to the touch. As you search, you hear faint scratching sounds coming from within the walls.",
      options: [
        { text: "Take the rusty key", nextScene: "take_key" },
        { text: "Take the flashlight", nextScene: "take_flashlight" },
        { text: "Return to the center of the room", nextScene: "start" }
      ]
    },
    take_key: {
      text: "You pick up the rusty key, its jagged edges digging into your palm. It's heavier than it looks, and seems ancient. As you pocket it, the temperature in the room drops noticeably, and you hear what sounds like a distant whisper.",
      options: [
        { text: "Continue searching", nextScene: "search_room" },
        { text: "Return to the center of the room", nextScene: "start" }
      ],
      addItem: "rusty key"
    },
    take_flashlight: {
      text: "The flashlight feels unnaturally cold in your hand. You flick the switch, and to your surprise, it still works, casting a weak yellow beam that barely penetrates the darkness. For a moment, you think you see something move at the edge of the light, but it's gone when you look directly at it.",
      options: [
        { text: "Continue searching", nextScene: "search_room" },
        { text: "Return to the center of the room", nextScene: "start" }
      ],
      addItem: "flashlight"
    },
    left_door: {
      text: "You try the door, but it's locked tight. Through the keyhole, you catch a glimpse of bookshelves and what might be movement. Something scrapes against the other side of the door, as if sensing your presence. You need a key to enter.",
      options: [
        { text: "Try the door on the right", nextScene: "right_door" },
        { text: "Go to the staircase", nextScene: "hallway_shadow_encounter" },
        { text: "Return to the first room", nextScene: "start" }
      ],
      requiredItem: "rusty key",
      alternateScene: "library_whisperer_encounter"
    },
    left_door_unlocked: {
      text: "The key turns with difficulty, the lock's mechanism grinding as if it hasn't been used in decades. The door swings open to reveal a library, its shelves packed with ancient, moldering books. The air is thick with dust and the smell of old paper. In the center of the room stands a reading desk, a single book lying open upon it, its pages moving slightly despite the still air.",
      options: [
        { text: "Approach the open book", nextScene: "library" },
        { text: "Return to the hallway", nextScene: "hallway" }
      ]
    },
    right_door: {
      text: "The door opens with surprising ease, revealing what was once a kitchen. Rusted utensils hang from hooks, and shattered dishes litter the floor. The cabinets stand open, their contents long since looted—except for one that remains firmly shut. A foul odor permeates the air, and dark stains mark the walls and floor.",
      options: [
        { text: "Investigate the closed cabinet", nextScene: "kitchen_hound_encounter" },
        { text: "Return to the hallway", nextScene: "hallway" }
      ]
    },
    stairs: {
      text: "The staircase descends into impenetrable darkness. The steps are worn in the center, as if countless feet have traveled them over many years. A cold draft rises from below, carrying with it the scent of earth and decay. Without light, it would be suicide to attempt the descent.",
      options: [
        { text: "Descend into the darkness", nextScene: "dark_stairs" },
        { text: "Return to the hallway", nextScene: "hallway" }
      ],
      requiredItem: "flashlight",
      alternateScene: "stairs_with_light"
    },
    dark_stairs: {
      text: "Foolishly, you begin to descend the stairs in the dark. The wood creaks beneath your feet, and halfway down, a step gives way. You plummet into the darkness, your scream cut short as you land with a sickening crack. In your final moments, you feel cold hands dragging you deeper into the darkness. Game Over.",
      options: [
        { text: "Restart the game", nextScene: "start" }
      ],
      gameOver: true
    },
    stairs_with_light: {
      text: "With your flashlight illuminating the way, you carefully descend the creaking stairs. The beam catches countless dust particles dancing in the air, and occasionally glints off something that might be eyes watching from the shadows. At the bottom, you find yourself in what appears to be the main floor of the house.",
      options: [
        { text: "Explore the first floor", nextScene: "first_floor" },
        { text: "Return upstairs", nextScene: "upstairs_mirror_encounter" }
      ]
    },
    break_window: {
      text: "Desperate to escape, you grab a nearby chair and smash it against the window. The glass doesn't break—instead, the chair rebounds with surprising force, knocking you to the floor. The noise echoes through the house like a gunshot. From somewhere nearby, you hear heavy footsteps approaching rapidly, accompanied by a wet, dragging sound. The door bursts open to reveal... Game Over.",
      options: [
        { text: "Restart the game", nextScene: "start" }
      ],
      gameOver: true
    },
    library: {
      text: "The open book on the desk appears to be a journal, its pages yellowed with age. The handwriting is frantic, becoming more erratic with each entry. The final entry catches your eye: 'It's in the basement. God help me, I can hear it coming up the stairs. The only way out is through the tunnel, but I've lost the matches. Without light, the darkness will take you.' As you read these words, you hear a soft thud from somewhere in the house, as if something heavy has fallen—or been dropped.",
      options: [
        { text: "Examine the bookshelves", nextScene: "examine_book" },
        { text: "Return to the hallway", nextScene: "hallway" }
      ]
    },
    examine_book: {
      text: "You scan the bookshelves, finding tomes on occult subjects, local history, and what appears to be a handwritten account of rituals performed in this house. Tucked between two books, you find a folded note written in the same hand as the journal: 'The darkness hungers. It cannot see, but it can hear. It cannot touch the light. The generator in the basement is our only hope, but the tunnel might offer escape if you're quick and quiet.' You pocket the note, your hands shaking.",
      options: [
        { text: "Return to the reading desk", nextScene: "library" },
        { text: "Leave the library", nextScene: "hallway" }
      ],
      addItem: "mysterious note"
    },
    search_kitchen: {
      text: "You approach the closed cabinet, your heart pounding in your chest. It takes effort to pull it open, the wood swollen with moisture. Inside, you find a box of matches, surprisingly dry, and a collection of canned food covered in a thick layer of dust. As the cabinet door swings fully open, something falls from the top shelf—a desiccated rat, its body twisted unnaturally, as if it died in agony.",
      options: [
        { text: "Take the matches", nextScene: "take_matches" },
        { text: "Return to the hallway", nextScene: "hallway" }
      ]
    },
    take_matches: {
      text: "You pocket the matches, careful not to get them damp. As you do, you notice scratches on the inside of the cabinet door—not random marks, but words carved with desperate force: 'IT CAN SMELL FEAR.' The temperature seems to drop further, and you could swear you hear breathing that isn't your own.",
      options: [
        { text: "Search the kitchen more thoroughly", nextScene: "search_kitchen_again" },
        { text: "Leave the kitchen immediately", nextScene: "hallway" }
      ],
      addItem: "matches"
    },
    search_kitchen_again: {
      text: "You force yourself to search the kitchen more thoroughly, though every instinct screams at you to run. The drawers contain only rusted utensils, and the refrigerator, when you manage to wrench it open, releases a wave of putrid air that makes you gag. There's nothing else of use here, but as you turn to leave, you notice wet footprints on the floor that weren't there before—leading toward you from the hallway door.",
      options: [
        { text: "Exit through the hallway door", nextScene: "hallway" }
      ]
    },
    first_floor: {
      text: "The first floor is a large, open area that might once have been a grand foyer. A massive front door stands at one end, secured with heavy chains and a padlock that gleams as if new. Portraits line the walls, their subjects' eyes seeming to follow your movements. To one side, you spot a door that likely leads to the basement. The floorboards creak with each step, and you can't shake the feeling that the house itself is aware of your presence.",
      options: [
        { text: "Examine the front door", nextScene: "front_door" },
        { text: "Approach the basement door", nextScene: "basement_door" },
        { text: "Return upstairs", nextScene: "upstairs_mirror_encounter" }
      ]
    },
    front_door: {
      text: "The front door is secured with chains that look far newer than anything else in the house. The padlock is heavy and solid, with no sign of rust or wear. As you touch the chains, they rattle slightly, and you hear an answering rattle from somewhere deep in the house. This door won't open without a key, and you have the distinct impression that whatever is keeping you here doesn't want you to find it.",
      options: [
        { text: "Check the basement door", nextScene: "basement_door" },
        { text: "Return upstairs", nextScene: "hallway" }
      ]
    },
    basement_door: {
      text: "The basement door is unlocked, its surface covered in deep gouges that look disturbingly like claw marks. It swings open at your touch, revealing a set of stone steps descending into absolute darkness. A damp, cold draft flows upward, carrying the scent of earth and something metallic that might be blood. From below, you hear a faint, rhythmic sound—like breathing, or perhaps dripping water.",
      options: [
        { text: "Descend into the basement", nextScene: "basement_stairs" },
        { text: "Return to the first floor", nextScene: "first_floor" }
      ]
    },
    basement_stairs: {
      text: "The stone steps are slick with moisture, disappearing into a darkness so complete it seems solid. The breathing sound grows louder as you stand at the top of the stairs. Without light, whatever waits in that darkness would surely find you before you found anything else.",
      options: [
        { text: "Descend anyway", nextScene: "basement_dark" },
        { text: "Return to the first floor", nextScene: "first_floor" }
      ],
      requiredItem: "flashlight",
      alternateScene: "basement_horror_encounter"
    },
    basement_dark: {
      text: "Driven by desperation, you begin to descend the stairs into the pitch-black basement. The stone is slippery beneath your feet, and the darkness seems to press against your eyes like a physical force. Halfway down, you hear movement—a shuffling, dragging sound that approaches rapidly. Something cold and wet wraps around your ankle, and you're yanked violently into the darkness. Your screams echo briefly before being cut short. Game Over.",
      options: [
        { text: "Restart the game", nextScene: "start" }
      ],
      gameOver: true
    },
    basement_lit: {
      text: "Your flashlight cuts through the darkness, revealing a basement with a packed earth floor and stone walls that glisten with moisture. In one corner stands an old generator, covered in dust but seemingly intact. On the opposite wall, partially hidden behind shelves, you notice what appears to be the entrance to a narrow tunnel. The beam of your flashlight catches movement at the edge of its reach—something retreating from the light, leaving a glistening trail on the floor.",
      options: [
        { text: "Examine the generator", nextScene: "generator" },
        { text: "Investigate the tunnel", nextScene: "tunnel" },
        { text: "Return upstairs", nextScene: "first_floor" }
      ]
    },
    generator: {
      text: "The generator is an old model, but appears to be in working condition. A small pilot light needs to be lit before it can be started. Next to it sits a can of fuel, still half full. If you could get it running, it might power the entire house. As you examine it, you hear a soft scraping sound from the darkest corner of the basement, as if something is slowly moving closer.",
      options: [
        { text: "Try to start the generator", nextScene: "start_generator" },
        { text: "Check the tunnel", nextScene: "tunnel" },
        { text: "Return upstairs quickly", nextScene: "first_floor" }
      ],
      requiredItem: "matches",
      alternateScene: "generator_with_matches"
    },
    start_generator: {
      text: "You try to start the generator, but without a way to light the pilot, it's useless. As you fumble in the dark, you hear the scraping sound again—closer now, and accompanied by a wet, rattling breath. Your flashlight beam wavers, then dims slightly, as if something is draining its power.",
      options: [
        { text: "Abandon the generator and check the tunnel", nextScene: "tunnel" },
        { text: "Retreat upstairs", nextScene: "first_floor" }
      ]
    },
    generator_with_matches: {
      text: "With trembling hands, you strike a match and light the generator's pilot. For a moment, nothing happens—then it roars to life, the sudden noise making you jump. Lights flicker on throughout the basement, pushing back the darkness. A high-pitched, inhuman shriek comes from somewhere in the shadows, followed by the sound of something large moving rapidly away. The house hums with electricity, and you feel a momentary sense of safety.",
      options: [
        { text: "Investigate the tunnel", nextScene: "tunnel" },
        { text: "Return upstairs to the now-lit house", nextScene: "first_floor_lit" }
      ]
    },
    first_floor_lit: {
      text: "With the power restored, the first floor is transformed. Lights reveal details you missed before—including a key hanging on a hook near the front door, gleaming in the sudden brightness. The portraits on the walls show faces twisted in expressions of agony or terror, and dark stains on the floor form patterns that almost look deliberate. Despite the light, the house feels no less threatening—just more revealed.",
      options: [
        { text: "Take the key", nextScene: "take_front_door_key" },
        { text: "Return to the basement", nextScene: "basement_lit" }
      ]
    },
    take_front_door_key: {
      text: "You grab the key from its hook, half-expecting something to try to stop you. It's heavy and cold in your hand, with a skull-shaped bow that grins up at you mockingly. As you take it, all the lights in the house flicker violently, and you hear that same inhuman shriek from before—closer now, and filled with rage.",
      options: [
        { text: "Rush to the front door", nextScene: "unlock_front_door" },
        { text: "Run back to the basement", nextScene: "basement_lit" }
      ],
      addItem: "front door key"
    },
    unlock_front_door: {
      text: "You race to the front door, key in hand. Behind you, the lights begin to go out one by one, and the shrieking grows louder. Something is coming. Your hands shake violently as you fit the key into the padlock. It turns with agonizing slowness as the darkness closes in. Finally, the chains fall away, and you wrench the door open to the night air. You stumble outside just as something lunges from the darkness behind you. The door slams shut on its own, and you find yourself standing in the moonlight, free but forever changed by what you experienced. You've escaped... for now.",
      options: [
        { text: "Play again", nextScene: "start" }
      ],
      gameOver: true
    },
    tunnel: {
      text: "The tunnel entrance is low and narrow, forcing you to stoop. It appears to have been dug through the earth, with wooden supports that groan under the weight they bear. The air flowing from it is surprisingly fresh, suggesting it leads outside. Your flashlight beam extends only a short distance before the tunnel curves, hiding its destination. From somewhere in the darkness of the basement behind you, you hear that wet, dragging sound growing closer.",
      options: [
        { text: "Enter the tunnel", nextScene: "tunnel_exit" },
        { text: "Return to the basement", nextScene: "basement_lit" }
      ]
    },
    tunnel_exit: {
      text: "Heart pounding, you squeeze into the tunnel, the earthen walls pressing in from all sides. You crawl forward desperately, the sounds of pursuit growing fainter behind you. The tunnel seems to go on forever, the air growing thinner, your flashlight beam weaker. Just as panic begins to set in, you see a glimmer of moonlight ahead. With a final burst of energy, you scramble toward it, emerging into the cool night air at the edge of the forest. Behind you, something howls in rage from deep within the tunnel—a sound that will haunt your dreams for years to come. But for now, you've escaped.",
      options: [
        { text: "Play again", nextScene: "start" }
      ],
      gameOver: true
    },
    death_by_injury: {
      text: "Your wounds are too severe. Blood seeps through your clothing, and your vision begins to blur. The pain, once sharp and biting, fades to a dull throb as your consciousness slips away. As darkness claims you, the last thing you hear is a soft, satisfied whisper, welcoming you to join the other lost souls of this accursed place.",
      options: [],
      gameOver: true,
      autoReset: true
    },
    death_by_madness: {
      text: "The horrors you've witnessed have shattered your mind. Reality fractures around you, and you can no longer distinguish between what's real and what's merely a product of your broken psyche. You find yourself laughing uncontrollably as shadows dance at the edge of your vision. In your final moments of lucidity, you realize you've become just another ghost story to be whispered about by those who come after.",
      options: [
        { text: "Embrace the madness", nextScene: "start" }
      ],
      gameOver: true
    },
    hallway_shadow_encounter: {
      text: "As you move through the hallway, the shadows seem to deepen unnaturally. The temperature drops suddenly, and your breath forms visible clouds in the air.",
      options: [
        { text: "Continue forward", nextScene: "hallway" },
        { text: "Return to the previous room", nextScene: "start" }
      ],
      enemyEncounter: "shadowFiend"
    },
    library_whisperer_encounter: {
      text: "The library is deathly quiet, the silence broken only by the occasional settling of old wood. As you browse the shelves, you notice the spines of several books seem to form a pattern, almost like a face watching you.",
      options: [
        { text: "Continue searching", nextScene: "library" },
        { text: "Leave immediately", nextScene: "hallway" }
      ],
      enemyEncounter: "whisperer"
    },
    basement_horror_encounter: {
      text: "The basement air is thick with moisture and the scent of decay. Water drips somewhere in the darkness, creating an uneven rhythm that sets your nerves on edge.",
      options: [
        { text: "Explore deeper", nextScene: "basement_lit" },
        { text: "Return upstairs", nextScene: "first_floor" }
      ],
      enemyEncounter: "crawlingHorror"
    },
    kitchen_hound_encounter: {
      text: "The kitchen is in disarray, with broken dishes and upturned furniture. Something has clearly been searching for food—or perhaps hunting.",
      options: [
        { text: "Search for supplies", nextScene: "search_kitchen" },
        { text: "Leave quietly", nextScene: "hallway" }
      ],
      enemyEncounter: "fleshHound"
    },
    upstairs_mirror_encounter: {
      text: "You pass by a cracked mirror hanging on the wall. For a moment, your reflection seems delayed, moving a fraction of a second after you do.",
      options: [
        { text: "Examine the mirror", nextScene: "hallway" },
        { text: "Hurry past", nextScene: "stairs" }
      ],
      enemyEncounter: "mirrorWalker"
    }
  }
};

function Game() {
  // State for current scene, inventory, and player stats
  const [currentScene, setCurrentScene] = useState('start');
  const [inventory, setInventory] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    health: 100,
    sanity: 100
  });
  const [sceneHistory, setSceneHistory] = useState([]);
  const gameTitle = "Whispers in the Dark";
  const [ambientEffect, setAmbientEffect] = useState(null);
  const [activeEnemy, setActiveEnemy] = useState(null);
  const [encounterResolved, setEncounterResolved] = useState(true);
  const [encounterOutcome, setEncounterOutcome] = useState(null);
  const [previousSceneBeforeEncounter, setPreviousSceneBeforeEncounter] = useState(null);

  // Trigger an enemy encounter
  const triggerEnemyEncounter = useCallback((enemyType) => {
    setActiveEnemy(enemies[enemyType]);
    setEncounterResolved(false);
    setEncounterOutcome(null);
  }, []);

  // Reset the game
  const handleReset = useCallback(() => {
    setCurrentScene('start');
    setInventory([]);
    setSceneHistory([]);
    setPlayerStats({
      health: 100,
      sanity: 100
    });
    setActiveEnemy(null);
    setEncounterResolved(true);
    setEncounterOutcome(null);
    setPreviousSceneBeforeEncounter(null);
  }, []);

  // Sound effects for different actions
  useEffect(() => {
    // This would play sound effects based on scene transitions
    // For example, when entering a new scene or when game over occurs
    if (gameData.scenes[currentScene].gameOver) {
      // Play game over sound
      setAmbientEffect('gameOver');
    } else if (currentScene.includes('door')) {
      // Play door sound
      setAmbientEffect('door');
    } else {
      setAmbientEffect(null);
    }
  }, [currentScene]);

  // Effect to handle scene-based stat changes
  useEffect(() => {
    if (!encounterResolved) return; // Skip during encounters
    
    const scene = gameData.scenes[currentScene];
    if (!scene) return;
    
    // Update sanity based on scene content
    if (scene.text) {
      let sanityChange = 0;
      let healthChange = 0;
      
      // Decrease sanity for disturbing scenes
      if (scene.text.toLowerCase().includes('blood') || 
         scene.text.toLowerCase().includes('scream') ||
         scene.text.toLowerCase().includes('horror')) {
        sanityChange -= 5;
      }
      
      // Decrease sanity more for terrifying scenes
      if (scene.text.toLowerCase().includes('shriek') || 
         scene.text.toLowerCase().includes('inhuman') ||
         scene.text.toLowerCase().includes('terror')) {
        sanityChange -= 10;
      }
      
      // Decrease health for physically dangerous scenes
      if (scene.text.toLowerCase().includes('fall') || 
         scene.text.toLowerCase().includes('hurt') ||
         scene.text.toLowerCase().includes('pain')) {
        healthChange -= 5;
      }
      
      // Increase sanity slightly when finding helpful items
      if (scene.addItem) {
        sanityChange += 3;
      }
      
      // Apply changes if any
      if (sanityChange !== 0 || healthChange !== 0) {
        setPlayerStats(prevStats => ({
          health: Math.max(0, Math.min(100, prevStats.health + healthChange)),
          sanity: Math.max(0, Math.min(100, prevStats.sanity + sanityChange))
        }));
      }
      
      // Set ambient effect based on scene content
      if (scene.text.toLowerCase().includes('blood')) {
        setAmbientEffect('blood');
      } else if (scene.text.toLowerCase().includes('dark')) {
        setAmbientEffect('darkness');
      } else if (scene.text.toLowerCase().includes('cold')) {
        setAmbientEffect('cold');
      } else if (scene.text.toLowerCase().includes('whisper')) {
        setAmbientEffect('whispers');
      } else {
        setAmbientEffect(null);
      }

      // Check for enemy encounter
      if (scene.enemyEncounter && encounterResolved) {
        setPreviousSceneBeforeEncounter(currentScene);
        triggerEnemyEncounter(scene.enemyEncounter);
      }
    }
  }, [currentScene, encounterResolved, triggerEnemyEncounter]);

  // Effect to check for game over due to stats
  useEffect(() => {
    if (playerStats.health <= 0) {
      // Ensure health doesn't go below 0
      setPlayerStats(prevStats => ({
        ...prevStats,
        health: 0
      }));
      setCurrentScene('death_by_injury');
      
      // Set a timer to automatically reset the game after 5 seconds
      const resetTimer = setTimeout(() => {
        handleReset();
      }, 5000);
      
      return () => clearTimeout(resetTimer);
    } else if (playerStats.sanity <= 0) {
      setCurrentScene('death_by_madness');
    }
  }, [playerStats, handleReset]);

  // Handle encounter actions (attack, use item, flee)
  const resolveEncounterAction = (action) => {
    let success = false;
    let healthLoss = 0;
    let sanityLoss = 0;
    let outcomeText = "";

    // Different logic based on action type
    if (action.type === "attack") {
      // Calculate hit chance based on player's strength vs enemy's defense
      const hitChance = Math.min(0.9, Math.max(0.3, (playerStats.health / activeEnemy.damage) * 0.7));
      const roll = Math.random();
      success = roll <= hitChance;

      if (success) {
        // Calculate damage based on player's strength
        const baseDamage = Math.floor(playerStats.health * 0.8);
        const damageVariance = Math.floor(playerStats.health * 0.4);
        const damage = baseDamage + Math.floor(Math.random() * damageVariance);

        // Update enemy health
        const updatedEnemy = { ...activeEnemy, health: Math.max(0, activeEnemy.health - damage) };
        setActiveEnemy(updatedEnemy);

        outcomeText = `You hit the ${activeEnemy.name} for ${damage} damage!`;

        // Check if enemy is defeated
        if (updatedEnemy.health <= 0) {
          outcomeText += ` You have defeated the ${activeEnemy.name}!`;
          // Add any rewards, experience, etc. here
        }
      } else {
        outcomeText = `You missed the ${activeEnemy.name}!`;
      }

      // Enemy counterattack if still alive
      if (activeEnemy.health > 0) {
        const enemyHitChance = Math.min(0.9, Math.max(0.3, (activeEnemy.damage / playerStats.health) * 0.6));
        const enemyRoll = Math.random();
        const enemyHit = enemyRoll <= enemyHitChance;

        if (enemyHit) {
          const enemyDamage = Math.floor(activeEnemy.damage * 0.7) + Math.floor(Math.random() * (activeEnemy.damage * 0.3));
          healthLoss = enemyDamage;
          outcomeText += ` The ${activeEnemy.name} hits you for ${enemyDamage} damage!`;
        } else {
          outcomeText += ` The ${activeEnemy.name} tries to attack but misses!`;
        }
      }
    } else if (action.type === "flee") {
      // Calculate escape chance based on player's agility vs enemy's speed
      const escapeChance = Math.min(0.9, Math.max(0.2, (playerStats.sanity / activeEnemy.escapeSanityCost) * 0.8));
      const escapeRoll = Math.random();
      
      success = escapeRoll <= escapeChance;
      
      if (success) {
        outcomeText = `You successfully escaped from the ${activeEnemy.name}!`;
      } else {
        // Failed escape attempt results in enemy attack
        const enemyDamage = Math.floor(activeEnemy.damage * 0.5) + Math.floor(Math.random() * (activeEnemy.damage * 0.2));
        healthLoss = enemyDamage;
        outcomeText = `You failed to escape! The ${activeEnemy.name} hits you for ${enemyDamage} damage!`;
      }
    }

    // Update player health
    if (healthLoss > 0) {
      setPlayerStats(prev => ({
        ...prev,
        health: Math.max(0, prev.health - healthLoss),
        sanity: Math.max(0, prev.sanity - sanityLoss)
      }));
    }

    return { success, healthLoss, sanityLoss, outcomeText };
  };

  // Handle selecting an option from the current scene
  const handleSelectOption = (option) => {
    // Check if this is a direct flee action
    if (option.directFlee) {
      const fleeAction = { type: "flee" };
      const outcome = resolveEncounterAction(fleeAction);
      setEncounterOutcome(outcome);
      
      if (outcome.success) {
        // If flee was successful, end the encounter
        setActiveEnemy(null);
        setCurrentScene(gameData.scenes[option.nextScene]);
      }
      return;
    }
    
    // Handle encounter actions
    if (option.encounterAction) {
      const outcome = resolveEncounterAction(option.encounterAction);
      setEncounterOutcome(outcome);
      
      // If enemy is defeated or player successfully fled
      if (outcome.success && (option.encounterAction.type === "flee" || activeEnemy.health <= 0)) {
        // End the encounter and move to the next scene
        setActiveEnemy(null);
        
        if (option.nextScene) {
          setCurrentScene(gameData.scenes[option.nextScene]);
        }
      }
      return;
    }

    // Normal scene transition
    if (option.nextScene) {
      // Check if the next scene has an enemy encounter
      if (gameData.scenes[option.nextScene].enemy) {
        const enemy = enemies[gameData.scenes[option.nextScene].enemy];
        if (enemy) {
          setActiveEnemy({ ...enemy });
          
          // Get available actions for this enemy
          getAvailableActions(enemy);
          
          setActiveEnemy(enemy);
        }
      } else {
        // No enemy in the next scene
        setActiveEnemy(null);
      }
      
      setCurrentScene(option.nextScene);
    }
    
    // Handle item pickup
    if (option.addItem && !inventory.includes(option.addItem)) {
      setInventory(prev => [...prev, option.addItem]);
    }
    
    // Handle stat changes
    if (option.statChanges) {
      // Apply stat changes to player stats
      setPlayerStats(prevStats => ({
        health: Math.max(0, Math.min(100, prevStats.health + (option.statChanges.health || 0))),
        sanity: Math.max(0, Math.min(100, prevStats.sanity + (option.statChanges.sanity || 0)))
      }));
    }
  };

  // Get available actions for the current enemy
  const getAvailableActions = (enemy) => {
    const actions = [];
    
    // Always add flee option with explicit flee action
    actions.push({ 
      text: "Attempt to flee", 
      encounterAction: "flee"  // This must match exactly what we check for in resolveEncounter
    });
    
    // Add weakness option if player has required item or no item is required
    if (enemy.weakness === "light" && inventory.includes("flashlight")) {
      actions.push({ text: "Use your flashlight against it", encounterAction: "light" });
    }
    
    if (enemy.weakness === "fire" && inventory.includes("matches")) {
      actions.push({ text: "Use your matches to create fire", encounterAction: "fire" });
    }
    
    // These options are always available as they don't require items
    if (enemy.weakness === "silence") {
      actions.push({ text: "Remain completely silent", encounterAction: "silence" });
    }
    
    if (enemy.weakness === "reflection") {
      actions.push({ text: "Use a reflective surface", encounterAction: "reflection" });
    }
    
    if (enemy.weakness === "stealth") {
      actions.push({ text: "Try to hide and be stealthy", encounterAction: "stealth" });
    }
    
    // Add some generic options that are less effective
    if (inventory.includes("rusty key")) {
      actions.push({ text: "Brandish the rusty key as a weapon", encounterAction: "attack" });
    }
    
    return actions;
  };

  // Get the current scene data
  const getSceneData = () => {
    const scene = gameData.scenes[currentScene];
    
    // If there's an active enemy encounter, modify the scene
    if (activeEnemy && !encounterResolved) {
      const availableActions = getAvailableActions(activeEnemy);
      
      // Ensure we have at least the flee option
      if (availableActions.length === 0) {
        availableActions.push({ 
          text: "Attempt to flee", 
          encounterAction: "flee" 
        });
      }
      
      return {
        ...scene,
        text: `${scene.text}\n\nSuddenly, you're confronted by a ${activeEnemy.name}! ${activeEnemy.description} It approaches menacingly, and you must act quickly!`,
        options: availableActions
      };
    }
    
    // If encounter was just resolved, show the outcome
    if (activeEnemy && encounterResolved && encounterOutcome) {
      // If the encounter was successful, continue with normal scene options
      // If it failed, provide an option to retreat to the previous scene
      const options = encounterOutcome.success 
        ? scene.options 
        : [{ text: "Retreat to safety", nextScene: previousSceneBeforeEncounter || scene.options[0].nextScene }];
      
      return {
        ...scene,
        text: `${scene.text}\n\n${encounterOutcome.text}${encounterOutcome.success ? " You can now proceed." : " You need to retreat to recover."}`,
        options: options
      };
    }
    
    // If scene requires an item and player has it, show alternate scene
    if (scene.requiredItem && inventory.includes(scene.requiredItem) && scene.alternateScene) {
      return gameData.scenes[scene.alternateScene];
    }
    
    return scene;
  };

  return (
    <div className={`game-container ${ambientEffect ? `ambient-${ambientEffect}` : ''} ${activeEnemy && !encounterResolved ? 'encounter-active' : ''}`}>
      <div className="game-sidebar">
        <PlayerStats stats={playerStats} />
        <Inventory items={inventory} />
      </div>
      
      <div className="game-content">
        <div className="game-title-area">
          <h1 className="game-title">{gameTitle}</h1>
        </div>
        
        <Scene 
          scene={getSceneData()} 
          onSelectOption={handleSelectOption}
          onReset={handleReset}
          encounterActive={activeEnemy && !encounterResolved}
          encounterOutcome={encounterOutcome}
        />
        
        {sceneHistory.length > 0 && !getSceneData().gameOver && !activeEnemy && (
          <div className="game-controls">
            <button className="back-button" onClick={handleReset}>
              Return to previous location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game; 
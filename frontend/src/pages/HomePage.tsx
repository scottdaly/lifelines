import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { GameState, NPC, Relationship } from '../types';

const BIRTHPLACES = [
  'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Seattle',
  'Portland', 'Boston', 'Miami', 'Denver', 'Atlanta',
  'Small Town, USA', 'Rural Farm', 'Suburban Neighborhood'
];

const PARENT_NAMES = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica']
};

export function HomePage() {
  const navigate = useNavigate();
  const { initializeGame, loadGame, error, clearError } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadId, setLoadId] = useState('');
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [characterGender, setCharacterGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  
  const generateParents = (_birthYear: number): Relationship[] => {
    const parentAge = 25 + Math.floor(Math.random() * 15); // Parents are 25-40 when child is born
    
    const mother: NPC = {
      id: `npc_mother_${Date.now()}`,
      name: PARENT_NAMES.female[Math.floor(Math.random() * PARENT_NAMES.female.length)],
      age: parentAge,
      gender: 'female',
      traits: ['caring', 'protective'],
      stats: {
        intelligence: 40 + Math.floor(Math.random() * 30),
        charisma: 40 + Math.floor(Math.random() * 30),
        strength: 30 + Math.floor(Math.random() * 30),
        wealth: 20 + Math.floor(Math.random() * 50)
      }
    };
    
    const father: NPC = {
      id: `npc_father_${Date.now() + 1}`,
      name: PARENT_NAMES.male[Math.floor(Math.random() * PARENT_NAMES.male.length)],
      age: parentAge + Math.floor(Math.random() * 5),
      gender: 'male',
      traits: ['supportive', 'hardworking'],
      stats: {
        intelligence: 40 + Math.floor(Math.random() * 30),
        charisma: 40 + Math.floor(Math.random() * 30),
        strength: 40 + Math.floor(Math.random() * 30),
        wealth: 30 + Math.floor(Math.random() * 50)
      }
    };
    
    return [
      {
        npc: mother,
        relType: 'parent',
        relStats: {
          intimacy: 90,
          trust: 95,
          attraction: 0,
          conflict: 5
        },
        history: [],
        status: 'active'
      },
      {
        npc: father,
        relType: 'parent',
        relStats: {
          intimacy: 85,
          trust: 90,
          attraction: 0,
          conflict: 10
        },
        history: [],
        status: 'active'
      }
    ];
  };
  
  const createNewGame = async () => {
    if (!characterName.trim()) {
      setCharacterName('Alex');
    }
    
    setIsLoading(true);
    
    try {
      const birthYear = 2000 + Math.floor(Math.random() * 20);
      
      // Generate procedural background
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/generate-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthYear })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate background');
      }
      
      const { background, parents, suggestedStats } = await response.json();
      
      const newGameState: GameState = {
        seed: Math.random().toString(36).substring(2),
        currentYear: birthYear,
        stageLocalIndex: 0,
        character: {
          id: `char_${Date.now()}`,
          name: characterName.trim() || 'Alex',
          gender: characterGender,
          dob: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          birthplace: background.birthplace.name,
          stats: suggestedStats,
          traits: background.traits,
          inventory: {}
        },
        relationships: parents,
        events: [],
        pendingChoices: [
          {
            id: 'birth',
            label: 'Take your first breath',
            tags: ['start', 'birth']
          }
        ],
        proceduralBackground: background,
        narrativePressure: 0,
        lastMilestoneAge: 0,
        currentSubTurn: undefined
      };
      
      initializeGame(newGameState);
      navigate('/play');
    } catch (error) {
      console.error('Failed to create game:', error);
      // Fallback to simple generation
      const birthYear = 2000 + Math.floor(Math.random() * 10);
      const birthplace = BIRTHPLACES[Math.floor(Math.random() * BIRTHPLACES.length)];
      const parents = generateParents(birthYear);
      
      const traits = ['innocent', 'developing'];
      if (Math.random() > 0.7) traits.push('curious');
      if (Math.random() > 0.8) traits.push('energetic');
      
      const familyWealth = Math.max(...parents.map(p => p.npc.stats.wealth || 0));
      
      const newGameState: GameState = {
        seed: Math.random().toString(36).substring(2),
        currentYear: birthYear,
        stageLocalIndex: 0,
        character: {
          id: `char_${Date.now()}`,
          name: characterName.trim() || 'Alex',
          gender: characterGender,
          dob: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          birthplace,
          stats: {
            intelligence: 10 + Math.floor(Math.random() * 20),
            charisma: 20 + Math.floor(Math.random() * 30),
            strength: 5 + Math.floor(Math.random() * 10),
            creativity: 30 + Math.floor(Math.random() * 20),
            luck: 30 + Math.floor(Math.random() * 40),
            health: 80 + Math.floor(Math.random() * 20),
            wealth: Math.floor(familyWealth * 0.1)
          },
          traits,
          inventory: {}
        },
        relationships: parents,
        events: [],
        pendingChoices: [
          {
            id: 'birth',
            label: 'Take your first breath',
            tags: ['start', 'birth']
          }
        ],
        narrativePressure: 0,
        lastMilestoneAge: 0,
        currentSubTurn: undefined
      };
      
      initializeGame(newGameState);
      navigate('/play');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoadGame = async () => {
    if (!loadId.trim()) return;
    
    setIsLoading(true);
    await loadGame(loadId);
    
    if (!error) {
      navigate('/play');
    }
    setIsLoading(false);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <AnimatePresence mode="wait">
        {!showCharacterCreation ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md w-full space-y-4 md:space-y-8 p-8"
          >
            <div className="text-center">
              <pre className="text-xs text-term-gray opacity-50 leading-none select-none hidden">
{`╔═══════════════════════════════════╗
║      _     ___ _____ _____ _     ║
║     | |   |_ _|  ___| ____| |    ║
║     | |    | || |_  |  _| | |    ║
║     | |___ | ||  _| | |___| |___ ║
║     |_____|___|_|   |_____|_____|║
║           ___ _   _ _____ ___    ║
║          |_ _| \\ | | ____/ __|   ║
║           | ||  \\| |  _| \\___ \\  ║
║           | || |\\  | |___ ___) | ║
║          |___|_| \\_|_____|____/  ║
╚═══════════════════════════════════╝`}
              </pre>
              <h1 className="text-5xl md:text-6xl text-term-white font-logo">Lifelines</h1>
              <p className="text-term-gray text-md md:text-xl">A text-based life simulation</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowCharacterCreation(true)}
                disabled={isLoading}
                className="w-full py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors"
              >
                NEW GAME
              </button>
              
              <button
                onClick={() => {
                  // Quick start with random character
                  const randomGender = Math.random() > 0.5 ? 'male' : 'female';
                  const names = {
                    male: ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Jamie', 'Chris', 'Morgan', 'Ryan', 'Blake'],
                    female: ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Jamie', 'Chris', 'Morgan', 'Emma', 'Sophia']
                  };
                  const randomName = names[randomGender][Math.floor(Math.random() * names[randomGender].length)];
                  
                  setCharacterName(randomName);
                  setCharacterGender(randomGender);
                  createNewGame();
                }}
                disabled={isLoading}
                className="w-full py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors"
              >
                QUICK START
              </button>
              
              <div className="border-simple p-4 space-y-2">
                <label className="text-sm text-term-gray">Load saved game:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={loadId}
                    onChange={(e) => setLoadId(e.target.value)}
                    placeholder="Enter save ID"
                    className="flex-1 bg-transparent border border-term-gray-dark px-3 py-1 text-term-white focus:outline-none focus:border-term-white"
                  />
                  <button
                    onClick={handleLoadGame}
                    disabled={isLoading || !loadId.trim()}
                    className="px-4 py-1 border-simple hover:bg-term-white hover:text-term-black transition-colors disabled:text-term-gray disabled:hover:bg-transparent"
                  >
                    LOAD
                  </button>
                </div>
              </div>
              
              {error && (
                <div
                  className="border border-term-red p-3 text-sm text-term-red"
                >
                  {error}
                  <button
                    onClick={clearError}
                    className="ml-2 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-center text-xs text-term-gray space-y-1">
              <p>Use number keys 1-5 for quick choices</p>
              <p>Press ESC to save at any time</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="character-creation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md w-full space-y-8 p-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-term-white">CREATE YOUR CHARACTER</h2>
              <p className="text-term-gray text-sm">Who will you become?</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-term-gray">Name:</label>
                  <button
                    onClick={() => {
                      const allNames = ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Jamie', 'Chris', 'Morgan', 
                                       'Ryan', 'Blake', 'Emma', 'Sophia', 'Avery', 'Riley', 'Quinn', 'Sage'];
                      setCharacterName(allNames[Math.floor(Math.random() * allNames.length)]);
                    }}
                    className="text-xs text-term-gray hover:text-term-white transition-colors"
                    title="Random name"
                  >
                    [RANDOM]
                  </button>
                </div>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-transparent border border-term-gray-dark px-3 py-2 text-term-white focus:outline-none focus:border-term-white"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-term-gray">Gender:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'neutral'] as const).map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setCharacterGender(gender)}
                      className={`py-2 text-center border-simple ${
                        characterGender === gender ? 'bg-term-white text-term-black' : 'hover:bg-term-white hover:text-term-black'
                      } transition-colors`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-term-gray space-y-1">
                <p>• Your birthplace will be randomly selected</p>
                <p>• You'll start with two loving parents</p>
                <p>• Your initial stats are based on genetics and luck</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCharacterCreation(false)}
                  className="flex-1 py-2 border-simple hover:bg-term-white hover:text-term-black transition-colors"
                >
                  BACK
                </button>
                <button
                  onClick={createNewGame}
                  className="flex-1 py-2 border-simple hover:bg-term-white hover:text-term-black transition-colors font-bold"
                >
                  BEGIN LIFE
                </button>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    // Generate random name based on gender
                    const randomGender = Math.random() > 0.5 ? 'male' : 'female';
                    const names = {
                      male: ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Jamie', 'Chris', 'Morgan'],
                      female: ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Jamie', 'Chris', 'Morgan', 'Emma', 'Sophia']
                    };
                    const randomName = names[randomGender][Math.floor(Math.random() * names[randomGender].length)];
                    
                    setCharacterName(randomName);
                    setCharacterGender(randomGender);
                    
                    // Immediately start the game
                    setTimeout(() => createNewGame(), 100);
                  }}
                  className="text-xs text-term-gray hover:text-term-white transition-colors underline"
                >
                  or start with a random character
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
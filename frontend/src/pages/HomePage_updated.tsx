import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { getRandomCharacter } from '../utils/names';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { useConfirmModal } from '../hooks/useConfirmModal';
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

interface SavedGame {
  id: string;
  characterName: string | null;
  currentAge: number | null;
  currentStage: string | null;
  lastPlayed: Date;
  createdAt: Date;
}

const stageLabels: Record<string, string> = {
  infancy: 'Infancy',
  earlyChild: 'Early Childhood',
  middleChild: 'Middle Childhood',
  tween: 'Tween',
  highSchool: 'High School',
  youngAdult: 'Young Adult',
  adult: 'Adult',
  senior: 'Senior'
};

export function HomePage() {
  const navigate = useNavigate();
  const { initializeGame, error, clearError } = useGameStore();
  const { tokens } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [characterGender, setCharacterGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [games, setGames] = useState<SavedGame[]>([]);
  const { confirm, ConfirmModal } = useConfirmModal();
  
  useEffect(() => {
    loadGames();
  }, []);
  
  const loadGames = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/games`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load games');
      }
      
      const data = await response.json();
      setGames(data.games.map((game: any) => ({
        ...game,
        lastPlayed: new Date(game.lastPlayed),
        createdAt: new Date(game.createdAt)
      })));
    } catch (err: any) {
      console.error('Failed to load games:', err);
    } finally {
    }
  };
  
  const handleContinueGame = (gameId: string) => {
    navigate(`/play/${gameId}`);
  };
  
  const handleDeleteGame = async (gameId: string) => {
    // Find the game to get details for the modal
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const confirmed = await confirm({
      title: 'DELETE LIFE',
      message: 'Are you sure you want to delete this life?',
      confirmText: 'DELETE',
      cancelText: 'CANCEL',
      confirmButtonClass: 'border-term-red text-term-red hover:bg-term-red hover:text-black',
      details: (
        <div className="space-y-1">
          <p>Character: <span className="text-term-white">{game.characterName || 'Unknown'}</span></p>
          <p>Age: <span className="text-term-white">{game.currentAge || 0}</span> • <span className="text-term-white">{stageLabels[game.currentStage || ''] || 'Unknown'}</span></p>
          <p>Last played: <span className="text-term-white">{format(game.lastPlayed, 'MMM d, yyyy')}</span></p>
        </div>
      )
    });

    if (!confirmed) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete game');
      }
      
      await loadGames();
    } catch (err: any) {
      console.error('Failed to delete game:', err);
    }
  };
  
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`
        },
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
            id: 'early_life_start',
            label: 'Take your first breath',
            tags: ['start', 'birth']
          }
        ],
        proceduralBackground: background,
        narrativePressure: 0,
        lastMilestoneAge: 0,
        currentSubTurn: undefined
      };
      
      // Create the game on the backend
      const createResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/games`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`
        },
        body: JSON.stringify({ gameState: newGameState })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create game');
      }
      
      const { gameId } = await createResponse.json();
      initializeGame(newGameState);
      navigate(`/play/${gameId}`);
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
            id: 'early_life_start',
            label: 'Take your first breath',
            tags: ['start', 'birth']
          }
        ],
        narrativePressure: 0,
        lastMilestoneAge: 0,
        currentSubTurn: undefined
      };
      
      // Create the game on the backend
      const createResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/games`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`
        },
        body: JSON.stringify({ gameState: newGameState })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create game');
      }
      
      const { gameId } = await createResponse.json();
      initializeGame(newGameState);
      navigate(`/play/${gameId}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  return (
    <div className="min-h-screen bg-black">
      <div className="flex items-center justify-center min-h-screen p-8">
        <AnimatePresence mode="wait">
          {!showCharacterCreation ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md w-full space-y-8"
            >
              {/* Logo */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <AnimatedLogo />
                </div>
                <p className="text-term-gray text-md md:text-2xl">A text-based life simulation</p>
              </div>
              
              {/* New game buttons - vertical stack */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowCharacterCreation(true)}
                  disabled={isLoading}
                  className="w-full py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors"
                >
                  NEW LIFE
                </button>
                
                <button
                  onClick={() => {
                    // Quick start with random character
                    const { name, gender } = getRandomCharacter();
                    setCharacterName(name);
                    setCharacterGender(gender);
                    createNewGame();
                  }}
                  disabled={isLoading}
                  className="w-full py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors"
                >
                  QUICK START
                </button>
                
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors"
                >
                  ACCOUNT SETTINGS
                </button>
              </div>

              {/* Saved games - scrollable */}
              {games.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm text-term-gray text-center">Previous Lives</h3>
                  <div className="h-64 overflow-y-auto border border-term-gray-dark rounded p-2">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className="py-4 mx-2 border-b border-term-gray-dark transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-term-white font-bold">
                              {game.characterName || 'Unknown'}
                            </h4>
                            <p className="text-xs text-term-gray">
                              Age {game.currentAge || 0} • {stageLabels[game.currentStage || ''] || 'Unknown'}
                            </p>
                          </div>
                          <p className="text-xs text-term-gray">
                            {format(game.lastPlayed, 'MMM d')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleContinueGame(game.id)}
                            className="flex-1 text-xs bg-term-gray/20 text-term-gray py-1 rounded hover:bg-term-gray/30"
                          >
                            Continue
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="text-xs border-simple text-red-500 hover:text-red-400 px-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              <div className="text-center text-xs text-term-gray space-y-1">
                <p>Use number keys 1-5 for quick choices</p>
                <p>Your progress is automatically saved</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="character-creation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-term-white">CREATE YOUR CHARACTER</h2>
                <p className="text-term-gray text-sm">Who will you become?</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-term-gray">Name:</label>
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
                
                <button
                  onClick={() => {
                    // Randomize both name and gender
                    const { name, gender } = getRandomCharacter();
                    setCharacterName(name);
                    setCharacterGender(gender);
                  }}
                  className="w-full py-2 px-4 border border-term-gray-dark hover:bg-term-gray/20 transition-colors text-term-white flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9c-.83 0-1.5-.67-1.5-1.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"/>
                  </svg>
                  RANDOMIZE CHARACTER
                </button>
                
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ConfirmModal />
    </div>
  );
}
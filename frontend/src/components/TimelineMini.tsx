import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function TimelineMini() {
  const { gameState } = useGameStore();
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  
  if (!gameState) return null;
  
  const character = gameState.character;
  const events = gameState.events;
  const currentAge = gameState.currentYear - parseInt(character.dob.split('-')[0]);
  
  // Group events by life stage
  const eventsByStage = events.reduce((acc, event) => {
    const eventAge = event.year - parseInt(character.dob.split('-')[0]);
    let stage = 'Unknown';
    
    if (eventAge < 3) stage = 'Infancy';
    else if (eventAge < 6) stage = 'Early Childhood';
    else if (eventAge < 9) stage = 'Middle Childhood';
    else if (eventAge < 12) stage = 'Tween Years';
    else if (eventAge < 18) stage = 'High School';
    else if (eventAge < 25) stage = 'Young Adult';
    else if (eventAge < 65) stage = 'Adulthood';
    else stage = 'Senior Years';
    
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(event);
    return acc;
  }, {} as Record<string, typeof events>);
  
  return (
    <>
      <div className="border-simple p-4 rounded-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-term-white">TIMELINE</h3>
          <button
            onClick={() => setShowFullTimeline(true)}
            className="text-xs text-term-gray hover:text-term-white transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="text-xs space-y-1">
          <div className="text-term-white">
            {character.name}, Age {currentAge}
          </div>
          <div className="text-term-gray">Born: {character.birthplace}</div>
          <div className="text-term-gray">Events: {events.length}</div>
          
          {events.length > 0 && (
            <div className="mt-2 pt-2 border-t border-term-gray-dark">
              <div className="text-term-gray mb-1">Recent:</div>
              {events.slice(-3).reverse().map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-term-white truncate"
                >
                  • {event.title}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Full Timeline Modal */}
      <AnimatePresence>
        {showFullTimeline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-term-black/90 z-50 flex items-center justify-center p-8"
            onClick={() => setShowFullTimeline(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full max-h-[80vh] bg-term-black border-2 border-term-white p-6 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-term-white">LIFE TIMELINE</h2>
                <button
                  onClick={() => setShowFullTimeline(false)}
                  className="text-term-gray hover:text-term-white transition-colors"
                >
                  [X]
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
                {Object.entries(eventsByStage).map(([stage, stageEvents]) => (
                  <motion.div 
                    key={stage} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border-simple p-3"
                  >
                    <h3 className="text-sm font-bold text-term-white mb-2">{stage}</h3>
                    <div className="space-y-2">
                      {stageEvents.map((event) => {
                        const eventAge = event.year - parseInt(character.dob.split('-')[0]);
                        return (
                          <div key={event.id} className="text-xs">
                            <div className="flex items-start gap-2">
                              <span className="text-term-gray">Age {eventAge}:</span>
                              <div className="flex-1">
                                <div className="text-term-white">{event.title}</div>
                                <div className="text-term-gray mt-1">{event.description}</div>
                                {event.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {event.tags.map(tag => (
                                      <span key={tag} className="text-term-yellow text-xs">#{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center text-term-gray py-8">
                    Your story has just begun...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
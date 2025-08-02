import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { Stats } from '../types';

const STAT_LABELS: Record<keyof Stats, string> = {
  intelligence: 'INT',
  charisma: 'CHA',
  strength: 'STR',
  creativity: 'CRE',
  luck: 'LCK',
  health: 'HLT',
  wealth: 'WLT'
};

export function StatsPanel() {
  const { gameState } = useGameStore();
  const [previousStats, setPreviousStats] = useState<Stats | null>(null);
  const [statChanges, setStatChanges] = useState<Partial<Stats>>({});
  
  const stats = gameState?.character.stats;
  
  useEffect(() => {
    if (stats && previousStats) {
      const changes: Partial<Stats> = {};
      for (const key in stats) {
        const statKey = key as keyof Stats;
        if (stats[statKey] !== previousStats[statKey]) {
          changes[statKey] = stats[statKey] - previousStats[statKey];
        }
      }
      if (Object.keys(changes).length > 0) {
        setStatChanges(changes);
        setTimeout(() => setStatChanges({}), 3000);
      }
    }
    setPreviousStats(stats || null);
  }, [stats]);
  
  if (!stats) return null;
  
  return (
    <div className="border-simple p-4 rounded-sm">
      <h3 className="text-sm font-bold mb-3 text-term-white">STATS</h3>
      <div className="space-y-2">
        {Object.entries(stats).map(([key, value]) => {
          const statKey = key as keyof Stats;
          const change = statChanges[statKey];
          
          return (
            <div key={key}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-term-gray">{STAT_LABELS[statKey]}</span>
                <div className="flex items-center gap-2">
                  <span className={change ? (change > 0 ? 'text-term-green' : 'text-term-red') : 'text-term-white'}>
                    {value.toString().padStart(3, ' ')}
                  </span>
                  <AnimatePresence>
                    {change && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={change > 0 ? 'text-term-green' : 'text-term-red'}
                      >
                        {change > 0 ? '+' : ''}{change}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mt-1 w-full">
                {Array.from({ length: 40 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-5 flex-1 ${
                      i < Math.floor(value / 2.5) 
                        ? 'bg-term-gray-light' 
                        : 'bg-term-gray-dark'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Narrative Pressure Indicator */}
      {gameState?.narrativePressure !== undefined && gameState.narrativePressure > 0 && (
        <div className="mt-3 pt-3 border-t border-term-gray-dark">
          <div className="flex justify-between items-center text-xs">
            <span className="text-term-gray">Drama</span>
            <span className={
              gameState.narrativePressure > 0.7 ? 'text-term-red' :
              gameState.narrativePressure > 0.4 ? 'text-term-yellow' :
              'text-term-gray'
            }>
              {gameState.narrativePressure > 0.7 ? 'HIGH' :
               gameState.narrativePressure > 0.4 ? 'MED' : 'LOW'}
            </span>
          </div>
          <div className="flex items-center gap-0.5 mt-1 w-full">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className={`h-5 flex-1 ${
                  i < Math.floor((gameState.narrativePressure ?? 0) * 40) 
                    ? 'bg-term-gray-light' 
                    : 'bg-term-gray-dark'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
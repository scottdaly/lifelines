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
  const { gameState, currentToast } = useGameStore();
  const [previousStats, setPreviousStats] = useState<Stats | null>(null);
  const [statChanges, setStatChanges] = useState<Partial<Stats>>({});
  
  const stats = gameState?.character.stats;
  
  useEffect(() => {
    if (currentToast?.deltas) {
      setStatChanges(currentToast.deltas);
      setTimeout(() => setStatChanges({}), 3000);
    }
  }, [currentToast]);
  
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
    <div className="border-simple p-4">
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
              <div className="text-xs font-mono">
                [{'█'.repeat(Math.floor(value / 10))}{'░'.repeat(10 - Math.floor(value / 10))}]
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
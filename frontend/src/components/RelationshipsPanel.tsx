import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { Relationship } from '../types';

const REL_TYPE_ICONS: Record<string, string> = {
  parent: '👨‍👩‍👧',
  sibling: '👫',
  friend: '🤝',
  rival: '⚔️',
  mentor: '🎓',
  romantic: '💕',
  spouse: '💍',
  coworker: '💼',
  child: '👶'
};

export function RelationshipsPanel() {
  const { gameState, currentToast } = useGameStore();
  const [highlightedNpcs, setHighlightedNpcs] = useState<Set<string>>(new Set());
  
  const relationships = gameState?.relationships.filter(r => r.status === 'active') || [];
  
  useEffect(() => {
    if (currentToast?.relHighlights) {
      const highlights = new Set<string>();
      currentToast.relHighlights.forEach(highlight => {
        // Extract NPC names from highlights
        relationships.forEach(rel => {
          if (highlight.includes(rel.npc.name)) {
            highlights.add(rel.npc.id);
          }
        });
      });
      setHighlightedNpcs(highlights);
      setTimeout(() => setHighlightedNpcs(new Set()), 3000);
    }
  }, [currentToast, relationships]);
  
  if (relationships.length === 0) {
    return (
      <div className="border-simple p-4">
        <h3 className="text-sm font-bold mb-3 text-term-white">RELATIONSHIPS</h3>
        <p className="text-xs text-term-gray">No active relationships</p>
      </div>
    );
  }
  
  return (
    <div className="border-simple p-4">
      <h3 className="text-sm font-bold mb-3 text-term-white">RELATIONSHIPS</h3>
      <div className="space-y-2">
        {relationships.map((rel) => (
          <motion.div
            key={rel.npc.id}
            animate={highlightedNpcs.has(rel.npc.id) ? {
              scale: [1, 1.02, 1],
              opacity: [1, 0.8, 1]
            } : {}}
            transition={{ duration: 0.5, repeat: highlightedNpcs.has(rel.npc.id) ? 2 : 0 }}
            className="space-y-1 p-1 border-l-2 border-term-gray-dark pl-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-term-white">{rel.npc.name}</span>
                <span className="text-term-gray text-xs">({rel.relType})</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <RelationshipStat label="INT" value={rel.relStats.intimacy} />
              <RelationshipStat label="TRS" value={rel.relStats.trust} />
              <RelationshipStat label="ATT" value={rel.relStats.attraction} />
              <RelationshipStat label="CON" value={rel.relStats.conflict} isNegative />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RelationshipStat({ 
  label, 
  value, 
  isNegative = false 
}: { 
  label: string; 
  value: number; 
  isNegative?: boolean;
}) {
  const getColor = () => {
    if (isNegative) {
      return value > 50 ? 'text-term-red' : 'text-term-gray';
    }
    return value > 70 ? 'text-term-green' : value < 30 ? 'text-term-red' : 'text-term-white';
  };
  
  return (
    <div className="flex items-center gap-1">
      <span className="text-term-gray">{label}:</span>
      <span className={`${getColor()} font-mono text-xs`}>
        {value.toString().padStart(3, ' ')}
      </span>
    </div>
  );
}
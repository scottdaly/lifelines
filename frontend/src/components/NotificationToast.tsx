import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function NotificationToast() {
  const { currentToast } = useGameStore();
  
  if (!currentToast) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-term-black border border-term-yellow p-4 min-w-[300px] max-w-[500px]">
          <h4 className="text-term-yellow font-bold mb-2">{currentToast.summary}</h4>
          
          {Object.keys(currentToast.deltas).length > 0 && (
            <div className="flex gap-4 text-xs mb-2">
              {Object.entries(currentToast.deltas).map(([stat, change]) => (
                <div key={stat} className="flex items-center gap-1">
                  <span className="text-term-gray">{stat.toUpperCase()}:</span>
                  <span className={change > 0 ? 'text-term-green' : 'text-term-red'}>
                    {change > 0 ? '+' : ''}{change}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {currentToast.relHighlights.length > 0 && (
            <div className="text-xs text-term-gray">
              {currentToast.relHighlights.map((highlight, i) => (
                <div key={i}>{highlight}</div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
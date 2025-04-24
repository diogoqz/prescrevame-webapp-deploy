
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSuggestionsProps {
  suggestions: Array<{ term: string; description: string }>;
  showSuggestions: boolean;
  onSuggestionClick: (term: string) => void;
}

export const ChatSuggestions = ({ 
  suggestions, 
  showSuggestions, 
  onSuggestionClick 
}: ChatSuggestionsProps) => {
  if (!showSuggestions || !suggestions.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-full mb-2 w-full bg-whatsapp-header rounded-lg shadow-lg border border-whatsapp-accent/10 overflow-hidden"
      >
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.term)}
            className="w-full px-4 py-2 text-left hover:bg-whatsapp-accent/10 flex flex-col"
          >
            <span className="text-whatsapp-text">{suggestion.term}</span>
            <span className="text-xs text-whatsapp-textSecondary">{suggestion.description}</span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface InitialSuggestionsProps {
  suggestions: ReadonlyArray<{
    readonly title: string;
    readonly examples: ReadonlyArray<string>;
  }>;
  onSuggestionClick: (suggestion: string) => void;
}

export const InitialSuggestions = ({ suggestions, onSuggestionClick }: InitialSuggestionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col gap-2"
        >
          <h3 className="font-semibold text-whatsapp-text">{suggestion.title}</h3>
          <div className="flex flex-col gap-2">
            {suggestion.examples.map((example, exampleIndex) => (
              <Button
                key={exampleIndex}
                variant="outline"
                onClick={() => onSuggestionClick(example)}
                className="justify-start text-left h-auto py-3 text-sm text-whatsapp-textSecondary hover:text-whatsapp-text hover:bg-whatsapp-accent/10"
              >
                {example}
              </Button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

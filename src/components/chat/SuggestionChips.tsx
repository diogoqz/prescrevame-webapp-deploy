import React from 'react';
import { motion } from 'framer-motion';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSuggestionClick, disabled = false }) => {
  const suggestions = [
    "Como prescrever amoxicilina?",
    "Dosagem de paracetamol para adultos",
    "Interações medicamentosas com warfarina",
    "Protocolo para hipertensão arterial",
    "Tratamento para diabetes tipo 2",
    "Antibióticos para infecção urinária"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="px-4 py-6"
    >
      <div className="text-center mb-4">
        <p className="text-whatsapp-textSecondary text-sm">
          Escolha uma pergunta para começar:
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.1 * index,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: disabled ? 1 : 1.02,
              y: disabled ? 0 : -2
            }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => !disabled && onSuggestionClick(suggestion)}
            disabled={disabled}
            className={`
              p-3 rounded-lg text-left text-sm font-medium transition-all duration-200
              ${disabled 
                ? 'bg-whatsapp-inputBg text-whatsapp-textSecondary cursor-not-allowed opacity-50' 
                : 'bg-whatsapp-bubbleReceived text-whatsapp-text hover:bg-whatsapp-accent hover:text-white cursor-pointer shadow-sm hover:shadow-md'
              }
            `}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <p className="text-whatsapp-textSecondary text-xs">
          Ou digite sua própria pergunta abaixo
        </p>
      </div>
    </motion.div>
  );
};

export default SuggestionChips;

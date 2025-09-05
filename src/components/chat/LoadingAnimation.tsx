import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  isTyping: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ isTyping }) => {
  if (!isTyping) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center space-x-2 p-4 bg-whatsapp-message-bg rounded-lg max-w-xs"
    >
      {/* Avatar do bot */}
      <div className="w-8 h-8 rounded-full bg-prescrevame flex items-center justify-center">
        <span className="text-white text-xs font-bold">PM</span>
      </div>
      
      {/* Indicador de digitação */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
      
      {/* Texto "digitando..." */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-gray-500 ml-2"
      >
        digitando...
      </motion.span>
    </motion.div>
  );
};

export default LoadingAnimation; 

import React from 'react';
import { Image } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatDragOverlayProps {
  isDragging: boolean;
}

export const ChatDragOverlay = ({ isDragging }: ChatDragOverlayProps) => {
  if (!isDragging) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-whatsapp-header/90 flex items-center justify-center z-50 border-2 border-dashed border-prescrevame/50 backdrop-blur-sm"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="flex flex-col items-center gap-2"
      >
        <Image size={32} className="text-prescrevame" />
        <p className="text-prescrevame text-lg font-medium">Solte a imagem aqui</p>
      </motion.div>
    </motion.div>
  );
};

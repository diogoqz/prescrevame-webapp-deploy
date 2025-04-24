
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ChatImagePreviewProps {
  imagePreview: string | null;
  onRemoveImage: () => void;
}

export const ChatImagePreview = ({ imagePreview, onRemoveImage }: ChatImagePreviewProps) => {
  if (!imagePreview) return null;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-prescrevame/50"
    >
      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
      <Button 
        onClick={onRemoveImage}
        size="icon"
        variant="ghost"
        className="absolute top-0 right-0 bg-black/70 rounded-full p-1 text-white hover:bg-black"
      >
        <X size={16} />
      </Button>
    </motion.div>
  );
};


import React from 'react';
import { Send, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SendButtonProps {
  shouldShowSend: boolean;
  onSend: () => void;
  onImageUpload: () => void;
  isDisabled: boolean;
}

export const SendButton = ({
  shouldShowSend,
  onSend,
  onImageUpload,
  isDisabled
}: SendButtonProps) => {
  if (isDisabled) return null;
  
  return (
    <motion.div
      key={shouldShowSend ? "send" : "image"}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Button 
        onClick={shouldShowSend ? onSend : onImageUpload}
        variant="ghost"
        size="icon"
        className={`rounded-full ${shouldShowSend 
          ? 'text-prescrevame hover:bg-prescrevame/20' 
          : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'
        } transition-all`}
      >
        {shouldShowSend ? <Send size={24} /> : <Image size={24} />}
      </Button>
    </motion.div>
  );
};

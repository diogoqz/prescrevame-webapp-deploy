import React from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SendFileButtonProps {
  hasText: boolean;
  hasImage: boolean;
  onSend: (messageText?: string) => void;
  onFileUpload: () => void;
  isDisabled: boolean;
}

export const SendFileButton = ({
  hasText,
  hasImage,
  onSend,
  onFileUpload,
  isDisabled
}: SendFileButtonProps) => {
  if (isDisabled) return null;

  const shouldShowSend = hasText || hasImage;

  const handleSend = () => {
    onSend();
  };

  return (
    <Button 
      onClick={shouldShowSend ? handleSend : onFileUpload}
      variant="ghost"
      size="icon"
      className={`rounded-full ${
        shouldShowSend 
          ? 'text-prescrevame hover:bg-prescrevame/20' 
          : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'
      } transition-all duration-300`}
    >
      {shouldShowSend ? <Send size={24} /> : <Paperclip size={24} />}
    </Button>
  );
}; 
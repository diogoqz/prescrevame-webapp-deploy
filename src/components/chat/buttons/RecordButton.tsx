
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordButtonProps {
  onToggleRecording: () => void;
  isRecording: boolean;
  isProcessingAudio: boolean;
  disabled?: boolean;
}

export const RecordButton = ({
  onToggleRecording,
  isRecording,
  isProcessingAudio,
  disabled = false
}: RecordButtonProps) => {
  return (
    <Button 
      variant="ghost"
      size="icon"
      onClick={onToggleRecording}
      disabled={disabled || isProcessingAudio}
      className={`rounded-full ${isRecording 
        ? 'bg-prescrevame text-white hover:bg-prescrevame-dark' 
        : isProcessingAudio 
        ? 'text-gray-400 cursor-not-allowed' 
        : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'
      } transition-all duration-300`}
    >
      {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
    </Button>
  );
};

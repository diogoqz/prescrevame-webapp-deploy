
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordButtonProps {
  onToggleRecording: () => void;
  isRecording: boolean;
  isProcessingAudio: boolean;
  disabled?: boolean;
  disabledTitle?: string;
}

export const RecordButton = ({
  onToggleRecording,
  isRecording,
  isProcessingAudio,
  disabled = false,
  disabledTitle
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
      aria-label={disabled || isProcessingAudio ? (disabledTitle || 'Indisponível') : (isRecording ? 'Stop recording' : 'Start recording')}
      title={disabled || isProcessingAudio ? (disabledTitle || 'Indisponível') : (isRecording ? 'Stop recording' : 'Start recording')}
    >
      {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
    </Button>
  );
};

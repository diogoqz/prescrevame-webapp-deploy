
import React, { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttachmentButtonProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled: boolean;
  disabledTitle?: string;
}

export const AttachmentButton = ({
  onImageUpload,
  isDisabled,
  disabledTitle
}: AttachmentButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const openFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button 
        variant="ghost"
        size="icon"
        onClick={openFileUpload}
        disabled={isDisabled}
        className={`rounded-full ${isDisabled 
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'
        } transition-all duration-300`}
        title={isDisabled ? (disabledTitle || 'Indisponível') : 'Anexar imagem'}
      >
        <Paperclip size={24} />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImageUpload}
        accept="image/*"
        className="hidden"
        disabled={isDisabled}
      />
    </>
  );
};

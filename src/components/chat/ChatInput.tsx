
import React, { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginStep } from '@/hooks/useChatAuth';
import { RecordButton } from './buttons/RecordButton';
import { AttachmentButton } from './buttons/AttachmentButton';
import { SendButton } from './buttons/SendButton';
import { MessageInput } from './input/MessageInput';
import { ImagePreview } from './input/ImagePreview';
import { LoginPrompt } from './input/LoginPrompt';
import { ImageDropzone } from './input/ImageDropzone';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isTyping: boolean;
  loginStep: LoginStep;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  isProcessingAudio?: boolean;
  user: any;
  handleButtonClick: (id: string, label: string) => void;
}

export const ChatInput = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  onKeyDown,
  isTyping,
  loginStep,
  showPassword,
  setShowPassword,
  imagePreview,
  onImageUpload,
  onToggleRecording,
  isRecording,
  isProcessingAudio = false,
  user,
  handleButtonClick
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const openFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const event = new Event('input', { bubbles: true });
    if (fileInputRef.current) fileInputRef.current.dispatchEvent(event);
  };
  
  const handleDrop = (file: File) => {
    const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    onImageUpload(event);
  };
  
  const toggleShowPassword = () => setShowPassword(!showPassword);
  
  const handleLogin = () => handleButtonClick('login', 'Login');
  
  const shouldShowSendButton = (inputMessage.trim() || imagePreview) && !isRecording && !isProcessingAudio;
  const inputDisabled = isRecording || isProcessingAudio;
  const inputPlaceholder = isRecording 
    ? "Gravando áudio..." 
    : isProcessingAudio
    ? "Processando áudio..."
    : loginStep === 'password' 
    ? 'Digite sua senha' 
    : 'Digite uma mensagem';

  return (
    <ImageDropzone onDrop={handleDrop}>
      <div className="px-4 py-3 bg-whatsapp-header flex flex-col gap-3">
        <AnimatePresence>
          {imagePreview && (
            <ImagePreview 
              imageUrl={imagePreview} 
              onRemove={removeImage} 
            />
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-2">
          {!user && loginStep === 'idle' ? (
            <LoginPrompt onLogin={handleLogin} />
          ) : (
            <>
              {/* Mic button */}
              <RecordButton 
                onToggleRecording={onToggleRecording}
                isRecording={isRecording}
                isProcessingAudio={isProcessingAudio}
                disabled={!user} 
              />
              
              {/* Attachment button */}
              <AttachmentButton 
                onImageUpload={onImageUpload}
                isDisabled={inputDisabled || !user}
              />
              
              {/* Message input */}
              <div className={`flex-1 relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
                <MessageInput
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={onKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={inputDisabled}
                  placeholder={inputPlaceholder}
                  isPassword={loginStep === 'password'}
                  showPassword={showPassword}
                  toggleShowPassword={loginStep === 'password' ? toggleShowPassword : undefined}
                />
              </div>
              
              {/* Send/Image button */}
              <AnimatePresence mode="wait">
                <SendButton 
                  shouldShowSend={shouldShowSendButton}
                  onSend={onSendMessage}
                  onImageUpload={openFileUpload}
                  isDisabled={isRecording || isProcessingAudio}
                />
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </ImageDropzone>
  );
};

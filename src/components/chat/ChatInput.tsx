import React, { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginStep } from '@/hooks/useChatAuth';
import { RecordButton } from './buttons/RecordButton';
import { SendFileButton } from './buttons/SendFileButton';
import { MessageInput } from './input/MessageInput';
import { ImagePreview } from './input/ImagePreview';
import { LoginPrompt } from './input/LoginPrompt';
import { ImageDropzone } from './input/ImageDropzone';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
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
  userStatus?: 'ativo' | 'bloqueado' | null;
  isTrial?: boolean;
  handleButtonClick: (id: string, label: string) => void;
  onRemoveImage: () => void;
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
  userStatus,
  isTrial = false,
  handleButtonClick,
  onRemoveImage
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
    onImageUpload({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>);
  };
  
  const handleDrop = (file: File) => {
    const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    onImageUpload(event);
  };
  
  const toggleShowPassword = () => setShowPassword(!showPassword);
  
  const handleLogin = () => handleButtonClick('login', 'Login');
  
  const hasText = inputMessage.trim().length > 0;
  const inputDisabled = isRecording || isProcessingAudio || userStatus === 'bloqueado';
  const trialDisabledTitle = 'Indisponível na versão trial';
  const inputPlaceholder = userStatus === 'bloqueado'
    ? "Acesso bloqueado"
    : isRecording 
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
              onRemove={onRemoveImage} 
            />
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-2">
          {!user && loginStep === 'idle' ? (
            <LoginPrompt onLogin={handleLogin} />
          ) : (
            <>
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
              
              {/* Send/File button */}
              <SendFileButton 
                hasText={hasText}
                hasImage={!!imagePreview}
                onSend={() => onSendMessage(inputMessage)}
                onFileUpload={openFileUpload}
                isDisabled={inputDisabled || !user || isTrial}
              />
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
                disabled={inputDisabled || !user || isTrial}
              />
              
              {/* Mic button */}
              <RecordButton 
                onToggleRecording={onToggleRecording}
                isRecording={isRecording}
                isProcessingAudio={isProcessingAudio}
                disabled={!user || isTrial} 
                disabledTitle={trialDisabledTitle}
              />
            </>
          )}
        </div>
      </div>
    </ImageDropzone>
  );
};

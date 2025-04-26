
import React, { useRef, useState, useCallback } from 'react';
import { Send, Mic, Paperclip, Image, MicOff, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginStep } from '@/hooks/useChatAuth';
import { useChatSuggestions } from '@/hooks/useChatSuggestions';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatImagePreview } from './ChatImagePreview';
import { ChatDragOverlay } from './ChatDragOverlay';

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
  user,
  handleButtonClick
}: ChatInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, showSuggestions, setShowSuggestions } = useChatSuggestions(inputMessage, user);

  const openFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX < rect.left || 
        clientX > rect.right || 
        clientY < rect.top || 
        clientY > rect.bottom
      ) {
        setIsDragging(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
        onImageUpload(event);
      }
    }
  }, [onImageUpload]);

  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const event = new Event('input', { bubbles: true });
    if (fileInputRef.current) fileInputRef.current.dispatchEvent(event);
  };

  const handleSuggestionClick = (term: string) => {
    setInputMessage(term);
    setShowSuggestions(false);
  };

  return (
    <div 
      ref={dropZoneRef}
      className="px-4 py-3 bg-whatsapp-header flex flex-col gap-3 relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        <ChatDragOverlay isDragging={isDragging} />
      </AnimatePresence>
      
      <AnimatePresence>
        <ChatImagePreview 
          imagePreview={imagePreview} 
          onRemoveImage={removeImage} 
        />
      </AnimatePresence>
      
      <div className="flex items-center gap-2 relative">
        {!user && loginStep === 'idle' ? (
          <div className="flex-1 text-center">
            <Button
              onClick={() => handleButtonClick('login', 'Login')}
              className="py-2 px-4 bg-prescrevame text-black rounded-md text-sm font-medium transition-colors hover:bg-prescrevame-dark flex items-center justify-center gap-2 w-full animate-fade-in"
            >
              <LogIn size={20} />
              Faça login para enviar mensagens
            </Button>
          </div>
        ) : (
          <>
            <Button 
              variant="ghost"
              size="icon"
              onClick={onToggleRecording}
              className="rounded-full text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg transition-all duration-300"
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={openFileUpload}
              className="rounded-full text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg transition-all duration-300"
            >
              <Paperclip size={24} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
              />
            </Button>
            
            <div className={`flex-1 relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder={loginStep === 'password' ? 'Digite sua senha' : 'Digite uma mensagem'}
                className="w-full px-4 py-2 rounded-full bg-whatsapp-inputBg text-whatsapp-text placeholder-whatsapp-textSecondary focus:outline-none focus:ring-1 focus:ring-prescrevame transition-all"
                {...(loginStep === 'password' ? { type: showPassword ? 'text' : 'password' } : {})}
              />
              
              <ChatSuggestions 
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />
              
              {loginStep === 'password' && (
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-whatsapp-textSecondary hover:text-prescrevame transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {inputMessage.trim() || imagePreview ? (
                <motion.div
                  key="send"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    onClick={onSendMessage}
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-prescrevame hover:bg-prescrevame/20 transition-all"
                  >
                    <Send size={24} />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="image"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={openFileUpload}
                    className="rounded-full text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg"
                  >
                    <Image size={24} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

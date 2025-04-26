
import React, { useRef, useState, useCallback } from 'react';
import { Send, Mic, Paperclip, Image, X, MicOff, Eye, EyeOff, LogIn } from 'lucide-react';
import { LoginStep } from '@/hooks/useChatAuth';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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
        {isDragging && (
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
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {imagePreview && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-prescrevame/50"
          >
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <Button 
              onClick={removeImage}
              size="icon"
              variant="ghost"
              className="absolute top-0 right-0 bg-black/70 rounded-full p-1 text-white hover:bg-black"
            >
              <X size={16} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-2">
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
            {/* Mic icon first */}
            <Button 
              variant="ghost"
              size="icon"
              onClick={onToggleRecording}
              disabled={isProcessingAudio}
              className={`rounded-full ${isRecording 
                ? 'bg-prescrevame text-white hover:bg-prescrevame-dark' 
                : isProcessingAudio 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'
              } transition-all duration-300`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>
            
            {/* Paperclip icon second */}
            <Button 
              variant="ghost"
              size="icon"
              onClick={openFileUpload}
              disabled={isRecording || isProcessingAudio}
              className={`rounded-full ${isRecording || isProcessingAudio 
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'
              } transition-all duration-300`}
            >
              <Paperclip size={24} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
                disabled={isRecording || isProcessingAudio}
              />
            </Button>
            
            <div className={`flex-1 relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isRecording || isProcessingAudio}
                placeholder={
                  isRecording 
                    ? "Gravando áudio..." 
                    : isProcessingAudio
                    ? "Processando áudio..."
                    : loginStep === 'password' 
                    ? 'Digite sua senha' 
                    : 'Digite uma mensagem'
                }
                className={`w-full px-4 py-2 rounded-full bg-whatsapp-inputBg text-whatsapp-text placeholder-whatsapp-textSecondary focus:outline-none focus:ring-1 focus:ring-prescrevame transition-all ${(isRecording || isProcessingAudio) ? 'opacity-50 cursor-not-allowed' : ''}`}
                {...(loginStep === 'password' ? { type: showPassword ? 'text' : 'password' } : {})}
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
            
            {/* Image/Send button on the right */}
            <AnimatePresence mode="wait">
              {(inputMessage.trim() || imagePreview) && !isRecording && !isProcessingAudio ? (
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
              ) : !isRecording && !isProcessingAudio && (
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
                    disabled={isRecording || isProcessingAudio}
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

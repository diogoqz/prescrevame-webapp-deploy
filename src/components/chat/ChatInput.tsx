
import React, { useRef, useState } from 'react';
import { Send, Paperclip, Mic, MicOff, Image, Eye, EyeOff, LogIn, X } from 'lucide-react';
import { LoginStep } from '@/hooks/useChatAuth';
import { Button } from '@/components/ui/button';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const openImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Need to call a function to clear the image preview in the parent component
    // This would be implemented in WhatsAppChat.tsx with a new prop
    const event = new Event('input', { bubbles: true });
    if (fileInputRef.current) fileInputRef.current.dispatchEvent(event);
  };

  return (
    <div className="px-4 py-3 bg-whatsapp-header flex flex-col gap-3">
      {imagePreview && (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-prescrevame/50 animate-scale-up">
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          <button 
            onClick={removeImage}
            className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white hover:bg-black"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
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
            <Button 
              variant="ghost"
              size="icon"
              onClick={openImageUpload}
              className={`rounded-full transition-all duration-300 ${isFocused ? 'scale-0 opacity-0 w-0' : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'}`}
            >
              <Image size={24} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
              />
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              className={`rounded-full text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg transition-all duration-300 ${isFocused ? 'scale-0 opacity-0 w-0' : ''}`}
            >
              <Paperclip size={24} />
            </Button>
            
            <div className={`flex-1 relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={loginStep === 'password' ? 'Digite sua senha' : 'Digite uma mensagem'}
                className="w-full px-4 py-2 rounded-full bg-whatsapp-inputBg text-whatsapp-text placeholder-whatsapp-textSecondary focus:outline-none focus:ring-1 focus:ring-prescrevame transition-all"
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
            
            {inputMessage.trim() || imagePreview ? (
              <Button 
                onClick={onSendMessage}
                variant="ghost"
                size="icon"
                className="rounded-full text-prescrevame hover:bg-prescrevame/20 transition-all animate-scale-up"
              >
                <Send size={24} />
              </Button>
            ) : (
              <Button 
                onClick={onToggleRecording}
                variant="ghost"
                size="icon"
                className="rounded-full text-prescrevame hover:bg-prescrevame/20 transition-all"
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

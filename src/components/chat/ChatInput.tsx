
import React, { useRef } from 'react';
import { Send, Paperclip, Mic, MicOff, Image, Eye, EyeOff, LogIn } from 'lucide-react';
import { LoginStep } from '@/hooks/useChatAuth';

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

  const openImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="px-4 py-3 bg-whatsapp-header flex items-center gap-2">
      {!user && loginStep === 'idle' ? (
        <div className="flex-1 text-center">
          <button
            onClick={() => handleButtonClick('login', 'Login')}
            className="py-2 px-4 bg-whatsapp-accent text-white rounded-md text-sm font-medium transition-colors hover:bg-opacity-90 flex items-center justify-center gap-2 w-full"
          >
            <LogIn size={20} />
            Faça login para enviar mensagens
          </button>
        </div>
      ) : (
        <>
          <button 
            onClick={openImageUpload}
            className="text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors"
          >
            <Image size={24} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageUpload}
              accept="image/*"
              className="hidden"
            />
          </button>
          
          <button 
            className="text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors"
          >
            <Paperclip size={24} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={loginStep === 'password' ? 'Digite sua senha' : 'Digite uma mensagem'}
              className="w-full px-4 py-2 rounded-full bg-whatsapp-inputBg text-whatsapp-text placeholder-whatsapp-textSecondary focus:outline-none"
              {...(loginStep === 'password' ? { type: showPassword ? 'text' : 'password' } : {})}
            />
            {loginStep === 'password' && (
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-whatsapp-textSecondary hover:text-whatsapp-accent transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </div>
          
          {inputMessage.trim() || imagePreview ? (
            <button 
              onClick={onSendMessage}
              className="text-whatsapp-accent hover:text-whatsapp-text transition-colors"
            >
              <Send size={24} />
            </button>
          ) : (
            <button 
              onClick={onToggleRecording}
              className="text-whatsapp-accent hover:text-whatsapp-text transition-colors"
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
          )}
        </>
      )}
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { Send, Image, Mic, MicOff, Eye, EyeOff, LogIn, X } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);

  const openImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onImageUpload(event);
    }
  };

  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const event = new Event('input', { bubbles: true });
    if (fileInputRef.current) fileInputRef.current.dispatchEvent(event);
  };

  return (
    <div 
      className="px-4 py-3 bg-whatsapp-header flex flex-col gap-3"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-whatsapp-header/90 flex items-center justify-center z-50 border-2 border-dashed border-prescrevame/50">
          <p className="text-prescrevame text-lg">Solte a imagem aqui</p>
        </div>
      )}
      
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
              onClick={onToggleRecording}
              className={`rounded-full transition-all duration-300 ${isFocused ? 'scale-0 opacity-0 w-0' : 'text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg'}`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={openImageUpload}
              className={`rounded-full text-whatsapp-textSecondary hover:text-prescrevame hover:bg-whatsapp-inputBg transition-all duration-300 ${isFocused ? 'scale-0 opacity-0 w-0' : ''}`}
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

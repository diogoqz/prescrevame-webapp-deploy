
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  isPassword?: boolean;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const MessageInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  isPassword = false,
  showPassword = false,
  toggleShowPassword,
  disabled = false,
  onFocus,
  onBlur
}: MessageInputProps) => {
  return (
    <div className="relative w-full">
      <input
        type={isPassword ? (showPassword ? 'text' : 'password') : 'text'}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-full bg-whatsapp-inputBg text-whatsapp-text placeholder-whatsapp-textSecondary focus:outline-none focus:ring-1 focus:ring-prescrevame transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {isPassword && toggleShowPassword && (
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-whatsapp-textSecondary hover:text-prescrevame transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

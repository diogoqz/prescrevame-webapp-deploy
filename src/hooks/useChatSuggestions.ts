
import { useState, useEffect } from 'react';
import { AppConfig } from '@/config/app.config';

export const useChatSuggestions = (inputMessage: string, user: any) => {
  const [suggestions, setSuggestions] = useState<Array<{ term: string; description: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!inputMessage || !user) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matchedTerms = AppConfig.chat.commonTerms.filter(item =>
      item.term.toLowerCase().includes(inputMessage.toLowerCase())
    );

    setSuggestions(matchedTerms);
    setShowSuggestions(matchedTerms.length > 0);
  }, [inputMessage, user]);

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions
  };
};

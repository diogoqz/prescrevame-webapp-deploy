import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/Message';
import { chatPersistenceService } from '@/services/chatPersistenceService';

export const useChatPersistence = (userEmail: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Verificar status da conexão Redis
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await chatPersistenceService.getConnectionStatus();
      setIsConnected(connected);
    };

    checkConnection();
    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Carregar mensagens do Redis quando o usuário fizer login
  const loadMessages = useCallback(async (): Promise<Message[]> => {
    if (!userEmail || !isConnected) {
      return [];
    }

    setIsLoading(true);
    try {
      const messages = await chatPersistenceService.loadMessages(userEmail);
      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, isConnected]);

  // Salvar mensagens no Redis
  const saveMessages = useCallback(async (messages: Message[]): Promise<boolean> => {
    if (!userEmail || !isConnected) {
      return false;
    }

    try {
      return await chatPersistenceService.saveMessages(userEmail, messages);
    } catch (error) {
      console.error('Error saving messages:', error);
      return false;
    }
  }, [userEmail, isConnected]);

  // Adicionar uma nova mensagem
  const addMessage = useCallback(async (message: Message): Promise<boolean> => {
    if (!userEmail || !isConnected) {
      return false;
    }

    try {
      return await chatPersistenceService.addMessage(userEmail, message);
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }, [userEmail, isConnected]);

  // Limpar todas as mensagens
  const clearMessages = useCallback(async (): Promise<boolean> => {
    if (!userEmail || !isConnected) {
      return false;
    }

    try {
      return await chatPersistenceService.clearMessages(userEmail);
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  }, [userEmail, isConnected]);

  return {
    isLoading,
    isConnected,
    loadMessages,
    saveMessages,
    addMessage,
    clearMessages
  };
};

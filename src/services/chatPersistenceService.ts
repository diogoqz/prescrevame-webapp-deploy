import { Message } from '@/types/Message';

class ChatPersistenceService {
  private isConnected = false;
  private redisUrl = 'redis://default:54421f870aab2466604b@3gbyjx.easypanel.host:9987';

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Para o frontend, vamos usar uma abordagem diferente
      // Vamos criar um endpoint no backend para gerenciar o Redis
      this.isConnected = true;
      console.log('Chat Persistence Service initialized (using backend API)');
    } catch (error) {
      console.error('Failed to initialize Chat Persistence:', error);
      this.isConnected = false;
    }
  }

  private getUserChatKey(userEmail: string): string {
    return `chat:${userEmail}`;
  }

  private serializeMessage(message: Message): string {
    return JSON.stringify({
      ...message,
      timestamp: message.timestamp.toISOString()
    });
  }

  private deserializeMessage(serializedMessage: string): Message {
    const parsed = JSON.parse(serializedMessage);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp)
    };
  }

  async saveMessages(userEmail: string, messages: Message[]): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('Chat persistence not available, messages not saved');
      return false;
    }

    try {
      // Por enquanto, vamos usar localStorage como fallback
      const key = this.getUserChatKey(userEmail);
      const serializedMessages = messages.map(msg => this.serializeMessage(msg));
      
      localStorage.setItem(key, JSON.stringify(serializedMessages));
      console.log(`Saved ${messages.length} messages to localStorage for ${userEmail}`);
      
      return true;
    } catch (error) {
      console.error('Error saving messages:', error);
      return false;
    }
  }

  async loadMessages(userEmail: string): Promise<Message[]> {
    if (!this.isConnected) {
      console.warn('Chat persistence not available, returning empty messages');
      return [];
    }

    try {
      const key = this.getUserChatKey(userEmail);
      const storedData = localStorage.getItem(key);
      
      if (!storedData) {
        return [];
      }

      const serializedMessages = JSON.parse(storedData);
      
      if (!Array.isArray(serializedMessages) || serializedMessages.length === 0) {
        return [];
      }

      // Converter de volta para objetos Message
      return serializedMessages.map((serialized: string) => this.deserializeMessage(serialized));
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  async addMessage(userEmail: string, message: Message): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('Chat persistence not available, message not saved');
      return false;
    }

    try {
      // Carregar mensagens existentes
      const existingMessages = await this.loadMessages(userEmail);
      
      // Adicionar nova mensagem
      const updatedMessages = [...existingMessages, message];
      
      // Salvar todas as mensagens
      return await this.saveMessages(userEmail, updatedMessages);
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  async clearMessages(userEmail: string): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('Chat persistence not available, messages not cleared');
      return false;
    }

    try {
      const key = this.getUserChatKey(userEmail);
      localStorage.removeItem(key);
      console.log(`Cleared messages for ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  }

  async getConnectionStatus(): Promise<boolean> {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Chat persistence service disconnected');
  }
}

// Exportar uma instância singleton
export const chatPersistenceService = new ChatPersistenceService();

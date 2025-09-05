import { createClient } from 'redis';
import { Message } from '@/types/Message';

class ChatPersistenceService {
  private client: any = null;
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.client = createClient({
        url: 'redis://default:54421f870aab2466604b@3gbyjx.easypanel.host:9987'
      });

      this.client.on('error', (err: any) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
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
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, messages not saved');
      return false;
    }

    try {
      const key = this.getUserChatKey(userEmail);
      const serializedMessages = messages.map(msg => this.serializeMessage(msg));
      
      // Salvar as mensagens como uma lista no Redis
      await this.client.del(key); // Limpar mensagens antigas
      
      if (serializedMessages.length > 0) {
        await this.client.lPush(key, ...serializedMessages);
        // Definir expiração de 30 dias
        await this.client.expire(key, 30 * 24 * 60 * 60);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving messages to Redis:', error);
      return false;
    }
  }

  async loadMessages(userEmail: string): Promise<Message[]> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, returning empty messages');
      return [];
    }

    try {
      const key = this.getUserChatKey(userEmail);
      const serializedMessages = await this.client.lRange(key, 0, -1);
      
      if (!serializedMessages || serializedMessages.length === 0) {
        return [];
      }

      // Converter de volta para objetos Message e inverter a ordem (Redis lPush adiciona no início)
      return serializedMessages
        .reverse()
        .map((serialized: string) => this.deserializeMessage(serialized));
    } catch (error) {
      console.error('Error loading messages from Redis:', error);
      return [];
    }
  }

  async addMessage(userEmail: string, message: Message): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, message not saved');
      return false;
    }

    try {
      const key = this.getUserChatKey(userEmail);
      const serializedMessage = this.serializeMessage(message);
      
      await this.client.lPush(key, serializedMessage);
      // Definir expiração de 30 dias
      await this.client.expire(key, 30 * 24 * 60 * 60);
      
      return true;
    } catch (error) {
      console.error('Error adding message to Redis:', error);
      return false;
    }
  }

  async clearMessages(userEmail: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, messages not cleared');
      return false;
    }

    try {
      const key = this.getUserChatKey(userEmail);
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Error clearing messages from Redis:', error);
      return false;
    }
  }

  async getConnectionStatus(): Promise<boolean> {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }
}

// Exportar uma instância singleton
export const chatPersistenceService = new ChatPersistenceService();

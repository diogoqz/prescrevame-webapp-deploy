
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
  image?: string;
}

interface MessageButton {
  id: string;
  label: string;
}

export const useWebhookMessages = () => {
  const { toast } = useToast();
  const [isTyping, setIsTyping] = useState(false);

  const processWebhookResponse = (responseData: any): string[] => {
    console.log('Processing webhook response:', responseData);
    const replies: string[] = [];

    try {
      // Caso 1: Resposta direta do webhook sem array
      if (!Array.isArray(responseData)) {
        // Se tiver o campo "reply", é uma única mensagem
        if (responseData.reply) {
          replies.push(responseData.reply);
        }
        // Se tiver o campo "replies", são múltiplas mensagens
        else if (responseData.replies && Array.isArray(responseData.replies)) {
          responseData.replies.forEach((reply: string) => {
            replies.push(reply);
          });
        }
      } 
      // Caso 2: Array de resultados do webhook
      else if (Array.isArray(responseData)) {
        responseData.forEach(item => {
          if (item.result) {
            try {
              // Tentar fazer parse do result se for string
              const parsedResult = typeof item.result === 'string' 
                ? JSON.parse(item.result) 
                : item.result;
              
              // Caso 2.1: campo "reply" em parsedResult
              if (parsedResult.reply) {
                replies.push(parsedResult.reply);
              }
              // Caso 2.2: campo "replies" em parsedResult
              else if (parsedResult.replies && Array.isArray(parsedResult.replies)) {
                parsedResult.replies.forEach((reply: string) => {
                  replies.push(reply);
                });
              }
              // Caso 2.3: parsedResult é uma string
              else if (typeof parsedResult === 'string') {
                replies.push(parsedResult);
              }
            } catch (e) {
              console.error('Erro ao processar o resultado:', e);
              // Se não conseguir fazer parse, usar o item.result diretamente se for string
              if (typeof item.result === 'string') {
                try {
                  // Tenta fazer parse diretamente do result
                  const directResult = JSON.parse(item.result);
                  if (directResult.reply) {
                    replies.push(directResult.reply);
                  } else if (directResult.replies && Array.isArray(directResult.replies)) {
                    directResult.replies.forEach((reply: string) => {
                      replies.push(reply);
                    });
                  }
                } catch (innerError) {
                  // Se falhar em fazer parse como JSON, use como texto puro
                  replies.push(item.result);
                }
              }
            }
          }
        });
      }

      if (replies.length === 0) {
        replies.push('Não foi possível processar a resposta.');
      }
    } catch (error) {
      console.error('Error processing webhook response:', error);
      replies.push('Erro ao processar a resposta.');
    }

    return replies;
  };

  const sendMessageToWebhook = async (formData: FormData): Promise<Message[]> => {
    setIsTyping(true);
    try {
      const response = await fetch('https://app-n8n.icogub.easypanel.host/webhook/f54cf431-4260-4e9f-ac60-c7d5feab9c35', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const responseData = await response.json();
      const replies = processWebhookResponse(responseData);
      
      return replies.map((reply, index) => ({
        id: Date.now().toString() + '-' + index,
        text: reply,
        sender: 'bot',
        timestamp: new Date()
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsTyping(false);
    }
  };

  return {
    isTyping,
    sendMessageToWebhook
  };
};

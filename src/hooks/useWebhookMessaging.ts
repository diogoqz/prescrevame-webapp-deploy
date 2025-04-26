
import { useState } from 'react';
import { Message } from '@/types/Message';
import { formatMessage } from '@/utils/messageFormatters';

/**
 * Hook for handling webhook message functionality
 */
export const useWebhookMessaging = () => {
  const [isMessaging, setIsMessaging] = useState(false);

  /**
   * Sends a message to the webhook and processes the response
   */
  const sendWebhookMessage = async (
    data: {
      message?: string;
      image?: string;
      sessionId: string;
    }
  ): Promise<Message[]> => {
    setIsMessaging(true);
    const messages: Message[] = [];

    try {
      console.log('Enviando dados para webhook:', data);

      const response = await fetch('https://app-n8n.icogub.easypanel.host/webhook/f54cf431-4260-4e9f-ac60-c7d5feab9c35', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Resposta do webhook:', responseData);

      const currentTimestamp = new Date();
      
      // Primeiro, verifique se responseData é um array
      if (Array.isArray(responseData)) {
        let delayIndex = 0;
        
        // Processar cada item do array
        for (let i = 0; i < responseData.length; i++) {
          const item = responseData[i];
          
          if (item && typeof item === 'object' && item.result) {
            try {
              const parsedResult = JSON.parse(item.result);
              
              // Caso 1: Se temos um campo "reply" único
              if (parsedResult.reply) {
                messages.push({
                  id: `${Date.now()}-${i}`,
                  text: formatMessage(parsedResult.reply),
                  sender: 'bot',
                  timestamp: new Date(currentTimestamp.getTime() + (delayIndex * 1000))
                });
                delayIndex++;
              }
              // Caso 2: Se temos um array de "replies"
              else if (parsedResult.replies && Array.isArray(parsedResult.replies)) {
                parsedResult.replies.forEach((reply: string, replyIndex: number) => {
                  messages.push({
                    id: `${Date.now()}-${i}-${replyIndex}`,
                    text: formatMessage(reply),
                    sender: 'bot',
                    timestamp: new Date(currentTimestamp.getTime() + (delayIndex * 1000))
                  });
                  delayIndex++;
                });
              }
            } catch (err) {
              console.error('Erro ao analisar JSON de resultado:', err, item.result);
              messages.push({
                id: `${Date.now()}-${i}`,
                text: typeof item.result === 'string' ? formatMessage(item.result) : JSON.stringify(item.result),
                sender: 'bot',
                timestamp: new Date(currentTimestamp.getTime() + (delayIndex * 1000))
              });
              delayIndex++;
            }
          }
        }
      } 
      // Caso a resposta não seja um array, mas um objeto direto com campo reply
      else if (responseData && typeof responseData === 'object') {
        if (responseData.reply) {
          messages.push({
            id: Date.now().toString(),
            text: formatMessage(responseData.reply),
            sender: 'bot',
            timestamp: currentTimestamp
          });
        }
        // Caso tenha um array de replies
        else if (responseData.replies && Array.isArray(responseData.replies)) {
          responseData.replies.forEach((reply: string, index: number) => {
            messages.push({
              id: `${Date.now()}-${index}`,
              text: formatMessage(reply),
              sender: 'bot',
              timestamp: new Date(currentTimestamp.getTime() + (index * 1000))
            });
          });
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem para webhook:', error);
      messages.push({
        id: Date.now().toString(),
        text: "Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.",
        sender: 'bot',
        timestamp: new Date()
      });
    } finally {
      setTimeout(() => {
        setIsMessaging(false);
      }, 500);
    }

    return messages;
  };

  return {
    isMessaging,
    sendWebhookMessage
  };
};

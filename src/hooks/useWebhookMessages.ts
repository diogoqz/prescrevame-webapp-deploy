
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
      if (Array.isArray(responseData)) {
        responseData.forEach(item => {
          if (item.result) {
            try {
              // Parse the result if it's a string
              const parsedResult = typeof item.result === 'string' 
                ? JSON.parse(item.result) 
                : item.result;
              
              // Handle "replies" array
              if (parsedResult.replies && Array.isArray(parsedResult.replies)) {
                // Each item in replies becomes a separate message
                parsedResult.replies.forEach((reply: string) => {
                  replies.push(reply);
                });
              } 
              // Handle single "reply"
              else if (typeof parsedResult.reply === 'string') {
                replies.push(parsedResult.reply);
              } 
              // If parsedResult itself is a string
              else if (typeof parsedResult === 'string') {
                replies.push(parsedResult);
              }
            } catch (e) {
              // If parsing fails, use the raw result string
              if (typeof item.result === 'string') {
                replies.push(item.result);
              }
            }
          }
        });
      } else if (responseData && responseData.result) {
        // Handle non-array response
        try {
          const resultData = typeof responseData.result === 'string' 
            ? JSON.parse(responseData.result)
            : responseData.result;

          if (resultData.replies && Array.isArray(resultData.replies)) {
            // Each reply becomes a separate message
            resultData.replies.forEach((reply: string) => {
              replies.push(reply);
            });
          } else if (typeof resultData.reply === 'string') {
            replies.push(resultData.reply);
          }
        } catch (error) {
          if (typeof responseData.result === 'string') {
            replies.push(responseData.result);
          }
        }
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

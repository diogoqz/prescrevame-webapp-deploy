
import { useState } from 'react';
import { Message } from '@/types/Message';

export const useWebhookMessages = () => {
  const [isTyping, setIsTyping] = useState(false);

  const formatMessage = (text: string): string => {
    // Replace escaped characters and format markdown-style text
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  };

  const sendMessageToWebhook = async (formData: FormData) => {
    setIsTyping(true);
    const messages: Message[] = [];

    try {
      // Converter a imagem para base64, se existir
      let imageBase64: string | null = null;
      const imageFile = formData.get('image') as File | null;

      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      // Atualizar o objeto de dados para incluir a imagem como base64
      const data = {
        message: formData.get('message'),
        image: imageBase64
      };

      console.log('Sending data to webhook:', data);

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
      console.log('Response from webhook:', responseData);

      const currentTimestamp = new Date();
      
      if (responseData && Array.isArray(responseData)) {
        responseData.forEach((item, index) => {
          if (typeof item === 'object' && item !== null && item.result) {
            try {
              const parsedResult = JSON.parse(item.result);
              
              if (parsedResult.reply) {
                messages.push({
                  id: `${Date.now()}-${index}`,
                  text: formatMessage(parsedResult.reply),
                  sender: 'bot',
                  timestamp: currentTimestamp
                });
              } else if (parsedResult.replies && Array.isArray(parsedResult.replies)) {
                parsedResult.replies.forEach((reply: string, replyIndex: number) => {
                  messages.push({
                    id: `${Date.now()}-${index}-${replyIndex}`,
                    text: formatMessage(reply),
                    sender: 'bot',
                    timestamp: new Date(currentTimestamp.getTime() + (replyIndex * 1000))
                  });
                });
              }
            } catch (err) {
              console.error('Error parsing result JSON:', err, item.result);
              messages.push({
                id: `${Date.now()}-${index}`,
                text: typeof item.result === 'string' ? formatMessage(item.result) : JSON.stringify(item.result),
                sender: 'bot',
                timestamp: currentTimestamp
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      messages.push({
        id: Date.now().toString(),
        text: "Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.",
        sender: 'bot',
        timestamp: new Date()
      });
    } finally {
      setTimeout(() => {
        setIsTyping(false);
      }, 500);
    }

    return messages;
  };

  return { isTyping, sendMessageToWebhook };
};

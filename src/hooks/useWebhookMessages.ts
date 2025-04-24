
import { useState } from 'react';
import { Message } from '@/types/Message';

export const useWebhookMessages = () => {
  const [isTyping, setIsTyping] = useState(false);

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

      // Create a timestamp to ensure messages have unique IDs but appear at the same time
      const currentTimestamp = new Date();
      
      // Process the response data
      if (responseData && Array.isArray(responseData)) {
        // Handle array of response objects
        responseData.forEach((item, index) => {
          if (typeof item === 'object' && item !== null && item.result) {
            try {
              // Parse the result string to get the JSON content
              const parsedResult = JSON.parse(item.result);
              
              // Handle single reply format: { reply: "message" }
              if (parsedResult.reply) {
                messages.push({
                  id: `${Date.now()}-${index}`,
                  text: parsedResult.reply,
                  sender: 'bot',
                  timestamp: currentTimestamp
                });
              }
              // Handle multiple replies format: { replies: ["message1", "message2"] }
              else if (parsedResult.replies && Array.isArray(parsedResult.replies)) {
                parsedResult.replies.forEach((reply: string, replyIndex: number) => {
                  messages.push({
                    id: `${Date.now()}-${index}-${replyIndex}`,
                    text: reply,
                    sender: 'bot',
                    timestamp: new Date(currentTimestamp.getTime() + (replyIndex * 1000)) // 1 second interval between messages
                  });
                });
              } else {
                // Fallback for other structures
                messages.push({
                  id: `${Date.now()}-${index}`,
                  text: JSON.stringify(parsedResult),
                  sender: 'bot',
                  timestamp: currentTimestamp
                });
              }
            } catch (err) {
              console.error('Error parsing result JSON:', err, item.result);
              messages.push({
                id: `${Date.now()}-${index}`,
                text: typeof item.result === 'string' ? item.result : JSON.stringify(item.result),
                sender: 'bot',
                timestamp: currentTimestamp
              });
            }
          } else if (typeof item === 'string') {
            messages.push({
              id: `${Date.now()}-${index}`,
              text: item,
              sender: 'bot',
              timestamp: currentTimestamp
            });
          } else {
            messages.push({
              id: `${Date.now()}-${index}`,
              text: JSON.stringify(item),
              sender: 'bot',
              timestamp: currentTimestamp
            });
          }
        });
      } else if (responseData && typeof responseData === 'object') {
        // Handle case where response is a single object
        messages.push({
          id: Date.now().toString(),
          text: responseData.text || responseData.message || JSON.stringify(responseData),
          sender: 'bot',
          timestamp: currentTimestamp
        });
      } else {
        console.warn('Resposta do webhook não está no formato esperado:', responseData);
        messages.push({
          id: Date.now().toString(),
          text: "Resposta do servidor recebida, mas em formato não esperado.",
          sender: 'bot',
          timestamp: currentTimestamp
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

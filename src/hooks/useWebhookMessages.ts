
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

      if (responseData && Array.isArray(responseData)) {
        // Create a timestamp to ensure messages have unique IDs but appear at the same time
        const currentTimestamp = new Date();
        
        responseData.forEach((item, index) => {
          if (typeof item === 'string') {
            messages.push({
              id: `${Date.now()}-${index}`,
              text: item,
              sender: 'bot',
              timestamp: currentTimestamp
            });
          } else if (typeof item === 'object' && item !== null) {
            // Handle different possible object structures
            if ('text' in item) {
              messages.push({
                id: `${Date.now()}-${index}`,
                text: String(item.text),
                sender: 'bot',
                timestamp: currentTimestamp
              });
            } else if ('message' in item) {
              messages.push({
                id: `${Date.now()}-${index}`,
                text: String(item.message),
                sender: 'bot',
                timestamp: currentTimestamp
              });
            } else {
              // If structure is unknown, convert to string
              messages.push({
                id: `${Date.now()}-${index}`,
                text: JSON.stringify(item),
                sender: 'bot',
                timestamp: currentTimestamp
              });
            }
          }
        });
      } else if (responseData && typeof responseData === 'object') {
        // Handle case where response is a single object instead of array
        messages.push({
          id: Date.now().toString(),
          text: responseData.text || responseData.message || JSON.stringify(responseData),
          sender: 'bot',
          timestamp: new Date()
        });
      } else {
        console.warn('Resposta do webhook não está no formato esperado:', responseData);
        messages.push({
          id: Date.now().toString(),
          text: "Resposta do servidor recebida, mas em formato não esperado.",
          sender: 'bot',
          timestamp: new Date()
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

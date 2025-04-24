import { useState } from 'react';
import { Message } from '@/types/Message';

// Modificamos a função para enviar imagens como base64
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
        responseData.forEach(item => {
          if (typeof item === 'string') {
            messages.push({
              id: Date.now().toString(),
              text: item,
              sender: 'bot',
              timestamp: new Date()
            });
          } else if (typeof item === 'object' && item !== null && 'text' in item) {
            messages.push({
              id: Date.now().toString(),
              text: String(item.text),
              sender: 'bot',
              timestamp: new Date()
            });
          }
        });
      } else {
        console.warn('Resposta do webhook não está no formato esperado:', responseData);
        messages.push({
          id: Date.now().toString(),
          text: "Resposta do servidor inválida.",
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

import { useState } from 'react';
import { Message } from '@/types/Message';
import { supabase } from '@/integrations/supabase/client';

export const useWebhookMessages = () => {
  const [isTyping, setIsTyping] = useState(false);

  const formatMessage = (text: string | any): string => {
    // Se não for string, tenta converter para string de forma segura
    if (typeof text !== 'string') {
      try {
        if (text === null || text === undefined) {
          return '';
        }
        if (typeof text === 'object') {
          // Tenta extrair mensagem de várias propriedades comuns
          const possibleMessages = [
            text.message,
            text.text,
            text.content,
            text.reply,
            text.response
          ].filter(Boolean);
          
          if (possibleMessages.length > 0) {
            return possibleMessages[0].toString();
          }
          // Se não encontrar nenhuma propriedade conhecida, converte o objeto inteiro
          return JSON.stringify(text, null, 2);
        }
        return String(text);
      } catch (err) {
        console.error('Error formatting message:', err);
        return 'Erro ao processar a mensagem.';
      }
    }
    
    // Processa a string normalmente
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .trim();
  };

  const processResponse = (response: any, currentTimestamp: Date): Message[] => {
    const messages: Message[] = [];
    let delayIndex = 0;

    try {
      // Se a resposta for um objeto com replies
      if (response && Array.isArray(response.replies)) {
        response.replies.forEach((reply: string, index: number) => {
          messages.push({
            id: `${Date.now()}-${index}`,
            text: reply,
            sender: 'bot',
            timestamp: new Date(currentTimestamp.getTime() + (index * 1000))
          });
        });
        return messages;
      }

      // Se a resposta for uma string ou um objeto simples
      if (typeof response === 'string' || typeof response === 'object') {
        const text = formatMessage(response);
        if (text) {
          messages.push({
            id: `${Date.now()}-0`,
            text: text,
            sender: 'bot',
            timestamp: new Date(currentTimestamp.getTime() + (delayIndex * 1000))
          });
        }
        return messages;
      }

      // Se a resposta for um array
      if (Array.isArray(response)) {
        response.forEach((item, index) => {
          const text = formatMessage(item);
          if (text) {
            messages.push({
              id: `${Date.now()}-${index}`,
              text: text,
              sender: 'bot',
              timestamp: new Date(currentTimestamp.getTime() + (index * 1000))
            });
          }
        });
        return messages;
      }

    } catch (err) {
      console.error('Error processing response:', err);
      messages.push({
        id: Date.now().toString(),
        text: 'Erro ao processar a resposta.',
        sender: 'bot',
        timestamp: currentTimestamp
      });
    }

    return messages;
  };

  const sendMessageToWebhook = async (formData: FormData) => {
    setIsTyping(true);
    let messages: Message[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;

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

      const data = {
        message: (formData.get('message') || '').toString(),
        image: imageBase64,
        sessionId: userEmail || 'anonymous'
      };

      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'https://app-n8n.3gbyjx.easypanel.host/webhook/web-pme';
      const response = await fetch(webhookUrl, {
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
      messages = processResponse(responseData, new Date());

    } catch (error) {
      console.error('Error sending message to webhook:', error);
      messages = [{
        id: Date.now().toString(),
        text: "Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.",
        sender: 'bot',
        timestamp: new Date()
      }];
    } finally {
      setTimeout(() => {
        setIsTyping(false);
      }, 500);
    }

    return messages;
  };

  return { isTyping, sendMessageToWebhook };
};

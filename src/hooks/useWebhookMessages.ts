
import { useState } from 'react';
import { Message } from '@/types/Message';
import { supabase } from '@/integrations/supabase/client';
import { useImageAnalysis } from './useImageAnalysis';
import { useFileUpload } from './useFileUpload';
import { useWebhookMessaging } from './useWebhookMessaging';

/**
 * Combined hook for handling chat message functionality
 */
export const useWebhookMessages = () => {
  const [isTyping, setIsTyping] = useState(false);
  const { isAnalyzing, analyzeImage } = useImageAnalysis();
  const { uploadImage } = useFileUpload();
  const { sendWebhookMessage } = useWebhookMessaging();
  
  /**
   * Main function to send messages and handle image uploads/analysis
   */
  const sendMessageToWebhook = async (formData: FormData) => {
    setIsTyping(true);
    const messages: Message[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;

      // Converter a imagem para base64, se existir
      let imageBase64: string | null = null;
      let imageFile = formData.get('image') as File | null;
      let imageUrl: string | null = null;

      if (imageFile) {
        // Se o usuário está analisando uma imagem
        const analyzeImageValue = formData.get('analyzeImage');
        
        if (analyzeImageValue === 'true') {
          const reader = new FileReader();
          imageBase64 = await new Promise<string>((resolve) => {
            if (imageFile) {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(imageFile);
            }
          });
          
          if (!session?.user.id) {
            throw new Error('Usuário precisa estar logado para analisar imagens');
          }
          
          // Upload da imagem para o Supabase Storage
          imageUrl = await uploadImage(session.user.id, imageFile);
            
          if (imageUrl) {
            // Use a função para analisar a imagem com streaming
            const prompt = formData.get('prompt') as string || undefined;
            const model = formData.get('model') as string || undefined;
            const temperatureStr = formData.get('temperature') as string || undefined;
            const temperature = temperatureStr ? parseFloat(temperatureStr) : undefined;
            
            const options = {
              prompt,
              model,
              temperature
            };
            
            const analysisMessages = await analyzeImage(imageUrl, options);
            
            return [...messages, ...analysisMessages];
          }
        }
      }

      // Processar mensagens normais (sem análise de imagem)
      const messageValue = formData.get('message');
      const data = {
        message: messageValue ? String(messageValue) : undefined,
        image: imageBase64,
        sessionId: userEmail || 'anonymous'
      };

      const webhookMessages = await sendWebhookMessage(data);
      return [...messages, ...webhookMessages];
      
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
        setIsTyping(false);
      }, 500);
    }

    return messages;
  };

  return { 
    isTyping: isTyping || isAnalyzing, 
    sendMessageToWebhook, 
    analyzeImage 
  };
};

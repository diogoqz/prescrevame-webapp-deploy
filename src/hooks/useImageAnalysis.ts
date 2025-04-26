
import { useState } from 'react';
import { Message } from '@/types/Message';
import { supabase } from '@/integrations/supabase/client';
import { formatMessage } from '@/utils/messageFormatters';

export interface ImageAnalysisOptions {
  prompt?: string;
  model?: string;
  temperature?: number;
}

/**
 * Hook for handling image analysis functionality
 */
export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Analyzes an image using OpenAI vision model via Supabase Edge Function
   */
  const analyzeImage = async (
    imageUrl: string, 
    options?: ImageAnalysisOptions
  ): Promise<Message[]> => {
    setIsAnalyzing(true);
    const messages: Message[] = [];
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário precisa estar logado para analisar imagens');
      }
      
      // Criar uma mensagem inicial para o streaming
      const messageId = Date.now().toString();
      
      const streamingMessage: Message = {
        id: messageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        streaming: true
      };
      
      messages.push(streamingMessage);

      // Get the function URL from Supabase config
      const functionUrl = `https://soaonapntsktpqoqptyz.supabase.co/functions/v1/analyze-image`;
      
      // Chamar a função Edge diretamente via fetch para obter o streaming
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          imageUrl,
          prompt: options?.prompt || 'Analise esta imagem em detalhes e descreva o que você vê.',
          model: options?.model || 'gpt-4o',
          temperature: options?.temperature !== undefined ? options.temperature : 0.7,
          userId: session.user.id
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao analisar imagem: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Não foi possível ler a resposta');
      }
      
      // Processar o streaming
      let fullText = '';
      
      const processStream = async (): Promise<void> => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = new TextDecoder().decode(value);
          const lines = text.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonString = line.slice(6);
              if (jsonString === '[DONE]') {
                continue;
              }
              
              try {
                const data = JSON.parse(jsonString);
                if (data.content) {
                  fullText += data.content;
                  
                  // Atualize o conteúdo da mensagem em tempo real
                  streamingMessage.text = formatMessage(fullText);
                }
              } catch (e) {
                console.error('Erro ao analisar JSON:', e);
              }
            }
          }
        }
        
        // Quando o streaming terminar, atualize a mensagem final
        streamingMessage.streaming = false;
        streamingMessage.text = formatMessage(fullText);
      };
      
      processStream().finally(() => {
        setIsAnalyzing(false);
      });
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      messages.push({
        id: Date.now().toString(),
        text: error instanceof Error ? error.message : "Ocorreu um erro ao analisar a imagem.",
        sender: 'bot',
        timestamp: new Date()
      });
      setIsAnalyzing(false);
    }
    
    return messages;
  };

  return { 
    isAnalyzing, 
    analyzeImage 
  };
};

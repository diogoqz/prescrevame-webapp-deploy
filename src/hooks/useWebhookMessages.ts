
import { useState } from 'react';
import { Message } from '@/types/Message';
import { supabase } from '@/integrations/supabase/client';

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

  const analyzeImage = async (imageUrl: string, prompt?: string, model?: string, temperature?: number) => {
    setIsTyping(true);
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
      
      // Chamar a função Edge diretamente via fetch para obter o streaming
      const response = await fetch(`${supabase.functions.url}/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          imageUrl,
          prompt: prompt || 'Analise esta imagem em detalhes e descreva o que você vê.',
          model: model || 'gpt-4o',
          temperature: temperature !== undefined ? temperature : 0.7,
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
                  
                  // O componente de lista de mensagens irá observar as mudanças neste objeto
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
        setIsTyping(false);
      });
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      messages.push({
        id: Date.now().toString(),
        text: error instanceof Error ? error.message : "Ocorreu um erro ao analisar a imagem.",
        sender: 'bot',
        timestamp: new Date()
      });
      setIsTyping(false);
    }
    
    return messages;
  };

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
        const analyzeImage = formData.get('analyzeImage');
        
        if (analyzeImage === 'true') {
          const reader = new FileReader();
          imageBase64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile!);
          });
          
          // Upload da imagem para o Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('image_analysis')
            .upload(
              `${session?.user.id}/${Date.now()}-${imageFile.name}`,
              imageFile,
              { upsert: true, contentType: imageFile.type }
            );
            
          if (uploadError) {
            throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
          }
          
          if (uploadData) {
            // Obtenha a URL pública da imagem
            const { data: { publicUrl } } = supabase.storage
              .from('image_analysis')
              .getPublicUrl(uploadData.path);
              
            imageUrl = publicUrl;
            
            // Use a função para analisar a imagem com streaming
            const prompt = formData.get('prompt') as string || undefined;
            const model = formData.get('model') as string || undefined;
            const temperatureStr = formData.get('temperature') as string || undefined;
            const temperature = temperatureStr ? parseFloat(temperatureStr) : undefined;
            
            const analysisMessages = await analyzeImage(imageUrl, prompt, model, temperature);
            
            return [...messages, ...analysisMessages];
          }
        }
      }

      // Processar mensagens normais (sem análise de imagem)
      const data = {
        message: formData.get('message'),
        image: imageBase64,
        sessionId: userEmail || 'anonymous'
      };

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
        setIsTyping(false);
      }, 500);
    }

    return messages;
  };

  return { isTyping, sendMessageToWebhook, analyzeImage };
};

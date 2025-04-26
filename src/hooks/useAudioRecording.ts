
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Inicia a gravação de áudio
  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      
      // Solicita acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao acessar o microfone:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone. Por favor, verifique as permissões.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // Para a gravação e processa o áudio
  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        setIsRecording(false);
        resolve(null);
        return;
      }

      setIsProcessing(true);
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          // Combina todos os chunks de áudio em um único Blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Converte o Blob para base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              // Envia o áudio para a função de borda do Supabase
              const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio: base64Audio },
              });
              
              if (error) throw error;
              
              // Retorna o texto transcrito
              resolve(data.text);
            } catch (error) {
              console.error('Erro ao transcrever áudio:', error);
              toast({
                title: "Erro",
                description: "Não foi possível transcrever o áudio. Tente novamente.",
                variant: "destructive"
              });
              resolve(null);
            } finally {
              setIsProcessing(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Erro ao processar áudio:', error);
          setIsProcessing(false);
          resolve(null);
        }
      };
      
      // Para o MediaRecorder e ativa o evento onstop
      mediaRecorderRef.current.stop();
      
      // Interrompe todas as faixas do stream de áudio
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
    });
  }, [isRecording, toast]);

  // Alterna entre iniciar e parar a gravação
  const toggleRecording = useCallback(async (onTranscriptionComplete: (text: string) => void) => {
    if (isRecording) {
      const transcribedText = await stopRecording();
      if (transcribedText) {
        onTranscriptionComplete(transcribedText);
      }
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    toggleRecording
  };
};

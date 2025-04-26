
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAudioRecording = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1
        } 
      });
      
      // Use webm for better compatibility with OpenAI Whisper API
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstart = () => {
        setIsRecording(true);
        toast({
          title: "Gravando áudio",
          description: "Fale claramente e clique novamente no microfone para parar."
        });
      };
      
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone. Verifique as permissões do navegador.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      setIsProcessing(true);

      mediaRecorderRef.current.onstop = async () => {
        try {
          // Create audio blob with the correct MIME type
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              // Send to our edge function for transcription
              const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio: base64Audio }
              });
              
              if (error) {
                console.error('Error transcribing audio:', error);
                toast({
                  title: "Erro na transcrição",
                  description: "Não foi possível transcrever o áudio. Tente novamente.",
                  variant: "destructive"
                });
                resolve(null);
              } else {
                toast({
                  title: "Áudio transcrito",
                  description: "Sua mensagem foi processada com sucesso."
                });
                resolve(data.text);
              }
            } catch (error) {
              console.error('Error in transcription:', error);
              toast({
                title: "Erro",
                description: "Ocorreu um erro ao processar o áudio.",
                variant: "destructive"
              });
              resolve(null);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing recording:', error);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao processar a gravação.",
            variant: "destructive"
          });
          resolve(null);
        } finally {
          setIsRecording(false);
          setIsProcessing(false);
          
          // Stop all tracks
          if (mediaRecorderRef.current) {
            const stream = mediaRecorderRef.current.stream;
            stream.getTracks().forEach(track => track.stop());
          }
          
          mediaRecorderRef.current = null;
          audioChunksRef.current = [];
        }
      };
      
      mediaRecorderRef.current.stop();
    });
  }, [toast]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      return await stopRecording();
    } else {
      await startRecording();
      return null;
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    toggleRecording
  };
};

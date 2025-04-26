
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
      console.log('Requesting microphone access...');
      audioChunksRef.current = [];
      
      // Solicita acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Microphone access granted');
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Audio chunk received: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      console.log('Recording started');
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao acessar o microfone:', error);
      toast({
        title: "Erro no microfone",
        description: "Não foi possível acessar o microfone. Por favor, verifique as permissões do navegador.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // Para a gravação e processa o áudio
  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        console.log('No active recording to stop');
        setIsRecording(false);
        resolve(null);
        return;
      }

      console.log('Stopping recording...');
      setIsProcessing(true);
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          console.log('Recording stopped, processing audio...');
          // Combina todos os chunks de áudio em um único Blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log(`Total audio size: ${audioBlob.size} bytes`);
          
          if (audioBlob.size === 0) {
            console.error('Audio blob is empty');
            toast({
              title: "Erro",
              description: "Nenhum áudio foi gravado. Por favor, tente novamente.",
              variant: "destructive"
            });
            setIsProcessing(false);
            resolve(null);
            return;
          }
          
          // Converte o Blob para base64
          console.log('Converting audio to base64...');
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              console.log(`Base64 audio length: ${base64Audio.length} chars`);
              
              console.log('Calling Supabase transcribe-audio function...');
              // Envia o áudio para a função de borda do Supabase
              const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio: base64Audio },
              });
              
              if (error) {
                console.error('Supabase function error:', error);
                throw error;
              }
              
              console.log('Transcription received:', data);
              // Retorna o texto transcrito
              resolve(data.text);
            } catch (error) {
              console.error('Erro ao transcrever áudio:', error);
              toast({
                title: "Erro na transcrição",
                description: "Não foi possível transcrever o áudio. Tente novamente.",
                variant: "destructive"
              });
              resolve(null);
            } finally {
              setIsProcessing(false);
            }
          };
          
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            setIsProcessing(false);
            resolve(null);
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Erro ao processar áudio:', error);
          setIsProcessing(false);
          resolve(null);
        }
      };
      
      try {
        // Para o MediaRecorder e ativa o evento onstop
        mediaRecorderRef.current.stop();
        
        // Interrompe todas as faixas do stream de áudio
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error);
        setIsProcessing(false);
        resolve(null);
      }
      
      setIsRecording(false);
    });
  }, [isRecording, toast]);

  // Alterna entre iniciar e parar a gravação
  const toggleRecording = useCallback(async (onTranscriptionComplete: (text: string) => void) => {
    if (isRecording) {
      console.log('Toggle recording: stopping...');
      const transcribedText = await stopRecording();
      console.log('Transcribed text:', transcribedText);
      if (transcribedText) {
        onTranscriptionComplete(transcribedText);
      }
    } else {
      console.log('Toggle recording: starting...');
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    toggleRecording
  };
};


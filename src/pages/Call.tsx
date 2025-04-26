
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Call = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  // Initialize audio context
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const initAudioContext = async () => {
      try {
        const context = new AudioContext();
        setAudioContext(context);
        
        // Add welcome message
        setMessages([{
          text: "Olá! Estou pronto para nossa conversa por voz. Clique no ícone do microfone para começar a falar.",
          isUser: false
        }]);
      } catch (error) {
        console.error('Error initializing audio context:', error);
        toast({
          title: "Erro",
          description: "Não foi possível inicializar o contexto de áudio.",
          variant: "destructive"
        });
      }
    };
    
    initAudioContext();
    
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [user, navigate, toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };
      
      setAudioChunks([]);
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "Gravando",
        description: "Fale agora..."
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Create form data to send to the API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      
      // Get session to extract user email
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || 'anonymous';
      
      // Send to Supabase Function for transcription
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.text) {
        // Add user message to the list
        const userMessage = data.text;
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        
        // Send the transcribed text to the webhook
        await sendTranscriptionToWebhook(userMessage, userEmail);
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o áudio.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTranscriptionToWebhook = async (transcription: string, userEmail: string) => {
    try {
      // Prepare data for webhook
      const data = {
        message: transcription,
        sessionId: userEmail
      };
      
      console.log('Sending data to webhook:', data);
      
      // Set speaking state to provide feedback to the user
      setIsSpeaking(true);
      
      // Send to webhook
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
      
      // Process response similar to useWebhookMessages
      if (Array.isArray(responseData)) {
        for (const item of responseData) {
          if (item && typeof item === 'object' && item.result) {
            try {
              const parsedResult = JSON.parse(item.result);
              
              if (parsedResult.reply) {
                setMessages(prev => [...prev, { text: parsedResult.reply, isUser: false }]);
                await speakText(parsedResult.reply);
              } else if (parsedResult.replies && Array.isArray(parsedResult.replies)) {
                for (const reply of parsedResult.replies) {
                  setMessages(prev => [...prev, { text: reply, isUser: false }]);
                  await speakText(reply);
                }
              }
            } catch (err) {
              console.error('Error parsing result JSON:', err);
              if (typeof item.result === 'string') {
                setMessages(prev => [...prev, { text: item.result, isUser: false }]);
                await speakText(item.result);
              }
            }
          }
        }
      } else if (responseData && typeof responseData === 'object') {
        if (responseData.reply) {
          setMessages(prev => [...prev, { text: responseData.reply, isUser: false }]);
          await speakText(responseData.reply);
        } else if (responseData.replies && Array.isArray(responseData.replies)) {
          for (const reply of responseData.replies) {
            setMessages(prev => [...prev, { text: reply, isUser: false }]);
            await speakText(reply);
          }
        }
      }
    } catch (error) {
      console.error('Error sending transcription to webhook:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const speakText = async (text: string) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'pt-BR';
      window.speechSynthesis.speak(speech);
    }
  };

  const endCall = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    toast({
      title: "Chamada encerrada",
      description: "Voltando para o chat..."
    });
    
    navigate('/');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-whatsapp-bg to-slate-950">
      <div className="flex items-center justify-between px-4 py-3 bg-whatsapp-header">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-whatsapp-accent flex items-center justify-center overflow-hidden">
            <img
              src="/lovable-uploads/f9d8ee9c-efab-4f5c-98b5-b08a1a131d86.png"
              alt="Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h3 className="font-bold text-whatsapp-text">PrescrevaMe Voice</h3>
            <p className="text-xs text-whatsapp-textSecondary">Chamada em andamento</p>
          </div>
        </div>
        <Button 
          onClick={endCall} 
          variant="destructive" 
          size="icon" 
          className="rounded-full"
        >
          <PhoneOff size={20} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.isUser 
                ? 'ml-auto bg-whatsapp-bubbleSent text-right' 
                : 'mr-auto bg-whatsapp-bubbleReceived'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 flex justify-center">
        <div className="flex gap-4">
          {isSpeaking && (
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-prescrevame/20 border border-prescrevame animate-pulse">
              <Volume2 className="text-prescrevame" size={32} />
            </div>
          )}
          
          <Button
            disabled={isProcessing || isSpeaking}
            onClick={isRecording ? stopRecording : startRecording}
            className={`h-16 w-16 rounded-full ${
              isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-prescrevame hover:bg-prescrevame/90'
            }`}
          >
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Call;


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Processa base64 em chunks para evitar problemas de memória
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  console.log(`Processing base64 string of length: ${base64String.length}`);
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  console.log(`Total binary length: ${totalLength} bytes`);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  console.log("Received request to transcribe-audio function");
  
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body...");
    const { audio } = await req.json();
    
    if (!audio) {
      console.error("No audio data provided");
      throw new Error('Nenhum dado de áudio fornecido');
    }
    
    console.log(`Received base64 audio data of length: ${audio.length}`);

    // Processa áudio em chunks
    console.log("Processing audio data...");
    const binaryAudio = processBase64Chunks(audio);
    
    // Verificação do tamanho dos dados binários
    if (binaryAudio.length === 0) {
      console.error("Processed audio data is empty");
      throw new Error('Dados de áudio processados estão vazios');
    }
    
    // Prepara os dados do formulário
    console.log("Preparing form data for OpenAI API...");
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    // Verificação da chave API
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      throw new Error('Chave da API OpenAI não encontrada');
    }

    // Envia para a OpenAI
    console.log("Sending request to OpenAI API...");
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API da OpenAI:', errorText);
      throw new Error(`Erro na API da OpenAI: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription successful:", result);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na transcrição:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


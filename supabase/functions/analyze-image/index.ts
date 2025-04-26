
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt, model, temperature, userId } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Configure o prompt padrão se não for fornecido
    const defaultPrompt = 'Analise esta imagem em detalhes e descreva o que você vê.';
    const finalPrompt = prompt || defaultPrompt;

    console.log('Analyzing image with model:', model);
    
    // Configurando o streaming para retornar a resposta em tempo real
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Iniciando a solicitação para OpenAI em segundo plano
    const openAIRequest = fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: finalPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: temperature !== undefined ? temperature : 0.7,
        stream: true,
      }),
    });

    // Processando a resposta de streaming em segundo plano
    (async () => {
      try {
        const response = await openAIRequest;
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API error:", errorData);
          writer.write(encoder.encode(JSON.stringify({ error: errorData })));
          writer.close();
          return;
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          writer.write(encoder.encode(JSON.stringify({ error: "Failed to get response reader" })));
          writer.close();
          return;
        }
        
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk
            .split('\n')
            .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
          
          for (const line of lines) {
            try {
              const trimmedLine = line.replace(/^data: /, '').trim();
              if (!trimmedLine || trimmedLine === '[DONE]') continue;
              
              const parsedData = JSON.parse(trimmedLine);
              const content = parsedData.choices[0]?.delta?.content || '';
              
              if (content) {
                fullContent += content;
                writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch (e) {
              console.log("Error parsing line:", line, e);
            }
          }
        }

        // Após terminar o streaming, salve a análise no banco de dados
        if (userId) {
          try {
            const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://soaonapntsktpqoqptyz.supabase.co';
            const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            
            if (supabaseKey) {
              const supabase = createClient(supabaseUrl, supabaseKey);
              
              await supabase.from('image_analysis').insert({
                user_id: userId,
                image_url: imageUrl,
                prompt: finalPrompt,
                response: fullContent,
                model: model || "gpt-4o",
                temperature: temperature !== undefined ? temperature : 0.7
              });
              
              console.log('Analysis saved to database');
            }
          } catch (dbError) {
            console.error('Error saving to database:', dbError);
          }
        }
        
        writer.write(encoder.encode('data: [DONE]\n\n'));
        writer.close();
      } catch (e) {
        console.error("Error processing stream:", e);
        writer.write(encoder.encode(JSON.stringify({ error: e.message })));
        writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
    
  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

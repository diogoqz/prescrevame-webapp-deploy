import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Buscar usuários ativos que expiraram
    const now = new Date().toISOString();
    const { data: expiredUsers, error } = await supabaseAdmin
      .from('users')
      .select('id, email, activated_at, expires_at, invite_type, days_valid')
      .eq('status', 'ativo')
      .lt('expires_at', now);

    if (error) {
      console.error('Error fetching expired users:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Bloquear usuários expirados
    if (expiredUsers && expiredUsers.length > 0) {
      const userIds = expiredUsers.map(user => user.id);
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ status: 'bloqueado' })
        .in('id', userIds);

      if (updateError) {
        console.error('Error blocking expired users:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Blocked ${expiredUsers.length} expired users:`, expiredUsers.map(u => u.email));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        blockedCount: expiredUsers?.length || 0,
        message: `Checked for expired users. Blocked: ${expiredUsers?.length || 0}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-expired-users function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 
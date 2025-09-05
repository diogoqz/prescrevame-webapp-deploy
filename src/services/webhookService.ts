import { AppConfig } from '@/config/app.config';

export interface TrialWebhookPayload {
  type: 'trial_created';
  user: {
    id: string;
    email: string;
    nome?: string;
    cpf?: string;
    whatsapp?: string;
    profissao?: string;
  };
  trial: {
    started_at: string;
    expires_at: string;
    days_valid: number;
    invite_type: string;
  };
  source: 'form' | 'google';
}

class WebhookService {
  async sendTrialCreated(payload: TrialWebhookPayload): Promise<void> {
    const url = AppConfig.webhooks.trial;
    if (!url) return; // silencioso se não configurado

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (_err) {
      // silencie erros de webhook para não quebrar UX
    }
  }
}

export const webhookService = new WebhookService();



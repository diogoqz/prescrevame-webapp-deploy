import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, Phone, RefreshCw } from 'lucide-react';

const Expired = () => {
  const handleSupport = () => {
    window.open('https://api.whatsapp.com/send?phone=556392437559&text=SUPORTE%20-%20Assinatura%20Expirada', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:suporte@prescrevame.com?subject=Renovação%20de%20Assinatura', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Assinatura Expirada
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sua assinatura expirou. Renove para continuar usando nossos serviços.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>Entre em contato conosco para renovar sua assinatura:</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleSupport}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Phone className="mr-2 h-4 w-4" />
              Renovar via WhatsApp
            </Button>
            
            <Button 
              onClick={handleEmail}
              variant="outline"
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Solicitar Renovação
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Horário de atendimento: Segunda a Sexta, 8h às 18h</p>
            <p className="mt-1">Renovação rápida e segura</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expired; 